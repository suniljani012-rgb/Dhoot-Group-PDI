import { Context, Next } from 'hono';

export function structuredLogger() {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    await next();
    const durationMs = Date.now() - start;

    const logEntry = {
      requestId: c.get('requestId'),
      route: c.req.path,
      method: c.req.method,
      status: c.res.status,
      durationMs,
      timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(logEntry));
  };
}
