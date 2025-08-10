#!/usr/bin/env python3
"""
URGENT: Focused Booster Endpoint Testing
Testing the booster endpoint specifically as requested by user
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

async def test_booster_endpoint():
    """Test the booster endpoint specifically"""
    print(f"🚀 URGENT BOOSTER ENDPOINT TESTING")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    print("=" * 60)
    
    async with aiohttp.ClientSession() as session:
        # Mock auth headers for testing
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        print("\n1. Testing Booster Endpoint Authentication")
        # Test without auth (should fail)
        boost_data = {
            "question": "What are fire safety requirements?",
            "target_tier": "pro"
        }
        
        try:
            url = f"{API_BASE}/chat/boost-response"
            async with session.post(url, json=boost_data) as response:
                data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status in [401, 403]:
                    print("✅ PASS: Correctly rejected unauthenticated request")
                else:
                    print(f"❌ FAIL: Expected 401/403, got {response.status}")
                    print(f"   Response: {data}")
        except Exception as e:
            print(f"❌ FAIL: Exception during auth test: {e}")
        
        print("\n2. Testing Booster Endpoint with Authentication")
        # Test with auth
        try:
            async with session.post(url, json=boost_data, headers=mock_headers) as response:
                data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                print(f"Status Code: {response.status}")
                print(f"Content Type: {response.content_type}")
                
                if response.status == 200:
                    print("✅ PASS: Booster endpoint accessible with auth")
                    
                    if isinstance(data, dict):
                        # Check for required fields
                        required_fields = ["boosted_response", "target_tier", "booster_used"]
                        missing_fields = [field for field in required_fields if field not in data]
                        
                        if not missing_fields:
                            print("✅ PASS: Response contains all required fields")
                            print(f"   Target Tier: {data.get('target_tier')}")
                            print(f"   Booster Used: {data.get('booster_used')}")
                            print(f"   Response Length: {len(data.get('boosted_response', ''))}")
                            
                            # Check if response contains boosted_response field
                            boosted_response = data.get('boosted_response', '')
                            if boosted_response and len(boosted_response) > 100:
                                print("✅ PASS: Boosted response field contains substantial content")
                                
                                # Check for enhanced formatting
                                enhanced_indicators = ['**', '•', '✅', '⚠️', '🏗️', '🚀']
                                formatting_count = sum(1 for indicator in enhanced_indicators if indicator in boosted_response)
                                
                                if formatting_count >= 2:
                                    print(f"✅ PASS: Enhanced formatting detected ({formatting_count} indicators)")
                                else:
                                    print(f"⚠️  WARNING: Limited formatting detected ({formatting_count} indicators)")
                            else:
                                print("❌ FAIL: Boosted response field missing or too short")
                        else:
                            print(f"❌ FAIL: Missing required fields: {missing_fields}")
                            print(f"   Available fields: {list(data.keys())}")
                    else:
                        print(f"❌ FAIL: Response is not JSON dict: {type(data)}")
                        print(f"   Response: {data}")
                else:
                    print(f"❌ FAIL: Expected 200, got {response.status}")
                    print(f"   Response: {data}")
                    
        except Exception as e:
            print(f"❌ FAIL: Exception during booster test: {e}")
        
        print("\n3. Testing Fire Safety Question Specifically")
        # Test the specific question mentioned in the request
        fire_safety_data = {
            "question": "What are fire safety requirements for high-rise buildings in Australia?",
            "target_tier": "pro"
        }
        
        try:
            async with session.post(url, json=fire_safety_data, headers=mock_headers) as response:
                data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status == 200 and isinstance(data, dict):
                    boosted_response = data.get('boosted_response', '')
                    if boosted_response:
                        print("✅ PASS: Fire safety question processed successfully")
                        print(f"   Response length: {len(boosted_response)} characters")
                        
                        # Check for Australian standards references
                        au_standards = ['AS 1851', 'AS 4072', 'AS 2118', 'AS 1530', 'BCA', 'NCC']
                        found_standards = [std for std in au_standards if std in boosted_response]
                        
                        if found_standards:
                            print(f"✅ PASS: Australian standards referenced: {found_standards}")
                        else:
                            print("⚠️  WARNING: No Australian standards found in response")
                            
                        # Show first 200 chars of response
                        print(f"   Response preview: {boosted_response[:200]}...")
                    else:
                        print("❌ FAIL: No boosted response content")
                else:
                    print(f"❌ FAIL: Fire safety question failed - Status: {response.status}")
                    print(f"   Response: {data}")
                    
        except Exception as e:
            print(f"❌ FAIL: Exception during fire safety test: {e}")
        
        print("\n4. Testing Daily Limits")
        # Test multiple requests to check daily limits
        print("Testing daily limit enforcement...")
        
        for i in range(3):  # Try 3 requests
            try:
                test_data = {
                    "question": f"Test question {i+1} for daily limit testing",
                    "target_tier": "pro"
                }
                
                async with session.post(url, json=test_data, headers=mock_headers) as response:
                    data = await response.json() if response.content_type == 'application/json' else await response.text()
                    
                    if response.status == 200:
                        print(f"✅ Request {i+1}: Success")
                    elif response.status == 429:
                        print(f"✅ Request {i+1}: Daily limit reached (429) - Limit enforcement working")
                        break
                    else:
                        print(f"⚠️  Request {i+1}: Status {response.status}")
                        
            except Exception as e:
                print(f"❌ Request {i+1}: Exception: {e}")
        
        print("\n5. Testing Error Handling")
        # Test invalid requests
        invalid_requests = [
            ({}, "Empty request"),
            ({"question": ""}, "Empty question"),
            ({"question": "test"}, "Missing target_tier"),
            ({"target_tier": "pro"}, "Missing question"),
            ({"question": "test", "target_tier": "invalid"}, "Invalid target_tier")
        ]
        
        for invalid_data, description in invalid_requests:
            try:
                async with session.post(url, json=invalid_data, headers=mock_headers) as response:
                    data = await response.json() if response.content_type == 'application/json' else await response.text()
                    
                    if response.status == 400:
                        print(f"✅ PASS: {description} correctly rejected (400)")
                    else:
                        print(f"⚠️  {description}: Status {response.status} (expected 400)")
                        
            except Exception as e:
                print(f"❌ {description}: Exception: {e}")
        
        print("\n" + "=" * 60)
        print("🚀 BOOSTER ENDPOINT TESTING COMPLETE")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_booster_endpoint())