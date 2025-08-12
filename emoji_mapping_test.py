#!/usr/bin/env python3
"""
Enhanced Emoji Mapping Consistency Test
Tests the specific issue mentioned in the review request
"""

import asyncio
import aiohttp
import json
import os

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

async def test_enhanced_emoji_mapping_consistency():
    """🚨 CRITICAL: Test Enhanced Emoji Mapping Consistency between regular and enhanced chat endpoints"""
    print("🚨 === ENHANCED EMOJI MAPPING CONSISTENCY TESTING ===")
    print(f"🔗 Backend URL: {BACKEND_URL}")
    
    async with aiohttp.ClientSession() as session:
        mock_headers = {"Authorization": "Bearer mock_dev_token", "Content-Type": "application/json"}
        
        # Use the EXACT question from the review request
        test_question = "What are the fire safety requirements for a 3-story commercial building?"
        
        print(f"🔍 Testing question: '{test_question}'")
        print("📋 Comparing response formats between regular and enhanced endpoints...")
        
        # Test 1: Regular chat endpoint (/api/chat/ask)
        print("\n1️⃣ Testing POST /api/chat/ask (Regular Chat)")
        regular_data = {
            "question": test_question,
            "session_id": "emoji_test_regular"
        }
        
        try:
            url = f"{API_BASE}/chat/ask"
            async with session.post(url, json=regular_data, headers=mock_headers) as response:
                regular_status = response.status
                regular_response = await response.json()
                regular_success = regular_status < 400
        except Exception as e:
            print(f"   ❌ Error calling regular chat endpoint: {e}")
            regular_success = False
            regular_response = str(e)
            regular_status = 0
        
        regular_has_tech_emoji = False
        regular_has_mentoring_emoji = False
        regular_response_content = ""
        
        if regular_success and isinstance(regular_response, dict) and "response" in regular_response:
            regular_response_content = str(regular_response["response"])
            
            # Check for Enhanced Emoji Mapping emojis
            regular_has_tech_emoji = "🔧 **Technical Answer**" in regular_response_content
            regular_has_mentoring_emoji = "🧠 **Mentoring Insight**" in regular_response_content
            
            print(f"   📝 Response length: {len(regular_response_content)} characters")
            print(f"   🔧 Has '🔧 **Technical Answer**': {regular_has_tech_emoji}")
            print(f"   🧠 Has '🧠 **Mentoring Insight**': {regular_has_mentoring_emoji}")
            
            # Show first 300 chars for analysis
            preview = regular_response_content[:300] + "..." if len(regular_response_content) > 300 else regular_response_content
            print(f"   📄 Response preview: {preview}")
            
            print(f"   ✅ Regular Chat - API Response: SUCCESS (Received {len(regular_response_content)} char response)")
        else:
            print(f"   ❌ Regular Chat - API Response: FAILED (Status: {regular_status})")
            print(f"   📄 Error details: {regular_response}")
        
        # Test 2: Enhanced chat endpoint (/api/chat/ask-enhanced)
        print("\n2️⃣ Testing POST /api/chat/ask-enhanced (Enhanced Chat)")
        enhanced_data = {
            "question": test_question,
            "session_id": "emoji_test_enhanced"
        }
        
        try:
            url = f"{API_BASE}/chat/ask-enhanced"
            async with session.post(url, json=enhanced_data, headers=mock_headers) as response:
                enhanced_status = response.status
                enhanced_response = await response.json()
                enhanced_success = enhanced_status < 400
        except Exception as e:
            print(f"   ❌ Error calling enhanced chat endpoint: {e}")
            enhanced_success = False
            enhanced_response = str(e)
            enhanced_status = 0
        
        enhanced_has_tech_emoji = False
        enhanced_has_mentoring_emoji = False
        enhanced_response_content = ""
        
        if enhanced_success and isinstance(enhanced_response, dict) and "response" in enhanced_response:
            enhanced_response_content = str(enhanced_response["response"])
            
            # Check for Enhanced Emoji Mapping emojis
            enhanced_has_tech_emoji = "🔧 **Technical Answer**" in enhanced_response_content
            enhanced_has_mentoring_emoji = "🧠 **Mentoring Insight**" in enhanced_response_content
            
            print(f"   📝 Response length: {len(enhanced_response_content)} characters")
            print(f"   🔧 Has '🔧 **Technical Answer**': {enhanced_has_tech_emoji}")
            print(f"   🧠 Has '🧠 **Mentoring Insight**': {enhanced_has_mentoring_emoji}")
            
            # Show first 300 chars for analysis
            preview = enhanced_response_content[:300] + "..." if len(enhanced_response_content) > 300 else enhanced_response_content
            print(f"   📄 Response preview: {preview}")
            
            print(f"   ✅ Enhanced Chat - API Response: SUCCESS (Received {len(enhanced_response_content)} char response)")
        else:
            print(f"   ❌ Enhanced Chat - API Response: FAILED (Status: {enhanced_status})")
            print(f"   📄 Error details: {enhanced_response}")
        
        # Test 3: Compare consistency
        print("\n3️⃣ CONSISTENCY ANALYSIS")
        
        if regular_success and enhanced_success:
            # Check if both endpoints have the required emojis
            consistency_check = (
                regular_has_tech_emoji == enhanced_has_tech_emoji and
                regular_has_mentoring_emoji == enhanced_has_mentoring_emoji and
                regular_has_tech_emoji and regular_has_mentoring_emoji  # Both should be True
            )
            
            if consistency_check:
                print("   ✅ CONSISTENCY ACHIEVED: Both endpoints use 🔧 and 🧠 emojis correctly")
                print("   🎯 Enhanced Emoji Mapping Consistency: SUCCESS")
                return True
            else:
                print("   ❌ CONSISTENCY BROKEN:")
                print(f"      Regular chat - 🔧: {regular_has_tech_emoji}, 🧠: {regular_has_mentoring_emoji}")
                print(f"      Enhanced chat - 🔧: {enhanced_has_tech_emoji}, 🧠: {enhanced_has_mentoring_emoji}")
                
                # Identify the specific issue
                if not regular_has_tech_emoji or not regular_has_mentoring_emoji:
                    print("   🔍 ROOT CAUSE: Regular chat endpoint missing Enhanced Emoji Mapping")
                    if not regular_has_tech_emoji:
                        print("      - Missing '🔧 **Technical Answer**' emoji")
                    if not regular_has_mentoring_emoji:
                        print("      - Missing '🧠 **Mentoring Insight**' emoji")
                
                if not enhanced_has_tech_emoji or not enhanced_has_mentoring_emoji:
                    print("   🔍 UNEXPECTED: Enhanced chat endpoint also missing emojis")
                
                print("   🎯 Enhanced Emoji Mapping Consistency: FAILED")
                return False
        else:
            print("   ⚠️ Cannot compare - one or both endpoints failed")
            print("   🎯 Enhanced Emoji Mapping Consistency: CANNOT DETERMINE")
            return False
        
        print("\n🎯 FINAL VERDICT:")
        if regular_success and enhanced_success:
            if regular_has_tech_emoji and regular_has_mentoring_emoji and enhanced_has_tech_emoji and enhanced_has_mentoring_emoji:
                print("✅ Enhanced Emoji Mapping Consistency: ACHIEVED")
                print("   Both endpoints correctly use 🔧 **Technical Answer** and 🧠 **Mentoring Insight**")
                return True
            else:
                print("❌ Enhanced Emoji Mapping Consistency: BROKEN")
                print("   Regular and/or enhanced endpoints missing required emoji formatting")
                print("   🚨 URGENT FIX REQUIRED: Update regular chat endpoint to match enhanced formatting")
                return False
        else:
            print("⚠️ Enhanced Emoji Mapping Consistency: CANNOT DETERMINE")
            print("   One or both endpoints failed to respond")
            return False

async def main():
    result = await test_enhanced_emoji_mapping_consistency()
    if result:
        print("\n🎉 TEST RESULT: PASSED")
    else:
        print("\n🚨 TEST RESULT: FAILED")
    return result

if __name__ == "__main__":
    asyncio.run(main())