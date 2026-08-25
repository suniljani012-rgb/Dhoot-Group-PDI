import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth';

export const certificatesRouter = new Hono();

// GET /api/v1/certificates/:id
certificatesRouter.get('/:id', requireAuth, async (c) => {
  const certId = c.req.param('id');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);

  const { data, error } = await supabase.from('pdi_certificates').select(`
    *,
    vehicles ( vin, model, variant, color, chassis_number, fuel_type, engine_number ),
    branches ( name, city, address ),
    users!pdi_certificates_issued_by_fkey ( first_name, last_name, employee_id )
  `).eq('id', certId).single();

  if (error || !data) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Certificate not found', requestId: c.get('requestId') } }, 404);
  }

  return c.json({ success: true, data });
});

// GET /api/v1/verify/:qrToken (PUBLIC QR VERIFICATION)
export const publicVerifyRouter = new Hono();

publicVerifyRouter.get('/:qrToken', async (c) => {
  const qrToken = c.req.param('qrToken');
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

  const { data, error } = await supabase.from('pdi_certificates').select(`
    certificate_number, issued_at,
    vehicles ( vin, model, variant, color ),
    branches ( name, city )
  `).eq('verification_qr_token', qrToken).single();

  if (error || !data) {
    return c.json({ success: false, error: { code: 'INVALID_CERTIFICATE', message: 'Invalid or counterfeit QR code', requestId: c.get('requestId') } }, 404);
  }

  return c.json({
    success: true,
    data: {
      verified: true,
      certificateNumber: data.certificate_number,
      issuedAt: data.issued_at,
      vehicle: data.vehicles,
      branch: data.branches,
      authority: 'Autoprime Tata — Dhoot Group PDI Quality Department',
    },
  });
});
