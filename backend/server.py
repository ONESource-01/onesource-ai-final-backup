from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import openai
import io
import base64
import mimetypes
import hashlib
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Import our services
from firebase_service import firebase_service
from ai_service import construction_ai
from payment_service import PaymentService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize payment service
payment_service = PaymentService(db)

# Create the main app without a prefix
app = FastAPI(title="ONESource-ai API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Pydantic Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class UserOnboardingData(BaseModel):
    name: str
    profession: str
    sector: str
    use_case: str
    marketing_consent: bool = False

class ChatQuestion(BaseModel):
    question: str
    session_id: Optional[str] = None

class ChatFeedback(BaseModel):
    message_id: str
    feedback_type: str  # 'positive' or 'negative'
    comment: Optional[str] = None

class KnowledgeContribution(BaseModel):
    message_id: str
    contribution: str
    opt_in_credit: bool = True

class ChatHistoryRequest(BaseModel):
    limit: int = 50

class PaymentRequest(BaseModel):
    package_id: str
    origin_url: str

# Authentication dependency
async def get_current_user(request: Request, credentials = Depends(security)) -> Dict[str, Any]:
    """Verify Firebase token and return user info"""
    try:
        token = credentials.credentials
        user_info = await firebase_service.verify_token(token)
        if not user_info:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        return user_info
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

# Optional authentication dependency
async def get_current_user_optional(request: Request) -> Optional[Dict[str, Any]]:
    """Get user info if authenticated, otherwise None"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.split(" ")[1]
        user_info = await firebase_service.verify_token(token)
        return user_info
    except:
        return None

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "ONESource-ai API is running", "version": "1.0.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# User Management Routes
@api_router.post("/user/onboarding")
async def complete_onboarding(
    data: UserOnboardingData,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Complete user onboarding after authentication"""
    try:
        uid = current_user["uid"]
        
        # Prepare user profile data
        profile_data = {
            "name": data.name,
            "profession": data.profession,
            "sector": data.sector,
            "use_case": data.use_case,
            "marketing_consent": data.marketing_consent,
            "onboarding_completed": True,
            "subscription_tier": "starter",
            "trial_questions_used": 0,
            "subscription_active": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Save to Firebase
        success = await firebase_service.create_user_profile(uid, profile_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save user profile")
        
        return {"message": "Onboarding completed successfully", "profile": profile_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error completing onboarding: {str(e)}")

@api_router.get("/user/profile")
async def get_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user's profile"""
    try:
        uid = current_user["uid"]
        profile = await firebase_service.get_user_profile(uid)
        
        if not profile:
            # New user - return basic info from Firebase auth
            return {
                "uid": uid,
                "email": current_user.get("email"),
                "name": current_user.get("name"),
                "onboarding_completed": False,
                "subscription_tier": "starter",
                "trial_questions_used": 0
            }
        
        return profile
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting profile: {str(e)}")

@api_router.get("/user/subscription")
async def get_subscription_status(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Check user's subscription status and usage"""
    try:
        uid = current_user["uid"]
        subscription = await firebase_service.check_user_subscription(uid)
        return subscription
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking subscription: {str(e)}")

# AI Chat Routes
@api_router.post("/chat/ask")
async def ask_question(
    chat_data: ChatQuestion,
    request: Request,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """Ask a construction industry question"""
    try:
        # Validate question is construction-related
        if not await construction_ai.validate_construction_question(chat_data.question):
            raise HTTPException(
                status_code=400, 
                detail="Questions must be related to AU/NZ construction industry"
            )
        
        # Check trial limits for unauthenticated users
        if not current_user:
            # Anonymous user - check if within trial limit
            session_id = chat_data.session_id or str(uuid.uuid4())
            
            # For anonymous users, we can't really track across sessions
            # So we'll allow the question but encourage sign-up
            user_profile = None
            trial_warning = True
        else:
            # Authenticated user - check subscription status
            uid = current_user["uid"]
            subscription = await firebase_service.check_user_subscription(uid)
            trial_questions_used = subscription["trial_questions_used"]
            
            # Check if user can ask questions
            if (subscription["subscription_tier"] == "starter" and 
                not subscription["subscription_active"]):
                
                # Get today's date for daily limit checking
                today = datetime.utcnow().date()
                
                # Get or create today's usage tracking
                daily_usage_key = f"daily_questions_{today.strftime('%Y%m%d')}"
                daily_questions_used = subscription.get(daily_usage_key, 0)
                
                if daily_questions_used >= 3:
                    raise HTTPException(
                        status_code=402,
                        detail={
                            "message": "Daily question limit reached. You can ask 3 more questions tomorrow, or upgrade to unlimited access.",
                            "trial_info": {
                                "remaining_questions": 0,
                                "subscription_required": True,
                                "reset_time": "tomorrow",
                                "message": "Daily limit reached - 3 questions per day for free users. Upgrade for unlimited access!"
                            }
                        }
                    )
            
            # Get user profile for context
            user_profile = await firebase_service.get_user_profile(uid)
            trial_warning = False
            
            # Increment daily count if still on trial
            if (subscription["subscription_tier"] == "starter" and 
                not subscription["subscription_active"]):
                # Get today's date for daily limit tracking
                today = datetime.utcnow().date()
                daily_usage_key = f"daily_questions_{today.strftime('%Y%m%d')}"
                await firebase_service.update_user_daily_count(uid, daily_usage_key, 1)
        
        # Get AI response
        ai_response = await construction_ai.get_construction_response(
            chat_data.question,
            user_profile,
            []  # TODO: Add conversation history
        )
        
        # Format response
        formatted_response = construction_ai.format_dual_response(ai_response["response"])
        
        # Store conversation in database
        conversation_data = {
            "session_id": chat_data.session_id or str(uuid.uuid4()),
            "user_id": current_user["uid"] if current_user else None,
            "question": chat_data.question,
            "response": ai_response["response"],
            "formatted_response": formatted_response,
            "tokens_used": ai_response.get("tokens_used", 0),
            "model": ai_response.get("model", "gpt-4o"),
            "timestamp": datetime.utcnow()
        }
        
        await db.conversations.insert_one(conversation_data)
        
        response_data = {
            "response": formatted_response,
            "session_id": conversation_data["session_id"],
            "tokens_used": ai_response.get("tokens_used", 0)
        }
        
        # Add trial warning for anonymous users
        if trial_warning:
            response_data["trial_info"] = {
                "message": "Sign up to unlock unlimited questions and advanced features",
                "remaining_questions": "Limited access"
            }
        elif current_user:
            # Add subscription info for authenticated users
            subscription = await firebase_service.check_user_subscription(current_user["uid"])
            if subscription["subscription_tier"] == "starter" and not subscription["subscription_active"]:
                # Get today's date for daily limit checking
                today = datetime.utcnow().date()
                daily_usage_key = f"daily_questions_{today.strftime('%Y%m%d')}"
                daily_questions_used = subscription.get(daily_usage_key, 0)
                remaining = max(0, 3 - daily_questions_used)
                response_data["trial_info"] = {
                    "remaining_questions": remaining,
                    "message": f"You have {remaining} free questions remaining today" if remaining > 0 else "Daily limit reached - 3 questions per day for free users"
                }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

# Feedback Routes
@api_router.post("/chat/feedback")
async def submit_feedback(
    feedback_data: ChatFeedback,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Submit feedback for a chat response"""
    try:
        uid = current_user["uid"]
        
        # Prepare feedback data for storage
        feedback_record = {
            "feedback_id": str(uuid.uuid4()),
            "message_id": feedback_data.message_id,
            "user_id": uid,
            "user_email": current_user.get("email"),
            "feedback_type": feedback_data.feedback_type,
            "comment": feedback_data.comment,
            "timestamp": datetime.utcnow(),
            "status": "submitted"
        }
        
        # Store feedback in MongoDB
        await db.chat_feedback.insert_one(feedback_record)
        
        return {
            "message": "Feedback submitted successfully",
            "feedback_id": feedback_record["feedback_id"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting feedback: {str(e)}")

@api_router.post("/chat/contribution")
async def submit_contribution(
    contribution_data: KnowledgeContribution,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Submit knowledge contribution"""
    try:
        uid = current_user["uid"]
        
        # Prepare contribution data for storage
        contribution_record = {
            "contribution_id": str(uuid.uuid4()),
            "message_id": contribution_data.message_id,
            "user_id": uid,
            "user_email": current_user.get("email"),
            "user_name": current_user.get("name", current_user.get("email", "Unknown")),
            "contribution": contribution_data.contribution,
            "opt_in_credit": contribution_data.opt_in_credit,
            "timestamp": datetime.utcnow(),
            "status": "pending_review",  # pending_review, approved, rejected
            "reviewed_by": None,
            "reviewed_at": None,
            "review_notes": None
        }
        
        # Store contribution in MongoDB
        await db.knowledge_contributions.insert_one(contribution_record)
        
        return {
            "message": "Knowledge contribution submitted successfully! It will be reviewed and may be added to our knowledge base.",
            "contribution_id": contribution_record["contribution_id"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting contribution: {str(e)}")

@api_router.get("/chat/history")
async def get_chat_history(
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user's chat history"""
    try:
        uid = current_user["uid"]
        
        # Get conversations for this user
        cursor = db.conversations.find(
            {"user_id": uid},
            sort=[("timestamp", -1)],
            limit=limit
        )
        conversations = await cursor.to_list(length=limit)
        
        # Group by session_id and create chat history entries
        session_groups = {}
        for conv in conversations:
            session_id = conv.get("session_id", "unknown")
            if session_id not in session_groups:
                session_groups[session_id] = {
                    "session_id": session_id,
                    "title": conv.get("question", "Untitled Chat")[:50] + "..." if len(conv.get("question", "")) > 50 else conv.get("question", "Untitled Chat"),
                    "timestamp": conv.get("timestamp"),
                    "messages": []
                }
            session_groups[session_id]["messages"].append({
                "question": conv.get("question"),
                "response": conv.get("formatted_response"),
                "timestamp": conv.get("timestamp")
            })
        
        # Convert to list and sort by timestamp
        chat_history = list(session_groups.values())
        chat_history.sort(key=lambda x: x.get("timestamp", datetime.min), reverse=True)
        
        return {"chat_history": chat_history}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")

@api_router.get("/chat/session/{session_id}")
async def get_chat_session(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get specific chat session messages"""
    try:
        uid = current_user["uid"]
        
        # Get all messages for this session and user
        cursor = db.conversations.find(
            {"session_id": session_id, "user_id": uid},
            sort=[("timestamp", 1)]
        )
        conversations = await cursor.to_list(length=1000)
        
        messages = []
        for conv in conversations:
            # Add user message
            messages.append({
                "id": f"user_{conv['_id']}",
                "type": "user",
                "content": conv.get("question"),
                "timestamp": conv.get("timestamp").isoformat() if conv.get("timestamp") else None
            })
            
            # Add AI response
            messages.append({
                "id": f"ai_{conv['_id']}",
                "type": "ai", 
                "content": conv.get("formatted_response"),
                "timestamp": conv.get("timestamp").isoformat() if conv.get("timestamp") else None,
                "tokensUsed": conv.get("tokens_used")
            })
        
        return {"messages": messages, "session_id": session_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat session: {str(e)}")

# Developer/Admin Routes
@api_router.get("/admin/feedback")
async def get_feedback_for_review(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get feedback for developer review (basic admin function)"""
    try:
        # Basic admin check - in production, you'd want proper admin roles
        # For now, we'll just return the data for any authenticated user
        
        cursor = db.chat_feedback.find(
            {},
            sort=[("timestamp", -1)],
            limit=100
        )
        feedback = await cursor.to_list(length=100)
        
        # Clean up MongoDB ObjectId
        for item in feedback:
            item["_id"] = str(item["_id"])
        
        return {"feedback": feedback}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving feedback: {str(e)}")

@api_router.get("/admin/contributions")
async def get_contributions_for_review(
    status: str = "pending_review",
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get knowledge contributions for developer review"""
    try:
        # Basic admin check - in production, you'd want proper admin roles
        
        query = {"status": status} if status != "all" else {}
        cursor = db.knowledge_contributions.find(
            query,
            sort=[("timestamp", -1)],
            limit=100
        )
        contributions = await cursor.to_list(length=100)
        
        # Clean up MongoDB ObjectId
        for item in contributions:
            item["_id"] = str(item["_id"])
        
        return {"contributions": contributions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving contributions: {str(e)}")

@api_router.put("/admin/contributions/{contribution_id}")
async def review_contribution(
    contribution_id: str,
    status: str,  # approved, rejected
    review_notes: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Review and update contribution status"""
    try:
        uid = current_user["uid"]
        
        update_data = {
            "status": status,
            "reviewed_by": uid,
            "reviewed_at": datetime.utcnow(),
            "review_notes": review_notes
        }
        
        result = await db.knowledge_contributions.update_one(
            {"contribution_id": contribution_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Contribution not found")
        
        return {"message": f"Contribution {status} successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reviewing contribution: {str(e)}")

# Payment Routes
@api_router.post("/payment/checkout")
async def create_checkout_session(
    payment_data: PaymentRequest,
    request: Request,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """Create Stripe checkout session"""
    try:
        user_id = current_user["uid"] if current_user else None
        
        result = await payment_service.create_checkout_session(
            payment_data.package_id,
            payment_data.origin_url,
            user_id,
            request
        )
        
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating checkout: {str(e)}")

@api_router.get("/payment/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    """Get payment status"""
    try:
        result = await payment_service.get_checkout_status(session_id, request)
        
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking payment status: {str(e)}")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        body = await request.body()
        stripe_signature = request.headers.get("stripe-signature")
        
        if not stripe_signature:
            raise HTTPException(status_code=400, detail="Missing Stripe signature")
        
        result = await payment_service.handle_webhook(body, stripe_signature, request)
        
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}")

@api_router.get("/pricing")
async def get_pricing():
    """Get available pricing packages"""
    from payment_service import PRICING_PACKAGES
    return {"packages": PRICING_PACKAGES}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
