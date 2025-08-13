#!/usr/bin/env python3
"""
Chat Parity Tests - Ensures structure and emoji consistency between endpoints
Tests the five critical parity requirements from the fix plan
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Any

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
    return "http://localhost:8001"

BACKEND_URL = get_backend_url()
API_BASE = f"{BACKEND_URL}/api"

class ParityTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
    
    async def make_request(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Make HTTP request and return response"""
        headers = {
            "Authorization": "Bearer mock_dev_token",
            "Content-Type": "application/json"
        }
        
        url = f"{API_BASE}{endpoint}"
        
        async with self.session.post(url, json=payload, headers=headers) as response:
            if response.status == 200:
                return await response.json()
            else:
                error_text = await response.text()
                raise Exception(f"HTTP {response.status}: {error_text}")

    async def test_parity_basic(self):
        """Test 1: Basic structure parity between endpoints"""
        print("\n1️⃣ TEST: Basic Structure Parity")
        
        sample_payload = {
            "question": "What are acoustic lagging requirements?",
            "session_id": "parity_test_basic"
        }
        
        # Test both endpoints
        r1 = await self.make_request("/chat/ask", sample_payload)
        r2 = await self.make_request("/chat/ask-enhanced", sample_payload)
        
        # Check structure parity (schema v2 keys exist)
        required_keys = ["title", "summary", "blocks", "meta"]
        
        r1_has_keys = all(key in r1 for key in required_keys)
        r2_has_keys = all(key in r2 for key in required_keys)
        
        if r1_has_keys and r2_has_keys:
            self.log_test("Structure Parity", True, "Both endpoints have required v2 keys: title, summary, blocks, meta")
        else:
            missing_r1 = [k for k in required_keys if k not in r1]
            missing_r2 = [k for k in required_keys if k not in r2]
            self.log_test("Structure Parity", False, f"Missing keys - regular: {missing_r1}, enhanced: {missing_r2}")
        
        # Check blocks is array in both (v2 schema)
        r1_blocks_array = isinstance(r1.get("blocks"), list)
        r2_blocks_array = isinstance(r2.get("blocks"), list)
        
        if r1_blocks_array and r2_blocks_array:
            self.log_test("Blocks Array", True, "Both endpoints return blocks as array")
        else:
            self.log_test("Blocks Array", False, f"Blocks types - regular: {type(r1.get('blocks'))}, enhanced: {type(r2.get('blocks'))}")

    async def test_emoji_mapping_consistent(self):
        """Test 2: Enhanced Emoji Mapping consistency"""
        print("\n2️⃣ TEST: Enhanced Emoji Mapping Consistency")
        
        sample_payload = {
            "question": "Tell me about fire safety systems analysis",
            "session_id": "parity_test_emoji"
        }
        
        r1 = await self.make_request("/chat/ask", sample_payload)
        r2 = await self.make_request("/chat/ask-enhanced", sample_payload)
        
        # Check for Enhanced Emoji Mapping sections in blocks content
        r1_content = ""
        r2_content = ""
        
        if "blocks" in r1 and r1["blocks"]:
            r1_content = " ".join([block.get("content", "") for block in r1["blocks"]])
        if "blocks" in r2 and r2["blocks"]:
            r2_content = " ".join([block.get("content", "") for block in r2["blocks"]])
        
        required_sections = ["🔧 **Technical Answer**", "🧐 **Mentoring Insight**", "📋 **Next Steps**"]
        
        r1_sections = [section for section in required_sections if section in r1_content]
        r2_sections = [section for section in required_sections if section in r2_content]
        
        if len(r1_sections) >= 2 and len(r2_sections) >= 2:
            self.log_test("Enhanced Emoji Mapping", True, f"Both endpoints have Enhanced Emoji Mapping sections")
        else:
            self.log_test("Enhanced Emoji Mapping", False, f"Missing sections - regular: {3-len(r1_sections)}, enhanced: {3-len(r2_sections)}")
        
        # Check specific 🧐 **Mentoring Insight** consistency  
        mentoring_in_r1 = "🧐 **Mentoring Insight**" in r1.get("text", "")
        mentoring_in_r2 = "🧐 **Mentoring Insight**" in r2.get("text", "")
        
        if mentoring_in_r1 and mentoring_in_r2:
            self.log_test("Mentoring Insight Emoji", True, "Both endpoints use 🧐 **Mentoring Insight**")
        else:
            self.log_test("Mentoring Insight Emoji", False, f"Missing 🧐 - regular: {not mentoring_in_r1}, enhanced: {not mentoring_in_r2}")

    async def test_no_topics_failsafe(self):
        """Test 3: No topics failsafe"""
        print("\n3️⃣ TEST: No Topics Failsafe")
        
        sample_payload = {
            "question": "General construction question",
            "session_id": "parity_test_failsafe"
        }
        
        r = await self.make_request("/chat/ask", sample_payload)
        
        # Should have valid structure even without specific topics
        has_meta = "meta" in r
        has_text = "text" in r and len(r["text"]) > 50
        has_emoji_map = "emoji_map" in r and isinstance(r["emoji_map"], list)
        
        if has_meta and has_text and has_emoji_map:
            self.log_test("No Topics Failsafe", True, "Endpoint handles empty topics gracefully")
        else:
            self.log_test("No Topics Failsafe", False, f"Failsafe issues - meta: {has_meta}, text: {has_text}, emoji_map: {has_emoji_map}")

    async def test_schema_enforced(self):
        """Test 4: Schema enforcement"""
        print("\n4️⃣ TEST: Schema Enforcement")
        
        sample_payload = {
            "question": "Test schema enforcement",
            "session_id": "parity_test_schema"
        }
        
        r = await self.make_request("/chat/ask", sample_payload)
        
        # Check for required response structure
        has_text = isinstance(r.get("text"), str) and len(r["text"]) > 0
        has_emoji_map = isinstance(r.get("emoji_map"), list)
        has_meta = isinstance(r.get("meta"), dict)
        
        # Check meta contains expected fields
        meta_has_fields = False
        if has_meta:
            meta_fields = ["tier", "tokens_used", "session_id"]
            meta_has_fields = all(field in r["meta"] for field in meta_fields)
        
        if has_text and has_emoji_map and has_meta and meta_has_fields:
            self.log_test("Schema Enforcement", True, "Response follows enforced schema")
        else:
            self.log_test("Schema Enforcement", False, f"Schema issues - text: {has_text}, emoji_map: {has_emoji_map}, meta: {has_meta}, meta_fields: {meta_has_fields}")

    async def test_context_parity(self):
        """Test 5: Context handling parity - CRITICAL TEST"""
        print("\n5️⃣ TEST: Context Handling Parity (CRITICAL)")
        
        # Test multi-turn conversation on both endpoints
        session_regular = "parity_context_regular"
        session_enhanced = "parity_context_enhanced"
        
        # First turn - establish context
        first_payload = {
            "question": "Tell me about acoustic lagging installation",
            "session_id": session_regular
        }
        
        first_enhanced_payload = {
            "question": "Tell me about acoustic lagging installation", 
            "session_id": session_enhanced
        }
        
        r1_first = await self.make_request("/chat/ask", first_payload)
        r2_first = await self.make_request("/chat/ask-enhanced", first_enhanced_payload)
        
        # Wait for conversation storage
        await asyncio.sleep(1)
        
        # Second turn - test context understanding
        followup_payload = {
            "question": "When should I install it?",  # "it" should refer to acoustic lagging
            "session_id": session_regular
        }
        
        followup_enhanced_payload = {
            "question": "When should I install it?",
            "session_id": session_enhanced
        }
        
        r1_followup = await self.make_request("/chat/ask", followup_payload)
        r2_followup = await self.make_request("/chat/ask-enhanced", followup_enhanced_payload)
        
        # Check if both understand context
        r1_understands = any(term in r1_followup.get("text", "").lower() for term in ["acoustic", "lagging", "installation", "timing"])
        r2_understands = any(term in r2_followup.get("text", "").lower() for term in ["acoustic", "lagging", "installation", "timing"])
        
        if r1_understands and r2_understands:
            self.log_test("Context Parity - CRITICAL", True, "Both endpoints understand conversational context")
        else:
            self.log_test("Context Parity - CRITICAL", False, f"Context understanding - regular: {r1_understands}, enhanced: {r2_understands}")

    async def run_all_tests(self):
        """Run all parity tests"""
        print("🚨 CHAT PARITY TESTS - 5 Critical Requirements")
        print("Tests ensure structure and emoji consistency between endpoints")
        
        try:
            await self.test_parity_basic()
            await self.test_emoji_mapping_consistent()
            await self.test_no_topics_failsafe()
            await self.test_schema_enforced()
            await self.test_context_parity()
            
            # Calculate results
            total_tests = len(self.test_results)
            passed_tests = sum(1 for result in self.test_results if result["success"])
            
            print(f"\n📊 PARITY TEST RESULTS:")
            print(f"Total Tests: {total_tests}")
            print(f"Passed: {passed_tests}")
            print(f"Failed: {total_tests - passed_tests}")
            print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
            
            if passed_tests == total_tests:
                print("🎉 PARITY ACHIEVED: All tests passed!")
                return 0
            else:
                print("💥 PARITY FAILED: Some tests failed")
                return 1
                
        except Exception as e:
            print(f"❌ Test suite error: {e}")
            return 1

async def main():
    """Main test runner"""
    async with ParityTester() as tester:
        return await tester.run_all_tests()

if __name__ == "__main__":
    try:
        result = asyncio.run(main())
        sys.exit(result)
    except KeyboardInterrupt:
        print("\nTests interrupted")
        sys.exit(1)
    except Exception as e:
        print(f"Test error: {e}")
        sys.exit(1)