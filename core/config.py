"""
Phase 4: Feature Flags & Configuration Matrix
Production-ready configuration management with environment variables and feature flags
"""

import os
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class ProductionConfig:
    """Production configuration with feature flags and environment variables"""
    
    # Feature Flags
    USE_UNIFIED_PIPELINE = os.getenv("USE_UNIFIED_PIPELINE", "1") == "1"
    CONV_STORE_PRIMARY = os.getenv("CONV_STORE_PRIMARY", "redis")  # redis|mongo
    CONV_DUAL_WRITE = os.getenv("CONV_DUAL_WRITE", "0") == "1"  # 0|1 (forensic periods)
    FEATURE_DYNAMIC_PROMPTS = os.getenv("FEATURE_DYNAMIC_PROMPTS", "0") == "1"  # Phase 3
    FEATURE_SUGGESTED_ACTIONS = os.getenv("FEATURE_SUGGESTED_ACTIONS", "0") == "1"  # Phase 3
    
    # Environment Configuration
    CONV_TTL_SECONDS = int(os.getenv("CONV_TTL_SECONDS", "2592000"))  # 30 days
    CONV_MAX_TURNS = int(os.getenv("CONV_MAX_TURNS", "16"))
    SCHEMA_REPAIR_RATE_ALERT = float(os.getenv("SCHEMA_REPAIR_RATE_ALERT", "0.005"))  # 0.5%
    REDIS_SOCKET_TIMEOUT_MS = int(os.getenv("REDIS_SOCKET_TIMEOUT_MS", "200"))
    REDIS_CONNECT_TIMEOUT_MS = int(os.getenv("REDIS_CONNECT_TIMEOUT_MS", "100"))
    LLM_TIMEOUT_MS = int(os.getenv("LLM_TIMEOUT_MS", "20000"))  # 20 seconds
    RENDER_P95_BUDGET_MS = int(os.getenv("RENDER_P95_BUDGET_MS", "150"))
    
    # Build Information
    GIT_COMMIT = os.getenv("GIT_COMMIT", "unknown")
    BUILD_TIME = os.getenv("BUILD_TIME", "unknown")
    SCHEMA_VERSION = "2.0.0"
    
    # Security & Rate Limiting
    RATE_LIMIT_PER_USER = int(os.getenv("RATE_LIMIT_PER_USER", "30"))  # 30 req/min/user
    LOG_REDACTION_ENABLED = os.getenv("LOG_REDACTION_ENABLED", "1") == "1"
    
    # Environment Detection
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")  # development|staging|production
    
    @classmethod
    def get_config_summary(cls) -> Dict[str, Any]:
        """Get configuration summary for debugging (safe for logs)"""
        return {
            "environment": cls.ENVIRONMENT,
            "feature_flags": {
                "unified_pipeline": cls.USE_UNIFIED_PIPELINE,
                "conv_store_primary": cls.CONV_STORE_PRIMARY,
                "conv_dual_write": cls.CONV_DUAL_WRITE,
                "dynamic_prompts": cls.FEATURE_DYNAMIC_PROMPTS,
                "suggested_actions": cls.FEATURE_SUGGESTED_ACTIONS
            },
            "timeouts": {
                "conv_ttl_seconds": cls.CONV_TTL_SECONDS,
                "conv_max_turns": cls.CONV_MAX_TURNS,
                "redis_socket_timeout_ms": cls.REDIS_SOCKET_TIMEOUT_MS,
                "llm_timeout_ms": cls.LLM_TIMEOUT_MS,
                "render_p95_budget_ms": cls.RENDER_P95_BUDGET_MS
            },
            "version": {
                "git_commit": cls.GIT_COMMIT[:8] if cls.GIT_COMMIT != "unknown" else "unknown",
                "schema_version": cls.SCHEMA_VERSION
            }
        }
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate configuration for production readiness"""
        issues = []
        
        # Validate conversation store
        if cls.CONV_STORE_PRIMARY not in ["redis", "mongo"]:
            issues.append(f"Invalid CONV_STORE_PRIMARY: {cls.CONV_STORE_PRIMARY}")
        
        # Validate timeouts
        if cls.LLM_TIMEOUT_MS < 5000:
            issues.append(f"LLM_TIMEOUT_MS too low: {cls.LLM_TIMEOUT_MS}ms")
        
        if cls.CONV_TTL_SECONDS < 86400:  # 1 day minimum
            issues.append(f"CONV_TTL_SECONDS too low: {cls.CONV_TTL_SECONDS}s")
        
        # Validate alert thresholds
        if cls.SCHEMA_REPAIR_RATE_ALERT > 0.1:  # 10% max
            issues.append(f"SCHEMA_REPAIR_RATE_ALERT too high: {cls.SCHEMA_REPAIR_RATE_ALERT}")
        
        if issues:
            logger.error(f"Configuration validation failed: {issues}")
            return False
        
        logger.info("Configuration validation passed")
        return True

# Global config instance
config = ProductionConfig()