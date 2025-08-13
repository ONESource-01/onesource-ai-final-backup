"""
Context Manager - FIXES THE CONVERSATION CONTEXT BUG
Pre-save stub + fetch + build context for natural conversation flow
"""

import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional, Any
from pymongo import ASCENDING, DESCENDING
import uuid

class ConversationContextManager:
    """
    CRITICAL: Fixes conversation context by pre-saving conversation stubs
    Enables natural follow-up questions like 'when do I need to install it?'
    """
    
    def __init__(self, db):
        self.db = db
        self.collection = db.conversations
    
    async def pre_save_conversation_stub(self, session_id: str, user_id: Optional[str], question: str) -> str:
        """
        CRITICAL FIX: Pre-save conversation stub BEFORE AI call
        This ensures follow-up questions can access conversation history
        Returns: conversation_id for updating later
        """
        conversation_id = str(uuid.uuid4())
        
        stub = {
            "conversation_id": conversation_id,
            "session_id": session_id,
            "user_id": user_id,
            "question": question,
            "response": "generating...",  # Will be updated after AI call
            "status": "processing",
            "timestamp": datetime.now(timezone.utc),
            "tokens_used": 0
        }
        
        try:
            await self.collection.insert_one(stub)
            print(f"DEBUG: Pre-saved conversation stub - session_id: {session_id}, question: '{question[:50]}...'")
            return conversation_id
        except Exception as e:
            print(f"Error pre-saving conversation stub: {e}")
            return conversation_id
    
    async def update_conversation_response(self, conversation_id: str, response: str, tokens_used: int):
        """Update conversation stub with actual AI response"""
        try:
            await self.collection.update_one(
                {"conversation_id": conversation_id},
                {
                    "$set": {
                        "response": response,
                        "status": "completed",
                        "tokens_used": tokens_used,
                        "completed_at": datetime.now(timezone.utc)
                    }
                }
            )
        except Exception as e:
            print(f"Error updating conversation response: {e}")
    
    async def get_conversation_context(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent conversation history for context building
        Returns conversations in chronological order (oldest first)
        """
        try:
            conversations = await self.collection.find({
                "session_id": session_id,
                "status": "completed"  # Only completed conversations
            }).sort("timestamp", ASCENDING).limit(limit).to_list(length=limit)
            
            return conversations
        except Exception as e:
            print(f"Error fetching conversation context: {e}")
            return []
    
    def build_context_for_ai(self, conversations: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        Build AI conversation context from conversation history
        Returns list of messages in format for AI API
        """
        messages = []
        
        # Take last 4 conversations (2 Q&A pairs) for context
        recent_conversations = conversations[-4:] if len(conversations) >= 4 else conversations
        
        for conv in recent_conversations:
            # Add user message
            messages.append({
                "role": "user",
                "content": conv.get("question", "")
            })
            
            # Add assistant message (truncate for context efficiency)
            response = conv.get("response", "")
            if isinstance(response, dict):
                # Handle old dual format responses
                response = response.get("technical", "") or str(response)
            
            # Truncate response to first 300 chars for context efficiency
            truncated_response = response[:300] + "..." if len(response) > 300 else response
            messages.append({
                "role": "assistant", 
                "content": truncated_response
            })
        
        return messages
    
    def extract_context_topics(self, conversations: List[Dict[str, Any]]) -> Dict[str, str]:
        """
        Extract main topics from conversation history for pronoun resolution
        Returns dict mapping context indicators to topics
        """
        topics = {}
        
        for conv in conversations:
            question = conv.get("question", "").lower()
            response = conv.get("response", "")
            
            if isinstance(response, dict):
                response = response.get("technical", "") or str(response)
            
            response_text = str(response).lower()
            
            # Extract specific topics for pronoun resolution
            if any(term in question or term in response_text for term in ['acoustic', 'lagging']):
                topics["acoustic_system"] = "acoustic lagging installation"
            
            if any(term in question or term in response_text for term in ['fire', 'safety', 'sprinkler']):
                topics["fire_system"] = "fire safety requirements"
            
            if any(term in question or term in response_text for term in ['structural', 'structure', 'beam', 'column']):
                topics["structural_system"] = "structural requirements"
            
            if any(term in question or term in response_text for term in ['water', 'plumbing', 'hydraulic']):
                topics["water_system"] = "water system installation"
            
            if any(term in question or term in response_text for term in ['electrical', 'wiring', 'power']):
                topics["electrical_system"] = "electrical installation"
        
        return topics
    
    def build_context_hint_for_prompt(self, question: str, topics: Dict[str, str]) -> str:
        """
        Build context hint for system prompt to help with pronoun resolution
        CRITICAL: This helps AI understand 'it', 'this', 'that' references
        """
        if not topics:
            return ""
        
        # Check if question contains contextual pronouns
        contextual_indicators = ['it', 'this', 'that', 'them', 'these', 'those', 'when do', 'where do', 'how do', 'why do']
        has_contextual_reference = any(indicator in question.lower() for indicator in contextual_indicators)
        
        if not has_contextual_reference:
            return ""
        
        # Get most recent topic
        if topics:
            recent_topic = list(topics.values())[-1]
            context_hint = f"""

CONVERSATION CONTEXT - CRITICAL FOR PRONOUN RESOLUTION:
The user previously discussed: {recent_topic}

CURRENT QUESTION CONTEXT:
When the user uses pronouns like 'it', 'this', 'that', they likely refer to: {recent_topic}

RESPONSE INSTRUCTION:
Provide specific guidance about {recent_topic} rather than asking for clarification.
Reference the previous discussion naturally in your response."""

            return context_hint
        
        return ""
    
    async def cleanup_old_conversations(self, days_old: int = 30):
        """Clean up old conversations to maintain database performance"""
        try:
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_old)
            result = await self.collection.delete_many({
                "timestamp": {"$lt": cutoff_date}
            })
            print(f"Cleaned up {result.deleted_count} old conversations")
        except Exception as e:
            print(f"Error cleaning up conversations: {e}")

# Will be initialized with database connection
context_manager = None

def init_context_manager(db):
    """Initialize context manager with database connection"""
    global context_manager
    context_manager = ConversationContextManager(db)
    return context_manager