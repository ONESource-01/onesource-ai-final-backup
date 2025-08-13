"""
Unit Tests for Schema Guard Middleware
Tests validation, auto-repair, and metrics collection
"""

import pytest
import json
from middleware.schema_guard import SchemaGuard, validate_chat_response, get_schema_metrics
from core.schemas import CHAT_V2
from jsonschema import ValidationError


@pytest.fixture
def schema_guard():
    """Fresh schema guard instance for each test"""
    guard = SchemaGuard()
    guard.reset_metrics()
    return guard


@pytest.fixture
def valid_v2_response():
    """Valid v2 schema response for testing"""
    return {
        "title": "## 🔧 **Technical Answer**",
        "summary": "Information about construction requirements",
        "blocks": [
            {"type": "markdown", "content": "This is the main content"}
        ],
        "meta": {
            "emoji": "🔧",
            "schema": "v2",
            "mapped": True
        }
    }


@pytest.fixture
def legacy_response():
    """Legacy response format that needs conversion"""
    return {
        "text": "## 🔧 **Technical Answer**\n\nThis is legacy format content about construction.",
        "emoji_map": [{"name": "technical", "char": "🔧"}],
        "mentoring_insight": "This is a mentoring insight",
        "meta": {
            "tier": "starter",
            "session_id": "test-123",
            "tokens_used": 500
        }
    }


@pytest.fixture
def malformed_response():
    """Malformed response missing required fields"""
    return {
        "text": "Some content but missing required v2 fields"
    }


def test_schema_guard_valid(schema_guard, valid_v2_response):
    """Test that valid v2 responses pass without modification"""
    result, was_repaired = schema_guard.ensure_v2_schema(valid_v2_response)
    
    assert was_repaired is False
    assert result == valid_v2_response
    
    metrics = schema_guard.get_metrics()
    assert metrics["responses_validated_total"] == 1
    assert metrics["schema_validation_failures"] == 0
    assert metrics["schema_repairs_total"] == 0


def test_schema_guard_repairs_legacy(schema_guard, legacy_response):
    """Test that legacy responses are converted to v2 format"""
    result, was_repaired = schema_guard.ensure_v2_schema(legacy_response)
    
    assert was_repaired is True
    assert result["meta"]["schema"] == "v2"
    assert "title" in result
    assert "summary" in result
    assert "blocks" in result
    assert isinstance(result["blocks"], list)
    assert len(result["blocks"]) >= 1
    
    # Check that original meta fields are preserved
    assert result["meta"]["tier"] == "starter"
    assert result["meta"]["session_id"] == "test-123"
    assert result["meta"]["tokens_used"] == 500
    
    metrics = schema_guard.get_metrics()
    assert metrics["schema_repairs_total"] == 1
    assert metrics["repair_rate_percent"] > 0


def test_schema_guard_repairs_malformed(schema_guard, malformed_response):
    """Test that malformed responses are repaired"""
    result, was_repaired = schema_guard.ensure_v2_schema(malformed_response)
    
    assert was_repaired is True
    assert result["title"] == "## 🛠 **Technical Answer**"
    assert result["summary"] != ""
    assert len(result["blocks"]) >= 1
    assert result["meta"]["schema"] == "v2"
    assert result["meta"]["mapped"] is True
    
    metrics = schema_guard.get_metrics()
    assert metrics["schema_repairs_total"] == 1
    # Since the test case has "text" field, it goes through legacy conversion
    # rather than missing_title repair


def test_public_interface(valid_v2_response):
    """Test the public validate_chat_response interface"""
    result, was_repaired = validate_chat_response(valid_v2_response)
    
    assert was_repaired is False
    assert result == valid_v2_response


