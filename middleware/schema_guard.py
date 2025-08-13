"""
Schema Guard Middleware
JSON Schema v2 validation with auto-repair and metrics
"""

import json
import logging
import time
from typing import Dict, Any, Tuple
from jsonschema import validate, ValidationError
from core.schemas import CHAT_V2, METRICS

logger = logging.getLogger(__name__)


class SchemaGuard:
    """JSON Schema validator with auto-repair capabilities"""
    
    def __init__(self):
        self.start_time = time.time()
        self.repair_enabled = True
        
    def ensure_v2_schema(self, resp_json: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
        """
        Validate and optionally repair response to match v2 schema
        
        Returns:
            Tuple[repaired_response, was_repaired]
        """
        METRICS["responses_validated_total"] += 1
        
        try:
            # Try validation first
            validate(resp_json, CHAT_V2)
            logger.debug("Response validated successfully against v2 schema")
            return resp_json, False  # (repaired=False)
            
        except ValidationError as e:
            logger.warning(f"Schema validation failed: {e.message}")
            METRICS["schema_validation_failures"] += 1
            
            if not self.repair_enabled:
                raise e
            
            # Attempt minimal repair
            repaired = self._repair_response(resp_json, e)
            
            # Validate the repaired response
            try:
                validate(repaired, CHAT_V2)
                METRICS["schema_repairs_total"] += 1
                logger.info("Response successfully repaired to v2 schema")
                return repaired, True
                
            except ValidationError as repair_error:
                logger.error(f"Failed to repair response: {repair_error.message}")
                METRICS["repair_types"]["invalid_schema"] += 1
                raise repair_error
    
    def _repair_response(self, resp_json: Dict[str, Any], error: ValidationError) -> Dict[str, Any]:
        """
        Minimal auto-repair for common schema violations
        """
        logger.info(f"Attempting to repair response. Error: {error.message}")
        
        # Start with a clean copy
        repaired = resp_json.copy()
        
        # Detect if this is a legacy format (has "text" field)
        if "text" in repaired and not "title" in repaired:
            logger.info("Detected legacy format, converting to v2")
            return self._convert_legacy_to_v2(repaired)
        
        # Repair missing required fields
        if "title" not in repaired or not repaired.get("title"):
            repaired["title"] = "## 🛠 **Technical Answer**"
            METRICS["repair_types"]["missing_title"] += 1
            logger.info("Repaired missing title")
        
        if "summary" not in repaired or not repaired.get("summary"):
            # Extract first sentence from text/content as summary
            summary = self._extract_summary(repaired)
            repaired["summary"] = summary
            METRICS["repair_types"]["missing_summary"] += 1
            logger.info("Repaired missing summary")
        
        if "blocks" not in repaired or not repaired.get("blocks"):
            # Convert text content to blocks
            blocks = self._create_blocks_from_content(repaired)
            repaired["blocks"] = blocks
            METRICS["repair_types"]["missing_blocks"] += 1
            logger.info("Repaired missing blocks")
        
        if "meta" not in repaired or not isinstance(repaired.get("meta"), dict):
            # Create minimal meta object
            repaired["meta"] = {
                "emoji": repaired.get("meta", {}).get("emoji", "💬"),
                "schema": "v2",
                "mapped": True
            }
            METRICS["repair_types"]["missing_meta"] += 1
            logger.info("Repaired missing meta")
        else:
            # Ensure meta has required fields
            if "schema" not in repaired["meta"]:
                repaired["meta"]["schema"] = "v2"
            if "mapped" not in repaired["meta"]:
                repaired["meta"]["mapped"] = True
            if "emoji" not in repaired["meta"]:
                repaired["meta"]["emoji"] = "💬"
        
        return repaired
    
    def _convert_legacy_to_v2(self, legacy_resp: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert legacy response format to v2 schema
        """
        text_content = legacy_resp.get("text", "")
        
        # Extract title (first heading or create default)
        title = self._extract_title(text_content)
        
        # Extract summary (first paragraph or sentence)
        summary = self._extract_summary(legacy_resp)
        
        # Create blocks from text content
        blocks = [{"type": "markdown", "content": text_content}]
        
        # Build meta from existing meta and emoji_map
        meta = {
            "emoji": legacy_resp.get("meta", {}).get("emoji", "💬"),
            "schema": "v2",
            "mapped": True
        }
        
        # Preserve existing meta fields
        if "meta" in legacy_resp and isinstance(legacy_resp["meta"], dict):
            for key, value in legacy_resp["meta"].items():
                if key not in ["emoji", "schema", "mapped"]:
                    meta[key] = value
        
        return {
            "title": title,
            "summary": summary,
            "blocks": blocks,
            "meta": meta
        }
    
    def _extract_title(self, text: str) -> str:
        """Extract title from text content"""
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('#') or ('**' in line and any(emoji in line for emoji in ['🔧', '🧐', '📋'])):
                return line
        return "## 🛠 **Technical Answer**"
    
    def _extract_summary(self, resp: Dict[str, Any]) -> str:
        """Extract or create summary from response content"""
        if "mentoring_insight" in resp and resp["mentoring_insight"]:
            return resp["mentoring_insight"][:200]
        
        text = resp.get("text", "")
        if text:
            # Find first sentence or paragraph
            sentences = text.replace('\n\n', '. ').split('. ')
            first_sentence = sentences[0] if sentences else ""
            if first_sentence:
                return first_sentence[:200] + ("..." if len(first_sentence) > 200 else "")
        
        return "Professional construction guidance provided."
    
    def _create_blocks_from_content(self, resp: Dict[str, Any]) -> list:
        """Create blocks array from response content"""
        text = resp.get("text", "")
        if not text:
            text = resp.get("content", "No content available")
        
        return [{"type": "markdown", "content": text}]
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current schema validation metrics"""
        uptime = time.time() - self.start_time
        
        total_responses = METRICS["responses_validated_total"]
        total_repairs = METRICS["schema_repairs_total"]
        repair_rate = (total_repairs / total_responses * 100) if total_responses > 0 else 0
        
        return {
            "uptime_seconds": uptime,
            "responses_validated_total": total_responses,
            "schema_validation_failures": METRICS["schema_validation_failures"],
            "schema_repairs_total": total_repairs,
            "repair_rate_percent": repair_rate,
            "repair_types": METRICS["repair_types"].copy(),
            "is_repair_rate_acceptable": repair_rate < 0.5  # Alert threshold
        }
    
    def reset_metrics(self):
        """Reset metrics (for testing)"""
        global METRICS
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
        self.start_time = time.time()


# Global schema guard instance
schema_guard = SchemaGuard()


def validate_chat_response(response_data: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
    """
    Public interface for chat response validation
    
    Returns:
        Tuple[validated_response, was_repaired]
    """
    return schema_guard.ensure_v2_schema(response_data)


def get_schema_metrics() -> Dict[str, Any]:
    """Get current schema validation metrics"""
    return schema_guard.get_metrics()