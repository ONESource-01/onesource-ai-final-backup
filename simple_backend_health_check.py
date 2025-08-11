#!/usr/bin/env python3
"""
Simple Backend Health Check for ONESource-ai
Verifies backend is responding and basic endpoints work after onboarding flow updates
"""

import asyncio
import aiohttp
import json
import sys
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

class SimpleHealthChecker:
    def __init__(self):
        self.session = None
        self.results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   {details}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details
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
    
    async def test_api_health(self):
        """Test basic API health endpoint"""
        print("\n=== Backend Health Check ===")
        
        success, data, status = await self.make_request("GET", "/")
        
        if success and isinstance(data, dict):
            if "message" in data and "version" in data:
                self.log_result("API Health Check", True, f"Backend running version {data.get('version')} - {data.get('message')}")
                return True
            else:
                self.log_result("API Health Check", False, "Missing required fields in response")
                return False
        else:
            self.log_result("API Health Check", False, f"Status: {status}, Response: {data}")
            return False
    
    async def test_basic_endpoints(self):
        """Test basic endpoints to ensure no import/syntax errors"""
        print("\n=== Basic Endpoint Tests ===")
        
        # Test user onboarding endpoint (should fail without auth but not crash)
        onboarding_data = {
            "name": "Test User",
            "profession": "Structural Engineer", 
            "sector": "Commercial Construction",
            "use_case": "Design verification",
            "marketing_consent": True
        }
        
        success, data, status = await self.make_request("POST", "/user/onboarding", onboarding_data)
        
        if status == 401:  # Expected - should require auth
            self.log_result("Onboarding Endpoint", True, "Correctly requires authentication (401)")
        elif status == 403:  # Also acceptable
            self.log_result("Onboarding Endpoint", True, "Correctly requires authentication (403)")
        else:
            self.log_result("Onboarding Endpoint", False, f"Unexpected status: {status}")
        
        # Test user profile endpoint (should fail without auth but not crash)
        success, data, status = await self.make_request("GET", "/user/profile")
        
        if status in [401, 403]:  # Expected - should require auth
            self.log_result("Profile Endpoint", True, "Correctly requires authentication")
        else:
            self.log_result("Profile Endpoint", False, f"Unexpected status: {status}")
        
        # Test chat endpoint with construction question (should work without auth)
        chat_data = {
            "question": "What are the fire safety requirements for commercial buildings in Australia?",
            "session_id": "health_check_session"
        }
        
        success, data, status = await self.make_request("POST", "/chat/ask", chat_data)
        
        if success and isinstance(data, dict) and "response" in data:
            self.log_result("Chat Endpoint", True, "Successfully processed construction question")
        elif status == 400:
            # Might be validation error - check the message
            if isinstance(data, dict) and "detail" in data:
                if "construction" in data["detail"].lower():
                    self.log_result("Chat Endpoint", True, "Construction validation working")
                else:
                    self.log_result("Chat Endpoint", False, f"Validation error: {data['detail']}")
            else:
                self.log_result("Chat Endpoint", False, f"Bad request: {data}")
        else:
            self.log_result("Chat Endpoint", False, f"Status: {status}, Response: {data}")
    
    async def test_import_errors(self):
        """Test for import/syntax errors by checking status endpoint"""
        print("\n=== Import/Syntax Error Check ===")
        
        # Test status endpoint which exercises basic imports
        success, data, status = await self.make_request("GET", "/status")
        
        if success and isinstance(data, list):
            self.log_result("Status Endpoint", True, f"Retrieved {len(data)} status records")
        elif status == 200:
            self.log_result("Status Endpoint", True, "Status endpoint responding correctly")
        else:
            self.log_result("Status Endpoint", False, f"Status: {status}, Response: {data}")
        
        # Test creating a status check
        status_data = {"client_name": "health_check_client"}
        success, data, status = await self.make_request("POST", "/status", status_data)
        
        if success and isinstance(data, dict) and "id" in data:
            self.log_result("Status Creation", True, f"Created status record with ID: {data['id']}")
        else:
            self.log_result("Status Creation", False, f"Status: {status}, Response: {data}")
    
    async def run_health_check(self):
        """Run complete health check"""
        print(f"🔍 Running Simple Backend Health Check")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test API health first
        api_healthy = await self.test_api_health()
        
        if not api_healthy:
            print("\n❌ Backend API is not responding properly. Stopping health check.")
            return False
        
        # Test basic endpoints
        await self.test_basic_endpoints()
        
        # Test for import/syntax errors
        await self.test_import_errors()
        
        # Summary
        print(f"\n=== Health Check Summary ===")
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests == 0:
            print("\n🎉 Backend is healthy and ready!")
            return True
        else:
            print(f"\n⚠️  Backend has {failed_tests} issues that need attention.")
            return False

async def main():
    """Main function"""
    try:
        async with SimpleHealthChecker() as checker:
            healthy = await checker.run_health_check()
            sys.exit(0 if healthy else 1)
    except Exception as e:
        print(f"❌ Health check failed with exception: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())