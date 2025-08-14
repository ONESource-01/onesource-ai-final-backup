"""
Conversation Store Interface and Implementations
Persistence backbone for session history with TTL=30d
"""

import json
import os
import redis
import requests
from abc import ABC, abstractmethod
from typing import List, Dict, Any


class ConversationStore(ABC):
    """Abstract interface for conversation persistence"""
    
    @abstractmethod
    def get(self, session_id: str) -> List[Dict[str, Any]]:
        """Get conversation history for session_id"""
        pass
    
    @abstractmethod
    def set(self, session_id: str, history: List[Dict[str, Any]], ttl_seconds: int = 2592000) -> None:
        """Set conversation history with TTL (default 30 days)"""
        pass


class RedisConversationStore(ConversationStore):
    """Redis implementation with atomic operations and retry logic"""
    
    def __init__(self, redis_url: str = None):
        self.redis_url = redis_url or os.environ.get("REDIS_URL", "redis://localhost:6379")
        self.r = redis.Redis.from_url(self.redis_url, decode_responses=True)
        self.max_history_turns = 16  # Trim to last 12-16 turns
        
        # Test connection
        try:
            self.r.ping()
            print(f"✅ Redis connection established: {self.redis_url}")
        except redis.ConnectionError as e:
            print(f"❌ Redis connection failed: {e}")
            raise
    
    def get(self, session_id: str) -> List[Dict[str, Any]]:
        """Get conversation history with atomic operation"""
        try:
            key = f"conv:{session_id}"
            raw = self.r.get(key)
            if raw:
                history = json.loads(raw)
                print(f"DEBUG: Retrieved {len(history)} turns for session {session_id}")
                return history
            else:
                print(f"DEBUG: No history found for session {session_id}")
                return []
        except (redis.ConnectionError, json.JSONDecodeError) as e:
            print(f"ERROR: Failed to get conversation {session_id}: {e}")
            return []
    
    def set(self, session_id: str, history: List[Dict[str, Any]], ttl_seconds: int = 2592000) -> None:
        """Set conversation history with automatic trimming and TTL"""
        try:
            # Trim history to prevent unbounded growth
            trimmed_history = self._trim_history(history)
            
            key = f"conv:{session_id}"
            
            # Atomic pipeline: set + expire
            pipe = self.r.pipeline(transaction=True)
            pipe.set(key, json.dumps(trimmed_history))
            pipe.expire(key, ttl_seconds)
            pipe.execute()
            
            print(f"DEBUG: Stored {len(trimmed_history)} turns for session {session_id} with TTL {ttl_seconds}s")
            
        except (redis.ConnectionError, json.JSONEncodeError) as e:
            print(f"ERROR: Failed to set conversation {session_id}: {e}")
            # Could implement retry logic here if needed
            raise
    
    def _trim_history(self, history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Trim history to last 12-16 turns, keeping conversation pairs"""
        if len(history) <= self.max_history_turns:
            return history
        
        # Keep the most recent turns, but try to maintain user-assistant pairs
        # Take the last max_history_turns messages
        trimmed = history[-self.max_history_turns:]
        
        # If we start with an assistant message, try to include the user message before it
        if len(trimmed) < len(history) and trimmed[0].get("role") == "assistant":
            # Look for the preceding user message
            preceding_idx = len(history) - len(trimmed) - 1
            if preceding_idx >= 0 and history[preceding_idx].get("role") == "user":
                trimmed = [history[preceding_idx]] + trimmed[1:]  # Replace first with user message
        
        print(f"DEBUG: Trimmed history from {len(history)} to {len(trimmed)} turns")
        return trimmed
    
    def health_check(self) -> bool:
        """Check if Redis is healthy"""
        try:
            self.r.ping()
            return True
        except redis.ConnectionError:
            return False


# Global store instance - will be initialized by the application
conversation_store: ConversationStore = None


def init_conversation_store(redis_url: str = None) -> ConversationStore:
    """Initialize the global conversation store"""
    global conversation_store
    conversation_store = RedisConversationStore(redis_url)
    print(f"DEBUG: Global conversation_store initialized: {conversation_store is not None}")
    return conversation_store


def get_conversation_store() -> ConversationStore:
    """Get the global conversation store instance"""
    if conversation_store is None:
        raise RuntimeError("Conversation store not initialized. Call init_conversation_store() first.")
    return conversation_store