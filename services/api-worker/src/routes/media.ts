import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth';

export const mediaRouter = new Hono();

// POST /api/v1/media/presign-upload
mediaRouter.post('/presign-upload', requireAuth, async (c) => {
  const session = c.get('session');
  const body = await c.req.json();
  const { vehicleId, sessionId, slotCode, contentType, fileSizeBytes } = body;

  if (!vehicleId || !slotCode) {
    return c.json({ success: false, error: { code: 'INVALID_PAYLOAD', message: 'vehicleId and slotCode required', requestId: c.get('requestId') } }, 400);
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);
  const objectKey = `${c.env.ENVIRONMENT || 'dev'}/vehicles/${vehicleId}/pdi/${sessionId || 'general'}/${slotCode}_${Date.now()}.webp`;

  // Create attachment record
  const { data: attachment, error } = await supabase.from('attachments').insert({
    organization_id: session.organizationId,
    vehicle_id: vehicleId,
    session_id: sessionId,
    slot_code: slotCode,
    object_key: objectKey,
    content_type: contentType || 'image/webp',
    file_size_bytes: fileSizeBytes || 0,
    status: 'PENDING',
  }).select().single();

  if (error) {
    return c.json({ success: false, error: { code: 'ATTACHMENT_CREATE_FAILED', message: error.message, requestId: c.get('requestId') } }, 500);
  }

  return c.json({
    success: true,
    data: {
      attachmentId: attachment.id,
      objectKey,
      uploadUrl: `https://autoprime-pdi.r2.cloudflarestorage.com/${objectKey}`,
      expiresInSeconds: 900,
    },
  });
});

// POST /api/v1/media/confirm-upload
mediaRouter.post('/confirm-upload', requireAuth, async (c) => {
  const body = await c.req.json();
  const { attachmentId } = body;

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);
  const { data, error } = await supabase.from('attachments').update({ status: 'UPLOADED', updated_at: new Date().toISOString() }).eq('id', attachmentId).select().single();

  if (error) {
    return c.json({ success: false, error: { code: 'CONFIRM_FAILED', message: error.message, requestId: c.get('requestId') } }, 500);
  }

  return c.json({ success: true, data });
});
