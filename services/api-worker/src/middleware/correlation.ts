import { Context, Next } from 'hono';

export function correlationId() {
  return async (c: Context, next: Next) => {
    const correlationId = c.req.header('X-Correlation-ID') || crypto.randomUUID();
    c.set('requestId', correlationId);
    c.header('X-Correlation-ID', correlationId);
    await next();
  };
}
