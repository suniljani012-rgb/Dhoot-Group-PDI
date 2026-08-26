import { Env } from '../index';
import { Hono } from 'hono';

export const stockRouter = new Hono<{ Bindings: Env; Variables: any }>();

let localVehiclesStore: any[] = [];

// GET /api/v1/stock
stockRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');

  let results: any[] = [...localVehiclesStore];

  if (orgId && orgId !== 'ALL') {
    results = results.filter(v => v.organization_id === orgId);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(v => 
      (v.vin || '').toLowerCase().includes(q) ||
      (v.model || '').toLowerCase().includes(q) ||
      (v.customer_name || '').toLowerCase().includes(q) ||
      (v.location || '').toLowerCase().includes(q)
    );
  }

  return c.json({ success: true, data: results, meta: { total: results.length } });
});

// POST /api/v1/stock/bulk-import
stockRouter.post('/bulk-import', async (c) => {
  const body = await c.req.json();
  const items = body.vehicles || body.rows || [];
  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: { message: 'Invalid or empty vehicles list' } }, 400);
  }

  // Deduplicate by VIN in worker store
  const map = new Map<string, any>();
  localVehiclesStore.forEach(v => {
    if (v.vin) map.set(v.vin.toUpperCase().trim(), v);
  });

  items.forEach(item => {
    if (item.vin) {
      const key = item.vin.toUpperCase().trim();
      const prev = map.get(key) || {};
      map.set(key, {
        ...prev,
        ...item,
        id: prev.id || item.id || `v-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        created_at: prev.created_at || new Date().toISOString()
      });
    }
  });

  localVehiclesStore = Array.from(map.values());

  return c.json({ 
    success: true, 
    data: { 
      imported_count: items.length, 
      total_count: localVehiclesStore.length 
    } 
  }, 201);
});
