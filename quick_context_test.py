#!/usr/bin/env python3
"""
Quick context test to verify multi-turn conversation functionality
"""

import requests
import json
import sys
import time

def test_context():
    base_url = 'http://localhost:8001'
    session_id = f'context_test_{int(time.time())}'
    
    print("🧪 Quick Context Test")
    print("=" * 50)
    
    # Test 1: First question
    print("📝 Step 1: Ask about acoustic lagging...")
    try:
        response1 = requests.post(f'{base_url}/api/chat/ask', 
                                json={
                                    'question': 'Tell me about acoustic lagging requirements in Australia',
                                    'session_id': session_id
                                },
                                headers={'Authorization': 'Bearer mock_test_token'},
                                timeout=15)
        
        if response1.status_code != 200:
            print(f"❌ First request failed: {response1.status_code}")
            return False
            
        data1 = response1.json()
        print(f"✅ First response received ({response1.status_code})")
        print(f"   Title: {data1.get('title', 'N/A')}")
        
    except Exception as e:
        print(f"❌ First request error: {e}")
        return False
    
    # Test 2: Follow-up question with context dependency
    print("\n📝 Step 2: Ask follow-up question with pronoun...")
    try:
        response2 = requests.post(f'{base_url}/api/chat/ask', 
                                json={
                                    'question': 'When do I need to install it?',
                                    'session_id': session_id  # Same session
                                },
                                headers={'Authorization': 'Bearer mock_test_token'},
                                timeout=15)
        
        if response2.status_code != 200:
            print(f"❌ Second request failed: {response2.status_code}")
            return False
            
        data2 = response2.json()
        print(f"✅ Second response received ({response2.status_code})")
        print(f"   Title: {data2.get('title', 'N/A')}")
        
        # Check if response shows context understanding
        response_text = ""
        if "blocks" in data2:
            for block in data2["blocks"]:
                response_text += block.get("content", "") + " "
        
        response_text = response_text.lower()
        
        # Look for signs of context understanding
        context_indicators = ["acoustic", "lagging", "sound", "insulation", "install"]
        context_understood = any(indicator in response_text for indicator in context_indicators)
        
        if context_understood:
            print("✅ Context appears to be understood!")
            print(f"   Found context indicators in response")
            return True
        else:
            print("❌ Context NOT understood - response doesn't reference acoustic lagging")
            print(f"   Response content preview: {response_text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Second request error: {e}")
        return False

if __name__ == "__main__":
    success = test_context()
    print(f"\n🎯 RESULT: {'PASS' if success else 'FAIL'}")
    sys.exit(0 if success else 1)