def test_metrics_tracking():
    """Test that metrics are properly tracked"""
    # Reset metrics
    guard = SchemaGuard()
    guard.reset_metrics()
    
    valid_response = {
        "title": "## 🔧 **Technical Answer**",
        "summary": "Test summary",
        "blocks": [{"type": "markdown", "content": "Test content"}],
        "meta": {"emoji": "🔧", "schema": "v2", "mapped": True}
    }
    
    # Process some valid responses
    for i in range(3):
        guard.ensure_v2_schema(valid_response)
    
    # Process some invalid responses
    invalid_response = {"text": "Invalid format"}
    for i in range(2):
        guard.ensure_v2_schema(invalid_response)
    
    metrics = guard.get_metrics()
    assert metrics["responses_validated_total"] == 5
    assert metrics["schema_repairs_total"] == 2
    assert metrics["repair_rate_percent"] == 40.0  # 2/5 * 100


def test_repair_rate_threshold():
    """Test that repair rate threshold alerts work"""
    guard = SchemaGuard()
    guard.reset_metrics()
    
    # Generate responses with low repair rate (acceptable)
    valid_response = {
        "title": "## 🔧 **Technical Answer**",
        "summary": "Test summary",
        "blocks": [{"type": "markdown", "content": "Test"}],
        "meta": {"emoji": "🔧", "schema": "v2", "mapped": True}
    }
    
    # 1000 valid responses
    for i in range(1000):
        guard.ensure_v2_schema(valid_response)
    
    # 2 invalid responses (0.2% repair rate - acceptable)
    invalid_response = {"text": "Invalid"}
    guard.ensure_v2_schema(invalid_response)
    guard.ensure_v2_schema(invalid_response)
    
    metrics = guard.get_metrics()
    assert metrics["repair_rate_percent"] < 0.5
    assert metrics["is_repair_rate_acceptable"] is True
    
    # Now add more repairs to exceed threshold
    for i in range(10):  # Now 12 repairs out of 1012 = 1.18%
        guard.ensure_v2_schema(invalid_response)
    
    metrics = guard.get_metrics()
    assert metrics["repair_rate_percent"] > 0.5
    assert metrics["is_repair_rate_acceptable"] is False


def test_title_extraction():
    """Test title extraction from various formats"""
    guard = SchemaGuard()
    
    test_cases = [
        ("## 🔧 **Technical Answer**\n\nContent here", "## 🔧 **Technical Answer**"),
        ("# Main Title\n\nContent", "# Main Title"),
        ("Some content without title", "## 🛠 **Technical Answer**"),
        ("", "## 🛠 **Technical Answer**")
    ]
    
    for text, expected_title in test_cases:
        result = guard._extract_title(text)
        assert result == expected_title


def test_summary_extraction():
    """Test summary extraction from response data"""
    guard = SchemaGuard()
    
    # Test with mentoring_insight
    resp_with_insight = {
        "text": "Long content here",
        "mentoring_insight": "This is the mentoring insight that should be used as summary"
    }
    summary = guard._extract_summary(resp_with_insight)
    assert "mentoring insight" in summary.lower()
    
    # Test with only text
    resp_with_text = {
        "text": "This is the first sentence. This is the second sentence."
    }
    summary = guard._extract_summary(resp_with_text)
    assert "first sentence" in summary.lower()
    
    # Test with empty data
    resp_empty = {}
    summary = guard._extract_summary(resp_empty)
    assert "Professional construction guidance" in summary


if __name__ == "__main__":
    # Manual test runner for development
    print("🧪 Running Schema Guard Tests")
    
    try:
        # Test basic functionality
        guard = SchemaGuard()
        
        # Test valid response
        valid = {
            "title": "## 🔧 **Technical Answer**",
            "summary": "Test summary",
            "blocks": [{"type": "markdown", "content": "Test content"}],
            "meta": {"emoji": "🔧", "schema": "v2", "mapped": True}
        }
        result, repaired = guard.ensure_v2_schema(valid)
        assert not repaired
        print("✅ Valid response test passed")
        
        # Test repair
        invalid = {"text": "Legacy format content"}
        result, repaired = guard.ensure_v2_schema(invalid)
        assert repaired
        assert result["meta"]["schema"] == "v2"
        print("✅ Repair test passed")
        
        # Test metrics
        metrics = guard.get_metrics()
        print(f"✅ Metrics: {metrics}")
        
        print("🎉 All manual tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        raise