#!/usr/bin/env python3
"""
🚨 CRITICAL EMERGENCY: FORMATTING DISASTER INVESTIGATION

Testing the exact emoji mapping issues reported:
1. "poorly presented page on bad formatting"
2. "ridiculous placement of emojis" 
3. "Mentoring insight emoji should NOT be a brain!" (🧠 is wrong)
4. "some are not of the set we agreed upon"
5. "presentation of the response is amateurish"

URGENT TESTING REQUIRED:
1. Test POST /api/chat/ask with question: "What are fire safety requirements?" 
2. Examine the EXACT response text and emoji structure returned by backend
3. Test POST /api/chat/ask-enhanced with same question
4. Test POST /api/chat/boost-response with same question
5. Document the EXACT emoji mapping being returned vs what should be returned
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

class EmojiFormattingTester:
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

    def analyze_emoji_structure(self, response_text: str) -> Dict[str, Any]:
        """Analyze the emoji structure in the response"""
        analysis = {
            "total_length": len(response_text),
            "emojis_found": [],
            "sections_found": [],
            "formatting_issues": [],
            "correct_emojis": [],
            "wrong_emojis": []
        }
        
        # Define expected emoji mapping
        expected_emojis = {
            "🔧": "Technical Answer",
            "💡": "Mentoring Insight",  # NOT 🧠 (brain)
            "📋": "Next Steps",
            "📊": "Code Requirements", 
            "✅": "Compliance Verification",
            "🔄": "Alternative Solutions",
            "🏛️": "Authority Requirements",
            "📄": "Documentation Needed",
            "⚙️": "Workflow Recommendations",
            "❓": "Clarifying Questions"
        }
        
        # Wrong emojis that should NOT be used
        wrong_emojis = {
            "🧠": "Brain emoji (should be 💡 for Mentoring Insight)",
            "🤔": "Thinking face",
            "💭": "Thought bubble",
            "🎯": "Target (unless specifically for goals)",
            "🔍": "Magnifying glass (unless for search/investigation)"
        }
        
        # Check for expected emojis
        for emoji, section in expected_emojis.items():
            if emoji in response_text:
                analysis["emojis_found"].append(emoji)
                analysis["correct_emojis"].append(f"{emoji} {section}")
                
                # Check if it's properly formatted as section header
                if f"{emoji} **{section}**" in response_text:
                    analysis["sections_found"].append(f"{emoji} **{section}**")
                elif f"{emoji}**{section}**" in response_text:
                    analysis["sections_found"].append(f"{emoji}**{section}**")
                    analysis["formatting_issues"].append(f"Missing space after {emoji}")
                elif f"**{emoji} {section}**" in response_text:
                    analysis["sections_found"].append(f"**{emoji} {section}**")
                    analysis["formatting_issues"].append(f"Emoji inside bold formatting: **{emoji} {section}**")
        
        # Check for wrong emojis
        for emoji, description in wrong_emojis.items():
            if emoji in response_text:
                analysis["wrong_emojis"].append(f"{emoji} {description}")
                analysis["formatting_issues"].append(f"WRONG EMOJI USED: {emoji} ({description})")
        
        # Check for specific brain emoji issue
        if "🧠" in response_text:
            analysis["formatting_issues"].append("🚨 CRITICAL: Brain emoji (🧠) found - should be 💡 for Mentoring Insight")
        
        # Check for proper section structure
        if "**Technical Answer**" in response_text:
            if "🔧 **Technical Answer**" not in response_text:
                analysis["formatting_issues"].append("Technical Answer section missing 🔧 emoji")
        
        if "**Mentoring Insight**" in response_text:
            if "💡 **Mentoring Insight**" not in response_text and "🧠 **Mentoring Insight**" in response_text:
                analysis["formatting_issues"].append("🚨 CRITICAL: Mentoring Insight using 🧠 instead of 💡")
            elif "💡 **Mentoring Insight**" not in response_text:
                analysis["formatting_issues"].append("Mentoring Insight section missing 💡 emoji")
        
        return analysis

    async def test_critical_emoji_formatting_disaster(self):
        """🚨 CRITICAL: Test the exact emoji formatting disaster reported"""
        print("🚨" * 50)
        print("🚨 CRITICAL EMERGENCY: FORMATTING DISASTER INVESTIGATION")
        print("🚨" * 50)
        print()
        print("Testing the EXACT question from review request:")
        print("Question: 'What are fire safety requirements?'")
        print()
        print("Expected emoji mapping:")
        print("✅ 🔧 **Technical Answer**")
        print("✅ 💡 **Mentoring Insight** (NOT 🧠 brain!)")
        print("✅ 📋 **Next Steps**")
        print("❌ 🧠 **Mentoring Insight** (WRONG - should be 💡)")
        print()
        
        # Use mock auth token
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # The EXACT question from review request
        test_question = "What are fire safety requirements?"
        
        # Test 1: Regular Chat Endpoint (POST /api/chat/ask)
        print("=" * 80)
        print("1️⃣ TESTING POST /api/chat/ask (Regular Chat)")
        print("=" * 80)
        
        regular_data = {
            "question": test_question,
            "session_id": "fire_safety_regular_test"
        }
        
        success, response, status = await self.make_request("POST", "/chat/ask", regular_data, mock_headers)
        
        if success and isinstance(response, dict) and "response" in response:
            response_text = str(response["response"])
            print(f"📝 Response Length: {len(response_text)} characters")
            print(f"📊 Status: {status}")
            print()
            
            # Analyze emoji structure
            analysis = self.analyze_emoji_structure(response_text)
            
            print("🔍 EMOJI ANALYSIS:")
            print(f"   Total Length: {analysis['total_length']} characters")
            print(f"   Emojis Found: {analysis['emojis_found']}")
            print(f"   Sections Found: {analysis['sections_found']}")
            print(f"   Correct Emojis: {analysis['correct_emojis']}")
            print(f"   Wrong Emojis: {analysis['wrong_emojis']}")
            print(f"   Formatting Issues: {analysis['formatting_issues']}")
            print()
            
            # Show first 800 characters for detailed analysis
            print("📄 RESPONSE PREVIEW (first 800 chars):")
            print("-" * 80)
            preview = response_text[:800] + "..." if len(response_text) > 800 else response_text
            print(preview)
            print("-" * 80)
            print()
            
            # Critical checks
            has_brain_emoji = "🧠" in response_text
            has_correct_mentoring = "💡 **Mentoring Insight**" in response_text
            has_technical_emoji = "🔧 **Technical Answer**" in response_text
            has_next_steps = "📋 **Next Steps**" in response_text
            
            print("🚨 CRITICAL CHECKS:")
            print(f"   ❌ Has Brain Emoji (🧠): {has_brain_emoji} {'🚨 WRONG!' if has_brain_emoji else '✅ Good'}")
            print(f"   ✅ Has Correct Mentoring (💡): {has_correct_mentoring} {'✅ Correct' if has_correct_mentoring else '❌ Missing'}")
            print(f"   ✅ Has Technical Emoji (🔧): {has_technical_emoji} {'✅ Present' if has_technical_emoji else '❌ Missing'}")
            print(f"   ✅ Has Next Steps (📋): {has_next_steps} {'✅ Present' if has_next_steps else '❌ Missing'}")
            print()
            
            # Log results
            if has_brain_emoji:
                self.log_test("🚨 CRITICAL ISSUE: Brain Emoji Found", False, 
                            "Regular chat uses 🧠 instead of 💡 for Mentoring Insight")
            else:
                self.log_test("✅ Brain Emoji Check", True, "No brain emoji found")
            
            if has_correct_mentoring:
                self.log_test("✅ Correct Mentoring Emoji", True, "Uses 💡 for Mentoring Insight")
            else:
                self.log_test("❌ Missing Correct Mentoring Emoji", False, "Missing 💡 **Mentoring Insight**")
            
            if has_technical_emoji:
                self.log_test("✅ Technical Answer Emoji", True, "Uses 🔧 for Technical Answer")
            else:
                self.log_test("❌ Missing Technical Emoji", False, "Missing 🔧 **Technical Answer**")
            
            # Overall formatting assessment
            critical_issues = len(analysis['formatting_issues'])
            if critical_issues == 0:
                self.log_test("🎯 Regular Chat Formatting", True, "No critical formatting issues found")
            else:
                self.log_test("🚨 Regular Chat Formatting Issues", False, 
                            f"{critical_issues} formatting issues found: {analysis['formatting_issues']}")
            
        else:
            self.log_test("❌ Regular Chat API Failure", False, f"Status: {status}", response)
            print(f"❌ Failed to get response from regular chat: {status}")
            print(f"Response: {response}")
        
        # Test 2: Enhanced Chat Endpoint (POST /api/chat/ask-enhanced)
        print("=" * 80)
        print("2️⃣ TESTING POST /api/chat/ask-enhanced (Enhanced Chat)")
        print("=" * 80)
        
        enhanced_data = {
            "question": test_question,
            "session_id": "fire_safety_enhanced_test"
        }
        
        success, response, status = await self.make_request("POST", "/chat/ask-enhanced", enhanced_data, mock_headers)
        
        if success and isinstance(response, dict) and "response" in response:
            response_text = str(response["response"])
            print(f"📝 Response Length: {len(response_text)} characters")
            print(f"📊 Status: {status}")
            print()
            
            # Analyze emoji structure
            analysis = self.analyze_emoji_structure(response_text)
            
            print("🔍 EMOJI ANALYSIS:")
            print(f"   Total Length: {analysis['total_length']} characters")
            print(f"   Emojis Found: {analysis['emojis_found']}")
            print(f"   Sections Found: {analysis['sections_found']}")
            print(f"   Correct Emojis: {analysis['correct_emojis']}")
            print(f"   Wrong Emojis: {analysis['wrong_emojis']}")
            print(f"   Formatting Issues: {analysis['formatting_issues']}")
            print()
            
            # Show first 800 characters for detailed analysis
            print("📄 RESPONSE PREVIEW (first 800 chars):")
            print("-" * 80)
            preview = response_text[:800] + "..." if len(response_text) > 800 else response_text
            print(preview)
            print("-" * 80)
            print()
            
            # Critical checks
            has_brain_emoji = "🧠" in response_text
            has_correct_mentoring = "💡 **Mentoring Insight**" in response_text
            has_technical_emoji = "🔧 **Technical Answer**" in response_text
            has_next_steps = "📋 **Next Steps**" in response_text
            
            print("🚨 CRITICAL CHECKS:")
            print(f"   ❌ Has Brain Emoji (🧠): {has_brain_emoji} {'🚨 WRONG!' if has_brain_emoji else '✅ Good'}")
            print(f"   ✅ Has Correct Mentoring (💡): {has_correct_mentoring} {'✅ Correct' if has_correct_mentoring else '❌ Missing'}")
            print(f"   ✅ Has Technical Emoji (🔧): {has_technical_emoji} {'✅ Present' if has_technical_emoji else '❌ Missing'}")
            print(f"   ✅ Has Next Steps (📋): {has_next_steps} {'✅ Present' if has_next_steps else '❌ Missing'}")
            print()
            
            # Log results
            if has_brain_emoji:
                self.log_test("🚨 CRITICAL ISSUE: Enhanced Chat Brain Emoji", False, 
                            "Enhanced chat uses 🧠 instead of 💡 for Mentoring Insight")
            else:
                self.log_test("✅ Enhanced Chat Brain Emoji Check", True, "No brain emoji found")
            
            if has_correct_mentoring:
                self.log_test("✅ Enhanced Chat Correct Mentoring", True, "Uses 💡 for Mentoring Insight")
            else:
                self.log_test("❌ Enhanced Chat Missing Mentoring", False, "Missing 💡 **Mentoring Insight**")
            
            # Overall formatting assessment
            critical_issues = len(analysis['formatting_issues'])
            if critical_issues == 0:
                self.log_test("🎯 Enhanced Chat Formatting", True, "No critical formatting issues found")
            else:
                self.log_test("🚨 Enhanced Chat Formatting Issues", False, 
                            f"{critical_issues} formatting issues found: {analysis['formatting_issues']}")
            
        else:
            self.log_test("❌ Enhanced Chat API Failure", False, f"Status: {status}", response)
            print(f"❌ Failed to get response from enhanced chat: {status}")
            print(f"Response: {response}")
        
        # Test 3: Boost Response Endpoint (POST /api/chat/boost-response)
        print("=" * 80)
        print("3️⃣ TESTING POST /api/chat/boost-response (Boost Response)")
        print("=" * 80)
        
        boost_data = {
            "question": test_question,
            "target_tier": "pro"
        }
        
        success, response, status = await self.make_request("POST", "/chat/boost-response", boost_data, mock_headers)
        
        if success and isinstance(response, dict) and "boosted_response" in response:
            response_text = str(response["boosted_response"])
            print(f"📝 Response Length: {len(response_text)} characters")
            print(f"📊 Status: {status}")
            print()
            
            # Analyze emoji structure
            analysis = self.analyze_emoji_structure(response_text)
            
            print("🔍 EMOJI ANALYSIS:")
            print(f"   Total Length: {analysis['total_length']} characters")
            print(f"   Emojis Found: {analysis['emojis_found']}")
            print(f"   Sections Found: {analysis['sections_found']}")
            print(f"   Correct Emojis: {analysis['correct_emojis']}")
            print(f"   Wrong Emojis: {analysis['wrong_emojis']}")
            print(f"   Formatting Issues: {analysis['formatting_issues']}")
            print()
            
            # Show first 800 characters for detailed analysis
            print("📄 RESPONSE PREVIEW (first 800 chars):")
            print("-" * 80)
            preview = response_text[:800] + "..." if len(response_text) > 800 else response_text
            print(preview)
            print("-" * 80)
            print()
            
            # Critical checks
            has_brain_emoji = "🧠" in response_text
            has_correct_mentoring = "💡 **Mentoring Insight**" in response_text
            has_technical_emoji = "🔧 **Technical Answer**" in response_text
            
            print("🚨 CRITICAL CHECKS:")
            print(f"   ❌ Has Brain Emoji (🧠): {has_brain_emoji} {'🚨 WRONG!' if has_brain_emoji else '✅ Good'}")
            print(f"   ✅ Has Correct Mentoring (💡): {has_correct_mentoring} {'✅ Correct' if has_correct_mentoring else '❌ Missing'}")
            print(f"   ✅ Has Technical Emoji (🔧): {has_technical_emoji} {'✅ Present' if has_technical_emoji else '❌ Missing'}")
            print()
            
            # Log results
            if has_brain_emoji:
                self.log_test("🚨 CRITICAL ISSUE: Boost Response Brain Emoji", False, 
                            "Boost response uses 🧠 instead of 💡 for Mentoring Insight")
            else:
                self.log_test("✅ Boost Response Brain Emoji Check", True, "No brain emoji found")
            
            # Overall formatting assessment
            critical_issues = len(analysis['formatting_issues'])
            if critical_issues == 0:
                self.log_test("🎯 Boost Response Formatting", True, "No critical formatting issues found")
            else:
                self.log_test("🚨 Boost Response Formatting Issues", False, 
                            f"{critical_issues} formatting issues found: {analysis['formatting_issues']}")
            
        elif status == 429:
            error_message = response.get("detail", "Unknown error") if isinstance(response, dict) else str(response)
            self.log_test("⚠️ Boost Response Daily Limit", True, f"429 Daily limit reached: {error_message}")
            print(f"⚠️ Boost response daily limit reached: {error_message}")
        else:
            self.log_test("❌ Boost Response API Failure", False, f"Status: {status}", response)
            print(f"❌ Failed to get boost response: {status}")
            print(f"Response: {response}")
        
        # Final Summary
        print("=" * 80)
        print("🎯 FINAL EMOJI FORMATTING DISASTER INVESTIGATION SUMMARY")
        print("=" * 80)
        
        # Count critical issues
        critical_issues = sum(1 for result in self.test_results if not result["success"] and "CRITICAL ISSUE" in result["test"])
        formatting_issues = sum(1 for result in self.test_results if not result["success"] and "Formatting" in result["test"])
        
        print(f"🚨 Critical Issues Found: {critical_issues}")
        print(f"📝 Formatting Issues Found: {formatting_issues}")
        print()
        
        if critical_issues > 0:
            print("🚨 CRITICAL EMOJI ISSUES CONFIRMED:")
            for result in self.test_results:
                if not result["success"] and "CRITICAL ISSUE" in result["test"]:
                    print(f"   ❌ {result['test']}: {result['details']}")
            print()
            print("🔧 REQUIRED FIXES:")
            print("   1. Replace 🧠 with 💡 for Mentoring Insight sections")
            print("   2. Ensure consistent emoji mapping across all endpoints")
            print("   3. Verify emoji placement and formatting")
            print()
        else:
            print("✅ NO CRITICAL EMOJI ISSUES FOUND")
            print("   All endpoints appear to use correct emoji mapping")
            print()
        
        print("📊 ENDPOINT COMPARISON:")
        regular_success = any(r["success"] for r in self.test_results if "Regular Chat" in r["test"])
        enhanced_success = any(r["success"] for r in self.test_results if "Enhanced Chat" in r["test"])
        boost_success = any(r["success"] for r in self.test_results if "Boost Response" in r["test"])
        
        print(f"   Regular Chat (/api/chat/ask): {'✅ Working' if regular_success else '❌ Issues'}")
        print(f"   Enhanced Chat (/api/chat/ask-enhanced): {'✅ Working' if enhanced_success else '❌ Issues'}")
        print(f"   Boost Response (/api/chat/boost-response): {'✅ Working' if boost_success else '❌ Issues'}")
        print()
        
        print("🎯 CONCLUSION FOR MAIN AGENT:")
        if critical_issues == 0:
            print("✅ Backend emoji formatting appears to be working correctly")
            print("   If users still see formatting issues, check frontend rendering")
        else:
            print("🚨 Backend emoji formatting issues confirmed")
            print("   Main agent needs to fix emoji mapping in AI service")
        
        return self.test_results

async def main():
    """Run the critical emoji formatting disaster investigation"""
    print("🚨 Starting Critical Emoji Formatting Disaster Investigation...")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print()
    
    async with EmojiFormattingTester() as tester:
        results = await tester.test_critical_emoji_formatting_disaster()
        
        # Summary
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r["success"])
        failed_tests = total_tests - passed_tests
        
        print("=" * 80)
        print("📊 FINAL TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        if failed_tests > 0:
            print("❌ FAILED TESTS:")
            for result in results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['details']}")
        else:
            print("✅ ALL TESTS PASSED!")

if __name__ == "__main__":
    asyncio.run(main())