# COST MODEL
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** ESTIMATE — Must be validated after production deployment
**Last Updated:** 2026-08-25

> IMPORTANT: All figures are estimates based on public pricing at time of writing.
> Actual costs depend on usage volume, negotiated contracts, and pricing changes.
> This document must be updated with measured costs after each phase.

---

## 1. CLOUDFLARE COSTS

### Workers (API)
- Free tier: 100,000 requests/day, 10ms CPU time
- Paid (Workers Paid): $5/month + $0.50 per million additional requests
- Estimate at 50 branches × 20 engineers × 100 API calls/day = 100,000 calls/day
- Assessment: Likely within paid tier lower range

### Pages (Web Hosting)
- Free for static hosting with Cloudflare Pages
- No additional cost at typical traffic

### R2 (Object Storage)
- Storage: $0.015 per GB per month
- Operations: $4.50 per million Class A (write), $0.36 per million Class B (read)
- Egress: Free within Cloudflare network
- Estimate (50 vehicles/day × 15 photos × 0.5MB average): ~375MB/day → ~11GB/month
- Monthly storage at scale: < $5 for photos; add videos for higher estimate

---

## 2. SUPABASE COSTS

### Database (PostgreSQL)
- Pro plan: $25/month (8GB RAM, 250GB storage)
- Additional storage: $0.125 per GB
- Estimate: Pro plan covers v1.0 requirements

### Auth
- Included in Supabase plan
- Free MAU up to 50,000 (Pro plan)

---

## 3. EXPO / EAS COSTS

### EAS Build
- Free tier: 30 builds/month
- EAS Build Production: $99/month for unlimited builds
- Recommendation: Start with free tier; upgrade before production release workflow

---

## 4. TOTAL ESTIMATED MONTHLY COST (SMALL DEPLOYMENT)

| Service | Estimated Monthly Cost |
|---------|----------------------|
| Cloudflare Workers Paid | $5 – $15 |
| Cloudflare R2 (storage + ops) | $2 – $10 |
| Supabase Pro | $25 |
| EAS Build | $0 – $99 |
| Notification provider (FCM/APNs) | Free (FCM) |
| Email provider (e.g., Resend, Postmark) | $0 – $20 |
| Log aggregation (e.g., Logtail) | $0 – $19 |
| **Total estimate** | **$32 – $168/month** |

This is a conservative estimate for a small deployment (< 10 branches, < 5,000 vehicles/month).
Actual costs should be measured and this document updated.

---

## 5. SCALING COST NOTES

- Workers pricing scales linearly with request count — predictable
- R2 storage grows with inspection volume and retention period — monitor and configure retention
- Supabase Team plan ($599/month) required at high concurrency or large dataset
- Database compute upgrade needed if query performance degrades at scale

---

*End of COST_MODEL.md*
