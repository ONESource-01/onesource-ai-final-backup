# Rollout Procedures Runbook
## Phase 4: Staging → Canary → Full Production Deployment

### Overview
Comprehensive deployment process with staging soak, canary testing, and full rollout procedures.

### Deployment Phases

#### Phase 1: Staging Soak (48h)
**Objective**: Validate system stability under load before production

**Pre-requisites**:
- All feature flags configured correctly
- Monitoring dashboards operational  
- Rollback procedures tested

**Execution**:
```bash
# 1. Deploy to staging environment
kubectl apply -f k8s/staging/ -n staging

# 2. Run automated soak tests
cd /app && python tests/test_staging_soak.py

# 3. Monitor key metrics for 48h
# - P95 latency ≤ 1.5s (/chat), ≤ 1.6s (/chat/enhanced)
# - Delta ≤ 100ms
# - 5xx rate ≤ 0.3%
# - Persistence errors ≤ 0.1%
# - Schema repair rate ≤ 0.5%
```

**Pass Criteria**:
- All SLO thresholds met for 48 continuous hours
- No critical alerts triggered
- UI e2e tests passing (tables, dark mode, mobile)
- A11y checks pass

**Staging Soak Commands**:
```bash
# Check staging health
curl https://staging.onesource.ai/healthz

# Run multi-turn test
curl -X POST https://staging.onesource.ai/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Test staging deployment","session_id":"soak_test"}'

# Monitor metrics
curl https://staging.onesource.ai/api/metrics/observability | jq '.slo_compliance'
```

#### Phase 2: Canary Rollout (10-20% for 24h)
**Objective**: Validate production readiness with limited user exposure

**Traffic Routing**:
Use header-based canary routing:
```bash
# Configure ingress for canary traffic
kubectl patch ingress onesource-ingress -p '
{
  "metadata": {
    "annotations": {
      "nginx.ingress.kubernetes.io/canary": "true",
      "nginx.ingress.kubernetes.io/canary-weight": "10"
    }
  }
}'
```

**Alternative: Cookie-based routing**:
```bash
# Set canary cookie for test users
curl -H "Cookie: canary=enabled" https://onesource.ai/api/chat/ask
```

**Canary Monitoring**:
```bash
# Monitor canary vs stable metrics
kubectl logs -l app=onesource,version=canary --since=1h | grep "latency_ms" | tail -50
kubectl logs -l app=onesource,version=stable --since=1h | grep "latency_ms" | tail -50

# Check error rates by version  
kubectl logs -l app=onesource --since=1h | grep -E "(version|error)" | sort
```

**Canary Success Criteria**:
- Same SLOs as staging maintained
- No increase in user-reported issues
- Session completion rate unchanged
- Time-to-first-token unchanged

#### Phase 3: Full Rollout
**Objective**: Complete deployment to 100% of users

**Pre-rollout Checklist**:
- [ ] Canary metrics healthy for 24h
- [ ] Rollback procedures tested and ready
- [ ] Dashboard snapshots captured
- [ ] CHANGELOG updated
- [ ] On-call team notified

**Rollout Commands**:
```bash
# 1. Take metrics snapshot
curl https://onesource.ai/api/metrics/observability > pre-rollout-metrics.json

# 2. Increase canary traffic gradually
kubectl patch ingress onesource-ingress -p '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/canary-weight":"50"}}}'
# Wait 15 minutes, monitor
kubectl patch ingress onesource-ingress -p '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/canary-weight":"100"}}}'

# 3. Remove canary routing (full traffic to new version)
kubectl patch ingress onesource-ingress -p '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/canary":"false"}}}'
```

### Rollback Procedures

#### Emergency Rollback (< 2 minutes)
```bash
# Use automated rollback script
/app/deployment/rollback.sh default onesource emergency_rollback

# Manual steps if script unavailable:
kubectl set env deployment/onesource USE_UNIFIED_PIPELINE=0
kubectl set env deployment/onesource CONV_STORE_PRIMARY=mongo
kubectl rollout status deployment/onesource --timeout=120s
```

#### Canary Rollback
```bash
# Route traffic back to stable version
kubectl patch ingress onesource-ingress -p '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/canary-weight":"0"}}}'

# Or disable canary entirely
kubectl patch ingress onesource-ingress -p '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/canary":"false"}}}'
```

