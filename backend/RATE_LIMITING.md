# Modern Rate Limiting System (2025 Best Practices)

## Overview

This application implements a comprehensive rate limiting system based on 2025 best practices, providing:

- **Token Bucket Algorithm** with burst support
- **Role-based limits** (Anonymous, Authenticated, Admin)
- **Sensitive endpoint protection** (Login, Register, Password Reset)
- **Standard HTTP headers** (`X-RateLimit-*`, `Retry-After`)
- **Comprehensive metrics** and monitoring
- **Configurable limits** via `application.properties`
- **Health check exclusions**

## Rate Limits

### Default Limits

| User Type | Limit | Burst | Scope |
|-----------|-------|-------|-------|
| **Anonymous** | 60 req/min | 10 | IP-based |
| **Authenticated** | 600 req/min | 60 | User-based |
| **Admin** | 3000 req/min | 200 | User-based |
| **Sensitive Endpoints** | 5 req/min | 1 | IP or User-based |

### Sensitive Endpoints

The following endpoints have stricter limits to prevent brute-force attacks:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/reset-password`
- `POST /api/auth/forgot-password`

### Excluded Endpoints

These endpoints are excluded from rate limiting:

- `/actuator/health`
- `/actuator/info`
- `/api-docs/**`
- `/swagger-ui/**`
- `/v3/api-docs/**`

## HTTP Headers

### Success Response (200 OK)

When a request is allowed, the following headers are included:

```http
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 599
X-RateLimit-Reset: 1704110400
```

- **X-RateLimit-Limit**: Maximum requests allowed in the current window
- **X-RateLimit-Remaining**: Requests remaining in the current window
- **X-RateLimit-Reset**: Unix timestamp when the limit resets

### Rate Limit Exceeded (429 Too Many Requests)

When the limit is exceeded:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 0
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704110460
Retry-After: 45
Content-Type: application/json

{
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "path": "/api/coffees/popular",
  "retryAfter": "45 seconds",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

## Configuration

### Using application.properties

Create or edit `application-rate-limit.properties`:

```properties
# Anonymous Users (IP-based)
app.rate-limit.anonymous-capacity=60
app.rate-limit.anonymous-refill-tokens=60
app.rate-limit.anonymous-refill-minutes=1

# Authenticated Users (user-based)
app.rate-limit.authenticated-capacity=600
app.rate-limit.authenticated-refill-tokens=600
app.rate-limit.authenticated-refill-minutes=1

# Admin Users
app.rate-limit.admin-capacity=3000
app.rate-limit.admin-refill-tokens=3000
app.rate-limit.admin-refill-minutes=1

# Sensitive Endpoints
app.rate-limit.sensitive-capacity=5
app.rate-limit.sensitive-refill-tokens=5
app.rate-limit.sensitive-refill-minutes=1
```

### Production Recommendations

For production environments with high traffic:

```properties
# Anonymous: 100-200 req/min
app.rate-limit.anonymous-capacity=150
app.rate-limit.anonymous-refill-tokens=150

# Authenticated: 1000-2000 req/min
app.rate-limit.authenticated-capacity=1500
app.rate-limit.authenticated-refill-tokens=1500

# Admin: 5000-10000 req/min
app.rate-limit.admin-capacity=7500
app.rate-limit.admin-refill-tokens=7500

# Sensitive: 3-10 req/min (security-dependent)
app.rate-limit.sensitive-capacity=5
app.rate-limit.sensitive-refill-tokens=5
```

### Burst Support

The token bucket algorithm allows bursts:

- **Capacity > Refill**: Allows temporary spikes
- **Example**: capacity=100, refill=60
  - Steady state: 60 req/min
  - Burst: up to 100 requests immediately if bucket is full
  - After burst: limited to refill rate (60/min)

## Monitoring & Metrics

### Admin Endpoints

Access metrics via admin endpoints (requires `ROLE_ADMIN`):

#### Get All Metrics
```bash
GET /api/admin/rate-limit/metrics
```

Response:
```json
{
  "success": true,
  "data": {
    "totalRequests": 15420,
    "rejectedRequests": 142,
    "rejectionRate": "0.92%",
    "rejectionsByEndpoint": {
      "/api/auth/login": 95,
      "/api/coffees/popular": 47
    },
    "rejectionsByUserType": {
      "anonymous": 120,
      "authenticated": 20,
      "admin": 2
    }
  }
}
```

#### Get Statistics
```bash
GET /api/admin/rate-limit/stats
```

#### Get Rejections by Endpoint
```bash
GET /api/admin/rate-limit/rejections/endpoints
```

#### Get Rejections by User Type
```bash
GET /api/admin/rate-limit/rejections/user-types
```

#### Reset Metrics
```bash
POST /api/admin/rate-limit/reset
```

### Logs

Rate limit events are logged:

```
2025-01-01 12:00:00 - Rate limit exceeded - endpoint: /api/auth/login, userType: anonymous, retryAfter: 45s
```

## Architecture

### Components

1. **RateLimitConfig** - Configuration and bucket creation
2. **RateLimitFilter** - Main filter that enforces limits
3. **RateLimitMetrics** - Metrics collection and tracking
4. **RateLimitMetricsController** - Admin endpoints for monitoring
5. **RateLimitProperties** - Configurable properties

### Flow

```
Request → SecurityFilter Chain
         ↓
    JwtAuthenticationFilter (establishes authentication)
         ↓
    RateLimitFilter
         ↓
    Check if excluded path? → Yes → Allow
         ↓ No
    Check if sensitive endpoint? → Yes → Use sensitive bucket
         ↓ No
    Get user authentication
         ↓
    Create/Get appropriate bucket (Anonymous/Auth/Admin)
         ↓
    Try consume 1 token
         ↓
    Consumed? → Yes → Add headers → Allow
         ↓ No
    Return 429 + headers + metrics
```

## Testing

### Test Anonymous Limits

```bash
# Make 61 requests rapidly
for i in {1..61}; do
  curl -i http://localhost:8080/api/coffees/popular
done

# 61st request should return 429
```

### Test Authenticated Limits

```bash
# Login and get token
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.data.token')

# Make 601 requests with token
for i in {1..601}; do
  curl -i -H "Authorization: Bearer $TOKEN" \
    http://localhost:8080/api/coffees/popular
done

# 601st request should return 429
```

### Test Sensitive Endpoints

```bash
# Try to login 6 times
for i in {1..6}; do
  curl -i -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# 6th attempt should return 429
```

### Check Metrics

```bash
# Get metrics (requires admin token)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/api/admin/rate-limit/metrics
```

## Best Practices

### For Development

- Use generous limits to avoid interrupting development flow
- Enable detailed logging to understand rate limiting behavior
- Use metrics endpoint to monitor rejections

### For Production

1. **Start Conservative**: Begin with lower limits and increase based on monitoring
2. **Monitor Closely**: Watch rejection rates and adjust accordingly
3. **Differentiate by Endpoint**: Apply stricter limits to expensive operations
4. **Security-First**: Keep sensitive endpoint limits low (3-5 req/min)
5. **Communicate Limits**: Document API limits in your API documentation
6. **Implement Retry Logic**: Clients should respect `Retry-After` header

### For Scaling

- Consider using Redis for distributed rate limiting across multiple servers
- Implement sliding window algorithm for more accurate limiting
- Add per-endpoint custom limits for fine-grained control
- Monitor burst patterns and adjust capacity accordingly

## Troubleshooting

### Issue: Getting 429 errors as authenticated user

**Check**:
1. Verify JWT token is valid and not expired
2. Check if JwtAuthenticationFilter is before RateLimitFilter
3. Verify user has correct role (ROLE_USER, ROLE_ADMIN)
4. Check logs for bucket creation messages

### Issue: Metrics showing high rejection rate

**Solutions**:
1. Increase capacity for affected user type
2. Identify problematic endpoints and add custom limits
3. Check for bot traffic or abuse
4. Review burst patterns in your application

### Issue: Limits not applying correctly

**Check**:
1. Configuration is loaded: `@ConfigurationProperties` scan is enabled
2. Properties file is in correct location
3. Property names match exactly (case-sensitive)
4. Restart application after changing configuration

## Migration from Old System

If migrating from the previous rate limiting implementation:

1. **Backup** your current `application.properties`
2. **Review** new default limits
3. **Adjust** limits based on your current traffic patterns
4. **Test** in staging environment first
5. **Monitor** metrics closely after deployment
6. **Adjust** based on real-world usage

## Future Enhancements

Potential improvements for future versions:

- [ ] Redis-backed distributed rate limiting
- [ ] Sliding window algorithm option
- [ ] Per-endpoint custom limits
- [ ] Automatic limit adjustment based on load
- [ ] Rate limit warming (gradual limit increase)
- [ ] Whitelist/blacklist IP ranges
- [ ] GraphQL query complexity-based limiting

## License

Part of the Sipzy application - see main LICENSE file.
