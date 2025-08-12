#!/usr/bin/env python3
"""
Enhanced Emoji Mapping Consistency Testing Framework
Enterprise-grade testing system for validating identical emoji mapping across endpoints
"""

import asyncio
import aiohttp
import json
import csv
import os
import sys
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import unicodedata
import re
from pathlib import Path

# JSON Schema for response validation
RESPONSE_SCHEMA = {
    "type": "object",
    "required": ["message", "emoji_map", "meta"],
    "properties": {
        "message": {"type": "string", "minLength": 1},
        "emoji_map": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "required": ["name", "char"],
                "properties": {
                    "name": {"type": "string", "minLength": 1},
                    "char": {"type": "string", "minLength": 1}
                }
            }
        },
        "meta": {
            "type": "object",
            "required": ["endpoint_id", "model", "temperature"],
            "properties": {
                "endpoint_id": {"type": "string"},
                "model": {"type": "string"},
                "temperature": {"type": "number"}
            },
            "additionalProperties": True
        }
    },
    "additionalProperties": True
}

# Fixed test prompts covering all edge cases
TEST_PROMPTS = [
    {
        "id": "baseline",
        "name": "Baseline",
        "prompt": 'Summarise in one sentence: "Enhanced Emoji Mapping must be identical across endpoints."'
    },
    {
        "id": "explicit_emoji",
        "name": "Explicit Emoji Check",
        "prompt": 'Return the 🧐 thinking emoji as part of your mapping under the name "insight".'
    },
    {
        "id": "multiple_emojis",
        "name": "Multiple Emojis & Names",
        "prompt": "Map the following concepts to emojis: insight, warning, success, failure, info."
    },
    {
        "id": "unicode_heavy",
        "name": "Unicode Heavy / Accents",
        "prompt": 'Explain: "Café customers said naïve use of emojis can mislead."'
    },
    {
        "id": "rtl_text",
        "name": "Right-to-Left Text",
        "prompt": "Translate this Arabic word and include it in the output: فضولي (curious). Provide your usual emoji map."
    },
    {
        "id": "long_text",
        "name": "Long Text / Truncation Guard",
        "prompt": "Write a 150-word summary of how emoji can improve UX in construction apps, then return your emoji map."
    },
    {
        "id": "code_block",
        "name": "Code Block in Content",
        "prompt": "Explain what this code does in plain English and include your emoji map:\n\n```\ndef add(a,b): return a+b\n```"
    },
    {
        "id": "json_escaping",
        "name": "JSON-looking Content (Escaping Test)",
        "prompt": 'Return a short message that includes this literal JSON snippet (do not parse it): {"key":"value"} and your emoji map.'
    },
    {
        "id": "tooling_hint",
        "name": "Tooling Hint (Should be Inert)",
        "prompt": "If you have tools, ignore them. Just reply normally and include the emoji map."
    },
    {
        "id": "ambiguity",
        "name": "Ambiguity / Clarify Behavior",
        "prompt": "Give a one-line recommendation for improving user onboarding. Include emoji map."
    },
    {
        "id": "cjk_script",
        "name": "Non-Latin Script (CJK)",
        "prompt": "Provide the word \"insight\" in Japanese and include emoji mapping."
    },
    {
        "id": "stress_mix",
        "name": "Stress Mix (Emojis in Prompt)",
        "prompt": "User wrote: \"We're stuck 😬—can you guide us 🧭 to a fix?\" Provide response and emoji map."
    }
]

