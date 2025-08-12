#!/usr/bin/env python3
"""
Critical Emoji Synchronization Investigation
Tests the exact backend response content causing frontend display problems
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

async def test_critical_emoji_synchronization():
    """🚨 CRITICAL BACKEND INVESTIGATION - Final Emoji Synchronization Issue"""
    print("🚨 === CRITICAL BACKEND INVESTIGATION - FINAL EMOJI SYNCHRONIZATION ISSUE ===")
    print("🎯 URGENT TESTING: Identify EXACT backend response content causing frontend display problems")
    print("🔍 Testing POST /api/chat/ask with 'What are fire safety requirements?'")
    print("📋 Checking for presence of:")
    print("   - 🧐 **Mentoring Insight:** (correct professor with monocle)")
    print("   - 🧠 **Mentoring Insight:** (wrong brain emoji)")
    print("   - **Mentoring Insight:** (missing emoji)")
    print("🎯 Goal: Determine if issue is backend sending wrong emoji, no emoji, or response structure problem")
    
    async with aiohttp.ClientSession() as session:
        mock_headers = {"Authorization": "Bearer mock_dev_token", "Content-Type": "application/json"}
        
        # Test the EXACT question from review request
        test_question = "What are fire safety requirements?"
        
        print(f"\n🔍 Testing question: '{test_question}'")
        
        # Test POST /api/chat/ask - MAIN FOCUS
        print("\n1️⃣ TESTING POST /api/chat/ask - CAPTURING RAW RESPONSE TEXT")
        
        chat_data = {
            "question": test_question,
            "session_id": "emoji_sync_investigation"
        }
        
        try:
            url = f"{API_BASE}/chat/ask"
            async with session.post(url, json=chat_data, headers=mock_headers) as response:
                response_data = await response.json()
                status = response.status
                
                if status < 400 and isinstance(response_data, dict) and "response" in response_data:
                    raw_response_text = str(response_data["response"])
                    
                    print(f"\n📄 RAW RESPONSE TEXT (Length: {len(raw_response_text)} characters):")
                    print("=" * 80)
                    print(raw_response_text)
                    print("=" * 80)
                    
                    # CHARACTER-BY-CHARACTER EMOJI ANALYSIS
                    print(f"\n🔍 CHARACTER-BY-CHARACTER EMOJI ANALYSIS:")
                    
                    # Check for specific emojis
                    professor_monocle = "🧐"  # Correct professor with monocle
                    brain_emoji = "🧠"        # Wrong brain emoji
                    nerd_emoji = "🤓"         # Alternative nerd emoji
                    
                    # Count occurrences
                    professor_count = raw_response_text.count(professor_monocle)
                    brain_count = raw_response_text.count(brain_emoji)
                    nerd_count = raw_response_text.count(nerd_emoji)
                    
                    print(f"   🧐 Professor with monocle (CORRECT): {professor_count} occurrences")
                    print(f"   🧠 Brain emoji (WRONG): {brain_count} occurrences")
                    print(f"   🤓 Nerd emoji (ALTERNATIVE): {nerd_count} occurrences")
                    
                    # Check for Mentoring Insight patterns
                    mentoring_patterns = [
                        "🧐 **Mentoring Insight:**",
                        "🧠 **Mentoring Insight:**", 
                        "🤓 **Mentoring Insight:**",
                        "**Mentoring Insight:**",
                        "🧐 Mentoring Insight:",
                        "🧠 Mentoring Insight:",
                        "🤓 Mentoring Insight:",
                        "Mentoring Insight:"
                    ]
                    
                    print(f"\n📋 MENTORING INSIGHT PATTERN ANALYSIS:")
                    found_patterns = []
                    for pattern in mentoring_patterns:
                        if pattern in raw_response_text:
                            found_patterns.append(pattern)
                            print(f"   ✅ FOUND: '{pattern}'")
                        else:
                            print(f"   ❌ NOT FOUND: '{pattern}'")
                    
                    # Extract context around mentoring insight
                    if found_patterns:
                        print(f"\n📝 CONTEXT AROUND MENTORING INSIGHT SECTIONS:")
                        for pattern in found_patterns:
                            start_idx = raw_response_text.find(pattern)
                            if start_idx != -1:
                                # Extract 200 characters before and after
                                context_start = max(0, start_idx - 100)
                                context_end = min(len(raw_response_text), start_idx + len(pattern) + 200)
                                context = raw_response_text[context_start:context_end]
                                print(f"   Pattern: '{pattern}'")
                                print(f"   Context: ...{context}...")
                                print()
                    
                    # Check for Technical Answer patterns
                    technical_patterns = [
                        "🔧 **Technical Answer:**",
                        "🔧 Technical Answer:",
                        "**Technical Answer:**",
                        "Technical Answer:"
                    ]
                    
                    print(f"\n🔧 TECHNICAL ANSWER PATTERN ANALYSIS:")
                    for pattern in technical_patterns:
                        if pattern in raw_response_text:
                            print(f"   ✅ FOUND: '{pattern}'")
                        else:
                            print(f"   ❌ NOT FOUND: '{pattern}'")
                    
                    # CRITICAL DETERMINATION
                    print(f"\n🎯 CRITICAL DETERMINATION:")
                    
                    if professor_count > 0:
                        print(f"✅ Backend correctly sends 🧐 professor with monocle ({professor_count} times)")
                        issue_type = "Frontend parsing or display issue"
                    elif brain_count > 0:
                        print(f"❌ Backend incorrectly sends 🧠 brain emoji ({brain_count} times)")
                        issue_type = "Backend sending wrong emoji"
                    elif nerd_count > 0:
                        print(f"⚠️ Backend sends 🤓 nerd emoji instead of 🧐 ({nerd_count} times)")
                        issue_type = "Backend sending alternative emoji"
                    elif found_patterns:
                        print("⚠️ Backend sends Mentoring Insight without emoji")
                        issue_type = "Backend sending no emoji"
                    else:
                        print("❌ Backend response missing Mentoring Insight section entirely")
                        issue_type = "Backend response structure problem"
                    
                    print(f"🔍 ISSUE IDENTIFICATION: {issue_type}")
                    
                    # Check response structure
                    has_dual_layer = ("Technical Answer" in raw_response_text and 
                                    "Mentoring Insight" in raw_response_text)
                    
                    if has_dual_layer:
                        print("✅ Backend response has both Technical Answer and Mentoring Insight sections")
                    else:
                        print("❌ Backend response missing dual-layer format")
                    
                    # Fire safety content check
                    fire_safety_indicators = [
                        "fire safety", "AS 1851", "AS 2118", "BCA", "NCC", 
                        "sprinkler", "fire protection", "smoke alarm", "fire rating"
                    ]
                    
                    fire_content_found = []
                    for indicator in fire_safety_indicators:
                        if indicator.lower() in raw_response_text.lower():
                            fire_content_found.append(indicator)
                    
                    if fire_content_found:
                        print(f"✅ Response contains fire safety content: {', '.join(fire_content_found)}")
                    else:
                        print("⚠️ Response may be generic rather than fire safety specific")
                    
                    # Final analysis
                    print(f"\n🎯 FINAL ANALYSIS FOR REVIEW REQUEST:")
                    print(f"   📊 Response Length: {len(raw_response_text)} characters")
                    print(f"   🧐 Professor Monocle Count: {professor_count}")
                    print(f"   🧠 Brain Emoji Count: {brain_count}")
                    print(f"   🤓 Nerd Emoji Count: {nerd_count}")
                    print(f"   📋 Mentoring Patterns Found: {len(found_patterns)}")
                    print(f"   🔧 Has Technical Answer: {'Technical Answer' in raw_response_text}")
                    print(f"   🎯 Issue Type: {issue_type}")
                    
                    if professor_count > 0:
                        print("✅ CONCLUSION: Backend correctly sends 🧐 professor with monocle emoji")
                        print("   The issue is likely in frontend parsing or display logic")
                    elif brain_count > 0:
                        print("❌ CONCLUSION: Backend incorrectly sends 🧠 brain emoji")
                        print("   Backend needs to be updated to use 🧐 professor with monocle")
                    elif found_patterns and (nerd_count > 0 or any("**Mentoring Insight:**" in p for p in found_patterns)):
                        print("⚠️ CONCLUSION: Backend sends Mentoring Insight but with wrong/missing emoji")
                        print("   Backend emoji mapping needs to be corrected to use 🧐")
                    else:
                        print("❌ CONCLUSION: Backend response structure problem")
                        print("   Backend not generating proper dual-layer response format")
                    
                else:
                    print(f"❌ CRITICAL: Cannot analyze emoji synchronization - API failure")
                    print(f"   Status: {status}")
                    print(f"   Response: {response_data}")
                    
        except Exception as e:
            print(f"❌ CRITICAL: Exception during API call - {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_critical_emoji_synchronization())