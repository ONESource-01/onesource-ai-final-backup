#!/usr/bin/env python3
"""
Minimal Repro Test for Context Understanding - MUST PASS
3-turn conversation test that must work identically on both endpoints
"""

import asyncio
import aiohttp
import json
import sys

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

async def ask(question: str, session_id: str, endpoint: str = "/chat/ask"):
    """Ask a question and return response"""
    headers = {
        "Authorization": "Bearer mock_dev_token",
        "Content-Type": "application/json"
    }
    
    data = {
        "question": question,
        "session_id": session_id
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            url = f"{API_BASE}{endpoint}"
            async with session.post(url, json=data, headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    # Handle v2 schema format (blocks) and legacy format (text)
                    if "blocks" in result and result["blocks"]:
                        # v2 schema - extract content from blocks
                        content = "\n".join([block.get("content", "") for block in result["blocks"]])
                        return content
                    else:
                        # Legacy format - return text or response
                        return result.get("text", result.get("response", ""))
                else:
                    error_text = await response.text()
                    raise Exception(f"HTTP {response.status}: {error_text}")
        except Exception as e:
            raise Exception(f"Request failed: {e}")

async def test_three_turn_context(endpoint: str):
    """Test 3-turn conversation context understanding"""
    print(f"\n🔍 Testing 3-turn context on {endpoint}")
    session_id = "sess-ctx-test"
    
    try:
        # Turn 1: Ask about acoustic lagging
        print("Turn 1: Ask about acoustic lagging")
        r1 = await ask("Explain acoustic lagging.", session_id, endpoint)
        print(f"✅ Turn 1 response: {len(r1)} chars")
        
        # Wait for processing
        await asyncio.sleep(1)
        
        # Turn 2: Ask "when do I need to install it?" - testing pronoun resolution
        print("Turn 2: When do I need to install it? (testing 'it' = acoustic lagging)")
        r2 = await ask("When do I need to install it?", session_id, endpoint)
        print(f"Response: {r2[:200]}...")
        
        # Verify context understanding
        if "acoustic" in r2.lower() or "lagging" in r2.lower():
            print("✅ Turn 2 PASSED: Understands 'it' refers to acoustic lagging")
        else:
            print("❌ Turn 2 FAILED: Does NOT understand context")
            raise AssertionError("Context understanding failed on turn 2")
        
        # Wait for processing
        await asyncio.sleep(1)
        
        # Turn 3: Ask about thickness - another context reference
        print("Turn 3: What thickness is typical for it? (testing continued context)")
        r3 = await ask("What thickness is typical for it?", session_id, endpoint)
        print(f"Response: {r3[:200]}...")
        
        # Verify continued context
        if "mm" in r3.lower() or "thick" in r3.lower() or "acoustic" in r3.lower():
            print("✅ Turn 3 PASSED: Continued context understanding")
        else:
            print("❌ Turn 3 FAILED: Lost context on third turn")
            raise AssertionError("Context understanding failed on turn 3")
        
        print(f"✅ ALL TESTS PASSED for {endpoint}")
        return True
        
    except Exception as e:
        print(f"❌ TEST FAILED for {endpoint}: {e}")
        return False

async def main():
    """Run the minimal repro test on both endpoints"""
    print("🚨 MINIMAL REPRO TEST - Context 3-Turn")
    print("Must pass identically on both endpoints")
    
    # Test regular endpoint
    regular_passed = await test_three_turn_context("/chat/ask")
    
    # Test enhanced endpoint  
    enhanced_passed = await test_three_turn_context("/chat/ask-enhanced")
    
    # Results
    print(f"\n📊 RESULTS:")
    print(f"Regular endpoint (/chat/ask): {'✅ PASSED' if regular_passed else '❌ FAILED'}")
    print(f"Enhanced endpoint (/chat/ask-enhanced): {'✅ PASSED' if enhanced_passed else '❌ FAILED'}")
    
    if regular_passed and enhanced_passed:
        print("🎉 PARITY ACHIEVED: Both endpoints pass context test")
        return 0
    else:
        print("💥 PARITY FAILED: Endpoints have different behavior")
        return 1

if __name__ == "__main__":
    try:
        result = asyncio.run(main())
        sys.exit(result)
    except KeyboardInterrupt:
        print("\nTest interrupted")
        sys.exit(1)
    except Exception as e:
        print(f"Test error: {e}")
        sys.exit(1)