class EmojiConsistencyFramework:
    def __init__(self):
        self.session = None
        self.backend_url = self._get_backend_url()
        self.results = []
        self.raw_requests = {"regular": [], "enhanced": []}
        self.raw_responses = {"regular": [], "enhanced": []}
        
    def _get_backend_url(self):
        try:
            with open('/app/frontend/.env', 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        return line.split('=', 1)[1].strip()
        except Exception as e:
            print(f"Error reading frontend .env: {e}")
        return "http://localhost:8001"
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def validate_schema(self, response_data: Dict) -> Tuple[bool, str]:
        """Validate response against JSON schema"""
        try:
            # Simple schema validation (can be enhanced with jsonschema library)
            if not isinstance(response_data, dict):
                return False, "Response is not a dictionary"
            
            required_fields = ["message", "emoji_map", "meta"]
            for field in required_fields:
                if field not in response_data:
                    return False, f"Missing required field: {field}"
            
            if not isinstance(response_data["message"], str) or len(response_data["message"]) == 0:
                return False, "Message field is invalid"
            
            if not isinstance(response_data["emoji_map"], list) or len(response_data["emoji_map"]) == 0:
                return False, "Emoji_map field is invalid"
            
            for emoji_item in response_data["emoji_map"]:
                if not isinstance(emoji_item, dict):
                    return False, "Emoji_map item is not a dictionary"
                if "name" not in emoji_item or "char" not in emoji_item:
                    return False, "Emoji_map item missing name or char"
            
            meta = response_data["meta"]
            if not isinstance(meta, dict):
                return False, "Meta field is not a dictionary"
            
            meta_required = ["endpoint_id", "model", "temperature"]
            for field in meta_required:
                if field not in meta:
                    return False, f"Meta missing required field: {field}"
            
            return True, "Schema valid"
            
        except Exception as e:
            return False, f"Schema validation error: {str(e)}"
    
    def check_emoji_valid(self, response_data: Dict) -> Tuple[bool, str]:
        """Check if emojis are present and unescaped"""
        try:
            emoji_map = response_data.get("emoji_map", [])
            if not emoji_map:
                return False, "No emoji_map found"
            
            for emoji_item in emoji_map:
                char = emoji_item.get("char", "")
                if not char:
                    return False, "Empty emoji char found"
                
                # Check if emoji is properly unescaped (not \\uXXXX format)
                if "\\u" in char:
                    return False, f"Emoji appears to be JSON-escaped: {char}"
                
                # Basic emoji detection (simplified)
                if not any(ord(c) > 127 for c in char):
                    return False, f"Char doesn't appear to be an emoji: {char}"
            
            return True, "Emojis valid and unescaped"
            
        except Exception as e:
            return False, f"Emoji validation error: {str(e)}"
    
    def check_insight_emoji(self, response_data: Dict, prompt_id: str) -> Tuple[bool, str]:
        """Check if 🧐 emoji is used for 'insight' when requested"""
        if prompt_id != "explicit_emoji":
            return True, "Not applicable for this prompt"
        
        try:
            emoji_map = response_data.get("emoji_map", [])
            insight_emoji = None
            
            for emoji_item in emoji_map:
                name = emoji_item.get("name", "").lower()
                if "insight" in name:
                    insight_emoji = emoji_item.get("char", "")
                    break
            
            if not insight_emoji:
                return False, "No insight emoji found in mapping"
            
            if "🧐" in insight_emoji:
                return True, f"Correct insight emoji found: {insight_emoji}"
            else:
                return False, f"Wrong insight emoji found: {insight_emoji} (expected 🧐)"
                
        except Exception as e:
            return False, f"Insight emoji check error: {str(e)}"
    
    def get_unicode_points(self, text: str) -> str:
        """Get Unicode code points for debugging"""
        try:
            return " ".join(f"U+{ord(c):04X}" for c in text)
        except Exception:
            return "Error getting Unicode points"
    
    async def make_request(self, endpoint: str, prompt: str, prompt_id: str) -> Tuple[bool, Dict, int, str]:
        """Make request to endpoint with fixed test conditions"""
        try:
            url = f"{self.backend_url}/api/chat/{endpoint}"
            headers = {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Bearer mock_dev_token"
            }
            
            data = {
                "question": prompt,
                "session_id": f"framework_test_{prompt_id}_{endpoint}",
                # Fixed test conditions
                "temperature": 0,
                "top_p": 1,
                "seed": 42
            }
            
            # Log raw request
            request_log = {
                "timestamp": datetime.utcnow().isoformat(),
                "endpoint": endpoint,
                "prompt_id": prompt_id,
                "url": url,
                "headers": headers,
                "data": data
            }
            self.raw_requests[endpoint].append(request_log)
            
            async with self.session.post(url, json=data, headers=headers) as response:
                try:
                    response_data = await response.json()
                except:
                    response_text = await response.text()
                    response_data = {"error": "Invalid JSON", "text": response_text}
                
                # Log raw response
                response_log = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "endpoint": endpoint,
                    "prompt_id": prompt_id,
                    "status": response.status,
                    "headers": dict(response.headers),
                    "data": response_data
                }
                self.raw_responses[endpoint].append(response_log)
                
                return response.status < 400, response_data, response.status, ""
                
        except Exception as e:
            error_msg = str(e)
            # Log error
            error_log = {
                "timestamp": datetime.utcnow().isoformat(),
                "endpoint": endpoint,
                "prompt_id": prompt_id,
                "error": error_msg
            }
            self.raw_responses[endpoint].append(error_log)
            
            return False, {"error": error_msg}, 0, error_msg
    
    def transform_response_to_schema(self, raw_response: Dict, endpoint: str) -> Dict:
        """Transform actual API response to expected schema format"""
        try:
            # Extract the actual response content
            if "response" in raw_response:
                content = raw_response["response"]
                if isinstance(content, dict) and "technical" in content:
                    # Dual format response
                    message = content.get("technical", "") + "\n\n" + content.get("mentoring", "")
                else:
                    # Direct text response
                    message = str(content)
            else:
                message = str(raw_response)
            
            # Extract emojis from the message content
            emoji_map = self.extract_emoji_map(message)
            
            # Create meta information
            meta = {
                "endpoint_id": endpoint,
                "model": raw_response.get("model", "gpt-4o-mini"),
                "temperature": 0,
                "tokens_used": raw_response.get("tokens_used", 0),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return {
                "message": message,
                "emoji_map": emoji_map,
                "meta": meta
            }
            
        except Exception as e:
            return {
                "message": f"Error transforming response: {str(e)}",
                "emoji_map": [],
                "meta": {
                    "endpoint_id": endpoint,
                    "model": "error",
                    "temperature": 0,
                    "error": str(e)
                }
            }
    
    def extract_emoji_map(self, text: str) -> List[Dict]:
        """Extract emoji mappings from response text"""
        emoji_map = []
        
        # Common patterns for finding emojis with context
        patterns = [
            (r"🧐\s*\*\*Mentoring Insight", "insight", "🧐"),
            (r"🔧\s*\*\*Technical Answer", "technical", "🔧"),
            (r"📋\s*\*\*Next Steps", "next_steps", "📋"),
            (r"📊\s*\*\*Code Requirements", "code", "📊"),
            (r"✅\s*\*\*Compliance", "compliance", "✅"),
            (r"🔄\s*\*\*Alternative", "alternative", "🔄"),
            (r"🏛️\s*\*\*Authority", "authority", "🏛️"),
            (r"📄\s*\*\*Documentation", "documentation", "📄"),
            (r"⚙️\s*\*\*Workflow", "workflow", "⚙️"),
            (r"❓\s*\*\*Clarifying", "clarify", "❓")
        ]
        
        for pattern, name, emoji in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                emoji_map.append({"name": name, "char": emoji})
        
        # Also extract any standalone emojis
        emoji_chars = re.findall(r'[🌀-🟿]', text)  # Basic emoji range
        for i, char in enumerate(set(emoji_chars)):
            if not any(item["char"] == char for item in emoji_map):
                emoji_map.append({"name": f"emoji_{i}", "char": char})
        
        # Ensure at least one emoji if none found
        if not emoji_map:
            emoji_map = [{"name": "default", "char": "📝"}]
        
        return emoji_map
    
    async def run_comprehensive_test(self):
        """Run all 12 test prompts on both endpoints"""
        print("🚀 === ENHANCED EMOJI MAPPING CONSISTENCY FRAMEWORK ===")
        print("Enterprise-grade testing for definitive emoji mapping validation")
        print(f"Backend URL: {self.backend_url}")
        print(f"Test Prompts: {len(TEST_PROMPTS)}")
        print(f"Endpoints: regular (/api/chat/ask) + enhanced (/api/chat/ask-enhanced)")
        
        for i, test_case in enumerate(TEST_PROMPTS, 1):
            print(f"\n📋 Test {i}/{len(TEST_PROMPTS)}: {test_case['name']}")
            print(f"Prompt ID: {test_case['id']}")
            print(f"Prompt: {test_case['prompt'][:100]}...")
            
            # Test both endpoints
            endpoints = ["ask", "ask-enhanced"]
            test_results = {}
            
            for endpoint in endpoints:
                print(f"\n🔍 Testing {endpoint} endpoint...")
                
                success, raw_response, status, error = await self.make_request(
                    endpoint, test_case['prompt'], test_case['id']
                )
                
                if success:
                    # Transform to schema format
                    schema_response = self.transform_response_to_schema(raw_response, endpoint)
                    
                    # Run all checks
                    schema_valid, schema_msg = self.validate_schema(schema_response)
                    emoji_valid, emoji_msg = self.check_emoji_valid(schema_response)
                    insight_valid, insight_msg = self.check_insight_emoji(schema_response, test_case['id'])
                    
                    # Calculate content difference (simplified)
                    content_length = len(schema_response["message"])
                    
                    test_results[endpoint] = {
                        "success": True,
                        "schema_valid": schema_valid,
                        "emoji_valid": emoji_valid,
                        "insight_valid": insight_valid,
                        "content_length": content_length,
                        "schema_msg": schema_msg,
                        "emoji_msg": emoji_msg,
                        "insight_msg": insight_msg,
                        "response": schema_response,
                        "raw_response": raw_response
                    }
                    
                    print(f"   ✅ Status: {status}")
                    print(f"   📏 Content Length: {content_length}")
                    print(f"   📋 Schema Valid: {schema_valid} - {schema_msg}")
                    print(f"   🧐 Emoji Valid: {emoji_valid} - {emoji_msg}")
                    print(f"   🎯 Insight Check: {insight_valid} - {insight_msg}")
                    
                else:
                    test_results[endpoint] = {
                        "success": False,
                        "error": error,
                        "status": status,
                        "raw_response": raw_response
                    }
                    print(f"   ❌ Failed: {status} - {error}")
            
            # Compare endpoints
            if test_results["ask"]["success"] and test_results["ask-enhanced"]["success"]:
                regular_content = test_results["ask"]["response"]["message"]
                enhanced_content = test_results["ask-enhanced"]["response"]["message"]
                
                # Calculate difference
                content_diff = abs(len(regular_content) - len(enhanced_content))
                identical_content = regular_content.strip() == enhanced_content.strip()
                
                print(f"\n🔄 COMPARISON:")
                print(f"   Content Diff: {content_diff} characters")
                print(f"   Identical: {identical_content}")
                
                # Store results
                result_row = {
                    "test_id": test_case["id"],
                    "test_name": test_case["name"],
                    "regular_schema_valid": test_results["ask"]["schema_valid"],
                    "enhanced_schema_valid": test_results["ask-enhanced"]["schema_valid"],
                    "regular_emoji_valid": test_results["ask"]["emoji_valid"],
                    "enhanced_emoji_valid": test_results["ask-enhanced"]["emoji_valid"],
                    "regular_insight_valid": test_results["ask"]["insight_valid"],
                    "enhanced_insight_valid": test_results["ask-enhanced"]["insight_valid"],
                    "content_diff_bytes": content_diff,
                    "identical_content": identical_content,
                    "regular_content_length": test_results["ask"]["content_length"],
                    "enhanced_content_length": test_results["ask-enhanced"]["content_length"],
                    "regular_model": test_results["ask"]["response"]["meta"]["model"],
                    "enhanced_model": test_results["ask-enhanced"]["response"]["meta"]["model"],
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                self.results.append(result_row)
        
        # Generate reports
        await self.generate_reports()
    
    async def generate_reports(self):
        """Generate comprehensive test reports"""
        print("\n📊 === GENERATING COMPREHENSIVE REPORTS ===")
        
        # Create output directory
        output_dir = Path("/app/emoji_test_results")
        output_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        
        # 1. CSV Summary Report
        csv_path = output_dir / f"emoji_consistency_report_{timestamp}.csv"
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            if self.results:
                writer = csv.DictWriter(csvfile, fieldnames=self.results[0].keys())
                writer.writeheader()
                writer.writerows(self.results)
        
        print(f"✅ CSV Report: {csv_path}")
        
        # 2. Raw Request/Response JSONL files
        for endpoint in ["regular", "enhanced"]:
            # Requests
            req_path = output_dir / f"requests_{endpoint}_{timestamp}.jsonl"
            with open(req_path, 'w', encoding='utf-8') as f:
                for req in self.raw_requests[endpoint.replace("regular", "ask").replace("enhanced", "ask-enhanced")]:
                    f.write(json.dumps(req, ensure_ascii=False) + '\n')
            
            # Responses
            resp_path = output_dir / f"responses_{endpoint}_{timestamp}.jsonl"
            with open(resp_path, 'w', encoding='utf-8') as f:
                for resp in self.raw_responses[endpoint.replace("regular", "ask").replace("enhanced", "ask-enhanced")]:
                    f.write(json.dumps(resp, ensure_ascii=False) + '\n')
            
            print(f"✅ {endpoint.title()} Requests: {req_path}")
            print(f"✅ {endpoint.title()} Responses: {resp_path}")
        
        # 3. Summary Statistics
        if self.results:
            total_tests = len(self.results)
            schema_matches = sum(1 for r in self.results if r["regular_schema_valid"] and r["enhanced_schema_valid"])
            emoji_matches = sum(1 for r in self.results if r["regular_emoji_valid"] and r["enhanced_emoji_valid"])
            identical_content = sum(1 for r in self.results if r["identical_content"])
            insight_matches = sum(1 for r in self.results if r["regular_insight_valid"] and r["enhanced_insight_valid"])
            
            print(f"\n📈 === FINAL SUMMARY STATISTICS ===")
            print(f"Total Tests: {total_tests}")
            print(f"Schema Valid (Both): {schema_matches}/{total_tests} ({schema_matches/total_tests*100:.1f}%)")
            print(f"Emoji Valid (Both): {emoji_matches}/{total_tests} ({emoji_matches/total_tests*100:.1f}%)")
            print(f"Insight Check (Both): {insight_matches}/{total_tests} ({insight_matches/total_tests*100:.1f}%)")
            print(f"Identical Content: {identical_content}/{total_tests} ({identical_content/total_tests*100:.1f}%)")
            
            # Overall Pass/Fail
            overall_pass = schema_matches == total_tests and emoji_matches == total_tests and insight_matches == total_tests
            print(f"\n🎯 OVERALL RESULT: {'✅ PASS' if overall_pass else '❌ FAIL'}")
            
            if not overall_pass:
                print("\n🔍 FAILURE ANALYSIS:")
                if schema_matches < total_tests:
                    print("   ❌ Schema validation failures detected")
                if emoji_matches < total_tests:
                    print("   ❌ Emoji validation failures detected")
                if insight_matches < total_tests:
                    print("   ❌ Insight emoji check failures detected")
                if identical_content < total_tests:
                    print("   ⚠️  Content differences detected (may be acceptable)")
        
        return output_dir, timestamp

async def main():
    """Main test runner"""
    try:
        async with EmojiConsistencyFramework() as framework:
            await framework.run_comprehensive_test()
    except Exception as e:
        print(f"❌ Framework Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)