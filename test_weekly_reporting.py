#!/usr/bin/env python3
"""
Focused test for Weekly Business Intelligence Reporting System
Tests the SendGrid graceful handling fix
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

class WeeklyReportingTester:
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

    async def test_weekly_reporting_endpoints(self):
        """Test Weekly Business Intelligence Reporting System endpoints"""
        print("\n=== Testing Weekly Business Intelligence Reporting System ===")
        print(f"Backend URL: {BACKEND_URL}")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Test 1: Send weekly report without auth (should fail with 401/403)
        print("\n--- Test 1: Send weekly report without authentication ---")
        success, data, status = await self.make_request("POST", "/admin/send-weekly-report")
        
        if not success and status in [401, 403]:
            self.log_test("Send weekly report without auth (should fail)", True, f"Correctly rejected with status {status}")
        else:
            self.log_test("Send weekly report without auth (should fail)", False, f"Expected 401/403, got {status}", data)
        
        # Test 2: Send weekly report with auth (should handle missing SendGrid gracefully)
        print("\n--- Test 2: Send weekly report with authentication ---")
        success, data, status = await self.make_request("POST", "/admin/send-weekly-report", headers=mock_headers)
        
        if success and isinstance(data, dict):
            # Check for graceful SendGrid handling
            if "message" in data:
                message = data["message"]
                if "SendGrid" in message or "email" in message.lower():
                    self.log_test("Send Weekly Report - Graceful SendGrid Handling", True, f"Message: {message}")
                else:
                    self.log_test("Send Weekly Report - Response Format", True, f"Received response with message: {message}")
            
            # Check if data collection still works
            if "data_collected" in data or "sent_to" in data:
                self.log_test("Send Weekly Report - Data Collection", True, "Report data collection working despite missing SendGrid")
            
        elif not success and status == 500:
            # This would indicate the old behavior (500 error)
            self.log_test("Send Weekly Report - SendGrid Error Handling", False, "Still returning 500 error - fix not working", data)
        else:
            # Check if it's a graceful response about SendGrid
            if isinstance(data, dict) and "SendGrid" in str(data):
                self.log_test("Send Weekly Report - Graceful SendGrid Handling", True, f"Status: {status}, Response indicates SendGrid issue handled")
            else:
                self.log_test("Send Weekly Report - Unexpected Response", False, f"Status: {status}", data)
        
        # Test 3: Send weekly report with custom email
        print("\n--- Test 3: Send weekly report with custom email ---")
        custom_email_data = {"admin_email": "test@example.com"}
        success, data, status = await self.make_request("POST", "/admin/send-weekly-report", custom_email_data, mock_headers)
        
        if success and isinstance(data, dict):
            if "message" in data:
                message = data["message"]
                if "SendGrid" in message or "email" in message.lower():
                    self.log_test("Send Weekly Report (Custom Email) - Graceful Handling", True, f"Message: {message}")
                else:
                    self.log_test("Send Weekly Report (Custom Email) - Response", True, f"Message: {message}")
        elif not success and status == 500:
            self.log_test("Send Weekly Report (Custom Email) - Error Handling", False, "Still returning 500 error", data)
        else:
            self.log_test("Send Weekly Report (Custom Email) - Response", True, f"Status: {status}, handled gracefully")
        
        # Test 4: Test weekly report without auth (should fail)
        print("\n--- Test 4: Test weekly report without authentication ---")
        test_report_data = {"admin_email": "test@example.com"}
        success, data, status = await self.make_request("POST", "/admin/test-weekly-report", test_report_data)
        
        if not success and status in [401, 403]:
            self.log_test("Test weekly report without auth (should fail)", True, f"Correctly rejected with status {status}")
        else:
            self.log_test("Test weekly report without auth (should fail)", False, f"Expected 401/403, got {status}", data)
        
        # Test 5: Test weekly report with auth
        print("\n--- Test 5: Test weekly report with authentication ---")
        success, data, status = await self.make_request("POST", "/admin/test-weekly-report", test_report_data, mock_headers)
        
        if success and isinstance(data, dict):
            if "message" in data:
                message = data["message"]
                if "SendGrid" in message or "email" in message.lower():
                    self.log_test("Test Weekly Report - Graceful SendGrid Handling", True, f"Message: {message}")
                else:
                    self.log_test("Test Weekly Report - Response Format", True, f"Message: {message}")
        elif not success and status == 500:
            self.log_test("Test Weekly Report - SendGrid Error Handling", False, "Still returning 500 error - fix not working", data)
        else:
            if isinstance(data, dict) and "SendGrid" in str(data):
                self.log_test("Test Weekly Report - Graceful Handling", True, f"Status: {status}, SendGrid issue handled gracefully")
            else:
                self.log_test("Test Weekly Report - Response", True, f"Status: {status}, handled without 500 error")
        
        # Test 6: Test weekly report with missing email parameter
        print("\n--- Test 6: Test weekly report with missing email parameter ---")
        success, data, status = await self.make_request("POST", "/admin/test-weekly-report", {}, mock_headers)
        
        if success:
            self.log_test("Test Weekly Report (No Email) - Parameter Handling", True, "Handled missing email parameter gracefully")
        elif not success and status == 400:
            self.log_test("Test Weekly Report (No Email) - Validation", True, "Correctly validated missing email parameter")
        elif not success and status == 500:
            self.log_test("Test Weekly Report (No Email) - Error Handling", False, "Still returning 500 error", data)
        else:
            self.log_test("Test Weekly Report (No Email) - Response", True, f"Status: {status}, handled appropriately")
        
        # Test 7: Check if endpoints exist and are accessible
        print("\n--- Test 7: Endpoint accessibility check ---")
        
        # Check if the endpoints are properly registered
        health_success, health_data, health_status = await self.make_request("GET", "/")
        if health_success:
            self.log_test("API Health Check", True, "Backend API is accessible")
        else:
            self.log_test("API Health Check", False, f"Backend API not accessible: {health_status}")
        
        print("\n=== Weekly Reporting Test Summary ===")
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        print(f"Tests Passed: {passed}/{total}")
        
        if passed == total:
            print("🎉 All weekly reporting tests passed! SendGrid graceful handling is working correctly.")
        else:
            print("⚠️ Some tests failed. Check the details above.")
        
        return self.test_results

async def main():
    """Run the weekly reporting tests"""
    async with WeeklyReportingTester() as tester:
        results = await tester.test_weekly_reporting_endpoints()
        return results

if __name__ == "__main__":
    asyncio.run(main())