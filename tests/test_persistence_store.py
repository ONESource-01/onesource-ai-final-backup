"""
Persistence store robustness tests
Tests Redis TTL, trimming, and failure mode behavior
"""

import pytest
import redis
import time
from unittest.mock import patch
from tests.utils import sid, TestClient, get_base_url
from core.stores.conversation_store import get_conversation_store, init_conversation_store


@pytest.fixture
def redis_client():
    """Direct Redis client for testing"""
    redis_url = "redis://localhost:6379"
    client = redis.Redis.from_url(redis_url, decode_responses=True)
    
    # Clean up test keys before test
    for key in client.scan_iter("conv:test-*"):
        client.delete(key)
    
    yield client
    
    # Clean up test keys after test
    for key in client.scan_iter("conv:test-*"):
        client.delete(key)


@pytest.fixture
def store():
    """Conversation store fixture"""
    return get_conversation_store()


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient()


def test_ttl_is_set(redis_client, store):
    """Test that TTL is properly set on conversation keys"""
    s = sid("ttl")
    test_history = [{"role": "user", "content": "test message"}]
    
    # Set conversation in store
    store.set(s, test_history)
    
    # Check TTL was set correctly in Redis
    key = f"conv:{s}"
    ttl = redis_client.ttl(key)
    
    # TTL should be set and less than or equal to 30 days (2592000 seconds)
    assert 0 < ttl <= 2592000, f"Expected TTL between 0 and 2592000, got {ttl}"
    
    print(f"✅ TTL test passed: {ttl} seconds remaining")


def test_custom_ttl_setting(redis_client, store):
    """Test setting custom TTL values"""
    s = sid("custom-ttl")
    test_history = [{"role": "user", "content": "custom ttl test"}]
    custom_ttl = 3600  # 1 hour
    
    # Set with custom TTL
    store.set(s, test_history, ttl_seconds=custom_ttl)
    
    # Verify custom TTL was applied
    key = f"conv:{s}"
    ttl = redis_client.ttl(key)
    
    assert 0 < ttl <= custom_ttl, f"Expected TTL <= {custom_ttl}, got {ttl}"
    
    print(f"✅ Custom TTL test passed: {ttl} seconds for {custom_ttl} requested")


def test_conversation_expiry_behavior(redis_client, store):
    """Test conversation expiry behavior (simulated)"""
    s = sid("expiry")
    test_history = [{"role": "user", "content": "expiry test"}]
    
    # Set with very short TTL for testing
    store.set(s, test_history, ttl_seconds=1)
    
    # Verify it exists initially
    retrieved = store.get(s)
    assert len(retrieved) == 1
    
    # Wait for expiry
    time.sleep(2)
    
    # Should be expired and return empty list
    expired_result = store.get(s)
    assert expired_result == [], f"Expected empty list after expiry, got {expired_result}"
    
    print("✅ Conversation expiry test passed")


def test_graceful_on_set_failure(client):
    """Test graceful handling when Redis set operation fails"""
    s = sid("fail")
    
    # Mock the store's set method to raise an exception
    original_store = get_conversation_store()
    
    with patch.object(original_store, 'set', side_effect=RuntimeError("Redis connection failed")):
        # Should still return v2 schema response even if persist failed
        r = client.ask_regular("Hello", s)
        
        # Response should still be valid v2 schema
        assert r["meta"]["schema"] == "v2", "Should return v2 schema even on persist failure"
        assert "title" in r, "Should have title even on persist failure"
        assert "blocks" in r, "Should have blocks even on persist failure"
    
    print("✅ Set failure graceful handling test passed")


def test_graceful_on_get_failure(client):
    """Test graceful handling when Redis get operation fails"""
    s = sid("get-fail")
    
    # First, create a conversation successfully
    r1 = client.ask_regular("Initial message", s)
    assert r1["meta"]["schema"] == "v2"
    
    # Mock the store's get method to raise an exception
    original_store = get_conversation_store()
    
    with patch.object(original_store, 'get', side_effect=RuntimeError("Redis connection failed")):
        # Should still work, just without context
        r2 = client.ask_regular("Follow up message", s)
        
        # Should still return valid v2 response
        assert r2["meta"]["schema"] == "v2", "Should return v2 schema even on get failure"
        assert "blocks" in r2, "Should have blocks even on get failure"
    
    print("✅ Get failure graceful handling test passed")


