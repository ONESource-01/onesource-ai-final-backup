"""
Dynamic Example Questions System
Manages rotating construction-specific example questions for chat landing page
"""

import json
import random
import hashlib
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pathlib import Path
import redis
import logging

logger = logging.getLogger(__name__)

class ExamplesManager:
    """Manages dynamic example questions with user-specific rotation and topic biasing"""
    
    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.redis_client = redis_client or redis.Redis.from_url("redis://localhost:6379", decode_responses=True)
        self.examples_file = Path(__file__).parent / "prompts" / "examples_construction.json"
        self._cache = None
        self._cache_timestamp = None
        
    def _load_examples(self) -> Dict[str, Any]:
        """Load examples from JSON file with caching"""
        try:
            # Simple file-based caching (5 minute TTL)
            if (self._cache is None or 
                self._cache_timestamp is None or 
                datetime.now() - self._cache_timestamp > timedelta(minutes=5)):
                
                with open(self.examples_file, 'r') as f:
                    self._cache = json.load(f)
                    self._cache_timestamp = datetime.now()
                    
            return self._cache
        except Exception as e:
            logger.error(f"Failed to load examples file: {e}")
            # Fallback examples
            return {
                "v": 1,
                "pool": [
                    "When is a fire-rated door required in a Class 2 building?",
                    "How do I size roof gutters to AS 3500.3?",
                    "What's the NCC requirement for stair handrail height?",
                    "When is backflow prevention mandatory (AS/NZS 3500.1)?",
                    "How do I determine wind classification (N1–N6/C1–C4)?"
                ],
                "topics": {
                    "fire": [0],
                    "plumbing": [1, 3],
                    "structural": [2, 4]
                }
            }
    
    def _get_user_cache_key(self, user_id: str) -> str:
        """Generate Redis cache key for user's seen examples"""
        return f"examples:user:{user_id}"
    
    def _get_user_seen_examples(self, user_id: str) -> List[str]:
        """Get list of examples this user has seen in the last 14 days"""
        try:
            cache_key = self._get_user_cache_key(user_id)
            seen = self.redis_client.smembers(cache_key)
            return list(seen) if seen else []
        except Exception as e:
            logger.warning(f"Failed to get user seen examples: {e}")
            return []
    
    def _mark_examples_seen(self, user_id: str, examples: List[str]):
        """Mark examples as seen by user with 14-day TTL"""
        try:
            cache_key = self._get_user_cache_key(user_id)
            if examples:
                self.redis_client.sadd(cache_key, *examples)
                self.redis_client.expire(cache_key, 14 * 24 * 60 * 60)  # 14 days
        except Exception as e:
            logger.warning(f"Failed to mark examples as seen: {e}")
    
    def _filter_by_topics(self, examples_data: Dict[str, Any], topics: List[str]) -> List[int]:
        """Get example indices that match the given topics"""
        if not topics:
            return list(range(len(examples_data["pool"])))
        
        topic_indices = set()
        topic_map = examples_data.get("topics", {})
        
        for topic in topics:
            if topic in topic_map:
                topic_indices.update(topic_map[topic])
        
        return list(topic_indices) if topic_indices else list(range(len(examples_data["pool"])))
    
    def get_examples(self, user_id: Optional[str] = None, n: int = 5, topics: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get n unique examples for user, biased by topics if provided
        
        Args:
            user_id: User identifier for tracking seen examples
            n: Number of examples to return (default 5, max 10)
            topics: List of topics to bias selection towards
            
        Returns:
            Dict with examples, expires_at, and seed
        """
        # Load examples data
        examples_data = self._load_examples()
        pool = examples_data["pool"]
        
        # Limit n to reasonable bounds
        n = min(max(1, n), 10)
        n = min(n, len(pool))
        
        # Get user's seen examples if user_id provided
        seen_examples = []
        if user_id:
            seen_examples = self._get_user_seen_examples(user_id)
        
        # Filter by topics if provided
        topic_indices = self._filter_by_topics(examples_data, topics or [])
        
        # Create candidate pool (topic-filtered examples not yet seen)
        unseen_topic_examples = []
        seen_topic_examples = []
        
        for idx in topic_indices:
            example = pool[idx]
            if example not in seen_examples:
                unseen_topic_examples.append(example)
            else:
                seen_topic_examples.append(example)
        
        # Fill remaining slots with other unseen examples
        all_unseen = [ex for ex in pool if ex not in seen_examples]
        unseen_other = [ex for ex in all_unseen if ex not in unseen_topic_examples]
        
        # Selection strategy:
        # 1. First priority: unseen topic-relevant examples
        # 2. Second priority: other unseen examples  
        # 3. Last resort: seen topic-relevant examples (if pool exhausted)
        selected = []
        
        # Add unseen topic examples first
        if unseen_topic_examples:
            take = min(n, len(unseen_topic_examples))
            selected.extend(random.sample(unseen_topic_examples, take))
        
        # Fill remaining with other unseen examples
        remaining = n - len(selected)
        if remaining > 0 and unseen_other:
            take = min(remaining, len(unseen_other))
            selected.extend(random.sample(unseen_other, take))
        
        # Last resort: use seen topic examples if we still need more
        remaining = n - len(selected)
        if remaining > 0 and seen_topic_examples:
            take = min(remaining, len(seen_topic_examples))
            selected.extend(random.sample(seen_topic_examples, take))
        
        # Final fallback: random selection from entire pool
        if len(selected) < n:
            remaining = n - len(selected)
            available = [ex for ex in pool if ex not in selected]
            if available:
                take = min(remaining, len(available))
                selected.extend(random.sample(available, take))
        
        # Mark selected examples as seen for this user
        if user_id and selected:
            self._mark_examples_seen(user_id, selected)
        
        # Generate response
        expires_at = datetime.now() + timedelta(hours=24)
        seed = hashlib.md5(f"{user_id}_{datetime.now().date()}".encode()).hexdigest()[:8]
        
        return {
            "examples": selected,
            "expires_at": expires_at.isoformat(),
            "seed": seed,
            "topics": topics or [],
            "total_pool_size": len(pool)
        }

# Global instance
_examples_manager = None

def get_examples_manager() -> ExamplesManager:
    """Get global examples manager instance"""
    global _examples_manager
    if _examples_manager is None:
        _examples_manager = ExamplesManager()
    return _examples_manager