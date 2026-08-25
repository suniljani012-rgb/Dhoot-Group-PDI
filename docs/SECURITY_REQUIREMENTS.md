# SECURITY REQUIREMENTS
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25
**Framework:** OWASP ASVS + OWASP API Security Top 10

---

## 1. PRINCIPLES

- Defense in depth: multiple independent security layers
- Least privilege: every role gets minimum required permissions
- Zero trust: no implicit trust between components
- Fail secure: on error, deny access
- Auditability: all security-relevant events logged

---

## 2. AUTHENTICATION

### 2.1 Requirements

| ID | Requirement |
|----|-------------|
| SEC-AUTH-01 | Supabase Auth used exclusively; no custom auth implementation |
| SEC-AUTH-02 | Access tokens short-lived (15 minutes default, configurable) |
| SEC-AUTH-03 | Refresh token rotation on use |
| SEC-AUTH-04 | JWT validation: signature, issuer, audience, expiration, required claims |
| SEC-AUTH-05 | JWT verification uses Supabase JWKS; no custom crypto code |
| SEC-AUTH-06 | Employee ID + password for primary auth |
| SEC-AUTH-07 | OTP (phone) for 2FA where policy requires |
| SEC-AUTH-08 | Password policy: minimum 10 characters, complexity enforced |
| SEC-AUTH-09 | Account lockout after 5 failed attempts; exponential backoff |
| SEC-AUTH-10 | All auth events audited (success, failure, lockout) |

### 2.2 Session Management

| ID | Requirement |
|----|-------------|
| SEC-SESS-01 | Sessions expire after configurable inactivity period |
| SEC-SESS-02 | Session revocation propagated within one refresh cycle |
| SEC-SESS-03 | Logout from all devices supported |
| SEC-SESS-04 | Concurrent session policy configurable per role |
| SEC-SESS-05 | Mobile app stores session tokens in Expo SecureStore only |
| SEC-SESS-06 | Web app stores session tokens in httpOnly cookies or Supabase client (not localStorage) |

---

## 3. AUTHORIZATION

| ID | Requirement |
|----|-------------|
| SEC-AUTHZ-01 | API-layer role check on every endpoint |
| SEC-AUTHZ-02 | Database-layer RLS enforced on every exposed table |
| SEC-AUTHZ-03 | Branch scoping enforced at both API and DB layers |
| SEC-AUTHZ-04 | Role claims sourced from server; mutable user metadata not used for authorization |
| SEC-AUTHZ-05 | IDOR prevention: ownership verified before any record access |
| SEC-AUTHZ-06 | Engineer cannot approve their own PDI (enforced server-side) |
| SEC-AUTHZ-07 | QA Manager cannot approve their own submissions |
| SEC-AUTHZ-08 | Navigation hiding is cosmetic only; backend enforcement is mandatory |

---

## 4. API SECURITY

| ID | Requirement |
|----|-------------|
| SEC-API-01 | All API endpoints require authentication (public endpoints documented as exceptions) |
| SEC-API-02 | Request schema validation on every endpoint (Zod) |
| SEC-API-03 | Raw database errors never returned to client |
| SEC-API-04 | Stack traces never returned in production responses |
| SEC-API-05 | Correlation ID on every request for traceability |
| SEC-API-06 | Rate limiting: per-user and per-IP on sensitive endpoints |
| SEC-API-07 | HTTPS only; HTTP requests rejected at edge |
| SEC-API-08 | CORS configured to allow only known origins |
| SEC-API-09 | Request size limits enforced |

---

## 5. FILE AND MEDIA SECURITY

| ID | Requirement |
|----|-------------|
| SEC-FILE-01 | R2 buckets are private by default |
| SEC-FILE-02 | Presigned upload URLs generated server-side with short TTL (15 minutes) |
| SEC-FILE-03 | Presigned download URLs generated server-side with short TTL (60 minutes) |
| SEC-FILE-04 | Client-provided filenames never used as object keys |
| SEC-FILE-05 | Object keys server-generated (UUID-based path) |
| SEC-FILE-06 | MIME type validation on upload (server-side verification) |
| SEC-FILE-07 | File size limits enforced (configurable per type) |
| SEC-FILE-08 | Executable uploads rejected |
| SEC-FILE-09 | Upload ownership validated before URL generation |
| SEC-FILE-10 | Presigned URLs treated as bearer credentials; never logged |

---

