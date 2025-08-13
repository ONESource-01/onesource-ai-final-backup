"""
Unified response schema for all tiers and endpoints
No exceptions - every response must use this schema
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import uuid
from datetime import datetime

class EmojiItem(BaseModel):
    name: str = Field(min_length=1)
    char: str = Field(min_length=1)  # must be UTF-8 emoji (not escaped)

class Meta(BaseModel):
    endpoint_version: Literal["unified"] = "unified"
    model: str = "gpt-4o-mini"
    temperature: float = 0.3
    tier: Literal["starter", "pro", "pro_plus"]
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    session_id: str
    tokens_used: Optional[int] = None

class ChatResponse(BaseModel):
    text: str = Field(min_length=1)           # final markdown after formatter
    emoji_map: List[EmojiItem]
    mentoring_insight: Optional[str] = None   # optional parsed snippet
    meta: Meta

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Canonical emoji mapping - NO SUBSTITUTES ALLOWED
CANONICAL_EMOJI_MAP = {
    "Technical Answer": "🔧",
    "Mentoring Insight": "🧐", 
    "Next Steps": "📋",
    "Code Requirements": "📊",
    "Compliance Verification": "✅",
    "Alternative Solutions": "🔄", 
    "Authority Requirements": "🏛️",
    "Documentation Needed": "📄",
    "Workflow Recommendations": "⚙️",
    "Clarifying Questions": "❓"
}

# Color mapping for frontend
SECTION_COLORS = {
    "Technical Answer": "#F28C28",          # Construction Orange
    "Mentoring Insight": "#1A3E5C",        # ONESource Dark Blue
    "Next Steps": "#2E8B57",               # Action Green
    "Code Requirements": "#3B82F6",        # Data Blue
    "Compliance Verification": "#198754",   # Success Green
    "Alternative Solutions": "#7C3AED",     # Option Purple
    "Authority Requirements": "#6B7280",    # Government Gray
    "Documentation Needed": "#2563EB",     # Document Blue
    "Workflow Recommendations": "#FB923C",  # Process Orange
    "Clarifying Questions": "#DC2626"       # Question Red
}