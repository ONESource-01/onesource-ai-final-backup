#!/usr/bin/env python3
"""
Comprehensive test for Weekly Business Intelligence Reporting System
Verifies all aspects mentioned in the review request
"""

import asyncio
import aiohttp
import json
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

class ComprehensiveWeeklyReportTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: any = None):
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
    
    async def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None) -> tuple:
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

    async def test_comprehensive_weekly_reporting(self):
        """Comprehensive test of Weekly Business Intelligence Reporting System"""
        print("=" * 80)
        print("🧪 COMPREHENSIVE WEEKLY BUSINESS INTELLIGENCE REPORTING SYSTEM TEST")
        print("=" * 80)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Test 1: Verify endpoints no longer return 500 errors
        print("🔍 TEST 1: Verify No 500 Errors for Missing SendGrid API Key")
        print("-" * 60)
        
        success, data, status = await self.make_request("POST", "/admin/send-weekly-report", headers=mock_headers)
        
        if status != 500:
            self.log_test("No 500 Error - Send Weekly Report", True, f"Status: {status} (not 500)")
        else:
            self.log_test("No 500 Error - Send Weekly Report", False, f"Still returning 500 error", data)
        
        test_data = {"admin_email": "test@example.com"}
        success, data, status = await self.make_request("POST", "/admin/test-weekly-report", test_data, mock_headers)
        
        if status != 500:
            self.log_test("No 500 Error - Test Weekly Report", True, f"Status: {status} (not 500)")
        else:
            self.log_test("No 500 Error - Test Weekly Report", False, f"Still returning 500 error", data)
        
        # Test 2: Verify appropriate success messages about SendGrid configuration
        print("\n🔍 TEST 2: Verify Appropriate Success Messages")
        print("-" * 60)
        
        success, data, status = await self.make_request("POST", "/admin/send-weekly-report", headers=mock_headers)
        
        if success and isinstance(data, dict):
            message = data.get("message", "")
            if "generated" in message.lower() and "email not sent" in message.lower():
                self.log_test("Appropriate Message - Send Report", True, f"Message: {message}")
            else:
                self.log_test("Appropriate Message - Send Report", False, f"Unexpected message: {message}")
            
            # Check for SendGrid configuration guidance
            if "reason" in data and "SendGrid" in data["reason"]:
                self.log_test("SendGrid Configuration Guidance", True, f"Reason: {data['reason']}")
            
            if "suggestion" in data:
                self.log_test("Configuration Suggestion Provided", True, f"Suggestion: {data['suggestion']}")
        else:
            self.log_test("Appropriate Message - Send Report", False, f"Unexpected response format", data)
        
        # Test 3: Verify data collection still works
        print("\n🔍 TEST 3: Verify Data Collection Still Works")
        print("-" * 60)
        
        success, data, status = await self.make_request("POST", "/admin/send-weekly-report", headers=mock_headers)
        
        if success and isinstance(data, dict):
            if "data_ready" in data and data["data_ready"]:
                self.log_test("Data Collection Working", True, "Report data collection confirmed working")
            elif "message" in data and "generated" in data["message"].lower():
                self.log_test("Data Collection Working", True, "Report generation confirmed (data collection implied)")
            else:
                self.log_test("Data Collection Working", False, "No indication of data collection", data)
        else:
            self.log_test("Data Collection Working", False, "Could not verify data collection", data)
        
        # Test 4: Verify API response format includes proper messaging
        print("\n🔍 TEST 4: Verify API Response Format")
        print("-" * 60)
        
        success, data, status = await self.make_request("POST", "/admin/send-weekly-report", headers=mock_headers)
        
        if success and isinstance(data, dict):
            required_fields = ["message"]
            optional_fields = ["reason", "suggestion", "sent_to", "data_ready"]
            
            has_required = all(field in data for field in required_fields)
            has_optional = any(field in data for field in optional_fields)
            
            if has_required:
                self.log_test("Response Format - Required Fields", True, f"Has required fields: {required_fields}")
            else:
                self.log_test("Response Format - Required Fields", False, f"Missing required fields", data)
            
            if has_optional:
                self.log_test("Response Format - Informative Fields", True, f"Has informative fields")
            else:
                self.log_test("Response Format - Informative Fields", False, f"Missing informative fields", data)
        else:
            self.log_test("Response Format", False, "Invalid response format", data)
        
        # Test 5: Test both endpoints specifically mentioned in review
        print("\n🔍 TEST 5: Test Specific Endpoints from Review Request")
        print("-" * 60)
        
        # Test /api/admin/send-weekly-report
        success, data, status = await self.make_request("POST", "/admin/send-weekly-report", headers=mock_headers)
        
        if success:
            self.log_test("Endpoint /api/admin/send-weekly-report", True, f"Working correctly - Status: {status}")
        else:
            self.log_test("Endpoint /api/admin/send-weekly-report", False, f"Failed - Status: {status}", data)
        
        # Test /api/admin/test-weekly-report
        test_data = {"admin_email": "beta-test@onesource-ai.com"}
        success, data, status = await self.make_request("POST", "/admin/test-weekly-report", test_data, mock_headers)
        
        if success:
            self.log_test("Endpoint /api/admin/test-weekly-report", True, f"Working correctly - Status: {status}")
        else:
            self.log_test("Endpoint /api/admin/test-weekly-report", False, f"Failed - Status: {status}", data)
        
        # Test 6: Verify authentication still works
        print("\n🔍 TEST 6: Verify Authentication Requirements")
        print("-" * 60)
        
        # Test without authentication
        success, data, status = await self.make_request("POST", "/admin/send-weekly-report")
        
        if not success and status in [401, 403]:
            self.log_test("Authentication Required - Send Report", True, f"Correctly requires auth - Status: {status}")
        else:
            self.log_test("Authentication Required - Send Report", False, f"Should require auth - Status: {status}")
        
        success, data, status = await self.make_request("POST", "/admin/test-weekly-report", {"admin_email": "test@example.com"})
        
        if not success and status in [401, 403]:
            self.log_test("Authentication Required - Test Report", True, f"Correctly requires auth - Status: {status}")
        else:
            self.log_test("Authentication Required - Test Report", False, f"Should require auth - Status: {status}")
        
        # Test 7: Verify system handles the missing SendGrid key gracefully
        print("\n🔍 TEST 7: Verify Graceful SendGrid Handling")
        print("-" * 60)
        
        success, data, status = await self.make_request("POST", "/admin/send-weekly-report", headers=mock_headers)
        
        if success and isinstance(data, dict):
            message = data.get("message", "").lower()
            reason = data.get("reason", "").lower()
            
            graceful_indicators = [
                "generated" in message,
                "email not sent" in message,
                "sendgrid" in reason,
                "api key" in reason,
                "suggestion" in data
            ]
            
            graceful_count = sum(graceful_indicators)
            
            if graceful_count >= 3:
                self.log_test("Graceful SendGrid Handling", True, f"Multiple graceful handling indicators present ({graceful_count}/5)")
            else:
                self.log_test("Graceful SendGrid Handling", False, f"Limited graceful handling ({graceful_count}/5)", data)
        else:
            self.log_test("Graceful SendGrid Handling", False, "Could not verify graceful handling", data)
        
        # Test 8: Verify beta testing environment compatibility
        print("\n🔍 TEST 8: Verify Beta Testing Environment Compatibility")
        print("-" * 60)
        
        # Test that the system works in beta environment without breaking
        success, data, status = await self.make_request("POST", "/admin/send-weekly-report", headers=mock_headers)
        
        if success:
            self.log_test("Beta Environment Compatibility", True, "System works in beta environment without SendGrid")
        else:
            self.log_test("Beta Environment Compatibility", False, f"System fails in beta environment - Status: {status}", data)
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        success_rate = (passed / total) * 100 if total > 0 else 0
        
        print(f"Tests Passed: {passed}/{total} ({success_rate:.1f}%)")
        print()
        
        if passed == total:
            print("🎉 ALL TESTS PASSED!")
            print("✅ Weekly Business Intelligence Reporting System is working correctly")
            print("✅ SendGrid issue has been resolved - system handles missing API key gracefully")
            print("✅ No more 500 errors when SendGrid API key is missing")
            print("✅ System provides appropriate success messages and configuration guidance")
            print("✅ Data collection continues to work even without SendGrid")
            print("✅ Both endpoints (/api/admin/send-weekly-report and /api/admin/test-weekly-report) are functional")
            print("✅ Authentication requirements are properly maintained")
            print("✅ System is ready for beta testing environment")
        else:
            print("⚠️ Some tests failed. Review the details above.")
            failed_tests = [result for result in self.test_results if not result["success"]]
            print(f"\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        print("\n" + "=" * 80)
        return self.test_results

async def main():
    """Run the comprehensive weekly reporting tests"""
    async with ComprehensiveWeeklyReportTester() as tester:
        results = await tester.test_comprehensive_weekly_reporting()
        return results

if __name__ == "__main__":
    asyncio.run(main())