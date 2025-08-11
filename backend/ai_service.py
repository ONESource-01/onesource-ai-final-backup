import os
import openai
from typing import Dict, Any, List
import uuid
from datetime import datetime

class ConstructionAIService:
    def __init__(self):
        api_key = os.environ.get("OPENAI_API_KEY")
        print(f"Debug: OpenAI API Key found: {bool(api_key)}")
        if api_key:
            print(f"Debug: API Key starts with: {api_key[:20]}...")
        
        if not api_key:
            print("Warning: OPENAI_API_KEY not found. Using mock responses.")
            self.client = None
        else:
            try:
                self.client = openai.OpenAI(api_key=api_key)
                print("OpenAI client initialized successfully")
            except Exception as e:
                print(f"Error initializing OpenAI client: {e}")
                self.client = None
            
        self.system_prompt = """You are a Construction AI Assistant for the AU/NZ construction industry with expertise in:

- Building codes (NCC, BCA), Australian/New Zealand Standards
- Fire safety, Structural design, MEP systems
- Waterproofing, Sustainability, Compliance  
- Project management, Cost planning, Estimating

RESPONSE STRUCTURE - Always provide TWO distinct sections:

🛠️ **TECHNICAL ANSWER:**
- Provide specific clause references (e.g., Clause 4.5.3, AS/NZS 3500.1:2021)
- Use bullet points, tables, and clear formatting
- Include calculations with units and assumptions where relevant
- If specific clause unavailable: ⚠️ Refer to your licensed copy of the standard

🧐 **MENTORING INSIGHT:**
- Provide contextual guidance based on user's professional background
- Consider their experience level and company type from their profile
- Avoid suggesting they consult specialists in their own field of expertise
- Focus on practical considerations, project context, and common oversights
- Consider project timeline, NCC version relevance, and industry best practices

INTELLIGENT CONTEXTUAL RESPONSES:
- Adapt advice based on user's professional role and experience
- Only suggest external consultation when outside their expertise area
- Consider user's uploaded documents - if they have their own references, minimize boilerplate
- Make mentoring insights practical and relevant to their specific situation
- Focus on value-added guidance, not obvious recommendations

FORMATTING:
- Use professional, clean formatting
- No generic signatures or closings
- Keep Standards Australia compliance statements minimal and contextual
- End with feedback request only when genuinely seeking input

Remember: Provide expert-level guidance that respects the user's professional expertise while offering genuinely valuable insights."""

    async def get_construction_response(
        self, 
        question: str, 
        user_profile: Dict[str, Any] = None,
        conversation_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Get AI response for construction industry questions with 3-Phase Intelligence Enhancement"""
        try:
            # Import AI Intelligence System
            from server import AIIntelligencePhases
            
            if not self.client:
                # Enhanced mock response with AI Intelligence System
                user_name = ""
                if user_profile and user_profile.get('name'):
                    first_name = user_profile.get('name').split()[0]
                    user_name = f"{first_name}, "
                
                # Phase 2: Detect workflow stage and recommendations
                workflow_info = AIIntelligencePhases.detect_workflow_stage(question)
                
                # Phase 3: Get specialized context
                specialized_context = AIIntelligencePhases.get_specialized_context("general", question)
                
                # Enhanced mock response with contextual intelligence
                mock_response = f"""🛠️ **Technical Answer:**

Fire safety requirements for high-rise buildings in Australia are governed primarily by:

• **NCC Volume One** - Class 2-9 buildings over 25m effective height
• **AS 1851-2012** - Maintenance of fire protection systems
• **AS 3786-2014** - Smoke alarms using scattered light
• **AS 4072.1-2005** - Components for fire detection systems

**Key Requirements:**
• Automatic fire detection systems in all Class 2-9 buildings >25m height
• Emergency warning systems compliant with AS 1670.4
• Fire-isolated stair pressurization per AS 1668.1
• Sprinkler system coverage per AS 2118.1

🧐 **Mentoring Insight:**

Based on your professional background, key considerations for high-rise fire safety:

**Project Timeline Considerations:**
• Ensure you're working with the current NCC version for your project's approval date
• Early coordination with fire engineer and building certifier is critical
• Interface coordination between fire services and structural penetrations

**Common Oversight Areas:**
• Smoke extract system coordination with HVAC zones
• Emergency lift requirements for buildings >75m
• Fire services access and equipment location planning
• Integration of fire safety with facade and cladding systems

**Documentation Requirements:**
• Fire Safety Management Plans must be prepared early in design
• Performance-based solutions require extensive documentation
• Regular design reviews with fire safety consultant recommended"""

                return {
                    "response": mock_response,
                    "tokens_used": 200,
                    "model": "mock-gpt-4o-enhanced",
                    "timestamp": datetime.utcnow().isoformat(),
                    "ai_intelligence_phase": "enhanced_mock",
                    "workflow_stage": workflow_info['current_stage'],
                    "detected_discipline": specialized_context['detected_discipline']
                }
            
            # Phase 1: Enhanced Prompting - Get appropriate prompt template
            enhanced_prompts = AIIntelligencePhases.get_enhanced_prompts()
            
            # Phase 2: Workflow Intelligence - Detect stage and get recommendations  
            workflow_info = AIIntelligencePhases.detect_workflow_stage(question, user_profile)
            
            # Phase 3: Specialized Training - Get discipline-specific knowledge
            specialized_context = AIIntelligencePhases.get_specialized_context("general", question)
            detected_discipline = specialized_context['detected_discipline']
            
            # Select appropriate enhanced prompt based on detected discipline
            if detected_discipline in enhanced_prompts:
                enhanced_system_prompt = enhanced_prompts[detected_discipline]
            else:
                enhanced_system_prompt = enhanced_prompts["building_codes"]  # Default fallback
            
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
            
            # Add AI Intelligence System context
            ai_context = f"""

ENHANCED AI INTELLIGENCE CONTEXT:

**DETECTED PROJECT STAGE**: {workflow_info['current_stage']}
Current stage considerations: {', '.join(workflow_info['critical_considerations'])}

**WORKFLOW RECOMMENDATIONS**:
Next steps: {'; '.join(workflow_info['typical_next_steps'][:3])}
Key consultants: {', '.join(workflow_info['key_consultants'])}

**SPECIALIZED DISCIPLINE**: {detected_discipline.replace('_', ' ').title()}
Relevant standards: {', '.join(specialized_context['specialized_knowledge'].get('key_standards', [])[:3])}

**CRITICAL COMPLIANCE REMINDER**: 
- Reference Australian Standards by number and title ONLY
- Never reproduce copyrighted Standards Australia content
- Always emphasize need for professional engineering certification where required
- Include disclaimer about Standards Australia copyright compliance

**RESPONSE STRUCTURE REQUIRED**:
1. Technical Answer with specific standard references (by number only)
2. Mentoring Insight with workflow recommendations
3. Standards Australia compliance statement
4. Professional consultation recommendations where applicable"""
            
            # Build conversation history with enhanced system prompt
            messages = [{"role": "system", "content": enhanced_system_prompt + context + ai_context}]
            
            if conversation_history:
                for msg in conversation_history[-10:]:  # Last 10 messages for context
                    messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
            
            messages.append({"role": "user", "content": question})
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Use the model from environment
                messages=messages,
                max_tokens=1800,  # Increased for more comprehensive responses
                temperature=0.2   # Lower temperature for more focused technical responses
            )
            
            ai_response = response.choices[0].message.content
            
            # Standards Australia compliance is now handled contextually in the system prompt
            # No automatic footer added unless specifically needed
            
            return {
                "response": ai_response,
                "tokens_used": response.usage.total_tokens,
                "model": "gpt-4o-enhanced",
                "timestamp": datetime.utcnow().isoformat(),
                "ai_intelligence_phase": "3_phase_enhanced",
                "workflow_stage": workflow_info['current_stage'],
                "detected_discipline": detected_discipline,
                "key_standards": specialized_context['specialized_knowledge'].get('key_standards', [])[:5],
                "workflow_recommendations": workflow_info['typical_next_steps'][:3]
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