"""
JSON Schema Definitions for Chat Response Validation
Schema v2 enforcement with guardrails and auto-repair
"""

CHAT_V2 = {
    "type": "object",
    "required": ["title", "summary", "blocks", "meta"],
    "properties": {
        "title": {
            "type": "string", 
            "minLength": 1,
            "description": "Response title with emoji and formatting"
        },
        "summary": {
            "type": "string", 
            "minLength": 1,
            "description": "Brief summary of the response"
        },
        "blocks": {
            "type": "array", 
            "minItems": 1,
            "items": {
                "type": "object",
                "required": ["type", "content"],
                "properties": {
                    "type": {
                        "type": "string",
                        "enum": ["markdown", "code", "list", "table"],
                        "description": "Block content type"
                    },
                    "content": {
                        "type": "string",
                        "minLength": 1,
                        "description": "Block content as string"
                    }
                }
            }
        },
        "meta": {
            "type": "object",
            "required": ["emoji", "schema", "mapped"],
            "properties": {
                "emoji": {
                    "type": "string",
                    "description": "Primary emoji for the response"
                },
                "schema": {
                    "type": "string",
                    "enum": ["v2"],
                    "description": "Schema version identifier"
                },
                "mapped": {
                    "type": "boolean",
                    "description": "Whether enhanced emoji mapping was applied"
                }
            },
            "additionalProperties": True  # Allow tier, session_id, tokens_used etc.
        }
    },
    "additionalProperties": False
}


# Legacy response format (what we might receive from old systems)
CHAT_LEGACY = {
    "type": "object",
    "properties": {
        "text": {"type": "string"},
        "emoji_map": {"type": "array"},
        "mentoring_insight": {"type": ["string", "null"]},
        "meta": {"type": "object"}
    }
}


# Schema validation metrics counters
METRICS = {
    "schema_validation_failures": 0,
    "schema_repairs_total": 0,
    "responses_validated_total": 0,
    "repair_types": {
        "missing_title": 0,
        "missing_summary": 0,
        "missing_blocks": 0,
        "missing_meta": 0,
        "invalid_schema": 0
    }
}