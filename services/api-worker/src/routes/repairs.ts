import { Hono } from 'hono';

export const repairsRouter = new Hono();

let localRepairsStore: any[] = [
  {
    id: "rep-1",
    ticket_no: "REP-2026-0041",
    vin: "MAT612345N1234563",
    model: "Tata Nexon Fearless+ S DT",
    color: "Daytona Grey",
    status: "OPEN",
    priority: "HIGH",
    severity: "MAJOR",
    bay: "Workshop Bay 1",
    technician: "Vikram Sonawane",
    defect_description: "Front left bumper lower splitter transit rub scratch (3.5cm) observed during yard inward",
    action_taken: "Buffing and touch-up clear coat application",
    parts_required: "Bumper refinish lacquer",
    created_at: "2026-08-22T14:30:00Z"
  },
  {
    id: "rep-2",
    ticket_no: "REP-2026-0042",
    vin: "MALC12345V3344553",
    model: "Hyundai Verna SX (O) Turbo",
    color: "Abyss Black",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    severity: "MINOR",
    bay: "Workshop Bay 2",
    technician: "Suresh Prajapati",
    defect_description: "Driver side ORVM auto-fold actuator connector clip loose",
    action_taken: "Connector harness reseating and electrical diagnostic check",
    parts_required: "Harness clip fastener",
    created_at: "2026-08-23T11:00:00Z"
  }
];

// GET /api/v1/repairs
repairsRouter.get('/', async (c) => {
  return c.json({ success: true, data: localRepairsStore, meta: { total: localRepairsStore.length } });
});

// PATCH /api/v1/repairs/:id/status
repairsRouter.patch('/:id/status', async (c) => {
  const ticketId = c.req.param('id');
  const body = await c.req.json();
  const { status, workNotes, partsRequired } = body;

  let updatedRecord = null;
  localRepairsStore = localRepairsStore.map(r => {
    if (r.id === ticketId || r.ticket_no === ticketId) {
      updatedRecord = {
        ...r,
        status: status || r.status,
        work_notes: workNotes || r.action_taken,
        parts_required: partsRequired || r.parts_required,
        completed_at: status === 'COMPLETED' ? new Date().toISOString() : r.completed_at
      };
      return updatedRecord;
    }
    return r;
  });

  return c.json({ success: true, data: updatedRecord || localRepairsStore[0] });
});
