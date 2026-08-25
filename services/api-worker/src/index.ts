import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { branchesRouter } from './routes/branches';
import { devicesRouter } from './routes/devices';
import { vehiclesRouter } from './routes/vehicles';
import { assignmentsRouter } from './routes/assignments';
import { pdiRouter } from './routes/pdi';
import { mediaRouter } from './routes/media';
import { findingsRouter } from './routes/findings';
import { repairsRouter } from './routes/repairs';
import { qaRouter } from './routes/qa';
import { certificatesRouter, publicVerifyRouter } from './routes/certificates';
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
v1.route('/vehicles', vehiclesRouter);
v1.route('/assignments', assignmentsRouter);
v1.route('/pdi', pdiRouter);
v1.route('/media', mediaRouter);
v1.route('/findings', findingsRouter);
v1.route('/repairs', repairsRouter);
v1.route('/qa', qaRouter);
v1.route('/certificates', certificatesRouter);
v1.route('/verify', publicVerifyRouter);

app.route('/api/v1', v1);

export default app;
