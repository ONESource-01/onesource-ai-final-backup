"""
Follow-On Suggestions System
Generates context-aware "Would you like to..." suggestions for chat responses
"""

import re
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class SuggestionsEngine:
    """Generates context-aware follow-on suggestions based on response content"""
    
    def __init__(self):
        # Topic detection patterns
        self.topic_patterns = {
            "fire": [
                r"fire[- ]?rated?", r"smoke", r"sprinkler", r"fire\s+safety", 
                r"fire\s+door", r"fire\s+compartment", r"fire\s+engineer",
                r"AS\s*2118", r"fire\s+system", r"detection"
            ],
            "acoustic": [
                r"acoustic", r"sound", r"noise", r"insulation", r"vibration",
                r"decibel", r"dB", r"sound\s+transmission", r"impact\s+sound"
            ],
            "plumbing": [
                r"plumbing", r"water", r"drainage", r"sewer", r"gutter", 
                r"backflow", r"AS\s*3500", r"wet\s+area", r"waterproof",
                r"pipe", r"tap", r"fixture"
            ],
            "structural": [
                r"structural", r"load", r"beam", r"column", r"concrete",
                r"steel", r"foundation", r"wind\s+load", r"seismic",
                r"AS\s*1170", r"moment", r"shear"
            ],
            "electrical": [
                r"electrical", r"wiring", r"switchboard", r"circuit",
                r"AS/NZS\s*3000", r"power", r"lighting", r"earthing",
                r"residual\s+current", r"RCD"
            ],
            "access": [
                r"access", r"disability", r"ramp", r"lift", r"elevator",
                r"handrail", r"door\s+width", r"accessible", r"DDA"
            ],
            "ventilation": [
                r"ventilation", r"air\s+conditioning", r"HVAC", r"exhaust",
                r"AS\s*1668", r"air\s+flow", r"natural\s+ventilation"
            ],
            "energy": [
                r"energy", r"insulation", r"thermal", r"R-value",
                r"energy\s+efficiency", r"glazing", r"solar", r"heating"
            ],
            "compliance": [
                r"NCC", r"building\s+code", r"approval", r"permit",
                r"certify", r"compliance", r"building\s+surveyor"
            ]
        }
        
        # Standard/clause detection patterns
        self.standard_patterns = [
            r"AS\s*\d+(?:\.\d+)*",
            r"AS/NZS\s*\d+(?:\.\d+)*", 
            r"NCC\s+[A-Z]\d+(?:\.\d+)*",
            r"BCA\s+[A-Z]\d+(?:\.\d+)*",
            r"Volume\s+[12]",
            r"Class\s+[1-9][a-z]?"
        ]
        
        # Suggestion templates by topic
        self.suggestion_templates = {
            "fire": [
                {"label": "See the exact NCC fire clause", "payload": "Show me the specific NCC clause for fire safety requirements mentioned"},
                {"label": "Get fire safety checklist", "payload": "Generate a step-by-step fire safety compliance checklist"},
                {"label": "View fire rating examples", "payload": "Give me examples of fire rating calculations and applications"}
            ],
            "acoustic": [
                {"label": "See acoustic standards", "payload": "Show me the relevant acoustic standards and requirements"},
                {"label": "Get sound testing checklist", "payload": "Generate a checklist for acoustic compliance testing"},
                {"label": "View acoustic calculations", "payload": "Give me sample acoustic calculations and formulas"}
            ],
            "plumbing": [
                {"label": "See AS 3500 requirements", "payload": "Show me the specific AS 3500 requirements mentioned"},
                {"label": "Get plumbing checklist", "payload": "Generate a plumbing compliance checklist"},
                {"label": "View sizing calculations", "payload": "Give me sample plumbing sizing calculations"}
            ],
            "structural": [
                {"label": "See structural standards", "payload": "Show me the relevant structural design standards"},
                {"label": "Get load calculation guide", "payload": "Generate a structural load calculation checklist"},
                {"label": "View design examples", "payload": "Give me structural design calculation examples"}
            ],
            "electrical": [
                {"label": "See AS/NZS 3000 clause", "payload": "Show me the specific AS/NZS 3000 requirements"},
                {"label": "Get electrical checklist", "payload": "Generate an electrical compliance checklist"},
                {"label": "View wiring examples", "payload": "Give me electrical installation examples"}
            ],
            "access": [
                {"label": "See access standards", "payload": "Show me the disability access requirements"},
                {"label": "Get accessibility checklist", "payload": "Generate an accessibility compliance checklist"},
                {"label": "View design examples", "payload": "Give me accessible design examples"}
            ],
            "ventilation": [
                {"label": "See AS 1668 requirements", "payload": "Show me the AS 1668 ventilation standards"},
                {"label": "Get ventilation checklist", "payload": "Generate a ventilation system checklist"},
                {"label": "View airflow calculations", "payload": "Give me ventilation airflow calculations"}
            ],
            "energy": [
                {"label": "See energy efficiency rules", "payload": "Show me the NCC energy efficiency requirements"},
                {"label": "Get energy checklist", "payload": "Generate an energy efficiency compliance checklist"},
                {"label": "View thermal calculations", "payload": "Give me thermal performance calculations"}
            ],
            "compliance": [
                {"label": "See approval process", "payload": "Show me the building approval process requirements"},
                {"label": "Get compliance checklist", "payload": "Generate a building compliance checklist"},
                {"label": "View documentation needs", "payload": "Show me what documentation is required for approval"}
            ]
        }
        
        # Generic suggestions based on content types
        self.generic_suggestions = [
            {"label": "Get a step-by-step checklist", "payload": "Convert this information into a step-by-step compliance checklist"},
            {"label": "Show related standards", "payload": "What other Australian Standards relate to this topic?"},
            {"label": "Explain with examples", "payload": "Give me practical examples of how to apply this requirement"}
        ]
    
    def detect_topic(self, text: str) -> Optional[str]:
        """Detect the primary topic from text content"""
        if not text:
            return None
            
        text_lower = text.lower()
        topic_scores = {}
        
        for topic, patterns in self.topic_patterns.items():
            score = 0
            for pattern in patterns:
                matches = len(re.findall(pattern, text_lower, re.IGNORECASE))
                score += matches
            
            if score > 0:
                topic_scores[topic] = score
        
        # Return topic with highest score
        if topic_scores:
            return max(topic_scores.items(), key=lambda x: x[1])[0]
        
        return None
    
    def detect_standards(self, text: str) -> List[str]:
        """Extract mentioned standards/clauses from text"""
        if not text:
            return []
            
        standards = []
        for pattern in self.standard_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            standards.extend(matches)
        
        return list(set(standards))  # Remove duplicates
    
    def suggest_actions(self, topic: Optional[str], blocks: List[Dict[str, Any]], full_text: str = "") -> List[Dict[str, str]]:
        """
        Generate follow-on suggestions based on detected topic and content blocks
        
        Args:
            topic: Detected primary topic
            blocks: List of response blocks
            full_text: Full response text for additional analysis
            
        Returns:
            List of suggestion dictionaries with 'label' and 'payload'
        """
        suggestions = []
        
        # Topic-specific suggestions
        if topic and topic in self.suggestion_templates:
            topic_suggestions = self.suggestion_templates[topic]
            # Take up to 2 topic-specific suggestions
            suggestions.extend(topic_suggestions[:2])
        
        # Content-type specific suggestions
        has_table = any(block.get("type") == "table" for block in blocks)
        has_list = any(block.get("type") == "list" for block in blocks)
        has_code = any(block.get("type") == "code" for block in blocks)
        
        # Add table-specific suggestion
        if has_table and len(suggestions) < 3:
            suggestions.append({
                "label": "Export data as CSV", 
                "payload": "table_export_csv"  # Special payload for UI handling
            })
        
        # Add list-specific suggestion  
        if has_list and len(suggestions) < 3:
            suggestions.append({
                "label": "Save as checklist", 
                "payload": "Convert this into a downloadable checklist format"
            })
        
        # Add code/calculation specific suggestion
        if has_code and len(suggestions) < 3:
            suggestions.append({
                "label": "Explain the calculation", 
                "payload": "Break down this calculation step by step with explanations"
            })
        
        # Fill with generic suggestions if we have fewer than 2
        while len(suggestions) < 2:
            remaining_generic = [s for s in self.generic_suggestions if s not in suggestions]
            if not remaining_generic:
                break
            suggestions.append(remaining_generic[0])
        
        # Standards-specific suggestion if standards detected
        standards = self.detect_standards(full_text)
        if standards and len(suggestions) < 3:
            standards_list = ", ".join(standards[:3])  # Limit to first 3
            suggestions.append({
                "label": f"View {standards_list} details",
                "payload": f"Show me detailed information about {standards_list}"
            })
        
        # Limit to maximum of 3 suggestions and ensure labels are <= 40 chars
        suggestions = suggestions[:3]
        for suggestion in suggestions:
            if len(suggestion["label"]) > 40:
                suggestion["label"] = suggestion["label"][:37] + "..."
        
        return suggestions

# Global instance
_suggestions_engine = None

def get_suggestions_engine() -> SuggestionsEngine:
    """Get global suggestions engine instance"""
    global _suggestions_engine
    if _suggestions_engine is None:
        _suggestions_engine = SuggestionsEngine()
    return _suggestions_engine

def detect_topic(text: str) -> Optional[str]:
    """Convenience function to detect topic"""
    return get_suggestions_engine().detect_topic(text)

def suggest_actions(topic: Optional[str], blocks: List[Dict[str, Any]], full_text: str = "") -> List[Dict[str, str]]:
    """Convenience function to generate suggestions"""
    return get_suggestions_engine().suggest_actions(topic, blocks, full_text)