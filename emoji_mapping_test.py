#!/usr/bin/env python3
"""
🚨 CRITICAL: Enhanced Emoji Mapping Consistency Fix Verification
Testing the DEFINITIVE Enhanced Emoji Mapping fix with professional formatting
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

async def test_enhanced_emoji_mapping():
    """🚨 CRITICAL: Test Enhanced Emoji Mapping Consistency Fix from Review Request"""
    print("🚨 === ENHANCED EMOJI MAPPING CONSISTENCY FIX VERIFICATION ===")
    print("Testing the DEFINITIVE Enhanced Emoji Mapping fix with professional formatting")
    print("🎯 CRITICAL VERIFICATION: All responses should show 🤓 for Mentoring Insight (NOT 🧠 or 💡)")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    
    mock_headers = {"Authorization": "Bearer mock_dev_token"}
    
    # Use the EXACT question from the review request
    test_question = "What are fire safety requirements?"
    
    print(f"🔍 Testing question: '{test_question}'")
    print("📋 Verifying Enhanced Emoji Mapping format...")
    print("🎯 Expected Enhanced Emoji Mapping:")
    print("   🔧 Technical Answer")
    print("   🤓 Mentoring Insight (MUST be 🤓 nerd face, NOT 🧠 or 💡)")
    print("   📋 Next Steps")
    print("   📊 Code Requirements")
    print("   ✅ Compliance Verification")
    print("   🔄 Alternative Solutions")
    print("   🏛️ Authority Requirements")
    print("   📄 Documentation Needed")
    print("   ⚙️ Workflow Recommendations")
    print("   ❓ Clarifying Questions")
    
    async with aiohttp.ClientSession() as session:
        
        # Test 1: Regular chat endpoint (/api/chat/ask) - MAIN FOCUS
        print("\n1️⃣ Testing POST /api/chat/ask (Regular Chat) - MAIN FOCUS")
        regular_data = {
            "question": test_question,
            "session_id": "fire_safety_test_regular"
        }
        
        try:
            url = f"{API_BASE}/chat/ask"
            async with session.post(url, json=regular_data, headers=mock_headers) as response:
                regular_status = response.status
                regular_response = await response.json()
                regular_success = regular_status < 400
        except Exception as e:
            print(f"   ❌ Regular chat request failed: {e}")
            regular_success = False
            regular_response = {}
            regular_status = 0
        
        regular_has_tech_emoji = False
        regular_has_mentoring_emoji_correct = False
        regular_has_mentoring_emoji_wrong = False
        regular_has_fire_content = False
        regular_response_content = ""
        
        if regular_success and isinstance(regular_response, dict) and "response" in regular_response:
            regular_response_content = str(regular_response["response"])
            
            # Check for Enhanced Emoji Mapping emojis - CRITICAL: Must be 🤓 NOT 🧠 or 💡
            regular_has_tech_emoji = "🔧 **Technical Answer**" in regular_response_content or "🔧 Technical Answer" in regular_response_content
            regular_has_mentoring_emoji_correct = "🤓 **Mentoring Insight**" in regular_response_content or "🤓 Mentoring Insight" in regular_response_content
            regular_has_mentoring_emoji_wrong = ("🧠 **Mentoring Insight**" in regular_response_content or 
                                               "💡 **Mentoring Insight**" in regular_response_content or
                                               "🧠 Mentoring Insight" in regular_response_content or
                                               "💡 Mentoring Insight" in regular_response_content)
            
            # Check for fire safety specific content
            fire_indicators = [
                "fire safety" in regular_response_content.lower(),
                "AS 1851" in regular_response_content,
                "AS 2118" in regular_response_content,
                "BCA" in regular_response_content,
                "NCC" in regular_response_content,
                "sprinkler" in regular_response_content.lower(),
                "fire protection" in regular_response_content.lower(),
                "smoke alarm" in regular_response_content.lower()
            ]
            regular_has_fire_content = any(fire_indicators)
            
            print(f"   📝 Response length: {len(regular_response_content)} characters")
            print(f"   🔧 Has '🔧 Technical Answer': {regular_has_tech_emoji}")
            print(f"   🤓 Has '🤓 Mentoring Insight' (CORRECT): {regular_has_mentoring_emoji_correct}")
            print(f"   🚨 Has wrong emoji (🧠 or 💡): {regular_has_mentoring_emoji_wrong}")
            print(f"   🔥 Has fire safety content: {regular_has_fire_content}")
            
            # Show first 500 chars for analysis
            preview = regular_response_content[:500] + "..." if len(regular_response_content) > 500 else regular_response_content
            print(f"   📄 Response preview: {preview}")
            
            # CRITICAL CHECK: Must use 🤓 emoji, NOT 🧠 or 💡
            if regular_has_mentoring_emoji_correct and not regular_has_mentoring_emoji_wrong:
                print("   ✅ Regular Chat - CORRECT Mentoring Emoji (🤓): Uses 🤓 nerd face emoji as required")
            elif regular_has_mentoring_emoji_wrong:
                wrong_emojis = []
                if "🧠" in regular_response_content:
                    wrong_emojis.append("🧠 brain")
                if "💡" in regular_response_content:
                    wrong_emojis.append("💡 lightbulb")
                print(f"   ❌ Regular Chat - WRONG Mentoring Emoji: Uses incorrect emoji(s): {', '.join(wrong_emojis)} instead of 🤓")
            else:
                print("   ❌ Regular Chat - Missing Mentoring Emoji: No Mentoring Insight section found")
            
            # Check technical answer emoji
            if regular_has_tech_emoji:
                print("   ✅ Regular Chat - Technical Answer Emoji: Has 🔧 Technical Answer")
            else:
                print("   ❌ Regular Chat - Missing Technical Answer: Missing 🔧 Technical Answer section")
            
        else:
            print(f"   ❌ Failed to get response from regular chat endpoint (Status: {regular_status})")
        
        # Test 2: Enhanced chat endpoint (/api/chat/ask-enhanced) - COMPARISON
        print("\n2️⃣ Testing POST /api/chat/ask-enhanced (Enhanced Chat) - COMPARISON")
        enhanced_data = {
            "question": test_question,
            "session_id": "fire_safety_test_enhanced"
        }
        
        try:
            url = f"{API_BASE}/chat/ask-enhanced"
            async with session.post(url, json=enhanced_data, headers=mock_headers) as response:
                enhanced_status = response.status
                enhanced_response = await response.json()
                enhanced_success = enhanced_status < 400
        except Exception as e:
            print(f"   ❌ Enhanced chat request failed: {e}")
            enhanced_success = False
            enhanced_response = {}
            enhanced_status = 0
        
        enhanced_has_tech_emoji = False
        enhanced_has_mentoring_emoji_correct = False
        enhanced_has_mentoring_emoji_wrong = False
        enhanced_has_fire_content = False
        enhanced_response_content = ""
        
        if enhanced_success and isinstance(enhanced_response, dict) and "response" in enhanced_response:
            enhanced_response_content = str(enhanced_response["response"])
            
            # Check for Enhanced Emoji Mapping emojis - CRITICAL: Must be 🤓 NOT 🧠 or 💡
            enhanced_has_tech_emoji = "🔧 **Technical Answer**" in enhanced_response_content or "🔧 Technical Answer" in enhanced_response_content
            enhanced_has_mentoring_emoji_correct = "🤓 **Mentoring Insight**" in enhanced_response_content or "🤓 Mentoring Insight" in enhanced_response_content
            enhanced_has_mentoring_emoji_wrong = ("🧠 **Mentoring Insight**" in enhanced_response_content or 
                                                "💡 **Mentoring Insight**" in enhanced_response_content or
                                                "🧠 Mentoring Insight" in enhanced_response_content or
                                                "💡 Mentoring Insight" in enhanced_response_content)
            
            # Check for fire safety specific content
            fire_indicators = [
                "fire safety" in enhanced_response_content.lower(),
                "AS 1851" in enhanced_response_content,
                "AS 2118" in enhanced_response_content,
                "BCA" in enhanced_response_content,
                "NCC" in enhanced_response_content,
                "sprinkler" in enhanced_response_content.lower(),
                "fire protection" in enhanced_response_content.lower(),
                "smoke alarm" in enhanced_response_content.lower()
            ]
            enhanced_has_fire_content = any(fire_indicators)
            
            print(f"   📝 Response length: {len(enhanced_response_content)} characters")
            print(f"   🔧 Has '🔧 Technical Answer': {enhanced_has_tech_emoji}")
            print(f"   🤓 Has '🤓 Mentoring Insight' (CORRECT): {enhanced_has_mentoring_emoji_correct}")
            print(f"   🚨 Has wrong emoji (🧠 or 💡): {enhanced_has_mentoring_emoji_wrong}")
            print(f"   🔥 Has fire safety content: {enhanced_has_fire_content}")
            
            # Show first 500 chars for analysis
            preview = enhanced_response_content[:500] + "..." if len(enhanced_response_content) > 500 else enhanced_response_content
            print(f"   📄 Response preview: {preview}")
            
            # CRITICAL CHECK: Must use 🤓 emoji, NOT 🧠 or 💡
            if enhanced_has_mentoring_emoji_correct and not enhanced_has_mentoring_emoji_wrong:
                print("   ✅ Enhanced Chat - CORRECT Mentoring Emoji (🤓): Uses 🤓 nerd face emoji as required")
            elif enhanced_has_mentoring_emoji_wrong:
                wrong_emojis = []
                if "🧠" in enhanced_response_content:
                    wrong_emojis.append("🧠 brain")
                if "💡" in enhanced_response_content:
                    wrong_emojis.append("💡 lightbulb")
                print(f"   ❌ Enhanced Chat - WRONG Mentoring Emoji: Uses incorrect emoji(s): {', '.join(wrong_emojis)} instead of 🤓")
            else:
                print("   ❌ Enhanced Chat - Missing Mentoring Emoji: No Mentoring Insight section found")
            
        else:
            print(f"   ❌ Failed to get response from enhanced chat endpoint (Status: {enhanced_status})")
        
        # Test 3: Boost response endpoint (/api/chat/boost-response) - THIRD ENDPOINT
        print("\n3️⃣ Testing POST /api/chat/boost-response (Boost Response) - THIRD ENDPOINT")
        boost_data = {
            "question": test_question,
            "target_tier": "pro"
        }
        
        try:
            url = f"{API_BASE}/chat/boost-response"
            async with session.post(url, json=boost_data, headers=mock_headers) as response:
                boost_status = response.status
                boost_response = await response.json()
                boost_success = boost_status < 400
        except Exception as e:
            print(f"   ❌ Boost response request failed: {e}")
            boost_success = False
            boost_response = {}
            boost_status = 0
        
        boost_has_tech_emoji = False
        boost_has_mentoring_emoji_correct = False
        boost_has_mentoring_emoji_wrong = False
        boost_has_fire_content = False
        boost_response_content = ""
        
        if boost_success and isinstance(boost_response, dict) and "boosted_response" in boost_response:
            boost_response_content = str(boost_response["boosted_response"])
            
            # Check for Enhanced Emoji Mapping emojis - CRITICAL: Must be 🤓 NOT 🧠 or 💡
            boost_has_tech_emoji = "🔧 **Technical Answer**" in boost_response_content or "🔧 Technical Answer" in boost_response_content
            boost_has_mentoring_emoji_correct = "🤓 **Mentoring Insight**" in boost_response_content or "🤓 Mentoring Insight" in boost_response_content
            boost_has_mentoring_emoji_wrong = ("🧠 **Mentoring Insight**" in boost_response_content or 
                                             "💡 **Mentoring Insight**" in boost_response_content or
                                             "🧠 Mentoring Insight" in boost_response_content or
                                             "💡 Mentoring Insight" in boost_response_content)
            
            # Check for fire safety specific content
            fire_indicators = [
                "fire safety" in boost_response_content.lower(),
                "AS 1851" in boost_response_content,
                "AS 2118" in boost_response_content,
                "BCA" in boost_response_content,
                "NCC" in boost_response_content,
                "sprinkler" in boost_response_content.lower(),
                "fire protection" in boost_response_content.lower(),
                "smoke alarm" in boost_response_content.lower()
            ]
            boost_has_fire_content = any(fire_indicators)
            
            print(f"   📝 Response length: {len(boost_response_content)} characters")
            print(f"   🔧 Has '🔧 Technical Answer': {boost_has_tech_emoji}")
            print(f"   🤓 Has '🤓 Mentoring Insight' (CORRECT): {boost_has_mentoring_emoji_correct}")
            print(f"   🚨 Has wrong emoji (🧠 or 💡): {boost_has_mentoring_emoji_wrong}")
            print(f"   🔥 Has fire safety content: {boost_has_fire_content}")
            
            # Show first 500 chars for analysis
            preview = boost_response_content[:500] + "..." if len(boost_response_content) > 500 else boost_response_content
            print(f"   📄 Response preview: {preview}")
            
            # CRITICAL CHECK: Must use 🤓 emoji, NOT 🧠 or 💡
            if boost_has_mentoring_emoji_correct and not boost_has_mentoring_emoji_wrong:
                print("   ✅ Boost Response - CORRECT Mentoring Emoji (🤓): Uses 🤓 nerd face emoji as required")
            elif boost_has_mentoring_emoji_wrong:
                wrong_emojis = []
                if "🧠" in boost_response_content:
                    wrong_emojis.append("🧠 brain")
                if "💡" in boost_response_content:
                    wrong_emojis.append("💡 lightbulb")
                print(f"   ❌ Boost Response - WRONG Mentoring Emoji: Uses incorrect emoji(s): {', '.join(wrong_emojis)} instead of 🤓")
            else:
                print("   ❌ Boost Response - Missing Mentoring Emoji: No Mentoring Insight section found")
            
        elif boost_status == 429:
            # Daily limit reached - this is expected behavior
            error_message = boost_response.get("detail", "Unknown error") if isinstance(boost_response, dict) else str(boost_response)
            print(f"   ⚠️ Boost endpoint returned 429 (daily limit) - this is expected behavior: {error_message}")
        else:
            print(f"   ❌ Failed to get response from boost endpoint (Status: {boost_status})")
        
        # Test 4: CRITICAL CONSISTENCY ANALYSIS
        print("\n4️⃣ CRITICAL ENHANCED EMOJI MAPPING CONSISTENCY ANALYSIS")
        
        endpoints_tested = []
        if regular_success:
            endpoints_tested.append({
                "name": "Regular Chat",
                "has_correct_mentoring": regular_has_mentoring_emoji_correct,
                "has_wrong_mentoring": regular_has_mentoring_emoji_wrong,
                "has_tech": regular_has_tech_emoji
            })
        
        if enhanced_success:
            endpoints_tested.append({
                "name": "Enhanced Chat", 
                "has_correct_mentoring": enhanced_has_mentoring_emoji_correct,
                "has_wrong_mentoring": enhanced_has_mentoring_emoji_wrong,
                "has_tech": enhanced_has_tech_emoji
            })
        
        if boost_success:
            endpoints_tested.append({
                "name": "Boost Response",
                "has_correct_mentoring": boost_has_mentoring_emoji_correct,
                "has_wrong_mentoring": boost_has_mentoring_emoji_wrong,
                "has_tech": boost_has_tech_emoji
            })
        
        if len(endpoints_tested) >= 2:
            # Check consistency across all working endpoints
            all_use_correct_mentoring = all(ep["has_correct_mentoring"] for ep in endpoints_tested)
            none_use_wrong_mentoring = not any(ep["has_wrong_mentoring"] for ep in endpoints_tested)
            all_have_tech = all(ep["has_tech"] for ep in endpoints_tested)
            
            if all_use_correct_mentoring and none_use_wrong_mentoring:
                print("   🎯 CRITICAL: Enhanced Emoji Mapping Consistency (🤓): ✅ ALL endpoints use correct 🤓 emoji for Mentoring Insight")
                print("   ✅ CONSISTENCY ACHIEVED: All endpoints use 🤓 nerd face emoji correctly")
            else:
                print("   🎯 CRITICAL: Enhanced Emoji Mapping Consistency (🤓): ❌ Inconsistent or incorrect emoji usage across endpoints")
                print("   ❌ CONSISTENCY BROKEN:")
                for ep in endpoints_tested:
                    print(f"      {ep['name']} - 🤓 correct: {ep['has_correct_mentoring']}, wrong emoji: {ep['has_wrong_mentoring']}")
            
            if all_have_tech:
                print("   ✅ Technical Answer Consistency: All endpoints use 🔧 Technical Answer")
            else:
                print("   ❌ Technical Answer Consistency: Some endpoints missing 🔧 Technical Answer")
        else:
            print("   🎯 Enhanced Emoji Mapping Consistency: Cannot compare - insufficient working endpoints")
        
        print("\n🎯 FINAL VERDICT FOR REVIEW REQUEST:")
        
        # Count working endpoints with correct emoji
        correct_emoji_count = sum(1 for ep in endpoints_tested if ep["has_correct_mentoring"] and not ep["has_wrong_mentoring"])
        wrong_emoji_count = sum(1 for ep in endpoints_tested if ep["has_wrong_mentoring"])
        total_working = len(endpoints_tested)
        
        if total_working > 0:
            if correct_emoji_count == total_working and wrong_emoji_count == 0:
                print("✅ Enhanced Emoji Mapping Fix: SUCCESSFUL")
                print(f"   All {total_working} working endpoints correctly use 🤓 for Mentoring Insight")
                print("   ✅ NO instances of incorrect 🧠 or 💡 emojis found")
                print("🎉 CONCLUSION: The DEFINITIVE Enhanced Emoji Mapping fix is working correctly")
                print("   Backend is sending responses with correct 🤓 emoji as required")
                return True
            elif wrong_emoji_count > 0:
                print("❌ Enhanced Emoji Mapping Fix: FAILED")
                print(f"   {wrong_emoji_count}/{total_working} endpoints still use incorrect emojis (🧠 or 💡)")
                print("   🚨 CRITICAL: Some endpoints not updated with correct 🤓 emoji")
                print("🚨 CONCLUSION: Backend still has emoji mapping inconsistency - fix incomplete")
                return False
            else:
                print("⚠️ Enhanced Emoji Mapping Fix: PARTIAL")
                print(f"   {correct_emoji_count}/{total_working} endpoints use correct emoji")
                print("   Some endpoints may be missing Mentoring Insight sections entirely")
                print("🔍 CONCLUSION: Backend may need further investigation for missing sections")
                return False
        else:
            print("⚠️ Enhanced Emoji Mapping Fix: CANNOT DETERMINE")
            print("   No endpoints responded successfully")
            print("🚨 CONCLUSION: Backend API failure - investigate server issues")
            return False

if __name__ == "__main__":
    result = asyncio.run(test_enhanced_emoji_mapping())
    print(f"\n🏁 Test completed. Success: {result}")