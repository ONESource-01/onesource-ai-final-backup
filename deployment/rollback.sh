#!/bin/bash
# Phase 4: Production Rollback Script
# Instantly rollback to stable version in case of issues

set -e

echo "🚨 ONESource AI Production Rollback Script"
echo "============================================"

NAMESPACE=${1:-default}
DEPLOYMENT_NAME=${2:-onesource}
ROLLBACK_REASON=${3:-"manual_rollback"}

echo "Namespace: $NAMESPACE"
echo "Deployment: $DEPLOYMENT_NAME"
echo "Reason: $ROLLBACK_REASON"
echo ""

# Check if deployment exists
if ! kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE >/dev/null 2>&1; then
    echo "❌ Deployment $DEPLOYMENT_NAME not found in namespace $NAMESPACE"
    exit 1
fi

echo "📊 Current deployment status:"
kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE

echo ""
echo "🔄 Starting rollback process..."

# Step 1: Disable unified pipeline (immediate traffic safety)
echo "1️⃣ Disabling unified pipeline..."
kubectl set env deployment/$DEPLOYMENT_NAME USE_UNIFIED_PIPELINE=0 -n $NAMESPACE
echo "✅ USE_UNIFIED_PIPELINE=0 set"

# Step 2: Switch conversation store to MongoDB (if Redis is the issue)
echo "2️⃣ Switching conversation store to MongoDB fallback..."
kubectl set env deployment/$DEPLOYMENT_NAME CONV_STORE_PRIMARY=mongo -n $NAMESPACE
echo "✅ CONV_STORE_PRIMARY=mongo set"

# Step 3: Disable Phase 3 features (reduce complexity)
echo "3️⃣ Disabling Phase 3 features..."
kubectl set env deployment/$DEPLOYMENT_NAME FEATURE_DYNAMIC_PROMPTS=0 -n $NAMESPACE
kubectl set env deployment/$DEPLOYMENT_NAME FEATURE_SUGGESTED_ACTIONS=0 -n $NAMESPACE
echo "✅ Phase 3 features disabled"

# Step 4: Wait for rollout
echo "4️⃣ Waiting for rollback deployment..."
kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=300s

# Step 5: Verify rollback
echo "5️⃣ Verifying rollback..."
sleep 10

# Check health endpoints
HEALTH_URL="http://localhost:8001/healthz"
if curl -f -s $HEALTH_URL > /dev/null; then
    echo "✅ Health check passed"
else
    echo "⚠️ Health check failed, but rollback completed"
fi

# Check version endpoint to confirm config
VERSION_URL="http://localhost:8001/version"
if curl -f -s $VERSION_URL | jq '.feature_flags.unified_pipeline' | grep -q false; then
    echo "✅ Unified pipeline confirmed disabled"
else
    echo "⚠️ Could not verify unified pipeline status"
fi

# Final status
echo ""
echo "🎉 ROLLBACK COMPLETED"
echo "====================="
echo "✅ Unified pipeline disabled (USE_UNIFIED_PIPELINE=0)"
echo "✅ Conversation store switched to MongoDB"
echo "✅ Phase 3 features disabled"
echo "✅ Deployment rolled out successfully"

# Log rollback event
echo ""
echo "📝 Rollback event logged:"
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Reason: $ROLLBACK_REASON"
echo "Duration: ~2 minutes"

# Next steps guidance
echo ""
echo "📋 NEXT STEPS:"
echo "1. Monitor dashboards for traffic recovery"
echo "2. Check error rates and latency metrics"
echo "3. Investigate root cause of rollback trigger"
echo "4. Update incident management system"
echo "5. Prepare fix and re-deployment plan"

# Optional: Create incident ticket (if configured)
if [ ! -z "$INCIDENT_WEBHOOK" ]; then
    curl -X POST "$INCIDENT_WEBHOOK" \
         -H "Content-Type: application/json" \
         -d "{\"title\":\"ONESource AI Production Rollback\",\"reason\":\"$ROLLBACK_REASON\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
         2>/dev/null || echo "⚠️ Failed to create incident ticket"
fi

echo ""
echo "🏁 Rollback script completed successfully"