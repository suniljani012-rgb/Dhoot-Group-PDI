# INTEGRATION SPECIFICATION
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

---

## 1. INTEGRATION ARCHITECTURE

All external integrations use an adapter pattern. Domain logic has NO direct dependency on external provider implementations.

```
Domain Event / Service
        |
        v
Integration Interface (TypeScript interface)
        |
        +── TataDmsAdapter (implements DmsIntegrationProvider)
        +── EmailAdapter (implements NotificationProvider)
        +── WhatsAppAdapter (implements NotificationProvider)  [future]
        +── ErpAdapter (implements ErpIntegrationProvider)    [future]
        +── DiagnosticsAdapter (implements VciProvider)       [future]
```

Adding a new integration = implementing the interface + registering the adapter. No domain logic changes.

---

## 2. INTEGRATION CATALOGUE

### 2.1 Tata DMS / CRM

**Status:** Architecture ready — implementation deferred (v1.0 out of scope)

Purpose:
- Vehicle data sync (model, variant, VIN from DMS)
- Delivery confirmation sync
- Service history reference

Interface:
```typescript
interface DmsIntegrationProvider {
  getVehicleByVin(vin: string): Promise<DmsVehicle | null>;
  syncDeliveryStatus(vehicleId: string, status: DeliveryStatus): Promise<void>;
}
```

---

### 2.2 Notification Providers

**Email:** Active in v1.0 (provider TBD — Resend / Postmark / SendGrid)

```typescript
interface EmailProvider {
  sendEmail(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void>;
}
```

**Push (Mobile):** Active in v1.0 via Expo Notifications (FCM + APNs)

```typescript
interface PushProvider {
  sendPush(pushToken: string, notification: PushNotification): Promise<void>;
}
```

**WhatsApp/SMS:** Architecture present, implementation deferred

---

### 2.3 Bluetooth VCI (Vehicle Communication Interface)

**Status:** Feature-flagged — NOT implemented in v1.0

Architecture accommodation:
- Feature flag: `vci-diagnostics`
- Adapter interface defined
- UI entry points placeholders behind feature flag
- No fake diagnostic data generated

---

### 2.4 BI / Analytics

**Status:** Data export available v1.0; dedicated BI integration deferred

- Structured data export (CSV, XLSX) for HO Admin
- API endpoints support date-range filtering for analytics pull
- Dedicated data warehouse integration (future)

---

## 3. INTEGRATION EVENT LOG

All integration events recorded in `integration_events` table:

| Field | Description |
|-------|-------------|
| id | UUID |
| provider | Integration provider name |
| event_type | Event type code |
| payload_summary | Non-sensitive summary (no raw credentials) |
| status | QUEUED / SENT / DELIVERED / FAILED |
| retry_count | Retry attempts |
| created_at | Timestamp |
| resolved_at | Success timestamp |
| error_message | Last error (no sensitive content) |

---

## 4. INTEGRATION SECURITY RULES

- External provider credentials stored in Cloudflare Secrets only
- No provider credentials in code, Git, or client bundles
- All external API calls use HTTPS
- Integration failures do not surface raw error details to end users
- Integration timeouts configured (no unbounded waits)
- Circuit breaker pattern recommended for high-volume integrations (future)

---

*End of INTEGRATION_SPEC.md*