#### Staged Rollback (Gradual)
```bash
# Reduce canary traffic gradually
for weight in 75 50 25 10 0; do
  kubectl patch ingress onesource-ingress -p "{\"metadata\":{\"annotations\":{\"nginx.ingress.kubernetes.io/canary-weight\":\"$weight\"}}}"
  echo "Canary weight set to $weight%, monitoring for 5 minutes..."
  sleep 300
done
```

### Feature Flag Management

#### Production Feature Flags
```bash
# Check current flags
kubectl get deployment onesource -o yaml | grep -A10 "env:" | grep FEATURE

# Disable Phase 3 features if needed
kubectl set env deployment/onesource FEATURE_DYNAMIC_PROMPTS=0
kubectl set env deployment/onesource FEATURE_SUGGESTED_ACTIONS=0

# Enable new features
kubectl set env deployment/onesource FEATURE_DYNAMIC_PROMPTS=1
kubectl set env deployment/onesource FEATURE_SUGGESTED_ACTIONS=1
```

### Post-Deployment Monitoring (48-72h)

**Key Metrics to Track**:
1. **Schema Repair Rate Trend**: Should settle near 0 after migration
2. **Context Success Rate**: `msg_count_before` ≥ 99.9% on turn ≥2  
3. **Renderer Performance**: P95 render time < 150ms
4. **Business Metrics**: Session completion, user engagement

**Monitoring Commands**:
```bash
# Schema repair trend
kubectl logs -l app=onesource --since=24h | grep "schema_repair" | wc -l

# Context success rate  
kubectl logs -l app=onesource --since=1h | grep "msg_count_before" | awk '{if($NF>0) success++; total++} END{print "Context success rate:", success/total*100"%"}'

# Error rate tracking
kubectl logs -l app=onesource --since=1h | grep -E "(ERROR|5[0-9][0-9])" | wc -l
```

### Quality Bar Validation

#### Bug Bash Checklist (10 minutes post-deployment)
- [ ] **Table Rendering**: Tables display correctly with headers
- [ ] **Copy/CSV Export**: Copy button and CSV export work  
- [ ] **Mobile Card-Tables**: Tables convert to cards on mobile
- [ ] **Dark Mode**: All components work in dark theme
- [ ] **Suggested Actions**: Follow-on suggestions appear and work
- [ ] **Dynamic Examples**: Landing page shows fresh questions

#### Accessibility Validation
```bash
# Run automated a11y checks
npm run test:a11y

# Manual checks:
# - Tab navigation works through all interactive elements  
# - Focus rings are visible
# - Screen reader labels are present
# - Color contrast meets WCAG 2.1 AA
```

### Troubleshooting Common Issues

#### High Latency After Deployment
```bash
# Check Redis connectivity
redis-cli -h redis-service ping

# Check if unified pipeline is enabled
curl https://onesource.ai/version | jq '.feature_flags.unified_pipeline'

# Monitor response times
kubectl logs -l app=onesource --since=10m | grep "response_time_ms" | tail -20
```

#### Schema Validation Errors
```bash
# Check repair rate
curl https://onesource.ai/api/metrics/schema | jq '.schema_validation.repair_rate_percent'

# Look for validation patterns
kubectl logs -l app=onesource --since=30m | grep "schema_validation_failed" | head -10
```

#### Context Loss Issues  
```bash
# Test conversation memory
curl -X POST https://onesource.ai/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Remember this: blue elephant","session_id":"context_test"}'

curl -X POST https://onesource.ai/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What did I tell you to remember?","session_id":"context_test"}'
```

### Environment-Specific Commands

#### Staging
```bash
export KUBECONFIG=~/.kube/staging-config
kubectl config use-context staging
```

#### Production
```bash  
export KUBECONFIG=~/.kube/prod-config
kubectl config use-context production
```

### Escalation Paths
- **L1 (0-15min)**: Check health endpoints, basic metrics
- **L2 (15-30min)**: Feature flag management, canary adjustments
- **L3 (30min+)**: Full rollback, incident escalation
- **Engineering Lead**: Architecture decisions, post-mortem