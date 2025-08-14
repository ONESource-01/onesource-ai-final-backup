"""
Health check endpoints for Kubernetes probes and diagnostics
Implements BUILD MASTER DIRECTIVE requirements
"""
import os
import sys
import json
import hashlib
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter()

# Build metadata from environment
BUILD_SHA = os.environ.get('GIT_SHA', 'unknown')
BUILT_AT = os.environ.get('BUILT_AT', 'unknown') 
VERSION = os.environ.get('VERSION', '1.0.0')

# V2 Prompt loading at startup
V2_PROMPT_PATH = os.environ.get('V2_PROMPT_PATH', '/app/prompts/v2_system_prompt.txt')
V2_PROMPT_CONTENT = None
V2_PROMPT_BYTES = 0
V2_PROMPT_SHA256 = ""

def load_v2_prompt():
    """Load V2 system prompt at startup with validation"""
    global V2_PROMPT_CONTENT, V2_PROMPT_BYTES, V2_PROMPT_SHA256
    
    try:
        if not os.path.exists(V2_PROMPT_PATH):
            raise FileNotFoundError(f"V2 prompt file not found: {V2_PROMPT_PATH}")
        
        with open(V2_PROMPT_PATH, 'r', encoding='utf-8') as f:
            V2_PROMPT_CONTENT = f.read()
        
        V2_PROMPT_BYTES = len(V2_PROMPT_CONTENT.encode('utf-8'))
        V2_PROMPT_SHA256 = hashlib.sha256(V2_PROMPT_CONTENT.encode('utf-8')).hexdigest()
        
        # Validate minimum size (ensure it's not empty or stub)
        if V2_PROMPT_BYTES < 2000:
            raise ValueError(f"V2 prompt too small ({V2_PROMPT_BYTES} bytes) - minimum 2000 bytes required")
        
        print(f"[boot] V2 prompt loaded: {V2_PROMPT_BYTES} bytes from {V2_PROMPT_PATH}")
        print(f"[boot] SHA256: {V2_PROMPT_SHA256[:16]}...")
        
        # Set environment variables for runtime access
        os.environ['V2_PROMPT_BYTES'] = str(V2_PROMPT_BYTES)
        os.environ['V2_PROMPT_SHA256'] = V2_PROMPT_SHA256
        
        return V2_PROMPT_CONTENT
        
    except Exception as e:
        print(f"[boot] FATAL: Failed to load V2 prompt: {e}")
        raise SystemExit(1)

# Load prompt at module import (startup)
load_v2_prompt()

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
    
    # Check V2 prompt loaded
    prompt_status = "loaded" if V2_PROMPT_CONTENT else "missing"
    
    is_ready = (redis_status == "healthy" and 
               openai_status == "configured" and 
               prompt_status == "loaded")
    
    return JSONResponse(
        status_code=200 if is_ready else 503,
        content={
            "status": "ready" if is_ready else "not_ready",
            "checks": {
                "redis": redis_status,
                "openai": openai_status,
                "v2_prompt": prompt_status
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@router.get("/version")
async def version_info():
    """Build metadata and feature flags with runtime info"""
    return {
        "version": BUILD_SHA,  # Use commit SHA as version
        "builtAt": BUILT_AT,
        "commitSha": BUILD_SHA,
        "commitUrl": f"https://github.com/onesource-ai/app/commit/{BUILD_SHA}" if BUILD_SHA != 'unknown' else None,
        "flags": {
            "USE_V2_SCHEMA": os.environ.get('USE_V2_SCHEMA', 'true') == 'true',
            "REDIS_ENABLED": bool(os.environ.get('REDIS_URL')),
            "OPENAI_CONFIGURED": bool(os.environ.get('OPENAI_API_KEY')),
            "V2_PROMPT_LOADED": bool(V2_PROMPT_CONTENT)
        },
        "prompt": {
            "path": "prompts/v2_system_prompt.txt",
            "bytes": int(os.environ.get('V2_PROMPT_BYTES', 0))
        },
        "runtime": {
            "python": f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
            "redisEnabled": bool(os.environ.get('REDIS_URL')),
            "environment": os.environ.get('ENVIRONMENT', 'development')
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
            "OPENAI_API_KEY": bool(os.environ.get('OPENAI_API_KEY')),
            "V2_PROMPT_LOADED": bool(V2_PROMPT_CONTENT)
        },
        "environment": os.environ.get('ENVIRONMENT', 'development'),
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/prompt-info")
async def prompt_info():
    """V2 system prompt metadata (no content)"""
    if not V2_PROMPT_CONTENT:
        raise HTTPException(status_code=503, detail="V2 prompt not loaded")
    
    return {
        "ok": True,
        "path": V2_PROMPT_PATH,
        "bytes": V2_PROMPT_BYTES,
        "sha256": V2_PROMPT_SHA256,
        "lastModified": os.path.getmtime(V2_PROMPT_PATH) if os.path.exists(V2_PROMPT_PATH) else None,
        "version": BUILD_SHA,
        "loadedAt": datetime.utcnow().isoformat()
    }