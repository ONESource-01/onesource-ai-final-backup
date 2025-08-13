"""
Unified Chat Service - SINGLE CODE PATH for all tiers and endpoints
Builds prompt, calls model, returns unified schema
NO MORE ENDPOINT-SPECIFIC LOGIC
"""

import os
import openai
from typing import Dict, Any, Optional, Literal
from datetime import datetime
from core.schema import ChatResponse, Meta, EmojiItem
from core.formatter import unified_formatter
from core.context_manager import context_manager

def load_system_prompt(tier: Literal["starter", "pro", "pro_plus"]) -> str:
    """
    Load master system prompt and inject tier
    SINGLE SOURCE OF TRUTH - no variations allowed
    """
    try:
        with open('/app/core/prompts/system_master.txt', 'r', encoding='utf-8') as f:
            prompt_template = f.read()
        
        # Replace tier placeholder
        return prompt_template.replace('{{tier}}', tier.upper())
    
    except Exception as e:
        print(f"Error loading system prompt: {e}")
        # Fallback minimal prompt
        return f"""You are ONESource AI, construction compliance advisor for AU/NZ.
        Tier: {tier.upper()}
        Always include: 🔧 Technical Answer, 🧐 Mentoring Insight, 📋 Next Steps"""

class UnifiedChatService:
    """
    SINGLE CHAT SERVICE - used by all tiers and both endpoints
    NO VARIATIONS ALLOWED - same logic for everyone
    """
    
    def __init__(self):
        self.openai_client = None
        self._init_openai_client()
    
    def _init_openai_client(self):
        """Initialize OpenAI client if API key available"""
        api_key = os.environ.get('OPENAI_API_KEY')
        if api_key and len(api_key) > 10:
            try:
                self.openai_client = openai.OpenAI(api_key=api_key)
            except Exception as e:
                print(f"Error initializing OpenAI client: {e}")
                self.openai_client = None
        else:
            print("No OpenAI API key found, using mock responses")
    
    async def generate_response(
        self,
        question: str,
        session_id: str,
        tier: Literal["starter", "pro", "pro_plus"],
        user_id: Optional[str] = None,
        knowledge_context: Optional[str] = None
    ) -> ChatResponse:
        """
        MAIN UNIFIED FUNCTION
        Same logic for all tiers and endpoints - NO EXCEPTIONS
        """
        
        # INSTRUMENTATION: Log critical parameters
        import hashlib
        prompt_hash = "none"
        history_turns = 0
        
        # Step 1: Pre-save conversation stub (FIXES CONTEXT BUG)
        if context_manager:
            conversation_id = await context_manager.pre_save_conversation_stub(
                session_id, user_id, question
            )
        else:
            conversation_id = "no_context_manager"
        
        try:
            # Step 2: Get conversation context
            conversation_history = []
            topics = {}
            context_hint = ""
            
            if context_manager:
                conversation_history = await context_manager.get_conversation_context(session_id)
                topics = context_manager.extract_context_topics(conversation_history)
                context_hint = context_manager.build_context_hint_for_prompt(question, topics)
                
                # Update instrumentation
                history_turns = len(conversation_history)
                
                # Debug context retrieval
                print(f"DEBUG: Session {session_id} - Found {len(conversation_history)} conversations")
                print(f"DEBUG: Extracted topics: {topics}")
                print(f"DEBUG: Context hint generated: {bool(context_hint)}")
            
            # Step 3: Build system prompt with tier and context
            base_prompt = load_system_prompt(tier)
            
            # Add knowledge context if provided (for enhanced endpoint)
            if knowledge_context:
                base_prompt += f"\n\nKNOWLEDGE CONTEXT:\n{knowledge_context}"
            
            # Add conversation context hint
            if context_hint:
                base_prompt += context_hint
            
            # Calculate prompt hash for parity verification
            prompt_hash = hashlib.md5(base_prompt.encode()).hexdigest()[:8]
            
            # INSTRUMENTATION: Log all critical parameters
            print(f"INSTRUMENT: endpoint=unified, session_id={session_id}, prompt_hash={prompt_hash}, history_turns={history_turns}, tier={tier}, temperature=0.3")
            
            # Step 4: Generate AI response
            if self.openai_client:
                raw_response = await self._call_openai_api(question, base_prompt, conversation_history)
                tokens_used = 800  # Estimate for real API calls
            else:
                raw_response = self._generate_mock_response(question, tier, topics)
                tokens_used = 600  # Estimate for mock responses
            
            # Step 5: Apply unified formatting (ENFORCES ALL RULES)
            formatted_text, emoji_map = unified_formatter.format_response(raw_response)
            
            # Step 6: Extract mentoring insight
            mentoring_insight = unified_formatter.extract_mentoring_insight(formatted_text)
            
            # Step 7: Create unified response
            response = ChatResponse(
                text=formatted_text,
                emoji_map=emoji_map,
                mentoring_insight=mentoring_insight,
                meta=Meta(
                    tier=tier,
                    session_id=session_id,
                    tokens_used=tokens_used
                )
            )
            
            # Step 8: Update conversation with final response
            if context_manager:
                await context_manager.update_conversation_response(
                    conversation_id, formatted_text, tokens_used
                )
            
            return response
            
        except Exception as e:
            print(f"Error in unified chat service: {e}")
            
            # Fallback response with proper formatting
            fallback_text = f"""## 🔧 **Technical Answer**

I apologize, but I encountered an error processing your question about {question}. Please try rephrasing your question or contact support if the issue persists.

## 🧐 **Mentoring Insight**

Technical issues can occur with complex systems. Consider providing more specific details about your construction project for better assistance.

## 📋 **Next Steps**

1. Rephrase your question with more specific details
2. Contact support if the issue continues
3. Try asking about a specific construction topic"""
            
            formatted_text, emoji_map = unified_formatter.format_response(fallback_text)
            
            return ChatResponse(
                text=formatted_text,
                emoji_map=emoji_map,
                mentoring_insight="Consider providing more specific details for better assistance.",
                meta=Meta(
                    tier=tier,
                    session_id=session_id,
                    tokens_used=200
                )
            )
    
    async def _call_openai_api(self, question: str, system_prompt: str, conversation_history: list) -> str:
        """Call OpenAI API with conversation context"""
        try:
            # Build messages with conversation context
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add conversation history if available
            if context_manager and conversation_history:
                history_messages = context_manager.build_context_for_ai(conversation_history)
                messages.extend(history_messages)
            
            # Add current question
            messages.append({"role": "user", "content": question})
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.3,
                top_p=1,
                max_tokens=2000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            return self._generate_mock_response(question, "starter", {})
    
    def _generate_mock_response(self, question: str, tier: str, topics: Dict[str, str]) -> str:
        """Generate mock response with context awareness"""
        
        # CRITICAL: Disable mocks for context tests - must use real prompt building
        USE_MOCK = False
        if not USE_MOCK:
            raise Exception("Mock responses disabled - test environment must use real OpenAI API or proper fallback")
        
        # Context-aware responses for follow-up questions
        if topics and any(indicator in question.lower() for indicator in ['it', 'this', 'that', 'when do', 'where do', 'how do']):
            recent_topic = list(topics.values())[-1]
            
            if 'acoustic' in recent_topic:
                return f"""## 🔧 **Technical Answer**

Based on our previous discussion about {recent_topic}, installation timing is critical for optimal performance.

**Installation Schedule:**
- **Pre-drylining Phase:** Install acoustic lagging before wall linings
- **Services Coordination:** After mechanical rough-in, before final finishes
- **NCC Compliance:** Must meet performance requirements in NCC Section F

**Key Timing Factors:**
1. Access requirements while cavities are open
2. Trade coordination with electrical and mechanical
3. Weather protection during installation

## 🧐 **Mentoring Insight**

Timing acoustic installation correctly prevents costly rework and ensures performance compliance. Early coordination with trades is essential for project success.

## 📋 **Next Steps**

1. Coordinate installation timing with construction program
2. Confirm material delivery schedule
3. Schedule acoustic specialist for installation phase"""
        
        # Topic-specific responses
        if any(term in question.lower() for term in ['acoustic', 'lagging']):
            return """## 🔧 **Technical Answer**

Acoustic lagging requirements follow NCC Section F (Sound Transmission) and AS/NZS 3671 (Acoustic lagging for mechanical systems).

**Key Requirements:**
- Performance: Meet NCC sound transmission requirements
- Materials: AS/NZS 3671 compliant acoustic materials
- Installation: Professional installation to manufacturer specifications

## 🧐 **Mentoring Insight**

Acoustic performance is often overlooked until complaints arise. Early specification and quality installation prevent costly remediation work.

## 📋 **Next Steps**

1. Determine required acoustic performance levels
2. Select appropriate AS/NZS 3671 compliant materials
3. Engage acoustic specialist for installation"""
        
        if any(term in question.lower() for term in ['fire', 'safety']):
            return """## 🔧 **Technical Answer**

Fire safety requirements are governed by NCC Volume One Part E (Fire Safety) and relevant Australian Standards.

**Core Requirements:**
- Fire resistance levels (FRL) based on building classification
- Egress systems with appropriate travel distances
- Fire protection systems (detection, suppression, hydrants)

## 🧐 **Mentoring Insight**

Fire safety compliance requires early integration with design. Retrofitting fire safety systems is significantly more expensive than proper initial design.

## 📋 **Next Steps**

1. Determine building classification and fire safety requirements
2. Engage fire safety engineer for system design
3. Coordinate with building certifier for approval pathway"""
        
        # General response
        return f"""## 🔧 **Technical Answer**

For AU/NZ construction, compliance follows the National Construction Code (NCC) 2025 as the primary authority.

**{tier.upper()} Analysis:**
- NCC provides performance requirements and deemed-to-satisfy provisions
- AS/NZS standards provide supporting technical guidance
- State/territory variations apply in some jurisdictions

## 🧐 **Mentoring Insight**

{tier.upper()} tier provides {'basic' if tier == 'starter' else 'comprehensive' if tier == 'pro' else 'expert-level'} guidance for professional construction projects. Early compliance planning prevents costly retrospective modifications.

## 📋 **Next Steps**

1. Identify specific NCC requirements for your project
2. Engage appropriate specialists for coordination
3. Confirm compliance pathway with building certifier"""

# Global service instance
unified_chat_service = UnifiedChatService()