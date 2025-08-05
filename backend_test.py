#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for ONESource-ai
Tests all backend endpoints including authentication, user management, AI chat, and payments
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

class BackendTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.auth_token = None
        
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
    
    async def test_basic_api_health(self):
        """Test basic API health endpoint"""
        print("\n=== Testing Basic API Health ===")
        
        success, data, status = await self.make_request("GET", "/")
        
        if success and isinstance(data, dict):
            if "message" in data and "version" in data:
                self.log_test("API Health Check", True, f"API running version {data.get('version')}")
            else:
                self.log_test("API Health Check", False, "Missing required fields in response", data)
        else:
            self.log_test("API Health Check", False, f"Status: {status}", data)
    
    async def test_user_management_unauthenticated(self):
        """Test user management endpoints without authentication"""
        print("\n=== Testing User Management (Unauthenticated) ===")
        
        # Test onboarding without auth - should fail
        onboarding_data = {
            "name": "John Smith",
            "profession": "Structural Engineer", 
            "sector": "Commercial Construction",
            "use_case": "Design verification and compliance checking",
            "marketing_consent": True
        }
        
        success, data, status = await self.make_request("POST", "/user/onboarding", onboarding_data)
        
        if not success and status == 401:
            self.log_test("Onboarding without auth (should fail)", True, "Correctly rejected unauthenticated request")
        else:
            self.log_test("Onboarding without auth (should fail)", False, f"Expected 401, got {status}", data)
        
        # Test profile without auth - should fail
        success, data, status = await self.make_request("GET", "/user/profile")
        
        if not success and status == 401:
            self.log_test("Profile without auth (should fail)", True, "Correctly rejected unauthenticated request")
        else:
            self.log_test("Profile without auth (should fail)", False, f"Expected 401, got {status}", data)
        
        # Test subscription without auth - should fail
        success, data, status = await self.make_request("GET", "/user/subscription")
        
        if not success and status == 401:
            self.log_test("Subscription without auth (should fail)", True, "Correctly rejected unauthenticated request")
        else:
            self.log_test("Subscription without auth (should fail)", False, f"Expected 401, got {status}", data)
    
    async def test_user_management_with_mock_auth(self):
        """Test user management with mock authentication"""
        print("\n=== Testing User Management (With Mock Auth) ===")
        
        # Use mock auth token for development
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Test onboarding with auth
        onboarding_data = {
            "name": "Sarah Johnson",
            "profession": "HVAC Engineer",
            "sector": "Healthcare Facilities", 
            "use_case": "System design and energy efficiency optimization",
            "marketing_consent": False
        }
        
        success, data, status = await self.make_request("POST", "/user/onboarding", onboarding_data, mock_headers)
        
        if success and isinstance(data, dict):
            if "message" in data and "profile" in data:
                self.log_test("User Onboarding", True, "Successfully completed onboarding")
            else:
                self.log_test("User Onboarding", False, "Missing required fields in response", data)
        else:
            self.log_test("User Onboarding", False, f"Status: {status}", data)
        
        # Test profile retrieval
        success, data, status = await self.make_request("GET", "/user/profile", headers=mock_headers)
        
        if success and isinstance(data, dict):
            required_fields = ["uid", "subscription_tier", "trial_questions_used"]
            if all(field in data for field in required_fields):
                self.log_test("User Profile Retrieval", True, f"Profile retrieved for user {data.get('uid', 'unknown')}")
            else:
                self.log_test("User Profile Retrieval", False, "Missing required profile fields", data)
        else:
            self.log_test("User Profile Retrieval", False, f"Status: {status}", data)
        
        # Test subscription status
        success, data, status = await self.make_request("GET", "/user/subscription", headers=mock_headers)
        
        if success and isinstance(data, dict):
            required_fields = ["subscription_tier", "trial_questions_used", "subscription_active"]
            if all(field in data for field in required_fields):
                self.log_test("Subscription Status Check", True, f"Tier: {data.get('subscription_tier')}, Trial used: {data.get('trial_questions_used')}")
            else:
                self.log_test("Subscription Status Check", False, "Missing required subscription fields", data)
        else:
            self.log_test("Subscription Status Check", False, f"Status: {status}", data)
    
    async def test_ai_chat_system(self):
        """Test AI chat system"""
        print("\n=== Testing AI Chat System ===")
        
        # Test construction-related question without auth (anonymous)
        construction_question = {
            "question": "What are the minimum pipe sizing requirements for hydraulic systems in commercial buildings according to AS/NZS 3500?",
            "session_id": "test_session_123"
        }
        
        success, data, status = await self.make_request("POST", "/chat/ask", construction_question)
        
        if success and isinstance(data, dict):
            if "response" in data and "session_id" in data:
                response_content = data["response"]
                if isinstance(response_content, dict) and "technical" in response_content:
                    self.log_test("AI Chat (Anonymous Construction Question)", True, "Received dual-layer response format")
                else:
                    self.log_test("AI Chat (Anonymous Construction Question)", True, "Received response (single format)")
                
                # Check for trial info
                if "trial_info" in data:
                    self.log_test("Trial Info for Anonymous User", True, f"Message: {data['trial_info'].get('message', 'N/A')}")
            else:
                self.log_test("AI Chat (Anonymous Construction Question)", False, "Missing required response fields", data)
        else:
            self.log_test("AI Chat (Anonymous Construction Question)", False, f"Status: {status}", data)
        
        # Test non-construction question (should be rejected)
        non_construction_question = {
            "question": "What's the weather like today?",
            "session_id": "test_session_456"
        }
        
        success, data, status = await self.make_request("POST", "/chat/ask", non_construction_question)
        
        if not success and status == 400:
            self.log_test("Non-construction Question Rejection", True, "Correctly rejected non-construction question")
        else:
            self.log_test("Non-construction Question Rejection", False, f"Expected 400, got {status}", data)
        
        # Test with authenticated user
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        auth_construction_question = {
            "question": "How do I calculate the required fire rating for structural steel in a 5-story office building?",
            "session_id": "auth_session_789"
        }
        
        success, data, status = await self.make_request("POST", "/chat/ask", auth_construction_question, mock_headers)
        
        if success and isinstance(data, dict):
            if "response" in data:
                self.log_test("AI Chat (Authenticated User)", True, "Successfully processed authenticated question")
                
                # Check trial info for authenticated user
                if "trial_info" in data:
                    trial_info = data["trial_info"]
                    if "remaining_questions" in trial_info:
                        self.log_test("Trial Tracking", True, f"Remaining: {trial_info['remaining_questions']}")
            else:
                self.log_test("AI Chat (Authenticated User)", False, "Missing response field", data)
        else:
            self.log_test("AI Chat (Authenticated User)", False, f"Status: {status}", data)
    
    async def test_payment_system(self):
        """Test payment system endpoints"""
        print("\n=== Testing Payment System ===")
        
        # Test pricing packages retrieval
        success, data, status = await self.make_request("GET", "/pricing")
        
        if success and isinstance(data, dict):
            if "packages" in data and isinstance(data["packages"], dict):
                packages = data["packages"]
                expected_packages = ["pro", "consultant", "day_pass"]
                if all(pkg in packages for pkg in expected_packages):
                    self.log_test("Pricing Packages Retrieval", True, f"Found {len(packages)} packages")
                else:
                    self.log_test("Pricing Packages Retrieval", False, "Missing expected packages", data)
            else:
                self.log_test("Pricing Packages Retrieval", False, "Invalid packages format", data)
        else:
            self.log_test("Pricing Packages Retrieval", False, f"Status: {status}", data)
        
        # Test checkout session creation (anonymous)
        checkout_data = {
            "package_id": "pro",
            "origin_url": "https://test.example.com"
        }
        
        success, data, status = await self.make_request("POST", "/payment/checkout", checkout_data)
        
        if success and isinstance(data, dict):
            if "checkout_url" in data and "session_id" in data:
                session_id = data["session_id"]
                self.log_test("Checkout Session Creation (Anonymous)", True, f"Session ID: {session_id}")
                
                # Test payment status check
                success_status, status_data, status_code = await self.make_request("GET", f"/payment/status/{session_id}")
                
                if success_status and isinstance(status_data, dict):
                    if "status" in status_data and "payment_status" in status_data:
                        self.log_test("Payment Status Check", True, f"Status: {status_data['status']}, Payment: {status_data['payment_status']}")
                    else:
                        self.log_test("Payment Status Check", False, "Missing status fields", status_data)
                else:
                    self.log_test("Payment Status Check", False, f"Status: {status_code}", status_data)
            else:
                self.log_test("Checkout Session Creation (Anonymous)", False, "Missing required checkout fields", data)
        else:
            self.log_test("Checkout Session Creation (Anonymous)", False, f"Status: {status}", data)
        
        # Test checkout with authenticated user
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        auth_checkout_data = {
            "package_id": "consultant",
            "origin_url": "https://test.example.com"
        }
        
        success, data, status = await self.make_request("POST", "/payment/checkout", auth_checkout_data, mock_headers)
        
        if success and isinstance(data, dict):
            if "checkout_url" in data and "session_id" in data:
                self.log_test("Checkout Session Creation (Authenticated)", True, f"Session ID: {data['session_id']}")
            else:
                self.log_test("Checkout Session Creation (Authenticated)", False, "Missing required checkout fields", data)
        else:
            self.log_test("Checkout Session Creation (Authenticated)", False, f"Status: {status}", data)
        
        # Test invalid package
        invalid_checkout_data = {
            "package_id": "invalid_package",
            "origin_url": "https://test.example.com"
        }
        
        success, data, status = await self.make_request("POST", "/payment/checkout", invalid_checkout_data)
        
        if not success and status == 400:
            self.log_test("Invalid Package Rejection", True, "Correctly rejected invalid package")
        else:
            self.log_test("Invalid Package Rejection", False, f"Expected 400, got {status}", data)
    
    async def test_webhook_endpoint(self):
        """Test Stripe webhook endpoint"""
        print("\n=== Testing Webhook Endpoint ===")
        
        # Test webhook without signature (should fail)
        webhook_data = {"test": "webhook_data"}
        
        success, data, status = await self.make_request("POST", "/webhook/stripe", webhook_data)
        
        if not success and status == 400:
            self.log_test("Webhook without Signature", True, "Correctly rejected webhook without signature")
        else:
            self.log_test("Webhook without Signature", False, f"Expected 400, got {status}", data)
        
        # Test webhook with mock signature (will still fail but for different reason)
        mock_headers = {"stripe-signature": "mock_signature"}
        
        success, data, status = await self.make_request("POST", "/webhook/stripe", webhook_data, mock_headers)
        
        # This should fail due to invalid signature, but at least it gets past the initial check
        if not success:
            self.log_test("Webhook with Mock Signature", True, "Webhook endpoint accessible and validates signature")
        else:
            self.log_test("Webhook with Mock Signature", False, "Unexpected success with mock signature", data)
    
    async def test_error_handling(self):
        """Test error handling for various scenarios"""
        print("\n=== Testing Error Handling ===")
        
        # Test non-existent endpoint
        success, data, status = await self.make_request("GET", "/nonexistent")
        
        if not success and status == 404:
            self.log_test("Non-existent Endpoint", True, "Correctly returned 404 for non-existent endpoint")
        else:
            self.log_test("Non-existent Endpoint", False, f"Expected 404, got {status}", data)
        
        # Test malformed JSON
        try:
            url = f"{API_BASE}/user/onboarding"
            headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer mock_dev_token"
            }
            
            async with self.session.post(url, data="invalid json", headers=headers) as response:
                if response.status == 422:  # FastAPI returns 422 for validation errors
                    self.log_test("Malformed JSON Handling", True, "Correctly handled malformed JSON")
                else:
                    self.log_test("Malformed JSON Handling", False, f"Expected 422, got {response.status}")
        except Exception as e:
            self.log_test("Malformed JSON Handling", False, f"Exception: {str(e)}")
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("BACKEND API TEST SUMMARY")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\nFailed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        print(f"\nBackend URL tested: {BACKEND_URL}")
        print(f"API Base URL: {API_BASE}")
        
        return passed_tests, failed_tests

async def main():
    """Run all backend tests"""
    print("Starting ONESource-ai Backend API Tests")
    print(f"Testing backend at: {BACKEND_URL}")
    print("="*60)
    
    async with BackendTester() as tester:
        # Run all test suites
        await tester.test_basic_api_health()
        await tester.test_user_management_unauthenticated()
        await tester.test_user_management_with_mock_auth()
        await tester.test_ai_chat_system()
        await tester.test_payment_system()
        await tester.test_webhook_endpoint()
        await tester.test_error_handling()
        
        # Print summary
        passed, failed = tester.print_summary()
        
        # Return appropriate exit code
        return 0 if failed == 0 else 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\nTests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        sys.exit(1)