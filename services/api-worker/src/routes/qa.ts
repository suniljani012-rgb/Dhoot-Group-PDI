import { Env } from '../index';
import { Hono } from 'hono';

export const qaRouter = new Hono<{ Bindings: Env; Variables: any }>();

let localQaStore: any[] = [
  {
    id: "qa-1",
    sessionId: "pdi-session-001",
    vin: "MAT612345H7654322",
    model: "Tata Harrier Fearless+ Dark",
    variant: "Fearless Plus 6MT",
    color: "Oberon Black",
    inspector: "Vikas Patil (PDI-01)",
    passed: 64,
    failed: 0,
    status: "APPROVED",
    certId: "CERT-2026-0881",
    submittedAt: "2026-08-24 16:30",
    decision: "APPROVED"
  },
  {
    id: "qa-2",
    sessionId: "pdi-session-002",
    vin: "MALC12345V2233442",
    model: "Hyundai Venue N Line N8",
    variant: "N8 Turbo DCT",
    color: "Thunder Blue",
    inspector: "Sunil Sharma (PDI-02)",
    passed: 62,
    failed: 0,
    status: "APPROVED",
    certId: "CERT-2026-0882",
    submittedAt: "2026-08-24 17:15",
    decision: "APPROVED"
  },
  {
    id: "qa-3",
    sessionId: "pdi-session-003",
    vin: "MAT612345C5566774",
    model: "Tata Curvv.ev Accomplished+",
    variant: "Accomplished 55",
    color: "Empowered Oxide",
    inspector: "Vikas Patil (PDI-01)",
    passed: 48,
    failed: 0,
    status: "SUBMITTED",
    certId: null,
    submittedAt: "2026-08-25 09:45",
    decision: "PENDING"
  }
];

// GET /api/v1/qa
qaRouter.get('/', async (c) => {
  return c.json({ success: true, data: localQaStore, meta: { total: localQaStore.length } });
});

// GET /api/v1/qa/queue
qaRouter.get('/queue', async (c) => {
  return c.json({ success: true, data: localQaStore, meta: { total: localQaStore.length } });
});

// POST /api/v1/qa/:sessionId/approve
qaRouter.post('/:sessionId/approve', async (c) => {
  const sessionId = c.req.param('sessionId');
  const body = await c.req.json().catch(() => ({}));

  let updated = null;
  localQaStore = localQaStore.map(q => {
    if (q.sessionId === sessionId || q.id === sessionId) {
      updated = {
        ...q,
        status: 'APPROVED',
        decision: 'APPROVED',
        certId: `CERT-${Date.now()}`,
        comments: body.comments || 'Quality verified and approved'
      };
      return updated;
    }
    return q;
  });

  return c.json({ success: true, data: updated || localQaStore[0] });
});
