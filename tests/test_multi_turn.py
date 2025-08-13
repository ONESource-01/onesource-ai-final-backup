"""
Multi-turn context testing
Tests 3, 5, and 10 turn conversations on both endpoints with same session_id
"""

import pytest
from tests.utils import sid, TestClient, assert_v2, wait_for_processing


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient()


def _run_thread(client: TestClient, path: str, n: int = 3) -> str:
    """
    Run n-turn conversation thread
    
    Args:
        client: Test client
        path: Endpoint path ("/api/chat/ask" or "/api/chat/ask-enhanced") 
        n: Number of turns
    
    Returns:
        Session ID used
    """
    s = sid("mt")
    
    # Turn 1: Start with acoustic lagging discussion
    client.post(path, "Discuss acoustic lagging requirements.", s, {"mode": "analysis"})
    wait_for_processing()
    
    # Subsequent turns with context references
    for i in range(2, n + 1):
        if i == 2:
            question = "When do I need to install it?"  # Test "it" = acoustic lagging
        elif i == 3:
            question = "Any exceptions for residential projects?"
        elif i <= 5:
            question = f"What about thickness requirements for it?"
        else:
            question = f"Turn {i}: Are there special considerations for it in high-rise buildings?"
        
        r = client.post(path, question, s, {"mode": "analysis"})
        assert_v2(r)
        
        # Verify context understanding for key turns
        if i == 2:
            content = " ".join([block.get("content", "") for block in r["blocks"]]).lower()
            assert any(term in content for term in ["acoustic", "lagging"]), f"Turn {i} failed context: {content[:200]}..."
        
        wait_for_processing()
    
    return s


def test_3_turns_regular(client):
    """Test 3-turn conversation on regular endpoint"""
    session_id = _run_thread(client, "/api/chat/ask", 3)
    print(f"✅ 3-turn regular conversation completed: {session_id}")


def test_3_turns_enhanced(client):
    """Test 3-turn conversation on enhanced endpoint"""  
    session_id = _run_thread(client, "/api/chat/ask-enhanced", 3)
    print(f"✅ 3-turn enhanced conversation completed: {session_id}")


def test_5_turns_regular(client):
    """Test 5-turn conversation on regular endpoint"""
    session_id = _run_thread(client, "/api/chat/ask", 5)
    print(f"✅ 5-turn regular conversation completed: {session_id}")


def test_5_turns_enhanced(client):
    """Test 5-turn conversation on enhanced endpoint"""
    session_id = _run_thread(client, "/api/chat/ask-enhanced", 5)  
    print(f"✅ 5-turn enhanced conversation completed: {session_id}")


def test_10_turns_regular(client):
    """Test 10-turn conversation on regular endpoint"""
    session_id = _run_thread(client, "/api/chat/ask", 10)
    print(f"✅ 10-turn regular conversation completed: {session_id}")


def test_10_turns_enhanced(client):
    """Test 10-turn conversation on enhanced endpoint"""
    session_id = _run_thread(client, "/api/chat/ask-enhanced", 10)
    print(f"✅ 10-turn enhanced conversation completed: {session_id}")


def test_context_consistency_across_turns(client):
    """Test that context is maintained consistently across many turns"""
    s = sid("consistency")
    
    # Establish initial context
    r1 = client.ask_regular("Tell me about fire dampers in HVAC systems.", s)
    assert_v2(r1)
    wait_for_processing()
    
    # Test context understanding through multiple turns
    questions_and_expectations = [
        ("Where should they be installed?", ["damper", "fire", "hvac"]),
        ("What standards govern them?", ["standard", "as", "ncc"]),
        ("How do they activate?", ["activ", "fire", "temperature"]),
        ("Do they need regular testing?", ["test", "maintenance", "inspect"]),
        ("What happens if they fail?", ["fail", "fire", "safety"])
    ]
    
    for i, (question, keywords) in enumerate(questions_and_expectations, 2):
        r = client.ask_regular(question, s)
        assert_v2(r)
        
        content = " ".join([block.get("content", "") for block in r["blocks"]]).lower()
        
        # Check that response contains relevant keywords (context understanding)
        matches = [kw for kw in keywords if kw in content]
        assert len(matches) > 0, f"Turn {i} failed context check. Expected keywords: {keywords}, got content: {content[:200]}..."
        
        print(f"✅ Turn {i}: Context maintained - found keywords: {matches}")
        wait_for_processing()


if __name__ == "__main__":
    # Manual test runner for development
    print("🧪 Running Multi-Turn Context Tests")
    
    client = TestClient()
    
    try:
        # Test all multi-turn scenarios
        test_3_turns_regular(client)
        test_3_turns_enhanced(client)
        test_5_turns_regular(client)
        test_5_turns_enhanced(client)
        test_10_turns_regular(client) 
        test_10_turns_enhanced(client)
        test_context_consistency_across_turns(client)
        
        print("🎉 All multi-turn tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        raise