#!/usr/bin/env python3
"""
Simple Document Upload Test using requests library
"""

import requests
import json
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

def test_personal_upload():
    """Test Personal Knowledge Vault upload with requests library"""
    print("🚀 Testing Personal Knowledge Vault Upload")
    print(f"Backend URL: {BACKEND_URL}")
    
    # Test document content
    test_document = """
    Fire Safety Compliance Report
    Project: Office Building - 456 Queen Street
    
    1. BUILDING DETAILS
    Classification: Class 5 Office Building
    Height: 6 storeys (24m)
    Floor Area: 800m² per floor
    Occupancy: 120 people per floor
    
    2. FIRE SAFETY SYSTEMS
    
    2.1 Detection System (AS 1670.1)
    - Smoke detectors in all office areas
    - Heat detectors in plant rooms
    - Manual call points at exits
    - Fire indicator panel at reception
    
    2.2 Suppression System (AS 2118.1)
    - Automatic sprinkler system throughout
    - Fire hose reels on each floor
    - Portable fire extinguishers
    
    2.3 Passive Protection
    - Fire resistance levels per BCA:
      * Structure: 90/90/90
      * Walls: 60/60/60
      * Doors: 30/-/-
    
    2.4 Egress System
    - Two fire stairs (1200mm wide each)
    - Exit travel distances < 40m
    - Emergency lighting throughout
    
    3. COMPLIANCE VERIFICATION
    Systems comply with:
    - Building Code of Australia (BCA) 2022
    - AS 1851 - Fire protection maintenance
    - AS 3786 - Smoke alarm systems
    - AS 4072 - Fire detection components
    
    Engineer: Fire Safety Consultant
    Date: December 2024
    """
    
    # Test 1: Upload without authentication (should fail)
    print("\n--- Test 1: Upload without authentication ---")
    try:
        url = f"{API_BASE}/knowledge/upload-personal"
        
        files = {
            'file': ('Fire_Safety_Report_456_Queen_St.txt', test_document, 'text/plain')
        }
        data = {
            'tags': 'fire-safety,BCA,AS1851,office-building'
        }
        
        response = requests.post(url, files=files, data=data)
        
        if response.status_code in [401, 403]:
            print("✅ PASS: Correctly rejected unauthenticated request")
        else:
            print(f"❌ FAIL: Expected 401/403, got {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")
    
    # Test 2: Upload with authentication
    print("\n--- Test 2: Upload with authentication ---")
    try:
        headers = {
            'Authorization': 'Bearer mock_dev_token'
        }
        
        files = {
            'file': ('Fire_Safety_Report_456_Queen_St.txt', test_document, 'text/plain')
        }
        data = {
            'tags': 'fire-safety,BCA,AS1851,office-building'
        }
        
        response = requests.post(url, files=files, data=data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            if 'document_id' in result and 'message' in result:
                print(f"✅ PASS: Document uploaded successfully")
                print(f"   Document ID: {result['document_id']}")
                print(f"   Knowledge Bank: {result.get('knowledge_bank', 'N/A')}")
                print(f"   Privacy: {result.get('privacy', 'N/A')}")
                
                if 'detected_tags' in result:
                    print(f"   AI Detected Tags: {result['detected_tags']}")
                
                return result['document_id']
            else:
                print(f"❌ FAIL: Missing required fields in response")
                print(f"Response: {response.text}")
        else:
            print(f"❌ FAIL: Status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")
    
    return None

def test_pdf_upload():
    """Test PDF document upload"""
    print("\n--- Test 3: PDF Document Upload ---")
    
    pdf_content = """
    STRUCTURAL DESIGN REPORT
    AS/NZS 1170 COMPLIANCE VERIFICATION
    
    PROJECT: Residential Tower - 789 Collins Street
    
    1. DESIGN PARAMETERS
    Building Height: 15 storeys (48m)
    Construction: Reinforced concrete
    Foundation: Bored piers to rock
    
    2. LOAD ANALYSIS (AS/NZS 1170.1)
    
    Dead Loads:
    - RC slab (250mm): 6.0 kPa
    - Finishes: 1.5 kPa
    - Services: 0.5 kPa
    - Partitions: 1.0 kPa
    Total DL: 9.0 kPa
    
    Live Loads:
    - Residential: 1.5 kPa
    - Corridors: 3.0 kPa
    - Balconies: 4.0 kPa
    
    3. WIND ANALYSIS (AS/NZS 1170.2)
    Wind Region: A3
    Terrain Category: 2
    Design Wind Speed: 45 m/s
    Dynamic Response Factor: 1.1
    
    4. SEISMIC ANALYSIS (AS/NZS 1170.4)
    Earthquake Design Category: II
    Hazard Factor: 0.08
    Site Class: Ce
    Structural Ductility: μ = 3.0
    
    5. STRUCTURAL ELEMENTS
    Columns: 450x450mm RC
    Beams: 350x700mm RC
    Slabs: 250mm PT slabs
    Shear Walls: 200mm RC
    
    6. COMPLIANCE STATEMENT
    Design complies with:
    ✓ AS/NZS 1170.0 - General principles
    ✓ AS/NZS 1170.1 - Permanent and imposed actions
    ✓ AS/NZS 1170.2 - Wind actions
    ✓ AS/NZS 1170.4 - Earthquake actions
    ✓ AS 3600 - Concrete structures
    
    Structural Engineer: John Smith CPEng
    Registration: 98765
    Date: December 2024
    """
    
    try:
        url = f"{API_BASE}/knowledge/upload-personal"
        headers = {
            'Authorization': 'Bearer mock_dev_token'
        }
        
        files = {
            'file': ('Structural_Design_Report_789_Collins.pdf', pdf_content, 'application/pdf')
        }
        data = {
            'tags': 'structural,AS1170,concrete,residential,seismic'
        }
        
        response = requests.post(url, files=files, data=data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            if 'document_id' in result:
                print(f"✅ PASS: PDF document uploaded successfully")
                print(f"   Document ID: {result['document_id']}")
                
                if 'detected_tags' in result:
                    tags = result['detected_tags']
                    if any('structural' in str(tags).lower() or 'concrete' in str(tags).lower()):
                        print(f"✅ PASS: AI correctly detected structural content")
                    print(f"   AI Tags: {tags}")
            else:
                print(f"❌ FAIL: Missing document_id in response")
        else:
            print(f"❌ FAIL: Status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")

def test_duplicate_upload():
    """Test duplicate upload prevention"""
    print("\n--- Test 4: Duplicate Upload Prevention ---")
    
    duplicate_content = """
    Building Code Compliance Summary
    Project: Warehouse Development
    
    This is a test document for duplicate detection.
    The content is identical to test the deduplication system.
    
    Standards referenced:
    - BCA 2022
    - AS/NZS 1170 series
    - AS 3600 Concrete structures
    """
    
    try:
        url = f"{API_BASE}/knowledge/upload-personal"
        headers = {
            'Authorization': 'Bearer mock_dev_token'
        }
        
        files = {
            'file': ('Duplicate_Test_Document.txt', duplicate_content, 'text/plain')
        }
        data = {
            'tags': 'test,duplicate,BCA'
        }
        
        # First upload
        response1 = requests.post(url, files=files, data=data, headers=headers)
        
        if response1.status_code == 200:
            print("✅ PASS: First upload successful")
            
            # Second upload (should be rejected as duplicate)
            files = {
                'file': ('Duplicate_Test_Document.txt', duplicate_content, 'text/plain')
            }
            response2 = requests.post(url, files=files, data=data, headers=headers)
            
            if response2.status_code == 400:
                if 'already exists' in response2.text.lower():
                    print("✅ PASS: Duplicate upload correctly prevented")
                else:
                    print("✅ PASS: Duplicate upload rejected (different reason)")
            else:
                print(f"❌ FAIL: Expected 400 for duplicate, got {response2.status_code}")
                print(f"Response: {response2.text}")
        else:
            print(f"❌ FAIL: First upload failed with status {response1.status_code}")
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")

def test_search_functionality():
    """Test knowledge search after upload"""
    print("\n--- Test 5: Knowledge Search Functionality ---")
    
    try:
        url = f"{API_BASE}/knowledge/search"
        headers = {
            'Authorization': 'Bearer mock_dev_token'
        }
        params = {
            'query': 'fire safety BCA',
            'limit': 5
        }
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            result = response.json()
            if 'personal_results' in result and 'community_results' in result:
                personal_count = len(result['personal_results'])
                community_count = len(result['community_results'])
                total = result.get('total_results', 0)
                
                print(f"✅ PASS: Search functionality working")
                print(f"   Personal results: {personal_count}")
                print(f"   Community results: {community_count}")
                print(f"   Total results: {total}")
                
                # Check if we can find our uploaded documents
                if personal_count > 0:
                    first_result = result['personal_results'][0]
                    if 'similarity_score' in first_result:
                        score = first_result['similarity_score']
                        print(f"   Top similarity score: {score:.3f}")
            else:
                print(f"❌ FAIL: Missing expected fields in search response")
                print(f"Response: {response.text}")
        else:
            print(f"❌ FAIL: Search failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")

def test_legacy_endpoint():
    """Test legacy upload endpoint"""
    print("\n--- Test 6: Legacy Upload Endpoint ---")
    
    legacy_content = """
    Construction Safety Plan
    Project: Industrial Facility
    
    1. SAFETY OBJECTIVES
    - Zero harm to workers and public
    - Compliance with WHS regulations
    - Environmental protection
    
    2. HAZARD IDENTIFICATION
    - Working at height
    - Heavy machinery operation
    - Electrical hazards
    - Chemical exposure
    
    3. CONTROL MEASURES
    - Safety training for all workers
    - Personal protective equipment
    - Safety barriers and signage
    - Regular safety inspections
    
    4. EMERGENCY PROCEDURES
    - Emergency contact numbers
    - Evacuation procedures
    - First aid arrangements
    - Incident reporting
    
    Safety Manager: Construction Safety Pty Ltd
    Date: December 2024
    """
    
    try:
        url = f"{API_BASE}/knowledge/upload-document"  # Legacy endpoint
        headers = {
            'Authorization': 'Bearer mock_dev_token'
        }
        
        files = {
            'file': ('Construction_Safety_Plan.txt', legacy_content, 'text/plain')
        }
        data = {
            'tags': 'safety,WHS,construction,industrial',
            'is_supplier_content': 'false',
            'supplier_name': '',
            'supplier_abn': ''
        }
        
        response = requests.post(url, files=files, data=data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            if 'document_id' in result:
                print(f"✅ PASS: Legacy endpoint working")
                print(f"   Document ID: {result['document_id']}")
                
                # Should route to personal knowledge bank
                if result.get('knowledge_bank') == 'personal':
                    print(f"✅ PASS: Legacy endpoint correctly routes to personal bank")
            else:
                print(f"❌ FAIL: Missing document_id in response")
        else:
            print(f"❌ FAIL: Status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ FAIL: Exception - {str(e)}")

def main():
    """Run all tests"""
    print("🚀 SIMPLE DOCUMENT UPLOAD TESTING")
    print("="*60)
    
    # Run tests
    document_id = test_personal_upload()
    test_pdf_upload()
    test_duplicate_upload()
    test_search_functionality()
    test_legacy_endpoint()
    
    print("\n" + "="*60)
    print("✅ TESTING COMPLETED")
    print("="*60)

if __name__ == "__main__":
    main()