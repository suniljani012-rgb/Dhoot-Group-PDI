import { Env } from '../index';
﻿import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth';
import { BatchSaveResponsesSchema, CreatePdiSessionSchema, SubmitPdiSessionSchema } from '@autoprime/validation';
import { calculatePdiProgress } from '@autoprime/domain';

export const pdiRouter = new Hono<{ Bindings: Env; Variables: any }>();

// GET /api/v1/pdi (List sessions)
pdiRouter.get('/', requireAuth, async (c) => {
  const session = c.get('session');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  let query = supabase.from('pdi_sessions').select(`
    id, status, progress_percentage, started_at, submitted_at,
    vehicles ( id, vin, model, variant, color, status ),
    users!pdi_sessions_inspector_id_fkey ( first_name, last_name, employee_id )
  `).order('started_at', { ascending: false });

  if (session.role === 'PDI_ENGINEER') {
    query = query.eq('inspector_id', session.userId);
  } else if (session.branchId && session.role !== 'SUPER_ADMIN' && session.role !== 'HO_ADMIN') {
    query = query.eq('branch_id', session.branchId);
  }

  const { data, error } = await query;
  if (error) {
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: error.message, requestId: c.get('requestId') } }, 500);
  }

  return c.json({ success: true, data });
});

// POST /api/v1/pdi (Create or resume inspection session)
pdiRouter.post('/', requireAuth, async (c) => {
  const session = c.get('session');
  const body = await c.req.json();
  const parsed = CreatePdiSessionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', requestId: c.get('requestId') } }, 400);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  // 1. Get vehicle
  const { data: vehicle, error: vErr } = await supabase.from('vehicles').select('*').eq('id', parsed.data.vehicleId).single();
  if (vErr || !vehicle) {
    return c.json({ success: false, error: { code: 'VEHICLE_NOT_FOUND', message: 'Vehicle not found', requestId: c.get('requestId') } }, 404);
  }

  // 2. Resolve template
  let templateId = parsed.data.templateId;
  if (!templateId) {
    const { data: tpl } = await supabase.from('checklist_templates').select('id').eq('is_active', true).limit(1).single();
    templateId = tpl?.id;
  }

  // Count total checklist items in template
  const { count: totalItems } = await supabase
    .from('checklist_items')
    .select('id, checklist_categories!inner(template_id)', { count: 'exact' })
    .eq('checklist_categories.template_id', templateId);

  // 3. Create PDI Session
  const { data: pdiSession, error: sErr } = await supabase.from('pdi_sessions').insert({
    vehicle_id: vehicle.id,
    template_id: templateId,
    inspector_id: session.userId,
    branch_id: vehicle.branch_id,
    status: 'IN_PROGRESS',
    total_items: totalItems || 20,
  }).select().single();

  if (sErr) {
    return c.json({ success: false, error: { code: 'CREATE_FAILED', message: sErr.message, requestId: c.get('requestId') } }, 400);
  }

  // Update vehicle status
  await supabase.from('vehicles').update({ status: 'PDI_IN_PROGRESS' }).eq('id', vehicle.id);

  return c.json({ success: true, data: pdiSession }, 201);
});

// GET /api/v1/pdi/:id/checklist (Get categories + items + responses)
pdiRouter.get('/:id/checklist', requireAuth, async (c) => {
  const sessionId = c.req.param('id');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const { data: pdiSession } = await supabase.from('pdi_sessions').select('*, vehicles(*)').eq('id', sessionId).single();
  if (!pdiSession) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found', requestId: c.get('requestId') } }, 404);
  }

  // Fetch categories and items
  const { data: categories } = await supabase
    .from('checklist_categories')
    .select(`
      id, code, name, description, display_order,
      checklist_items (
        id, item_code, title, instructions, response_type, is_mandatory, failure_severity, display_order
      )
    `)
    .eq('template_id', pdiSession.template_id)
    .order('display_order', { ascending: true });

  // Fetch existing responses
  const { data: responses } = await supabase.from('checklist_responses').select('*').eq('session_id', sessionId);

  return c.json({
    success: true,
    data: {
      session: pdiSession,
      categories,
      responses: responses || [],
    },
  });
});

// PUT /api/v1/pdi/:id/responses (Batch save / autosave)
pdiRouter.put('/:id/responses', requireAuth, async (c) => {
  const sessionId = c.req.param('id');
  const body = await c.req.json();
  const parsed = BatchSaveResponsesSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid responses', details: parsed.error.format(), requestId: c.get('requestId') } }, 400);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const rows = parsed.data.responses.map((r) => ({
    session_id: sessionId,
    item_id: r.itemId,
    status: r.status,
    numeric_value: r.numericValue,
    text_value: r.textValue,
    remarks: r.remarks,
    responded_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('checklist_responses').upsert(rows, { onConflict: 'session_id, item_id' });
  if (error) {
    return c.json({ success: false, error: { code: 'SAVE_FAILED', message: error.message, requestId: c.get('requestId') } }, 500);
  }

  // Recalculate progress
  const { data: allResponses } = await supabase.from('checklist_responses').select('id, status').eq('session_id', sessionId);
  const { data: session } = await supabase.from('pdi_sessions').select('total_items').eq('id', sessionId).single();

  const answered = allResponses?.length || 0;
  const passed = allResponses?.filter((r) => r.status === 'PASS').length || 0;
  const failed = allResponses?.filter((r) => r.status === 'FAIL').length || 0;
  const na = allResponses?.filter((r) => r.status === 'NA').length || 0;
  const progressPct = calculatePdiProgress(session?.total_items || 20, answered);

  await supabase.from('pdi_sessions').update({
    progress_percentage: progressPct,
    passed_items: passed,
    failed_items: failed,
    na_items: na,
  }).eq('id', sessionId);

  return c.json({
    success: true,
    data: {
      progressPercentage: progressPct,
      answeredCount: answered,
      passedCount: passed,
      failedCount: failed,
    },
  });
});

// POST /api/v1/pdi/:id/submit (Submit PDI)
pdiRouter.post('/:id/submit', requireAuth, async (c) => {
  const sessionId = c.req.param('id');
  const session = c.get('session');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const { data: pdiSession } = await supabase.from('pdi_sessions').select('*, vehicles(*)').eq('id', sessionId).single();
  if (!pdiSession) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'PDI session not found', requestId: c.get('requestId') } }, 404);
  }

  const { data: responses } = await supabase.from('checklist_responses').select('*').eq('session_id', sessionId);
  const hasFailures = responses?.some((r) => r.status === 'FAIL') || false;

  const targetVehicleStatus = hasFailures ? 'PDI_FAILED' : 'QA_PENDING';

  // Mark session submitted
  await supabase.from('pdi_sessions').update({
    status: 'SUBMITTED',
    submitted_at: new Date().toISOString(),
  }).eq('id', sessionId);

  // Update vehicle status
  await supabase.from('vehicles').update({ status: targetVehicleStatus }).eq('id', pdiSession.vehicle_id);

  // Audit
  await supabase.from('audit_logs').insert({
    organization_id: session.organizationId,
    actor_id: session.userId,
    action: 'PDI_SUBMITTED',
    entity_type: 'PDI_SESSION',
    entity_id: sessionId,
    severity: 'INFO',
  });

  return c.json({
    success: true,
    data: {
      sessionId,
      status: 'SUBMITTED',
      vehicleStatus: targetVehicleStatus,
      hasFailures,
    },
  });
});
