# Schema Guard Runbook
## Phase 4: Production Operations Guide

### Overview
The Schema Guard system ensures all chat responses conform to v2 schema format with automatic repair capabilities.

### Key Metrics
- `schema_responses_validated_total` - Total responses processed
- `schema_validation_failures_total` - Responses that failed initial validation  
- `schema_repairs_total` - Responses automatically repaired
- `schema_repair_rate_percent` - Percentage of responses needing repair

### Normal Operation
- **Repair Rate**: 0-0.5% in steady state
- **Validation Failures**: Should be 0 in production
- **Response Time Impact**: <10ms overhead per response

### Alert: SchemaFailuresHigh
**Condition**: `rate(schema_validation_failures_total[10m]) > 0`
**Severity**: PAGE (immediate attention required)

#### Symptoms
- Non-zero validation failures in logs
- Users receiving malformed responses
- Schema metrics dashboard showing failures

#### Investigation Steps
1. Check recent deployments or configuration changes
2. Review error logs for validation failure patterns:
   ```bash
   kubectl logs -l app=onesource --since=1h | grep "schema_validation_failed"
   ```
3. Check if specific response types are failing:
   ```bash
   # Look for patterns in failed responses
   kubectl logs -l app=onesource --since=1h | grep -A5 "Schema validation failed"
   ```

#### Resolution Steps
1. **Immediate**: Enable dual write to capture failures:
   ```bash
   kubectl set env deployment/onesource CONV_DUAL_WRITE=1
   ```

2. **If systematic failures**: Rollback to previous version:
   ```bash
   /app/deployment/rollback.sh default onesource schema_validation_failures
   ```

3. **If isolated failures**: Monitor and collect examples for fix

### Alert: SchemaRepairsHigh  
**Condition**: Schema repair rate > 0.5% over 24h
**Severity**: WARN (investigate within business hours)

#### Expected Causes
- **New AI model deployment**: Different response formatting
- **Prompt changes**: Altered output structure
- **Legacy response migration**: Normal during upgrades

#### Investigation Steps
1. Check repair rate trend in dashboard
2. Identify which response types need most repairs:
   ```bash
   # Check repair reasons in logs
   kubectl logs -l app=onesource --since=24h | grep "schema_repair" | sort | uniq -c
   ```

3. Review recent changes to AI service or prompts

#### Resolution Steps
1. **If repair rate trending upward**: Investigate prompt changes
2. **If repair rate stable but high**: Update AI model training
3. **If emergency**: Temporarily disable auto-repair:
   ```bash
   kubectl set env deployment/onesource SCHEMA_REPAIR_ENABLED=0
   ```

### Manual Schema Validation
Test schema validation manually:
```bash
curl -X POST http://localhost:8001/api/chat/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_token" \
  -d '{"question":"Test schema validation","session_id":"manual_test"}'
```

### Rollback Procedures
**Quick rollback** (2 minutes):
```bash
# Disable unified pipeline
kubectl set env deployment/onesource USE_UNIFIED_PIPELINE=0

# Switch to MongoDB fallback if Redis issues
kubectl set env deployment/onesource CONV_STORE_PRIMARY=mongo
```

**Full rollback** using script:
```bash
/app/deployment/rollback.sh default onesource schema_issues
```

### Debugging Commands
```bash
# Check schema metrics
curl http://localhost:8001/api/metrics/schema

# Check current feature flags
curl http://localhost:8001/version

# View recent repairs
kubectl logs -l app=onesource --since=1h | grep "schema_repair" | tail -20

# Check Redis connectivity
redis-cli -h redis-service ping
```

### Recovery Validation
After any schema guard changes:
1. Verify schema metrics are healthy
2. Test a sample chat interaction
3. Check repair rate returns to <0.5%
4. Monitor for 30 minutes to ensure stability

### Escalation
- **L1**: Check metrics, restart if needed
- **L2**: Investigate patterns, coordinate rollback  
- **L3**: Root cause analysis, code fixes
- **Engineering Manager**: Major schema changes or architectural issues

### Related Runbooks
- [Redis Operations](redis.md)
- [Rollout Procedures](rollout.md)