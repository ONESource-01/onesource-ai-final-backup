#!/usr/bin/env python3
"""
Frontend Formatting Consistency Test
Tests that both endpoints produce identically formatted responses in the UI
"""

import asyncio
import aiohttp
import json
from pathlib import Path

async def test_frontend_formatting_consistency():
    """Test that both endpoints produce consistent frontend formatting"""
    
    backend_url = "https://convo-context-ai.preview.emergentagent.com"
    test_question = "What are fire safety requirements for high-rise buildings in Australia?"
    
    async with aiohttp.ClientSession() as session:
        
        # Test regular endpoint
        async with session.post(
            f"{backend_url}/api/chat/ask",
            json={
                "question": test_question,
                "session_id": "consistency_test_regular"
            },
            headers={"Content-Type": "application/json", "Authorization": "Bearer mock_dev_token"}
        ) as response:
            regular_response = await response.json()
            regular_status = response.status
            
        # Test enhanced endpoint  
        async with session.post(
            f"{backend_url}/api/chat/ask-enhanced",
            json={
                "question": test_question,
                "session_id": "consistency_test_enhanced"
            },
            headers={"Content-Type": "application/json", "Authorization": "Bearer mock_dev_token"}
        ) as response:
            enhanced_response = await response.json()
            enhanced_status = response.status
    
    print("🎨 FRONTEND FORMATTING CONSISTENCY TEST")
    print("=" * 50)
    
    if regular_status == 200 and enhanced_status == 200:
        # Extract response content
        regular_content = regular_response.get("response", "")
        enhanced_content = enhanced_response.get("response", "")
        
        print(f"✅ Both endpoints returned 200 status")
        print(f"📏 Regular response length: {len(regular_content)} chars")
        print(f"📏 Enhanced response length: {len(enhanced_content)} chars")
        
        # Check response structure types
        regular_type = type(regular_content).__name__
        enhanced_type = type(enhanced_content).__name__
        print(f"📊 Regular response type: {regular_type}")
        print(f"📊 Enhanced response type: {enhanced_type}")
        
        # Check for key formatting elements
        print("\n🔍 FORMATTING ELEMENTS CHECK:")
        
        elements_to_check = [
            ("🔧 **Technical Answer**", "Technical Answer Header"),
            ("🧐 **Mentoring Insight**", "Mentoring Insight Header"), 
            ("📋 **Next Steps**", "Next Steps Header"),
            ("📊 **Code Requirements**", "Code Requirements Header"),
            ("✅ **Compliance Verification**", "Compliance Verification Header"),
            ("##", "Markdown H2 Headers"),
            ("**", "Bold Formatting"),
            ("- ", "List Items")
        ]
        
        consistent_elements = 0
        total_elements = len(elements_to_check)
        
        for element, description in elements_to_check:
            regular_has = element in regular_content
            enhanced_has = element in enhanced_content
            consistency = regular_has == enhanced_has
            
            status = "✅" if consistency else "❌"
            print(f"  {status} {description}: Regular={regular_has}, Enhanced={enhanced_has}")
            
            if consistency:
                consistent_elements += 1
        
        # Overall assessment
        consistency_percentage = (consistent_elements / total_elements) * 100
        print(f"\n📊 CONSISTENCY SCORE: {consistency_percentage:.1f}% ({consistent_elements}/{total_elements})")
        
        # Response structure consistency
        structure_consistent = regular_type == enhanced_type
        print(f"📋 STRUCTURE CONSISTENT: {structure_consistent}")
        
        # Content preview
        print(f"\n📄 REGULAR RESPONSE PREVIEW:")
        print(f"   {regular_content[:150]}...")
        print(f"\n📄 ENHANCED RESPONSE PREVIEW:")
        print(f"   {enhanced_content[:150]}...")
        
        # Final verdict
        overall_success = consistency_percentage >= 80 and structure_consistent
        print(f"\n🎯 OVERALL FRONTEND CONSISTENCY: {'✅ PASS' if overall_success else '❌ FAIL'}")
        
        return overall_success
    else:
        print("❌ One or both endpoints failed")
        print(f"Regular status: {regular_status}")
        print(f"Enhanced status: {enhanced_status}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_frontend_formatting_consistency())
    exit(0 if success else 1)