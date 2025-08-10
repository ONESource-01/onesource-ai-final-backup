#!/usr/bin/env python3
"""
Comprehensive Booster Response System Testing for ONESource-ai
Tests the new booster feature with different user scenarios
"""

import asyncio
import aiohttp
import json
import os
import sys
import uuid
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

class ComprehensiveBoosterTester:
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

    async def test_booster_authentication(self):
        """Test booster authentication requirements"""
        print("\n=== Testing Booster Authentication ===")
        
        boost_data = {
            "question": "What are the fire rating requirements for steel beams?",
            "current_tier": "starter",
            "target_tier": "pro"
        }
        
        # Test without authentication
        success, data, status = await self.make_request("POST", "/chat/boost-response", boost_data)
        
        if not success and (status == 401 or status == 403):
            self.log_test("Authentication Required", True, f"Correctly rejected unauthenticated request (status: {status})")
        else:
            self.log_test("Authentication Required", False, f"Expected 401/403, got {status}", data)

    async def test_booster_tier_combinations(self):
        """Test different tier combinations"""
        print("\n=== Testing Booster Tier Combinations ===")
        
        # Generate unique user tokens for each test
        user1_headers = {"Authorization": f"Bearer mock_dev_token_user_{uuid.uuid4().hex[:8]}"}
        user2_headers = {"Authorization": f"Bearer mock_dev_token_user_{uuid.uuid4().hex[:8]}"}
        user3_headers = {"Authorization": f"Bearer mock_dev_token_user_{uuid.uuid4().hex[:8]}"}
        
        tier_combinations = [
            {
                "headers": user1_headers,
                "data": {
                    "question": "What are the structural requirements for a commercial building?",
                    "current_tier": "starter",
                    "target_tier": "pro"
                },
                "test_name": "Starter to Pro"
            },
            {
                "headers": user2_headers,
                "data": {
                    "question": "How do I design integrated building systems?",
                    "current_tier": "pro",
                    "target_tier": "pro_plus"
                },
                "test_name": "Pro to Pro Plus"
            },
            {
                "headers": user3_headers,
                "data": {
                    "question": "What are advanced compliance requirements?",
                    "current_tier": "starter",
                    "target_tier": "pro_plus"
                },
                "test_name": "Starter to Pro Plus"
            }
        ]
        
        for combo in tier_combinations:
            success, data, status = await self.make_request("POST", "/chat/boost-response", combo["data"], combo["headers"])
            
            if success and isinstance(data, dict):
                if "boosted_response" in data and "target_tier" in data:
                    target_tier = data["target_tier"]
                    boosted_response = data["boosted_response"]
                    
                    self.log_test(f"Tier Combination ({combo['test_name']})", True, 
                                f"Successfully boosted to {target_tier}")
                    
                    # Check for tier-specific content based on target tier
                    if target_tier == "pro":
                        pro_indicators = ["professional", "comprehensive", "detailed", "advanced"]
                        pro_content = sum(1 for indicator in pro_indicators 
                                        if indicator.lower() in boosted_response.lower())
                        if pro_content >= 2:
                            self.log_test(f"Pro Tier Content ({combo['test_name']})", True, 
                                        f"Found {pro_content} pro-level indicators")
                        else:
                            self.log_test(f"Pro Tier Content ({combo['test_name']})", False, 
                                        f"Limited pro content: {pro_content} indicators")
                    
                    elif target_tier == "pro_plus":
                        pro_plus_indicators = ["multi-discipline", "coordination", "specialized", "workflow"]
                        pro_plus_content = sum(1 for indicator in pro_plus_indicators 
                                             if indicator.lower() in boosted_response.lower())
                        if pro_plus_content >= 1:
                            self.log_test(f"Pro Plus Tier Content ({combo['test_name']})", True, 
                                        f"Found {pro_plus_content} pro-plus indicators")
                        else:
                            self.log_test(f"Pro Plus Tier Content ({combo['test_name']})", False, 
                                        f"No pro-plus specific content found")
                else:
                    self.log_test(f"Tier Combination ({combo['test_name']})", False, 
                                "Missing required fields in response", data)
            else:
                self.log_test(f"Tier Combination ({combo['test_name']})", False, 
                            f"Status: {status}", data)

    async def test_enhanced_response_formatting(self):
        """Test enhanced response formatting features"""
        print("\n=== Testing Enhanced Response Formatting ===")
        
        user_headers = {"Authorization": f"Bearer mock_dev_token_user_{uuid.uuid4().hex[:8]}"}
        
        boost_data = {
            "question": "What are the concrete strength requirements for a high-rise building foundation?",
            "current_tier": "starter",
            "target_tier": "pro"
        }
        
        success, data, status = await self.make_request("POST", "/chat/boost-response", boost_data, user_headers)
        
        if success and isinstance(data, dict) and "boosted_response" in data:
            boosted_response = data["boosted_response"]
            
            # Check for various formatting elements
            formatting_checks = [
                ("Bold Headers", "**", 2),
                ("Bullet Points", "•", 3),
                ("Checkmarks", "✅", 1),
                ("Warning Icons", "⚠️", 1),
                ("Construction Icons", "🏗️", 1),
                ("Enhancement Icons", "🚀", 1)
            ]
            
            total_formatting_score = 0
            for check_name, indicator, min_count in formatting_checks:
                count = boosted_response.count(indicator)
                if count >= min_count:
                    self.log_test(f"Formatting - {check_name}", True, f"Found {count} instances")
                    total_formatting_score += 1
                else:
                    self.log_test(f"Formatting - {check_name}", False, f"Found {count}, expected ≥{min_count}")
            
            # Overall formatting assessment
            if total_formatting_score >= 4:
                self.log_test("Overall Enhanced Formatting", True, 
                            f"Passed {total_formatting_score}/6 formatting checks")
            else:
                self.log_test("Overall Enhanced Formatting", False, 
                            f"Only passed {total_formatting_score}/6 formatting checks")
            
            # Check response structure
            if len(boosted_response) > 1000:
                self.log_test("Response Comprehensiveness", True, 
                            f"Comprehensive response: {len(boosted_response)} characters")
            else:
                self.log_test("Response Comprehensiveness", False, 
                            f"Response too brief: {len(boosted_response)} characters")
                
        else:
            self.log_test("Enhanced Response Formatting", False, f"Status: {status}", data)

    async def test_daily_limit_enforcement(self):
        """Test daily limit enforcement"""
        print("\n=== Testing Daily Limit Enforcement ===")
        
        user_headers = {"Authorization": f"Bearer mock_dev_token_user_{uuid.uuid4().hex[:8]}"}
        
        boost_data = {
            "question": "What are the HVAC requirements for office buildings?",
            "current_tier": "starter",
            "target_tier": "pro"
        }
        
        # First booster should succeed
        success1, data1, status1 = await self.make_request("POST", "/chat/boost-response", boost_data, user_headers)
        
        if success1 and isinstance(data1, dict) and data1.get("booster_used"):
            self.log_test("First Daily Booster", True, "Successfully used first booster of the day")
            
            # Second booster should fail with 429
            success2, data2, status2 = await self.make_request("POST", "/chat/boost-response", boost_data, user_headers)
            
            if not success2 and status2 == 429:
                self.log_test("Daily Limit Enforcement", True, "Correctly rejected second booster with 429 status")
                
                # Check error message
                if isinstance(data2, dict) and "detail" in data2:
                    error_msg = data2["detail"]
                    if "daily" in error_msg.lower() and ("limit" in error_msg.lower() or "tomorrow" in error_msg.lower()):
                        self.log_test("Daily Limit Error Message", True, f"Appropriate error: {error_msg}")
                    else:
                        self.log_test("Daily Limit Error Message", False, f"Unclear error: {error_msg}")
                else:
                    self.log_test("Daily Limit Error Message", False, f"Unexpected error format: {data2}")
            else:
                self.log_test("Daily Limit Enforcement", False, 
                            f"Expected 429, got {status2}", data2)
        else:
            self.log_test("First Daily Booster", False, f"Status: {status1}", data1)

    async def test_parameter_validation(self):
        """Test parameter validation"""
        print("\n=== Testing Parameter Validation ===")
        
        user_headers = {"Authorization": f"Bearer mock_dev_token_user_{uuid.uuid4().hex[:8]}"}
        
        validation_tests = [
            {
                "data": {"question": "Test question"},  # Missing target_tier
                "test_name": "Missing Target Tier",
                "expected_status": 400
            },
            {
                "data": {"target_tier": "pro"},  # Missing question
                "test_name": "Missing Question",
                "expected_status": 400
            },
            {
                "data": {"question": "", "target_tier": "pro"},  # Empty question
                "test_name": "Empty Question",
                "expected_status": 400
            }
        ]
        
        for test in validation_tests:
            success, data, status = await self.make_request("POST", "/chat/boost-response", test["data"], user_headers)
            
            if not success and status == test["expected_status"]:
                self.log_test(f"Parameter Validation - {test['test_name']}", True, 
                            f"Correctly rejected with status {status}")
            else:
                self.log_test(f"Parameter Validation - {test['test_name']}", False, 
                            f"Expected {test['expected_status']}, got {status}", data)

    async def test_construction_domain_expertise(self):
        """Test construction domain expertise in boosted responses"""
        print("\n=== Testing Construction Domain Expertise ===")
        
        construction_questions = [
            {
                "question": "What are the AS/NZS standards for structural steel in commercial buildings?",
                "expected_terms": ["AS/NZS", "steel", "structural", "commercial", "standards"],
                "test_name": "Structural Steel Standards"
            },
            {
                "question": "How do I calculate fire ratings for building elements according to BCA requirements?",
                "expected_terms": ["fire rating", "BCA", "building", "elements", "calculate"],
                "test_name": "Fire Rating Calculations"
            },
            {
                "question": "What HVAC system sizing is required for a 1000m² office space?",
                "expected_terms": ["HVAC", "sizing", "office", "system", "space"],
                "test_name": "HVAC System Sizing"
            }
        ]
        
        for question_data in construction_questions:
            user_headers = {"Authorization": f"Bearer mock_dev_token_user_{uuid.uuid4().hex[:8]}"}
            
            boost_data = {
                "question": question_data["question"],
                "current_tier": "starter",
                "target_tier": "pro"
            }
            
            success, data, status = await self.make_request("POST", "/chat/boost-response", boost_data, user_headers)
            
            if success and isinstance(data, dict) and "boosted_response" in data:
                boosted_response = data["boosted_response"].lower()
                
                # Check for expected construction terms
                term_matches = sum(1 for term in question_data["expected_terms"] 
                                 if term.lower() in boosted_response)
                
                if term_matches >= 3:
                    self.log_test(f"Construction Expertise - {question_data['test_name']}", True, 
                                f"Found {term_matches}/{len(question_data['expected_terms'])} expected terms")
                else:
                    self.log_test(f"Construction Expertise - {question_data['test_name']}", False, 
                                f"Only found {term_matches}/{len(question_data['expected_terms'])} expected terms")
                
                # Check for Australian standards references
                au_standards = ["AS ", "AS/NZS", "BCA", "NCC", "Australian Standard"]
                au_matches = sum(1 for standard in au_standards if standard.lower() in boosted_response)
                
                if au_matches >= 1:
                    self.log_test(f"AU Standards Integration - {question_data['test_name']}", True, 
                                f"Found {au_matches} Australian standards references")
                else:
                    self.log_test(f"AU Standards Integration - {question_data['test_name']}", False, 
                                "No Australian standards references found")
                    
            else:
                self.log_test(f"Construction Expertise - {question_data['test_name']}", False, 
                            f"Status: {status}", data)

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*70)
        print("COMPREHENSIVE BOOSTER RESPONSE SYSTEM TEST SUMMARY")
        print("="*70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Group results by test category
        categories = {}
        for result in self.test_results:
            category = result["test"].split(" - ")[0] if " - " in result["test"] else "General"
            if category not in categories:
                categories[category] = {"passed": 0, "failed": 0}
            
            if result["success"]:
                categories[category]["passed"] += 1
            else:
                categories[category]["failed"] += 1
        
        print(f"\nResults by Category:")
        for category, results in categories.items():
            total_cat = results["passed"] + results["failed"]
            success_rate = (results["passed"] / total_cat) * 100 if total_cat > 0 else 0
            print(f"  {category}: {results['passed']}/{total_cat} ({success_rate:.1f}%)")
        
        if failed_tests > 0:
            print(f"\nFailed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        print(f"\nBackend URL tested: {BACKEND_URL}")
        print(f"API Base URL: {API_BASE}")
        
        return passed_tests, failed_tests

async def main():
    """Run comprehensive booster system tests"""
    print("Starting Comprehensive ONESource-ai Booster Response System Tests")
    print(f"Testing backend at: {BACKEND_URL}")
    print("="*70)
    
    async with ComprehensiveBoosterTester() as tester:
        await tester.test_booster_authentication()
        await tester.test_booster_tier_combinations()
        await tester.test_enhanced_response_formatting()
        await tester.test_daily_limit_enforcement()
        await tester.test_parameter_validation()
        await tester.test_construction_domain_expertise()
        
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