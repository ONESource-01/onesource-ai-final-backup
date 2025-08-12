#!/usr/bin/env python3
"""
Critical Subscription System Diagnostic Test
Tests the specific issues reported: Pro plan user still shows "Free Trial - 3 questions remaining" and boost button gives 429 error
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

class SubscriptionTester:
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

    async def test_critical_subscription_system_diagnostic(self):
        """🚨 CRITICAL SUBSCRIPTION SYSTEM DIAGNOSTIC - Test subscription status and boost functionality"""
        print("\n🚨 === CRITICAL SUBSCRIPTION SYSTEM DIAGNOSTIC ===")
        print("Testing the exact issues reported: Pro plan user still shows 'Free Trial - 3 questions remaining' and boost button gives 429 error")
        
        # Test different user scenarios
        test_users = [
            {"token": "mock_dev_token", "name": "Mock Dev User", "expected_tier": "starter"},
            {"token": "pro_user_token", "name": "Pro Plan User", "expected_tier": "pro"},
            {"token": "fresh_user_token", "name": "Fresh User", "expected_tier": "starter"},
        ]
        
        for user in test_users:
            print(f"\n🔍 Testing user: {user['name']}")
            headers = {"Authorization": f"Bearer {user['token']}"}
            
            # Test 1: GET /api/user/subscription to check subscription status
            print(f"   1️⃣ Testing GET /api/user/subscription for {user['name']}")
            success, data, status = await self.make_request("GET", "/user/subscription", headers=headers)
            
            if success and isinstance(data, dict):
                subscription_tier = data.get("subscription_tier", "unknown")
                tier = data.get("tier", "unknown")
                subscription_active = data.get("subscription_active", False)
                trial_questions_used = data.get("trial_questions_used", 0)
                is_trial = data.get("is_trial", False)
                
                print(f"      📊 Subscription Status:")
                print(f"         - subscription_tier: {subscription_tier}")
                print(f"         - tier: {tier}")
                print(f"         - subscription_active: {subscription_active}")
                print(f"         - trial_questions_used: {trial_questions_used}")
                print(f"         - is_trial: {is_trial}")
                
                # Check for trial info
                if "trial_info" in data:
                    trial_info = data["trial_info"]
                    questions_remaining = trial_info.get("questions_remaining", 0)
                    questions_used = trial_info.get("questions_used", 0)
                    print(f"         - trial_questions_remaining: {questions_remaining}")
                    print(f"         - trial_questions_used_from_info: {questions_used}")
                    
                    # CRITICAL CHECK: Pro users should not see trial info
                    if user["expected_tier"] == "pro" and is_trial:
                        self.log_test(f"❌ {user['name']} - Pro User Trial Status", False, 
                                    f"Pro user incorrectly shows is_trial=True with {questions_remaining} questions remaining")
                    elif user["expected_tier"] == "pro" and not is_trial:
                        self.log_test(f"✅ {user['name']} - Pro User Trial Status", True, 
                                    "Pro user correctly shows is_trial=False")
                    elif user["expected_tier"] == "starter" and is_trial:
                        self.log_test(f"✅ {user['name']} - Starter User Trial Status", True, 
                                    f"Starter user correctly shows is_trial=True with {questions_remaining} questions remaining")
                
                # Check subscription tier consistency
                if subscription_tier == tier:
                    self.log_test(f"✅ {user['name']} - Tier Consistency", True, 
                                f"subscription_tier and tier both show '{subscription_tier}'")
                else:
                    self.log_test(f"❌ {user['name']} - Tier Consistency", False, 
                                f"Mismatch: subscription_tier='{subscription_tier}', tier='{tier}'")
                
                # Check if Pro user has correct subscription status
                if user["expected_tier"] == "pro":
                    if subscription_tier == "pro" and subscription_active:
                        self.log_test(f"✅ {user['name']} - Pro Subscription Status", True, 
                                    "Pro user correctly shows active pro subscription")
                    else:
                        self.log_test(f"❌ {user['name']} - Pro Subscription Status", False, 
                                    f"Pro user shows tier='{subscription_tier}', active={subscription_active}")
                
                self.log_test(f"✅ {user['name']} - Subscription API Response", True, 
                            f"Received subscription data for {user['name']}")
            else:
                self.log_test(f"❌ {user['name']} - Subscription API Response", False, 
                            f"Status: {status}", data)
            
            # Test 2: Test POST /api/chat/boost-response for 429 error investigation
            print(f"   2️⃣ Testing POST /api/chat/boost-response for {user['name']}")
            boost_data = {
                "question": "What are fire safety requirements for high-rise buildings in Australia?",
                "target_tier": "pro"
            }
            
            success, data, status = await self.make_request("POST", "/chat/boost-response", boost_data, headers)
            
            if success and isinstance(data, dict):
                if "boosted_response" in data:
                    response_length = len(str(data["boosted_response"]))
                    self.log_test(f"✅ {user['name']} - Boost Response Success", True, 
                                f"Received boosted response ({response_length} chars)")
                    
                    # Check for booster usage tracking
                    if "booster_used" in data and data["booster_used"]:
                        self.log_test(f"✅ {user['name']} - Booster Usage Tracking", True, 
                                    "Booster usage correctly tracked")
                else:
                    self.log_test(f"❌ {user['name']} - Boost Response Format", False, 
                                "Missing 'boosted_response' field", data)
            elif status == 429:
                # This is the critical error mentioned in the review
                error_message = data.get("detail", "Unknown error") if isinstance(data, dict) else str(data)
                self.log_test(f"🚨 {user['name']} - Boost 429 Error (CRITICAL)", False, 
                            f"429 Too Many Requests: {error_message}")
                print(f"      🚨 CRITICAL ISSUE: Boost button returns 429 error for {user['name']}")
                print(f"         Error details: {error_message}")
                
                # Check if this is a daily limit issue
                if "daily" in error_message.lower() or "limit" in error_message.lower():
                    print(f"         🔍 Analysis: Appears to be daily limit enforcement")
                    self.log_test(f"🔍 {user['name']} - Daily Limit Analysis", True, 
                                "429 error appears to be daily limit enforcement")
                else:
                    print(f"         🔍 Analysis: May be rate limiting or other issue")
                    self.log_test(f"🔍 {user['name']} - Rate Limiting Analysis", False, 
                                "429 error may indicate rate limiting problem")
            elif status == 403:
                self.log_test(f"⚠️ {user['name']} - Boost Authentication", False, 
                            "403 Forbidden - Authentication issue")
            else:
                self.log_test(f"❌ {user['name']} - Boost Response Failure", False, 
                            f"Status: {status}", data)
        
        # Test 3: Test subscription update simulation (mock payment completion)
        print(f"\n3️⃣ Testing Subscription Update After Payment Completion")
        
        # Simulate a user who just completed Pro payment
        payment_completed_headers = {"Authorization": "Bearer payment_completed_user"}
        
        # Check subscription status before and after payment simulation
        print("   Testing subscription status for user who just completed payment...")
        success, data, status = await self.make_request("GET", "/user/subscription", headers=payment_completed_headers)
        
        if success and isinstance(data, dict):
            subscription_tier = data.get("subscription_tier", "unknown")
            subscription_active = data.get("subscription_active", False)
            is_trial = data.get("is_trial", False)
            
            print(f"      📊 Post-Payment Subscription Status:")
            print(f"         - subscription_tier: {subscription_tier}")
            print(f"         - subscription_active: {subscription_active}")
            print(f"         - is_trial: {is_trial}")
            
            # For a user who completed payment, they should not be in trial mode
            if subscription_tier == "pro" and subscription_active and not is_trial:
                self.log_test("✅ Post-Payment Subscription Update", True, 
                            "User who completed payment shows correct Pro status")
            elif subscription_tier == "starter" and is_trial:
                self.log_test("⚠️ Post-Payment Subscription Update", False, 
                            "User who completed payment still shows starter/trial status - payment update may not be working")
            else:
                self.log_test("❌ Post-Payment Subscription Update", False, 
                            f"Unexpected status: tier={subscription_tier}, active={subscription_active}, trial={is_trial}")
        
        # Test 4: Test authentication issues affecting subscription checking
        print(f"\n4️⃣ Testing Authentication Issues")
        
        # Test with invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token_123"}
        success, data, status = await self.make_request("GET", "/user/subscription", headers=invalid_headers)
        
        if not success and status in [401, 403]:
            self.log_test("✅ Invalid Token Rejection", True, 
                        f"Invalid token correctly rejected with {status} status")
        else:
            self.log_test("❌ Invalid Token Handling", False, 
                        f"Expected 401/403, got {status}", data)
        
        # Test without authorization header
        success, data, status = await self.make_request("GET", "/user/subscription")
        
        if not success and status in [401, 403]:
            self.log_test("✅ Missing Auth Rejection", True, 
                        f"Missing auth correctly rejected with {status} status")
        else:
            self.log_test("❌ Missing Auth Handling", False, 
                        f"Expected 401/403, got {status}", data)
        
        print(f"\n🎯 CRITICAL SUBSCRIPTION DIAGNOSTIC SUMMARY:")
        print("   ✅ Tested GET /api/user/subscription for different user types")
        print("   🚨 Tested POST /api/chat/boost-response for 429 error investigation")
        print("   ⚠️ Tested subscription update after payment completion")
        print("   🔐 Tested authentication issues affecting subscription checking")
        print("   📊 Verified subscription_tier field consistency")
        print("\n🔍 KEY FINDINGS:")
        print("   - Check if Pro users still show trial status (is_trial=True)")
        print("   - Investigate 429 errors on boost endpoint")
        print("   - Verify payment completion updates subscription correctly")
        print("   - Confirm authentication is working for subscription checks")

    async def run_test(self):
        """Run the critical subscription diagnostic test"""
        print("🚀 Starting Critical Subscription System Diagnostic")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 80)
        
        await self.test_critical_subscription_system_diagnostic()
        
        # Print summary
        print("\n" + "=" * 80)
        print("🎯 SUBSCRIPTION DIAGNOSTIC SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['details']}")
        
        print("\n🎉 Subscription diagnostic completed!")
        return passed_tests, failed_tests

async def main():
    async with SubscriptionTester() as tester:
        await tester.run_test()

if __name__ == "__main__":
    asyncio.run(main())
"""
Focused test for subscription status endpoint fixes
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime

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

