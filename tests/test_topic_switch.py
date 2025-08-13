"""
Topic switch and pronoun chain testing
Tests changing referents mid-thread and pronoun resolution (it/this/that/they)
"""

import pytest
from tests.utils import sid, TestClient, assert_v2, wait_for_processing, extract_content


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient()


def test_switch_referent(client):
    """Test switching topics mid-conversation and pronoun resolution"""
    s = sid("switch")
    
    # Start with acoustic lagging
    r1 = client.ask_regular("Talk about acoustic lagging.", s)
    assert_v2(r1)
    wait_for_processing()
    
    # Switch to fire dampers
    r2 = client.ask_regular("Now switch to fire dampers.", s)
    assert_v2(r2)
    wait_for_processing()
    
    # Test pronoun resolution - "them" should refer to fire dampers
    r3 = client.ask_regular("When do I need to install them?", s)
    assert_v2(r3)
    
    content = extract_content(r3).lower()
    
    # Heuristic check: should mention fire dampers, not acoustic lagging
    fire_related = any(term in content for term in ["fire", "damper", "hvac", "duct"])
    acoustic_related = "acoustic" in content or "lagging" in content
    
    print(f"Fire-related content: {fire_related}")
    print(f"Acoustic-related content: {acoustic_related}")
    print(f"Response preview: {content[:200]}...")
    
    # Should understand "them" refers to fire dampers from most recent topic
    assert fire_related, f"Failed to understand 'them' refers to fire dampers. Content: {content[:300]}"
    
    print("✅ Topic switch and pronoun resolution test passed")


def test_pronoun_chain(client):
    """Test complex pronoun chains with multiple referents"""
    s = sid("pronoun")
    
    # Establish context: smoke detectors in high-rise stairwells
    r1 = client.ask_regular("Discuss smoke detectors in high-rise stairwells.", s)
    assert_v2(r1)
    wait_for_processing()
    
    # First pronoun: "they" = smoke detectors
    r2 = client.ask_regular("Where must they be installed?", s) 
    assert_v2(r2)
    content2 = extract_content(r2).lower()
    
    # Should understand "they" refers to smoke detectors
    smoke_related = any(term in content2 for term in ["smoke", "detector", "alarm"])
    assert smoke_related, f"Failed first pronoun: {content2[:200]}"
    
    wait_for_processing()
    
    # Second pronoun: "they" still = smoke detectors (continued reference)
    r3 = client.ask_regular("Are they required on refuge floors too?", s)
    assert_v2(r3)
    content3 = extract_content(r3).lower()
    
    # Should still understand "they" refers to smoke detectors
    smoke_related2 = any(term in content3 for term in ["smoke", "detector", "alarm"])
    refuge_related = any(term in content3 for term in ["refuge", "floor", "level"])
    
    assert smoke_related2, f"Failed second pronoun: {content3[:200]}"
    assert refuge_related, f"Failed to address refuge floors: {content3[:200]}"
    
    print("✅ Pronoun chain test passed")


def test_complex_referent_switching(client):
    """Test multiple topic switches with complex pronoun resolution"""
    s = sid("complex")
    
    # Topic 1: Fire sprinklers
    r1 = client.ask_regular("Tell me about fire sprinkler systems.", s)
    assert_v2(r1)
    wait_for_processing()
    
    # Topic 2: Emergency lighting
    r2 = client.ask_regular("Now let's discuss emergency lighting systems.", s)
    assert_v2(r2)
    wait_for_processing()
    
    # Pronoun should refer to emergency lighting (most recent)
    r3 = client.ask_regular("How often must they be tested?", s)
    assert_v2(r3)
    content3 = extract_content(r3).lower()
    
    lighting_related = any(term in content3 for term in ["light", "emergency", "luminaire"])
    test_related = any(term in content3 for term in ["test", "inspect", "maintain"])
    
    assert lighting_related or test_related, f"Failed to understand context switch: {content3[:200]}"
    
    wait_for_processing()
    
    # Topic 3: Exit signs  
    r4 = client.ask_regular("What about exit signs?", s)
    assert_v2(r4)
    wait_for_processing()
    
    # Pronoun should now refer to exit signs
    r5 = client.ask_regular("Do they need backup power?", s)
    assert_v2(r5)
    content5 = extract_content(r5).lower()
    
    exit_related = any(term in content5 for term in ["exit", "sign", "egress"])
    power_related = any(term in content5 for term in ["power", "battery", "backup"])
    
    # Should understand "they" now refers to exit signs
    assert exit_related or power_related, f"Failed final referent switch: {content5[:200]}"
    
    print("✅ Complex referent switching test passed")


def test_mixed_pronouns(client):
    """Test different pronouns (it, this, that, they) in same conversation"""
    s = sid("mixed")
    
    # Establish: Building Code requirements
    r1 = client.ask_regular("Explain NCC Volume One building classification requirements.", s)
    assert_v2(r1)
    wait_for_processing()
    
    # Test "it" 
    r2 = client.ask_regular("How is it determined for mixed-use buildings?", s)
    assert_v2(r2)
    wait_for_processing()
    
    # Test "this"
    r3 = client.ask_regular("When does this classification affect fire rating requirements?", s)
    assert_v2(r3)
    wait_for_processing()
    
    # Test "that"
    r4 = client.ask_regular("Can that be overridden by performance solutions?", s)
    assert_v2(r4)
    wait_for_processing()
    
    # All responses should be contextually relevant
    for i, response in enumerate([r2, r3, r4], 2):
        content = extract_content(response).lower()
        context_relevant = any(term in content for term in [
            "classification", "building", "ncc", "volume", "code", "class", "mixed"
        ])
        assert context_relevant, f"Response {i} lost context: {content[:150]}..."
    
    print("✅ Mixed pronouns test passed")


def test_enhanced_endpoint_topic_switch(client):
    """Test topic switching on enhanced endpoint"""
    s = sid("enh-switch")
    
    # Test same pattern on enhanced endpoint
    r1 = client.ask_enhanced("Discuss structural steel connections.", s)
    assert_v2(r1)
    wait_for_processing()
    
    r2 = client.ask_enhanced("Now switch to concrete reinforcement.", s) 
    assert_v2(r2)
    wait_for_processing()
    
    r3 = client.ask_enhanced("What are the cover requirements for it?", s)
    assert_v2(r3)
    
    content = extract_content(r3).lower()
    concrete_related = any(term in content for term in ["concrete", "reinforcement", "cover", "rebar"])
    
    assert concrete_related, f"Enhanced endpoint failed topic switch: {content[:200]}"
    
    print("✅ Enhanced endpoint topic switch test passed")


if __name__ == "__main__":
    # Manual test runner for development
    print("🧪 Running Topic Switch & Pronoun Chain Tests")
    
    client = TestClient()
    
    try:
        test_switch_referent(client)
        test_pronoun_chain(client)
        test_complex_referent_switching(client)
        test_mixed_pronouns(client)
        test_enhanced_endpoint_topic_switch(client)
        
        print("🎉 All topic switch and pronoun tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        raise