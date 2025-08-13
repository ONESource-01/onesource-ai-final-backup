#!/usr/bin/env python3
"""
Debug Conversation Context Testing for ONESource-ai
Focused test for the conversation context issue with debug logging enabled
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

class DebugContextTester:
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

    async def test_acoustic_lagging_context_flow_with_debug(self):
        """Test the exact acoustic lagging context flow with debug logging"""
        print("\n🚨 === DEBUG CONVERSATION CONTEXT TESTING ===")
        print("Testing the EXACT acoustic lagging context flow from review request")
        print("🎯 FOCUS: Look for debug output in backend responses")
        print("🔍 Expected debug messages:")
        print("   - 'DEBUG: Pre-saved conversation stub'")
        print("   - 'DEBUG: Session X - Found Y conversations'")
        print("   - 'DEBUG: Extracted topics'")
        print("   - 'DEBUG: Context hint generated'")
        print("   - 'DEBUG: Updated conversation response'")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        session_id = "debug_context_test"  # Exact session_id from review request
        
        print(f"\n🔍 Using session_id: '{session_id}' as specified in review request")
        
        # Step 1: First question about acoustic lagging
        print("\n1️⃣ STEP 1: First question about acoustic lagging")
        first_question = "Tell me about acoustic lagging requirements"
        print(f"Question: '{first_question}'")
        print(f"Session ID: '{session_id}'")
        
        first_data = {
            "question": first_question,
            "session_id": session_id
        }
        
        print("\n📡 Making request to POST /api/chat/ask...")
        first_success, first_response, first_status = await self.make_request("POST", "/chat/ask", first_data, mock_headers)
        
        if first_success and isinstance(first_response, dict):
            print(f"✅ First request successful (Status: {first_status})")
            
            # Extract response content
            if "response" in first_response:
                first_response_content = str(first_response["response"])
                print(f"📄 Response length: {len(first_response_content)} characters")
                
                # Look for debug messages in the response
                debug_messages = []
                debug_patterns = [
                    "DEBUG: Pre-saved conversation stub",
                    "DEBUG: Session",
                    "DEBUG: Extracted topics",
                    "DEBUG: Context hint generated", 
                    "DEBUG: Updated conversation response"
                ]
                
                print(f"\n🔍 Searching for debug messages in response...")
                for pattern in debug_patterns:
                    if pattern in first_response_content:
                        debug_messages.append(pattern)
                        print(f"   ✅ Found: '{pattern}'")
                    else:
                        print(f"   ❌ Not found: '{pattern}'")
                
                # Check for acoustic lagging content
                acoustic_terms = ["acoustic", "lagging", "sound", "noise", "insulation"]
                found_acoustic_terms = [term for term in acoustic_terms if term.lower() in first_response_content.lower()]
                
                print(f"\n📋 Acoustic content analysis:")
                print(f"   Found terms: {found_acoustic_terms}")
                print(f"   Response preview: {first_response_content[:300]}...")
                
                if found_acoustic_terms:
                    self.log_test("Step 1 - Acoustic Lagging Content", True, f"Response contains acoustic content: {', '.join(found_acoustic_terms)}")
                else:
                    self.log_test("Step 1 - Acoustic Lagging Content", False, "Response missing acoustic lagging content")
                
                if debug_messages:
                    self.log_test("Step 1 - Debug Messages Found", True, f"Found {len(debug_messages)} debug messages: {', '.join(debug_messages)}")
                else:
                    self.log_test("Step 1 - Debug Messages Found", False, "No debug messages found in response")
                
                # Check full response structure
                print(f"\n📊 Full response structure:")
                for key, value in first_response.items():
                    if key != "response":
                        print(f"   {key}: {type(value)} - {str(value)[:100]}...")
                
            else:
                print("❌ Response missing 'response' field")
                self.log_test("Step 1 - Response Structure", False, "Missing 'response' field in API response")
                
        else:
            print(f"❌ First request failed (Status: {first_status})")
            print(f"Response: {first_response}")
            self.log_test("Step 1 - API Request", False, f"Failed with status {first_status}")
            return
        
        # Wait to ensure conversation is processed
        print("\n⏳ Waiting 2 seconds for conversation processing...")
        await asyncio.sleep(2)
        
        # Step 2: Follow-up question with contextual reference
        print("\n2️⃣ STEP 2: Follow-up question with contextual reference")
        followup_question = "when do I need to install it?"
        print(f"Question: '{followup_question}'")
        print(f"Session ID: '{session_id}' (SAME as first question)")
        print("🎯 CRITICAL: 'it' should refer to acoustic lagging from previous context")
        
        followup_data = {
            "question": followup_question,
            "session_id": session_id  # SAME session_id
        }
        
        print("\n📡 Making request to POST /api/chat/ask...")
        followup_success, followup_response, followup_status = await self.make_request("POST", "/chat/ask", followup_data, mock_headers)
        
        if followup_success and isinstance(followup_response, dict):
            print(f"✅ Follow-up request successful (Status: {followup_status})")
            
            # Extract response content
            if "response" in followup_response:
                followup_response_content = str(followup_response["response"])
                print(f"📄 Response length: {len(followup_response_content)} characters")
                
                # Look for debug messages in the follow-up response
                debug_messages_followup = []
                debug_patterns = [
                    "DEBUG: Pre-saved conversation stub",
                    "DEBUG: Session",
                    "DEBUG: Found",
                    "DEBUG: Extracted topics",
                    "DEBUG: Context hint generated",
                    "DEBUG: Updated conversation response"
                ]
                
                print(f"\n🔍 Searching for debug messages in follow-up response...")
                for pattern in debug_patterns:
                    if pattern in followup_response_content:
                        debug_messages_followup.append(pattern)
                        print(f"   ✅ Found: '{pattern}'")
                        
                        # Extract the full debug line for analysis
                        lines = followup_response_content.split('\n')
                        for line in lines:
                            if pattern in line:
                                print(f"      Full line: {line.strip()}")
                    else:
                        print(f"   ❌ Not found: '{pattern}'")
                
                # Check for context understanding
                context_indicators = [
                    "acoustic" in followup_response_content.lower(),
                    "lagging" in followup_response_content.lower(),
                    "previous" in followup_response_content.lower(),
                    "discussion" in followup_response_content.lower(),
                    "based on" in followup_response_content.lower(),
                    "referring to" in followup_response_content.lower()
                ]
                
                print(f"\n🧐 Context understanding analysis:")
                print(f"   Contains 'acoustic': {'acoustic' in followup_response_content.lower()}")
                print(f"   Contains 'lagging': {'lagging' in followup_response_content.lower()}")
                print(f"   Contains 'previous': {'previous' in followup_response_content.lower()}")
                print(f"   Contains 'discussion': {'discussion' in followup_response_content.lower()}")
                print(f"   Contains 'based on': {'based on' in followup_response_content.lower()}")
                print(f"   Contains 'referring to': {'referring to' in followup_response_content.lower()}")
                
                understands_context = any(context_indicators)
                
                print(f"\n📄 Follow-up response preview:")
                print(f"{followup_response_content[:500]}...")
                
                if understands_context:
                    self.log_test("Step 2 - Context Understanding", True, "Follow-up question understands 'it' refers to acoustic lagging")
                else:
                    self.log_test("Step 2 - Context Understanding", False, "Follow-up question does NOT understand context - likely asks for clarification")
                
                if debug_messages_followup:
                    self.log_test("Step 2 - Debug Messages Found", True, f"Found {len(debug_messages_followup)} debug messages: {', '.join(debug_messages_followup)}")
                else:
                    self.log_test("Step 2 - Debug Messages Found", False, "No debug messages found in follow-up response")
                
                # Check for specific debug patterns about conversation retrieval
                conversation_debug_patterns = [
                    "Found 1 conversations",
                    "Found 2 conversations", 
                    "Found 0 conversations",
                    "Session debug_context_test - Found"
                ]
                
                found_conversation_debug = []
                for pattern in conversation_debug_patterns:
                    if pattern in followup_response_content:
                        found_conversation_debug.append(pattern)
                        print(f"   🔍 Conversation debug: {pattern}")
                
                if found_conversation_debug:
                    self.log_test("Step 2 - Conversation Retrieval Debug", True, f"Found conversation retrieval debug: {', '.join(found_conversation_debug)}")
                else:
                    self.log_test("Step 2 - Conversation Retrieval Debug", False, "No conversation retrieval debug messages found")
                
                # Check full response structure
                print(f"\n📊 Full follow-up response structure:")
                for key, value in followup_response.items():
                    if key != "response":
                        print(f"   {key}: {type(value)} - {str(value)[:100]}...")
                
            else:
                print("❌ Follow-up response missing 'response' field")
                self.log_test("Step 2 - Response Structure", False, "Missing 'response' field in follow-up API response")
                
        else:
            print(f"❌ Follow-up request failed (Status: {followup_status})")
            print(f"Response: {followup_response}")
            self.log_test("Step 2 - API Request", False, f"Failed with status {followup_status}")
        
        # Step 3: Check conversation history to verify storage
        print("\n3️⃣ STEP 3: Verify conversation storage in database")
        print("Checking if conversations are properly stored and retrievable")
        
        print("\n📡 Making request to GET /api/chat/history...")
        history_success, history_response, history_status = await self.make_request("GET", "/chat/history?limit=10", headers=mock_headers)
        
        if history_success and isinstance(history_response, dict):
            print(f"✅ History request successful (Status: {history_status})")
            
            if "sessions" in history_response:
                sessions = history_response["sessions"]
                print(f"📋 Found {len(sessions)} total sessions")
                
                # Look for our test session
                test_session_found = False
                for session in sessions:
                    if session.get("session_id") == session_id:
                        test_session_found = True
                        print(f"✅ Found test session: {session_id}")
                        print(f"   Session data: {session}")
                        break
                
                if test_session_found:
                    self.log_test("Step 3 - Session Storage", True, f"Test session '{session_id}' found in database")
                    
                    # Get specific session details
                    print(f"\n📡 Making request to GET /api/chat/session/{session_id}...")
                    session_success, session_response, session_status = await self.make_request(
                        "GET", f"/chat/session/{session_id}", headers=mock_headers)
                    
                    if session_success and isinstance(session_response, dict):
                        if "messages" in session_response:
                            messages = session_response["messages"]
                            print(f"✅ Session details retrieved: {len(messages)} messages")
                            
                            for i, message in enumerate(messages):
                                print(f"   Message {i+1}: {message.get('type', 'unknown')} - {message.get('content', '')[:100]}...")
                            
                            if len(messages) >= 2:
                                self.log_test("Step 3 - Message Storage", True, f"Found {len(messages)} messages in session")
                            else:
                                self.log_test("Step 3 - Message Storage", False, f"Expected 2+ messages, found {len(messages)}")
                        else:
                            self.log_test("Step 3 - Session Details", False, "Session response missing 'messages' field")
                    else:
                        self.log_test("Step 3 - Session Details", False, f"Failed to get session details: {session_status}")
                        
                else:
                    self.log_test("Step 3 - Session Storage", False, f"Test session '{session_id}' NOT found in database")
                    print(f"   Available sessions: {[s.get('session_id', 'unknown') for s in sessions]}")
                    
            else:
                self.log_test("Step 3 - History Structure", False, "History response missing 'sessions' field")
                
        else:
            print(f"❌ History request failed (Status: {history_status})")
            self.log_test("Step 3 - History Request", False, f"Failed with status {history_status}")

    async def run_debug_tests(self):
        """Run all debug context tests"""
        print("🚨 STARTING DEBUG CONVERSATION CONTEXT TESTING")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        
        await self.test_acoustic_lagging_context_flow_with_debug()
        
        # Summary
        print("\n" + "="*80)
        print("🎯 DEBUG CONTEXT TESTING SUMMARY")
        print("="*80)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        print("\n📋 Test Results:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
            if result["details"]:
                print(f"   {result['details']}")
        
        print("\n🎯 KEY FINDINGS FOR REVIEW REQUEST:")
        
        # Analyze results for key findings
        context_understanding = any("Context Understanding" in r["test"] and r["success"] for r in self.test_results)
        debug_messages_found = any("Debug Messages Found" in r["test"] and r["success"] for r in self.test_results)
        conversation_storage = any("Session Storage" in r["test"] and r["success"] for r in self.test_results)
        
        print(f"   🧐 Context Understanding: {'✅ WORKING' if context_understanding else '❌ BROKEN'}")
        print(f"   🔍 Debug Messages: {'✅ FOUND' if debug_messages_found else '❌ NOT FOUND'}")
        print(f"   💾 Conversation Storage: {'✅ WORKING' if conversation_storage else '❌ BROKEN'}")
        
        if not context_understanding:
            print("\n🚨 CRITICAL ISSUE CONFIRMED:")
            print("   The conversation context system is NOT working properly")
            print("   Follow-up questions do not understand previous context")
            print("   'it' and 'this' references are not being resolved")
        
        if not debug_messages_found:
            print("\n⚠️ DEBUG LOGGING ISSUE:")
            print("   Expected debug messages are not appearing in responses")
            print("   This suggests debug logging may not be enabled or working")
        
        if not conversation_storage:
            print("\n🚨 STORAGE ISSUE:")
            print("   Conversations are not being properly stored in the database")
            print("   This would prevent context retrieval for follow-up questions")

async def main():
    """Main test runner"""
    async with DebugContextTester() as tester:
        await tester.run_debug_tests()

if __name__ == "__main__":
    asyncio.run(main())