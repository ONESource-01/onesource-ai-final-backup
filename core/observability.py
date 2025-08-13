"""
Schema Phase Observability - Dashboards, Alerts, and Structured Logging
Production-ready monitoring for schema validation and persistence systems
"""

import time
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
import hashlib
import redis

# Structured logging setup
logger = logging.getLogger(__name__)

@dataclass
class RequestMetrics:
    """Structured metrics for each request"""
    endpoint: str
    tier: str
    session_id: str
    msg_count_before: int
    msg_count_after: int
    has_knowledge: bool
    prompt_hash: str
    repair_reason: Optional[str]
    latency_ms: float
    timestamp: str
    
    def to_log_dict(self) -> Dict[str, Any]:
        """Convert to PII-safe logging dictionary"""
        return {
            "endpoint": self.endpoint,
            "tier": self.tier,
            "session_id_hash": hashlib.sha256(self.session_id.encode()).hexdigest()[:8],  # PII-safe
            "msg_count_before": self.msg_count_before,
            "msg_count_after": self.msg_count_after,
            "has_knowledge": self.has_knowledge,
            "prompt_hash": self.prompt_hash[:8],  # Truncated hash for debugging
            "repair_reason": self.repair_reason,
            "latency_ms": round(self.latency_ms, 2),
            "timestamp": self.timestamp
        }


