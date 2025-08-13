"""
Health check endpoints for Kubernetes probes and diagnostics
Implements BUILD MASTER DIRECTIVE requirements
"""
import os
import json
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

# Build metadata from environment
BUILD_SHA = os.environ.get('GIT_SHA', 'unknown')
BUILT_AT = os.environ.get('BUILT_AT', 'unknown') 
VERSION = os.environ.get('VERSION', '1.0.0')

@router.get("/health")
async def health_check():
    """Kubernetes liveness probe"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "onesource-ai-backend"
    }

@router.get("/readyz") 
async def readiness_check():
    """Kubernetes readiness probe with dependency checks"""
    try:
        # Check Redis connection
        import redis
        redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379')
        r = redis.from_url(redis_url)
        r.ping()
        redis_status = "healthy"
    except Exception as e:
        redis_status = f"unhealthy: {str(e)}"
    
    # Check OpenAI key presence  
    openai_key = os.environ.get('OPENAI_API_KEY', '')
    openai_status = "configured" if openai_key else "missing"
    
    is_ready = redis_status == "healthy" and openai_status == "configured"
    
    return JSONResponse(
        status_code=200 if is_ready else 503,
        content={
            "status": "ready" if is_ready else "not_ready",
            "checks": {
                "redis": redis_status,
                "openai": openai_status
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@router.get("/version")
async def version_info():
    """Build metadata and feature flags"""
    return {
        "version": VERSION,
        "builtAt": BUILT_AT,
        "commitSha": BUILD_SHA,
        "commitUrl": f"https://github.com/onesource-ai/app/commit/{BUILD_SHA}" if BUILD_SHA != 'unknown' else None,
        "flags": {
            "USE_V2_SCHEMA": os.environ.get('USE_V2_SCHEMA', 'true') == 'true',
            "REDIS_ENABLED": bool(os.environ.get('REDIS_URL')),
            "OPENAI_CONFIGURED": bool(os.environ.get('OPENAI_API_KEY'))
        }
    }

@router.get("/config") 
async def config_info():
    """Runtime configuration for debugging"""
    return {
        "ok": True,
        "flags": {
            "USE_V2_SCHEMA": os.environ.get('USE_V2_SCHEMA', 'true'),
            "THEME_VERSION": os.environ.get('THEME_VERSION', '2'), 
            "REDIS_URL": bool(os.environ.get('REDIS_URL')),
            "OPENAI_API_KEY": bool(os.environ.get('OPENAI_API_KEY'))
        },
        "environment": os.environ.get('ENVIRONMENT', 'development'),
        "timestamp": datetime.utcnow().isoformat()
    }