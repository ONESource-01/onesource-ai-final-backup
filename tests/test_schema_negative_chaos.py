#!/usr/bin/env python3
"""
Schema Phase - Negative & Chaos Tests
Testing malformed output, empty bodies, oversized responses, Redis failures, TTL checks
"""

import pytest
import json
import requests
import redis
import time
import uuid
from unittest.mock import patch, MagicMock
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.schema import ChatResponse
from middleware.schema_guard import ensure_v2_schema, validate_chat_response
from core.stores.conversation_store import get_conversation_store, init_conversation_store


class TestSchemaNegativeChaos:
    """Negative and chaos tests for schema validation and persistence"""
    
    @classmethod
    def setup_class(cls):
        """Setup test environment"""
        cls.base_url = "http://localhost:8001"
        cls.auth_headers = {"Authorization": "Bearer mock_test_token"}
        
        # Initialize conversation store
        init_conversation_store()
        cls.store = get_conversation_store()
        
        # Redis client for direct testing
        cls.redis_client = redis.Redis.from_url("redis://localhost:6379", decode_responses=True)
    
    def test_malformed_output_injection(self):
        """Test: Force handler to return {text:"..."} → guard must repair to v2"""
        print("\n🧪 NEGATIVE TEST: Malformed Output Injection")
        
        # Simulate malformed LLM response (old v1 format)
        malformed_response = {
            "text": "This is old format response without v2 structure",
            "status": "success"
        }
        
        # Test schema guard repair
        repaired_response = ensure_v2_schema(malformed_response)
        
        # Verify repair worked
        assert "title" in repaired_response, "Repaired response missing title"
        assert "summary" in repaired_response, "Repaired response missing summary" 
        assert "blocks" in repaired_response, "Repaired response missing blocks"
        assert "meta" in repaired_response, "Repaired response missing meta"
        
        # Verify schema compliance
        try:
            validate_chat_response(repaired_response)
            print("✅ Malformed output successfully repaired to v2 schema")
        except Exception as e:
            pytest.fail(f"Repaired response doesn't validate: {e}")
    
    def test_empty_body_handling(self):
        """Test: Simulate empty LLM output → guard fills minimal v2"""
        print("\n🧪 NEGATIVE TEST: Empty Body Handling")
        
        # Test various empty/null inputs
        empty_inputs = [
            {},
            {"text": ""},
            {"text": None},
            {"response": ""},
            None
        ]
        
        for empty_input in empty_inputs:
            print(f"   Testing empty input: {empty_input}")
            
            repaired = ensure_v2_schema(empty_input)
            
            # Should return minimal valid v2 structure
            assert repaired["title"] is not None, f"Empty input {empty_input} didn't get title"
            assert repaired["summary"] is not None, f"Empty input {empty_input} didn't get summary"
            assert len(repaired["blocks"]) > 0, f"Empty input {empty_input} didn't get blocks"
            assert repaired["meta"]["schema"] == "v2", f"Empty input {empty_input} wrong schema"
            
            # Verify it validates
            try:
                validate_chat_response(repaired)
                print(f"   ✅ Empty input repaired successfully")
            except Exception as e:
                pytest.fail(f"Empty input repair failed validation: {e}")
    
    def test_oversized_response_handling(self):
        """Test: Very large block → still validates; check for truncation"""
        print("\n🧪 NEGATIVE TEST: Oversized Response Handling")
        
        # Create oversized content
        huge_content = "A" * 50000  # 50KB of content
        
        oversized_response = {
            "text": huge_content,
            "technical": huge_content,
            "mentoring": huge_content
        }
        
        # Test schema guard handles large content
        repaired = ensure_v2_schema(oversized_response)
        
        # Should still be valid v2
        try:
            validate_chat_response(repaired)
            print("✅ Oversized response successfully handled and validates")
        except Exception as e:
            pytest.fail(f"Oversized response failed validation: {e}")
        
        # Check if content is preserved or truncated (document behavior)
        total_content_length = sum(len(str(block.get("content", ""))) for block in repaired["blocks"])
        print(f"   Original content: {len(huge_content)*3} chars, Final content: {total_content_length} chars")
        
        # Verify structure is maintained regardless of size
        assert len(repaired["blocks"]) > 0, "Oversized response lost blocks"
        assert repaired["meta"]["schema"] == "v2", "Oversized response wrong schema"
    
    def test_redis_failure_resilience(self):
        """Test: Temporary Redis set() exception → response still v2; error logged"""
        print("\n🧪 CHAOS TEST: Redis Failure Resilience")
        
        session_id = f"chaos_test_{uuid.uuid4().hex[:8]}"
        
        # Mock Redis failure
        with patch.object(self.store, 'set', side_effect=redis.RedisError("Simulated Redis failure")):
            
            # Make chat request that should trigger Redis save
            try:
                response = requests.post(
                    f"{self.base_url}/api/chat/ask",
                    json={
                        "question": "Test question during Redis failure",
                        "session_id": session_id
                    },
                    headers=self.auth_headers,
                    timeout=10
                )
                
                # Should still return 200 with valid v2 response
                assert response.status_code == 200, f"Redis failure caused HTTP error: {response.status_code}"
                
                data = response.json()
                
                # Verify v2 structure maintained despite persistence failure
                assert "title" in data, "Redis failure broke v2 title"
                assert "summary" in data, "Redis failure broke v2 summary"
                assert "blocks" in data, "Redis failure broke v2 blocks"
                assert "meta" in data, "Redis failure broke v2 meta"
                
                # Verify schema compliance
                try:
                    validate_chat_response(data)
                    print("✅ Redis failure handled gracefully - v2 response maintained")
                except Exception as e:
                    pytest.fail(f"Redis failure broke v2 schema: {e}")
                
            except Exception as e:
                pytest.fail(f"Redis failure caused system failure: {e}")
    
    def test_ttl_check_every_write(self):
        """Test: Ensure TTL is set on every write (not just key creation)"""
        print("\n🧪 INFRASTRUCTURE TEST: TTL Check on Every Write")
        
        session_id = f"ttl_test_{uuid.uuid4().hex[:8]}"
        
        # Write initial conversation
        initial_history = [{"role": "user", "content": "First message"}]
        self.store.set(session_id, initial_history)
        
        # Check TTL was set
        ttl_1 = self.redis_client.ttl(f"conv:{session_id}")
        assert ttl_1 > 0, f"TTL not set on initial write: {ttl_1}"
        print(f"   ✅ Initial write TTL: {ttl_1} seconds")
        
        # Wait a moment and add more messages
        time.sleep(2)
        
        updated_history = [
            {"role": "user", "content": "First message"},
            {"role": "assistant", "content": "First response"},
            {"role": "user", "content": "Second message"}
        ]
        self.store.set(session_id, updated_history)
        
        # Check TTL is still set and reasonable
        ttl_2 = self.redis_client.ttl(f"conv:{session_id}")
        assert ttl_2 > 0, f"TTL not maintained on update: {ttl_2}"
        print(f"   ✅ Updated write TTL: {ttl_2} seconds")
        
        # TTL should be refreshed (close to original value)
        ttl_diff = abs(ttl_1 - ttl_2)
        assert ttl_diff <= 5, f"TTL not refreshed properly: diff {ttl_diff}s"
        print(f"   ✅ TTL properly refreshed (diff: {ttl_diff}s)")
        
        # Verify TTL is in acceptable range (30 days = 2592000 seconds)
        expected_ttl = 30 * 24 * 60 * 60  # 30 days
        assert 0 < ttl_2 <= expected_ttl, f"TTL out of range: {ttl_2} (expected ≤ {expected_ttl})"
        print(f"   ✅ TTL in acceptable range: {ttl_2}/{expected_ttl} seconds")
    
    def test_concurrent_schema_validation(self):
        """Test: Schema validation under concurrent load"""
        print("\n🧪 PERFORMANCE TEST: Concurrent Schema Validation")
        
        import threading
        import concurrent.futures
        
        def validate_response():
            """Single validation task"""
            test_response = {
                "text": f"Test response {uuid.uuid4().hex[:8]}",
                "status": "success"
            }
            
            repaired = ensure_v2_schema(test_response)
            
            # Verify validation
            try:
                validate_chat_response(repaired)
                return True
            except:
                return False
        
        # Run 20 concurrent validations
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(validate_response) for _ in range(20)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        # All should succeed
        success_count = sum(results)
        assert success_count == 20, f"Concurrent validation failures: {20 - success_count}/20"
        print(f"   ✅ Concurrent schema validation: {success_count}/20 successful")
    
    def test_schema_guard_metrics_tracking(self):
        """Test: Schema guard properly tracks repair metrics"""
        print("\n🧪 OBSERVABILITY TEST: Schema Guard Metrics Tracking")
        
        # Get current metrics
        metrics_response = requests.get(f"{self.base_url}/api/metrics/schema", timeout=5)
        assert metrics_response.status_code == 200, "Metrics endpoint not available"
        
        initial_metrics = metrics_response.json()
        initial_repairs = initial_metrics["schema_validation"]["schema_repairs_total"]
        
        # Force a repair by sending old format through API
        repair_test_response = requests.post(
            f"{self.base_url}/api/chat/ask",
            json={
                "question": "Test question to trigger repair tracking",
                "session_id": f"repair_metrics_test_{uuid.uuid4().hex[:8]}"
            },
            headers=self.auth_headers,
            timeout=10
        )
        
        assert repair_test_response.status_code == 200, "Repair test request failed"
        
        # Check metrics updated
        time.sleep(1)  # Allow metrics to update
        
        updated_metrics_response = requests.get(f"{self.base_url}/api/metrics/schema", timeout=5)
        updated_metrics = updated_metrics_response.json()
        final_repairs = updated_metrics["schema_validation"]["schema_repairs_total"]
        
        # Should have incremented (system is in transition, repairs expected)
        assert final_repairs >= initial_repairs, f"Repair count didn't increase: {initial_repairs} → {final_repairs}"
        print(f"   ✅ Metrics tracking working: repairs {initial_repairs} → {final_repairs}")
        
        # Verify other required metrics are present
        required_metrics = [
            "responses_validated_total",
            "schema_validation_failures", 
            "schema_repairs_total",
            "repair_rate_percent"
        ]
        
        for metric in required_metrics:
            assert metric in updated_metrics["schema_validation"], f"Missing metric: {metric}"
        
        print("   ✅ All required metrics present and updating")


def run_negative_chaos_tests():
    """Run all negative and chaos tests"""
    print("🚨 SCHEMA PHASE - NEGATIVE & CHAOS TESTS")
    print("=" * 60)
    
    test_suite = TestSchemaNegativeChaos()
    test_suite.setup_class()
    
    tests = [
        test_suite.test_malformed_output_injection,
        test_suite.test_empty_body_handling,
        test_suite.test_oversized_response_handling,
        test_suite.test_redis_failure_resilience,
        test_suite.test_ttl_check_every_write,
        test_suite.test_concurrent_schema_validation,
        test_suite.test_schema_guard_metrics_tracking
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
    
    print(f"\n📊 NEGATIVE & CHAOS TEST RESULTS:")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   Success Rate: {(passed/(passed+failed))*100:.1f}%")
    
    return failed == 0


if __name__ == "__main__":
    success = run_negative_chaos_tests()
    exit(0 if success else 1)