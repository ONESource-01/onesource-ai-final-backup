# Redis Operations Runbook
## Phase 4: Conversation Store Management

### Overview
Redis serves as the primary conversation store with 30-day TTL and automatic history trimming.

### Key Metrics
- `redis_up` - Redis availability (0/1)
- `redis_latency_p95_ms` - Connection latency
- `history_persist_errors_total` - Failed conversation saves
- `msg_count_before` - Context retrieval success

### Normal Operation
- **Latency**: <50ms P95 for local Redis
- **Persistence Errors**: <0.1% 
- **Memory Usage**: ~100MB per 10K active conversations
- **Hit Rate**: >90% for conversation retrieval

### Alert: PersistenceErrorsHigh
**Condition**: `rate(history_persist_errors_total[10m]) > 0.001`
**Severity**: PAGE (immediate attention required)

#### Symptoms
- Users losing conversation context
- "New thread created" messages appearing incorrectly  
- Error logs showing Redis connection failures

#### Investigation Steps
1. Check Redis availability:
   ```bash
   redis-cli -h redis-service ping
   # Expected: PONG
   ```

2. Check Redis memory usage:
   ```bash
   redis-cli -h redis-service info memory
   # Look for used_memory_human and maxmemory
   ```

3. Check connection pool health:
   ```bash
   kubectl logs -l app=onesource --since=10m | grep "redis_error"
   ```

#### Resolution Steps
1. **Redis down**: Restart Redis service:
   ```bash
   kubectl restart deployment/redis
   # Wait for service to be ready
   kubectl wait --for=condition=ready pod -l app=redis --timeout=60s
   ```

2. **Memory pressure**: Clear old conversations:
   ```bash
   # Connect to Redis and check memory
   redis-cli -h redis-service
   > INFO memory
   > EVAL "return redis.call('DEL', unpack(redis.call('KEYS', 'conv:*')))" 0
   ```

3. **Connection timeouts**: Increase timeout values:
   ```bash
   kubectl set env deployment/onesource REDIS_SOCKET_TIMEOUT_MS=500
   kubectl set env deployment/onesource REDIS_CONNECT_TIMEOUT_MS=200
   ```

### Alert: RedisDown
**Condition**: `redis_up == 0`
**Severity**: PAGE

#### Immediate Actions
1. **Switch to MongoDB fallback** (maintains service):
   ```bash
   kubectl set env deployment/onesource CONV_STORE_PRIMARY=mongo
   ```

2. **Restart Redis service**:
   ```bash
   kubectl delete pod -l app=redis
   # Wait for new pod to be ready
   kubectl wait --for=condition=ready pod -l app=redis --timeout=120s
   ```

3. **Verify recovery**:
   ```bash
   # Test Redis connectivity
   kubectl exec -it deployment/onesource -- redis-cli -h redis-service ping
   
   # Switch back to Redis once healthy
   kubectl set env deployment/onesource CONV_STORE_PRIMARY=redis
   ```

### Conversation Context Failure
**Alert**: `msg_count_before` success rate < 99.9%

#### Symptoms
- Users reporting "AI doesn't remember previous questions"
- High rate of "msg_count_before=0" on follow-up questions

#### Investigation
1. Check conversation retrieval:
   ```bash
   # Look for context retrieval logs
   kubectl logs -l app=onesource --since=30m | grep "msg_count_before" | tail -20
   ```

2. Test conversation storage manually:
   ```bash
   redis-cli -h redis-service
   > KEYS conv:*
   > GET conv:test_session_123
   ```

#### Resolution
1. **Redis connectivity issues**: See RedisDown procedures
2. **TTL configuration**: Verify TTL settings:
   ```bash
   kubectl exec -it deployment/onesource -- env | grep CONV_TTL
   # Should show CONV_TTL_SECONDS=2592000 (30 days)
   ```

### Redis Failover Procedures

#### Manual Failover to MongoDB
```bash
# 1. Enable dual write (capture new conversations in both)
kubectl set env deployment/onesource CONV_DUAL_WRITE=1

# 2. Wait for deployment rollout
kubectl rollout status deployment/onesource

# 3. Switch primary to MongoDB
kubectl set env deployment/onesource CONV_STORE_PRIMARY=mongo

# 4. Verify service health
curl http://localhost:8001/healthz

# 5. Disable dual write once stable
kubectl set env deployment/onesource CONV_DUAL_WRITE=0
```

#### Failback to Redis
```bash
# 1. Ensure Redis is healthy
redis-cli -h redis-service ping

# 2. Enable dual write
kubectl set env deployment/onesource CONV_DUAL_WRITE=1

# 3. Switch primary back to Redis  
kubectl set env deployment/onesource CONV_STORE_PRIMARY=redis

# 4. Monitor for errors for 10 minutes
kubectl logs -f -l app=onesource | grep -E "(redis_error|persist_error)"

# 5. Disable dual write
kubectl set env deployment/onesource CONV_DUAL_WRITE=0
```

### Performance Tuning

#### Redis Memory Optimization
```bash
# Check memory usage patterns
redis-cli -h redis-service
> MEMORY USAGE conv:sample_key
> TTL conv:sample_key

# Adjust TTL if needed (careful - affects user experience)
kubectl set env deployment/onesource CONV_TTL_SECONDS=1728000  # 20 days
```

#### Connection Pool Tuning
```bash
# For high traffic, adjust connection settings
kubectl set env deployment/onesource REDIS_SOCKET_TIMEOUT_MS=100
kubectl set env deployment/onesource REDIS_CONNECT_TIMEOUT_MS=50
```

### Backup and Recovery
Redis data is ephemeral (30-day TTL), but for critical recovery:

```bash
# Create backup snapshot
kubectl exec -it deployment/redis -- redis-cli BGSAVE

# Copy backup file
kubectl cp redis-pod:/data/dump.rdb ./redis-backup-$(date +%Y%m%d).rdb
```

### Monitoring Commands
```bash
# Redis health dashboard
redis-cli -h redis-service info replication

# Connection count
redis-cli -h redis-service info clients

# Memory usage
redis-cli -h redis-service info memory

# Check active conversations
redis-cli -h redis-service eval "return #redis.call('keys', 'conv:*')" 0

# Sample conversation data
redis-cli -h redis-service --scan --pattern "conv:*" | head -5 | xargs redis-cli -h redis-service mget
```

### Testing Redis Functionality
```bash
# End-to-end conversation test
curl -X POST http://localhost:8001/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Test conversation memory","session_id":"redis_test_123"}'

# Follow-up to test context
curl -X POST http://localhost:8001/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What did I just ask about?","session_id":"redis_test_123"}'
```

### Escalation
- **L1**: Basic health checks, restart services
- **L2**: Failover procedures, performance tuning
- **L3**: Data recovery, architecture changes
- **DBA/SRE**: Redis cluster issues, persistent storage