#!/usr/bin/env python3
"""
Quick unified backend verification test
Tests that both endpoints now use the same backend logic
"""

import asyncio
import aiohttp
import json

async def test_unified_backend():
    """Quick test to verify both endpoints use unified backend"""
    
    backend_url = "https://convo-context-ai.preview.emergentagent.com"
    test_question = "What are fire safety requirements for high-rise buildings in Australia?"
    
    async with aiohttp.ClientSession() as session:
        
        # Test regular endpoint
        regular_data = {
            "question": test_question,
            "session_id": "unified_test_regular"
        }
        
        async with session.post(
            f"{backend_url}/api/chat/ask",
            json=regular_data,
            headers={"Content-Type": "application/json", "Authorization": "Bearer mock_dev_token"}
        ) as response:
            regular_response = await response.json()
            regular_status = response.status
            
        # Test enhanced endpoint  
        enhanced_data = {
            "question": test_question,
            "session_id": "unified_test_enhanced"
        }
        
        async with session.post(
            f"{backend_url}/api/chat/ask-enhanced",
            json=enhanced_data,
            headers={"Content-Type": "application/json", "Authorization": "Bearer mock_dev_token"}
        ) as response:
            enhanced_response = await response.json()
            enhanced_status = response.status
    
    print("🚀 UNIFIED BACKEND VERIFICATION")
    print(f"Regular endpoint status: {regular_status}")
    print(f"Enhanced endpoint status: {enhanced_status}")
    
    if regular_status == 200 and enhanced_status == 200:
        # Extract actual response content
        regular_content = regular_response.get("response", "")
        enhanced_content = enhanced_response.get("response", {}).get("technical", "")
        
        # Check for unified backend markers
        regular_unified = regular_response.get("endpoint_unified", False)
        enhanced_unified = "endpoint_unified" in str(enhanced_response)
        
        print(f"\nRegular endpoint unified: {regular_unified}")
        print(f"Enhanced endpoint unified: {enhanced_unified}")
        
        # Check for consistent emoji usage
        regular_has_mentoring = "🧐 **Mentoring Insight" in regular_content
        enhanced_has_mentoring = "🧐 **Mentoring Insight" in enhanced_content
        
        print(f"\nRegular has 🧐 Mentoring Insight: {regular_has_mentoring}")
        print(f"Enhanced has 🧐 Mentoring Insight: {enhanced_has_mentoring}")
        
        # Overall assessment
        both_working = regular_status == 200 and enhanced_status == 200
        consistent_emojis = regular_has_mentoring and enhanced_has_mentoring
        
        print(f"\n✅ Both endpoints working: {both_working}")
        print(f"✅ Consistent emoji usage: {consistent_emojis}")
        print(f"🎯 UNIFIED BACKEND SUCCESS: {both_working and consistent_emojis}")
        
        return both_working and consistent_emojis
    else:
        print("❌ One or both endpoints failed")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_unified_backend())
    exit(0 if success else 1)