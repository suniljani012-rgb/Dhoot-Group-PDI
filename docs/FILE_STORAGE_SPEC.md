# FILE STORAGE SPECIFICATION
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

---

## 1. STORAGE PLATFORM

Platform: Cloudflare R2
Protocol: S3-compatible API
Access model: Private buckets only. No public URLs. All access via short-lived presigned URLs.

---

## 2. BUCKET STRUCTURE

| Environment | Bucket Name |
|-------------|------------|
| development | autoprime-pdi-dev |
| staging | autoprime-pdi-staging |
| production | autoprime-pdi-prod |

---

## 3. OBJECT PATH CONVENTION

```
{environment}/vehicles/{vehicle_id}/pdi/{session_id}/photos/{slot_code}.webp
{environment}/vehicles/{vehicle_id}/pdi/{session_id}/damage/{finding_id}/{sequence}.webp
{environment}/vehicles/{vehicle_id}/pdi/{session_id}/damage/{finding_id}/video.mp4
{environment}/vehicles/{vehicle_id}/pdi/{session_id}/certificate/final.pdf
{environment}/reports/{report_id}/output.pdf
```

### Path Components

| Component | Format | Notes |
|-----------|--------|-------|
| environment | string | production / staging / development |
| vehicle_id | UUID | From vehicles table |
| session_id | UUID | From pdi_sessions table |
| finding_id | UUID | From inspection_findings table |
| slot_code | string | e.g., exterior-front, interior-dashboard |
| sequence | zero-padded integer | 01, 02, 03... |
| report_id | UUID | From report generation job |

---

## 4. UPLOAD PIPELINE

```
Client: Capture image
   |
Client: Validate (size < limit, type = image/jpeg or image/png)
   |
Client: Resize + compress to WebP (max 1920x1080, quality 0.82)
   |
Client: POST /api/v1/media/presign-upload
  Request: { vehicle_id, session_id, slot_code, content_type, file_size }
  Auth: Required (PDI_ENGINEER or above)
   |
Worker: Validate ownership (engineer assigned to this vehicle)
Worker: Validate content_type (whitelist)
Worker: Validate file_size (< limit)
Worker: Generate object key (server-controlled, client cannot influence)
Worker: Generate presigned PUT URL (TTL: 15 minutes)
Worker: Create attachment_pending record in DB
   |
Client: PUT directly to R2 using presigned URL
Client: Show upload progress
   |
Client: POST /api/v1/media/confirm-upload
  Request: { attachment_id }
   |
Worker: Verify object exists in R2
Worker: Update attachment record to status: UPLOADED
Worker: Return attachment metadata
```

---

## 5. DOWNLOAD PIPELINE

```
Client: GET /api/v1/media/{attachment_id}/url
  Auth: Required
   |
Worker: Verify user has permission to access this attachment
Worker: Generate presigned GET URL (TTL: 60 minutes)
Worker: Return presigned URL
   |
Client: Load media from presigned URL
```

Presigned URLs:
- Treated as bearer credentials
- Never logged
- Short TTL enforced
- Not shareable across users

---

## 6. VALIDATION RULES

| Property | Rule |
|----------|------|
| Content-Type | Whitelist: image/webp, image/jpeg, image/png, video/mp4, application/pdf |
| File size (photo) | Maximum 10MB (configurable) |
| File size (video) | Maximum 100MB (configurable) |
| File size (PDF) | Maximum 25MB |
| Object key | Server-generated only; client-provided filenames ignored |
| Executable types | REJECTED: exe, bat, sh, js, php, py, etc. |
| Archive types | REJECTED: zip, tar, gz, 7z (unless specifically required) |

MIME type validation done server-side on confirmed-upload by checking R2 object metadata, not relying solely on client-provided content-type header.

---

## 7. SECURITY RULES

- R2 access keys NEVER sent to client
- Presigned URLs generated with minimum necessary permissions (PUT for upload, GET for download)
- Presigned URLs scoped to specific object key (no wildcard)
- Failed uploads (presigned URL generated but object not confirmed within 30 minutes) result in cleanup job marking attachment as EXPIRED
- Object ACL: private (never public)

---

## 8. STORAGE COST CONSIDERATIONS

- WebP compression reduces storage cost vs. original JPEG/PNG
- Client-side resize prevents unnecessarily large objects
- Retention policy controls long-term storage growth (see DATA_RETENTION.md)
- R2 has no egress fees within Cloudflare network — cost model primarily storage + operation charges

---

*End of FILE_STORAGE_SPEC.md*