## 6. MOBILE SECURITY

| ID | Requirement |
|----|-------------|
| SEC-MOB-01 | Biometric unlock uses Expo Local Authentication (platform APIs only) |
| SEC-MOB-02 | App locks after configurable inactivity (Immediately / 1 / 5 / 15 / 30 minutes) |
| SEC-MOB-03 | App hides sensitive data in app-switcher previews |
| SEC-MOB-04 | Screenshot prevention on sensitive screens where platform APIs support it |
| SEC-MOB-05 | Session tokens stored in Expo SecureStore only |
| SEC-MOB-06 | No PII or tokens logged in any log output |
| SEC-MOB-07 | Device registration enforced before mobile access granted |
| SEC-MOB-08 | Admins can remotely revoke device access |
| SEC-MOB-09 | Biometric bypass is secure fallback (PIN/password), not skip |

Sensitive screens requiring protection:
- Employee profile
- Vehicle VIN details
- Damage evidence
- Workshop information
- QA approvals
- Reports containing personal/business data

---

## 7. SECRET MANAGEMENT

| ID | Requirement |
|----|-------------|
| SEC-SEC-01 | All Worker secrets stored in Cloudflare Secrets |
| SEC-SEC-02 | Supabase service role key never in client code |
| SEC-SEC-03 | R2 access credentials never in client code |
| SEC-SEC-04 | No secrets in source code or Git history |
| SEC-SEC-05 | .env files not committed to Git |
| SEC-SEC-06 | .env.example has placeholder values only |
| SEC-SEC-07 | Secret rotation process documented in DEPLOYMENT_SPEC.md |

---

## 8. THREAT MODEL SUMMARY

| Threat | Impact | Likelihood | Primary Mitigation |
|--------|--------|-----------|-------------------|
| Account takeover | Critical | Medium | Rate limiting, lockout, 2FA |
| Credential stuffing | High | High | Rate limiting, CAPTCHA (future), lockout |
| OTP abuse | High | Medium | Rate limiting on OTP endpoint |
| Session theft | High | Low | SecureStore, short TTL, rotation |
| JWT misuse | High | Low | Standard validation, JWKS |
| Broken access control / IDOR | Critical | Medium | RLS + API ownership checks |
| RLS misconfiguration | Critical | Low | RLS tests in CI, security audits |
| Malicious file upload | High | Medium | MIME validation, size limits, server keys |
| Signed URL leakage | Medium | Low | Short TTL, HTTPS, no logging |
| XSS | High | Low | CSP headers, no innerHTML |
| SQL injection | Critical | Low | Parameterized queries, ORM |
| API abuse / DoS | High | Medium | Rate limiting, Cloudflare WAF |
| Data exfiltration | Critical | Low | RLS, audit logs, least privilege |
| Insider privilege misuse | High | Medium | Audit logs, role separation |
| Lost/stolen device | High | Medium | Remote device revocation, biometric lock |
| Offline storage exposure | Medium | Low | SQLite encryption consideration (see ASSUMPTIONS.md) |
| Supply-chain compromise | High | Low | Dependency audit, lock files, pinned versions |
| Secret leakage | Critical | Low | Secret management rules, git scanning |

Full threat model with mitigations: see docs/RISK_REGISTER.md

---

## 9. AUDIT LOGGING REQUIREMENTS

Events that MUST be audited:
- Login success and failure
- Logout and session revocation
- Role assignment changes
- User creation, update, deactivation
- Vehicle creation and status transitions
- PDI start, submission, approval, rejection
- Checklist submission
- Finding creation
- Repair status changes
- QA approval and rejection
- Certificate generation
- Admin setting changes
- Security events (lockout, suspicious activity)
- Device registration and revocation

Audit record MUST include: event_type, actor_id, actor_role, target_entity, target_id, timestamp, ip_address, device_id, metadata (non-sensitive).

Normal users CANNOT delete audit records. Admins can ONLY read them.

---

## 10. SECURITY TESTING REQUIREMENTS

Required security tests (see TESTING_STRATEGY.md for details):
- Unauthorized endpoint access
- Horizontal privilege escalation (access another user's data)
- Vertical privilege escalation (access higher-role functions)
- Token replay (expired tokens rejected)
- RLS bypass attempts
- Insecure direct object reference
- Malicious file upload
- Rate limit abuse verification

---

*End of SECURITY_REQUIREMENTS.md*
