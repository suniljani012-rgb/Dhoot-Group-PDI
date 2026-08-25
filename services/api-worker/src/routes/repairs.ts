import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth';

export const repairsRouter = new Hono();

// GET /api/v1/repairs (Workshop ticket queue)
repairsRouter.get('/', requireAuth, async (c) => {
  const session = c.get('session');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  let query = supabase.from('repair_tickets').select(`
    id, priority, status, parts_required, work_notes, created_at, completed_at,
    vehicles ( id, vin, model, variant, color ),
    inspection_findings ( id, severity, body_area, description )
  `).order('created_at', { ascending: false });

  if (session.role !== 'SUPER_ADMIN' && session.role !== 'HO_ADMIN' && session.branchId) {
    query = query.eq('branch_id', session.branchId);
  }

  const { data, error } = await query;
  if (error) {
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: error.message, requestId: c.get('requestId') } }, 500);
  }

  return c.json({ success: true, data });
});

// PATCH /api/v1/repairs/:id/status (Update repair progress & complete)
repairsRouter.patch('/:id/status', requireAuth, async (c) => {
  const ticketId = c.req.param('id');
  const body = await c.req.json();
  const { status, workNotes, partsRequired } = body;

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
  if (workNotes) updates.work_notes = workNotes;
  if (partsRequired) updates.parts_required = partsRequired;
  if (status === 'COMPLETED') {
    updates.completed_at = new Date().toISOString();
  }

  const { data: ticket, error } = await supabase.from('repair_tickets').update(updates).eq('id', ticketId).select().single();
  if (error) {
    return c.json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message, requestId: c.get('requestId') } }, 500);
  }

  // If completed, transition vehicle to REPAIR_COMPLETED -> REINSPECTION
  if (status === 'COMPLETED') {
    await supabase.from('vehicles').update({ status: 'REPAIR_COMPLETED' }).eq('id', ticket.vehicle_id);
    await supabase.from('inspection_findings').update({ status: 'RESOLVED' }).eq('id', ticket.finding_id);
  }

  return c.json({ success: true, data: ticket });
});
