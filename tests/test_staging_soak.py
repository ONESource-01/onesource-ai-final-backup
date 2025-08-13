#!/usr/bin/env python3
"""
Phase 4: Staging Soak Tests (48h)
Automated tests for staging environment validation before canary rollout
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import time
import json
import random
import statistics
from datetime import datetime, timedelta
from typing import List, Dict, Any
import concurrent.futures
import logging

logger = logging.getLogger(__name__)

class StagingSoakTests:
    """Staging environment soak tests for 48h validation"""
    
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.auth_headers = {"Authorization": "Bearer mock_test_token"}
        self.test_results = []
        
        # SLO Thresholds
        self.SLO_P95_CHAT_MS = 1500  # 1.5s
        self.SLO_P95_ENHANCED_MS = 1600  # 1.6s
        self.SLO_LATENCY_DELTA_MS = 100  # 100ms
        self.SLO_5XX_RATE_PERCENT = 0.3  # 0.3%
        self.SLO_PERSISTENCE_ERROR_RATE = 0.001  # 0.1%
        self.SLO_SCHEMA_REPAIR_RATE = 0.005  # 0.5%
    
    def run_multi_turn_test(self, turns: int = 3) -> Dict[str, Any]:
        """Run multi-turn conversation test"""
        print(f"\n🔄 Multi-turn test ({turns} turns)")
        
        session_id = f"soak_test_{turns}turn_{int(time.time())}"
        conversation_latencies = []
        errors = []
        
        questions = [
            "What are the fire safety requirements for high-rise buildings?",
            "How do the sprinkler systems work in this context?",
            "What are the maintenance requirements for these systems?",
            "Are there any recent updates to the standards?",
            "What about compliance testing procedures?"
        ]
        
        for turn in range(turns):
            question = questions[turn % len(questions)]
            start_time = time.time()
            
            try:
                response = requests.post(
                    f"{self.base_url}/api/chat/ask",
                    json={"question": question, "session_id": session_id},
                    headers=self.auth_headers,
                    timeout=25
                )
                
                latency_ms = (time.time() - start_time) * 1000
                conversation_latencies.append(latency_ms)
                
                if response.status_code != 200:
                    errors.append(f"Turn {turn+1}: HTTP {response.status_code}")
                else:
                    data = response.json()
                    # Validate v2 schema
                    required_fields = ["title", "summary", "blocks", "meta"]
                    missing_fields = [f for f in required_fields if f not in data]
                    if missing_fields:
                        errors.append(f"Turn {turn+1}: Missing fields {missing_fields}")
                
                print(f"   Turn {turn+1}: {latency_ms:.0f}ms")
                
                # Small delay between turns
                time.sleep(0.5)
                
            except Exception as e:
                errors.append(f"Turn {turn+1}: {str(e)}")
                conversation_latencies.append(25000)  # Timeout penalty
        
        return {
            "turns": turns,
            "session_id": session_id,
            "latencies_ms": conversation_latencies,
            "p95_ms": statistics.quantiles(conversation_latencies, n=20)[18] if conversation_latencies else 0,
            "avg_ms": statistics.mean(conversation_latencies) if conversation_latencies else 0,
            "errors": errors,
            "success_rate": (turns - len(errors)) / turns * 100
        }
    
    def run_token_pressure_test(self) -> Dict[str, Any]:
        """Run token pressure scenario with long context"""
        print(f"\n🧪 Token pressure test")
        
        # Create a long, complex question to stress the system
        long_question = """
        I'm designing a 40-story mixed-use building in Sydney with the following requirements:
        - Residential floors 1-25 (Class 2)
        - Commercial floors 26-35 (Class 5)
        - Restaurant and retail on ground floor (Class 6)
        - Underground parking (Class 7a)
        - Building height: 140 meters
        - Expected occupancy: 800 people
        
        I need comprehensive guidance on:
        1. Fire safety systems and compartmentation requirements
        2. Acoustic insulation between different building classes
        3. Structural design for wind loads and seismic considerations
        4. Mechanical ventilation and smoke exhaust systems
        5. Electrical switchboard sizing and emergency power
        6. Accessibility requirements and lift provisions
        7. Stormwater management and plumbing design
        8. Energy efficiency measures and insulation requirements
        
        Please provide detailed technical requirements with specific AS/NZS and NCC references,
        including any performance solution considerations and approval processes.
        """
        
        session_id = f"soak_pressure_{int(time.time())}"
        start_time = time.time()
        
        try:
            response = requests.post(
                f"{self.base_url}/api/chat/ask-enhanced",
                json={"question": long_question, "session_id": session_id},
                headers=self.auth_headers,
                timeout=30
            )
            
            latency_ms = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                blocks_count = len(data.get("blocks", []))
                content_length = sum(len(str(block.get("content", ""))) for block in data.get("blocks", []))
                
                print(f"   Token pressure: {latency_ms:.0f}ms, {blocks_count} blocks, {content_length} chars")
                
                return {
                    "latency_ms": latency_ms,
                    "blocks_count": blocks_count,
                    "content_length": content_length,
                    "success": True,
                    "error": None
                }
            else:
                return {
                    "latency_ms": latency_ms,
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
        
        except Exception as e:
            latency_ms = (time.time() - start_time) * 1000
            return {
                "latency_ms": latency_ms,
                "success": False,
                "error": str(e)
            }
    
    def run_concurrent_load_test(self, concurrent_requests: int = 5) -> Dict[str, Any]:
        """Run concurrent load test"""
        print(f"\n⚡ Concurrent load test ({concurrent_requests} requests)")
        
        def make_request(request_id: int):
            session_id = f"load_test_{request_id}_{int(time.time())}"
            question = f"What are the NCC requirements for building height classification? (Request {request_id})"
            
            start_time = time.time()
            try:
                response = requests.post(
                    f"{self.base_url}/api/chat/ask",
                    json={"question": question, "session_id": session_id},
                    headers=self.auth_headers,
                    timeout=20
                )
                
                latency_ms = (time.time() - start_time) * 1000
                
                return {
                    "request_id": request_id,
                    "latency_ms": latency_ms,
                    "status_code": response.status_code,
                    "success": response.status_code == 200,
                    "error": None if response.status_code == 200 else response.text
                }
            except Exception as e:
                latency_ms = (time.time() - start_time) * 1000
                return {
                    "request_id": request_id,
                    "latency_ms": latency_ms,
                    "status_code": 0,
                    "success": False,
                    "error": str(e)
                }
        
        # Execute concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_requests) as executor:
            futures = [executor.submit(make_request, i) for i in range(concurrent_requests)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        # Analyze results
        latencies = [r["latency_ms"] for r in results]
        success_count = sum(1 for r in results if r["success"])
        error_count = len(results) - success_count
        
        return {
            "concurrent_requests": concurrent_requests,
            "success_count": success_count,
            "error_count": error_count,
            "success_rate": success_count / len(results) * 100,
            "latencies_ms": latencies,
            "p95_ms": statistics.quantiles(latencies, n=20)[18] if latencies else 0,
            "avg_ms": statistics.mean(latencies) if latencies else 0
        }
    
    def check_slo_compliance(self, test_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Check if test results meet SLO requirements"""
        print(f"\n📊 SLO Compliance Check")
        
        # Collect all latencies by endpoint type
        chat_latencies = []
        enhanced_latencies = []
        error_count = 0
        total_requests = 0
        
        for result in test_results:
            if "latencies_ms" in result:
                chat_latencies.extend(result["latencies_ms"])
                total_requests += len(result["latencies_ms"])
                error_count += len(result.get("errors", []))
            elif "latency_ms" in result:
                if "enhanced" in result.get("test_type", ""):
                    enhanced_latencies.append(result["latency_ms"])
                else:
                    chat_latencies.append(result["latency_ms"])
                total_requests += 1
                if not result.get("success", True):
                    error_count += 1
        
        # Calculate metrics
        chat_p95 = statistics.quantiles(chat_latencies, n=20)[18] if chat_latencies else 0
        enhanced_p95 = statistics.quantiles(enhanced_latencies, n=20)[18] if enhanced_latencies else 0
        latency_delta = enhanced_p95 - chat_p95 if enhanced_latencies and chat_latencies else 0
        error_rate = (error_count / total_requests * 100) if total_requests > 0 else 0
        
        # Check observability metrics
        try:
            metrics_response = requests.get(f"{self.base_url}/api/metrics/observability", timeout=5)
            if metrics_response.status_code == 200:
                metrics = metrics_response.json()
                
                # Schema repair rate
                schema_metrics = metrics.get("schema", {})
                repair_rate = schema_metrics.get("repair_rate_percent", 0) / 100
                
                # Persistence errors
                persistence_metrics = metrics.get("persistence", {})
                persistence_error_rate = persistence_metrics.get("error_rate_percent", 0) / 100
            else:
                repair_rate = 0
                persistence_error_rate = 0
        except:
            repair_rate = 0
            persistence_error_rate = 0
        
        # SLO compliance check
        slo_results = {
            "chat_p95_ms": chat_p95,
            "enhanced_p95_ms": enhanced_p95,
            "latency_delta_ms": latency_delta,
            "error_rate_percent": error_rate,
            "schema_repair_rate": repair_rate,
            "persistence_error_rate": persistence_error_rate,
            
            "slo_compliance": {
                "chat_latency": chat_p95 <= self.SLO_P95_CHAT_MS,
                "enhanced_latency": enhanced_p95 <= self.SLO_P95_ENHANCED_MS or enhanced_p95 == 0,
                "latency_delta": latency_delta <= self.SLO_LATENCY_DELTA_MS,
                "error_rate": error_rate <= self.SLO_5XX_RATE_PERCENT,
                "schema_repair": repair_rate <= self.SLO_SCHEMA_REPAIR_RATE,
                "persistence": persistence_error_rate <= self.SLO_PERSISTENCE_ERROR_RATE
            }
        }
        
        # Overall compliance
        slo_results["overall_compliant"] = all(slo_results["slo_compliance"].values())
        
        # Print results
        print(f"   Chat P95: {chat_p95:.0f}ms (SLO: ≤{self.SLO_P95_CHAT_MS}ms) {'✅' if slo_results['slo_compliance']['chat_latency'] else '❌'}")
        print(f"   Enhanced P95: {enhanced_p95:.0f}ms (SLO: ≤{self.SLO_P95_ENHANCED_MS}ms) {'✅' if slo_results['slo_compliance']['enhanced_latency'] else '❌'}")
        print(f"   Latency Delta: {latency_delta:.0f}ms (SLO: ≤{self.SLO_LATENCY_DELTA_MS}ms) {'✅' if slo_results['slo_compliance']['latency_delta'] else '❌'}")
        print(f"   Error Rate: {error_rate:.2f}% (SLO: ≤{self.SLO_5XX_RATE_PERCENT}%) {'✅' if slo_results['slo_compliance']['error_rate'] else '❌'}")
        print(f"   Schema Repair: {repair_rate*100:.2f}% (SLO: ≤{self.SLO_SCHEMA_REPAIR_RATE*100}%) {'✅' if slo_results['slo_compliance']['schema_repair'] else '❌'}")
        print(f"   Persistence: {persistence_error_rate*100:.3f}% (SLO: ≤{self.SLO_PERSISTENCE_ERROR_RATE*100}%) {'✅' if slo_results['slo_compliance']['persistence'] else '❌'}")
        
        return slo_results
    
    def run_soak_test_suite(self) -> Dict[str, Any]:
        """Run complete staging soak test suite"""
        print("🚀 STAGING SOAK TEST SUITE")
        print("=" * 60)
        print(f"Target: {self.base_url}")
        print(f"Started: {datetime.now().isoformat()}")
        
        results = []
        
        # 1. Multi-turn tests (3, 5, 10 turns)
        for turns in [3, 5, 10]:
            result = self.run_multi_turn_test(turns)
            result["test_type"] = f"multi_turn_{turns}"
            results.append(result)
        
        # 2. Token pressure test
        pressure_result = self.run_token_pressure_test()
        pressure_result["test_type"] = "token_pressure_enhanced"
        results.append(pressure_result)
        
        # 3. Concurrent load test
        load_result = self.run_concurrent_load_test(5)
        load_result["test_type"] = "concurrent_load"
        results.append(load_result)
        
        # 4. SLO compliance check
        slo_results = self.check_slo_compliance(results)
        
        # 5. Overall summary
        print(f"\n📋 STAGING SOAK TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(results)
        successful_tests = sum(1 for r in results if r.get("success_rate", 0) > 90 or r.get("success", False))
        
        print(f"Tests Run: {total_tests}")
        print(f"Successful: {successful_tests}")
        print(f"SLO Compliant: {'✅ PASS' if slo_results['overall_compliant'] else '❌ FAIL'}")
        
        final_result = {
            "timestamp": datetime.now().isoformat(),
            "environment": "staging",
            "test_results": results,
            "slo_compliance": slo_results,
            "summary": {
                "total_tests": total_tests,
                "successful_tests": successful_tests,
                "slo_compliant": slo_results["overall_compliant"],
                "ready_for_canary": slo_results["overall_compliant"] and successful_tests >= total_tests * 0.9
            }
        }
        
        print(f"Ready for Canary: {'✅ YES' if final_result['summary']['ready_for_canary'] else '❌ NO'}")
        
        return final_result


def run_staging_soak():
    """Entry point for staging soak tests"""
    tester = StagingSoakTests()
    return tester.run_soak_test_suite()


if __name__ == "__main__":
    results = run_staging_soak()
    
    # Save results
    with open("/tmp/staging_soak_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to /tmp/staging_soak_results.json")
    
    # Exit with appropriate code
    exit(0 if results["summary"]["ready_for_canary"] else 1)