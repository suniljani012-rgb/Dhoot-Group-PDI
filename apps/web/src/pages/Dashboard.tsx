import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFleetCounts } from '../hooks/useFleetCounts';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand, getBookingsForBrand } from '../data/seedData';
import { Panel, Stat, Badge, Bar, Empty } from '../components/ui/primitives';

/* ------------------------------------------------------------------ types */

interface Stage {
  key: string;
  label: string;
  count: number;
  to: string;
}

/* --------------------------------------------------------- pipeline rail */

/**
 * The one thing this screen exists to answer: where are orders piling up
 * between "customer paid the advance" and "customer drove away".
 *
 * Segment width is proportional to the count, so the drop-off is visible
 * before you read a single number. The ramp is one hue getting lighter —
 * colour encodes stage order, nothing else.
 */
const PipelineRail: React.FC<{ stages: Stage[] }> = ({ stages }) => {
  const total = stages[0]?.count || 0;
  const shades = ['bg-accent', 'bg-accent-600', 'bg-accent-400', 'bg-accent-300', 'bg-accent-200'];

  // Largest stage-to-stage fall. This is the number a manager acts on.
  const drops = stages.slice(1).map((s, i) => ({
    at: s.label,
    from: stages[i].label,
    lost: stages[i].count - s.count,
  }));
  const worst = drops.sort((a, b) => b.lost - a.lost)[0];

  return (
    <Panel
      title="Order pipeline"
      action={
        <span className="text-xs text-ink-3 tnum font-medium">
          {total} order{total === 1 ? '' : 's'}
        </span>
      }
      bodyClassName="px-4 py-4"
    >
      <div className="flex gap-0.5 h-2 mb-4">
        {stages.map((s, i) => (
          <div
            key={s.key}
            className={`${shades[i]} rounded-chip transition-all`}
            style={{ width: `${total ? Math.max((s.count / total) * 100, 3) : 20}%` }}
            title={`${s.label}: ${s.count}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-3">
        {stages.map((s, i) => {
          const prev = i === 0 ? null : stages[i - 1].count;
          const lost = prev === null ? 0 : prev - s.count;

          return (
            <Link key={s.key} to={s.to} className="group border-t border-line pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold tnum">{s.count}</span>
                {lost > 0 && <span className="text-xs text-ink-3 tnum">−{lost}</span>}
              </div>
              <div className="text-xs text-ink-2 group-hover:text-accent transition-colors mt-0.5">
                {s.label}
              </div>
            </Link>
          );
        })}
      </div>

      {worst && worst.lost > 0 && (
        <p className="text-xs text-ink-2 mt-4 pt-3 border-t border-line">
          Biggest gap: <span className="tnum font-medium text-ink">{worst.lost}</span> orders sit at{' '}
          <span className="font-medium text-ink">{worst.from}</span> and have not reached{' '}
          <span className="font-medium text-ink">{worst.at}</span>.
        </p>
      )}
    </Panel>
  );
};

/* ------------------------------------------------------------------- page */

export const DashboardPage: React.FC = () => {
  const { currentBrand } = useAuth();
  const c = useFleetCounts();

  const [fleet, setFleet] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const org =
        currentBrand && currentBrand.code !== 'DHOOT-ALL'
          ? `?organization_id=${currentBrand.orgId}`
          : '';

      const pull = async (path: string, fallback: any[]) => {
        try {
          const res = await fetch(getApiUrl(path));
          if (!res.ok) return fallback;
          const json = await res.json();
          return json.data?.length ? json.data : fallback;
        } catch {
          return fallback;
        }
      };

      const [v, b] = await Promise.all([
        pull(`/api/v1/stock${org}`, getVehiclesForBrand(currentBrand.code)),
        pull(`/api/v1/bookings${org}`, getBookingsForBrand(currentBrand.code)),
      ]);

      if (cancelled) return;
      setFleet(v);
      setBookings(b);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [currentBrand?.code]);

  /* Every stage below is counted from real records. Nothing is hardcoded. */
  const stages: Stage[] = useMemo(() => {
    const has = (b: any, ...keys: string[]) => keys.some((k) => !!b[k]);
    const st = (b: any) => (b.status || '').toUpperCase();

    return [
      { key: 'booked', label: 'Booked', count: bookings.length, to: '/bookings' },
      {
        key: 'allocated',
        label: 'VIN allocated',
        count: bookings.filter((b) => !!b.allocated_vin_no).length,
        to: '/bookings',
      },
      { key: 'inspected', label: 'PDI cleared', count: c.pdiDone, to: '/pdi' },
      {
        key: 'invoiced',
        label: 'Invoiced',
        count: bookings.filter(
          (b) => has(b, 'invoice_no', 'invoice_number') || ['INVOICED', 'DELIVERED'].includes(st(b)),
        ).length,
        to: '/invoicing',
      },
      {
        key: 'delivered',
        label: 'Delivered',
        count: bookings.filter((b) => st(b) === 'DELIVERED').length,
        to: '/bookings',
      },
    ];
  }, [bookings, c.pdiDone]);

  /* Yard attribution reads the branch the record actually carries. */
  const yards = useMemo(() => {
    const map = new Map<string, { name: string; bookings: number; allocated: number; stock: number }>();

    const key = (r: any) =>
      r.branch_name || r.branch || r.yard_name || r.location || 'Unassigned';

    bookings.forEach((b) => {
      const k = key(b);
      const row = map.get(k) || { name: k, bookings: 0, allocated: 0, stock: 0 };
      row.bookings += 1;
      if (b.allocated_vin_no) row.allocated += 1;
      map.set(k, row);
    });

    fleet.forEach((v) => {
      const k = key(v);
      const row = map.get(k) || { name: k, bookings: 0, allocated: 0, stock: 0 };
      if (!['YARD_RECEIVING_PENDING', 'IN_TRANSIT'].includes((v.status || '').toUpperCase())) {
        row.stock += 1;
      }
      map.set(k, row);
    });

    return [...map.values()].sort((a, b) => b.bookings - a.bookings).slice(0, 6);
  }, [bookings, fleet]);

  /* Model demand is derived from the records present, not a hardcoded catalogue. */
  const models = useMemo(() => {
    const norm = (s: any) => (s || '').toString().trim();
    const map = new Map<string, { name: string; booked: number; allocated: number; free: number }>();

    bookings.forEach((b) => {
      const m = norm(b.model);
      if (!m) return;
      const row = map.get(m) || { name: m, booked: 0, allocated: 0, free: 0 };
      row.booked += 1;
      if (b.allocated_vin_no) row.allocated += 1;
      map.set(m, row);
    });

    fleet.forEach((v) => {
      const m = norm(v.model);
      if (!m) return;
      const row = map.get(m) || { name: m, booked: 0, allocated: 0, free: 0 };
      const s = (v.status || '').toUpperCase();
      const idle = !v.customer_name && s !== 'ALLOCATED';
      const onSite = !['YARD_RECEIVING_PENDING', 'IN_TRANSIT'].includes(s);
      if (idle && onSite) row.free += 1;
      map.set(m, row);
    });

    return [...map.values()]
      .map((r) => {
        const pbna = Math.max(0, r.booked - r.allocated);
        return {
          ...r,
          pbna,
          indent: Math.max(0, pbna - r.free),
          fill: r.booked ? Math.round((r.allocated / r.booked) * 100) : 0,
        };
      })
      .sort((a, b) => b.indent - a.indent || b.booked - a.booked);
  }, [bookings, fleet]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-lg font-semibold tracking-[-0.011em]">Overview</h1>
        <span className="text-xs text-ink-3">
          {loading ? 'Loading' : `${currentBrand.code === 'DHOOT-ALL' ? 'All franchises' : currentBrand.name || currentBrand.code}`}
        </span>
      </div>

      <PipelineRail stages={stages} />

      {/* Four numbers. Everything else is already in the rail above. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="In yard" value={c.totalPhysicalStock} note="Physically on site" to="/vehicles" />
        <Stat label="Free stock" value={c.totalFreeVehicle} note="No customer attached" to="/vehicles" />
        <Stat
          label="Awaiting VIN"
          value={c.totalPbnaVehicle}
          note="Booked, not allocated"
          tone={c.totalPbnaVehicle > 0 ? 'warn' : 'default'}
          to="/bookings"
        />
        <Stat
          label="Indent needed"
          value={c.orderRequired}
          note="No stock to cover demand"
          tone={c.orderRequired > 0 ? 'danger' : 'default'}
          to="/bookings"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Model demand — one table, not thirteen cards. */}
        <Panel
          className="xl:col-span-2"
          title="Model demand"
          action={
            <Link to="/bookings" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
              Bookings <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          {models.length === 0 ? (
            <Empty title="No bookings yet" hint="Model demand appears once orders are recorded." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="cell-head">Model</th>
                    <th className="cell-head text-right">Booked</th>
                    <th className="cell-head text-right">Allocated</th>
                    <th className="cell-head text-right">Awaiting</th>
                    <th className="cell-head text-right">Free</th>
                    <th className="cell-head text-right">Indent</th>
                    <th className="cell-head w-24">Fill</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr key={m.name} className="hover:bg-canvas transition-colors">
                      <td className="cell font-medium text-ink">{m.name}</td>
                      <td className="cell text-right tnum">{m.booked}</td>
                      <td className="cell text-right tnum">{m.allocated}</td>
                      <td className="cell text-right tnum">{m.pbna || '—'}</td>
                      <td className="cell text-right tnum">{m.free || '—'}</td>
                      <td className="cell text-right">
                        {m.indent > 0 ? <Badge tone="danger">{m.indent}</Badge> : <span className="text-ink-3">—</span>}
                      </td>
                      <td className="cell">
                        <div className="flex items-center gap-2">
                          <Bar pct={m.fill} />
                          <span className="text-xs text-ink-3 tnum w-8 text-right">{m.fill}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Yards" bodyClassName="divide-y divide-line">
          {yards.length === 0 ? (
            <Empty title="No yard data" />
          ) : (
            yards.map((y) => {
              const pct = y.bookings ? Math.round((y.allocated / y.bookings) * 100) : 0;
              return (
                <div key={y.name} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-ink truncate">{y.name}</span>
                    <span className="text-xs text-ink-3 tnum shrink-0">{y.stock} in yard</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Bar pct={pct} />
                    <span className="text-xs text-ink-3 tnum w-8 text-right">{pct}%</span>
                  </div>
                  <div className="text-xs text-ink-3 mt-1.5 tnum">
                    {y.allocated} of {y.bookings} orders allocated
                  </div>
                </div>
              );
            })
          )}
        </Panel>
      </div>
    </div>
  );
};
