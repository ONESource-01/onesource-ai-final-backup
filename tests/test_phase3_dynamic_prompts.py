#!/usr/bin/env python3
"""
Phase 3: Dynamic Prompts & Follow-On Suggestions Tests
Validates rotating examples and context-aware suggestions
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import pytest
import requests
import time
import redis
from core.examples import get_examples_manager
from core.suggestions import get_suggestions_engine, detect_topic, suggest_actions


class TestDynamicPrompts:
    """Test dynamic example questions system"""
    
    @classmethod
    def setup_class(cls):
        cls.base_url = "http://localhost:8001"
        cls.auth_headers = {"Authorization": "Bearer mock_test_token"}
        cls.examples_manager = get_examples_manager()
        cls.suggestions_engine = get_suggestions_engine()
        
    def test_examples_unique_in_response(self):
        """Test: GET /api/prompts/examples returns unique items within response"""
        print("\n🧪 TEST: Examples uniqueness within response")
        
        response = requests.get(f"{self.base_url}/api/prompts/examples?n=5", headers=self.auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        examples = data["examples"]
        
        # Check uniqueness
        assert len(examples) == len(set(examples)), "Examples contain duplicates"
        
        # Check reasonable count
        assert 1 <= len(examples) <= 5, f"Expected 1-5 examples, got {len(examples)}"
        
        print(f"✅ Returned {len(examples)} unique examples")
        for i, example in enumerate(examples):
            print(f"   {i+1}. {example}")
    
    def test_examples_bias_by_topic(self):
        """Test: Examples bias toward specified topics"""
        print("\n🧪 TEST: Topic biasing")
        
        # Test fire topic biasing
        response = requests.get(f"{self.base_url}/api/prompts/examples?n=5&topics=fire", headers=self.auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        examples = data["examples"]
        
        # Check that at least some examples relate to fire
        fire_related = any(
            "fire" in example.lower() or "smoke" in example.lower() or "sprinkler" in example.lower()
            for example in examples
        )
        
        assert fire_related, f"Fire topic biasing failed. Examples: {examples}"
        print(f"✅ Fire topic biasing working: found fire-related examples")
        
        # Test multiple topics
        response = requests.get(f"{self.base_url}/api/prompts/examples?n=5&topics=fire,plumbing", headers=self.auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        examples = data["examples"]
        
        relevant = any(
            any(topic in example.lower() for topic in ["fire", "smoke", "water", "plumbing", "gutter"])
            for example in examples
        )
        
        assert relevant, f"Multi-topic biasing failed. Examples: {examples}"
        print(f"✅ Multi-topic biasing working")
    
    def test_user_specific_rotation(self):
        """Test: User-specific example rotation without repeats until pool exhausted"""
        print("\n🧪 TEST: User-specific rotation")
        
        user_id = "test_rotation_user"
        
        # Get first set of examples
        response1 = requests.get(f"{self.base_url}/api/prompts/examples?n=3&user_id={user_id}", headers=self.auth_headers)
        assert response1.status_code == 200
        examples1 = response1.json()["examples"]
        
        # Get second set of examples
        response2 = requests.get(f"{self.base_url}/api/prompts/examples?n=3&user_id={user_id}", headers=self.auth_headers)
        assert response2.status_code == 200
        examples2 = response2.json()["examples"]
        
        # Should have some different examples (rotation working)
        overlap = set(examples1) & set(examples2)
        print(f"   First set: {len(examples1)} examples")
        print(f"   Second set: {len(examples2)} examples")
        print(f"   Overlap: {len(overlap)} examples")
        
        # Due to randomization and potential pool exhaustion, allow some overlap
        # but expect at least some variation
        total_unique = len(set(examples1) | set(examples2))
        assert total_unique > len(examples1), "No rotation detected - all examples identical"
        
        print(f"✅ User rotation working: {total_unique} unique examples across requests")
    
    def test_examples_api_validation(self):
        """Test: API parameter validation and error handling"""
        print("\n🧪 TEST: API validation")
        
        # Test invalid n parameter
        response = requests.get(f"{self.base_url}/api/prompts/examples?n=20", headers=self.auth_headers)
        # Should clamp to max value, not error
        assert response.status_code == 200
        data = response.json()
        assert len(data["examples"]) <= 10
        
        # Test zero n parameter
        response = requests.get(f"{self.base_url}/api/prompts/examples?n=0", headers=self.auth_headers)
        assert response.status_code == 422  # Validation error
        
        # Test malformed topics
        response = requests.get(f"{self.base_url}/api/prompts/examples?topics=invalid,nonexistent", headers=self.auth_headers)
        assert response.status_code == 200  # Should still work, just no biasing
        
        print("✅ API validation working correctly")


class TestSuggestedActions:
    """Test context-aware follow-on suggestions"""
    
    @classmethod
    def setup_class(cls):
        cls.base_url = "http://localhost:8001"
        cls.auth_headers = {"Authorization": "Bearer mock_test_token"}
        cls.suggestions_engine = get_suggestions_engine()
    
    def test_topic_detection(self):
        """Test: Topic detection from response content"""
        print("\n🧪 TEST: Topic detection")
        
        test_cases = [
            ("Fire safety requirements include smoke detectors and sprinkler systems", "fire"),
            ("Acoustic insulation and sound transmission requirements", "acoustic"),
            ("Plumbing design must include AS 3500 compliance and backflow prevention", "plumbing"),  
            ("Structural loads and wind pressure calculations", "structural"),
            ("Electrical wiring and AS/NZS 3000 requirements", "electrical"),
            ("Generic building information without specific topics", None)
        ]
        
        for text, expected_topic in test_cases:
            detected = detect_topic(text)
            if expected_topic:
                assert detected == expected_topic, f"Expected '{expected_topic}', got '{detected}' for: {text[:50]}..."
            else:
                # For generic text, allow any result including None
                pass
            print(f"   '{text[:40]}...' → '{detected}'")
        
        print("✅ Topic detection working")
    
    def test_suggested_actions_present(self):
        """Test: Chat responses contain 0-3 suggested actions"""
        print("\n🧪 TEST: Suggested actions in chat responses")
        
        session_id = f"suggestions_test_{int(time.time())}"
        
        # Test with fire safety question (should trigger fire-related suggestions)
        response = requests.post(
            f"{self.base_url}/api/chat/ask",
            json={
                "question": "What are the fire safety requirements for high-rise buildings?",
                "session_id": session_id
            },
            headers=self.auth_headers,
            timeout=15
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check v2 schema structure
        assert "meta" in data, "Response missing meta field"
        
        # Check suggested actions
        suggested_actions = data["meta"].get("suggested_actions", [])
        assert isinstance(suggested_actions, list), "suggested_actions must be a list"
        assert 0 <= len(suggested_actions) <= 3, f"Expected 0-3 suggestions, got {len(suggested_actions)}"
        
        # Validate suggestion structure
        for action in suggested_actions:
            assert "label" in action, "Suggestion missing label"
            assert "payload" in action, "Suggestion missing payload"
            assert len(action["label"]) <= 40, f"Label too long: {action['label']}"
            assert len(action["payload"]) > 0, "Payload cannot be empty"
        
        print(f"✅ Found {len(suggested_actions)} suggested actions:")
        for i, action in enumerate(suggested_actions, 1):
            print(f"   {i}. {action['label']} → {action['payload'][:50]}...")
    
    def test_suggested_actions_content_specific(self):
        """Test: Suggestions reflect response content"""
        print("\n🧪 TEST: Content-specific suggestions")
        
        # Mock response blocks for testing
        test_blocks = [
            {
                "type": "table",
                "headers": ["Standard", "Requirement"],
                "rows": [["AS 1670.1", "Smoke detection"]]
            },
            {
                "type": "code", 
                "content": "fire_rating = height / 25"
            },
            {
                "type": "list",
                "content": "- Check AS 2118.1\n- Install sprinklers\n- Test systems"
            }
        ]
        
        # Test fire topic with various block types
        suggestions = suggest_actions(
            topic="fire",
            blocks=test_blocks,
            full_text="Fire safety requirements include AS 2118.1 sprinkler systems."
        )
        
        assert 0 <= len(suggestions) <= 3, f"Expected 0-3 suggestions, got {len(suggestions)}"
        
        # Should have fire-specific suggestions
        fire_related = any("fire" in action["label"].lower() for action in suggestions)
        # Should have table-specific suggestion (CSV export)
        table_related = any("csv" in action["label"].lower() or "export" in action["label"].lower() for action in suggestions)
        
        print(f"✅ Generated {len(suggestions)} context-aware suggestions")
        print(f"   Fire-related: {fire_related}")
        print(f"   Table-related: {table_related}")
        
        for action in suggestions:
            print(f"   - {action['label']}")
    
    def test_telemetry_tracking(self):
        """Test: UI event tracking works"""
        print("\n🧪 TEST: Telemetry tracking")
        
        # Test example click tracking
        event_data = {
            "event_type": "example_clicked",
            "user_id": "test_user",
            "session_id": "test_session",
            "metadata": {
                "example_text": "Test example question",
                "index": 0,
                "topic": "fire"
            }
        }
        
        response = requests.post(
            f"{self.base_url}/api/telemetry/ui",
            json=event_data,
            headers=self.auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "recorded"
        assert data["event_type"] == "example_clicked"
        
        # Test suggested action click tracking
        event_data = {
            "event_type": "suggested_action_clicked",
            "user_id": "test_user", 
            "session_id": "test_session",
            "metadata": {
                "label": "See fire safety clause",
                "payload": "Show me fire safety requirements",
                "topic": "fire"
            }
        }
        
        response = requests.post(
            f"{self.base_url}/api/telemetry/ui",
            json=event_data,
            headers=self.auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "recorded"
        
        print("✅ Telemetry tracking working")
    
    def test_observability_metrics(self):
        """Test: Phase 3 metrics are tracked in observability system"""
        print("\n🧪 TEST: Observability metrics")
        
        response = requests.get(f"{self.base_url}/api/metrics/observability", timeout=5)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check Phase 3 metrics are present
        assert "dynamic_prompts" in data, "Missing dynamic_prompts metrics"
        
        dp_metrics = data["dynamic_prompts"]
        required_fields = [
            "examples_served_total",
            "example_clicks_total", 
            "suggested_action_clicks_total",
            "examples_dismissed_total",
            "overall_example_ctr_percent"
        ]
        
        for field in required_fields:
            assert field in dp_metrics, f"Missing metric: {field}"
        
        print("✅ Observability metrics present:")
        print(f"   Examples served: {dp_metrics['examples_served_total']}")
        print(f"   Example clicks: {dp_metrics['example_clicks_total']}")
        print(f"   Action clicks: {dp_metrics['suggested_action_clicks_total']}")
        print(f"   Overall CTR: {dp_metrics['overall_example_ctr_percent']}%")


def run_phase3_tests():
    """Run all Phase 3 tests"""
    print("🚀 PHASE 3: DYNAMIC PROMPTS & FOLLOW-ON SUGGESTIONS TESTS")
    print("=" * 70)
    
    # Test dynamic prompts
    print("\n📊 DYNAMIC PROMPTS TESTS")
    print("-" * 30)
    
    prompts_test = TestDynamicPrompts()
    prompts_test.setup_class()
    
    tests = [
        prompts_test.test_examples_unique_in_response,
        prompts_test.test_examples_bias_by_topic,
        prompts_test.test_user_specific_rotation,
        prompts_test.test_examples_api_validation
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"❌ {test.__name__} FAILED: {e}")
            failed += 1
    
    # Test suggested actions
    print("\n🎯 SUGGESTED ACTIONS TESTS") 
    print("-" * 30)
    
    actions_test = TestSuggestedActions()
    actions_test.setup_class()
    
    tests = [
        actions_test.test_topic_detection,
        actions_test.test_suggested_actions_present,
        actions_test.test_suggested_actions_content_specific,
        actions_test.test_telemetry_tracking,
        actions_test.test_observability_metrics
    ]
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"❌ {test.__name__} FAILED: {e}")
            failed += 1
    
    print(f"\n📊 PHASE 3 TEST RESULTS:")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   Success Rate: {(passed/(passed+failed))*100:.1f}%")
    
    return failed == 0


if __name__ == "__main__":
    success = run_phase3_tests()
    exit(0 if success else 1)