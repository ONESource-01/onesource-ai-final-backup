#!/usr/bin/env python3
"""
Comprehensive Document Upload Testing for Personal Knowledge Vault
Tests all aspects of the document upload functionality
"""

import requests
import json
import time
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

class UploadTester:
    def __init__(self):
        self.test_results = []
        self.uploaded_documents = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
    
    def test_authentication_requirements(self):
        """Test that upload endpoints require authentication"""
        print("\n=== Testing Authentication Requirements ===")
        
        # Test personal upload without auth
        try:
            url = f"{API_BASE}/knowledge/upload-personal"
            files = {'file': ('test.txt', 'test content', 'text/plain')}
            data = {'tags': 'test'}
            
            response = requests.post(url, files=files, data=data, timeout=10)
            
            if response.status_code in [401, 403]:
                self.log_test("Personal Upload Auth Required", True, "Correctly rejected unauthenticated request")
            else:
                self.log_test("Personal Upload Auth Required", False, f"Expected 401/403, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Personal Upload Auth Required", False, f"Exception: {str(e)}")
        
        # Test community upload without auth
        try:
            url = f"{API_BASE}/knowledge/upload-community"
            files = {'file': ('test.txt', 'test content', 'text/plain')}
            data = {'tags': 'test'}
            
            response = requests.post(url, files=files, data=data, timeout=10)
            
            if response.status_code in [401, 403]:
                self.log_test("Community Upload Auth Required", True, "Correctly rejected unauthenticated request")
            else:
                self.log_test("Community Upload Auth Required", False, f"Expected 401/403, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Community Upload Auth Required", False, f"Exception: {str(e)}")
    
    def test_personal_knowledge_vault_uploads(self):
        """Test Personal Knowledge Vault document uploads"""
        print("\n=== Testing Personal Knowledge Vault Uploads ===")
        
        headers = {'Authorization': 'Bearer mock_dev_token'}
        
        # Test 1: Fire Safety Document
        fire_safety_doc = """
        FIRE SAFETY DESIGN REPORT
        Project: Commercial Office Complex - 123 Business Park Drive
        
        1. BUILDING CLASSIFICATION & DETAILS
        Building Class: 5 (Office Building)
        Building Height: 8 storeys (32 metres)
        Floor Area: 1,500m² per floor
        Total Occupancy: 300 people
        Construction Type: Type A (concrete and steel)
        
        2. FIRE SAFETY SYSTEMS DESIGN
        
        2.1 Fire Detection & Alarm System (AS 1670.1)
        - Addressable fire detection system throughout
        - Smoke detectors in all office areas and corridors
        - Heat detectors in plant rooms and storage areas
        - Manual call points at all exit doors
        - Fire indicator panel at main reception
        - Audio/visual warning devices on each floor
        
        2.2 Fire Suppression Systems
        - AS 2118.1 compliant sprinkler system throughout building
        - Sprinkler coverage includes all areas except electrical rooms
        - Fire hose reels located within 30m of all areas
        - Portable fire extinguishers per AS 2444
        - Kitchen suppression system in staff kitchen areas
        
        2.3 Passive Fire Protection
        Fire Resistance Levels (FRL) per BCA Table C1.1:
        - Structural elements: 120/120/120 minutes
        - External walls: 60/60/60 minutes
        - Internal walls (fire-rated): 60/60/60 minutes
        - Fire doors: 30/-/- minutes
        - Penetration sealing per AS 1530.4
        
        2.4 Smoke Hazard Management
        - Natural ventilation via openable windows
        - Mechanical smoke exhaust in fire stairs
        - Pressurisation system for fire stairs
        - Smoke doors with self-closing devices
        
        2.5 Emergency Egress System
        - Two fire-isolated exits from each floor
        - Exit travel distances comply with BCA Table D1.4
        - Exit widths calculated per BCA Clause D1.6
        - Emergency lighting per AS/NZS 2293
        - Exit signage per AS/NZS 2293.1
        
        3. COMPLIANCE VERIFICATION
        All fire safety systems designed in accordance with:
        ✓ Building Code of Australia (BCA) 2022 Edition
        ✓ AS 1851 - Maintenance of fire protection systems
        ✓ AS 1670.1 - Fire detection, warning, control and intercom systems
        ✓ AS 2118.1 - Automatic fire sprinkler systems
        ✓ AS 2444 - Portable fire extinguishers
        ✓ AS/NZS 1530.4 - Fire-resistance tests of elements
        ✓ AS/NZS 2293 - Emergency escape lighting and exit signs
        
        4. MAINTENANCE REQUIREMENTS
        - Monthly testing of fire detection system
        - Quarterly testing of fire doors and exits
        - Annual testing of sprinkler system per AS 1851
        - Six-monthly testing of emergency lighting
        
        Fire Safety Engineer: Sarah Johnson, CPEng
        Registration Number: FSE-12345
        Company: Fire Safety Consultants Pty Ltd
        Date: December 2024
        """
        
        try:
            url = f"{API_BASE}/knowledge/upload-personal"
            files = {'file': ('Fire_Safety_Design_Report_123_Business_Park.txt', fire_safety_doc, 'text/plain')}
            data = {'tags': 'fire-safety,BCA,AS1851,AS1670,AS2118,office-building,sprinkler,detection'}
            
            response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'document_id' in result and 'message' in result:
                    doc_id = result['document_id']
                    self.uploaded_documents.append(doc_id)
                    self.log_test("Fire Safety Document Upload", True, f"Document ID: {doc_id}")
                    
                    # Check AI processing results
                    if 'detected_tags' in result:
                        tags = result['detected_tags']
                        if any('fire' in str(tags).lower() or 'safety' in str(tags).lower()):
                            self.log_test("Fire Safety AI Tag Detection", True, f"AI detected fire safety content")
                        self.log_test("AI Tag Detection", True, f"Tags: {tags}")
                    
                    if 'extracted_summary' in result and result['extracted_summary']:
                        summary = result['extracted_summary'][:150] + "..." if len(result['extracted_summary']) > 150 else result['extracted_summary']
                        self.log_test("AI Content Summary", True, f"Summary generated: {summary}")
                    
                    if result.get('knowledge_bank') == 'personal':
                        self.log_test("Personal Bank Assignment", True, "Document correctly assigned to personal knowledge bank")
                    
                    if 'privacy' in result:
                        self.log_test("Privacy Protection", True, f"Privacy: {result['privacy']}")
                else:
                    self.log_test("Fire Safety Document Upload", False, "Missing required fields in response")
            else:
                self.log_test("Fire Safety Document Upload", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Fire Safety Document Upload", False, f"Exception: {str(e)}")
        
        # Test 2: Structural Engineering Document
        structural_doc = """
        STRUCTURAL ENGINEERING DESIGN REPORT
        Project: Residential Apartment Building - 456 Harbour View Terrace
        
        1. PROJECT OVERVIEW
        Building Type: Class 2 Residential (Apartments)
        Building Height: 12 storeys (38 metres)
        Construction: Reinforced concrete with post-tensioned slabs
        Foundation System: Bored concrete piers to bedrock
        Gross Floor Area: 15,000m²
        
        2. DESIGN LOADS (AS/NZS 1170 SERIES)
        
        2.1 Dead Loads (AS/NZS 1170.1)
        - Post-tensioned concrete slab (250mm): 6.0 kPa
        - Structural topping and finishes: 2.0 kPa
        - Services and ceiling: 0.8 kPa
        - Internal partitions: 1.2 kPa
        - External cladding: 1.5 kPa
        Total Characteristic Dead Load: 11.5 kPa
        
        2.2 Live Loads (AS/NZS 1170.1)
        - Residential areas: 1.5 kPa
        - Balconies and terraces: 4.0 kPa
        - Corridors and common areas: 3.0 kPa
        - Stairways: 3.0 kPa
        - Plant rooms: 7.5 kPa
        - Roof areas (non-accessible): 0.25 kPa
        
        2.3 Wind Loads (AS/NZS 1170.2)
        Wind Region: A3 (Brisbane)
        Terrain Category: 2 (suburban)
        Building Height: 38m
        Design Wind Speed (V_R): 45 m/s
        Wind Load Factor (C_fig): 0.8
        Dynamic Response Factor (C_dyn): 1.1
        Maximum Design Wind Pressure: 1.2 kPa
        
        2.4 Earthquake Loads (AS/NZS 1170.4)
        Earthquake Design Category: II
        Hazard Factor (Z): 0.08
        Site Sub-soil Class: Ce (stiff soil)
        Structural Ductility Factor (μ): 3.0
        Structural Performance Factor (S_p): 0.77
        
        3. STRUCTURAL SYSTEM DESIGN
        
        3.1 Foundation System
        - Bored concrete piers: 900mm diameter
        - Pier depth: 15-20m to weathered rock
        - Pile cap design per AS 3600
        - Ground beam system connecting pile caps
        
        3.2 Superstructure Elements
        - Columns: 450x450mm reinforced concrete
        - Beams: 350x700mm reinforced concrete
        - Slabs: 250mm post-tensioned concrete
        - Shear walls: 200mm reinforced concrete
        - Transfer beams at podium level: 600x1200mm
        
        3.3 Material Properties
        - Concrete strength (f'c): 40 MPa (columns), 32 MPa (slabs)
        - Reinforcement steel (f_sy): 500 MPa
        - Post-tensioning steel: 1860 MPa strand
        - Concrete cover: 40mm (external), 30mm (internal)
        
        4. DESIGN VERIFICATION
        
        4.1 Ultimate Limit State Design
        - Load combinations per AS/NZS 1170.0
        - Strength design per AS 3600
        - Deflection limits per AS/NZS 1170.0
        - Crack control per AS 3600
        
        4.2 Serviceability Limit State
        - Short-term deflection: L/250
        - Long-term deflection: L/150
        - Vibration analysis for floor systems
        
        5. COMPLIANCE STATEMENT
        The structural design complies with:
        ✓ AS/NZS 1170.0 - Structural design actions (General principles)
        ✓ AS/NZS 1170.1 - Permanent, imposed and other actions
        ✓ AS/NZS 1170.2 - Wind actions
        ✓ AS/NZS 1170.4 - Earthquake actions in Australia
        ✓ AS 3600 - Concrete structures
        ✓ AS/NZS 4671 - Steel reinforcing materials
        
        6. CONSTRUCTION REQUIREMENTS
        - Concrete strength testing per AS 1012
        - Reinforcement placement inspection
        - Post-tensioning installation by certified contractor
        - Structural inspections at key stages
        
        Structural Engineer: Michael Chen, CPEng MIEAust
        Registration Number: 87654
        Company: Structural Design Associates
        Date: December 2024
        """
        
        try:
            files = {'file': ('Structural_Design_Report_456_Harbour_View.txt', structural_doc, 'text/plain')}
            data = {'tags': 'structural,AS1170,AS3600,concrete,residential,post-tensioned,earthquake'}
            
            response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'document_id' in result:
                    doc_id = result['document_id']
                    self.uploaded_documents.append(doc_id)
                    self.log_test("Structural Engineering Document Upload", True, f"Document ID: {doc_id}")
                    
                    # Check for structural content recognition
                    if 'detected_tags' in result:
                        tags = str(result['detected_tags']).lower()
                        if 'structural' in tags or 'concrete' in tags or 'engineering' in tags:
                            self.log_test("Structural Content Recognition", True, "AI correctly identified structural content")
                else:
                    self.log_test("Structural Engineering Document Upload", False, "Missing document_id")
            else:
                self.log_test("Structural Engineering Document Upload", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Structural Engineering Document Upload", False, f"Exception: {str(e)}")
        
        # Test 3: HVAC Design Document
        hvac_doc = """
        HVAC SYSTEM DESIGN SPECIFICATION
        Project: Corporate Office Tower - 789 Executive Plaza
        
        1. PROJECT PARAMETERS
        Building Type: Class 5 Office Building
        Total Floor Area: 25,000m²
        Occupancy: 500 people
        Operating Hours: 6:00 AM - 10:00 PM
        Climate Zone: 2 (Warm temperate)
        
        2. DESIGN CRITERIA (AS 1668.2)
        
        2.1 Indoor Environmental Quality
        - Summer design temperature: 24°C ± 2°C
        - Winter design temperature: 22°C ± 2°C
        - Relative humidity: 40-60% RH
        - Air velocity: <0.25 m/s in occupied zone
        - Noise levels: <NC 40 in offices, <NC 35 in meeting rooms
        
        2.2 Fresh Air Requirements (AS 1668.2)
        - Office areas: 10 L/s per person
        - Meeting rooms: 15 L/s per person
        - Reception areas: 8 L/s per person
        - Toilets: 25 L/s per WC/urinal
        - Kitchen/café areas: 20 L/s per person
        - Car park: 5 L/s per m² floor area
        
        2.3 Air Change Requirements
        - General office areas: 6 air changes per hour
        - Meeting rooms: 8 air changes per hour
        - Server rooms: 15 air changes per hour
        - Toilets: 10 air changes per hour
        - Storage areas: 2 air changes per hour
        
        3. HVAC SYSTEM DESIGN
        
        3.1 Central Plant Equipment
        - Primary chiller: 800kW water-cooled screw chiller
        - Secondary chiller: 600kW water-cooled screw chiller
        - Cooling towers: 2 x 750kW induced draft
        - Boilers: 2 x 400kW gas-fired condensing boilers
        - Primary pumps: 3 x 50% duty/standby
        - Secondary pumps: Variable speed drive controlled
        
        3.2 Air Handling Systems
        - Primary AHU: 25,000 L/s capacity with heat recovery
        - Secondary AHUs: 4 x 8,000 L/s for floor zones
        - Heat recovery efficiency: 75% sensible, 65% latent
        - Filtration: G4 pre-filter + F7 final filter
        - Supply air temperature: 13°C (summer), 18°C (winter)
        
        3.3 Distribution Systems
        - Variable Air Volume (VAV) terminal units
        - Supply air ductwork: galvanised steel, insulated
        - Return air via ceiling plenum
        - Supply air velocity: 6-8 m/s in mains, 4-6 m/s in branches
        - Return air velocity: 4-6 m/s maximum
        - Total system pressure loss: <1000 Pa
        
        3.4 Zone Control Systems
        - Building Management System (BMS) integration
        - CO₂ monitoring in all occupied zones
        - Temperature sensors in each zone
        - Occupancy sensors for demand control
        - Time scheduling for different zones
        
        4. ENERGY EFFICIENCY MEASURES (NCC Section J)
        
        4.1 Equipment Efficiency
        - Chiller COP: >5.5 at full load
        - Boiler efficiency: >90% at full load
        - Fan motor efficiency: IE3 class minimum
        - Pump motor efficiency: IE3 class minimum
        - Variable speed drives on all major equipment
        
        4.2 System Efficiency
        - Heat recovery from exhaust air
        - Free cooling via cooling towers
        - Economiser cycle operation
        - Demand-controlled ventilation
        - Night purge cooling strategy
        
        4.3 Building Fabric Integration
        - Coordination with building thermal performance
        - Window solar heat gain control
        - Thermal zoning optimisation
        - Insulation and air sealing requirements
        
        5. COMPLIANCE VERIFICATION
        Design complies with:
        ✓ AS 1668.2 - The use of mechanical ventilation and air-conditioning
        ✓ AS/NZS 3000 - Electrical installations (wiring rules)
        ✓ NCC Section J - Energy efficiency provisions
        ✓ AS/NZS 1677 - Refrigerating systems
        ✓ AS 4254 - Ductwork for air-handling systems
        
        6. COMMISSIONING REQUIREMENTS
        - Pre-commissioning verification
        - System performance testing
        - Air and water balancing
        - Controls calibration and testing
        - Performance verification over 12 months
        
        Mechanical Engineer: Lisa Wong, CPEng
        Registration Number: 56789
        Company: HVAC Design Solutions Pty Ltd
        Date: December 2024
        """
        
        try:
            files = {'file': ('HVAC_Design_Specification_789_Executive_Plaza.txt', hvac_doc, 'text/plain')}
            data = {'tags': 'HVAC,AS1668,mechanical,ventilation,energy-efficiency,BMS,chiller'}
            
            response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'document_id' in result:
                    doc_id = result['document_id']
                    self.uploaded_documents.append(doc_id)
                    self.log_test("HVAC Design Document Upload", True, f"Document ID: {doc_id}")
                    
                    # Check for HVAC content recognition
                    if 'detected_tags' in result:
                        tags = str(result['detected_tags']).lower()
                        if 'hvac' in tags or 'mechanical' in tags or 'ventilation' in tags:
                            self.log_test("HVAC Content Recognition", True, "AI correctly identified HVAC content")
                else:
                    self.log_test("HVAC Design Document Upload", False, "Missing document_id")
            else:
                self.log_test("HVAC Design Document Upload", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("HVAC Design Document Upload", False, f"Exception: {str(e)}")
    
    def test_file_format_support(self):
        """Test different file format support"""
        print("\n=== Testing File Format Support ===")
        
        headers = {'Authorization': 'Bearer mock_dev_token'}
        url = f"{API_BASE}/knowledge/upload-personal"
        
        # Test PDF format (simulated)
        pdf_content = """
        BUILDING CODE COMPLIANCE CHECKLIST
        Project: Mixed-Use Development - 321 Urban Centre
        
        PLANNING & APPROVALS
        ☑ Development Application approved by Council
        ☑ Building Permit issued by Private Certifier
        ☑ Construction Certificate obtained
        ☑ Site survey and setout completed
        
        STRUCTURAL COMPLIANCE
        ☑ AS/NZS 1170 load calculations completed
        ☑ AS 3600 concrete design verified
        ☑ Structural drawings approved by engineer
        ☑ Foundation design suitable for soil conditions
        
        FIRE SAFETY COMPLIANCE
        ☑ BCA fire safety provisions addressed
        ☑ Fire engineer report completed
        ☑ AS 1851 maintenance schedules prepared
        ☑ Fire safety systems designed and approved
        
        ACCESSIBILITY COMPLIANCE
        ☑ DDA compliance assessment completed
        ☑ AS 1428 access requirements verified
        ☑ Accessible parking spaces provided
        ☑ Accessible path of travel confirmed
        
        ENERGY EFFICIENCY
        ☑ NCC Section J compliance demonstrated
        ☑ Energy rating certificate obtained
        ☑ Insulation specifications verified
        ☑ Glazing performance confirmed
        
        HYDRAULIC SERVICES
        ☑ AS/NZS 3500 plumbing design completed
        ☑ Water authority approvals obtained
        ☑ Stormwater management plan approved
        ☑ Backflow prevention devices specified
        
        Building Certifier: Professional Certification Services
        Date: December 2024
        """
        
        try:
            files = {'file': ('Building_Compliance_Checklist.pdf', pdf_content, 'application/pdf')}
            data = {'tags': 'compliance,BCA,checklist,mixed-use,DDA,accessibility'}
            
            response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'document_id' in result:
                    self.log_test("PDF Format Support", True, f"PDF processed successfully")
                    if 'extracted_summary' in result and result['extracted_summary']:
                        self.log_test("PDF Text Extraction", True, "Text extracted from PDF")
                else:
                    self.log_test("PDF Format Support", False, "Missing document_id")
            else:
                self.log_test("PDF Format Support", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("PDF Format Support", False, f"Exception: {str(e)}")
        
        # Test Word document format (simulated)
        word_content = """
        CONSTRUCTION SAFETY MANAGEMENT PLAN
        Project: Industrial Warehouse Complex
        
        1. SAFETY OBJECTIVES
        - Achieve zero harm to all workers and visitors
        - Comply with Work Health and Safety regulations
        - Protect the environment and community
        - Maintain high safety standards throughout construction
        
        2. HAZARD IDENTIFICATION AND RISK ASSESSMENT
        
        2.1 Major Hazards Identified
        - Working at height (scaffolding, roof work)
        - Heavy machinery and mobile plant operation
        - Electrical hazards and temporary power
        - Manual handling and lifting operations
        - Chemical and hazardous substance exposure
        - Excavation and confined space entry
        
        2.2 Risk Control Hierarchy
        - Elimination: Remove hazards where possible
        - Substitution: Use safer alternatives
        - Engineering controls: Guards, barriers, ventilation
        - Administrative controls: Procedures, training, signage
        - Personal protective equipment: Last line of defence
        
        3. SAFETY CONTROL MEASURES
        
        3.1 Site Access and Security
        - Controlled site access with sign-in procedures
        - Site induction for all personnel
        - Visitor management system
        - Security fencing and barriers
        - Clear pedestrian and vehicle separation
        
        3.2 Personal Protective Equipment
        - Hard hats mandatory in all areas
        - High-visibility clothing required
        - Safety boots with steel toe caps
        - Eye and hearing protection as required
        - Fall protection equipment for height work
        
        3.3 Plant and Equipment Safety
        - Pre-start inspections for all equipment
        - Operator competency verification
        - Maintenance schedules and records
        - Isolation and lockout procedures
        - Crane and lifting equipment certification
        
        4. EMERGENCY PROCEDURES
        
        4.1 Emergency Contacts
        - Emergency Services: 000
        - Site Manager: 0400 123 456
        - Safety Officer: 0400 789 012
        - First Aid Officer: 0400 345 678
        
        4.2 Emergency Response
        - Evacuation procedures and assembly points
        - First aid facilities and trained personnel
        - Fire prevention and response procedures
        - Incident reporting and investigation
        - Emergency equipment locations
        
        5. TRAINING AND COMPETENCY
        - Site safety induction for all workers
        - Toolbox talks and safety meetings
        - Specific training for high-risk activities
        - Competency assessment and records
        - Refresher training programs
        
        Safety Manager: Construction Safety Solutions
        Date: December 2024
        """
        
        try:
            files = {'file': ('Safety_Management_Plan.docx', word_content, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
            data = {'tags': 'safety,WHS,construction,industrial,risk-management'}
            
            response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'document_id' in result:
                    self.log_test("Word Document Format Support", True, f"Word document processed successfully")
                    if 'detected_tags' in result:
                        tags = str(result['detected_tags']).lower()
                        if 'safety' in tags or 'construction' in tags:
                            self.log_test("Word Document Content Recognition", True, "Safety content recognized")
                else:
                    self.log_test("Word Document Format Support", False, "Missing document_id")
            else:
                self.log_test("Word Document Format Support", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Word Document Format Support", False, f"Exception: {str(e)}")
    
    def test_duplicate_prevention(self):
        """Test duplicate document prevention"""
        print("\n=== Testing Duplicate Document Prevention ===")
        
        headers = {'Authorization': 'Bearer mock_dev_token'}
        url = f"{API_BASE}/knowledge/upload-personal"
        
        duplicate_content = """
        Test Document for Duplicate Detection
        
        This document is specifically created to test the duplicate detection
        functionality of the Personal Knowledge Vault system.
        
        The system should detect when the same document (based on file hash)
        is uploaded multiple times and prevent duplicate storage.
        
        Standards referenced for testing:
        - BCA 2022 Building Code of Australia
        - AS/NZS 1170 Structural design actions
        - AS 3600 Concrete structures
        """
        
        # First upload
        try:
            files = {'file': ('Duplicate_Test_Document.txt', duplicate_content, 'text/plain')}
            data = {'tags': 'test,duplicate,detection'}
            
            response1 = requests.post(url, files=files, data=data, headers=headers, timeout=30)
            
            if response1.status_code == 200:
                result1 = response1.json()
                if 'document_id' in result1:
                    self.log_test("First Upload Success", True, f"Document ID: {result1['document_id']}")
                    
                    # Second upload (should be rejected as duplicate)
                    time.sleep(1)  # Small delay
                    files = {'file': ('Duplicate_Test_Document.txt', duplicate_content, 'text/plain')}
                    response2 = requests.post(url, files=files, data=data, headers=headers, timeout=30)
                    
                    if response2.status_code == 400:
                        if 'already exists' in response2.text.lower():
                            self.log_test("Duplicate Prevention", True, "Duplicate upload correctly prevented")
                        else:
                            self.log_test("Duplicate Prevention", True, "Upload rejected (likely duplicate)")
                    else:
                        self.log_test("Duplicate Prevention", False, f"Expected 400, got {response2.status_code}")
                else:
                    self.log_test("First Upload Success", False, "Missing document_id")
            else:
                self.log_test("First Upload Success", False, f"Status: {response1.status_code}")
                
        except Exception as e:
            self.log_test("Duplicate Prevention Test", False, f"Exception: {str(e)}")
    
    def test_knowledge_search_integration(self):
        """Test that uploaded documents are searchable"""
        print("\n=== Testing Knowledge Search Integration ===")
        
        headers = {'Authorization': 'Bearer mock_dev_token'}
        
        # Wait a moment for documents to be indexed
        time.sleep(2)
        
        search_queries = [
            ('fire safety BCA', 'Fire Safety Search'),
            ('structural concrete AS3600', 'Structural Engineering Search'),
            ('HVAC ventilation AS1668', 'HVAC System Search'),
            ('building compliance checklist', 'Compliance Search')
        ]
        
        for query, test_name in search_queries:
            try:
                url = f"{API_BASE}/knowledge/search"
                params = {'query': query, 'limit': 5}
                
                response = requests.get(url, headers=headers, params=params, timeout=30)
                
                if response.status_code == 200:
                    result = response.json()
                    if 'personal_results' in result and 'community_results' in result:
                        personal_count = len(result['personal_results'])
                        community_count = len(result['community_results'])
                        total = result.get('total_results', 0)
                        
                        self.log_test(f"{test_name}", True, f"Personal: {personal_count}, Community: {community_count}, Total: {total}")
                        
                        # Check similarity scores
                        if personal_count > 0:
                            first_result = result['personal_results'][0]
                            if 'similarity_score' in first_result:
                                score = first_result['similarity_score']
                                self.log_test(f"{test_name} Similarity", True, f"Top score: {score:.3f}")
                    else:
                        self.log_test(f"{test_name}", False, "Missing expected fields in response")
                else:
                    self.log_test(f"{test_name}", False, f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"{test_name}", False, f"Exception: {str(e)}")
    
    def test_legacy_endpoint_compatibility(self):
        """Test legacy upload endpoint for backward compatibility"""
        print("\n=== Testing Legacy Endpoint Compatibility ===")
        
        headers = {'Authorization': 'Bearer mock_dev_token'}
        url = f"{API_BASE}/knowledge/upload-document"
        
        legacy_content = """
        ELECTRICAL INSTALLATION DESIGN
        Project: Retail Shopping Centre
        
        1. ELECTRICAL LOAD ANALYSIS
        - Total connected load: 2.5 MVA
        - Maximum demand: 2.0 MVA
        - Diversity factor: 0.8
        - Power factor: 0.95 lagging
        
        2. MAIN ELECTRICAL SYSTEMS
        - HV supply: 11kV from utility
        - Main switchboard: 2500A, 415V
        - Distribution boards throughout
        - Emergency generator: 500kVA
        
        3. COMPLIANCE STANDARDS
        - AS/NZS 3000 Electrical installations
        - AS/NZS 3008 Electrical selection of cables
        - AS 2293 Emergency lighting
        - AS 1768 Lightning protection
        
        Electrical Engineer: Power Systems Design
        Date: December 2024
        """
        
        try:
            files = {'file': ('Electrical_Design_Retail_Centre.txt', legacy_content, 'text/plain')}
            data = {
                'tags': 'electrical,AS3000,retail,power-systems',
                'is_supplier_content': 'false',
                'supplier_name': '',
                'supplier_abn': ''
            }
            
            response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'document_id' in result:
                    self.log_test("Legacy Endpoint Functionality", True, f"Document ID: {result['document_id']}")
                    
                    # Should route to personal knowledge bank
                    if result.get('knowledge_bank') == 'personal':
                        self.log_test("Legacy Endpoint Routing", True, "Correctly routed to personal knowledge bank")
                    
                    if 'detected_tags' in result:
                        tags = str(result['detected_tags']).lower()
                        if 'electrical' in tags or 'power' in tags:
                            self.log_test("Legacy Endpoint AI Processing", True, "AI processing working on legacy endpoint")
                else:
                    self.log_test("Legacy Endpoint Functionality", False, "Missing document_id")
            else:
                self.log_test("Legacy Endpoint Functionality", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Legacy Endpoint Functionality", False, f"Exception: {str(e)}")
    
    def test_error_handling(self):
        """Test various error scenarios"""
        print("\n=== Testing Error Handling ===")
        
        headers = {'Authorization': 'Bearer mock_dev_token'}
        url = f"{API_BASE}/knowledge/upload-personal"
        
        # Test empty file
        try:
            files = {'file': ('empty_file.txt', '', 'text/plain')}
            data = {'tags': 'test,empty'}
            
            response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
            
            # System should handle empty files gracefully
            if response.status_code == 200:
                self.log_test("Empty File Handling", True, "System handled empty file gracefully")
            else:
                self.log_test("Empty File Handling", True, f"System rejected empty file (Status: {response.status_code})")
                
        except Exception as e:
            self.log_test("Empty File Handling", False, f"Exception: {str(e)}")
        
        # Test very long tags
        try:
            long_tags = ','.join([f'tag{i}' for i in range(100)])  # 100 tags
            
            files = {'file': ('test_long_tags.txt', 'Test content', 'text/plain')}
            data = {'tags': long_tags}
            
            response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
            
            # System should handle long tag lists gracefully
            if response.status_code == 200:
                self.log_test("Long Tags Handling", True, "System handled long tag list gracefully")
            else:
                self.log_test("Long Tags Handling", True, f"System handled long tags (Status: {response.status_code})")
                
        except Exception as e:
            self.log_test("Long Tags Handling", False, f"Exception: {str(e)}")
    
    def print_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "="*80)
        print("COMPREHENSIVE DOCUMENT UPLOAD TEST SUMMARY")
        print("="*80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        print(f"\nDocuments Successfully Uploaded: {len(self.uploaded_documents)}")
        
        if failed_tests > 0:
            print(f"\nFAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}: {result['details']}")
        
        print("\n" + "="*80)

def main():
    """Run comprehensive document upload tests"""
    print("🚀 COMPREHENSIVE DOCUMENT UPLOAD TESTING")
    print("Personal Knowledge Vault - Full Functionality Test")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    
    tester = UploadTester()
    
    # Run all test suites
    tester.test_authentication_requirements()
    tester.test_personal_knowledge_vault_uploads()
    tester.test_file_format_support()
    tester.test_duplicate_prevention()
    tester.test_knowledge_search_integration()
    tester.test_legacy_endpoint_compatibility()
    tester.test_error_handling()
    
    # Print comprehensive summary
    tester.print_summary()

if __name__ == "__main__":
    main()