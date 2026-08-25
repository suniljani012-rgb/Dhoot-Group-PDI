# Object Naming Convention — Cloudflare R2

## Path Template

```
{environment}/vehicles/{vehicle_id}/pdi/{session_id}/photos/{slot_code}.webp
{environment}/vehicles/{vehicle_id}/pdi/{session_id}/damage/{finding_id}/{seq:02d}.webp
{environment}/vehicles/{vehicle_id}/pdi/{session_id}/damage/{finding_id}/video.mp4
{environment}/vehicles/{vehicle_id}/pdi/{session_id}/certificate/final.pdf
{environment}/reports/{report_id}/output.pdf
```

## Photo Slot Codes

| Slot Code | Description |
|-----------|-------------|
| exterior-front | Front exterior |
| exterior-rear | Rear exterior |
| exterior-driver-side | Driver side |
| exterior-passenger-side | Passenger side |
| exterior-front-left-corner | Front left corner |
| exterior-front-right-corner | Front right corner |
| exterior-rear-left-corner | Rear left corner |
| exterior-rear-right-corner | Rear right corner |
| interior-dashboard | Dashboard |
| interior-front-cabin | Front cabin |
| interior-rear-cabin | Rear cabin |
| interior-odometer | Odometer reading |
| identity-vin-plate | VIN plate photo |
| identity-chassis | Chassis evidence |

## Rules

- Object keys are ALWAYS server-generated (never from client input)
- UUIDs used for vehicle_id, session_id, finding_id, report_id
- Environment prefix prevents cross-environment object collisions
- All objects stored in private buckets
- Access via presigned URLs only (TTL: upload = 15 min, download = 60 min)
