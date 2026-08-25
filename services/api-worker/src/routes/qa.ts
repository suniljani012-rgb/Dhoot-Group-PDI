import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth';

export const qaRouter = new Hono();

// GET /api/v1/qa/queue (Pending QA Approvals)
qaRouter.get('/queue', requireAuth, async (c) => {
  const session = c.get('session');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  let query = supabase.from('pdi_sessions').select(`
    id, status, progress_percentage, passed_items, failed_items, started_at, submitted_at,
    vehicles ( id, vin, model, variant, color, fuel_type ),
    users!pdi_sessions_inspector_id_fkey ( first_name, last_name, employee_id )
  `).eq('status', 'SUBMITTED').order('submitted_at', { ascending: false });

  if (session.role !== 'SUPER_ADMIN' && session.role !== 'HO_ADMIN' && session.branchId) {
    query = query.eq('branch_id', session.branchId);
  }

  const { data, error } = await query;
  if (error) {
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: error.message, requestId: c.get('requestId') } }, 500);
  }

  return c.json({ success: true, data });
});

// POST /api/v1/qa/:sessionId/approve (Approve & issue certificate)
qaRouter.post('/:sessionId/approve', requireAuth, async (c) => {
  const sessionId = c.req.param('sessionId');
  const session = c.get('session');
  const body = await c.req.json().catch(() => ({}));

  if (!['SUPER_ADMIN', 'HO_ADMIN', 'QA_MANAGER'].includes(session.role)) {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Only QA Managers can approve PDI', requestId: c.get('requestId') } }, 403);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const { data: pdiSession } = await supabase.from('pdi_sessions').select('*, vehicles(*)').eq('id', sessionId).single();
  if (!pdiSession) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found', requestId: c.get('requestId') } }, 404);
  }

  // Prevent self approval
  if (pdiSession.inspector_id === session.userId) {
    return c.json({ success: false, error: { code: 'SELF_APPROVAL_FORBIDDEN', message: 'Inspector cannot QA approve their own inspection', requestId: c.get('requestId') } }, 403);
  }

  // 1. Record QA Review
  await supabase.from('qa_reviews').insert({
    session_id: sessionId,
    vehicle_id: pdiSession.vehicle_id,
    reviewed_by: session.userId,
    decision: 'APPROVED',
    comments: body.comments || 'Inspected and certified meeting Tata Motors quality standards.',
  });

  // 2. Generate Digital Certificate
  const certNumber = `PDI-TATA-${Date.now().toString().slice(-8)}`;
  const qrToken = `QR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  const { data: cert } = await supabase.from('pdi_certificates').insert({
    certificate_number: certNumber,
    vehicle_id: pdiSession.vehicle_id,
    session_id: sessionId,
    branch_id: pdiSession.branch_id,
    issued_by: session.userId,
    verification_qr_token: qrToken,
    pdf_object_key: `${c.env.ENVIRONMENT || 'dev'}/certificates/${certNumber}.pdf`,
  }).select().single();

  // 3. Update PDI Session & Vehicle Status
  await supabase.from('pdi_sessions').update({ status: 'APPROVED', approved_at: new Date().toISOString() }).eq('id', sessionId);
  await supabase.from('vehicles').update({ status: 'DELIVERY_READY' }).eq('id', pdiSession.vehicle_id);

  return c.json({
    success: true,
    data: {
      sessionId,
      status: 'APPROVED',
      certificate: cert,
    },
  });
});
