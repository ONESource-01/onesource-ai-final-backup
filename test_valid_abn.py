#!/usr/bin/env python3
"""
Test partner registration with valid ABN
"""
import asyncio
import aiohttp
import sys
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

async def test_complete_partner_workflow():
    """Test complete partner workflow with valid ABN"""
    print("=== Testing Complete Partner Workflow with Valid ABN ===")
    print(f"Backend URL: {BACKEND_URL}")
    
    async with aiohttp.ClientSession() as session:
        # Step 1: Register partner with valid ABN
        registration_data = {
            "company_name": "BuildTech Solutions Pty Ltd",
            "abn": "51 824 753 556",  # Valid ABN that passes ATO checksum
            "primary_contact_name": "Michael Chen",
            "primary_email": "michael.chen@buildtech-solutions.com.au",
            "backup_email": "admin@buildtech-solutions.com.au",
            "agreed_to_terms": True,
            "description": "Construction technology and building materials supplier"
        }
        
        print("\n1. Testing Partner Registration with Valid ABN...")
        try:
            url = f"{API_BASE}/partners/register"
            headers = {"Content-Type": "application/json"}
            
            async with session.post(url, json=registration_data, headers=headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status < 400 and isinstance(response_data, dict):
                    if "message" in response_data and "partner_id" in response_data:
                        partner_id = response_data['partner_id']
                        print(f"✅ SUCCESS: Partner registration successful!")
                        print(f"   Partner ID: {partner_id}")
                        print(f"   Company: {registration_data['company_name']}")
                        print(f"   ABN: {registration_data['abn']} (Valid)")
                        if "next_steps" in response_data:
                            print(f"   Next steps provided: {len(response_data['next_steps'])}")
                        return True
                    else:
                        print(f"❌ FAIL: Missing required fields in response")
                        print(f"   Response: {response_data}")
                        return False
                else:
                    print(f"❌ FAIL: Partner registration failed")
                    print(f"   Status: {response.status}")
                    print(f"   Response: {response_data}")
                    return False
                    
        except Exception as e:
            print(f"❌ FAIL: Exception during partner registration: {str(e)}")
            return False

        # Step 2: Test partner status check
        print("\n2. Testing Partner Status Check...")
        try:
            mock_headers = {"Authorization": "Bearer mock_dev_token"}
            url = f"{API_BASE}/partners/check-status"
            
            async with session.get(url, headers=mock_headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status < 400 and isinstance(response_data, dict):
                    if "is_partner" in response_data:
                        is_partner = response_data["is_partner"]
                        print(f"✅ SUCCESS: Partner status check working")
                        print(f"   Is partner: {is_partner}")
                        if is_partner and "partner_info" in response_data:
                            partner_info = response_data["partner_info"]
                            print(f"   Company: {partner_info.get('company_name', 'N/A')}")
                    else:
                        print(f"❌ FAIL: Missing is_partner field")
                        print(f"   Response: {response_data}")
                else:
                    print(f"❌ FAIL: Status check failed")
                    print(f"   Status: {response.status}")
                    print(f"   Response: {response_data}")
                    
        except Exception as e:
            print(f"❌ FAIL: Exception during status check: {str(e)}")

        # Step 3: Test Community Knowledge Bank upload access
        print("\n3. Testing Community Knowledge Bank Upload Access...")
        try:
            url = f"{API_BASE}/knowledge/upload-community"
            mock_headers = {"Authorization": "Bearer mock_dev_token"}
            
            test_content = """
            BuildTech Solutions - HVAC System Installation Guide
            
            Product: Commercial HVAC Units - Energy Efficient Series
            Standards Compliance: AS/NZS 1668.2, AS/NZS 3000
            
            Installation Requirements:
            1. Electrical connections per AS/NZS 3000
            2. Ventilation rates per AS/NZS 1668.2
            3. Refrigerant handling per AS/NZS 1677
            4. Commissioning per AS 1851
            
            Energy Efficiency:
            - MEPS compliant
            - Variable speed drives included
            - Smart controls for optimal performance
            
            Warranty: 5 years parts and labor
            Support: 1800-BUILDTECH
            
            Contact: support@buildtech-solutions.com.au
            ABN: 51 824 753 556
            """
            
            form_data = aiohttp.FormData()
            form_data.add_field('file', test_content.encode(), 
                              filename='BuildTech_HVAC_Installation_Guide.txt', 
                              content_type='text/plain')
            form_data.add_field('tags', 'HVAC,installation,energy-efficiency,commercial')
            
            async with session.post(url, data=form_data, headers=mock_headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status < 400 and isinstance(response_data, dict):
                    if "message" in response_data and "document_id" in response_data:
                        print(f"✅ SUCCESS: Community upload successful!")
                        print(f"   Document ID: {response_data['document_id']}")
                        if "company_attribution" in response_data:
                            print(f"   Attribution: {response_data['company_attribution']}")
                    else:
                        print(f"❌ FAIL: Missing required fields in upload response")
                        print(f"   Response: {response_data}")
                else:
                    print(f"❌ FAIL: Community upload failed")
                    print(f"   Status: {response.status}")
                    print(f"   Response: {response_data}")
                    
        except Exception as e:
            print(f"❌ FAIL: Exception during community upload: {str(e)}")

        print("\n=== Partner Workflow Test Complete ===")

async def main():
    """Run complete partner workflow test"""
    await test_complete_partner_workflow()

if __name__ == "__main__":
    asyncio.run(main())