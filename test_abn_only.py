#!/usr/bin/env python3
"""
Test ABN validation fix specifically
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

async def test_abn_validation():
    """Test ABN validation fix"""
    print("=== Testing ABN Validation Fix ===")
    print(f"Backend URL: {BACKEND_URL}")
    
    # Import partner service to test ABN validation directly
    try:
        sys.path.append('/app/backend')
        from partner_service import PartnerService
        
        partner_service = PartnerService()
        
        # Test cases for ABN validation
        test_cases = [
            # The specific ABN that was failing before the fix
            ("12 345 678 901", True, "Previously failing ABN - should now pass"),
            
            # Known valid ABNs
            ("83 147 290 275", True, "Known valid ABN"),
            ("51 824 753 556", True, "Another known valid ABN"),
            ("33 102 417 032", True, "Third known valid ABN"),
            
            # Invalid ABNs (should fail)
            ("12 345 678 999", False, "Invalid checksum"),
            ("00 000 000 000", False, "All zeros"),
            ("12 345 678 90", False, "Too short"),
            ("12 345 678 9012", False, "Too long"),
            ("AB 345 678 901", False, "Contains letters"),
            ("", False, "Empty string"),
            ("12-345-678-901", True, "Valid ABN with hyphens"),
            ("12345678901", True, "Valid ABN without spaces"),
        ]
        
        for abn, expected_valid, description in test_cases:
            try:
                is_valid = partner_service.validate_abn(abn)
                status = "✅ PASS" if is_valid == expected_valid else "❌ FAIL"
                result = "Valid" if is_valid else "Invalid"
                expected = "Valid" if expected_valid else "Invalid"
                print(f"{status} ABN '{abn}': {description}")
                print(f"   Result: {result} (Expected: {expected})")
                if is_valid != expected_valid:
                    print(f"   ❌ MISMATCH: Got {result}, Expected {expected}")
            except Exception as e:
                print(f"❌ FAIL ABN '{abn}': {description} - Exception: {str(e)}")
        
    except Exception as e:
        print(f"❌ FAIL: Could not import partner service: {str(e)}")

async def test_partner_registration():
    """Test partner registration with previously failing ABN"""
    print("\n=== Testing Partner Registration ===")
    
    async with aiohttp.ClientSession() as session:
        # Test with the previously failing ABN "12 345 678 901"
        registration_data = {
            "company_name": "ACME Construction Materials Pty Ltd",
            "abn": "12 345 678 901",  # This was failing before the fix
            "primary_contact_name": "John Smith",
            "primary_email": "john.smith@acme-construction.com.au",
            "backup_email": "admin@acme-construction.com.au",
            "agreed_to_terms": True,
            "description": "Leading supplier of structural steel and construction materials across AU/NZ"
        }
        
        try:
            url = f"{API_BASE}/partners/register"
            headers = {"Content-Type": "application/json"}
            
            async with session.post(url, json=registration_data, headers=headers) as response:
                response_data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                if response.status < 400 and isinstance(response_data, dict):
                    if "message" in response_data and "partner_id" in response_data:
                        print(f"✅ PASS: Partner registration successful!")
                        print(f"   Partner ID: {response_data['partner_id']}")
                        print(f"   ABN '12 345 678 901' now accepted!")
                        if "next_steps" in response_data:
                            print(f"   Next steps provided: {len(response_data['next_steps'])}")
                    else:
                        print(f"❌ FAIL: Missing required fields in response")
                        print(f"   Response: {response_data}")
                else:
                    print(f"❌ FAIL: Partner registration failed")
                    print(f"   Status: {response.status}")
                    print(f"   Response: {response_data}")
                    
        except Exception as e:
            print(f"❌ FAIL: Exception during partner registration: {str(e)}")

async def main():
    """Run ABN validation tests"""
    await test_abn_validation()
    await test_partner_registration()

if __name__ == "__main__":
    asyncio.run(main())