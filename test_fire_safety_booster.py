#!/usr/bin/env python3
"""
Test the specific fire safety question with booster
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

async def test_fire_safety_booster():
    """Test the specific fire safety question with booster"""
    print(f"🔥 TESTING FIRE SAFETY BOOSTER QUESTION")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    async with aiohttp.ClientSession() as session:
        # Mock auth headers for testing
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Test the specific fire safety question
        fire_safety_data = {
            "question": "What are fire safety requirements for high-rise buildings in Australia?",
            "target_tier": "pro"
        }
        
        try:
            url = f"{API_BASE}/chat/boost-response"
            async with session.post(url, json=fire_safety_data, headers=mock_headers) as response:
                data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                print(f"Status Code: {response.status}")
                print(f"Content Type: {response.content_type}")
                
                if response.status == 200 and isinstance(data, dict):
                    print("✅ SUCCESS: Fire safety booster question processed!")
                    
                    # Check required fields
                    if "boosted_response" in data:
                        boosted_response = data["boosted_response"]
                        print(f"✅ Boosted response length: {len(boosted_response)} characters")
                        
                        # Check for Australian standards references
                        au_standards = ['AS 1851', 'AS 4072', 'AS 2118', 'AS 1530', 'BCA', 'NCC']
                        found_standards = [std for std in au_standards if std in boosted_response]
                        
                        if found_standards:
                            print(f"✅ Australian standards referenced: {found_standards}")
                        else:
                            print("⚠️  No Australian standards found in response")
                        
                        # Check for enhanced formatting
                        enhanced_indicators = ['**', '•', '✅', '⚠️', '🏗️', '🚀']
                        formatting_count = sum(1 for indicator in enhanced_indicators if indicator in boosted_response)
                        print(f"✅ Enhanced formatting indicators found: {formatting_count}")
                        
                        # Show response preview
                        print("\n📄 RESPONSE PREVIEW:")
                        print("-" * 40)
                        print(boosted_response[:500] + "..." if len(boosted_response) > 500 else boosted_response)
                        print("-" * 40)
                        
                        # Check other fields
                        print(f"✅ Target Tier: {data.get('target_tier', 'N/A')}")
                        print(f"✅ Booster Used: {data.get('booster_used', 'N/A')}")
                        print(f"✅ Remaining Boosters: {data.get('remaining_boosters', 'N/A')}")
                        
                        # Check for daily limit tracking
                        if "daily_usage" in data:
                            print(f"✅ Daily Usage Tracking: {data['daily_usage']}")
                        
                    else:
                        print("❌ FAIL: No boosted_response field in response")
                        print(f"Available fields: {list(data.keys())}")
                        
                elif response.status == 429:
                    print("⚠️  Daily limit reached - this confirms limit enforcement is working")
                    print(f"Response: {data}")
                else:
                    print(f"❌ FAIL: Unexpected status {response.status}")
                    print(f"Response: {data}")
                    
        except Exception as e:
            print(f"❌ FAIL: Exception during test: {e}")
        
        print("\n" + "=" * 60)
        print("🔥 FIRE SAFETY BOOSTER TEST COMPLETE")

if __name__ == "__main__":
    asyncio.run(test_fire_safety_booster())