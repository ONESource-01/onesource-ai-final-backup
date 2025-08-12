#!/usr/bin/env python3
"""
Enhanced Emoji Mapping Consistency Fix Verification Test
Tests the specific fix mentioned in the review request for emoji consistency between regular and enhanced chat endpoints.
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, Optional

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

class EmojiConsistencyTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        try:
            url = f"{API_BASE}{endpoint}"
            request_headers = {"Content-Type": "application/json"}
            if headers:
                request_headers.update(headers)
            
            kwargs = {"headers": request_headers}
            if data:
                kwargs["json"] = data
            
            async with self.session.request(method, url, **kwargs) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                return response.status < 400, response_data, response.status
                
        except Exception as e:
            return False, str(e), 0

    async def test_enhanced_emoji_mapping_consistency_fix(self):
        """🚨 CRITICAL: Test Enhanced Emoji Mapping Consistency Fix from Review Request"""
        print("\n🚨 === ENHANCED EMOJI MAPPING CONSISTENCY FIX VERIFICATION ===")
        print("CONTEXT: Just implemented a critical fix for emoji consistency between regular and enhanced chat endpoints.")
        print("FIX IMPLEMENTED: Modified server.py lines 2113 and 2117 in enhanced chat endpoint to use correct 🧐 emoji")
        print("EXPECTED RESULT: Both endpoints return consistent Enhanced Emoji Mapping with 🧐 **Mentoring Insight**")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Use the EXACT question from the review request
        test_question = "What are fire safety requirements for high-rise buildings in Australia?"
        
        print(f"\n🔍 Testing question: '{test_question}'")
        print("📋 Expected Enhanced Emoji Mapping format:")
        print("   🔧 **Technical Answer:** - comprehensive technical guidance")
        print("   🧐 **Mentoring Insight:** - contextual guidance (MUST be 🧐 professor with monocle)")
        print("   📋 **Next Steps:** - optional")
        print("   📊 **Code Requirements:** - optional")
        print("   ✅ **Compliance Verification:** - optional")
        
        # Test 1: Regular chat endpoint (/api/chat/ask) - MAIN FOCUS
        print("\n1️⃣ Testing POST /api/chat/ask (Regular Chat) - MAIN FOCUS")
        regular_data = {
            "question": test_question,
            "session_id": "emoji_consistency_test_regular"
        }
        
        regular_success, regular_response, regular_status = await self.make_request("POST", "/chat/ask", regular_data, mock_headers)
        
        regular_has_correct_emoji = False
        regular_has_wrong_emoji = False
        regular_has_tech_answer = False
        regular_response_content = ""
        
        if regular_success and isinstance(regular_response, dict) and "response" in regular_response:
            regular_response_content = str(regular_response["response"])
            
            print(f"   📝 Response length: {len(regular_response_content)} characters")
            
            # Check for correct 🧐 emoji (professor with monocle)
            regular_has_correct_emoji = "🧐 **Mentoring Insight**" in regular_response_content or "🧐 Mentoring Insight" in regular_response_content
            
            # Check for wrong emojis (🤓 nerd face or others)
            regular_has_wrong_emoji = ("🤓 **Mentoring Insight**" in regular_response_content or 
                                     "🤓 Mentoring Insight" in regular_response_content or
                                     "🧠 **Mentoring Insight**" in regular_response_content or
                                     "🧠 Mentoring Insight" in regular_response_content)
            
            # Check for technical answer
            regular_has_tech_answer = "🔧 **Technical Answer**" in regular_response_content or "🔧 Technical Answer" in regular_response_content
            
            print(f"   🧐 Has '🧐 **Mentoring Insight**' (CORRECT): {regular_has_correct_emoji}")
            print(f"   🚨 Has wrong emoji (🤓 or 🧠): {regular_has_wrong_emoji}")
            print(f"   🔧 Has '🔧 **Technical Answer**': {regular_has_tech_answer}")
            
            # Show first 800 chars for analysis
            preview = regular_response_content[:800] + "..." if len(regular_response_content) > 800 else regular_response_content
            print(f"   📄 Response preview: {preview}")
            
            # CRITICAL CHECK: Must use 🧐 emoji, NOT 🤓 or others
            if regular_has_correct_emoji and not regular_has_wrong_emoji:
                self.log_test("✅ Regular Chat - CORRECT Mentoring Emoji (🧐)", True, "Uses 🧐 professor with monocle emoji as required")
            elif regular_has_wrong_emoji:
                wrong_emojis = []
                if "🤓" in regular_response_content:
                    wrong_emojis.append("🤓 nerd face")
                if "🧠" in regular_response_content:
                    wrong_emojis.append("🧠 brain")
                self.log_test("❌ Regular Chat - WRONG Mentoring Emoji", False, f"Uses incorrect emoji(s): {', '.join(wrong_emojis)} instead of 🧐")
            else:
                self.log_test("❌ Regular Chat - Missing Mentoring Emoji", False, "No Mentoring Insight section found")
            
            # Check technical answer emoji
            if regular_has_tech_answer:
                self.log_test("✅ Regular Chat - Technical Answer Emoji", True, "Has 🔧 Technical Answer")
            else:
                self.log_test("❌ Regular Chat - Missing Technical Answer", False, "Missing 🔧 Technical Answer section")
            
            self.log_test("Regular Chat - API Response", True, f"Received {len(regular_response_content)} char response")
        else:
            self.log_test("❌ Regular Chat - API Response", False, f"Status: {regular_status}", regular_response)
            print(f"   ❌ Failed to get response from regular chat endpoint")
        
        # Test 2: Enhanced chat endpoint (/api/chat/ask-enhanced) - COMPARISON
        print("\n2️⃣ Testing POST /api/chat/ask-enhanced (Enhanced Chat) - COMPARISON")
        enhanced_data = {
            "question": test_question,
            "session_id": "emoji_consistency_test_enhanced"
        }
        
        enhanced_success, enhanced_response, enhanced_status = await self.make_request("POST", "/chat/ask-enhanced", enhanced_data, mock_headers)
        
        enhanced_has_correct_emoji = False
        enhanced_has_wrong_emoji = False
        enhanced_has_tech_answer = False
        enhanced_response_content = ""
        
        if enhanced_success and isinstance(enhanced_response, dict) and "response" in enhanced_response:
            enhanced_response_content = str(enhanced_response["response"])
            
            print(f"   📝 Response length: {len(enhanced_response_content)} characters")
            
            # Check for correct 🧐 emoji (professor with monocle)
            enhanced_has_correct_emoji = "🧐 **Mentoring Insight**" in enhanced_response_content or "🧐 Mentoring Insight" in enhanced_response_content
            
            # Check for wrong emojis (🤓 nerd face or others)
            enhanced_has_wrong_emoji = ("🤓 **Mentoring Insight**" in enhanced_response_content or 
                                      "🤓 Mentoring Insight" in enhanced_response_content or
                                      "🧠 **Mentoring Insight**" in enhanced_response_content or
                                      "🧠 Mentoring Insight" in enhanced_response_content)
            
            # Check for technical answer
            enhanced_has_tech_answer = "🔧 **Technical Answer**" in enhanced_response_content or "🔧 Technical Answer" in enhanced_response_content
            
            print(f"   🧐 Has '🧐 **Mentoring Insight**' (CORRECT): {enhanced_has_correct_emoji}")
            print(f"   🚨 Has wrong emoji (🤓 or 🧠): {enhanced_has_wrong_emoji}")
            print(f"   🔧 Has '🔧 **Technical Answer**': {enhanced_has_tech_answer}")
            
            # Show first 800 chars for analysis
            preview = enhanced_response_content[:800] + "..." if len(enhanced_response_content) > 800 else enhanced_response_content
            print(f"   📄 Response preview: {preview}")
            
            # CRITICAL CHECK: Must use 🧐 emoji, NOT 🤓 or others
            if enhanced_has_correct_emoji and not enhanced_has_wrong_emoji:
                self.log_test("✅ Enhanced Chat - CORRECT Mentoring Emoji (🧐)", True, "Uses 🧐 professor with monocle emoji as required")
            elif enhanced_has_wrong_emoji:
                wrong_emojis = []
                if "🤓" in enhanced_response_content:
                    wrong_emojis.append("🤓 nerd face")
                if "🧠" in enhanced_response_content:
                    wrong_emojis.append("🧠 brain")
                self.log_test("❌ Enhanced Chat - WRONG Mentoring Emoji", False, f"Uses incorrect emoji(s): {', '.join(wrong_emojis)} instead of 🧐")
            else:
                self.log_test("❌ Enhanced Chat - Missing Mentoring Emoji", False, "No Mentoring Insight section found")
            
            # Check technical answer emoji
            if enhanced_has_tech_answer:
                self.log_test("✅ Enhanced Chat - Technical Answer Emoji", True, "Has 🔧 Technical Answer")
            else:
                self.log_test("❌ Enhanced Chat - Missing Technical Answer", False, "Missing 🔧 Technical Answer section")
            
            self.log_test("Enhanced Chat - API Response", True, f"Received {len(enhanced_response_content)} char response")
        else:
            self.log_test("❌ Enhanced Chat - API Response", False, f"Status: {enhanced_status}", enhanced_response)
            print(f"   ❌ Failed to get response from enhanced chat endpoint")
        
        # Test 3: CRITICAL CONSISTENCY ANALYSIS
        print("\n3️⃣ CRITICAL ENHANCED EMOJI MAPPING CONSISTENCY ANALYSIS")
        
        endpoints_tested = []
        if regular_success:
            endpoints_tested.append({
                "name": "Regular Chat",
                "has_correct_emoji": regular_has_correct_emoji,
                "has_wrong_emoji": regular_has_wrong_emoji,
                "has_tech": regular_has_tech_answer
            })
        
        if enhanced_success:
            endpoints_tested.append({
                "name": "Enhanced Chat", 
                "has_correct_emoji": enhanced_has_correct_emoji,
                "has_wrong_emoji": enhanced_has_wrong_emoji,
                "has_tech": enhanced_has_tech_answer
            })
        
        if len(endpoints_tested) >= 2:
            # Check consistency across all working endpoints
            all_use_correct_emoji = all(ep["has_correct_emoji"] for ep in endpoints_tested)
            none_use_wrong_emoji = not any(ep["has_wrong_emoji"] for ep in endpoints_tested)
            all_have_tech = all(ep["has_tech"] for ep in endpoints_tested)
            
            if all_use_correct_emoji and none_use_wrong_emoji:
                self.log_test("🎯 CRITICAL: Enhanced Emoji Mapping Consistency (🧐)", True, 
                            "✅ ALL endpoints use correct 🧐 emoji for Mentoring Insight")
                print("   ✅ CONSISTENCY ACHIEVED: All endpoints use 🧐 professor with monocle emoji correctly")
            else:
                self.log_test("🎯 CRITICAL: Enhanced Emoji Mapping Consistency (🧐)", False, 
                            "❌ Inconsistent or incorrect emoji usage across endpoints")
                print("   ❌ CONSISTENCY BROKEN:")
                for ep in endpoints_tested:
                    print(f"      {ep['name']} - 🧐 correct: {ep['has_correct_emoji']}, wrong emoji: {ep['has_wrong_emoji']}")
            
            if all_have_tech:
                self.log_test("✅ Technical Answer Consistency", True, 
                            "All endpoints use 🔧 Technical Answer")
            else:
                self.log_test("❌ Technical Answer Consistency", False, 
                            "Some endpoints missing 🔧 Technical Answer")
        else:
            self.log_test("🎯 Enhanced Emoji Mapping Consistency", False, 
                        "Cannot compare - insufficient working endpoints")
        
        print("\n🎯 FINAL VERDICT FOR REVIEW REQUEST:")
        
        # Count working endpoints with correct emoji
        correct_emoji_count = sum(1 for ep in endpoints_tested if ep["has_correct_emoji"] and not ep["has_wrong_emoji"])
        wrong_emoji_count = sum(1 for ep in endpoints_tested if ep["has_wrong_emoji"])
        total_working = len(endpoints_tested)
        
        if total_working > 0:
            if correct_emoji_count == total_working and wrong_emoji_count == 0:
                print("✅ Enhanced Emoji Mapping Fix: SUCCESSFUL")
                print(f"   All {total_working} working endpoints correctly use 🧐 for Mentoring Insight")
                print("   ✅ NO instances of incorrect 🤓 or 🧠 emojis found")
                print("🎉 CONCLUSION: The Enhanced Emoji Mapping consistency fix is working correctly")
                print("   Backend is sending responses with correct 🧐 emoji as required")
                return True
            elif wrong_emoji_count > 0:
                print("❌ Enhanced Emoji Mapping Fix: FAILED")
                print(f"   {wrong_emoji_count}/{total_working} endpoints still use incorrect emojis (🤓 or 🧠)")
                print("   🚨 CRITICAL: Some endpoints not updated with correct 🧐 emoji")
                print("🚨 CONCLUSION: Backend still has emoji mapping inconsistency - fix incomplete")
                return False
            else:
                print("⚠️ Enhanced Emoji Mapping Fix: PARTIAL")
                print(f"   {correct_emoji_count}/{total_working} endpoints use correct emoji")
                print("   Some endpoints may be missing Mentoring Insight sections entirely")
                print("🔍 CONCLUSION: Backend may need further investigation for missing sections")
                return False
        else:
            print("⚠️ Enhanced Emoji Mapping Fix: CANNOT DETERMINE")
            print("   No endpoints responded successfully")
            print("🚨 CONCLUSION: Backend API failure - investigate server issues")
            return False

async def main():
    print("🚀 Starting Enhanced Emoji Mapping Consistency Fix Verification")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    print("=" * 80)
    
    async with EmojiConsistencyTester() as tester:
        success = await tester.test_enhanced_emoji_mapping_consistency_fix()
        
        print("\n" + "=" * 80)
        print("🎯 ENHANCED EMOJI MAPPING CONSISTENCY FIX VERIFICATION SUMMARY")
        print("=" * 80)
        
        total_tests = len(tester.test_results)
        passed_tests = sum(1 for result in tester.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success:
            print("\n🎉 ENHANCED EMOJI MAPPING CONSISTENCY FIX: VERIFIED SUCCESSFUL")
            print("   Both regular and enhanced chat endpoints use consistent 🧐 emoji")
        else:
            print("\n🚨 ENHANCED EMOJI MAPPING CONSISTENCY FIX: VERIFICATION FAILED")
            print("   Emoji inconsistency still exists between endpoints")
        
        print("\n🔍 Backend emoji consistency testing completed!")
        return success

if __name__ == "__main__":
    asyncio.run(main())