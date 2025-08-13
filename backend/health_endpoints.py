"""
Phase 4: Health Check & Version Endpoints
Production-ready health monitoring and version information
"""

import os
import time
import redis
import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

from core.config import config
from core.stores.conversation_store import get_conversation_store

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/healthz")
async def liveness_probe():
    """
    Kubernetes liveness probe - basic application health
    Returns 200 if application is alive, 503 if dead
    """
    try:
        # Basic health check - can we respond?
        start_time = time.time()
        
        # Check critical imports work
        from core.chat_service import get_unified_chat_service
        from middleware.schema_guard import schema_guard
        
        response_time_ms = (time.time() - start_time) * 1000
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "response_time_ms": round(response_time_ms, 2),
            "version": config.SCHEMA_VERSION
        }
    except Exception as e:
        logger.error(f"Liveness probe failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@router.get("/readyz")
async def readiness_probe():
    """
    Kubernetes readiness probe - ready to serve traffic
    Returns 200 if ready, 503 if not ready
    """
    health_checks = {}
    overall_healthy = True
    
    try:
        # Check Redis connectivity (if using Redis)
        if config.CONV_STORE_PRIMARY == "redis":
            try:
                redis_client = redis.Redis.from_url("redis://localhost:6379", 
                                                  socket_timeout=config.REDIS_SOCKET_TIMEOUT_MS/1000,
                                                  socket_connect_timeout=config.REDIS_CONNECT_TIMEOUT_MS/1000)
                redis_client.ping()
                health_checks["redis"] = {"status": "healthy", "primary": True}
            except Exception as e:
                health_checks["redis"] = {"status": "unhealthy", "error": str(e), "primary": True}
                overall_healthy = False
        
        # Check conversation store
        try:
            store = get_conversation_store()
            # Quick test - try to get a non-existent conversation (should return empty list)
            test_result = store.get("healthcheck_test_session")
            health_checks["conversation_store"] = {"status": "healthy"}
        except Exception as e:
            health_checks["conversation_store"] = {"status": "unhealthy", "error": str(e)}
            overall_healthy = False
        
        # Check schema guard
        try:
            from middleware.schema_guard import validate_chat_response
            # Quick validation test
            test_response = {"title": "Test", "summary": "Test", "blocks": [], "meta": {"schema": "v2"}}
            validated, _ = validate_chat_response(test_response)
            health_checks["schema_guard"] = {"status": "healthy"}
        except Exception as e:
            health_checks["schema_guard"] = {"status": "unhealthy", "error": str(e)}
            # Schema guard issues are warnings, not blocking
        
        # Check environment configuration
        config_valid = config.validate_config()
        health_checks["configuration"] = {"status": "healthy" if config_valid else "warning"}
        
        if not overall_healthy:
            raise HTTPException(status_code=503, detail="Service not ready")
        
        return {
            "status": "ready",
            "timestamp": datetime.now().isoformat(),
            "health_checks": health_checks,
            "config": {
                "environment": config.ENVIRONMENT,
                "unified_pipeline": config.USE_UNIFIED_PIPELINE,
                "store_primary": config.CONV_STORE_PRIMARY
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Readiness probe failed: {e}")
        raise HTTPException(status_code=503, detail=f"Readiness check failed: {str(e)}")

@router.get("/version")
async def version_info():
    """
    Version information endpoint
    Returns build information, commit SHA, and schema version
    """
    return {
        "commit": config.GIT_COMMIT,
        "built_at": config.BUILD_TIME,
        "schema_version": config.SCHEMA_VERSION,
        "environment": config.ENVIRONMENT,
        "feature_flags": {
            "unified_pipeline": config.USE_UNIFIED_PIPELINE,
            "dynamic_prompts": config.FEATURE_DYNAMIC_PROMPTS,
            "suggested_actions": config.FEATURE_SUGGESTED_ACTIONS
        },
        "timestamp": datetime.now().isoformat()
    }

@router.get("/config")
async def config_info():
    """
    Configuration information endpoint (for staging/development)
    DO NOT EXPOSE IN PRODUCTION - contains internal configuration
    """
    if config.ENVIRONMENT == "production":
        raise HTTPException(status_code=404, detail="Not found")
    
    return config.get_config_summary()