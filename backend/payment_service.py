import os
from typing import Dict, Any, Optional, List
from fastapi import Request
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionRequest, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse
)
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid
from datetime import datetime

# Pricing packages (server-side only for security)
PRICING_PACKAGES = {
    "pro": {
        "amount": 4.90,
        "currency": "aud",
        "name": "Pro Plan",
        "description": "Full access with limited report/project save slots"
    },
    "consultant": {
        "amount": 19.00,
        "currency": "aud", 
        "name": "Consultant Plan",
        "description": "Unlimited queries, report saving & download, priority AI response"
    },
    "day_pass": {
        "amount": 9.90,
        "currency": "aud",
        "name": "Day Pass",
        "description": "One-time access for a single day"
    }
}

class PaymentService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.stripe_api_key = os.environ.get("STRIPE_API_KEY")
        if not self.stripe_api_key:
            raise ValueError("STRIPE_API_KEY environment variable is required")
    
    def _get_stripe_checkout(self, request: Request) -> StripeCheckout:
        """Initialize Stripe checkout with webhook URL"""
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        return StripeCheckout(api_key=self.stripe_api_key, webhook_url=webhook_url)
    
    async def create_checkout_session(
        self,
        package_id: str,
        origin_url: str,
        user_id: Optional[str],
        request: Request
    ) -> Dict[str, Any]:
        """Create Stripe checkout session for subscription"""
        try:
            # Validate package
            if package_id not in PRICING_PACKAGES:
                return {"error": "Invalid package selected", "status": "error"}
            
            package = PRICING_PACKAGES[package_id]
            stripe_checkout = self._get_stripe_checkout(request)
            
            # Build success and cancel URLs
            success_url = f"{origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
            cancel_url = f"{origin_url}/pricing"
            
            # Create metadata
            metadata = {
                "package_id": package_id,
                "user_id": user_id or "anonymous",
                "source": "onesource_ai",
                "payment_type": "subscription"
            }
            
            # Create checkout session
            checkout_request = CheckoutSessionRequest(
                amount=package["amount"],
                currency=package["currency"],
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=metadata
            )
            
            session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
            
            # Store payment transaction record
            transaction_data = {
                "transaction_id": str(uuid.uuid4()),
                "session_id": session.session_id,
                "user_id": user_id,
                "package_id": package_id,
                "amount": package["amount"],
                "currency": package["currency"],
                "payment_status": "pending",
                "status": "initiated",
                "metadata": metadata,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await self.db.payment_transactions.insert_one(transaction_data)
            
            return {
                "checkout_url": session.url,
                "session_id": session.session_id,
                "status": "success"
            }
            
        except Exception as e:
            print(f"Error creating checkout session: {e}")
            return {"error": str(e), "status": "error"}
    
    async def get_checkout_status(self, session_id: str, request: Request) -> Dict[str, Any]:
        """Get checkout session status and update database"""
        try:
            stripe_checkout = self._get_stripe_checkout(request)
            
            # Get status from Stripe
            status_response: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
            
            # Find transaction in database
            transaction = await self.db.payment_transactions.find_one({"session_id": session_id})
            if not transaction:
                return {"error": "Transaction not found", "status": "error"}
            
            # Update transaction status
            update_data = {
                "status": status_response.status,
                "payment_status": status_response.payment_status,
                "updated_at": datetime.utcnow()
            }
            
            # If payment successful and not already processed
            if (status_response.payment_status == "paid" and 
                transaction.get("subscription_activated") != True):
                
                # Activate subscription
                await self._activate_subscription(transaction, status_response)
                update_data["subscription_activated"] = True
            
            # Update transaction
            await self.db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": update_data}
            )
            
            return {
                "status": status_response.status,
                "payment_status": status_response.payment_status,
                "amount_total": status_response.amount_total,
                "currency": status_response.currency,
                "metadata": status_response.metadata
            }
            
        except Exception as e:
            print(f"Error checking payment status: {e}")
            return {"error": str(e), "status": "error"}
    
    async def _activate_subscription(self, transaction: Dict[str, Any], status_response: CheckoutStatusResponse):
        """Activate user subscription after successful payment"""
        try:
            user_id = transaction.get("user_id")
            package_id = transaction.get("package_id")
            
            if not user_id or user_id == "anonymous":
                print("Cannot activate subscription - no user ID")
                return
            
            # Determine subscription details
            subscription_data = {
                "subscription_tier": package_id,
                "subscription_active": True,
                "payment_session_id": transaction["session_id"],
                "subscription_started_at": datetime.utcnow()
            }
            
            if package_id == "day_pass":
                # Day pass - expires in 24 hours
                from datetime import timedelta
                subscription_data["subscription_expires"] = datetime.utcnow() + timedelta(days=1)
                subscription_data["subscription_type"] = "one_time"
            else:
                # Monthly subscriptions
                subscription_data["subscription_type"] = "recurring"
            
            # Update user profile in Firebase (via import to avoid circular dependency)
            from firebase_service import firebase_service
            await firebase_service.update_subscription_status(user_id, subscription_data)
            
        except Exception as e:
            print(f"Error activating subscription: {e}")
    
    async def handle_webhook(self, request_body: bytes, stripe_signature: str, request: Request) -> Dict[str, Any]:
        """Handle Stripe webhook events"""
        try:
            stripe_checkout = self._get_stripe_checkout(request)
            webhook_response = await stripe_checkout.handle_webhook(request_body, stripe_signature)
            
            # Log webhook event
            webhook_data = {
                "event_type": webhook_response.event_type,
                "event_id": webhook_response.event_id,
                "session_id": webhook_response.session_id,
                "payment_status": webhook_response.payment_status,
                "metadata": webhook_response.metadata,
                "processed_at": datetime.utcnow()
            }
            
            await self.db.webhook_events.insert_one(webhook_data)
            
            # Handle specific events
            if webhook_response.event_type == "checkout.session.completed":
                await self._handle_successful_payment(webhook_response)
            
            return {"status": "success", "event_processed": True}
            
        except Exception as e:
            print(f"Error handling webhook: {e}")
            return {"error": str(e), "status": "error"}
    
    async def _handle_successful_payment(self, webhook_response):
        """Handle successful payment webhook"""
        try:
            session_id = webhook_response.session_id
            
            # Find and update transaction
            transaction = await self.db.payment_transactions.find_one({"session_id": session_id})
            if transaction and not transaction.get("webhook_processed"):
                
                # Mark as processed by webhook
                await self.db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {
                        "webhook_processed": True,
                        "webhook_processed_at": datetime.utcnow()
                    }}
                )
                
                # Activate subscription if not already done
                if not transaction.get("subscription_activated"):
                    await self._activate_subscription(transaction, webhook_response)
                    
        except Exception as e:
            print(f"Error processing successful payment webhook: {e}")

    async def get_user_transactions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's payment transaction history"""
        try:
            cursor = self.db.payment_transactions.find(
                {"user_id": user_id},
                sort=[("created_at", -1)]
            )
            transactions = await cursor.to_list(length=50)
            
            # Clean up sensitive data
            for transaction in transactions:
                transaction.pop("_id", None)
            
            return transactions
            
        except Exception as e:
            print(f"Error getting user transactions: {e}")
            return []

# This will be initialized in main server file with database connection