class SchemaObservability:
    """Schema validation and persistence observability system"""
    
    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.redis_client = redis_client or redis.Redis.from_url("redis://localhost:6379", decode_responses=True)
        self.metrics = {
            # Schema metrics
            "schema_responses_validated_total": 0,
            "schema_validation_failures": 0,
            "schema_repairs_total": 0,
            "schema_repair_reasons": {},
            
            # Persistence metrics
            "persistence_errors": 0,
            "persistence_success": 0,
            
            # Latency metrics
            "latency_regular_p50": 0.0,
            "latency_regular_p95": 0.0,
            "latency_regular_p99": 0.0,
            "latency_enhanced_p50": 0.0,
            "latency_enhanced_p95": 0.0,
            "latency_enhanced_p99": 0.0,
            
            # Request tracking
            "request_count": 0,
            "start_time": time.time(),
            
            # Phase 3 metrics: Dynamic Prompts & Suggestions
            "examples_served_total": 0,
            "example_clicks_total": 0,
            "suggested_action_clicks_total": 0,
            "examples_dismissed_total": 0,
            "example_ctr_by_topic": {},  # Click-through rate by topic
            "suggested_action_ctr": {},  # CTR for suggested actions
        }
        
        # Latency buckets for percentile calculation
        self.latency_regular = []
        self.latency_enhanced = []
        
    def log_request_metrics(self, metrics: RequestMetrics):
        """Log structured request metrics"""
        logger.info("request_metrics", extra=metrics.to_log_dict())
        
        # Update counters
        self.metrics["request_count"] += 1
        
        # Track latency by endpoint
        if "ask-enhanced" in metrics.endpoint:
            self.latency_enhanced.append(metrics.latency_ms)
            # Keep only last 1000 measurements for memory efficiency
            if len(self.latency_enhanced) > 1000:
                self.latency_enhanced = self.latency_enhanced[-1000:]
        else:
            self.latency_regular.append(metrics.latency_ms)
            if len(self.latency_regular) > 1000:
                self.latency_regular = self.latency_regular[-1000:]
    
    def record_schema_validation(self, success: bool, repair_reason: Optional[str] = None):
        """Record schema validation result"""
        self.metrics["schema_responses_validated_total"] += 1
        
        if not success:
            self.metrics["schema_validation_failures"] += 1
        
        if repair_reason:
            self.metrics["schema_repairs_total"] += 1
            if repair_reason in self.metrics["schema_repair_reasons"]:
                self.metrics["schema_repair_reasons"][repair_reason] += 1
            else:
                self.metrics["schema_repair_reasons"][repair_reason] = 1
    
    def record_persistence_result(self, success: bool):
        """Record persistence operation result"""
        if success:
            self.metrics["persistence_success"] += 1
        else:
            self.metrics["persistence_errors"] += 1
    
    def record_examples_served(self, count: int, topics: List[str]):
        """Record examples served to users"""
        self.metrics["examples_served_total"] += count
        
        # Track by topic for CTR calculation
        for topic in topics:
            if topic not in self.metrics["example_ctr_by_topic"]:
                self.metrics["example_ctr_by_topic"][topic] = {"served": 0, "clicked": 0}
            self.metrics["example_ctr_by_topic"][topic]["served"] += 1
    
    def record_example_click(self, example_text: str, topic: Optional[str] = None):
        """Record when user clicks an example question"""
        self.metrics["example_clicks_total"] += 1
        
        if topic and topic in self.metrics["example_ctr_by_topic"]:
            self.metrics["example_ctr_by_topic"][topic]["clicked"] += 1
    
    def record_suggested_action_click(self, label: str, topic: Optional[str] = None):
        """Record when user clicks a suggested action"""
        self.metrics["suggested_action_clicks_total"] += 1
        
        # Track CTR for suggested actions
        action_key = f"{topic}:{label}" if topic else label
        if action_key not in self.metrics["suggested_action_ctr"]:
            self.metrics["suggested_action_ctr"][action_key] = {"shown": 0, "clicked": 0}
        self.metrics["suggested_action_ctr"][action_key]["clicked"] += 1
    
    def record_suggested_action_shown(self, label: str, topic: Optional[str] = None):
        """Record when a suggested action is shown to user"""
        action_key = f"{topic}:{label}" if topic else label
        if action_key not in self.metrics["suggested_action_ctr"]:
            self.metrics["suggested_action_ctr"][action_key] = {"shown": 0, "clicked": 0}
        self.metrics["suggested_action_ctr"][action_key]["shown"] += 1
    
    def record_examples_dismissed(self, reason: str):
        """Record when examples are dismissed"""
        self.metrics["examples_dismissed_total"] += 1
    
    def calculate_percentiles(self, data: list, percentiles: list) -> Dict[str, float]:
        """Calculate percentiles from latency data"""
        if not data:
            return {f"p{p}": 0.0 for p in percentiles}
        
        sorted_data = sorted(data)
        n = len(sorted_data)
        
        result = {}
        for p in percentiles:
            index = int((p / 100.0) * (n - 1))
            result[f"p{p}"] = sorted_data[index]
        
        return result
    
    def get_dashboard_metrics(self) -> Dict[str, Any]:
        """Get comprehensive dashboard metrics"""
        # Calculate percentiles
        regular_percentiles = self.calculate_percentiles(self.latency_regular, [50, 95, 99])
        enhanced_percentiles = self.calculate_percentiles(self.latency_enhanced, [50, 95, 99])
        
        # Calculate rates
        uptime_seconds = time.time() - self.metrics["start_time"]
        validated_total = self.metrics["schema_responses_validated_total"]
        repair_rate = (self.metrics["schema_repairs_total"] / validated_total * 100) if validated_total > 0 else 0
        persistence_error_rate = (self.metrics["persistence_errors"] / (self.metrics["persistence_errors"] + self.metrics["persistence_success"]) * 100) if (self.metrics["persistence_errors"] + self.metrics["persistence_success"]) > 0 else 0
        
        # Calculate latency delta
        latency_delta_p95 = enhanced_percentiles["p95"] - regular_percentiles["p95"]
        
        # Calculate CTR metrics
        example_ctr_data = {}
        overall_example_ctr = 0
        if self.metrics["examples_served_total"] > 0:
            overall_example_ctr = (self.metrics["example_clicks_total"] / self.metrics["examples_served_total"]) * 100
        
        for topic, data in self.metrics["example_ctr_by_topic"].items():
            if data["served"] > 0:
                example_ctr_data[topic] = {
                    "served": data["served"],
                    "clicked": data["clicked"], 
                    "ctr_percent": (data["clicked"] / data["served"]) * 100
                }
        
        suggested_action_ctr_data = {}
        for action_key, data in self.metrics["suggested_action_ctr"].items():
            if data["shown"] > 0:
                suggested_action_ctr_data[action_key] = {
                    "shown": data["shown"],
                    "clicked": data["clicked"],
                    "ctr_percent": (data["clicked"] / data["shown"]) * 100
                }
        
        return {
            "timestamp": datetime.now().isoformat(),
            "uptime_seconds": round(uptime_seconds, 1),
            
            # Schema Dashboard
            "schema": {
                "responses_validated_total": validated_total,
                "schema_validation_failures": self.metrics["schema_validation_failures"],
                "schema_repairs_total": self.metrics["schema_repairs_total"],
                "repair_rate_percent": round(repair_rate, 2),
                "repair_reasons": self.metrics["schema_repair_reasons"],
                "is_repair_rate_acceptable": repair_rate <= 0.5  # DoD criteria
            },
            
            # Persistence Dashboard
            "persistence": {
                "persistence_errors": self.metrics["persistence_errors"],
                "persistence_success": self.metrics["persistence_success"],
                "error_rate_percent": round(persistence_error_rate, 3),
                "is_error_rate_acceptable": persistence_error_rate < 0.1  # DoD criteria
            },
            
            # Latency Dashboard
            "latency": {
                "regular": {
                    "p50_ms": round(regular_percentiles["p50"], 2),
                    "p95_ms": round(regular_percentiles["p95"], 2),
                    "p99_ms": round(regular_percentiles["p99"], 2)
                },
                "enhanced": {
                    "p50_ms": round(enhanced_percentiles["p50"], 2),
                    "p95_ms": round(enhanced_percentiles["p95"], 2),
                    "p99_ms": round(enhanced_percentiles["p99"], 2)
                },
                "delta": {
                    "p95_ms": round(latency_delta_p95, 2),
                    "is_acceptable": latency_delta_p95 < 100  # DoD criteria
                }
            },
            
            # Alert Status
            "alerts": self.check_alert_conditions()
        }
    
    def check_alert_conditions(self) -> Dict[str, Any]:
        """Check all alert conditions"""
        alerts = {
            "SchemaFailuresHigh": False,
            "SchemaRepairsHigh": False,
            "PersistenceErrorsHigh": False,
            "LatencyDeltaHigh": False,
            "active_alerts": []
        }
        
        # SchemaFailuresHigh: any non-zero failures for 10m
        if self.metrics["schema_validation_failures"] > 0:
            alerts["SchemaFailuresHigh"] = True
            alerts["active_alerts"].append("SchemaFailuresHigh: Non-zero validation failures detected")
        
        # SchemaRepairsHigh: repair_rate > 0.5% over 24h
        validated_total = self.metrics["schema_responses_validated_total"]
        if validated_total > 0:
            repair_rate = (self.metrics["schema_repairs_total"] / validated_total * 100)
            if repair_rate > 0.5:
                alerts["SchemaRepairsHigh"] = True
                alerts["active_alerts"].append(f"SchemaRepairsHigh: Repair rate {repair_rate:.2f}% > 0.5%")
        
        # PersistenceErrorsHigh: rate > 0.1% for 10m
        total_persistence = self.metrics["persistence_errors"] + self.metrics["persistence_success"]
        if total_persistence > 0:
            error_rate = (self.metrics["persistence_errors"] / total_persistence * 100)
            if error_rate > 0.1:
                alerts["PersistenceErrorsHigh"] = True
                alerts["active_alerts"].append(f"PersistenceErrorsHigh: Error rate {error_rate:.3f}% > 0.1%")
        
        # LatencyDeltaHigh: p95 delta > 100ms for 15m
        if self.latency_regular and self.latency_enhanced:
            regular_p95 = self.calculate_percentiles(self.latency_regular, [95])["p95"]
            enhanced_p95 = self.calculate_percentiles(self.latency_enhanced, [95])["p95"]
            delta = enhanced_p95 - regular_p95
            
            if delta > 100:
                alerts["LatencyDeltaHigh"] = True
                alerts["active_alerts"].append(f"LatencyDeltaHigh: P95 delta {delta:.2f}ms > 100ms")
        
        return alerts


# Global observability instance
_observability = None

def get_observability() -> SchemaObservability:
    """Get global observability instance"""
    global _observability
    if _observability is None:
        _observability = SchemaObservability()
    return _observability

def record_request_metrics(endpoint: str, tier: str, session_id: str, 
                          msg_count_before: int, msg_count_after: int,
                          has_knowledge: bool, prompt_hash: str,
                          repair_reason: Optional[str], latency_ms: float):
    """Convenience function to record request metrics"""
    metrics = RequestMetrics(
        endpoint=endpoint,
        tier=tier,
        session_id=session_id,
        msg_count_before=msg_count_before,
        msg_count_after=msg_count_after,
        has_knowledge=has_knowledge,
        prompt_hash=prompt_hash,
        repair_reason=repair_reason,
        latency_ms=latency_ms,
        timestamp=datetime.now().isoformat()
    )
    
    get_observability().log_request_metrics(metrics)