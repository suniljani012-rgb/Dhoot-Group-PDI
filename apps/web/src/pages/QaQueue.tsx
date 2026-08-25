import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, CheckCircle2, XCircle, FileText, ArrowRight, 
  Search, Filter, Check, FileSpreadsheet, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const QaQueuePage: React.FC = () => {
  const { currentBrand } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');

  const [queue, setQueue] = useState([
    {
      id: 'sess-01',
      vin: 'MAT612345C1122334',
      model: 'Tata Curvv.ev Empowered Plus 55',
      variant: '55kWh Long Range',
      color: 'Pristine White',
      inspector: 'Rajesh Sharma (DG003)',
      passed: 42,
      failed: 0,
      submittedAt: 'Today, 01:15 PM',
      status: 'PENDING',
      certId: 'cert-101',
    },
    {
      id: 'sess-02',
      vin: 'MAT612345S9988776',
      model: 'Tata Safari Accomplished Plus',
      variant: 'Dark Edition Kryotec AT',
      color: 'Oberon Black',
      inspector: 'Amit Verma (DG004)',
      passed: 42,
      failed: 0,
      submittedAt: 'Today, 02:00 PM',
      status: 'PENDING',
      certId: 'cert-102',
    },
    {
      id: 'sess-03',
      vin: 'MALC12345C1122334',
      model: 'Hyundai Creta SX (O) Turbo',
      variant: '1.5L Turbo Petrol 7DCT',
      color: 'Ranger Khaki',
      inspector: 'Rahul Patil (DG007)',
      passed: 42,
      failed: 0,
      submittedAt: 'Today, 11:45 AM',
      status: 'APPROVED',
      certId: 'cert-103',
    }
  ]);

  const [approvedList, setApprovedList] = useState<string[]>(['sess-03']);

  const handleApprove = (id: string) => {
    setApprovedList(prev => [...prev, id]);
  };

  const filteredQueue = queue.filter(item => {
    const matchesSearch = item.vin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isApproved = approvedList.includes(item.id);
    if (statusFilter === 'PENDING') return matchesSearch && !isApproved;
    if (statusFilter === 'APPROVED') return matchesSearch && isApproved;
    return matchesSearch;
  });

  return (
    <div className="space-y-5 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 leading-tight">
            Quality Assurance & Certification Review Queue
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Verify completed inspections, approve delivery readiness, and issue digital vehicle certificates
          </p>
        </div>

        <button
          onClick={() => alert('Exporting QA review ledger to Excel...')}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Dense Excel-Style QA Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
            {(['ALL', 'PENDING', 'APPROVED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  statusFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search VIN, Model, Inspector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
            />
          </div>
        </div>

        {/* Excel Data Grid */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">VIN Number</th>
                <th className="py-2.5 px-3">Brand / Model</th>
                <th className="py-2.5 px-3">Colour</th>
                <th className="py-2.5 px-3">Assigned Inspector</th>
                <th className="py-2.5 px-3">Checklist Score</th>
                <th className="py-2.5 px-3">Submitted Time</th>
                <th className="py-2.5 px-3">QA Status</th>
                <th className="py-2.5 px-3 text-center">Quality Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
              {filteredQueue.map((item) => {
                const isApproved = approvedList.includes(item.id);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {item.vin}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.model}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{item.variant}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                        {item.color}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold">
                      {item.inspector}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      {item.passed} / 42 (100% Pass)
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[10px]">
                      {item.submittedAt}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {isApproved ? 'Approved & Certified' : 'QA Review Pending'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {!isApproved ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            className="px-2.5 py-1 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <Link
                          to={`/certificates/${item.certId}`}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 shadow-xs"
                        >
                          <FileText className="w-3 h-3 text-emerald-400" />
                          <span>Certificate</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing {filteredQueue.length} QA review items</span>
          <span className="font-mono text-slate-500">Quality Telemetry Active</span>
        </div>

      </div>

    </div>
  );
};
