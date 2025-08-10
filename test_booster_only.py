#!/usr/bin/env python3
"""
Focused Booster Response System Testing for ONESource-ai
Tests the new booster feature specifically
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

class BoosterTester:
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

    async def test_booster_response_system(self):
        """Test the new Booster Response System comprehensively"""
        print("\n=== Testing Booster Response System ===")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Test 1: Booster response without authentication (should fail)
        boost_data = {
            "question": "What are the fire rating requirements for steel beams in commercial buildings?",
            "current_tier": "starter",
            "target_tier": "pro"
        }
        
        success, data, status = await self.make_request("POST", "/chat/boost-response", boost_data)
        
        if not success and (status == 401 or status == 403):
            self.log_test("Booster Response (No Auth)", True, "Correctly rejected unauthenticated request")
        else:
            self.log_test("Booster Response (No Auth)", False, f"Expected 401/403, got {status}", data)
        
        # Test 2: Valid booster request (starter -> pro)
        success, data, status = await self.make_request("POST", "/chat/boost-response", boost_data, mock_headers)
        
        if success and isinstance(data, dict):
            if "boosted_response" in data and "target_tier" in data and "booster_used" in data:
                boosted_response = data["boosted_response"]
                target_tier = data["target_tier"]
                booster_used = data["booster_used"]
                remaining_boosters = data.get("remaining_boosters", 0)
                
                self.log_test("Booster Response (Starter->Pro)", True, 
                            f"Target tier: {target_tier}, Booster used: {booster_used}, Remaining: {remaining_boosters}")
                
                # Check for enhanced formatting in boosted response
                enhanced_indicators = ["**", "•", "✅", "⚠️", "🏗️", "🚀"]
                formatting_count = sum(1 for indicator in enhanced_indicators if indicator in boosted_response)
                
                if formatting_count >= 3:
                    self.log_test("Enhanced Response Formatting", True, 
                                f"Found {formatting_count} formatting elements (bold, bullets, emojis)")
                else:
                    self.log_test("Enhanced Response Formatting", False, 
                                f"Limited formatting found: {formatting_count} elements")
                
                # Check for tier-specific content
                tier_indicators = ["PRO", "enhanced", "comprehensive", "professional", "advanced"]
                tier_content = sum(1 for indicator in tier_indicators if indicator.lower() in boosted_response.lower())
                
                if tier_content >= 2:
                    self.log_test("Tier-Specific Content", True, 
                                f"Found {tier_content} tier-specific indicators")
                else:
                    self.log_test("Tier-Specific Content", False, 
                                f"Limited tier content: {tier_content} indicators")
                
                # Check response length (should be substantial for boosted response)
                if len(boosted_response) > 500:
                    self.log_test("Boosted Response Length", True, 
                                f"Substantial response: {len(boosted_response)} characters")
                else:
                    self.log_test("Boosted Response Length", False, 
                                f"Response too short: {len(boosted_response)} characters")
                    
            else:
                self.log_test("Booster Response (Starter->Pro)", False, "Missing required fields in response", data)
        else:
            self.log_test("Booster Response (Starter->Pro)", False, f"Status: {status}", data)
        
        # Test 3: Different tier combination (pro -> pro_plus)
        pro_to_pro_plus_data = {
            "question": "How do I design a complex multi-story building with integrated fire safety and structural systems?",
            "current_tier": "pro", 
            "target_tier": "pro_plus"
        }
        
        success, data, status = await self.make_request("POST", "/chat/boost-response", pro_to_pro_plus_data, mock_headers)
        
        if success and isinstance(data, dict):
            if "boosted_response" in data and "target_tier" in data:
                target_tier = data["target_tier"]
                boosted_response = data["boosted_response"]
                
                self.log_test("Booster Response (Pro->Pro Plus)", True, f"Target tier: {target_tier}")
                
                # Check for Pro Plus specific features
                pro_plus_indicators = ["multi-discipline", "coordination", "specialized workflow", "cross-referenced"]
                pro_plus_content = sum(1 for indicator in pro_plus_indicators 
                                     if indicator.lower() in boosted_response.lower())
                
                if pro_plus_content >= 1:
                    self.log_test("Pro Plus Specific Features", True, 
                                f"Found {pro_plus_content} Pro Plus indicators")
                else:
                    self.log_test("Pro Plus Specific Features", False, 
                                "No Pro Plus specific features detected")
                    
            else:
                self.log_test("Booster Response (Pro->Pro Plus)", False, "Missing required fields in response", data)
        else:
            self.log_test("Booster Response (Pro->Pro Plus)", False, f"Status: {status}", data)
        
        # Test 4: Daily limit enforcement - try to use booster again (should fail with 429)
        success, data, status = await self.make_request("POST", "/chat/boost-response", boost_data, mock_headers)
        
        if not success and status == 429:
            self.log_test("Daily Booster Limit Enforcement", True, "Correctly rejected second booster attempt with 429 status")
            
            # Check for appropriate error message
            if isinstance(data, dict) and "detail" in data:
                error_message = data["detail"]
                if "daily" in error_message.lower() and "limit" in error_message.lower():
                    self.log_test("Daily Limit Error Message", True, f"Appropriate error message: {error_message}")
                else:
                    self.log_test("Daily Limit Error Message", False, f"Unclear error message: {error_message}")
            elif isinstance(data, str) and "daily" in data.lower():
                self.log_test("Daily Limit Error Message", True, f"Error message: {data}")
            else:
                self.log_test("Daily Limit Error Message", False, f"Unexpected error format: {data}")
                
        else:
            self.log_test("Daily Booster Limit Enforcement", False, 
                        f"Expected 429 (daily limit), got {status}", data)
        
        # Test 5: Missing parameters
        incomplete_data = {
            "question": "Test question"
            # Missing target_tier
        }
        
        success, data, status = await self.make_request("POST", "/chat/boost-response", incomplete_data, mock_headers)
        
        if not success and status == 400:
            self.log_test("Missing Parameters Validation", True, "Correctly rejected request with missing target_tier")
        else:
            self.log_test("Missing Parameters Validation", False, f"Expected 400, got {status}", data)
        
        # Test 6: Invalid tier combination
        invalid_tier_data = {
            "question": "Test question",
            "current_tier": "starter",
            "target_tier": "invalid_tier"
        }
        
        success, data, status = await self.make_request("POST", "/chat/boost-response", invalid_tier_data, mock_headers)
        
        # This might succeed if the backend doesn't validate tier names, but response should still be generated
        if success:
            self.log_test("Invalid Tier Handling", True, "System handled invalid tier gracefully")
        else:
            if status == 400:
                self.log_test("Invalid Tier Validation", True, "Correctly rejected invalid tier combination")
            else:
                self.log_test("Invalid Tier Handling", False, f"Unexpected status: {status}", data)
        
        # Test 7: Test usage tracking in MongoDB (indirect test through API behavior)
        # We can't directly access MongoDB, but we can test the behavior that indicates usage tracking
        
        # Create a new mock user session to test fresh daily limit
        fresh_headers = {"Authorization": "Bearer mock_dev_token_fresh_user"}
        fresh_boost_data = {
            "question": "What are the structural requirements for a residential building?",
            "current_tier": "starter",
            "target_tier": "pro"
        }
        
        success, data, status = await self.make_request("POST", "/chat/boost-response", fresh_boost_data, fresh_headers)
        
        if success and isinstance(data, dict):
            if "booster_used" in data and data["booster_used"]:
                self.log_test("Usage Tracking (Fresh User)", True, "Successfully used booster with fresh user session")
                
                # Try second booster with same fresh user (should fail)
                success2, data2, status2 = await self.make_request("POST", "/chat/boost-response", fresh_boost_data, fresh_headers)
                
                if not success2 and status2 == 429:
                    self.log_test("Usage Tracking Persistence", True, "Daily limit correctly tracked across requests")
                else:
                    self.log_test("Usage Tracking Persistence", False, 
                                f"Expected 429 for second attempt, got {status2}")
            else:
                self.log_test("Usage Tracking (Fresh User)", False, "Booster usage not properly recorded", data)
        else:
            self.log_test("Usage Tracking (Fresh User)", False, f"Status: {status}", data)
        
        # Test 8: Construction-specific booster content
        construction_boost_data = {
            "question": "What are the AS/NZS standards for concrete strength in high-rise buildings?",
            "current_tier": "starter",
            "target_tier": "pro"
        }
        
        # Use a different mock token to avoid daily limit
        construction_headers = {"Authorization": "Bearer mock_dev_token_construction"}
        success, data, status = await self.make_request("POST", "/chat/boost-response", construction_boost_data, construction_headers)
        
        if success and isinstance(data, dict) and "boosted_response" in data:
            boosted_response = data["boosted_response"]
            
            # Check for construction-specific content
            construction_terms = ["AS/NZS", "concrete", "standards", "building", "compliance", "structural"]
            construction_matches = sum(1 for term in construction_terms 
                                     if term.lower() in boosted_response.lower())
            
            if construction_matches >= 3:
                self.log_test("Construction-Specific Booster Content", True, 
                            f"Found {construction_matches}/6 construction terms")
            else:
                self.log_test("Construction-Specific Booster Content", False, 
                            f"Limited construction content: {construction_matches}/6 terms")
            
            # Check for Australian standards references
            au_standards = ["AS ", "AS/NZS", "BCA", "NCC", "Australian"]
            au_matches = sum(1 for standard in au_standards 
                           if standard in boosted_response)
            
            if au_matches >= 1:
                self.log_test("Australian Standards Integration", True, 
                            f"Found {au_matches} Australian standards references")
            else:
                self.log_test("Australian Standards Integration", False, 
                            "No Australian standards references found")
                
        else:
            self.log_test("Construction-Specific Booster Content", False, f"Status: {status}", data)

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("BOOSTER RESPONSE SYSTEM TEST SUMMARY")
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
    """Run booster system tests"""
    print("Starting ONESource-ai Booster Response System Tests")
    print(f"Testing backend at: {BACKEND_URL}")
    print("="*60)
    
    async with BoosterTester() as tester:
        await tester.test_booster_response_system()
        
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