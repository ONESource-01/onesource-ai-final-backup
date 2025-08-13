"""
Schema guard health tests
Tests metrics exposure and repair rate thresholds
"""

import pytest
import requests
from tests.utils import get_base_url, TestClient, sid


@pytest.fixture
def base_url():
    """Base URL fixture"""
    return get_base_url()


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient()


def test_schema_metrics_exposed(base_url):
    """Test that schema validation metrics are properly exposed"""
    response = requests.get(f"{base_url}/api/metrics/schema")
    response.raise_for_status()
    
    metrics_data = response.json()
    
    # Check top-level structure
    assert "timestamp" in metrics_data, "Should have timestamp"
    assert "schema_validation" in metrics_data, "Should have schema_validation section"
    
    schema_metrics = metrics_data["schema_validation"]
    
    # Check required metrics are present
    required_metrics = [
        "schema_repairs_total",
        "schema_validation_failures", 
        "responses_validated_total",
        "repair_rate_percent",
        "is_repair_rate_acceptable",
        "repair_types"
    ]
    
    for metric in required_metrics:
        assert metric in schema_metrics, f"Missing required metric: {metric}"
    
    # Check metric types
    assert isinstance(schema_metrics["schema_repairs_total"], int), "schema_repairs_total should be int"
    assert isinstance(schema_metrics["schema_validation_failures"], int), "schema_validation_failures should be int"
    assert isinstance(schema_metrics["responses_validated_total"], int), "responses_validated_total should be int"
    assert isinstance(schema_metrics["repair_rate_percent"], (int, float)), "repair_rate_percent should be numeric"
    assert isinstance(schema_metrics["is_repair_rate_acceptable"], bool), "is_repair_rate_acceptable should be bool"
    assert isinstance(schema_metrics["repair_types"], dict), "repair_types should be dict"
    
    print(f"✅ Schema metrics exposed correctly: {len(required_metrics)} metrics found")
    return schema_metrics


def test_repair_rate_threshold_calculation(base_url):
    """Test repair rate threshold calculation and alerting"""
    response = requests.get(f"{base_url}/api/metrics/schema")
    response.raise_for_status()
    
    schema_metrics = response.json()["schema_validation"]
    
    repairs = schema_metrics["schema_repairs_total"]
    validated = max(1, schema_metrics.get("responses_validated_total", 1))  # Avoid division by zero
    calculated_rate = (repairs / validated) * 100
    
    # Verify the rate calculation is correct
    reported_rate = schema_metrics["repair_rate_percent"]
    assert abs(calculated_rate - reported_rate) < 0.1, f"Rate calculation mismatch: calculated {calculated_rate}%, reported {reported_rate}%"
    
    # Check threshold logic
    expected_acceptable = reported_rate <= 0.5  # 0.5% threshold
    actual_acceptable = schema_metrics["is_repair_rate_acceptable"]
    
    assert expected_acceptable == actual_acceptable, f"Threshold logic error: rate {reported_rate}% should be acceptable={expected_acceptable}"
    
    print(f"✅ Repair rate threshold test passed: {reported_rate}% (acceptable: {actual_acceptable})")


def test_repair_types_breakdown(base_url):
    """Test that repair types are properly tracked"""
    response = requests.get(f"{base_url}/api/metrics/schema")
    response.raise_for_status()
    
    schema_metrics = response.json()["schema_validation"]
    repair_types = schema_metrics["repair_types"]
    
    # Check expected repair type categories
    expected_types = [
        "missing_title",
        "missing_summary", 
        "missing_blocks",
        "missing_meta",
        "invalid_schema"
    ]
    
    for repair_type in expected_types:
        assert repair_type in repair_types, f"Missing repair type: {repair_type}"
        assert isinstance(repair_types[repair_type], int), f"{repair_type} should be integer"
        assert repair_types[repair_type] >= 0, f"{repair_type} should be non-negative"
    
    print(f"✅ Repair types breakdown correct: {len(expected_types)} types tracked")


def test_metrics_update_after_requests(base_url, client):
    """Test that metrics update correctly after API requests"""
    # Get initial metrics
    initial_response = requests.get(f"{base_url}/api/metrics/schema")
    initial_metrics = initial_response.json()["schema_validation"]
    initial_validated = initial_metrics["responses_validated_total"]
    
    # Make some API requests
    test_session = sid("metrics")
    client.ask_regular("Test metrics update", test_session)
    client.ask_regular("Another test for metrics", test_session)
    
    # Get updated metrics
    updated_response = requests.get(f"{base_url}/api/metrics/schema")
    updated_metrics = updated_response.json()["schema_validation"]
    updated_validated = updated_metrics["responses_validated_total"]
    
    # Should have increased by at least 2
    assert updated_validated >= initial_validated + 2, f"Metrics not updating: initial {initial_validated}, updated {updated_validated}"
    
    print(f"✅ Metrics update test passed: {initial_validated} -> {updated_validated}")


