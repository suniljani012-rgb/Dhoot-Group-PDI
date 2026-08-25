# DEVICE SECURITY SPECIFICATION
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

---

## 1. SCOPE

This specification applies to the mobile application (iOS and Android). Web browser security is covered in SECURITY_REQUIREMENTS.md.

---

## 2. BIOMETRIC AUTHENTICATION

### 2.1 Supported Methods

| Platform | Biometric |
|----------|-----------|
| iOS | Face ID, Touch ID |
| Android | Fingerprint, Face Unlock (platform-certified only) |

Implementation: Expo Local Authentication (uses platform biometric APIs exclusively).

### 2.2 Biometric Flow

```
App foreground
   |
Check: authenticated session exists? (Supabase session in SecureStore)
   |
  NO → Login screen
   |
  YES → Check: biometric enabled in user settings?
   |
  NO → Open app normally
   |
  YES → Show biometric prompt
   |
Biometric success → Validate session with server (background, silent) → Open app
   |
Biometric failure (1-3 attempts) → Secure fallback (PIN or full re-login)
   |
Biometric unavailable (hardware) → Fall back to full re-login
```

### 2.3 Rules

- Biometrics are for LOCAL app unlock only, not backend authorization
- Backend session is validated separately on sensitive operations
- Biometric bypass via secure fallback is permitted (not silently skipped)
- Maximum 3 biometric attempts before fallback required
- Biometric can be disabled by user or remotely by admin (device revocation)

---

## 3. APPLICATION LOCK

### 3.1 Timeout Policy

| Timeout | Option |
|---------|--------|
| Immediately | Lock when app goes to background |
| 1 minute | Lock after 1 minute of inactivity |
| 5 minutes | Lock after 5 minutes of inactivity |
| 15 minutes | Lock after 15 minutes of inactivity |
| 30 minutes | Lock after 30 minutes of inactivity |
| Disabled | Only allowed if policy permits |

Default: 5 minutes (configurable by admin policy per role).

### 3.2 Lock Behavior

When lock triggers:
- Sensitive screen content hidden immediately (replaced with lock screen)
- Transient in-memory secrets cleared where feasible
- App switcher preview obscured (platform API used)
- Biometric prompt shown on resume
- If session expired during lock: re-login required

---

## 4. DEVICE REGISTRATION

### 4.1 Registration Requirements

- First mobile login requires device registration
- Device registration stores: device_id (UUID generated on device), platform, OS version, app version, device name (optional), push token
- Admin can view registered devices per user
- Admin can revoke device registrations

### 4.2 Registration Flow

```
First login on new device
   |
Generate device_id (UUID, stored in SecureStore)
   |
POST /api/v1/devices/register
  { device_id, platform, os_version, app_version, push_token }
   |
Server records device, associates with user
   |
Device approved → session granted
```

On subsequent logins, device_id sent with auth request for validation.

### 4.3 Revocation

- Admin revokes device → device_id blacklisted server-side
- On next API call, 401 returned with code DEVICE_REVOKED
- App prompts user: "This device has been deregistered. Contact your administrator."
- Session terminated locally

---

## 5. SENSITIVE SCREEN PROTECTION

### 5.1 Sensitive Screens

| Screen | Protection Required |
|--------|-------------------|
| Employee Profile | Screenshot prevention, app-switcher hide |
| Vehicle VIN Detail | Screenshot prevention |
| Damage Evidence (photos) | Screenshot prevention |
| Workshop Information | Screenshot prevention |
| QA Approval Detail | Screenshot prevention |
| PDI Certificate | Screenshot prevention |
| Reports with PII | Screenshot prevention |

### 5.2 Implementation

- iOS: `UIScreen.isCaptured` monitoring + overlay on capture detected
- Android: `FLAG_SECURE` window flag
- App Switcher: blank/logo overlay applied when app enters background on sensitive screens
- Platform API support verified at runtime; graceful degradation where not supported

---

## 6. SECURE STORAGE

| Data | Storage |
|------|---------|
| Auth access token | Expo SecureStore |
| Auth refresh token | Expo SecureStore |
| Device ID | Expo SecureStore |
| Biometric enrollment flag | Expo SecureStore |
| App lock PIN (if applicable) | Expo SecureStore (hashed) |
| Inspection draft data | SQLite (local file, app sandbox) |
| Cached reference data | SQLite (local file, app sandbox) |

Rules:
- No sensitive data in AsyncStorage
- No sensitive data in app logs
- No tokens in console.log output
- SQLite file encryption: see ASSUMPTIONS.md ASM-008

---

## 7. LOGGING RULES (MOBILE)

MUST NOT log:
- Access tokens
- Refresh tokens
- Passwords
- OTP values
- PII (names, phone numbers, employee IDs)
- Presigned URLs

Safe to log (with appropriate level):
- Route navigated to
- Sync job status (without payload content)
- Error codes (without stack traces in production)
- Performance timings (without sensitive context)

---

*End of DEVICE_SECURITY_SPEC.md*
