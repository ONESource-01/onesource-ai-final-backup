"""
Dynamic Prompts API Endpoints
Provides rotating example questions and telemetry collection
"""

import os
from fastapi import APIRouter, Query, HTTPException, Request
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from core.examples import get_examples_manager
from core.observability import get_observability

router = APIRouter()
logger = logging.getLogger(__name__)

# Feature flags
FEATURE_DYNAMIC_PROMPTS = os.getenv("FEATURE_DYNAMIC_PROMPTS", "1") == "1"
FEATURE_SUGGESTED_ACTIONS = os.getenv("FEATURE_SUGGESTED_ACTIONS", "1") == "1"

@router.get("/api/prompts/examples")
async def get_examples(
    request: Request,
    n: int = Query(5, ge=1, le=10, description="Number of examples to return"),
    topics: Optional[str] = Query(None, description="Comma-separated topics for biasing"),
    user_id: Optional[str] = Query(None, description="User ID for personalization")
):
    """
    Get rotating construction-specific example questions
    
    Returns unique examples biased by topics, with user-specific rotation to avoid repeats
    """
    if not FEATURE_DYNAMIC_PROMPTS:
        raise HTTPException(status_code=404, detail="Dynamic prompts feature disabled")
    
    try:
        # Parse topics if provided
        topic_list = None
        if topics:
            topic_list = [t.strip().lower() for t in topics.split(",") if t.strip()]
        
        # Get user ID from query or try to extract from auth
        effective_user_id = user_id
        if not effective_user_id:
            # Try to get from Authorization header or session
            auth_header = request.headers.get("authorization", "")
            if "mock_test_token" in auth_header:
                effective_user_id = "test_user"
            else:
                # Generate a session-based ID
                effective_user_id = f"session_{hash(str(request.client.host)) % 10000}"
        
        # Get examples from manager
        examples_manager = get_examples_manager()
        result = examples_manager.get_examples(
            user_id=effective_user_id,
            n=n,
            topics=topic_list
        )
        
        # Track metrics
        observability = get_observability()
        observability.record_examples_served(len(result["examples"]), topic_list or [])
        
        logger.info(f"Served {len(result['examples'])} examples to user {effective_user_id}, topics: {topic_list}")
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to get examples: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve examples")

@router.post("/api/telemetry/ui")
async def track_ui_event(request: Request, event_data: Dict[str, Any]):
    """
    Track UI events for dynamic prompts system
    
    Events: example_clicked, suggested_action_clicked, dismiss_examples
    """
    try:
        event_type = event_data.get("event_type")
        if not event_type:
            raise HTTPException(status_code=400, detail="event_type is required")
        
        # Validate event types
        valid_events = ["example_clicked", "suggested_action_clicked", "dismiss_examples"]
        if event_type not in valid_events:
            raise HTTPException(status_code=400, detail=f"Invalid event_type. Must be one of: {valid_events}")
        
        # Extract event details
        user_id = event_data.get("user_id", "anonymous")
        session_id = event_data.get("session_id")
        timestamp = event_data.get("timestamp", datetime.now().isoformat())
        metadata = event_data.get("metadata", {})
        
        # Track metrics
        observability = get_observability()
        
        if event_type == "example_clicked":
            example_text = metadata.get("example_text", "")
            topic = metadata.get("topic")
            observability.record_example_click(example_text, topic)
            logger.info(f"Example clicked: {example_text[:50]}... by user {user_id}")
            
        elif event_type == "suggested_action_clicked":
            label = metadata.get("label", "")
            payload = metadata.get("payload", "")
            topic = metadata.get("topic")
            observability.record_suggested_action_click(label, topic)
            logger.info(f"Suggested action clicked: {label} by user {user_id}")
            
        elif event_type == "dismiss_examples":
            reason = metadata.get("reason", "user_action")
            observability.record_examples_dismissed(reason)
            logger.info(f"Examples dismissed: {reason} by user {user_id}")
        
        return {
            "status": "recorded",
            "event_type": event_type,
            "timestamp": timestamp
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to track UI event: {e}")
        raise HTTPException(status_code=500, detail="Failed to record event")

@router.get("/api/prompts/health")
async def prompts_health():
    """Health check for prompts system"""
    try:
        examples_manager = get_examples_manager()
        test_result = examples_manager.get_examples(user_id="health_check", n=1)
        
        return {
            "status": "healthy",
            "features": {
                "dynamic_prompts": FEATURE_DYNAMIC_PROMPTS,
                "suggested_actions": FEATURE_SUGGESTED_ACTIONS
            },
            "pool_size": test_result.get("total_pool_size", 0),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Prompts health check failed: {e}")
        raise HTTPException(status_code=503, detail="Prompts system unhealthy")