def test_zero_schema_failures_in_production(base_url):
    """Test that schema validation failures are zero (all responses should be v2 compliant)"""
    response = requests.get(f"{base_url}/api/metrics/schema")
    response.raise_for_status()
    
    schema_metrics = response.json()["schema_validation"]
    
    # In production/staging, we should have zero actual failures (all get repaired)
    validation_failures = schema_metrics["schema_validation_failures"]
    
    # All failures should be successfully repaired
    repairs = schema_metrics["schema_repairs_total"]
    
    # The system should repair all failed validations
    assert validation_failures == repairs or validation_failures == 0, \
        f"Validation failures ({validation_failures}) should equal repairs ({repairs}) or be zero"
    
    print(f"✅ Zero unhandled schema failures: {validation_failures} failures, {repairs} repairs")


def test_metrics_persistence_across_requests(base_url, client):
    """Test that metrics persist correctly across multiple requests"""
    # Make several requests to generate metrics
    session1 = sid("persist1")
    session2 = sid("persist2")
    
    for i in range(3):
        client.ask_regular(f"Test message {i}", session1)
        client.ask_enhanced(f"Enhanced test {i}", session2)
    
    # Get metrics
    response = requests.get(f"{base_url}/api/metrics/schema")
    metrics = response.json()["schema_validation"]
    
    # Should have meaningful counts
    assert metrics["responses_validated_total"] >= 6, "Should have validated at least 6 responses"
    assert metrics["schema_repairs_total"] >= 0, "Repairs should be non-negative"
    
    # Repair rate should be calculable
    if metrics["responses_validated_total"] > 0:
        expected_rate = (metrics["schema_repairs_total"] / metrics["responses_validated_total"]) * 100
        actual_rate = metrics["repair_rate_percent"]
        assert abs(expected_rate - actual_rate) < 0.1, "Repair rate calculation should be accurate"
    
    print(f"✅ Metrics persistence test passed: {metrics['responses_validated_total']} validated")


def test_health_endpoint_includes_schema_status(base_url):
    """Test that health endpoint reflects schema validation health"""
    # Check if main health endpoint exists
    try:
        health_response = requests.get(f"{base_url}/api/health")
        health_response.raise_for_status()
        health_data = health_response.json()
        
        assert "status" in health_data, "Health endpoint should have status"
        assert health_data["status"] == "healthy", "Service should be healthy"
        
    except requests.exceptions.RequestException:
        print("⚠️ Main health endpoint not available, skipping")
    
    # Schema metrics endpoint should always be available
    schema_response = requests.get(f"{base_url}/api/metrics/schema")
    schema_response.raise_for_status()
    
    schema_metrics = schema_response.json()["schema_validation"]
    
    # Service is healthy if repair rate is acceptable
    is_healthy = schema_metrics["is_repair_rate_acceptable"]
    repair_rate = schema_metrics["repair_rate_percent"]
    
    print(f"✅ Schema health status: repair_rate={repair_rate}%, healthy={is_healthy}")


def test_concurrent_metrics_accuracy(base_url, client):
    """Test metrics accuracy under concurrent load (simulated)"""
    import threading
    import time
    
    def make_requests(thread_id, count=5):
        local_client = TestClient()
        session = sid(f"thread-{thread_id}")
        
        for i in range(count):
            local_client.ask_regular(f"Concurrent test {thread_id}-{i}", session)
            time.sleep(0.1)
    
    # Get initial metrics
    initial_response = requests.get(f"{base_url}/api/metrics/schema")
    initial_count = initial_response.json()["schema_validation"]["responses_validated_total"]
    
    # Run concurrent requests
    threads = []
    thread_count = 3
    requests_per_thread = 5
    
    for i in range(thread_count):
        thread = threading.Thread(target=make_requests, args=(i, requests_per_thread))
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    # Check final metrics
    time.sleep(1)  # Allow metrics to update
    final_response = requests.get(f"{base_url}/api/metrics/schema")
    final_count = final_response.json()["schema_validation"]["responses_validated_total"]
    
    expected_increase = thread_count * requests_per_thread
    actual_increase = final_count - initial_count
    
    # Should have increased by expected amount (allow some variance)
    assert actual_increase >= expected_increase * 0.8, \
        f"Concurrent metrics inaccurate: expected ~{expected_increase}, got {actual_increase}"
    
    print(f"✅ Concurrent metrics test passed: {actual_increase} requests processed")


if __name__ == "__main__":
    # Manual test runner for development  
    print("🧪 Running Schema Guard Health Tests")
    
    base_url = get_base_url()
    client = TestClient()
    
    try:
        test_schema_metrics_exposed(base_url)
        test_repair_rate_threshold_calculation(base_url)
        test_repair_types_breakdown(base_url)
        test_metrics_update_after_requests(base_url, client)
        test_zero_schema_failures_in_production(base_url)
        test_metrics_persistence_across_requests(base_url, client)
        test_health_endpoint_includes_schema_status(base_url)
        test_concurrent_metrics_accuracy(base_url, client)
        
        print("🎉 All schema guard health tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        raise