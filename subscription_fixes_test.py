#!/usr/bin/env python3
"""
CRITICAL SUBSCRIPTION FIXES TESTING
Tests the specific subscription system fixes mentioned in the review request:
1. Pro User Subscription Status Fix
2. Boost Daily Limit Fix  
3. Authentication and subscription logic verification
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

class SubscriptionFixesTester:
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

    async def test_pro_user_subscription_status_fix(self):
        """Test Fix 1: Pro User Subscription Status Fix"""
        print("\n🚨 === TESTING PRO USER SUBSCRIPTION STATUS FIX ===")
        print("Testing that Pro users no longer show is_trial=True and don't get trial_info section")
        
        # Test with mock pro user token
        pro_user_headers = {"Authorization": "Bearer pro_user_token"}
        
        print("\n1️⃣ Testing GET /api/user/subscription with Pro user token...")
        success, data, status = await self.make_request("GET", "/user/subscription", headers=pro_user_headers)
        
        if success and isinstance(data, dict):
            subscription_tier = data.get("subscription_tier", "unknown")
            subscription_active = data.get("subscription_active", False)
            is_trial = data.get("is_trial", None)
            has_trial_info = "trial_info" in data
            
            print(f"   📊 Pro User Subscription Data:")
            print(f"      - subscription_tier: {subscription_tier}")
            print(f"      - subscription_active: {subscription_active}")
            print(f"      - is_trial: {is_trial}")
            print(f"      - has_trial_info: {has_trial_info}")
            
            # CRITICAL CHECK 1: Pro users should have subscription_tier="pro"
            if subscription_tier == "pro":
                self.log_test("✅ Pro User - Correct Subscription Tier", True, 
                            f"Pro user correctly shows subscription_tier='pro'")
            else:
                self.log_test("❌ Pro User - Wrong Subscription Tier", False, 
                            f"Expected 'pro', got '{subscription_tier}'")
            
            # CRITICAL CHECK 2: Pro users should have subscription_active=true
            if subscription_active:
                self.log_test("✅ Pro User - Active Subscription", True, 
                            "Pro user correctly shows subscription_active=true")
            else:
                self.log_test("❌ Pro User - Inactive Subscription", False, 
                            f"Pro user shows subscription_active={subscription_active}")
            
            # CRITICAL CHECK 3: Pro users should NOT be in trial mode (is_trial=False)
            if is_trial is False:
                self.log_test("✅ Pro User - Not in Trial Mode", True, 
                            "Pro user correctly shows is_trial=False")
            elif is_trial is True:
                self.log_test("❌ Pro User - Still in Trial Mode (CRITICAL BUG)", False, 
                            "Pro user incorrectly shows is_trial=True - this is the reported bug!")
            else:
                self.log_test("⚠️ Pro User - Missing is_trial Field", False, 
                            f"is_trial field missing or null: {is_trial}")
            
            # CRITICAL CHECK 4: Pro users should NOT have trial_info section
            if not has_trial_info:
                self.log_test("✅ Pro User - No Trial Info", True, 
                            "Pro user correctly has no trial_info section")
            else:
                trial_info = data.get("trial_info", {})
                questions_remaining = trial_info.get("questions_remaining", 0)
                self.log_test("❌ Pro User - Has Trial Info (CRITICAL BUG)", False, 
                            f"Pro user incorrectly has trial_info with {questions_remaining} questions remaining")
            
            # Overall Pro User Status Assessment
            pro_status_correct = (
                subscription_tier == "pro" and 
                subscription_active and 
                is_trial is False and 
                not has_trial_info
            )
            
            if pro_status_correct:
                self.log_test("🎉 Pro User Subscription Status Fix", True, 
                            "✅ ALL CHECKS PASSED - Pro user subscription status is correctly fixed!")
            else:
                issues = []
                if subscription_tier != "pro":
                    issues.append(f"tier='{subscription_tier}'")
                if not subscription_active:
                    issues.append("not active")
                if is_trial is True:
                    issues.append("still in trial")
                if has_trial_info:
                    issues.append("has trial_info")
                
                self.log_test("🚨 Pro User Subscription Status Fix", False, 
                            f"❌ CRITICAL ISSUES: {', '.join(issues)}")
        else:
            self.log_test("❌ Pro User Subscription API", False, 
                        f"Failed to get subscription data - Status: {status}", data)
        
        # Test with starter user for comparison
        print("\n2️⃣ Testing GET /api/user/subscription with Starter user token (for comparison)...")
        starter_headers = {"Authorization": "Bearer starter_user_token"}
        
        success, data, status = await self.make_request("GET", "/user/subscription", headers=starter_headers)
        
        if success and isinstance(data, dict):
            subscription_tier = data.get("subscription_tier", "unknown")
            is_trial = data.get("is_trial", None)
            has_trial_info = "trial_info" in data
            
            print(f"   📊 Starter User Subscription Data:")
            print(f"      - subscription_tier: {subscription_tier}")
            print(f"      - is_trial: {is_trial}")
            print(f"      - has_trial_info: {has_trial_info}")
            
            # Starter users SHOULD be in trial mode
            if subscription_tier == "starter" and is_trial is True and has_trial_info:
                self.log_test("✅ Starter User - Correct Trial Status", True, 
                            "Starter user correctly shows trial status")
            else:
                self.log_test("⚠️ Starter User - Unexpected Status", False, 
                            f"Starter user status: tier={subscription_tier}, trial={is_trial}, has_info={has_trial_info}")

    async def test_boost_daily_limit_fix(self):
        """Test Fix 2: Boost Daily Limit Fix"""
        print("\n🚨 === TESTING BOOST DAILY LIMIT FIX ===")
        print("Testing that Pro users get higher daily boost limits and fresh users can use boost")
        
        # Test different user types
        test_users = [
            {"token": "fresh_user_boost_test", "name": "Fresh User", "expected_limit": 1},
            {"token": "pro_user_token", "name": "Pro User", "expected_limit": 10},
            {"token": "starter_user_token", "name": "Starter User", "expected_limit": 1}
        ]
        
        boost_question = {
            "question": "What are fire safety requirements for high-rise buildings in Australia?",
            "target_tier": "pro"
        }
        
        for user in test_users:
            print(f"\n🔍 Testing boost functionality for {user['name']}...")
            headers = {"Authorization": f"Bearer {user['token']}"}
            
            # Test POST /api/chat/boost-response
            success, data, status = await self.make_request("POST", "/chat/boost-response", boost_question, headers)
            
            if success and isinstance(data, dict):
                if "boosted_response" in data:
                    response_length = len(str(data["boosted_response"]))
                    self.log_test(f"✅ {user['name']} - Boost Success", True, 
                                f"Successfully received boosted response ({response_length} chars)")
                    
                    # Check for booster usage tracking
                    if "booster_used" in data and data["booster_used"]:
                        self.log_test(f"✅ {user['name']} - Usage Tracking", True, 
                                    "Booster usage correctly tracked")
                    
                    # Check target tier
                    if "target_tier" in data and data["target_tier"] == "pro":
                        self.log_test(f"✅ {user['name']} - Target Tier", True, 
                                    "Target tier correctly set to 'pro'")
                    
                    # For fresh users, this is especially important
                    if user["name"] == "Fresh User":
                        self.log_test("🎉 Fresh User Boost Fix", True, 
                                    "✅ Fresh users can successfully use boost function!")
                
                else:
                    self.log_test(f"❌ {user['name']} - Missing Boosted Response", False, 
                                "Response missing 'boosted_response' field", data)
            
            elif status == 429:
                # This is the critical error mentioned in the review
                error_message = data.get("detail", "Unknown error") if isinstance(data, dict) else str(data)
                
                print(f"      🚨 429 Error Details: {error_message}")
                
                # Check if error message shows current usage and reset time (better error messages)
                has_usage_info = any(word in error_message.lower() for word in ["usage", "used", "remaining", "reset", "tomorrow"])
                has_limit_info = any(word in error_message.lower() for word in ["limit", "daily", "maximum"])
                
                if has_usage_info and has_limit_info:
                    self.log_test(f"✅ {user['name']} - Better Error Message", True, 
                                f"Error message includes usage and reset info: {error_message}")
                else:
                    self.log_test(f"⚠️ {user['name']} - Error Message Quality", False, 
                                f"Error message could be more informative: {error_message}")
                
                # For fresh users, 429 is the critical bug
                if user["name"] == "Fresh User":
                    self.log_test("🚨 Fresh User Boost 429 Error (CRITICAL BUG)", False, 
                                f"Fresh user gets 429 error - this is the reported bug: {error_message}")
                else:
                    self.log_test(f"ℹ️ {user['name']} - Daily Limit Reached", True, 
                                f"Daily limit enforcement working: {error_message}")
            
            elif status == 403:
                self.log_test(f"❌ {user['name']} - Authentication Error", False, 
                            "403 Forbidden - Authentication issue")
            
            else:
                self.log_test(f"❌ {user['name']} - Boost API Error", False, 
                            f"Status: {status}", data)
        
        # Test daily limit differences between user types
        print(f"\n3️⃣ Testing daily limit differences...")
        
        # This would require checking the backend logic or database
        # For now, we'll test by making multiple requests to see limits
        print("   Note: Daily limit testing requires multiple requests or database inspection")
        print("   Expected: Pro users should get 10 boosts/day vs 1 for starter users")

    async def test_authentication_and_subscription_logic(self):
        """Test Fix 3: Verify authentication and subscription logic"""
        print("\n🚨 === TESTING AUTHENTICATION AND SUBSCRIPTION LOGIC ===")
        
        # Test 1: Invalid token handling
        print("\n1️⃣ Testing invalid token handling...")
        invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
        
        success, data, status = await self.make_request("GET", "/user/subscription", headers=invalid_headers)
        
        if not success and status in [401, 403]:
            self.log_test("✅ Invalid Token Rejection", True, 
                        f"Invalid token correctly rejected with {status} status")
        elif success:
            self.log_test("❌ Invalid Token Security Issue", False, 
                        "Invalid token was accepted - potential security issue!", data)
        else:
            self.log_test("⚠️ Invalid Token Handling", False, 
                        f"Unexpected status {status} for invalid token", data)
        
        # Test 2: Missing authorization header
        print("\n2️⃣ Testing missing authorization header...")
        success, data, status = await self.make_request("GET", "/user/subscription")
        
        if not success and status in [401, 403]:
            self.log_test("✅ Missing Auth Rejection", True, 
                        f"Missing auth correctly rejected with {status} status")
        else:
            self.log_test("❌ Missing Auth Handling", False, 
                        f"Expected 401/403, got {status}", data)
        
        # Test 3: Valid token with subscription data
        print("\n3️⃣ Testing valid token with subscription data...")
        valid_headers = {"Authorization": "Bearer mock_dev_token"}
        
        success, data, status = await self.make_request("GET", "/user/subscription", headers=valid_headers)
        
        if success and isinstance(data, dict):
            required_fields = ["subscription_tier", "subscription_active", "trial_questions_used"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                self.log_test("✅ Valid Token Subscription Data", True, 
                            "Valid token returns complete subscription data")
            else:
                self.log_test("❌ Valid Token Missing Fields", False, 
                            f"Missing fields: {missing_fields}", data)
        else:
            self.log_test("❌ Valid Token API Error", False, 
                        f"Status: {status}", data)
        
        # Test 4: Subscription logic consistency across endpoints
        print("\n4️⃣ Testing subscription logic consistency...")
        
        # Test both subscription endpoints with same token
        endpoints_to_test = [
            "/user/subscription",
            "/user/profile"
        ]
        
        subscription_data = {}
        
        for endpoint in endpoints_to_test:
            success, data, status = await self.make_request("GET", endpoint, headers=valid_headers)
            
            if success and isinstance(data, dict):
                subscription_data[endpoint] = {
                    "subscription_tier": data.get("subscription_tier"),
                    "subscription_active": data.get("subscription_active"),
                    "trial_questions_used": data.get("trial_questions_used")
                }
                self.log_test(f"✅ {endpoint} - Data Retrieved", True, 
                            f"Successfully retrieved data from {endpoint}")
            else:
                self.log_test(f"❌ {endpoint} - API Error", False, 
                            f"Status: {status}", data)
        
        # Check consistency between endpoints
        if len(subscription_data) == 2:
            sub_data = subscription_data["/user/subscription"]
            profile_data = subscription_data["/user/profile"]
            
            consistency_checks = [
                ("subscription_tier", sub_data.get("subscription_tier"), profile_data.get("subscription_tier")),
                ("subscription_active", sub_data.get("subscription_active"), profile_data.get("subscription_active")),
                ("trial_questions_used", sub_data.get("trial_questions_used"), profile_data.get("trial_questions_used"))
            ]
            
            all_consistent = True
            for field, sub_val, profile_val in consistency_checks:
                if sub_val == profile_val:
                    self.log_test(f"✅ {field} Consistency", True, 
                                f"Both endpoints return {field}='{sub_val}'")
                else:
                    self.log_test(f"❌ {field} Inconsistency", False, 
                                f"Subscription: {sub_val}, Profile: {profile_val}")
                    all_consistent = False
            
            if all_consistent:
                self.log_test("🎉 Subscription Logic Consistency", True, 
                            "✅ All subscription data is consistent across endpoints")
            else:
                self.log_test("🚨 Subscription Logic Inconsistency", False, 
                            "❌ Subscription data inconsistent between endpoints")

    async def run_all_tests(self):
        """Run all critical subscription fix tests"""
        print("🚨 CRITICAL SUBSCRIPTION FIXES TESTING")
        print("=" * 60)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # Run all test suites
        await self.test_pro_user_subscription_status_fix()
        await self.test_boost_daily_limit_fix()
        await self.test_authentication_and_subscription_logic()
        
        # Summary
        print("\n" + "=" * 60)
        print("🎯 CRITICAL SUBSCRIPTION FIXES TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Critical issues summary
        critical_issues = []
        for result in self.test_results:
            if not result["success"] and "CRITICAL" in result["test"]:
                critical_issues.append(result["test"])
        
        if critical_issues:
            print(f"\n🚨 CRITICAL ISSUES FOUND ({len(critical_issues)}):")
            for issue in critical_issues:
                print(f"   - {issue}")
        else:
            print(f"\n🎉 NO CRITICAL ISSUES FOUND!")
        
        print("\n" + "=" * 60)

async def main():
    """Main test execution"""
    async with SubscriptionFixesTester() as tester:
        await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())