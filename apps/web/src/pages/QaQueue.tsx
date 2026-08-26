import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Search, Check, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand } from '../data/seedData';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';

export const QaQueuePage: React.FC = () => {
  const { currentBrand } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvedList, setApprovedList] = useState<string[]>([]);

  useEffect(() => {
    fetchQaQueue();
  }, [currentBrand?.code]);

  const mapQa = (rows: any[]) => {
    return rows
      .filter((v: any) => v.status === 'PDI_APPROVED' || v.status === 'QA_PENDING' || v.status === 'DELIVERY_READY')
      .map((v: any) => ({
        id: v.id || v.vin,
        vin: v.vin,
        model: v.model || 'OEM Vehicle',
        variant: v.variant || 'Standard',
        color: v.color || 'Standard',
        inspector: v.inspector_name || 'Senior PDI Inspector',
        passed: 42,
        failed: 0,
        submittedAt: 'Today, 11:30 AM',
        status: v.status === 'PDI_APPROVED' || v.status === 'DELIVERY_READY' ? 'APPROVED' : 'PENDING',
        certId: `CERT-${v.vin.slice(-6)}`
      }));
  };

  const fetchQaQueue = async () => {
    setLoading(true);
    try {
      const orgParam = currentBrand && currentBrand.code !== 'DHOOT-ALL' ? `?organization_id=${currentBrand.orgId}` : '';
      const res = await fetch(getApiUrl(`/api/v1/stock${orgParam}`));
      if (res.ok) {
        const json = await res.json();
        const rows = json.data || [];
        if (rows.length > 0) {
          setQueue(mapQa(rows));
          setLoading(false);
          return;
        }
      }
      setQueue(mapQa(getVehiclesForBrand(currentBrand.code)));
    } catch (e) {
      setQueue(mapQa(getVehiclesForBrand(currentBrand.code)));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    setApprovedList(prev => [...prev, id]);
  };

  const filteredQueue = queue.filter(item => {
    const vin = (item.vin || '').toLowerCase();
    const model = (item.model || '').toLowerCase();
    const inspector = (item.inspector || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = vin.includes(search) || model.includes(search) || inspector.includes(search);
    const isApproved = approvedList.includes(item.id) || item.status === 'APPROVED';
    if (statusFilter === 'PENDING') return matchesSearch && !isApproved;
    if (statusFilter === 'APPROVED') return matchesSearch && isApproved;
    return matchesSearch;
  });

  const pendingCount = queue.filter(item => !approvedList.includes(item.id) && item.status !== 'APPROVED').length;
  const approvedCount = queue.filter(item => approvedList.includes(item.id) || item.status === 'APPROVED').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* Header */}
      <PageHeader
        title="QA Manager Approvals"
        subtitle="Review completed inspections, sign off quality dockets, and issue digital PDI certificates"
        action={
          <button
            onClick={() => alert('Exporting QA review ledger to Excel...')}
            className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-ok" />
            <span>Export Excel</span>
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total Submissions" value={queue.length} note="Inspection Reports" />
        <Stat label="Pending Review" value={pendingCount} note="Sign-off Required" tone={pendingCount > 0 ? 'warn' : 'default'} />
        <Stat label="Certified & Approved" value={approvedCount} note="Ready for Gatepass" tone="ok" />
        <Stat label="First-Pass Yield" value="98.2%" note="Zero Defect Ratio" />
      </div>

      {/* Main Table Panel */}
      <Panel
        title="QA Sign-Off Queue"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-canvas border border-line rounded p-0.5 text-xs">
              {(['ALL', 'PENDING', 'APPROVED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`h-6 px-2.5 rounded-chip text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-surface text-ink border border-line shadow-xs font-semibold'
                      : 'text-ink-3 hover:text-ink-2'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VIN, model, inspector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-7 pl-7 pr-2.5 text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/90 border-b border-line text-slate-800 font-bold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">VIN / Chassis</th>
                <th className="py-2.5 px-3">Brand & Model</th>
                <th className="py-2.5 px-3">Colour</th>
                <th className="py-2.5 px-3">Inspector</th>
                <th className="py-2.5 px-3">Checklist Score</th>
                <th className="py-2.5 px-3">Submitted Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">QA Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <Empty title="0 QA Submissions Found" hint="Inspections submitted by engineers will appear here for final QA sign-off." />
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item, idx) => {
                  const isApproved = approvedList.includes(item.id) || item.status === 'APPROVED';
                  const isHyundai = item.model.toLowerCase().includes('hyundai') || item.vin.startsWith('MAL');
                  return (
                    <tr key={item.id} className="hover:bg-canvas transition-colors">
                      <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-ink">
                        {item.vin}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Badge tone="accent">{isHyundai ? 'Hyundai' : 'Tata'}</Badge>
                          <span className="font-medium text-ink">{item.model}</span>
                        </div>
                        <div className="text-[10px] text-ink-3">{item.variant}</div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {item.color}
                      </td>
                      <td className="py-2.5 px-3 text-ink">
                        {item.inspector}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-ok tnum">
                        {item.passed} / 42 (100% Pass)
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 tnum text-[10px]">
                        {item.submittedAt}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={isApproved ? 'ok' : 'warn'}>
                          {isApproved ? 'Approved & Certified' : 'QA Review Pending'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {!isApproved ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprove(item.id)}
                              className="h-6 px-2 rounded bg-ok/10 text-ok border border-ok/20 text-xs font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              className="h-6 px-2 rounded bg-danger/10 text-danger border border-danger/20 text-xs font-medium transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <Link
                            to={`/certificates/${item.certId}`}
                            className="h-6 px-2 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-ok" />
                            <span>Certificate</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

    </div>
  );
};
