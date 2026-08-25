import { Context, Next } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { SessionContext, UserRole } from '@autoprime/types';

export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authentication token is missing or invalid',
        requestId: c.get('requestId') || 'req-unknown',
      },
    }, 401);
  }

  const token = authHeader.substring(7);
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return c.json({
      success: false,
      error: {
        code: 'AUTH_INVALID',
        message: 'Invalid or expired authentication session',
        requestId: c.get('requestId') || 'req-unknown',
      },
    }, 401);
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, email, employee_id, organization_id, branch_id, user_roles ( roles ( code ) )')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    return c.json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User profile does not exist or is inactive',
        requestId: c.get('requestId'),
      },
    }, 403);
  }

  const roleCode = (userProfile.user_roles as any)?.[0]?.roles?.code as UserRole || 'VIEWER';

  const session: SessionContext = {
    userId: userProfile.id,
    email: userProfile.email,
    employeeId: userProfile.employee_id,
    role: roleCode,
    organizationId: userProfile.organization_id,
    branchId: userProfile.branch_id,
    sessionId: user.id,
  };

  c.set('session', session);
  return next();
}
