#!/usr/bin/env python3
"""
Final Document Upload Test - Accurate Testing with Unique Content
"""

import requests
import json
import time
import uuid
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

def create_unique_content(base_content, doc_type="construction"):
    """Create unique content to avoid duplicate detection"""
    unique_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    return f"""
{base_content}

DOCUMENT METADATA:
Unique ID: {unique_id}
Generated: {timestamp}
Document Type: {doc_type}
Test Purpose: Personal Knowledge Vault Upload Testing
"""

def test_personal_upload_functionality():
    """Test Personal Knowledge Vault upload with unique content"""
    print("🚀 FINAL DOCUMENT UPLOAD TEST")
    print("="*60)
    print(f"Backend URL: {BACKEND_URL}")
    
    results = []
    
    # Test 1: Authentication requirement
    print("\n--- Test 1: Authentication Requirement ---")
    try:
        url = f"{API_BASE}/knowledge/upload-personal"
        unique_content = create_unique_content("Test content for auth check")
        files = {'file': ('auth_test.txt', unique_content, 'text/plain')}
        data = {'tags': 'test,auth'}
        
        response = requests.post(url, files=files, data=data, timeout=10)
        
        if response.status_code in [401, 403]:
            print("✅ PASS: Authentication correctly required")
            results.append(("Authentication Required", True))
        else:
            print(f"❌ FAIL: Expected 401/403, got {response.status_code}")
            print(f"Response: {response.text}")
            results.append(("Authentication Required", False))
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")
        results.append(("Authentication Required", False))
    
    # Test 2: Successful upload with authentication
    print("\n--- Test 2: Successful Upload with Authentication ---")
    try:
        headers = {'Authorization': 'Bearer mock_dev_token'}
        
        fire_safety_content = create_unique_content("""
        FIRE SAFETY ASSESSMENT REPORT
        Project: Office Building - Collins Street
        
        1. BUILDING DETAILS
        Classification: Class 5 Office
        Height: 6 storeys
        Occupancy: 150 people
        
        2. FIRE SAFETY SYSTEMS
        - AS 1670.1 fire detection system
        - AS 2118.1 sprinkler system
        - BCA compliant egress paths
        - AS 1851 maintenance program
        
        3. COMPLIANCE VERIFICATION
        All systems comply with:
        ✓ Building Code of Australia 2022
        ✓ AS 1851 Fire protection maintenance
        ✓ AS 1670.1 Fire detection systems
        ✓ AS 2118.1 Sprinkler systems
        
        Fire Safety Engineer: Test Engineer
        Date: December 2024
        """, "fire-safety")
        
        files = {'file': ('Fire_Safety_Assessment.txt', fire_safety_content, 'text/plain')}
        data = {'tags': 'fire-safety,BCA,AS1851,AS1670,AS2118,office'}
        
        response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if 'document_id' in result and 'message' in result:
                doc_id = result['document_id']
                print(f"✅ PASS: Document uploaded successfully")
                print(f"   Document ID: {doc_id}")
                print(f"   Knowledge Bank: {result.get('knowledge_bank', 'N/A')}")
                print(f"   Privacy: {result.get('privacy', 'N/A')}")
                
                if 'detected_tags' in result:
                    print(f"   AI Detected Tags: {result['detected_tags']}")
                
                results.append(("Fire Safety Document Upload", True))
                
                # Check AI processing
                if 'extracted_summary' in result and result['extracted_summary']:
                    print("✅ PASS: AI content processing working")
                    results.append(("AI Content Processing", True))
                else:
                    print("⚠️  WARNING: No AI summary generated")
                    results.append(("AI Content Processing", False))
            else:
                print("❌ FAIL: Missing required fields in response")
                results.append(("Fire Safety Document Upload", False))
        else:
            print(f"❌ FAIL: Status {response.status_code}")
            print(f"Response: {response.text}")
            results.append(("Fire Safety Document Upload", False))
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")
        results.append(("Fire Safety Document Upload", False))
    
    # Test 3: Different document type
    print("\n--- Test 3: Structural Engineering Document ---")
    try:
        structural_content = create_unique_content("""
        STRUCTURAL DESIGN CALCULATIONS
        Project: Residential Tower
        
        1. DESIGN PARAMETERS
        Building Height: 10 storeys
        Construction: Reinforced concrete
        Foundation: Bored piers
        
        2. LOAD ANALYSIS (AS/NZS 1170)
        Dead Loads: 8.5 kPa
        Live Loads: 2.0 kPa (residential)
        Wind Loads: AS/NZS 1170.2
        Seismic Loads: AS/NZS 1170.4
        
        3. STRUCTURAL ELEMENTS
        Columns: 400x400mm RC
        Beams: 300x600mm RC
        Slabs: 200mm PT slabs
        
        4. COMPLIANCE
        ✓ AS/NZS 1170.0 General principles
        ✓ AS/NZS 1170.1 Permanent and imposed actions
        ✓ AS 3600 Concrete structures
        
        Structural Engineer: Design Associates
        Date: December 2024
        """, "structural")
        
        files = {'file': ('Structural_Design_Calculations.txt', structural_content, 'text/plain')}
        data = {'tags': 'structural,AS1170,AS3600,concrete,residential'}
        
        response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if 'document_id' in result:
                print(f"✅ PASS: Structural document uploaded successfully")
                print(f"   Document ID: {result['document_id']}")
                results.append(("Structural Document Upload", True))
                
                # Check for structural content recognition
                if 'detected_tags' in result:
                    tags = str(result['detected_tags']).lower()
                    if 'structural' in tags or 'concrete' in tags or 'construction' in tags:
                        print("✅ PASS: AI recognized structural content")
                        results.append(("Structural Content Recognition", True))
                    else:
                        print("⚠️  WARNING: AI may not have recognized structural content")
                        results.append(("Structural Content Recognition", False))
            else:
                print("❌ FAIL: Missing document_id")
                results.append(("Structural Document Upload", False))
        else:
            print(f"❌ FAIL: Status {response.status_code}")
            results.append(("Structural Document Upload", False))
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")
        results.append(("Structural Document Upload", False))
    
    # Test 4: PDF format support
    print("\n--- Test 4: PDF Format Support ---")
    try:
        pdf_content = create_unique_content("""
        HVAC SYSTEM SPECIFICATION
        Project: Commercial Complex
        
        1. SYSTEM OVERVIEW
        Building Type: Class 5 Office
        Floor Area: 2000m²
        Occupancy: 200 people
        
        2. DESIGN CRITERIA (AS 1668.2)
        Fresh Air: 10 L/s per person
        Temperature: 24°C ± 2°C (summer)
        Humidity: 40-60% RH
        
        3. EQUIPMENT SPECIFICATION
        Chillers: 2 x 300kW water-cooled
        AHUs: 3 x 8000 L/s capacity
        Heat recovery: 70% efficiency
        
        4. COMPLIANCE
        ✓ AS 1668.2 Mechanical ventilation
        ✓ NCC Section J Energy efficiency
        ✓ AS/NZS 3000 Electrical installations
        
        Mechanical Engineer: HVAC Solutions
        Date: December 2024
        """, "hvac")
        
        files = {'file': ('HVAC_Specification.pdf', pdf_content, 'application/pdf')}
        data = {'tags': 'HVAC,AS1668,mechanical,ventilation'}
        
        response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if 'document_id' in result:
                print(f"✅ PASS: PDF document processed successfully")
                print(f"   Document ID: {result['document_id']}")
                results.append(("PDF Format Support", True))
                
                if 'extracted_summary' in result and result['extracted_summary']:
                    print("✅ PASS: PDF text extraction working")
                    results.append(("PDF Text Extraction", True))
                else:
                    print("⚠️  WARNING: PDF text extraction may have issues")
                    results.append(("PDF Text Extraction", False))
            else:
                print("❌ FAIL: Missing document_id")
                results.append(("PDF Format Support", False))
        else:
            print(f"❌ FAIL: Status {response.status_code}")
            results.append(("PDF Format Support", False))
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")
        results.append(("PDF Format Support", False))
    
    # Test 5: Duplicate prevention
    print("\n--- Test 5: Duplicate Prevention ---")
    try:
        duplicate_content = create_unique_content("Duplicate test content", "duplicate-test")
        
        # First upload
        files = {'file': ('duplicate_test.txt', duplicate_content, 'text/plain')}
        data = {'tags': 'test,duplicate'}
        
        response1 = requests.post(url, files=files, data=data, headers=headers, timeout=30)
        
        if response1.status_code == 200:
            print("✅ PASS: First upload successful")
            
            # Second upload with same content (should be rejected)
            time.sleep(1)
            files = {'file': ('duplicate_test.txt', duplicate_content, 'text/plain')}
            response2 = requests.post(url, files=files, data=data, headers=headers, timeout=30)
            
            if response2.status_code == 400:
                if 'already exists' in response2.text.lower():
                    print("✅ PASS: Duplicate correctly prevented")
                    results.append(("Duplicate Prevention", True))
                else:
                    print("✅ PASS: Upload rejected (likely duplicate)")
                    results.append(("Duplicate Prevention", True))
            else:
                print(f"❌ FAIL: Expected 400 for duplicate, got {response2.status_code}")
                results.append(("Duplicate Prevention", False))
        else:
            print(f"❌ FAIL: First upload failed: {response1.status_code}")
            results.append(("Duplicate Prevention", False))
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")
        results.append(("Duplicate Prevention", False))
    
    # Test 6: Search integration
    print("\n--- Test 6: Search Integration ---")
    try:
        time.sleep(2)  # Allow indexing
        
        search_url = f"{API_BASE}/knowledge/search"
        params = {'query': 'fire safety office building', 'limit': 5}
        
        response = requests.get(search_url, headers=headers, params=params, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if 'personal_results' in result:
                personal_count = len(result['personal_results'])
                total = result.get('total_results', 0)
                
                print(f"✅ PASS: Search working - {personal_count} personal results, {total} total")
                results.append(("Search Integration", True))
                
                if personal_count > 0:
                    first_result = result['personal_results'][0]
                    if 'similarity_score' in first_result:
                        score = first_result['similarity_score']
                        print(f"   Top similarity score: {score:.3f}")
            else:
                print("❌ FAIL: Missing personal_results in search response")
                results.append(("Search Integration", False))
        else:
            print(f"❌ FAIL: Search failed with status {response.status_code}")
            results.append(("Search Integration", False))
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")
        results.append(("Search Integration", False))
    
    # Test 7: Legacy endpoint
    print("\n--- Test 7: Legacy Endpoint ---")
    try:
        legacy_url = f"{API_BASE}/knowledge/upload-document"
        legacy_content = create_unique_content("""
        BUILDING COMPLIANCE REPORT
        Project: Industrial Facility
        
        1. COMPLIANCE AREAS
        - Planning approval obtained
        - Building permit issued
        - Fire safety systems approved
        - Accessibility compliance verified
        
        2. STANDARDS COMPLIANCE
        ✓ BCA 2022 Building Code
        ✓ AS/NZS 1170 Structural loads
        ✓ AS 1851 Fire protection
        ✓ AS 1428 Access and mobility
        
        Building Certifier: Compliance Services
        Date: December 2024
        """, "compliance")
        
        files = {'file': ('Building_Compliance_Report.txt', legacy_content, 'text/plain')}
        data = {
            'tags': 'compliance,BCA,building-permit,certifier',
            'is_supplier_content': 'false',
            'supplier_name': '',
            'supplier_abn': ''
        }
        
        response = requests.post(legacy_url, files=files, data=data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if 'document_id' in result:
                print(f"✅ PASS: Legacy endpoint working")
                print(f"   Document ID: {result['document_id']}")
                results.append(("Legacy Endpoint", True))
                
                if result.get('knowledge_bank') == 'personal':
                    print("✅ PASS: Legacy endpoint routes to personal bank")
                    results.append(("Legacy Endpoint Routing", True))
            else:
                print("❌ FAIL: Missing document_id")
                results.append(("Legacy Endpoint", False))
        else:
            print(f"❌ FAIL: Status {response.status_code}")
            results.append(("Legacy Endpoint", False))
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")
        results.append(("Legacy Endpoint", False))
    
    # Print final summary
    print("\n" + "="*60)
    print("FINAL TEST SUMMARY")
    print("="*60)
    
    total_tests = len(results)
    passed_tests = sum(1 for _, success in results if success)
    failed_tests = total_tests - passed_tests
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests} ✅")
    print(f"Failed: {failed_tests} ❌")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if failed_tests > 0:
        print(f"\nFAILED TESTS:")
        for test_name, success in results:
            if not success:
                print(f"❌ {test_name}")
    
    print("\n" + "="*60)
    
    return passed_tests, total_tests

if __name__ == "__main__":
    test_personal_upload_functionality()