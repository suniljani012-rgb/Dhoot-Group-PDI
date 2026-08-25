import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

export const usersRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/users — List all enterprise users
usersRouter.get('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const brand = c.req.query('brand');
  const nature = c.req.query('nature');
  const status = c.req.query('status');
  const search = c.req.query('search');

  let query = supabase.from('users').select('*').order('user_code', { ascending: true });

  if (brand && brand !== 'ALL') {
    query = query.or(`brand.eq.${brand},brand.eq.ALL`);
  }
  if (nature && nature !== 'ALL') {
    query = query.eq('nature', nature);
  }
  if (status && status !== 'ALL') {
    query = query.eq('status', status);
  }
  if (search) {
    query = query.or(`user_name.ilike.%${search}%,user_code.ilike.%${search}%,employee_id.ilike.%${search}%,mail_id.ilike.%${search}%,mobile_number.ilike.%${search}%,designation.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    return c.json({ success: false, error: { message: error.message } }, 500);
  }

  return c.json({ success: true, data: data || [], meta: { total: data?.length || 0 } });
});

// GET /api/v1/users/masters — Fetch designations and nature types
usersRouter.get('/masters', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

  const [desigRes, natureRes] = await Promise.all([
    supabase.from('master_designations').select('*').order('title'),
    supabase.from('master_nature_types').select('*').order('name'),
  ]);

  return c.json({
    success: true,
    data: {
      designations: desigRes.data || [],
      natures: natureRes.data || [],
      brands: ['Autoprime Tata', 'Raja Hyundai', 'ALL (Dual Brand Access)'],
      branchCodes: ['HO-DHOOT', 'BR-PUN-01', 'BR-MUM-01', 'BR-JPR-01', 'BR-JDH-01']
    }
  });
});

// POST /api/v1/users — Create new enterprise user with auto-incrementing DG00X
usersRouter.post('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const body = await c.req.json();

  // Find all DG users to calculate maximum number
  const { data: allDgUsers } = await supabase
    .from('users')
    .select('user_code')
    .like('user_code', 'DG%');

  let maxNum = 0;
  if (allDgUsers && allDgUsers.length > 0) {
    for (const u of allDgUsers) {
      if (u.user_code) {
        const num = parseInt(u.user_code.replace('DG', ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }

  const nextNumber = maxNum + 1;
  const generatedUserCode = `DG${nextNumber.toString().padStart(3, '0')}`;
  const employeeId = body.employeeId || body.employee_id || generatedUserCode;

  // Resolve Organization ID based on Brand
  let orgId = '11111111-1111-1111-1111-111111111111'; // Default Tata
  if (body.brand === 'Raja Hyundai') {
    orgId = '11111111-1111-1111-1111-111111111112';
  }

  const newUserRecord = {
    id: crypto.randomUUID(),
    user_code: generatedUserCode,
    employee_id: employeeId,
    user_name: body.userName || body.user_name,
    first_name: (body.userName || body.user_name || '').split(' ')[0] || 'User',
    last_name: (body.userName || body.user_name || '').split(' ').slice(1).join(' ') || '',
    password_hash: body.password || body.password_hash || 'Dhootgroup@123',
    date_of_birth: body.dateOfBirth || body.date_of_birth || null,
    mail_id: body.mailId || body.mail_id || `${generatedUserCode.toLowerCase()}@dhootgroup.com`,
    email: body.mailId || body.mail_id || `${generatedUserCode.toLowerCase()}@dhootgroup.com`,
    mobile_number: body.mobileNumber || body.mobile_number || null,
    phone: body.mobileNumber || body.mobile_number || null,
    branch_code: body.branchCode || body.branch_code || 'HO-01',
    designation: body.designation || 'Staff',
    brand: body.brand || 'Autoprime Tata',
    nature: body.nature || 'Backoffice',
    status: body.status || 'ACTIVE',
    role: body.role || 'BRANCH_MANAGER',
    is_active: body.status !== 'INACTIVE',
    organization_id: orgId
  };

  const { data, error } = await supabase.from('users').insert([newUserRecord]).select().single();

  if (error) {
    return c.json({ success: false, error: { message: error.message } }, 400);
  }

  return c.json({ success: true, data }, 201);
});

// PATCH /api/v1/users/:id — Update existing user
usersRouter.patch('/:id', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const id = c.req.param('id');
  const body = await c.req.json();

  const updateFields: any = {};
  if (body.user_name) updateFields.user_name = body.user_name;
  if (body.password_hash) updateFields.password_hash = body.password_hash;
  if (body.date_of_birth) updateFields.date_of_birth = body.date_of_birth;
  if (body.mail_id) {
    updateFields.mail_id = body.mail_id;
    updateFields.email = body.mail_id;
  }
  if (body.mobile_number) {
    updateFields.mobile_number = body.mobile_number;
    updateFields.phone = body.mobile_number;
  }
  if (body.branch_code) updateFields.branch_code = body.branch_code;
  if (body.designation) updateFields.designation = body.designation;
  if (body.brand) updateFields.brand = body.brand;
  if (body.nature) updateFields.nature = body.nature;
  if (body.status) {
    updateFields.status = body.status;
    updateFields.is_active = body.status === 'ACTIVE';
  }
  if (body.role) updateFields.role = body.role;

  const { data, error } = await supabase.from('users').update(updateFields).eq('id', id).select().single();

  if (error) {
    return c.json({ success: false, error: { message: error.message } }, 400);
  }

  return c.json({ success: true, data });
});

// POST /api/v1/users/masters/designation — Create custom designation
usersRouter.post('/masters/designation', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const { title, nature } = await c.req.json();

  const { data, error } = await supabase.from('master_designations').insert([{ title, nature }]).select().single();
  if (error) return c.json({ success: false, error: { message: error.message } }, 400);

  return c.json({ success: true, data }, 201);
});

// POST /api/v1/users/masters/nature — Create custom nature type
usersRouter.post('/masters/nature', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const { name, description } = await c.req.json();

  const { data, error } = await supabase.from('master_nature_types').insert([{ name, description }]).select().single();
  if (error) return c.json({ success: false, error: { message: error.message } }, 400);

  return c.json({ success: true, data }, 201);
});
