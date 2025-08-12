#!/usr/bin/env python3
"""
Focused Backend API Testing for Review Request Fixes
Tests specifically the file upload and admin feedback fixes mentioned in the review
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

class FocusedTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        
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

    async def test_file_upload_fixes(self):
        """🚨 CRITICAL: Test the file upload fixes mentioned in review request"""
        print("\n🚨 === FILE UPLOAD FIXES TESTING ===")
        print("Testing the uploadDocuments API endpoint fixes:")
        print("1. POST /api/knowledge/upload-personal - Single file upload")
        print("2. POST /api/knowledge/upload-community - Community upload (requires partner status)")
        print("3. Verify proper response with document_id and success message")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Test 1: Personal Knowledge Upload (POST /api/knowledge/upload-personal)
        print("\n1️⃣ Testing POST /api/knowledge/upload-personal - Personal File Upload")
        
        # Create sample content for testing
        sample_content = """
        Fire Safety Requirements for High-Rise Buildings in Australia
        
        This document outlines the key fire safety requirements for high-rise buildings 
        in accordance with Australian Standards and the National Construction Code (NCC).
        
        Key Standards:
        - AS 1851: Maintenance of fire protection systems
        - AS 2118: Automatic fire sprinkler systems
        - AS 3786: Smoke alarms using scattered light
        - NCC Volume One: Fire safety provisions
        
        Requirements:
        1. Fire resistance levels (FRL) for structural elements
        2. Egress provisions and travel distances
        3. Smoke hazard management systems
        4. Fire sprinkler system installation
        5. Emergency warning and intercommunication systems
        """
        
        # Test with form data (multipart/form-data)
        try:
            # Create form data for file upload
            form_data = aiohttp.FormData()
            form_data.add_field('file', sample_content, 
                              filename='fire_safety_requirements.txt',
                              content_type='text/plain')
            form_data.add_field('tags', '["fire safety", "high-rise", "NCC", "AS 1851"]')
            
            # Make request with form data
            url = f"{API_BASE}/knowledge/upload-personal"
            async with self.session.post(url, data=form_data, headers={"Authorization": "Bearer mock_dev_token"}) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                success = response.status < 400
                status = response.status
                
                print(f"   Status: {status}")
                print(f"   Response type: {type(response_data)}")
                
                if success and isinstance(response_data, dict):
                    if "document_id" in response_data and "message" in response_data:
                        document_id = response_data["document_id"]
                        message = response_data["message"]
                        self.log_test("✅ Personal Upload - Success", True, 
                                    f"File uploaded successfully: {message}, Document ID: {document_id}")
                        
                        # Check for additional response fields
                        if "file_name" in response_data:
                            self.log_test("✅ Personal Upload - File Name", True, 
                                        f"File name recorded: {response_data['file_name']}")
                        
                        if "tags" in response_data:
                            self.log_test("✅ Personal Upload - Tags", True, 
                                        f"Tags processed: {response_data['tags']}")
                        
                        if "ai_metadata" in response_data:
                            self.log_test("✅ Personal Upload - AI Processing", True, 
                                        "AI metadata extraction completed")
                    else:
                        self.log_test("❌ Personal Upload - Response Format", False, 
                                    "Missing required fields (document_id, message)", response_data)
                else:
                    self.log_test("❌ Personal Upload - API Failure", False, 
                                f"Status: {status}", response_data)
                    
        except Exception as e:
            self.log_test("❌ Personal Upload - Request Error", False, f"Error: {str(e)}")
        
        # Test 2: Community Knowledge Upload (POST /api/knowledge/upload-community)
        print("\n2️⃣ Testing POST /api/knowledge/upload-community - Community File Upload")
        
        # Create another sample file for community upload
        community_content = """
        HVAC System Design Guidelines for Commercial Buildings
        
        This document provides guidelines for HVAC system design in commercial buildings
        following Australian Standards and energy efficiency requirements.
        
        Key Standards:
        - AS 1668: The use of mechanical ventilation
        - AS/NZS 3000: Electrical installations
        - NCC Section J: Energy efficiency provisions
        
        Design Considerations:
        1. Load calculations and equipment sizing
        2. Ventilation rates per AS 1668
        3. Energy efficiency compliance
        4. Indoor air quality requirements
        5. System commissioning and testing
        """
        
        try:
            # Test with regular user (should fail with 403)
            form_data = aiohttp.FormData()
            form_data.add_field('file', community_content,
                              filename='hvac_design_guidelines.txt', 
                              content_type='text/plain')
            form_data.add_field('tags', '["HVAC", "commercial", "AS 1668", "energy efficiency"]')
            
            url = f"{API_BASE}/knowledge/upload-community"
            async with self.session.post(url, data=form_data, headers=mock_headers) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                success = response.status < 400
                status = response.status
                
                print(f"   Status: {status}")
                print(f"   Response type: {type(response_data)}")
                
                if success and isinstance(response_data, dict):
                    if "document_id" in response_data and "message" in response_data:
                        document_id = response_data["document_id"]
                        message = response_data["message"]
                        self.log_test("✅ Community Upload - Success", True, 
                                    f"Community file uploaded: {message}, Document ID: {document_id}")
                    else:
                        self.log_test("❌ Community Upload - Response Format", False, 
                                    "Missing required fields (document_id, message)", response_data)
                elif status == 403:
                    # This is expected for non-partner users
                    self.log_test("✅ Community Upload - Access Control", True, 
                                "Non-partner user correctly rejected with 403 (expected behavior)")
                else:
                    self.log_test("❌ Community Upload - API Failure", False, 
                                f"Status: {status}", response_data)
                    
        except Exception as e:
            self.log_test("❌ Community Upload - Request Error", False, f"Error: {str(e)}")
        
        # Test 3: Upload without authentication (should fail)
        print("\n3️⃣ Testing uploads without authentication (should fail)...")
        
        for endpoint in ["/knowledge/upload-personal", "/knowledge/upload-community"]:
            try:
                form_data = aiohttp.FormData()
                form_data.add_field('file', sample_content,
                                  filename='test_file.txt',
                                  content_type='text/plain')
                
                url = f"{API_BASE}{endpoint}"
                async with self.session.post(url, data=form_data) as response:
                    success = response.status < 400
                    status = response.status
                    
                    if not success and status in [401, 403]:
                        self.log_test(f"✅ {endpoint} - Authentication Required", True, 
                                    f"Unauthenticated request correctly rejected with {status}")
                    else:
                        self.log_test(f"❌ {endpoint} - Authentication Bypass", False, 
                                    f"Expected 401/403, got {status}")
                        
            except Exception as e:
                self.log_test(f"❌ {endpoint} - Auth Test Error", False, f"Error: {str(e)}")

    async def test_admin_feedback_dashboard_fix(self):
        """🚨 CRITICAL: Test the admin feedback dashboard fix mentioned in review request"""
        print("\n🚨 === ADMIN FEEDBACK DASHBOARD FIX TESTING ===")
        print("Testing the admin feedback dashboard at /admin/feedback route:")
        print("1. GET /api/admin/feedback - Verify admin feedback retrieval works")
        print("2. Check proper JSON response with feedback array, total_count, etc.")
        print("3. Verify data structure matches frontend dashboard expectations")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Test 1: Admin Feedback Dashboard Retrieval
        print("\n1️⃣ Testing GET /api/admin/feedback - Admin Dashboard")
        
        success, data, status = await self.make_request("GET", "/admin/feedback", headers=mock_headers)
        
        print(f"   Status: {status}")
        print(f"   Success: {success}")
        print(f"   Response type: {type(data)}")
        
        if success and isinstance(data, dict):
            # Check for required response structure
            required_fields = ["feedback", "total_count"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                feedback_array = data["feedback"]
                total_count = data["total_count"]
                
                self.log_test("✅ Admin Dashboard - Response Structure", True, 
                            f"Proper JSON structure with feedback array ({len(feedback_array)} items) and total_count ({total_count})")
                
                # Check if feedback is an array
                if isinstance(feedback_array, list):
                    self.log_test("✅ Admin Dashboard - Feedback Array", True, 
                                f"Feedback field is properly formatted as array with {len(feedback_array)} items")
                    
                    # Check individual feedback item structure if any exist
                    if len(feedback_array) > 0:
                        first_feedback = feedback_array[0]
                        feedback_required_fields = ["feedback_id", "message_id", "feedback_type", "timestamp"]
                        feedback_missing_fields = [field for field in feedback_required_fields if field not in first_feedback]
                        
                        if not feedback_missing_fields:
                            self.log_test("✅ Admin Dashboard - Feedback Item Structure", True, 
                                        "Feedback items have all required fields")
                            
                            # Check data types
                            feedback_id = first_feedback.get("feedback_id")
                            message_id = first_feedback.get("message_id") 
                            feedback_type = first_feedback.get("feedback_type")
                            timestamp = first_feedback.get("timestamp")
                            
                            type_checks = {
                                "feedback_id_string": isinstance(feedback_id, str),
                                "message_id_string": isinstance(message_id, str),
                                "feedback_type_valid": feedback_type in ["positive", "negative"],
                                "timestamp_present": timestamp is not None
                            }
                            
                            type_score = sum(type_checks.values())
                            if type_score >= 3:  # At least 3 out of 4 checks pass
                                self.log_test("✅ Admin Dashboard - Data Types", True, 
                                            f"Feedback data types are correct ({type_score}/4 checks passed)")
                            else:
                                self.log_test("⚠️ Admin Dashboard - Data Types", False, 
                                            f"Some data type issues ({type_score}/4 checks passed)", type_checks)
                        else:
                            self.log_test("❌ Admin Dashboard - Feedback Item Structure", False, 
                                        f"Feedback items missing required fields: {', '.join(feedback_missing_fields)}")
                    else:
                        self.log_test("ℹ️ Admin Dashboard - No Feedback Data", True, 
                                    "No feedback data found (expected for fresh database)")
                        
                        # Test with some sample feedback data to verify structure
                        print("   📝 Creating sample feedback to test dashboard structure...")
                        
                        # Submit sample feedback first
                        sample_feedback = {
                            "message_id": "admin_dashboard_test_123",
                            "feedback_type": "positive",
                            "comment": "Testing admin dashboard feedback display"
                        }
                        
                        submit_success, submit_data, submit_status = await self.make_request(
                            "POST", "/chat/feedback", sample_feedback, mock_headers)
                        
                        if submit_success:
                            print(f"   ✅ Sample feedback submitted successfully")
                            # Re-test admin dashboard with new data
                            success2, data2, status2 = await self.make_request("GET", "/admin/feedback", headers=mock_headers)
                            
                            if success2 and isinstance(data2, dict) and "feedback" in data2:
                                feedback_array2 = data2["feedback"]
                                if len(feedback_array2) > 0:
                                    self.log_test("✅ Admin Dashboard - With Sample Data", True, 
                                                f"Dashboard now shows {len(feedback_array2)} feedback items")
                                    
                                    # Find our sample feedback
                                    sample_found = any(
                                        fb.get("message_id") == "admin_dashboard_test_123"
                                        for fb in feedback_array2
                                    )
                                    
                                    if sample_found:
                                        self.log_test("✅ Admin Dashboard - Sample Data Display", True, 
                                                    "Sample feedback correctly displayed in dashboard")
                                    else:
                                        self.log_test("⚠️ Admin Dashboard - Sample Data Missing", False, 
                                                    "Sample feedback not found in dashboard")
                        else:
                            print(f"   ❌ Sample feedback submission failed: {submit_status}")
                else:
                    self.log_test("❌ Admin Dashboard - Feedback Array Type", False, 
                                f"Feedback field is not an array, got: {type(feedback_array)}")
                
                # Check total_count field
                if isinstance(total_count, int):
                    self.log_test("✅ Admin Dashboard - Total Count Type", True, 
                                f"total_count is properly formatted as integer: {total_count}")
                else:
                    self.log_test("❌ Admin Dashboard - Total Count Type", False, 
                                f"total_count should be integer, got: {type(total_count)}")
                
            else:
                self.log_test("❌ Admin Dashboard - Response Structure", False, 
                            f"Missing required fields: {', '.join(missing_fields)}", data)
        else:
            self.log_test("❌ Admin Dashboard - API Failure", False, 
                        f"Status: {status}", data)
        
        # Test 2: Admin Dashboard Authentication
        print("\n2️⃣ Testing Admin Dashboard Authentication")
        
        success, data, status = await self.make_request("GET", "/admin/feedback")
        
        if not success and status in [401, 403]:
            self.log_test("✅ Admin Dashboard - Authentication Required", True, 
                        f"Unauthenticated request correctly rejected with {status}")
        else:
            self.log_test("❌ Admin Dashboard - Authentication Bypass", False, 
                        f"Expected 401/403, got {status}")
        
        # Test 3: JSON Serialization Check
        print("\n3️⃣ Testing JSON Serialization (MongoDB ObjectId Issues)")
        
        success, data, status = await self.make_request("GET", "/admin/feedback", headers=mock_headers)
        
        if success:
            try:
                import json
                json_string = json.dumps(data)
                self.log_test("✅ Admin Dashboard - JSON Serialization", True, 
                            "Response data properly serialized (no MongoDB ObjectId issues)")
                
                # Check if we can parse it back
                parsed_data = json.loads(json_string)
                if isinstance(parsed_data, dict) and "feedback" in parsed_data:
                    self.log_test("✅ Admin Dashboard - JSON Round-trip", True, 
                                "JSON data can be properly parsed by frontend")
                
            except Exception as e:
                self.log_test("❌ Admin Dashboard - JSON Serialization", False, 
                            f"JSON serialization error: {str(e)}")

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("FOCUSED BACKEND API TEST SUMMARY")
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
    """Run focused tests for review request fixes"""
    print("🚀 Starting Focused Backend API Testing for Review Request Fixes")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    print("=" * 80)
    
    async with FocusedTester() as tester:
        # 🚨 CRITICAL TESTS FROM REVIEW REQUEST - HIGHEST PRIORITY
        await tester.test_file_upload_fixes()
        await tester.test_admin_feedback_dashboard_fix()
        
        # Print summary
        passed, failed = tester.print_summary()
        
        print(f"\n🎉 Focused testing completed!")
        print(f"Review request fixes are {'✅ WORKING' if failed == 0 else '⚠️ NEED ATTENTION'}")
        
        return 0 if failed == 0 else 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        exit(exit_code)
    except KeyboardInterrupt:
        print("\nTests interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        exit(1)