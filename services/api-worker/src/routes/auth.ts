import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { LoginRequestSchema } from '@autoprime/validation';
import { requireAuth } from '../middleware/auth';

export const authRouter = new Hono();

authRouter.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = LoginRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid login payload',
        details: parsed.error.format(),
        requestId: c.get('requestId'),
      },
    }, 400);
  }

  const { employeeId, password, deviceFingerprint, platform } = parsed.data;
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('id, email, is_active, branch_id, organization_id')
    .eq('employee_id', employeeId)
    .single();

  if (userError || !userRecord || !userRecord.is_active) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid Employee ID or Password',
        requestId: c.get('requestId'),
      },
    }, 401);
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: userRecord.email,
    password: password,
  });

  if (authError || !authData.session) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid Employee ID or Password',
        requestId: c.get('requestId'),
      },
    }, 401);
  }

  if (deviceFingerprint && (platform === 'IOS' || platform === 'ANDROID')) {
    await supabase.from('devices').upsert({
      user_id: userRecord.id,
      device_fingerprint: deviceFingerprint,
      platform: platform,
      os_version: parsed.data.osVersion || 'Unknown',
      app_version: parsed.data.appVersion || '1.0.0',
      last_active_at: new Date().toISOString(),
    }, { onConflict: 'user_id, device_fingerprint' });
  }

  await supabase.from('audit_logs').insert({
    organization_id: userRecord.organization_id,
    actor_id: userRecord.id,
    action: 'USER_LOGIN',
    entity_type: 'AUTH_SESSION',
    entity_id: userRecord.id,
    severity: 'INFO',
  });

  return c.json({
    success: true,
    data: {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresAt: authData.session.expires_at,
      user: {
        id: userRecord.id,
        employeeId: employeeId,
        email: userRecord.email,
        branchId: userRecord.branch_id,
        organizationId: userRecord.organization_id,
      },
    },
  });
});

authRouter.get('/me', requireAuth, async (c) => {
  const session = c.get('session');
  return c.json({ success: true, data: session });
});
