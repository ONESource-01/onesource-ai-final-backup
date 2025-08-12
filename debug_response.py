#!/usr/bin/env python3
"""
Debug script to see the actual response structure
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

async def debug_response():
    """Debug the actual response structure"""
    print("🔍 DEBUG: Checking actual response structure")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    
    mock_headers = {"Authorization": "Bearer mock_dev_token"}
    test_question = "What are fire safety requirements?"
    
    async with aiohttp.ClientSession() as session:
        
        # Test enhanced chat endpoint
        print("\n🔍 Testing POST /api/chat/ask-enhanced")
        enhanced_data = {
            "question": test_question,
            "session_id": "debug_test_enhanced"
        }
        
        try:
            url = f"{API_BASE}/chat/ask-enhanced"
            async with session.post(url, json=enhanced_data, headers=mock_headers) as response:
                status = response.status
                response_data = await response.json()
                
                print(f"Status: {status}")
                print(f"Response keys: {list(response_data.keys())}")
                
                if "response" in response_data:
                    response_obj = response_data["response"]
                    print(f"Response object keys: {list(response_obj.keys())}")
                    
                    if "technical" in response_obj:
                        technical_content = response_obj["technical"]
                        print(f"Technical content length: {len(technical_content)}")
                        print(f"Technical content preview (first 500 chars):")
                        print(technical_content[:500])
                        print("\n" + "="*50)
                        
                        # Check for emojis
                        has_correct_emoji = "🤓" in technical_content
                        has_wrong_brain = "🧠" in technical_content
                        has_wrong_bulb = "💡" in technical_content
                        
                        print(f"🤓 Has correct emoji: {has_correct_emoji}")
                        print(f"🧠 Has wrong brain emoji: {has_wrong_brain}")
                        print(f"💡 Has wrong bulb emoji: {has_wrong_bulb}")
                        
                        # Show all emoji occurrences
                        if "🤓" in technical_content:
                            print("Found 🤓 at positions:", [i for i, c in enumerate(technical_content) if c == "🤓"])
                        if "🧠" in technical_content:
                            print("Found 🧠 at positions:", [i for i, c in enumerate(technical_content) if c == "🧠"])
                        if "💡" in technical_content:
                            print("Found 💡 at positions:", [i for i, c in enumerate(technical_content) if c == "💡"])
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_response())