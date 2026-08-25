import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth';

export const usersRouter = new Hono();

usersRouter.get('/', requireAuth, async (c) => {
  const session = c.get('session');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  let query = supabase.from('users').select('id, employee_id, first_name, last_name, email, phone, is_active, branch_id, organization_id, created_at');

  if (session.role !== 'SUPER_ADMIN' && session.role !== 'HO_ADMIN' && session.branchId) {
    query = query.eq('branch_id', session.branchId);
  }

  const { data, error } = await query;

  if (error) {
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: error.message, requestId: c.get('requestId') } }, 500);
  }

  return c.json({ success: true, data });
});
