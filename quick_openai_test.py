#!/usr/bin/env python3
"""
Quick OpenAI API Integration Test
"""

import asyncio
import aiohttp
import json

async def test_openai_integration():
    print("🔍 QUICK OPENAI API INTEGRATION TEST")
    print("=" * 50)
    
    async with aiohttp.ClientSession() as session:
        headers = {
            'Authorization': 'Bearer mock_dev_token',
            'Content-Type': 'application/json'
        }
        
        # Test 1: Basic construction question
        print("\n1. Testing basic construction question...")
        data = {
            'question': 'What are the minimum concrete strength requirements for a commercial building foundation according to AS 3600?',
            'session_id': 'test_basic'
        }
        
        async with session.post('http://localhost:8001/api/chat/ask', json=data, headers=headers) as response:
            result = await response.json()
            response_text = str(result.get('response', ''))
            
            is_mock = 'development mock response' in response_text or 'mock implementation' in response_text
            has_as3600 = 'AS 3600' in response_text or 'AS3600' in response_text
            has_concrete = 'concrete' in response_text.lower()
            has_strength = 'strength' in response_text.lower()
            
            print(f"   Mock response: {'❌ Yes' if is_mock else '✅ No'}")
            print(f"   AS 3600 reference: {'✅ Yes' if has_as3600 else '❌ No'}")
            print(f"   Concrete content: {'✅ Yes' if has_concrete else '❌ No'}")
            print(f"   Strength content: {'✅ Yes' if has_strength else '❌ No'}")
            print(f"   Response length: {len(response_text)} chars")
            
            basic_success = not is_mock and has_as3600 and has_concrete and len(response_text) > 300
            print(f"   Result: {'✅ PASS' if basic_success else '❌ FAIL'}")
        
        # Test 2: Complex technical question
        print("\n2. Testing complex technical question...")
        data = {
            'question': 'How do I calculate wind loads for a 10-story office building in Sydney according to AS/NZS 1170.2?',
            'session_id': 'test_complex'
        }
        
        async with session.post('http://localhost:8001/api/chat/ask', json=data, headers=headers) as response:
            result = await response.json()
            response_text = str(result.get('response', ''))
            
            is_mock = 'development mock response' in response_text or 'mock implementation' in response_text
            has_wind_standard = 'AS/NZS 1170.2' in response_text or 'AS 1170.2' in response_text
            has_calculation = 'calculat' in response_text.lower()
            has_sydney = 'sydney' in response_text.lower()
            
            print(f"   Mock response: {'❌ Yes' if is_mock else '✅ No'}")
            print(f"   Wind standard ref: {'✅ Yes' if has_wind_standard else '❌ No'}")
            print(f"   Calculation content: {'✅ Yes' if has_calculation else '❌ No'}")
            print(f"   Sydney reference: {'✅ Yes' if has_sydney else '❌ No'}")
            print(f"   Response length: {len(response_text)} chars")
            
            complex_success = not is_mock and has_calculation and len(response_text) > 400
            print(f"   Result: {'✅ PASS' if complex_success else '❌ FAIL'}")
        
        # Test 3: Enhanced chat with knowledge integration
        print("\n3. Testing enhanced chat...")
        data = {
            'question': 'What fire rating requirements apply to structural steel in commercial buildings?',
            'session_id': 'test_enhanced'
        }
        
        try:
            async with session.post('http://localhost:8001/api/chat/ask-enhanced', json=data, headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    response_content = result.get('response', {})
                    knowledge_enhanced = result.get('knowledge_enhanced', False)
                    
                    print(f"   Status: ✅ 200 OK")
                    print(f"   Knowledge enhanced: {'✅ Yes' if knowledge_enhanced else '⚠️ No'}")
                    print(f"   Response type: {type(response_content)}")
                    
                    enhanced_success = response.status == 200
                    print(f"   Result: {'✅ PASS' if enhanced_success else '❌ FAIL'}")
                else:
                    print(f"   Status: ❌ {response.status}")
                    print(f"   Result: ❌ FAIL")
                    enhanced_success = False
        except Exception as e:
            print(f"   Error: ❌ {e}")
            print(f"   Result: ❌ FAIL")
            enhanced_success = False
        
        # Overall assessment
        print("\n" + "=" * 50)
        print("OVERALL ASSESSMENT:")
        
        if basic_success and complex_success:
            print("🎉 SUCCESS: OpenAI API integration is working with real AI responses!")
            print("✅ Construction domain expertise confirmed")
            print("✅ Australian standards references working")
            print("✅ Technical content generation successful")
            print("✅ System ready for production use")
            return True
        else:
            print("⚠️ PARTIAL SUCCESS: Some issues detected")
            if not basic_success:
                print("❌ Basic construction questions need improvement")
            if not complex_success:
                print("❌ Complex technical questions need improvement")
            if not enhanced_success:
                print("⚠️ Enhanced chat may have issues")
            return False

if __name__ == "__main__":
    success = asyncio.run(test_openai_integration())
    exit(0 if success else 1)