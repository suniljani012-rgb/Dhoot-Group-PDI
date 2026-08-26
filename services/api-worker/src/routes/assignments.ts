import { Env } from '../index';
﻿import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth';
import { CreateAssignmentSchema } from '@autoprime/validation';

export const assignmentsRouter = new Hono<{ Bindings: Env; Variables: any }>();

// GET /api/v1/assignments
assignmentsRouter.get('/', requireAuth, async (c) => {
  const session = c.get('session');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  let query = supabase.from('pdi_assignments').select(`
    id, status, assigned_at, due_at, notes,
    vehicles ( id, vin, model, variant, color, status, chassis_number ),
    users!pdi_assignments_assigned_to_fkey ( id, first_name, last_name, employee_id )
  `).order('assigned_at', { ascending: false });

  if (session.role === 'PDI_ENGINEER') {
    query = query.eq('assigned_to', session.userId);
  }

  const { data, error } = await query;
  if (error) {
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: error.message, requestId: c.get('requestId') } }, 500);
  }

  return c.json({ success: true, data });
});

// POST /api/v1/assignments (Create PDI Assignment)
assignmentsRouter.post('/', requireAuth, async (c) => {
  const session = c.get('session');
  if (!['SUPER_ADMIN', 'HO_ADMIN', 'BRANCH_MANAGER'].includes(session.role)) {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Only managers can assign PDI tasks', requestId: c.get('requestId') } }, 403);
  }

  const body = await c.req.json();
  const parsed = CreateAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid assignment payload', details: parsed.error.format(), requestId: c.get('requestId') } }, 400);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const { vehicleId, assignedTo, dueAt, notes } = parsed.data;

  // Create Assignment
  const { data: assignment, error: assignErr } = await supabase.from('pdi_assignments').insert({
    vehicle_id: vehicleId,
    assigned_to: assignedTo,
    assigned_by: session.userId,
    status: 'ASSIGNED',
    due_at: dueAt,
    notes,
  }).select().single();

  if (assignErr) {
    return c.json({ success: false, error: { code: 'ASSIGN_FAILED', message: assignErr.message, requestId: c.get('requestId') } }, 400);
  }

  // Update vehicle status to PDI_PENDING
  await supabase.from('vehicles').update({ status: 'PDI_PENDING' }).eq('id', vehicleId);
  await supabase.from('vehicle_status_history').insert({
    vehicle_id: vehicleId,
    from_status: 'RECEIVED',
    to_status: 'PDI_PENDING',
    changed_by: session.userId,
    notes: 'PDI Assigned to engineer',
  });

  return c.json({ success: true, data: assignment }, 201);
});