def test_redis_connection_recovery(redis_client, store):
    """Test behavior during Redis connection issues"""
    s = sid("recovery")
    test_history = [{"role": "user", "content": "recovery test"}]
    
    # Normal operation should work
    store.set(s, test_history)
    retrieved = store.get(s)
    assert len(retrieved) == 1
    
    # Simulate connection issue by using invalid Redis instance
    original_redis = store.r
    
    try:
        # Replace with mock that fails
        with patch.object(store, 'r', redis.Redis(host='nonexistent', port=9999, socket_connect_timeout=1)):
            # Get should return empty list on connection failure
            failed_get = store.get(s)
            assert failed_get == [], "Should return empty list on connection failure"
            
            # Set should raise exception on connection failure
            with pytest.raises(Exception):
                store.set(s, test_history)
        
        # Restore original connection
        store.r = original_redis
        
        # Should work again after restoration
        restored_get = store.get(s)
        assert len(restored_get) == 1, "Should work after connection restoration"
        
    finally:
        # Ensure Redis connection is restored
        store.r = original_redis
    
    print("✅ Redis connection recovery test passed")


def test_concurrent_access_safety(redis_client, store):
    """Test concurrent access to same session (basic safety)"""
    s = sid("concurrent")
    
    # Simulate concurrent writes (sequential for testing)
    history1 = [{"role": "user", "content": "message 1"}]
    history2 = [{"role": "user", "content": "message 1"}, {"role": "assistant", "content": "response 1"}]
    
    # Both writes should succeed
    store.set(s, history1)
    store.set(s, history2)
    
    # Final state should be the last write
    final = store.get(s)
    assert len(final) == 2, f"Expected 2 messages, got {len(final)}"
    assert final[1]["role"] == "assistant", "Should have assistant response"
    
    print("✅ Concurrent access safety test passed")


def test_data_integrity_after_failure(client, redis_client):
    """Test data integrity after Redis failures"""
    s = sid("integrity")
    
    # Create successful conversation
    r1 = client.ask_regular("Test data integrity", s)
    assert r1["meta"]["schema"] == "v2"
    
    # Verify data was stored
    key = f"conv:{s}"
    stored_data = redis_client.get(key)
    assert stored_data is not None, "Data should be stored in Redis"
    
    # Verify it's valid JSON
    import json
    parsed = json.loads(stored_data)
    assert isinstance(parsed, list), "Stored data should be a list"
    assert len(parsed) >= 1, "Should have at least one message"
    
    print("✅ Data integrity test passed")


def test_health_check_functionality(store):
    """Test Redis health check functionality"""
    # Health check should pass with working Redis
    is_healthy = store.health_check()
    assert is_healthy is True, "Health check should pass with working Redis"
    
    # Test with mocked failure
    with patch.object(store.r, 'ping', side_effect=redis.ConnectionError("Connection failed")):
        is_unhealthy = store.health_check()
        assert is_unhealthy is False, "Health check should fail with connection error"
    
    print("✅ Health check functionality test passed")


if __name__ == "__main__":
    # Manual test runner for development
    print("🧪 Running Persistence Store Robustness Tests")
    
    # Initialize fixtures
    client = TestClient()
    store = get_conversation_store()
    redis_client = redis.Redis.from_url("redis://localhost:6379", decode_responses=True)
    
    try:
        test_ttl_is_set(redis_client, store)
        test_custom_ttl_setting(redis_client, store)
        test_conversation_expiry_behavior(redis_client, store)
        test_graceful_on_set_failure(client)
        test_graceful_on_get_failure(client)
        test_redis_connection_recovery(redis_client, store)
        test_concurrent_access_safety(redis_client, store)
        test_data_integrity_after_failure(client, redis_client)
        test_health_check_functionality(store)
        
        print("🎉 All persistence robustness tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        raise