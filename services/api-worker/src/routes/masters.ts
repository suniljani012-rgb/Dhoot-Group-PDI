import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

export const mastersRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/masters/all — Comprehensive Automotive Masters
mastersRouter.get('/all', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

  const [modelsRes, finRes, insRes, branchesRes, desigRes, natureRes] = await Promise.all([
    supabase.from('master_vehicle_models').select('*').order('brand'),
    supabase.from('master_financiers').select('*').order('name'),
    supabase.from('master_insurance_providers').select('*').order('name'),
    supabase.from('branches').select('*').order('name'),
    supabase.from('master_designations').select('*').order('title'),
    supabase.from('master_nature_types').select('*').order('name')
  ]);

  return c.json({
    success: true,
    data: {
      vehicleModels: modelsRes.data || [],
      financiers: finRes.data || [],
      insuranceProviders: insRes.data || [],
      branches: branchesRes.data || [],
      designations: desigRes.data || [],
      natures: natureRes.data || []
    }
  });
});

// POST /api/v1/masters/vehicle-models — Add OEM Model
mastersRouter.post('/vehicle-models', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const body = await c.req.json();

  const { data, error } = await supabase.from('master_vehicle_models').insert([{
    brand: body.brand,
    model_name: body.model_name || body.modelName,
    body_type: body.body_type || body.bodyType || 'SUV',
    fuel_types: body.fuel_types || body.fuelTypes || ['PETROL'],
    variants: body.variants || [],
    colors: body.colors || [],
    base_ex_showroom: parseFloat(body.base_ex_showroom || body.basePrice || '1000000') || 1000000
  }]).select().single();

  if (error) return c.json({ success: false, error: { message: error.message } }, 400);
  return c.json({ success: true, data }, 201);
});

// POST /api/v1/masters/financiers — Add Financier Bank
mastersRouter.post('/financiers', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const body = await c.req.json();

  const { data, error } = await supabase.from('master_financiers').insert([{
    name: body.name,
    category: body.category || 'PRIVATE_BANK',
    contact_person: body.contactPerson || body.contact_person,
    contact_phone: body.contactPhone || body.contact_phone
  }]).select().single();

  if (error) return c.json({ success: false, error: { message: error.message } }, 400);
  return c.json({ success: true, data }, 201);
});

// POST /api/v1/masters/insurance — Add Insurance Provider
mastersRouter.post('/insurance', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const body = await c.req.json();

  const { data, error } = await supabase.from('master_insurance_providers').insert([{
    name: body.name,
    code: body.code
  }]).select().single();

  if (error) return c.json({ success: false, error: { message: error.message } }, 400);
  return c.json({ success: true, data }, 201);
});