async def test_subscription_fixes():
    """Test the specific subscription status endpoint fixes mentioned in review request"""
    print("🚀 Testing Subscription Status Endpoint Fixes")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    print("=" * 60)
    
    async with aiohttp.ClientSession() as session:
        # Test 1: GET /api/user/subscription endpoint (the correct endpoint)
        print("\n=== Test 1: Subscription Status Endpoint ===")
        
        # Use fresh mock auth token to simulate new user
        fresh_user_headers = {"Authorization": "Bearer fresh_user_token_123"}
        
        try:
            url = f"{API_BASE}/user/subscription"
            async with session.get(url, headers=fresh_user_headers) as response:
                status = response.status
                try:
                    data = await response.json()
                except:
                    data = await response.text()
                
                print(f"Status Code: {status}")
                print(f"Response Type: {type(data)}")
                
                if status < 400 and isinstance(data, dict):
                    print("✅ API call successful")
                    
                    # Check for both "subscription_tier" and "tier" fields as mentioned in review
                    has_subscription_tier = "subscription_tier" in data
                    has_tier = "tier" in data
                    
                    print(f"Has 'subscription_tier' field: {has_subscription_tier}")
                    print(f"Has 'tier' field: {has_tier}")
                    
                    if has_subscription_tier and has_tier:
                        subscription_tier = data.get("subscription_tier")
                        tier = data.get("tier")
                        
                        print(f"subscription_tier: '{subscription_tier}'")
                        print(f"tier: '{tier}'")
                        
                        # Verify new users get "starter" tier by default
                        if subscription_tier == "starter" and tier == "starter":
                            print("✅ Both fields present and correctly set to 'starter'")
                            print("✅ New users correctly get 'starter' tier by default")
                        else:
                            print(f"❌ Expected 'starter' for both fields, got subscription_tier='{subscription_tier}', tier='{tier}'")
                    else:
                        missing_fields = []
                        if not has_subscription_tier:
                            missing_fields.append("subscription_tier")
                        if not has_tier:
                            missing_fields.append("tier")
                        print(f"❌ Missing required fields: {', '.join(missing_fields)}")
                    
                    print(f"\nFull Response:")
                    print(json.dumps(data, indent=2, default=str))
                else:
                    print(f"❌ API call failed with status {status}")
                    print(f"Response: {data}")
                    
        except Exception as e:
            print(f"❌ Exception during test: {str(e)}")
        
        # Test 2: GET /api/user/profile endpoint for new user starter tier
        print("\n=== Test 2: User Profile Endpoint ===")
        
        try:
            url = f"{API_BASE}/user/profile"
            async with session.get(url, headers=fresh_user_headers) as response:
                status = response.status
                try:
                    data = await response.json()
                except:
                    data = await response.text()
                
                print(f"Status Code: {status}")
                print(f"Response Type: {type(data)}")
                
                if status < 400 and isinstance(data, dict):
                    print("✅ API call successful")
                    
                    subscription_tier = data.get("subscription_tier")
                    print(f"subscription_tier: '{subscription_tier}'")
                    
                    if subscription_tier == "starter":
                        print("✅ New user profile correctly shows 'starter' subscription_tier")
                    else:
                        print(f"❌ Expected 'starter', got '{subscription_tier}'")
                    
                    print(f"\nFull Response:")
                    print(json.dumps(data, indent=2, default=str))
                else:
                    print(f"❌ API call failed with status {status}")
                    print(f"Response: {data}")
                    
        except Exception as e:
            print(f"❌ Exception during test: {str(e)}")
        
        # Test 3: Test with multiple different mock tokens to simulate different new users
        print("\n=== Test 3: Mock Firebase Service Starter Tier ===")
        
        test_users = [
            {"token": "new_user_token_1", "name": "Test User 1"},
            {"token": "new_user_token_2", "name": "Test User 2"},
            {"token": "fresh_starter_user", "name": "Fresh Starter User"},
        ]
        
        for user in test_users:
            print(f"\nTesting {user['name']}:")
            headers = {"Authorization": f"Bearer {user['token']}"}
            
            try:
                url = f"{API_BASE}/user/subscription"
                async with session.get(url, headers=headers) as response:
                    status = response.status
                    try:
                        data = await response.json()
                    except:
                        data = await response.text()
                    
                    if status < 400 and isinstance(data, dict):
                        subscription_tier = data.get("subscription_tier")
                        tier = data.get("tier")
                        
                        print(f"  subscription_tier: '{subscription_tier}'")
                        print(f"  tier: '{tier}'")
                        
                        if subscription_tier == "starter":
                            print(f"  ✅ Mock service correctly returns 'starter' tier for {user['name']}")
                        else:
                            print(f"  ❌ Expected 'starter', got '{subscription_tier}' for {user['name']}")
                        
                        # Check that tier field is also present and correct
                        if tier == "starter":
                            print(f"  ✅ 'tier' field correctly set to 'starter' for {user['name']}")
                        else:
                            print(f"  ❌ Expected tier='starter', got '{tier}' for {user['name']}")
                    else:
                        print(f"  ❌ Failed to get subscription status for {user['name']}: {status}")
                        
            except Exception as e:
                print(f"  ❌ Exception for {user['name']}: {str(e)}")
        
        # Test 4: Backend Health Check
        print("\n=== Test 4: Backend Health Check ===")
        
        try:
            url = f"{API_BASE}/"
            async with session.get(url) as response:
                status = response.status
                try:
                    data = await response.json()
                except:
                    data = await response.text()
                
                print(f"Status Code: {status}")
                
                if status < 400 and isinstance(data, dict):
                    if "message" in data and "version" in data:
                        print(f"✅ Backend is healthy - {data.get('message')} (version {data.get('version')})")
                    else:
                        print("✅ Backend is responding but missing expected fields")
                else:
                    print(f"❌ Backend health check failed with status {status}")
                    print(f"Response: {data}")
                    
        except Exception as e:
            print(f"❌ Exception during health check: {str(e)}")

if __name__ == "__main__":
    try:
        asyncio.run(test_subscription_fixes())
        print("\n" + "=" * 60)
        print("🎯 Subscription Status Endpoint Testing Complete")
        print("=" * 60)
    except KeyboardInterrupt:
        print("\nTests interrupted by user")
    except Exception as e:
        print(f"\nUnexpected error: {e}")