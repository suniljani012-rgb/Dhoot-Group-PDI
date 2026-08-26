import { Env } from '../index';
﻿import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth';

export const branchesRouter = new Hono<{ Bindings: Env; Variables: any }>();

branchesRouter.get('/', requireAuth, async (c) => {
  const session = c.get('session');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  let query = supabase.from('branches').select('id, name, code, city, state, pincode, is_active');

  if (session.role !== 'SUPER_ADMIN' && session.role !== 'HO_ADMIN' && session.branchId) {
    query = query.eq('id', session.branchId);
  }

  const { data, error } = await query;
  if (error) {
    return c.json({ success: false, error: { code: 'FETCH_FAILED', message: error.message, requestId: c.get('requestId') } }, 500);
  }

  return c.json({ success: true, data });
});
