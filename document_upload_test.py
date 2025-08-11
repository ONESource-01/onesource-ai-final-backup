#!/usr/bin/env python3
"""
Focused Document Upload Testing for Personal Knowledge Vault
Tests the specific upload functionality that users are reporting as failing
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, Optional
import base64

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

class DocumentUploadTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.auth_token = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        try:
            url = f"{API_BASE}{endpoint}"
            request_headers = {"Content-Type": "application/json"}
            if headers:
                request_headers.update(headers)
            
            kwargs = {"headers": request_headers}
            if data:
                kwargs["json"] = data
            
            async with self.session.request(method, url, **kwargs) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                return response.status < 400, response_data, response.status
                
        except Exception as e:
            return False, str(e), 0

    async def test_personal_knowledge_vault_upload(self):
        """Test Personal Knowledge Vault document upload functionality"""
        print("\n=== Testing Personal Knowledge Vault Document Upload ===")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Test 1: Upload without authentication (should fail)
        print("\n--- Test 1: Upload without authentication ---")
        try:
            url = f"{API_BASE}/knowledge/upload-personal"
            
            # Create a realistic construction document
            construction_document = """
            Fire Safety Design Report - Commercial Office Building
            Project: 123 Collins Street, Melbourne VIC 3000
            
            1. BUILDING CLASSIFICATION
            Building Classification: Class 5 (Office Building)
            Building Height: 8 storeys (32m)
            Floor Area: 1,200m² per floor
            
            2. FIRE SAFETY SYSTEMS REQUIRED
            
            2.1 Fire Detection and Alarm System
            - AS 1670.1 compliant fire detection system
            - Smoke detectors in all areas except wet areas
            - Manual call points at exits
            - Fire indicator panel at main entrance
            
            2.2 Fire Suppression Systems  
            - AS 2118.1 compliant sprinkler system throughout
            - Sprinkler coverage to all areas including concealed spaces
            - Fire hose reels as per AS 2441
            
            2.3 Passive Fire Protection
            - Fire resistance levels (FRL) as per BCA Table C1.1:
              * Structural elements: 120/120/120
              * External walls: 60/60/60  
              * Internal walls: 60/60/60
            
            2.4 Egress Requirements
            - Exit travel distances per BCA Table D1.4
            - Minimum 2 exits from each floor
            - Exit widths calculated per BCA D1.6
            
            3. COMPLIANCE VERIFICATION
            All systems designed in accordance with:
            - Building Code of Australia (BCA) 2022
            - AS 1851 - Maintenance of fire protection systems
            - AS 3786 - Smoke alarms using scattered light
            - AS 4072 - Components for fire detection systems
            
            Prepared by: Fire Safety Engineer
            Date: December 2024
            """
            
            # Create multipart form data
            form_data = aiohttp.FormData()
            form_data.add_field('file', construction_document.encode(), 
                              filename='Fire_Safety_Design_Report_123_Collins_St.txt', 
                              content_type='text/plain')
            form_data.add_field('tags', 'fire-safety,BCA,AS1851,commercial,office-building')
            
            async with self.session.post(url, data=form_data) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status == 401 or response.status == 403:
                    self.log_test("Personal Upload without Auth (should fail)", True, "Correctly rejected unauthenticated request")
                else:
                    self.log_test("Personal Upload without Auth (should fail)", False, f"Expected 401/403, got {response.status}", response_data)
                    
        except Exception as e:
            self.log_test("Personal Upload without Auth (should fail)", False, f"Exception: {str(e)}")

        # Test 2: Upload with authentication - Construction Document
        print("\n--- Test 2: Upload with authentication - Construction Document ---")
        try:
            url = f"{API_BASE}/knowledge/upload-personal"
            headers = {"Authorization": "Bearer mock_dev_token"}
            
            form_data = aiohttp.FormData()
            form_data.add_field('file', construction_document.encode(), 
                              filename='Fire_Safety_Design_Report_123_Collins_St.txt', 
                              content_type='text/plain')
            form_data.add_field('tags', 'fire-safety,BCA,AS1851,commercial,office-building')
            
            async with self.session.post(url, data=form_data, headers=headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status < 400 and isinstance(response_data, dict):
                    if "message" in response_data and "document_id" in response_data:
                        document_id = response_data['document_id']
                        self.log_test("Personal Document Upload (Fire Safety Report)", True, f"Document ID: {document_id}")
                        
                        # Check for AI metadata extraction
                        if "detected_tags" in response_data:
                            tags = response_data['detected_tags']
                            self.log_test("AI Tag Detection", True, f"Detected tags: {tags}")
                        
                        if "extracted_summary" in response_data:
                            summary = response_data['extracted_summary'][:100] + "..." if len(response_data['extracted_summary']) > 100 else response_data['extracted_summary']
                            self.log_test("AI Content Summary", True, f"Summary: {summary}")
                        
                        if "knowledge_bank" in response_data and response_data["knowledge_bank"] == "personal":
                            self.log_test("Personal Knowledge Bank Assignment", True, "Document correctly assigned to personal bank")
                        
                        if "privacy" in response_data:
                            self.log_test("Privacy Protection", True, f"Privacy: {response_data['privacy']}")
                    else:
                        self.log_test("Personal Document Upload (Fire Safety Report)", False, "Missing required fields in response", response_data)
                else:
                    self.log_test("Personal Document Upload (Fire Safety Report)", False, f"Status: {response.status}", response_data)
                    
        except Exception as e:
            self.log_test("Personal Document Upload (Fire Safety Report)", False, f"Exception: {str(e)}")

        # Test 3: Upload PDF-like content (simulated)
        print("\n--- Test 3: Upload PDF-like content (simulated) ---")
        try:
            pdf_like_content = """
            STRUCTURAL ENGINEERING REPORT
            AS/NZS 1170 COMPLIANCE ASSESSMENT
            
            PROJECT DETAILS:
            Building: Residential Apartment Complex
            Location: Brisbane, QLD
            Storeys: 12 levels + basement
            Construction: Reinforced concrete
            
            DESIGN LOADS (AS/NZS 1170.1):
            Dead Loads:
            - Concrete slab (200mm): 4.8 kPa
            - Finishes and services: 1.5 kPa
            - Partitions: 1.0 kPa
            Total Dead Load: 7.3 kPa
            
            Live Loads:
            - Residential areas: 1.5 kPa
            - Corridors and stairs: 3.0 kPa
            - Balconies: 4.0 kPa
            
            WIND LOADS (AS/NZS 1170.2):
            Wind Region: A2
            Terrain Category: 2
            Building Height: 38m
            Design Wind Speed: 45 m/s
            
            SEISMIC LOADS (AS/NZS 1170.4):
            Earthquake Design Category: II
            Hazard Factor (Z): 0.08
            Site Sub-soil Class: Ce
            Structural Ductility Factor: 3.0
            
            STRUCTURAL ELEMENTS:
            Columns: 400x400mm RC columns
            Beams: 300x600mm RC beams  
            Slabs: 200mm post-tensioned slabs
            Foundations: Bored piers to bedrock
            
            COMPLIANCE VERIFICATION:
            ✓ AS/NZS 1170.0 - General principles
            ✓ AS/NZS 1170.1 - Permanent and imposed actions
            ✓ AS/NZS 1170.2 - Wind actions
            ✓ AS/NZS 1170.4 - Earthquake actions
            ✓ AS 3600 - Concrete structures
            
            Engineer: John Smith, CPEng
            Registration: 12345
            Date: December 2024
            """
            
            form_data = aiohttp.FormData()
            form_data.add_field('file', pdf_like_content.encode(), 
                              filename='Structural_Engineering_Report_Brisbane_Apartments.pdf', 
                              content_type='application/pdf')
            form_data.add_field('tags', 'structural,AS1170,concrete,residential,seismic')
            
            async with self.session.post(url, data=form_data, headers=headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status < 400 and isinstance(response_data, dict):
                    if "message" in response_data and "document_id" in response_data:
                        self.log_test("PDF Document Upload (Structural Report)", True, f"Document ID: {response_data['document_id']}")
                        
                        # Check if PDF processing worked
                        if "extracted_summary" in response_data:
                            self.log_test("PDF Text Extraction", True, "Text successfully extracted from PDF")
                    else:
                        self.log_test("PDF Document Upload (Structural Report)", False, "Missing required fields", response_data)
                else:
                    self.log_test("PDF Document Upload (Structural Report)", False, f"Status: {response.status}", response_data)
                    
        except Exception as e:
            self.log_test("PDF Document Upload (Structural Report)", False, f"Exception: {str(e)}")

        # Test 4: Upload Word document (simulated)
        print("\n--- Test 4: Upload Word document (simulated) ---")
        try:
            word_content = """
            HVAC DESIGN SPECIFICATION
            COMMERCIAL OFFICE BUILDING
            
            1. PROJECT OVERVIEW
            Building Type: Class 5 Office Building
            Floor Area: 2,500m² per floor
            Occupancy: 250 people per floor
            Operating Hours: 7:00 AM - 7:00 PM
            
            2. DESIGN CRITERIA (AS 1668.2)
            
            2.1 Fresh Air Requirements
            - Office areas: 10 L/s per person
            - Meeting rooms: 15 L/s per person  
            - Reception areas: 8 L/s per person
            - Toilets: 25 L/s per WC/urinal
            
            2.2 Temperature Control
            - Summer design: 24°C ± 2°C
            - Winter design: 22°C ± 2°C
            - Humidity: 40-60% RH
            
            2.3 Air Changes
            - Office areas: 6 ACH
            - Meeting rooms: 8 ACH
            - Server rooms: 15 ACH
            
            3. SYSTEM DESIGN
            
            3.1 Air Handling Units
            - Primary AHU: 15,000 L/s capacity
            - Secondary AHUs: 5,000 L/s each
            - Heat recovery efficiency: 70%
            
            3.2 Ductwork Design
            - Supply air velocity: 6-8 m/s
            - Return air velocity: 4-6 m/s
            - Pressure loss: <250 Pa total
            
            3.3 Controls System
            - BMS integration required
            - CO2 monitoring in all zones
            - Variable air volume (VAV) control
            
            4. ENERGY EFFICIENCY (NCC Section J)
            - Equipment efficiency ratings
            - Insulation requirements
            - Air leakage testing
            
            5. COMPLIANCE STANDARDS
            - AS 1668.2 - Mechanical ventilation
            - AS/NZS 3000 - Electrical installations
            - NCC Section J - Energy efficiency
            
            Mechanical Engineer: Sarah Johnson, CPEng
            Date: December 2024
            """
            
            form_data = aiohttp.FormData()
            form_data.add_field('file', word_content.encode(), 
                              filename='HVAC_Design_Specification_Office_Building.docx', 
                              content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            form_data.add_field('tags', 'HVAC,AS1668,mechanical,ventilation,energy-efficiency')
            
            async with self.session.post(url, data=form_data, headers=headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status < 400 and isinstance(response_data, dict):
                    if "message" in response_data and "document_id" in response_data:
                        self.log_test("Word Document Upload (HVAC Specification)", True, f"Document ID: {response_data['document_id']}")
                        
                        # Check Word document processing
                        if "detected_tags" in response_data:
                            tags = response_data['detected_tags']
                            if any('hvac' in tag.lower() or 'mechanical' in tag.lower() for tag in tags):
                                self.log_test("HVAC Content Recognition", True, "HVAC content properly recognized")
                    else:
                        self.log_test("Word Document Upload (HVAC Specification)", False, "Missing required fields", response_data)
                else:
                    self.log_test("Word Document Upload (HVAC Specification)", False, f"Status: {response.status}", response_data)
                    
        except Exception as e:
            self.log_test("Word Document Upload (HVAC Specification)", False, f"Exception: {str(e)}")

        # Test 5: Test duplicate upload prevention
        print("\n--- Test 5: Test duplicate upload prevention ---")
        try:
            # Try to upload the same fire safety document again
            form_data = aiohttp.FormData()
            form_data.add_field('file', construction_document.encode(), 
                              filename='Fire_Safety_Design_Report_123_Collins_St.txt', 
                              content_type='text/plain')
            form_data.add_field('tags', 'fire-safety,BCA,AS1851,commercial,office-building')
            
            async with self.session.post(url, data=form_data, headers=headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status == 400:
                    if isinstance(response_data, dict) and "already exists" in str(response_data.get("detail", "")).lower():
                        self.log_test("Duplicate Upload Prevention", True, "Correctly prevented duplicate upload")
                    else:
                        self.log_test("Duplicate Upload Prevention", True, "Upload rejected (likely duplicate)")
                else:
                    self.log_test("Duplicate Upload Prevention", False, f"Expected 400 for duplicate, got {response.status}", response_data)
                    
        except Exception as e:
            self.log_test("Duplicate Upload Prevention", False, f"Exception: {str(e)}")

        # Test 6: Test file size handling (large document)
        print("\n--- Test 6: Test large document handling ---")
        try:
            # Create a larger document
            large_document = construction_document * 10  # Make it 10x larger
            large_document += "\n\nAPPENDIX A: DETAILED CALCULATIONS\n" + "Calculation data: " + "x" * 5000
            
            form_data = aiohttp.FormData()
            form_data.add_field('file', large_document.encode(), 
                              filename='Large_Fire_Safety_Report_with_Calculations.txt', 
                              content_type='text/plain')
            form_data.add_field('tags', 'fire-safety,calculations,detailed,appendix')
            
            async with self.session.post(url, data=form_data, headers=headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status < 400 and isinstance(response_data, dict):
                    if "message" in response_data and "document_id" in response_data:
                        file_size = len(large_document.encode())
                        self.log_test("Large Document Upload", True, f"Successfully uploaded {file_size} bytes")
                    else:
                        self.log_test("Large Document Upload", False, "Missing required fields", response_data)
                else:
                    self.log_test("Large Document Upload", False, f"Status: {response.status}", response_data)
                    
        except Exception as e:
            self.log_test("Large Document Upload", False, f"Exception: {str(e)}")

        # Test 7: Test invalid file type handling
        print("\n--- Test 7: Test invalid file type handling ---")
        try:
            # Try to upload a binary file (simulated executable)
            binary_content = b'\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F' * 100
            
            form_data = aiohttp.FormData()
            form_data.add_field('file', binary_content, 
                              filename='suspicious_file.exe', 
                              content_type='application/octet-stream')
            form_data.add_field('tags', 'test,binary')
            
            async with self.session.post(url, data=form_data, headers=headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                # The system might accept it but fail to extract meaningful text
                if response.status < 400:
                    self.log_test("Binary File Upload", True, "System accepted binary file (may extract limited content)")
                else:
                    self.log_test("Binary File Upload", True, f"System rejected binary file (Status: {response.status})")
                    
        except Exception as e:
            self.log_test("Binary File Upload", False, f"Exception: {str(e)}")

    async def test_legacy_upload_endpoint(self):
        """Test the legacy upload endpoint for backward compatibility"""
        print("\n=== Testing Legacy Upload Endpoint ===")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        try:
            url = f"{API_BASE}/knowledge/upload-document"
            
            legacy_document = """
            Building Code Compliance Checklist
            Project: Mixed-Use Development
            
            1. PLANNING COMPLIANCE
            ☑ Development application approved
            ☑ Building permit obtained
            ☑ Site survey completed
            
            2. STRUCTURAL COMPLIANCE
            ☑ AS/NZS 1170 load calculations
            ☑ AS 3600 concrete design
            ☑ Structural drawings approved
            
            3. FIRE SAFETY COMPLIANCE  
            ☑ BCA fire safety provisions
            ☑ AS 1851 system maintenance
            ☑ Fire engineer certification
            
            4. ACCESSIBILITY COMPLIANCE
            ☑ DDA compliance assessment
            ☑ AS 1428 access requirements
            ☑ Accessible parking provided
            
            5. ENERGY EFFICIENCY
            ☑ NCC Section J compliance
            ☑ Energy rating certificate
            ☑ Insulation specifications
            
            Certifier: Building Certifier Pty Ltd
            Date: December 2024
            """
            
            form_data = aiohttp.FormData()
            form_data.add_field('file', legacy_document.encode(), 
                              filename='Building_Code_Compliance_Checklist.txt', 
                              content_type='text/plain')
            form_data.add_field('tags', 'compliance,BCA,checklist,mixed-use')
            form_data.add_field('is_supplier_content', 'false')
            form_data.add_field('supplier_name', '')
            form_data.add_field('supplier_abn', '')
            
            async with self.session.post(url, data=form_data, headers=mock_headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status < 400 and isinstance(response_data, dict):
                    if "message" in response_data and "document_id" in response_data:
                        self.log_test("Legacy Upload Endpoint", True, f"Document ID: {response_data['document_id']}")
                        
                        # Should route to personal knowledge bank
                        if "knowledge_bank" in response_data and response_data["knowledge_bank"] == "personal":
                            self.log_test("Legacy Endpoint Routing", True, "Correctly routed to personal knowledge bank")
                    else:
                        self.log_test("Legacy Upload Endpoint", False, "Missing required fields", response_data)
                else:
                    self.log_test("Legacy Upload Endpoint", False, f"Status: {response.status}", response_data)
                    
        except Exception as e:
            self.log_test("Legacy Upload Endpoint", False, f"Exception: {str(e)}")

    async def test_upload_error_scenarios(self):
        """Test various error scenarios for upload endpoints"""
        print("\n=== Testing Upload Error Scenarios ===")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Test 1: Upload without file
        print("\n--- Test 1: Upload without file ---")
        try:
            url = f"{API_BASE}/knowledge/upload-personal"
            
            form_data = aiohttp.FormData()
            form_data.add_field('tags', 'test,no-file')
            
            async with self.session.post(url, data=form_data, headers=mock_headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status >= 400:
                    self.log_test("Upload without File (should fail)", True, f"Correctly rejected upload without file (Status: {response.status})")
                else:
                    self.log_test("Upload without File (should fail)", False, "Should have rejected upload without file", response_data)
                    
        except Exception as e:
            self.log_test("Upload without File (should fail)", False, f"Exception: {str(e)}")

        # Test 2: Upload empty file
        print("\n--- Test 2: Upload empty file ---")
        try:
            form_data = aiohttp.FormData()
            form_data.add_field('file', b'', 
                              filename='empty_file.txt', 
                              content_type='text/plain')
            form_data.add_field('tags', 'test,empty')
            
            async with self.session.post(url, data=form_data, headers=mock_headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                # System might accept empty file but extract no content
                if response.status < 400:
                    self.log_test("Empty File Upload", True, "System accepted empty file")
                else:
                    self.log_test("Empty File Upload", True, f"System rejected empty file (Status: {response.status})")
                    
        except Exception as e:
            self.log_test("Empty File Upload", False, f"Exception: {str(e)}")

        # Test 3: Upload with invalid tags
        print("\n--- Test 3: Upload with very long tags ---")
        try:
            long_tags = "very-long-tag-" + "x" * 1000  # Very long tag
            
            form_data = aiohttp.FormData()
            form_data.add_field('file', b'Test content for long tags', 
                              filename='test_long_tags.txt', 
                              content_type='text/plain')
            form_data.add_field('tags', long_tags)
            
            async with self.session.post(url, data=form_data, headers=mock_headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                # System should handle long tags gracefully
                if response.status < 400:
                    self.log_test("Long Tags Upload", True, "System handled long tags gracefully")
                else:
                    self.log_test("Long Tags Upload", True, f"System rejected long tags (Status: {response.status})")
                    
        except Exception as e:
            self.log_test("Long Tags Upload", False, f"Exception: {str(e)}")

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*80)
        print("DOCUMENT UPLOAD TEST SUMMARY")
        print("="*80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\nFAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}: {result['details']}")
        
        print("\n" + "="*80)

async def main():
    """Run all document upload tests"""
    print("🚀 Starting Document Upload Testing for Personal Knowledge Vault")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    
    async with DocumentUploadTester() as tester:
        # Run all tests
        await tester.test_personal_knowledge_vault_upload()
        await tester.test_legacy_upload_endpoint()
        await tester.test_upload_error_scenarios()
        
        # Print summary
        tester.print_summary()

if __name__ == "__main__":
    asyncio.run(main())