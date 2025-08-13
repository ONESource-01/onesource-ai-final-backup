#!/usr/bin/env python3
"""
Conversation Context System Testing for ONESource-ai
Tests the FIXED conversation context system with unified orchestrator implementation
"""

import asyncio
import aiohttp
import json
import os
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

class ConversationContextTester:
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

    async def test_conversation_context_system_fixed(self):
        """🚨 CRITICAL: Test FIXED Conversation Context System with Unified Orchestrator"""
        print("\n🚨 === TESTING FIXED CONVERSATION CONTEXT SYSTEM ===")
        print("Testing the FIXED conversation context system with the new unified orchestrator implementation")
        print("🎯 CRITICAL TESTS:")
        print("   1. Single Conversation Storage Test")
        print("   2. Multi-turn Context Test - CRITICAL")
        print("   3. Look for new logging format (DISPATCH, AFTER_SAVE, INSTRUMENT logs)")
        print("   4. Database Verification")
        print("🎯 EXPECTED: Conversation context bug should be RESOLVED with unified orchestrator")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Test 1: Single Conversation Storage Test
        print("\n1️⃣ TEST 1 - SINGLE CONVERSATION STORAGE TEST")
        print("Make one API call to POST /api/chat/ask with session_id 'storage_test_123'")
        print("Verify API returns successful response and look for new logging format")
        
        storage_session_id = "storage_test_123"
        storage_question = "Test conversation storage"
        
        print(f"\n🔍 Testing single conversation storage with session_id '{storage_session_id}'")
        storage_data = {
            "question": storage_question,
            "session_id": storage_session_id
        }
        
        storage_success, storage_response, storage_status = await self.make_request("POST", "/chat/ask", storage_data, mock_headers)
        
        if storage_success and isinstance(storage_response, dict):
            if "text" in storage_response:
                response_content = storage_response.get("text", "")
                self.log_test("✅ Test 1 - Single Conversation Storage", True, 
                            f"API returned successful response ({len(str(response_content))} chars)")
                print(f"   ✅ Response received: {len(str(response_content))} characters")
                print(f"   📄 Response preview: {str(response_content)[:200]}...")
                
                # Look for DISPATCH and AFTER_SAVE logs in response
                if "DISPATCH:" in str(storage_response) or "AFTER_SAVE:" in str(storage_response):
                    self.log_test("✅ Test 1 - New Logging Format Found", True, 
                                "Found DISPATCH or AFTER_SAVE logs in response")
                else:
                    print("   📋 Note: DISPATCH/AFTER_SAVE logs not visible in response (check server logs)")
            else:
                self.log_test("❌ Test 1 - Single Conversation Storage", False, 
                            "Response missing expected fields", storage_response)
        else:
            self.log_test("❌ Test 1 - Single Conversation Storage", False, 
                        f"API call failed with status {storage_status}", storage_response)
        
        # Test 2: Multi-turn Context Test - CRITICAL
        print("\n2️⃣ TEST 2 - MULTI-TURN CONTEXT TEST - CRITICAL")
        print("First call: 'Tell me about acoustic lagging requirements' with session_id 'context_test_456'")
        print("Wait 2 seconds for processing")
        print("Second call: 'when do I need to install it?' with SAME session_id")
        print("Check if second response understands 'it' refers to acoustic lagging")
        
        context_session_id = "context_test_456"
        
        # First question
        print(f"\n🔍 Step 1: Asking about acoustic lagging with session_id '{context_session_id}'")
        first_question = "Tell me about acoustic lagging requirements"
        first_data = {
            "question": first_question,
            "session_id": context_session_id
        }
        
        first_success, first_response, first_status = await self.make_request("POST", "/chat/ask", first_data, mock_headers)
        
        if first_success and isinstance(first_response, dict):
            response_content = first_response.get("text") or first_response.get("response", "")
            first_response_content = str(response_content)
            print(f"   ✅ First response received: {len(first_response_content)} characters")
            print(f"   📄 First response preview: {first_response_content[:200]}...")
            
            # Check if response mentions acoustic lagging
            has_acoustic_content = any(term in first_response_content.lower() for term in ['acoustic', 'lagging', 'sound', 'noise'])
            if has_acoustic_content:
                self.log_test("✅ Test 2 - First Question (Acoustic Lagging)", True, "Response contains acoustic lagging content")
            else:
                self.log_test("❌ Test 2 - First Question (Acoustic Lagging)", False, "Response missing acoustic lagging content")
            
            # Wait 2 seconds for processing as specified in review request
            print("   ⏳ Waiting 2 seconds for processing...")
            await asyncio.sleep(2)
            
            # Follow-up question with contextual reference
            print(f"\n🔍 Step 2: Follow-up question with SAME session_id '{context_session_id}'")
            followup_question = "when do I need to install it?"
            followup_data = {
                "question": followup_question,
                "session_id": context_session_id  # SAME session_id
            }
            
            followup_success, followup_response, followup_status = await self.make_request("POST", "/chat/ask", followup_data, mock_headers)
            
            if followup_success and isinstance(followup_response, dict):
                followup_content = followup_response.get("text") or followup_response.get("response", "")
                followup_response_content = str(followup_content)
                print(f"   ✅ Follow-up response received: {len(followup_response_content)} characters")
                print(f"   📄 Follow-up response preview: {followup_response_content[:300]}...")
                
                # CRITICAL CHECK: Should understand "it" refers to acoustic lagging
                context_indicators = [
                    "acoustic" in followup_response_content.lower(),
                    "lagging" in followup_response_content.lower(),
                    "previous" in followup_response_content.lower(),
                    "discussion" in followup_response_content.lower(),
                    "based on our" in followup_response_content.lower()
                ]
                
                understands_context = any(context_indicators)
                
                print(f"   🧐 Context understanding indicators:")
                print(f"      - Contains 'acoustic': {'acoustic' in followup_response_content.lower()}")
                print(f"      - Contains 'lagging': {'lagging' in followup_response_content.lower()}")
                print(f"      - Contains 'previous': {'previous' in followup_response_content.lower()}")
                print(f"      - Contains 'discussion': {'discussion' in followup_response_content.lower()}")
                print(f"      - Contains 'based on our': {'based on our' in followup_response_content.lower()}")
                
                if understands_context:
                    self.log_test("✅ Test 2 - Context Understanding (Acoustic Lagging)", True, 
                                "Follow-up question understands 'it' refers to acoustic lagging from previous context")
                else:
                    self.log_test("❌ Test 2 - Context Understanding (Acoustic Lagging)", False, 
                                "Follow-up question does NOT understand context - asks for clarification instead")
                
                # Check for expected phrase
                expected_phrase = "based on our previous discussion about acoustic lagging"
                if expected_phrase.lower() in followup_response_content.lower():
                    self.log_test("✅ Test 2 - Expected Context Phrase", True, 
                                "Response contains expected phrase about previous discussion")
                else:
                    self.log_test("❌ Test 2 - Expected Context Phrase", False, 
                                "Response missing expected phrase about previous discussion")
                
            else:
                self.log_test("❌ Test 2 - Follow-up Response", False, f"Failed to get follow-up response: {followup_status}")
        else:
            self.log_test("❌ Test 2 - First Response", False, f"Failed to get first response: {first_status}")
        
        # Test 3: Look for new logging format
        print("\n3️⃣ TEST 3 - NEW LOGGING FORMAT VERIFICATION")
        print("Look for DISPATCH, AFTER_SAVE, and INSTRUMENT logs in system")
        print("Testing with a new session to capture fresh logs")
        
        logging_session_id = "logging_test_789"
        logging_question = "What are fire safety requirements?"
        
        print(f"\n🔍 Testing logging format with session_id '{logging_session_id}'")
        logging_data = {
            "question": logging_question,
            "session_id": logging_session_id
        }
        
        logging_success, logging_response, logging_status = await self.make_request("POST", "/chat/ask", logging_data, mock_headers)
        
        if logging_success:
            self.log_test("✅ Test 3 - New Logging Format Test", True, 
                        "API call successful - check server logs for DISPATCH, AFTER_SAVE, INSTRUMENT messages")
            print("   ✅ API call successful")
            print("   📋 Expected log patterns:")
            print("      - DISPATCH: logs showing msg_count_before")
            print("      - AFTER_SAVE: logs showing msg_count_after and history_persisted=True")
            print("      - INSTRUMENT: logs showing conversation context details")
        else:
            self.log_test("❌ Test 3 - New Logging Format Test", False, 
                        f"API call failed with status {logging_status}")
        
        # Test 4: Database Verification
        print("\n4️⃣ TEST 4 - DATABASE VERIFICATION")
        print("Check if conversations are being stored in MongoDB conversations collection")
        print("Verify conversation format matches expected structure")
        
        # Test conversation history retrieval
        print(f"\n🔍 Testing conversation history retrieval")
        history_success, history_response, history_status = await self.make_request("GET", "/chat/history?limit=10", headers=mock_headers)
        
        if history_success and isinstance(history_response, dict):
            if "sessions" in history_response:
                sessions = history_response["sessions"]
                print(f"   ✅ History retrieval successful: {len(sessions)} sessions found")
                
                # Check if our test sessions are present
                test_sessions = [storage_session_id, context_session_id, logging_session_id]
                found_sessions = []
                
                for session in sessions:
                    session_id = session.get("session_id", "")
                    if session_id in test_sessions:
                        found_sessions.append(session_id)
                        print(f"   📋 Found test session: {session_id}")
                
                if len(found_sessions) >= 2:  # At least 2 of our test sessions
                    self.log_test("✅ Test 4 - Database Storage", True, 
                                f"Conversations properly stored in database - found {len(found_sessions)} test sessions")
                else:
                    self.log_test("❌ Test 4 - Database Storage", False, 
                                f"Conversations not properly stored - only found {len(found_sessions)} test sessions")
                
                # Test specific session retrieval
                if found_sessions:
                    test_session_id = found_sessions[0]
                    print(f"\n🔍 Testing specific session retrieval for session: {test_session_id}")
                    
                    session_success, session_response, session_status = await self.make_request(
                        "GET", f"/chat/session/{test_session_id}", headers=mock_headers)
                    
                    if session_success and isinstance(session_response, dict):
                        if "messages" in session_response:
                            messages = session_response["messages"]
                            print(f"   ✅ Session retrieval successful: {len(messages)} messages found")
                            
                            # Check message structure
                            if messages and len(messages) > 0:
                                first_message = messages[0]
                                required_fields = ["message_id", "type", "content", "timestamp"]
                                has_required_fields = all(field in first_message for field in required_fields)
                                
                                if has_required_fields:
                                    self.log_test("✅ Test 4 - Session Message Structure", True, 
                                                "Session messages have proper structure with required fields")
                                else:
                                    self.log_test("❌ Test 4 - Session Message Structure", False, 
                                                "Session messages missing required fields")
                            else:
                                self.log_test("⚠️ Test 4 - Session Messages", False, 
                                            "Session exists but contains no messages")
                        else:
                            self.log_test("❌ Test 4 - Session Response Format", False, 
                                        "Session response missing 'messages' field")
                    else:
                        self.log_test("❌ Test 4 - Session Retrieval", False, 
                                    f"Failed to retrieve specific session: {session_status}")
                
            else:
                self.log_test("❌ Test 4 - History Response Format", False, 
                            "History response missing 'sessions' field")
        else:
            self.log_test("❌ Test 4 - Database Verification", False, 
                        f"Failed to retrieve conversation history: {history_status}")
        
        # Test Summary
        print("\n🎯 CONVERSATION CONTEXT SYSTEM TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"📊 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        print("\n📋 Test Results:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"   {status} {result['test']}")
            if result["details"]:
                print(f"      {result['details']}")
        
        # Critical assessment
        context_tests = [r for r in self.test_results if "Context Understanding" in r["test"]]
        context_passed = len([r for r in context_tests if r["success"]])
        
        print(f"\n🎯 CRITICAL ASSESSMENT:")
        if context_passed > 0:
            print("✅ CONVERSATION CONTEXT BUG APPEARS TO BE FIXED!")
            print("   The unified orchestrator implementation is working correctly")
            print("   Follow-up questions understand previous context")
        else:
            print("❌ CONVERSATION CONTEXT BUG STILL EXISTS")
            print("   The unified orchestrator needs further investigation")
            print("   Follow-up questions do not understand previous context")
        
        return passed_tests, total_tests

async def main():
    """Run conversation context tests"""
    print("🚀 Starting Conversation Context System Testing")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print(f"🔗 API Base: {API_BASE}")
    
    async with ConversationContextTester() as tester:
        passed, total = await tester.test_conversation_context_system_fixed()
        
        print(f"\n🏁 FINAL RESULT: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED - Conversation context system is working correctly!")
        elif passed >= total * 0.8:
            print("⚠️ MOSTLY WORKING - Some minor issues detected")
        else:
            print("❌ SIGNIFICANT ISSUES - Conversation context system needs attention")

if __name__ == "__main__":
    asyncio.run(main())