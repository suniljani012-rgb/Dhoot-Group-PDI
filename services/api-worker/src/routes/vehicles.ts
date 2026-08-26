import { Env } from '../index';
﻿import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth';
import { CreateVehicleSchema, TransitionVehicleStatusSchema } from '@autoprime/validation';
import { isValidVehicleTransition } from '@autoprime/domain';
import { VehicleStatus } from '@autoprime/types';

export const vehiclesRouter = new Hono<{ Bindings: Env; Variables: any }>();

// GET /api/v1/vehicles (List with filters & search)
vehiclesRouter.get('/', requireAuth, async (c) => {
  const session = c.get('session');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const status = c.req.query('status');
  const search = c.req.query('search');
  const branchId = c.req.query('branchId');

  let query = supabase.from('vehicles').select(`
    id, vin, chassis_number, engine_number, model, variant, fuel_type,
    transmission, color, manufacturing_year, status, received_at, branch_id
  `).order('created_at', { ascending: false });

  if (session.role !== 'SUPER_ADMIN' && session.role !== 'HO_ADMIN' && session.branchId) {
    query = query.eq('branch_id', session.branchId);
  } else if (branchId) {
    query = query.eq('branch_id', branchId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`vin.ilike.%${search}%,chassis_number.ilike.%${search}%,model.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: error.message, requestId: c.get('requestId') } }, 500);
  }

  return c.json({ success: true, data });
});

// GET /api/v1/vehicles/lookup/:vin (For Scanner)
vehiclesRouter.get('/lookup/:vin', requireAuth, async (c) => {
  const vin = c.req.param('vin').toUpperCase().trim();
  const session = c.get('session');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  let query = supabase.from('vehicles').select(`
    *,
    branches ( name, code ),
    pdi_assignments ( id, assigned_to, status, assigned_at )
  `).eq('vin', vin);

  if (session.role !== 'SUPER_ADMIN' && session.role !== 'HO_ADMIN' && session.branchId) {
    query = query.eq('branch_id', session.branchId);
  }

  const { data, error } = await query.single();
  if (error || !data) {
    return c.json({ success: false, error: { code: 'VEHICLE_NOT_FOUND', message: `No vehicle found with VIN: ${vin}`, requestId: c.get('requestId') } }, 404);
  }

  return c.json({ success: true, data });
});

// POST /api/v1/vehicles (Register incoming vehicle)
vehiclesRouter.post('/', requireAuth, async (c) => {
  const session = c.get('session');
  if (!['SUPER_ADMIN', 'HO_ADMIN', 'BRANCH_MANAGER'].includes(session.role)) {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Only branch managers can register vehicles', requestId: c.get('requestId') } }, 403);
  }

  const body = await c.req.json();
  const parsed = CreateVehicleSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid vehicle payload', details: parsed.error.format(), requestId: c.get('requestId') } }, 400);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const vehicleData = {
    organization_id: session.organizationId,
    branch_id: parsed.data.branchId || session.branchId,
    stockyard_id: parsed.data.stockyardId,
    vin: parsed.data.vin,
    chassis_number: parsed.data.chassisNumber,
    engine_number: parsed.data.engineNumber,
    model: parsed.data.model,
    variant: parsed.data.variant,
    fuel_type: parsed.data.fuelType,
    transmission: parsed.data.transmission,
    color: parsed.data.color,
    manufacturing_year: parsed.data.manufacturingYear,
    status: 'RECEIVED',
  };

  const { data, error } = await supabase.from('vehicles').insert(vehicleData).select().single();
  if (error) {
    return c.json({ success: false, error: { code: 'INSERT_FAILED', message: error.message, requestId: c.get('requestId') } }, 400);
  }

  // Record initial history
  await supabase.from('vehicle_status_history').insert({
    vehicle_id: data.id,
    from_status: null,
    to_status: 'RECEIVED',
    changed_by: session.userId,
    notes: 'Vehicle arrived at stockyard',
  });

  return c.json({ success: true, data }, 201);
});

// POST /api/v1/vehicles/:id/status (Transition State Machine)
vehiclesRouter.post('/:id/status', requireAuth, async (c) => {
  const vehicleId = c.req.param('id');
  const session = c.get('session');
  const body = await c.req.json();
  const parsed = TransitionVehicleStatusSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid status payload', details: parsed.error.format(), requestId: c.get('requestId') } }, 400);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const { data: vehicle, error: fetchErr } = await supabase.from('vehicles').select('id, status, branch_id').eq('id', vehicleId).single();
  if (fetchErr || !vehicle) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Vehicle not found', requestId: c.get('requestId') } }, 404);
  }

  const currentStatus = vehicle.status as VehicleStatus;
  const targetStatus = parsed.data.toStatus as VehicleStatus;

  // Validate state machine rule
  const isAllowed = isValidVehicleTransition(currentStatus, targetStatus, session.role);
  if (!isAllowed) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_TRANSITION',
        message: `Transition from ${currentStatus} to ${targetStatus} is not permitted for role ${session.role}`,
        requestId: c.get('requestId'),
      },
    }, 400);
  }

  const { data: updated, error: updateErr } = await supabase
    .from('vehicles')
    .update({ status: targetStatus, updated_at: new Date().toISOString() })
    .eq('id', vehicleId)
    .select()
    .single();

  if (updateErr) {
    return c.json({ success: false, error: { code: 'UPDATE_FAILED', message: updateErr.message, requestId: c.get('requestId') } }, 500);
  }

  await supabase.from('vehicle_status_history').insert({
    vehicle_id: vehicleId,
    from_status: currentStatus,
    to_status: targetStatus,
    changed_by: session.userId,
    reason: parsed.data.reason,
    notes: parsed.data.notes,
  });

  return c.json({ success: true, data: updated });
});
