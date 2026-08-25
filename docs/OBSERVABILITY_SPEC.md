# OBSERVABILITY SPECIFICATION
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

---

## 1. PRINCIPLES

- Every request is traceable
- Every failure is observable
- No sensitive data in logs
- Structured logging (JSON) throughout
- Metrics drive alerts; alerts drive response

---

## 2. REQUEST TRACING

Every API request carries:

| Field | Source | Notes |
|-------|--------|-------|
| requestId | Generated at Worker entry | UUID, returned in response headers |
| userId | From JWT (when authenticated) | Omitted for public endpoints |
| route | Request path pattern | Normalized (no IDs in route metric) |
| method | HTTP method | GET, POST, etc. |
| statusCode | HTTP response status | |
| durationMs | Worker execution time | |
| errorCode | Application error code | When applicable |
| environment | Deployment environment | production / staging / development |
| workerVersion | Worker deployment version | |

Log entry shape (JSON):
```json
{
  "requestId": "uuid",
  "userId": "uuid-or-null",
  "route": "/api/v1/vehicles",
  "method": "GET",
  "statusCode": 200,
  "durationMs": 87,
  "errorCode": null,
  "environment": "production",
  "timestamp": "2026-08-25T10:00:00.000Z"
}
```

---

## 3. STRUCTURED LOGGING RULES

### MUST NOT LOG

- Access tokens
- Refresh tokens
- Passwords
- OTP values
- Private presigned URLs
- Personal Identifiable Information (PII) beyond userId where necessary
- Request/response bodies containing sensitive fields
- Stack traces (production)
- R2 credentials

### Safe to Log

- Request metadata (route, method, duration, status)
- Error codes and structured error details (no raw DB errors)
- Audit-relevant event summaries (no sensitive payload content)
- Performance metrics
- Sync job status (status, count, without payload)
- Feature flag evaluation results

---

## 4. KEY METRICS

### 4.1 API Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| api.request.duration | Request latency (p50, p95, p99) | p95 > 1000ms for 5 min |
| api.request.error_rate | 5xx error percentage | > 1% for 5 min |
| api.auth.failure_rate | Auth failure rate | > 10/min sustained |
| api.rate_limit.triggered | Rate limit events | > 50/min |

### 4.2 Database Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| db.query.duration | Query latency | p95 > 500ms |
| db.connection.count | Active connections | > 80% of limit |
| db.error.rate | Database error rate | > 0.5% |

### 4.3 Application Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| pdi.submission.count | PDIs submitted per hour | Anomaly detection |
| pdi.sync.failure.count | Sync failures per hour | > 10/hour |
| media.upload.failure.count | Media upload failures | > 5/hour |
| certificate.generation.duration | Async job duration | > 5 minutes |
| notification.delivery.failure | Notification failures | > 5/hour |

### 4.4 Security Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| auth.login.failure | Failed login attempts | > 20/minute per IP |
| auth.account.locked | Account lockout events | > 5/hour |
| device.revocation | Device revocations | Any event |

---

## 5. ALERTING

Alerts sent to on-call channel (Slack / PagerDuty — provider TBD).

| Severity | Description | Response Time |
|----------|-------------|--------------|
| P1 — Critical | Service unavailable, data breach indicators | Immediate |
| P2 — High | Error rate spike, auth anomaly, DB saturation | < 15 minutes |
| P3 — Medium | Performance degradation, sync failure spike | < 1 hour |
| P4 — Low | Individual errors, non-critical warnings | Next business day |

---

## 6. LOG AGGREGATION

Tool: TBD — options include Cloudflare Logpush → Grafana / Datadog / Logtail.
Decision to be made before Phase 10 (performance + security hardening).

Requirements:
- Structured JSON log ingestion
- Log retention: 90 days (operational), 1 year (security audit)
- Log-based alerting
- Log search capability
- No PII in log aggregation pipeline

---

## 7. WORKER OBSERVABILITY

Cloudflare Workers built-in:
- CPU time per request
- Memory usage
- Error rate
- Request count by route

Application-level:
- Custom timing spans for DB queries
- Custom timing spans for R2 operations
- Custom timing spans for external calls

---

## 8. MOBILE OBSERVABILITY

- Crash reporting: Sentry (or equivalent) — errors only, no PII
- Performance monitoring: JS thread frame rate, JS bundle load time
- Sync success/failure metrics reported to server on sync completion
- Network condition logged locally (for debugging sync failures)

---

*End of OBSERVABILITY_SPEC.md*
