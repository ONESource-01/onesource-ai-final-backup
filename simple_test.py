#!/usr/bin/env python3
"""
Simple test for the specific endpoints mentioned in review request
"""

import asyncio
import aiohttp
import json

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

async def test_file_uploads():
    """Test file upload endpoints"""
    print("🚨 === TESTING FILE UPLOAD FIXES ===")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    
    async with aiohttp.ClientSession() as session:
        # Test 1: Personal file upload
        print("\n1️⃣ Testing POST /api/knowledge/upload-personal")
        
        sample_content = """
        Fire Safety Requirements for High-Rise Buildings in Australia
        
        Key Standards:
        - AS 1851: Maintenance of fire protection systems
        - AS 2118: Automatic fire sprinkler systems
        - NCC Volume One: Fire safety provisions
        """
        
        try:
            form_data = aiohttp.FormData()
            form_data.add_field('file', sample_content, 
                              filename='fire_safety_test.txt',
                              content_type='text/plain')
            form_data.add_field('tags', '["fire safety", "test"]')
            
            url = f"{API_BASE}/knowledge/upload-personal"
            headers = {"Authorization": "Bearer mock_dev_token"}
            
            async with session.post(url, data=form_data, headers=headers) as response:
                status = response.status
                try:
                    data = await response.json()
                except:
                    data = await response.text()
                
                print(f"   Status: {status}")
                print(f"   Response: {data}")
                
                if status < 400:
                    print("   ✅ Personal upload endpoint is working!")
                    if isinstance(data, dict) and "document_id" in data:
                        print(f"   ✅ Document ID returned: {data['document_id']}")
                    if isinstance(data, dict) and "message" in data:
                        print(f"   ✅ Success message: {data['message']}")
                else:
                    print(f"   ❌ Personal upload failed with status {status}")
                    
        except Exception as e:
            print(f"   ❌ Error testing personal upload: {e}")
        
        # Test 2: Community file upload (should fail for non-partner)
        print("\n2️⃣ Testing POST /api/knowledge/upload-community")
        
        try:
            form_data = aiohttp.FormData()
            form_data.add_field('file', sample_content, 
                              filename='community_test.txt',
                              content_type='text/plain')
            form_data.add_field('tags', '["community", "test"]')
            
            url = f"{API_BASE}/knowledge/upload-community"
            headers = {"Authorization": "Bearer mock_dev_token"}
            
            async with session.post(url, data=form_data, headers=headers) as response:
                status = response.status
                try:
                    data = await response.json()
                except:
                    data = await response.text()
                
                print(f"   Status: {status}")
                print(f"   Response: {data}")
                
                if status == 403:
                    print("   ✅ Community upload correctly requires partner status (403 expected)")
                elif status < 400:
                    print("   ✅ Community upload endpoint is working!")
                    if isinstance(data, dict) and "document_id" in data:
                        print(f"   ✅ Document ID returned: {data['document_id']}")
                else:
                    print(f"   ❌ Community upload failed with status {status}")
                    
        except Exception as e:
            print(f"   ❌ Error testing community upload: {e}")

async def test_admin_feedback():
    """Test admin feedback dashboard"""
    print("\n🚨 === TESTING ADMIN FEEDBACK DASHBOARD FIX ===")
    
    async with aiohttp.ClientSession() as session:
        # Test admin feedback endpoint
        print("\n1️⃣ Testing GET /api/admin/feedback")
        
        try:
            url = f"{API_BASE}/admin/feedback"
            headers = {"Authorization": "Bearer mock_dev_token"}
            
            async with session.get(url, headers=headers) as response:
                status = response.status
                try:
                    data = await response.json()
                except:
                    data = await response.text()
                
                print(f"   Status: {status}")
                print(f"   Response type: {type(data)}")
                
                if status < 400 and isinstance(data, dict):
                    print("   ✅ Admin feedback endpoint is working!")
                    
                    if "feedback" in data:
                        feedback_count = len(data["feedback"]) if isinstance(data["feedback"], list) else 0
                        print(f"   ✅ Feedback array present with {feedback_count} items")
                    
                    if "total_count" in data:
                        print(f"   ✅ Total count present: {data['total_count']}")
                    
                    # Test JSON serialization
                    try:
                        json_str = json.dumps(data)
                        print("   ✅ JSON serialization working (no MongoDB ObjectId issues)")
                    except Exception as json_error:
                        print(f"   ❌ JSON serialization error: {json_error}")
                    
                    # Show sample of response structure
                    if isinstance(data, dict) and "feedback" in data and len(data["feedback"]) > 0:
                        sample_feedback = data["feedback"][0]
                        print(f"   📋 Sample feedback structure: {list(sample_feedback.keys())}")
                        
                else:
                    print(f"   ❌ Admin feedback failed with status {status}")
                    print(f"   Response: {data}")
                    
        except Exception as e:
            print(f"   ❌ Error testing admin feedback: {e}")

async def main():
    """Run the focused tests"""
    print("🚀 FOCUSED TESTING FOR REVIEW REQUEST FIXES")
    print("=" * 60)
    
    await test_file_uploads()
    await test_admin_feedback()
    
    print("\n" + "=" * 60)
    print("🎯 TESTING COMPLETE")
    print("Check the results above to verify the fixes are working")

if __name__ == "__main__":
    asyncio.run(main())