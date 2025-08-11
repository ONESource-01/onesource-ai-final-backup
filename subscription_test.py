#!/usr/bin/env python3
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
        # Test 1: GET /api/user/subscription-status endpoint
        print("\n=== Test 1: Subscription Status Endpoint ===")
        
        # Use fresh mock auth token to simulate new user
        fresh_user_headers = {"Authorization": "Bearer fresh_user_token_123"}
        
        try:
            url = f"{API_BASE}/user/subscription-status"
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