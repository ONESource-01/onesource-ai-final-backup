"""
Shared test utilities for comprehensive testing suite
Provides common helpers for multi-turn, performance, and schema testing
"""

import uuid
import requests
from typing import Dict, Any, Optional, List


def sid(prefix: str = "sid") -> str:
    """Generate unique session ID for testing"""
    return f"{prefix}-{str(uuid.uuid4())[:8]}"


def post(base_url: str, path: str, q: str, sid: str, topics: Optional[Dict[str, str]] = None, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Make POST request to chat endpoint
    
    Args:
        base_url: Base URL for API (e.g., "http://localhost:8001")
        path: Endpoint path (e.g., "/api/chat/ask")  
        q: Question/message
        sid: Session ID
        topics: Optional topics dict
        headers: Optional request headers
    
    Returns:
        JSON response as dict
    """
    payload = {"question": q, "session_id": sid}
    if topics:
        payload["topics"] = topics
    
    # Default headers for authentication
    if not headers:
        headers = {"Authorization": "Bearer mock_dev_token"}
    
    url = f"{base_url}{path}"
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()


def assert_v2(r: Dict[str, Any]) -> None:
    """
    Assert response follows v2 schema format
    
    Args:
        r: Response JSON dict
    
    Raises:
        AssertionError: If response doesn't match v2 schema
    """
    # Check required top-level fields
    required_fields = ("title", "summary", "blocks", "meta")
    for field in required_fields:
        assert field in r, f"Missing required field: {field}"
    
    # Check meta fields
    assert r["meta"]["schema"] == "v2", f"Expected schema v2, got: {r['meta'].get('schema')}"
    assert r["meta"].get("emoji"), "Missing emoji in meta"
    
    # Check blocks structure
    assert isinstance(r["blocks"], list), "Blocks must be a list"
    assert len(r["blocks"]) >= 1, "Must have at least one block"
    
    for i, block in enumerate(r["blocks"]):
        assert "type" in block, f"Block {i} missing type"
        assert "content" in block, f"Block {i} missing content"
        assert isinstance(block["content"], str), f"Block {i} content must be string"


def extract_content(r: Dict[str, Any]) -> str:
    """
    Extract text content from v2 response for analysis
    
    Args:
        r: Response JSON dict
    
    Returns:
        Combined content from all blocks
    """
    if "blocks" in r and r["blocks"]:
        return " ".join([block.get("content", "") for block in r["blocks"]])
    return r.get("text", "")


def get_base_url() -> str:
    """Get backend URL from environment or default"""
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception:
        pass
    return "http://localhost:8001"


def get_metrics(base_url: str = None) -> Dict[str, Any]:
    """Get schema validation metrics"""
    if not base_url:
        base_url = get_base_url()
    
    response = requests.get(f"{base_url}/api/metrics/schema")
    response.raise_for_status()
    return response.json()["schema_validation"]


def wait_for_processing(seconds: float = 0.5) -> None:
    """Wait between requests to allow for processing"""
    import time
    time.sleep(seconds)


class TestClient:
    """Simple test client wrapper for consistent API calls"""
    
    def __init__(self, base_url: str = None):
        self.base_url = base_url or get_base_url()
        self.headers = {"Authorization": "Bearer mock_dev_token"}
    
    def post(self, path: str, q: str, sid: str, topics: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Post to endpoint and return response"""
        return post(self.base_url, path, q, sid, topics, self.headers)
    
    def ask_regular(self, q: str, sid: str, topics: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Ask regular chat endpoint"""
        return self.post("/api/chat/ask", q, sid, topics)
    
    def ask_enhanced(self, q: str, sid: str, topics: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Ask enhanced chat endpoint"""  
        return self.post("/api/chat/ask-enhanced", q, sid, topics)