import os
import openai
from typing import Dict, Any, List
import uuid
from datetime import datetime

class ConstructionAIService:
    def __init__(self):
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            print("Warning: OPENAI_API_KEY not found. Using mock responses.")
            self.client = None
        else:
            self.client = openai.OpenAI(api_key=api_key)
            
        self.system_prompt = """You are ONESource-ai, a senior technical mentor for the AU/NZ Construction Industry. You support professionals across:

- Architecture
- Engineering (hydraulic, mechanical, structural, civil)
- HVAC, Electrical, Fire
- Waterproofing, Sustainability, Compliance
- Project management, Cost planning, Estimating

CRITICAL: Every response must include TWO distinct layers:

🛠️ TECHNICAL ANSWER:
- Provide clause reference with number, year, and standard (e.g., Clause 4.5.3, AS/NZS 3500.1:2021)
- Use bullet points or tables
- Include assumptions, units, and formulas for calculations
- If clause cannot be accessed: ⚠️ This clause cannot be retrieved. Please consult your licensed standard.

🧐 MENTORING INSIGHT:
- Offer a reminder, tip, or industry consideration
- Use the user's first name when providing mentoring advice to create a personal connection
- Examples:
  - "Sarah, while 3 m/s is permitted, industry practice often limits to 2 m/s for noise control."
  - "John, have you checked your design against worst-case fixture demand?"
  - "Emma, don't forget overflow sizing rules from Section 8."

ADAPTIVE REASONING & PERSONALIZATION:
- Address the user by their first name naturally throughout responses
- Detect and gently correct user misunderstandings
- Clarify vague or misapplied terminology
- Reframe unclear queries with suggestions
- Adapt tone based on profession (architect vs fire certifier)
- Adjust for sectors (commercial, domestic, healthcare, etc.)
- Use their name especially when offering encouragement or warnings

FORMATTING:
- Use bullet points, tables, and italic commentary
- Incorporate the user's name naturally in both technical and mentoring sections
- Always end with: 👀 Was this answer unclear or incorrect? Please provide feedback.

Remember: You deliver clause-backed answers with intuitive insight and mentoring guidance, always using the user's name to create a personal, professional relationship."""

    async def get_construction_response(
        self, 
        question: str, 
        user_profile: Dict[str, Any] = None,
        conversation_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Get AI response for construction industry questions"""
        try:
            if not self.client:
                # Mock response for development - include personalization
                user_name = ""
                if user_profile and user_profile.get('name'):
                    first_name = user_profile.get('name').split()[0]
                    user_name = f"{first_name}, "
                
                mock_response = f"""🛠️ **Technical Answer:**

{user_name}for your question about "{question[:50]}...", here are the key technical considerations:

• This is a development mock response for testing purposes
• In production, this would provide specific clause references (e.g., Clause 4.5.3, AS/NZS 3500.1:2021)
• Technical specifications and calculations would be included here
• Relevant standards and compliance requirements would be listed

🧐 **Mentoring Insight:**

{user_name}as an experienced construction professional, I'd recommend:
• Always cross-reference multiple standards when in doubt
• Consider the specific sector requirements for your project
• Don't forget to check for any recent updates to the building codes
• {user_name.rstrip(', ')}remember that practical experience often guides the best solutions

👀 Was this answer unclear or incorrect? Please provide feedback."""

                return {
                    "response": mock_response,
                    "tokens_used": 150,
                    "model": "mock-gpt-4o",
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            # Build context from user profile
            context = ""
            user_name = ""
            if user_profile:
                # Get user's name for personalization
                name = user_profile.get('name', '')
                if name:
                    # Use first name only for friendlier responses
                    first_name = name.split()[0] if name else ''
                    user_name = first_name
                    context += f"\nUser name: {first_name}"
                
                profession = user_profile.get('profession', '')
                sector = user_profile.get('sector', '')
                if profession:
                    context += f"\nUser profession: {profession}"
                if sector:
                    context += f"\nUser sector: {sector}"
                
                # Add personalization instructions
                context += f"\n\nPERSONALIZATION INSTRUCTIONS:"
                context += f"\n- Address the user by their first name '{first_name}' naturally in responses"
                context += f"\n- Use their name especially when giving mentoring advice or encouragement"
                context += f"\n- Maintain professional but friendly tone appropriate for their profession"
                context += f"\n- Reference their sector context when relevant"
            
            # Build conversation history
            messages = [{"role": "system", "content": self.system_prompt + context}]
            
            if conversation_history:
                for msg in conversation_history[-10:]:  # Last 10 messages for context
                    messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
            
            messages.append({"role": "user", "content": question})
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=1500,
                temperature=0.3
            )
            
            ai_response = response.choices[0].message.content
            
            return {
                "response": ai_response,
                "tokens_used": response.usage.total_tokens,
                "model": "gpt-4o",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting AI response: {e}")
            return {
                "response": "I apologize, but I'm experiencing technical difficulties. Please try again in a moment or contact support if the issue persists.",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def validate_construction_question(self, question: str) -> bool:
        """Check if question is related to AU/NZ construction industry"""
        construction_keywords = [
            # Core construction terms
            'building', 'construction', 'architecture', 'engineering', 'hvac',
            'electrical', 'fire', 'waterproofing', 'compliance', 'ncc', 'bca',
            'australian standard', 'as/nzs', 'building code', 'permit', 'certification',
            'structural', 'mechanical', 'hydraulic', 'civil', 'plumbing', 'drainage',
            
            # Materials and systems
            'insulation', 'acoustic', 'thermal', 'pipe', 'pipes', 'piping',
            'concrete', 'steel', 'timber', 'roof', 'wall', 'floor', 'foundation',
            'ductwork', 'ventilation', 'air conditioning', 'heating', 'cooling',
            
            # Safety and standards
            'safety', 'fire safety', 'fire rating', 'smoke', 'sprinkler',
            'emergency', 'egress', 'access', 'disability access', 'ramp',
            
            # Water systems
            'water', 'stormwater', 'wastewater', 'sewage', 'drainage',
            'rainwater', 'tank', 'pump', 'valve', 'fixture',
            
            # Building elements
            'ceiling', 'height', 'stair', 'stairs', 'handrail', 'balustrade',
            'window', 'door', 'glazing', 'cladding', 'render',
            
            # Professional terms
            'design', 'specification', 'detail', 'drawing', 'plan',
            'approval', 'consent', 'inspection', 'survey', 'assessment',
            
            # Sectors
            'residential', 'commercial', 'industrial', 'healthcare', 'hospital',
            'school', 'office', 'retail', 'warehouse', 'factory'
        ]
        
        question_lower = question.lower()
        
        # Check for construction keywords
        has_construction_keyword = any(keyword in question_lower for keyword in construction_keywords)
        
        # Also allow questions that seem technical/professional even without specific keywords
        technical_indicators = [
            'what is', 'how to', 'how do', 'what are', 'which', 'where',
            'standard', 'code', 'requirement', 'regulation', 'specification',
            'best practice', 'recommended', 'minimum', 'maximum', 'calculate'
        ]
        
        has_technical_indicator = any(indicator in question_lower for indicator in technical_indicators)
        
        # For demo purposes, be more lenient - allow most reasonable questions
        if len(question.strip()) > 10 and (has_construction_keyword or has_technical_indicator):
            return True
        
        # Reject only obviously non-construction questions
        non_construction_terms = [
            'recipe', 'cooking', 'food', 'movie', 'music', 'sports', 'weather',
            'politics', 'celebrity', 'entertainment', 'games', 'shopping'
        ]
        
        has_non_construction = any(term in question_lower for term in non_construction_terms)
        
        return not has_non_construction
    
    def format_dual_response(self, response: str) -> Dict[str, str]:
        """Split AI response into Technical and Mentoring sections"""
        try:
            # Look for the section markers
            if "🛠️" in response and "🧐" in response:
                parts = response.split("🧐")
                technical = parts[0].replace("🛠️", "").strip()
                mentoring = parts[1].strip()
                
                return {
                    "technical": technical,
                    "mentoring": mentoring,
                    "format": "dual"
                }
            else:
                # If not properly formatted, return as single response
                return {
                    "technical": response,
                    "mentoring": "",
                    "format": "single"
                }
        except Exception as e:
            return {
                "technical": response,
                "mentoring": "",
                "format": "single"
            }

# Global instance
construction_ai = ConstructionAIService()