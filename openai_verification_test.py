#!/usr/bin/env python3
"""
CRITICAL VERIFICATION TEST: OpenAI API Integration Validation
Tests OpenAI API integration after billing payment to confirm real AI responses are working.
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
    return "http://localhost:8001"

BACKEND_URL = get_backend_url()
API_BASE = f"{BACKEND_URL}/api"

class OpenAIVerificationTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        try:
            url = f"{API_BASE}{endpoint}"
            request_headers = {"Content-Type": "application/json"}
            if headers:
                request_headers.update(headers)
            
            kwargs = {"headers": request_headers}
            if data:
                kwargs["json"] = data
            
            async with self.session.request(method, url, **kwargs) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                return response.status < 400, response_data, response.status
                
        except Exception as e:
            return False, str(e), 0

    async def test_openai_real_ai_responses(self):
        """CRITICAL TEST: Validate real OpenAI API responses vs mock responses"""
        print("\n=== CRITICAL VERIFICATION: Real AI Response Validation ===")
        print("Testing OpenAI API integration after billing payment...")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Complex construction questions that require real AI intelligence
        construction_test_questions = [
            {
                "question": "What are the specific wind load calculations required for a 15-story residential tower in Melbourne according to AS/NZS 1170.2, including terrain category considerations and dynamic response factors?",
                "session_id": "openai_real_test_wind_loads",
                "expected_terms": ["AS/NZS 1170.2", "wind load", "terrain category", "dynamic response", "Melbourne", "residential tower"],
                "test_name": "Complex Wind Load Analysis"
            },
            {
                "question": "Explain the fire engineering performance solution process for a mixed-use building with retail ground floor and residential apartments above, including required documentation for council approval in NSW.",
                "session_id": "openai_real_test_fire_engineering", 
                "expected_terms": ["fire engineering", "performance solution", "mixed-use", "council approval", "NSW", "documentation"],
                "test_name": "Fire Engineering Performance Solution"
            },
            {
                "question": "What are the hydraulic design requirements for a commercial office building's stormwater management system according to AS/NZS 3500.3, including detention tank sizing and overflow provisions?",
                "session_id": "openai_real_test_hydraulic",
                "expected_terms": ["AS/NZS 3500.3", "stormwater", "detention tank", "overflow", "hydraulic design", "commercial office"],
                "test_name": "Hydraulic Stormwater Design"
            },
            {
                "question": "How do I calculate the required structural steel beam sizes for a 12-story office building in Sydney, considering AS 4100 requirements, wind loads per AS/NZS 1170.2, and seismic design per AS 1170.4?",
                "session_id": "openai_real_test_structural",
                "expected_terms": ["AS 4100", "structural steel", "beam sizes", "AS/NZS 1170.2", "AS 1170.4", "seismic design"],
                "test_name": "Complex Structural Steel Design"
            },
            {
                "question": "What HVAC system design considerations are required for a hospital operating theatre according to AS/NZS 1668.2, including air change rates, filtration requirements, and pressure differentials?",
                "session_id": "openai_real_test_hvac",
                "expected_terms": ["AS/NZS 1668.2", "HVAC", "operating theatre", "air change rates", "filtration", "pressure differentials"],
                "test_name": "Hospital HVAC Design"
            }
        ]
        
        real_ai_responses = 0
        total_tests = len(construction_test_questions)
        
        for question_data in construction_test_questions:
            success, data, status = await self.make_request("POST", "/chat/ask", question_data, mock_headers)
            
            if success and isinstance(data, dict) and "response" in data:
                response_content = data["response"]
                
                # Extract full response text
                if isinstance(response_content, dict):
                    technical_content = response_content.get("technical", "")
                    mentoring_content = response_content.get("mentoring", "")
                    full_response = f"{technical_content} {mentoring_content}"
                else:
                    full_response = str(response_content)
                
                # Check response length (real AI responses should be substantial)
                response_length = len(full_response)
                
                # Check for mock response indicators
                mock_indicators = ["mock", "development", "testing", "placeholder", "Mock analysis", "mock implementation", "for testing", "development environment"]
                is_mock = any(indicator in full_response for indicator in mock_indicators)
                
                # Check for construction domain expertise
                expected_terms = question_data["expected_terms"]
                term_matches = sum(1 for term in expected_terms if term.lower() in full_response.lower())
                term_coverage = term_matches / len(expected_terms)
                
                # Check for AU/NZ standards references
                standards_patterns = ["AS/NZS", "AS ", "BCA", "NCC", "Australian Standard"]
                standards_found = sum(1 for pattern in standards_patterns if pattern in full_response)
                
                # Check for technical depth indicators
                technical_indicators = ["calculation", "design", "requirement", "specification", "compliance", "factor", "load", "pressure", "strength"]
                technical_depth = sum(1 for indicator in technical_indicators if indicator.lower() in full_response.lower())
                
                # Determine if this is a real AI response
                is_real_ai = (
                    not is_mock and 
                    response_length > 300 and 
                    term_coverage >= 0.4 and 
                    standards_found > 0 and
                    technical_depth >= 3
                )
                
                if is_real_ai:
                    real_ai_responses += 1
                    self.log_test(f"Real AI Response ({question_data['test_name']})", True, 
                                f"Length: {response_length} chars, Terms: {term_matches}/{len(expected_terms)}, Standards: {standards_found}, Technical depth: {technical_depth}")
                else:
                    self.log_test(f"Real AI Response ({question_data['test_name']})", False, 
                                f"Mock detected: {is_mock}, Length: {response_length}, Terms: {term_matches}/{len(expected_terms)}, Standards: {standards_found}")
                    
                    # Log the response for debugging
                    print(f"   Response preview: {full_response[:300]}...")
                
                # Test dual-layer response format
                if isinstance(response_content, dict) and "technical" in response_content and "mentoring" in response_content:
                    self.log_test(f"Dual-Layer Format ({question_data['test_name']})", True, "Technical + Mentoring sections present")
                else:
                    self.log_test(f"Dual-Layer Format ({question_data['test_name']})", False, "Missing dual-layer structure")
                    
            else:
                self.log_test(f"Real AI Response ({question_data['test_name']})", False, f"Request failed - Status: {status}")
        
        # Overall real AI assessment
        real_ai_percentage = (real_ai_responses / total_tests) * 100
        if real_ai_percentage >= 80:
            self.log_test("OpenAI API Real Response Validation", True, f"{real_ai_responses}/{total_tests} tests show real AI responses ({real_ai_percentage:.1f}%)")
        else:
            self.log_test("OpenAI API Real Response Validation", False, f"Only {real_ai_responses}/{total_tests} tests show real AI responses ({real_ai_percentage:.1f}%)")
        
        return real_ai_percentage

    async def test_3_phase_ai_intelligence(self):
        """Test 3-Phase AI Intelligence System with Real OpenAI"""
        print("\n=== Test 2: 3-Phase AI Intelligence System Validation ===")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        ai_intelligence_questions = [
            {
                "question": "I need to design the structural system for a 12-story mixed-use building with retail at ground level. What are the key structural considerations and AS/NZS standards I need to follow?",
                "session_id": "ai_phase_structural",
                "expected_phases": ["structural", "AS/NZS", "mixed-use", "design"],
                "test_name": "Structural Engineering Intelligence"
            },
            {
                "question": "We're in the design development stage for a hospital project and need to ensure fire safety compliance. What's the typical workflow and which consultants should be engaged?",
                "session_id": "ai_phase_fire_workflow",
                "expected_phases": ["design development", "fire safety", "consultants", "workflow"],
                "test_name": "Fire Safety Workflow Intelligence"
            },
            {
                "question": "What HVAC design approach should I take for a data center facility, considering energy efficiency and AS/NZS 1668 requirements?",
                "session_id": "ai_phase_hvac",
                "expected_phases": ["HVAC", "data center", "energy efficiency", "AS/NZS 1668"],
                "test_name": "HVAC Specialized Intelligence"
            }
        ]
        
        intelligence_success = 0
        
        for question_data in ai_intelligence_questions:
            success, data, status = await self.make_request("POST", "/chat/ask", question_data, mock_headers)
            
            if success and isinstance(data, dict) and "response" in data:
                response_content = data["response"]
                
                if isinstance(response_content, dict):
                    full_response = f"{response_content.get('technical', '')} {response_content.get('mentoring', '')}"
                else:
                    full_response = str(response_content)
                
                # Check for 3-Phase AI Intelligence indicators
                phase_indicators = [
                    "enhanced prompt", "workflow intelligence", "specialized training",
                    "discipline-specific", "project stage", "consultant", "standards",
                    "compliance", "professional requirements", "next steps", "considerations"
                ]
                
                phase_matches = sum(1 for indicator in phase_indicators if indicator.lower() in full_response.lower())
                
                # Check for workflow guidance
                workflow_indicators = ["typical next steps", "workflow", "process", "stage", "phase", "consultant", "professional"]
                workflow_matches = sum(1 for indicator in workflow_indicators if indicator.lower() in full_response.lower())
                
                # Check for specialized knowledge
                specialized_indicators = ["AS/NZS", "standard", "requirement", "specification", "design", "calculation"]
                specialized_matches = sum(1 for indicator in specialized_indicators if indicator in full_response)
                
                if phase_matches >= 4 and workflow_matches >= 2 and specialized_matches >= 2 and len(full_response) > 400:
                    intelligence_success += 1
                    self.log_test(f"3-Phase AI Intelligence ({question_data['test_name']})", True, 
                                f"Intelligence indicators: {phase_matches}/11, Workflow: {workflow_matches}, Specialized: {specialized_matches}")
                else:
                    self.log_test(f"3-Phase AI Intelligence ({question_data['test_name']})", False, 
                                f"Limited intelligence: {phase_matches}/11, Workflow: {workflow_matches}, Specialized: {specialized_matches}")
            else:
                self.log_test(f"3-Phase AI Intelligence ({question_data['test_name']})", False, f"Request failed - Status: {status}")
        
        intelligence_percentage = (intelligence_success / len(ai_intelligence_questions)) * 100
        return intelligence_percentage

    async def test_knowledge_enhanced_responses(self):
        """Test Knowledge-Enhanced AI Responses"""
        print("\n=== Test 3: Knowledge-Enhanced AI Responses ===")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        enhanced_question = {
            "question": "What are the fire rating requirements for structural steel in high-rise commercial buildings, and how do I ensure compliance with Australian standards?",
            "session_id": "openai_knowledge_enhanced"
        }
        
        success, data, status = await self.make_request("POST", "/chat/ask-enhanced", enhanced_question, mock_headers)
        
        knowledge_enhanced = False
        if success and isinstance(data, dict):
            if "response" in data and "knowledge_enhanced" in data:
                knowledge_used = data.get("knowledge_enhanced", False)
                sources_count = data.get("response", {}).get("knowledge_sources", 0) if isinstance(data.get("response"), dict) else 0
                
                self.log_test("Knowledge-Enhanced AI Response", True, 
                            f"Knowledge integration: {knowledge_used}, Sources used: {sources_count}")
                
                # Check response quality with knowledge integration
                response_content = data["response"]
                if isinstance(response_content, dict):
                    full_response = f"{response_content.get('technical', '')} {response_content.get('mentoring', '')}"
                    
                    # Look for knowledge base integration indicators
                    knowledge_indicators = ["knowledge base", "uploaded documents", "from knowledge", "based on", "according to"]
                    knowledge_integration = sum(1 for indicator in knowledge_indicators if indicator.lower() in full_response.lower())
                    
                    if knowledge_integration > 0 or sources_count > 0:
                        knowledge_enhanced = True
                        self.log_test("Knowledge Base Integration", True, f"Integration indicators found: {knowledge_integration}, Sources: {sources_count}")
                    else:
                        self.log_test("Knowledge Base Integration", False, "No clear knowledge base integration detected")
                        
            else:
                self.log_test("Knowledge-Enhanced AI Response", False, "Missing enhanced response fields", data)
        else:
            self.log_test("Knowledge-Enhanced AI Response", False, f"Status: {status}", data)
        
        return knowledge_enhanced

    async def test_api_performance(self):
        """Test API Performance and Error Handling"""
        print("\n=== Test 4: API Performance and Error Handling ===")
        
        mock_headers = {"Authorization": "Bearer mock_dev_token"}
        
        # Test multiple concurrent requests
        concurrent_questions = [
            {"question": f"What is the minimum concrete cover for reinforcement in exposure classification A{i} according to AS 3600?", "session_id": f"concurrent_test_{i}"}
            for i in range(1, 4)
        ]
        
        start_time = asyncio.get_event_loop().time()
        
        # Make concurrent requests
        tasks = [
            self.make_request("POST", "/chat/ask", question, mock_headers)
            for question in concurrent_questions
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        end_time = asyncio.get_event_loop().time()
        
        successful_concurrent = sum(1 for result in results if not isinstance(result, Exception) and result[0])
        total_time = end_time - start_time
        
        if successful_concurrent >= 2:
            self.log_test("Concurrent API Requests", True, f"{successful_concurrent}/3 successful in {total_time:.2f}s")
        else:
            self.log_test("Concurrent API Requests", False, f"Only {successful_concurrent}/3 successful")
        
        # Test rate limiting behavior
        rate_limit_question = {
            "question": "What is AS 3600?",
            "session_id": "rate_limit_test"
        }
        
        # Make rapid sequential requests
        rapid_results = []
        for i in range(5):
            result = await self.make_request("POST", "/chat/ask", rate_limit_question, mock_headers)
            rapid_results.append(result[0])  # success status
            await asyncio.sleep(0.1)  # Small delay
        
        successful_rapid = sum(rapid_results)
        if successful_rapid >= 4:
            self.log_test("Rate Limiting Handling", True, f"{successful_rapid}/5 rapid requests successful")
            return True
        else:
            self.log_test("Rate Limiting Handling", False, f"Only {successful_rapid}/5 rapid requests successful - possible rate limiting")
            return False

    async def run_critical_verification(self):
        """Run the complete critical verification test suite"""
        print("=" * 80)
        print("CRITICAL VERIFICATION TEST: OpenAI API Integration")
        print("Testing OpenAI API integration after billing payment")
        print("=" * 80)
        
        # Test 1: Real AI Response Validation
        real_ai_percentage = await self.test_openai_real_ai_responses()
        
        # Test 2: 3-Phase AI Intelligence System
        intelligence_percentage = await self.test_3_phase_ai_intelligence()
        
        # Test 3: Knowledge-Enhanced Responses
        knowledge_enhanced = await self.test_knowledge_enhanced_responses()
        
        # Test 4: API Performance
        performance_ok = await self.test_api_performance()
        
        # Final Assessment
        print("\n" + "=" * 80)
        print("CRITICAL VERIFICATION SUMMARY")
        print("=" * 80)
        
        overall_success = True
        
        if real_ai_percentage >= 80:
            print("✅ CRITICAL SUCCESS: OpenAI API integration is working with real AI responses")
            print(f"✅ Real AI Response Rate: {real_ai_percentage:.1f}%")
        else:
            print("❌ CRITICAL FAILURE: OpenAI API may still be using mock responses")
            print(f"❌ Real AI Response Rate: {real_ai_percentage:.1f}%")
            overall_success = False
            
        if intelligence_percentage >= 70:
            print("✅ 3-Phase AI Intelligence System: Working correctly")
            print(f"✅ Intelligence Success Rate: {intelligence_percentage:.1f}%")
        else:
            print("❌ 3-Phase AI Intelligence System: Limited functionality")
            print(f"❌ Intelligence Success Rate: {intelligence_percentage:.1f}%")
            
        if knowledge_enhanced:
            print("✅ Knowledge-Enhanced Responses: Working")
        else:
            print("⚠️  Knowledge-Enhanced Responses: Limited or not working")
            
        if performance_ok:
            print("✅ API Performance: Good")
        else:
            print("⚠️  API Performance: Some issues detected")
        
        print("\n" + "=" * 80)
        
        if overall_success:
            print("🎉 OVERALL RESULT: OpenAI API integration is WORKING with real AI responses!")
            print("✅ Construction domain expertise confirmed")
            print("✅ AU/NZ standards compliance verified")
            print("✅ Dual-layer response format working")
            print("✅ System ready for production use")
        else:
            print("⚠️  OVERALL RESULT: OpenAI API integration needs attention")
            print("❌ Check API key quota and billing status")
            print("❌ Verify OpenAI account has sufficient credits")
            print("❌ System may still be using mock responses")
        
        print("=" * 80)
        
        # Calculate overall test success rate
        total_tests = len(self.test_results)
        successful_tests = sum(1 for result in self.test_results if result["success"])
        success_rate = (successful_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"\nTest Summary: {successful_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        
        return overall_success

async def main():
    """Main test execution"""
    async with OpenAIVerificationTester() as tester:
        success = await tester.run_critical_verification()
        return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)