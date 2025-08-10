"""
Partner Management Service for Community Knowledge Bank
Handles partner registration, verification, and document management
"""

import os
import uuid
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from motor.motor_asyncio import AsyncIOMotorClient
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import re


@dataclass
class PartnerRegistration:
    """Partner registration data structure"""
    company_name: str
    abn: str
    primary_contact_name: str
    primary_email: str
    backup_email: str
    agreed_to_terms: bool
    registration_date: datetime
    partner_id: str
    status: str = "active"  # active, suspended, inactive


class PartnerService:
    """Service for managing partner registrations and uploads"""
    
    def __init__(self):
        self.mongo_client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
        self.db = self.mongo_client.onesource_ai
        
        # Initialize SendGrid if available
        sendgrid_key = os.environ.get('SENDGRID_API_KEY')
        self.sendgrid = SendGridAPIClient(sendgrid_key) if sendgrid_key else None
        self.sendgrid_configured = bool(sendgrid_key)
    
    def validate_abn(self, abn: str) -> bool:
        """Validate Australian Business Number using official ATO algorithm"""
        # Clean ABN (remove spaces, hyphens)
        clean_abn = re.sub(r'[^0-9]', '', abn)
        
        # ABN should be 11 digits
        if len(clean_abn) != 11:
            return False
        
        # ABN checksum validation using official ATO algorithm
        try:
            # Convert to list of integers
            digits = [int(d) for d in clean_abn]
            
            # Subtract 1 from the first digit
            digits[0] = digits[0] - 1
            
            # Official ATO weights for each position
            weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
            
            # Calculate weighted sum
            weighted_sum = sum(digit * weight for digit, weight in zip(digits, weights))
            
            # Valid ABN if sum is divisible by 89
            return weighted_sum % 89 == 0
            
        except (ValueError, IndexError):
            return False
    
    async def register_partner(self, registration_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new partner"""
        try:
            # Validate ABN
            if not self.validate_abn(registration_data["abn"]):
                raise ValueError("Invalid ABN format")
            
            # Check if partner already exists
            existing = await self.db.partners.find_one({
                "$or": [
                    {"abn": registration_data["abn"]},
                    {"primary_email": registration_data["primary_email"]}
                ]
            })
            
            if existing:
                raise ValueError("Partner already registered with this ABN or email")
            
            # Create partner record
            partner_id = str(uuid.uuid4())
            partner_record = {
                "partner_id": partner_id,
                "company_name": registration_data["company_name"],
                "abn": registration_data["abn"],
                "primary_contact_name": registration_data["primary_contact_name"],
                "primary_email": registration_data["primary_email"],
                "backup_email": registration_data["backup_email"],
                "agreed_to_terms": registration_data["agreed_to_terms"],
                "terms_agreement_date": datetime.utcnow(),
                "registration_date": datetime.utcnow(),
                "status": "active",
                "upload_count": 0,
                "created_by": registration_data.get("created_by", "self_registration")
            }
            
            # Save to database
            await self.db.partners.insert_one(partner_record)
            
            # Send welcome email
            await self.send_partner_welcome_email(partner_record)
            
            return {
                "success": True,
                "partner_id": partner_id,
                "message": "Partner registration successful",
                "company_name": registration_data["company_name"]
            }
            
        except ValueError as e:
            return {"success": False, "message": str(e)}
        except Exception as e:
            print(f"Error registering partner: {e}")
            return {"success": False, "message": "Registration failed. Please try again."}
    
    async def get_partner_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get partner information by email"""
        try:
            partner = await self.db.partners.find_one({
                "$or": [
                    {"primary_email": email},
                    {"backup_email": email}
                ]
            })
            return partner
        except Exception as e:
            print(f"Error getting partner: {e}")
            return None
    
    async def get_partner_by_id(self, partner_id: str) -> Optional[Dict[str, Any]]:
        """Get partner information by partner ID"""
        try:
            partner = await self.db.partners.find_one({"partner_id": partner_id})
            return partner
        except Exception as e:
            print(f"Error getting partner: {e}")
            return None
    
    async def increment_upload_count(self, partner_id: str):
        """Increment partner's upload count"""
        try:
            await self.db.partners.update_one(
                {"partner_id": partner_id},
                {"$inc": {"upload_count": 1}}
            )
        except Exception as e:
            print(f"Error updating upload count: {e}")
    
    async def send_partner_welcome_email(self, partner_record: Dict[str, Any]):
        """Send welcome email to new partner"""
        if not self.sendgrid_configured:
            print(f"Welcome email skipped - SendGrid not configured for {partner_record['company_name']}")
            return
        
        try:
            subject = f"Welcome to ONESource-ai Community Knowledge Bank - {partner_record['company_name']}"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .header {{ background: #0f2f57; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 30px; }}
                    .footer {{ background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎉 Welcome to ONESource-ai Community Knowledge Bank!</h1>
                </div>
                
                <div class="content">
                    <h2>Hello {partner_record['primary_contact_name']},</h2>
                    
                    <p>Thank you for registering <strong>{partner_record['company_name']}</strong> as a Community Knowledge Bank partner!</p>
                    
                    <h3>📋 Registration Details:</h3>
                    <ul>
                        <li><strong>Company:</strong> {partner_record['company_name']}</li>
                        <li><strong>ABN:</strong> {partner_record['abn']}</li>
                        <li><strong>Partner ID:</strong> {partner_record['partner_id']}</li>
                        <li><strong>Registration Date:</strong> {partner_record['registration_date'].strftime('%d %B %Y')}</li>
                    </ul>
                    
                    <h3>🚀 What's Next?</h3>
                    <ol>
                        <li><strong>Start Uploading:</strong> Log into your account and upload technical documentation, installation guides, and product specifications</li>
                        <li><strong>Quality Content:</strong> Your uploads help construction professionals across AU/NZ - ensure accuracy and relevance</li>
                        <li><strong>Attribution:</strong> Your company will be credited when AI references your content: "Based on {partner_record['company_name']} technical documentation..."</li>
                        <li><strong>Upload Receipts:</strong> You'll receive email confirmations for each document uploaded</li>
                    </ol>
                    
                    <h3>📞 Support:</h3>
                    <p>Questions? Email us at <a href="mailto:support@onesource-ai.com">support@onesource-ai.com</a></p>
                    
                    <p><strong>Welcome to the ONESource-ai community!</strong></p>
                </div>
                
                <div class="footer">
                    <p>ONESource-ai Community Knowledge Bank • Empowering AU/NZ Construction Professionals</p>
                </div>
            </body>
            </html>
            """
            
            message = Mail(
                from_email=os.environ.get('SENDER_EMAIL', 'partners@onesource-ai.com'),
                to_emails=[partner_record['primary_email']],
                subject=subject,
                html_content=html_content
            )
            
            response = self.sendgrid.send(message)
            
            if response.status_code == 202:
                print(f"✅ Welcome email sent to {partner_record['company_name']}")
            else:
                print(f"⚠️ Welcome email failed for {partner_record['company_name']}")
                
        except Exception as e:
            print(f"Error sending welcome email: {e}")
    
    async def send_upload_receipt_email(self, partner_record: Dict[str, Any], document_info: Dict[str, Any]):
        """Send upload receipt email to partner"""
        if not self.sendgrid_configured:
            print(f"Upload receipt skipped - SendGrid not configured for {document_info['filename']}")
            return
        
        try:
            subject = f"Document Upload Receipt - {document_info['filename']}"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .header {{ background: #0f2f57; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 30px; }}
                    .document-info {{ background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                    .footer {{ background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📄 Document Upload Confirmation</h1>
                </div>
                
                <div class="content">
                    <h2>Hello {partner_record['primary_contact_name']},</h2>
                    
                    <p>Your document has been successfully uploaded to the ONESource-ai Community Knowledge Bank!</p>
                    
                    <div class="document-info">
                        <h3>📋 Upload Details:</h3>
                        <ul>
                            <li><strong>Company:</strong> {partner_record['company_name']}</li>
                            <li><strong>Document:</strong> {document_info['filename']}</li>
                            <li><strong>Upload Date:</strong> {document_info['upload_date']}</li>
                            <li><strong>Document ID:</strong> {document_info['document_id']}</li>
                            <li><strong>File Size:</strong> {document_info.get('file_size', 'Unknown')}</li>
                            <li><strong>Tags:</strong> {', '.join(document_info.get('tags', []))}</li>
                        </ul>
                    </div>
                    
                    <h3>✅ What Happens Next?</h3>
                    <ul>
                        <li>Your document is now part of the Community Knowledge Bank</li>
                        <li>Construction professionals can discover and reference your content</li>
                        <li>AI responses will credit {partner_record['company_name']} when using your content</li>
                        <li>This helps build your brand authority in the construction industry</li>
                    </ul>
                    
                    <h3>🗑️ Need to Remove a Document?</h3>
                    <p>If you need to remove this document, please email <a href="mailto:support@onesource-ai.com">support@onesource-ai.com</a> with the Document ID: <strong>{document_info['document_id']}</strong></p>
                    
                    <p>Thank you for contributing to the AU/NZ construction community!</p>
                </div>
                
                <div class="footer">
                    <p>ONESource-ai Community Knowledge Bank • Document Upload Receipt</p>
                </div>
            </body>
            </html>
            """
            
            message = Mail(
                from_email=os.environ.get('SENDER_EMAIL', 'uploads@onesource-ai.com'),
                to_emails=[partner_record['primary_email']],
                subject=subject,
                html_content=html_content
            )
            
            # Also send to backup email
            if partner_record.get('backup_email'):
                message.to = [partner_record['primary_email'], partner_record['backup_email']]
            
            response = self.sendgrid.send(message)
            
            if response.status_code == 202:
                print(f"✅ Upload receipt sent for {document_info['filename']}")
            else:
                print(f"⚠️ Upload receipt failed for {document_info['filename']}")
                
        except Exception as e:
            print(f"Error sending upload receipt: {e}")
    
    async def get_all_partners(self) -> List[Dict[str, Any]]:
        """Get all registered partners (for admin use)"""
        try:
            cursor = self.db.partners.find({}).sort("registration_date", -1)
            partners = await cursor.to_list(length=None)
            
            # Clean up ObjectIds for JSON serialization
            for partner in partners:
                if "_id" in partner:
                    del partner["_id"]
            
            return partners
        except Exception as e:
            print(f"Error getting partners: {e}")
            return []
    
    async def close_connections(self):
        """Close database connections"""
        if self.mongo_client:
            self.mongo_client.close()


# Global partner service instance
partner_service = PartnerService()