import { Context } from 'hono';

export async function errorHandler(err: Error, c: Context) {
  console.error('Unhandled API Error:', err);
  const requestId = c.get('requestId') || crypto.randomUUID();

  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      requestId,
    },
  }, 500);
}
