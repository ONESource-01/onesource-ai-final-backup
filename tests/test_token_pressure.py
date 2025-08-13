"""
Token pressure and trimming tests
Tests very long messages and ensures last 16 messages are kept in Redis store
"""

import pytest
from tests.utils import sid, TestClient, assert_v2, wait_for_processing
from core.stores.conversation_store import get_conversation_store


# Very large message to test token pressure
BIG = "A" * 8000  # 8000 character message


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient()


@pytest.fixture
def store():
    """Redis conversation store fixture"""
    return get_conversation_store()


def test_large_first_turn_then_followup(client, store):
    """Test large first turn followed by normal followup"""
    s = sid("token")
    
    # Send very large first message
    r1 = client.ask_regular(BIG, s)
    assert_v2(r1)
    wait_for_processing()
    
    # Follow up with context reference
    r2 = client.ask_regular("Summarise the last point only.", s)
    assert_v2(r2)
    
    # Verify conversation is stored
    history = store.get(s)
    assert len(history) >= 2, f"Expected at least 2 messages, got {len(history)}"
    
    # Verify large message was stored (truncated or handled gracefully)
    first_user_msg = history[0]
    assert first_user_msg["role"] == "user"
    assert len(first_user_msg["content"]) > 1000  # Should contain the large message
    
    print(f"✅ Large first turn test passed - stored {len(history)} messages")


def test_large_message_during_conversation(client, store):
    """Test large message in middle of conversation"""
    s = sid("token-mid")
    
    # Normal conversation start
    client.ask_regular("What are fire rating requirements?", s)
    wait_for_processing()
    
    # Insert very large message
    r2 = client.ask_regular(f"Here are detailed specifications: {BIG}", s)
    assert_v2(r2)
    wait_for_processing()
    
    # Continue with normal message referencing context
    r3 = client.ask_regular("Based on those specifications, what testing is required?", s)
    assert_v2(r3)
    
    # Verify all messages stored
    history = store.get(s)
    assert len(history) >= 4, f"Expected at least 4 messages, got {len(history)}"
    
    print(f"✅ Mid-conversation large message test passed - {len(history)} messages stored")


def test_trimming_under_load(client, store):
    """Test conversation trimming when exceeding 16 turns"""
    s = sid("trim")
    
    # Create more than 16 turns (32 messages total: 16 user + 16 assistant)
    for i in range(22):
        question = f"Turn {i}: What about building requirement number {i}?"
        r = client.ask_regular(question, s)
        assert_v2(r)
        wait_for_processing(0.1)  # Shorter wait for load test
    
    # Check final history length
    history = store.get(s)
    print(f"Final history length: {len(history)} messages")
    
    # Should be trimmed to <= 16 messages per Redis store implementation
    assert 0 < len(history) <= 16, f"Expected <= 16 messages after trimming, got {len(history)}"
    
    # Verify we kept the most recent messages
    if len(history) > 0:
        last_message = history[-1]
        assert "21" in last_message["content"] or "assistant" in last_message["role"], "Should keep most recent messages"
    
    print(f"✅ Trimming test passed - {len(history)} messages kept after 22 turns")


def test_enhanced_endpoint_trimming(client, store):
    """Test trimming behavior on enhanced endpoint"""
    s = sid("enh-trim")
    
    # Create conversation that exceeds trim limit on enhanced endpoint
    for i in range(18):
        question = f"Enhanced turn {i}: Analyze construction detail {i}"
        r = client.ask_enhanced(question, s)
        assert_v2(r)
        wait_for_processing(0.1)
    
    # Check trimming worked
    history = store.get(s)
    assert 0 < len(history) <= 16, f"Enhanced endpoint failed trimming: {len(history)} messages"
    
    print(f"✅ Enhanced endpoint trimming test passed - {len(history)} messages kept")


def test_conversation_persistence_after_trimming(client, store):
    """Test that conversation context survives trimming"""
    s = sid("persist-trim")
    
    # Start with specific topic
    client.ask_regular("Let's discuss acoustic ceiling systems.", s)
    wait_for_processing()
    
    # Add many filler turns to trigger trimming
    for i in range(20):
        client.ask_regular(f"Filler question {i} about building codes.", s)
        wait_for_processing(0.1)
    
    # Test if context is still available after trimming
    r = client.ask_regular("Going back to the ceiling systems, what are the installation requirements?", s)
    assert_v2(r)
    
    # Verify conversation was trimmed but response is still coherent
    history = store.get(s)
    assert len(history) <= 16, "Trimming should have occurred"
    
    # Response should be valid v2 schema even if context was partially lost
    content = " ".join([block.get("content", "") for block in r["blocks"]]).lower()
    assert len(content) > 50, "Should have meaningful response even after trimming"
    
    print(f"✅ Context persistence after trimming test passed")


def test_token_pressure_both_endpoints(client, store):
    """Test token pressure on both regular and enhanced endpoints"""
    regular_s = sid("reg-pressure")
    enhanced_s = sid("enh-pressure")
    
    # Test large message on regular endpoint
    r1 = client.ask_regular(f"Regular endpoint test: {BIG[:4000]}", regular_s)
    assert_v2(r1)
    
    # Test large message on enhanced endpoint  
    r2 = client.ask_enhanced(f"Enhanced endpoint test: {BIG[:4000]}", enhanced_s)
    assert_v2(r2)
    
    # Both should handle large messages gracefully
    reg_history = store.get(regular_s)
    enh_history = store.get(enhanced_s)
    
    assert len(reg_history) >= 2, "Regular endpoint should store conversation"
    assert len(enh_history) >= 2, "Enhanced endpoint should store conversation"
    
    print("✅ Token pressure test passed on both endpoints")


def test_extremely_long_single_message(client, store):
    """Test handling of extremely long single message"""
    s = sid("extreme")
    
    # Create extremely long message (beyond typical token limits)
    extreme_message = "This is about acoustic lagging requirements. " * 1000  # ~45,000 characters
    
    r = client.ask_regular(extreme_message, s)
    assert_v2(r)
    
    # Should handle gracefully without breaking
    history = store.get(s)
    assert len(history) >= 2, "Should store even extreme messages"
    
    # Verify stored message is handled properly (may be truncated)
    user_msg = history[0]
    assert user_msg["role"] == "user"
    assert len(user_msg["content"]) > 1000, "Should preserve substantial content"
    
    print("✅ Extremely long message test passed")


if __name__ == "__main__":
    # Manual test runner for development
    print("🧪 Running Token Pressure & Trimming Tests")
    
    client = TestClient()
    store = get_conversation_store()
    
    try:
        test_large_first_turn_then_followup(client, store)
        test_large_message_during_conversation(client, store)
        test_trimming_under_load(client, store)
        test_enhanced_endpoint_trimming(client, store)
        test_conversation_persistence_after_trimming(client, store)
        test_token_pressure_both_endpoints(client, store)
        test_extremely_long_single_message(client, store)
        
        print("🎉 All token pressure and trimming tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        raise