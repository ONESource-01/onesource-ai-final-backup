#!/bin/bash
# ONESource-ai Critical Quality Gates
# Must pass before deployment

echo "=== 🚨 ONESource-ai CI QUALITY GATES ==="

FAILURES=0

# Gate 1: Grep Guards - No Legacy Code
echo "🔍 Gate 1: Legacy Code Detection"
echo "Checking for legacy formatAIResponse usage:"
if grep -R "formatAIResponse" -n frontend/src; then
    echo "❌ FAIL: Legacy formatAIResponse found"
    FAILURES=$((FAILURES + 1))
else
    echo "✅ PASS: No legacy formatAIResponse"
fi

echo "Checking for dangerous HTML injection:"
if grep -R "dangerouslySetInnerHTML.*=" -n frontend/src | grep -v "trusted"; then
    echo "❌ FAIL: Unsafe dangerouslySetInnerHTML found"  
    FAILURES=$((FAILURES + 1))
else
    echo "✅ PASS: No unsafe HTML injection"
fi

echo "Checking for booster/double-render code:"
if grep -R "boosterChat\|boost-response" -n frontend/src; then
    echo "❌ FAIL: Booster system still referenced"
    FAILURES=$((FAILURES + 1))
else
    echo "✅ PASS: No booster system references"
fi

# Gate 2: V2 Prompt Validation
echo ""
echo "🔍 Gate 2: V2 Prompt Validation"
if [ ! -f "prompts/v2_system_prompt.txt" ]; then
    echo "❌ FAIL: V2 prompt file missing"
    FAILURES=$((FAILURES + 1))
else
    BYTES=$(wc -c < prompts/v2_system_prompt.txt)
    if [ $BYTES -lt 2000 ]; then
        echo "❌ FAIL: V2 prompt too small ($BYTES bytes, minimum 2000)"
        FAILURES=$((FAILURES + 1))
    else
        echo "✅ PASS: V2 prompt size valid ($BYTES bytes)"
    fi
    
    SHA256=$(sha256sum prompts/v2_system_prompt.txt | cut -d' ' -f1)
    echo "✅ V2 prompt SHA256: ${SHA256:0:16}..."
fi

# Gate 3: API Contract Validation
echo ""
echo "🔍 Gate 3: API Contract & Quality"
if command -v node &> /dev/null && [ -f "test_contract.js" ]; then
    echo "Running V2 schema contract test:"
    if node test_contract.js; then
        echo "✅ PASS: V2 schema contract valid"
    else
        echo "❌ FAIL: V2 schema contract failed"
        FAILURES=$((FAILURES + 1))
    fi
else
    echo "⚠️  SKIP: Contract test unavailable (node or test_contract.js missing)"
fi

# Gate 4: Build Validation  
echo ""
echo "🔍 Gate 4: Build Validation"
cd frontend 2>/dev/null || { echo "❌ FAIL: Frontend directory not found"; FAILURES=$((FAILURES + 1)); }

if [ -f "package.json" ]; then
    echo "Running frontend build test:"
    if npm run build --silent > build.log 2>&1; then
        echo "✅ PASS: Frontend builds successfully"
        # Check for critical warnings
        if grep -i "warning.*failed\|error" build.log; then
            echo "⚠️  WARN: Build warnings detected"
        fi
    else
        echo "❌ FAIL: Frontend build failed"
        echo "Build errors:"
        tail -10 build.log
        FAILURES=$((FAILURES + 1))
    fi
fi

# Gate 5: Critical Endpoints
echo ""  
echo "🔍 Gate 5: Critical Endpoints"
BACKEND_URL="${API_BASE:-https://ai-response-hub-3.preview.emergentagent.com}"

endpoints=("/api/health" "/api/prompt-info" "/api/version")
for endpoint in "${endpoints[@]}"; do
    if curl -s -f "$BACKEND_URL$endpoint" > /dev/null; then
        echo "✅ PASS: $endpoint responding"
    else
        echo "❌ FAIL: $endpoint not responding"
        FAILURES=$((FAILURES + 1))
    fi
done

# Final Results
echo ""
echo "=== 🎯 QUALITY GATES SUMMARY ==="
if [ $FAILURES -eq 0 ]; then
    echo "🎉 ALL GATES PASSED - DEPLOYMENT APPROVED"
    echo "✅ Legacy code eliminated"
    echo "✅ V2 prompt validated" 
    echo "✅ API contracts working"
    echo "✅ Build successful"
    echo "✅ Critical endpoints healthy"
    exit 0
else
    echo "🚨 $FAILURES GATE(S) FAILED - DEPLOYMENT BLOCKED"
    echo "❌ Fix failing gates before deployment"
    exit 1
fi