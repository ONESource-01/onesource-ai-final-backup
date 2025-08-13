"""
Persistence Backbone Tests
Tests for Redis conversation store implementation
"""

import pytest
import os
import redis
from core.stores.conversation_store import RedisConversationStore, init_conversation_store


@pytest.fixture
def redis_client():
    """Direct Redis client for testing"""
    redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379")
    client = redis.Redis.from_url(redis_url, decode_responses=True)
    
    # Clean up test keys before test
    for key in client.scan_iter("conv:test-*"):
        client.delete(key)
    
    yield client
    
    # Clean up test keys after test
    for key in client.scan_iter("conv:test-*"):
        client.delete(key)


@pytest.fixture
def store(redis_client):
    """ConversationStore instance for testing"""
    redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379")
    return RedisConversationStore(redis_url)


def test_persistence_roundtrip(store):
    """Test basic get/set roundtrip functionality"""
    sid = "test-rt-1"
    history = [
        {"role": "user", "content": "Hi"}, 
        {"role": "assistant", "content": "Hello"}
    ]
    
    # Set and get back
    store.set(sid, history)
    retrieved = store.get(sid)
    
    assert retrieved == history
    print(f"✅ Roundtrip test passed for session {sid}")


def test_ttl_set(store, redis_client):
    """Test TTL is properly set for conversation keys"""
    sid = "test-ttl-1"
    history = [{"role": "user", "content": "x"}]
    
    # Set with default TTL (30 days = 2592000 seconds)
    store.set(sid, history)
    
    # Check TTL was set correctly
    ttl = redis_client.ttl(f"conv:{sid}")
    assert 0 < ttl <= 2592000  # Should be set and less than or equal to 30 days
    print(f"✅ TTL test passed: {ttl} seconds remaining")


def test_trim_on_set():
    """Test conversation history trimming when exceeding max turns"""
    # This test simulates the unified chat client behavior
    # We'll create a large history and verify it gets trimmed
    
    store = RedisConversationStore()
    sid = "test-trim-1"
    
    # Create > 20 alternating turns (more than max_history_turns = 16)
    large_history = []
    for i in range(25):  # 25 turns total
        if i % 2 == 0:
            large_history.append({"role": "user", "content": f"User turn {i}"})
        else:
            large_history.append({"role": "assistant", "content": f"Assistant turn {i}"})
    
    # Set the large history
    store.set(sid, large_history)
    
    # Get it back and verify it was trimmed
    retrieved = store.get(sid)
    
    # Should be trimmed to <= 16 turns
    assert 0 < len(retrieved) <= 16
    print(f"✅ Trim test passed: {len(large_history)} turns trimmed to {len(retrieved)} turns")
    
    # Verify we kept the most recent turns
    # The last turn in retrieved should match the last turn in original
    assert retrieved[-1] == large_history[-1]
    print(f"✅ Most recent turn preserved correctly")


def test_empty_session_returns_empty_list(store):
    """Test that non-existent sessions return empty list"""
    sid = "test-nonexistent"
    result = store.get(sid)
    
    assert result == []
    print(f"✅ Empty session test passed")


def test_health_check(store):
    """Test Redis health check functionality"""
    is_healthy = store.health_check()
    assert is_healthy is True
    print(f"✅ Health check passed")


def test_custom_ttl(store, redis_client):
    """Test setting custom TTL values"""
    sid = "test-custom-ttl"
    history = [{"role": "user", "content": "custom ttl test"}]
    custom_ttl = 3600  # 1 hour
    
    store.set(sid, history, ttl_seconds=custom_ttl)
    
    ttl = redis_client.ttl(f"conv:{sid}")
    assert 0 < ttl <= custom_ttl
    print(f"✅ Custom TTL test passed: {ttl} seconds remaining (expected ~{custom_ttl})")


if __name__ == "__main__":
    # Manual test runner for development
    print("🧪 Running Redis Conversation Store Tests")
    
    try:
        # Initialize store
        store = init_conversation_store()
        redis_client = redis.Redis.from_url(os.environ.get("REDIS_URL", "redis://localhost:6379"), decode_responses=True)
        
        # Run tests manually
        test_persistence_roundtrip(store)
        test_ttl_set(store, redis_client)
        test_trim_on_set()
        test_empty_session_returns_empty_list(store)
        test_health_check(store)
        test_custom_ttl(store, redis_client)
        
        print("🎉 All tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        raise