import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { branchesRouter } from './routes/branches';
import { devicesRouter } from './routes/devices';
import { errorHandler } from './middleware/error';
import { correlationId } from './middleware/correlation';
import { structuredLogger } from './middleware/logger';

export interface Env {
  ENVIRONMENT: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  MEDIA_BUCKET?: any;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', correlationId());
app.use('*', structuredLogger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'Idempotency-Key'],
}));

app.onError(errorHandler);

app.get('/health', (c) => c.json({ status: 'healthy', env: c.env.ENVIRONMENT || 'development', timestamp: new Date().toISOString() }));

const v1 = new Hono<{ Bindings: Env }>();
v1.route('/auth', authRouter);
v1.route('/users', usersRouter);
v1.route('/branches', branchesRouter);
v1.route('/devices', devicesRouter);

app.route('/api/v1', v1);

export default app;
