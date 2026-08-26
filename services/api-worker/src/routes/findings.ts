import { Env } from '../index';
﻿import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth';

export const findingsRouter = new Hono<{ Bindings: Env; Variables: any }>();

// GET /api/v1/findings/session/:sessionId
findingsRouter.get('/session/:sessionId', requireAuth, async (c) => {
  const sessionId = c.req.param('sessionId');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const { data, error } = await supabase.from('inspection_findings').select('*').eq('session_id', sessionId);
  if (error) {
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: error.message, requestId: c.get('requestId') } }, 500);
  }

  return c.json({ success: true, data });
});

// POST /api/v1/findings (Record defect / damage finding)
findingsRouter.post('/', requireAuth, async (c) => {
  const session = c.get('session');
  const body = await c.req.json();
  const { sessionId, vehicleId, itemId, severity, bodyArea, description } = body;

  if (!sessionId || !vehicleId || !description || !bodyArea) {
    return c.json({ success: false, error: { code: 'INVALID_PAYLOAD', message: 'Missing required finding fields', requestId: c.get('requestId') } }, 400);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  // 1. Create finding
  const { data: finding, error: findErr } = await supabase.from('inspection_findings').insert({
    session_id: sessionId,
    vehicle_id: vehicleId,
    item_id: itemId,
    severity: severity || 'MAJOR',
    body_area: bodyArea,
    description,
    status: 'OPEN',
    created_by: session.userId,
  }).select().single();

  if (findErr) {
    return c.json({ success: false, error: { code: 'CREATE_FAILED', message: findErr.message, requestId: c.get('requestId') } }, 500);
  }

  // 2. Auto create repair ticket if CRITICAL or MAJOR
  if (severity === 'CRITICAL' || severity === 'MAJOR') {
    await supabase.from('repair_tickets').insert({
      finding_id: finding.id,
      vehicle_id: vehicleId,
      branch_id: session.branchId || '33333333-3333-3333-3333-333333333331',
      priority: severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      status: 'OPEN',
      work_notes: `Auto-generated from finding: ${description}`,
      created_by: session.userId,
    });

    // Update vehicle to PDI_FAILED / REPAIR_PENDING
    await supabase.from('vehicles').update({ status: 'PDI_FAILED' }).eq('id', vehicleId);
  }

  return c.json({ success: true, data: finding }, 201);
});
