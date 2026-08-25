import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, ArrowRight, UserCheck, Car, Clock, 
  Search, Filter, Plus, ShieldCheck, CheckCircle2 
} from 'lucide-react';

export const PdiQueuePage: React.FC = () => {
  const [searchVin, setSearchVin] = useState('');

  const sessions = [
    {
      id: '88888888-8888-8888-8888-888888888881',
      vin: 'MAT612345S9988776',
      brand: 'TATA',
      model: 'Tata Safari Accomplished Plus 6S (Dark Edition)',
      yardLocation: 'Pune Stockyard • Bay 4',
      inspector: 'Vikram Malhotra (DG002)',
      progress: 58,
      passed: 24,
      failed: 1,
      total: 42,
      status: 'IN_PROGRESS',
      updatedAt: 'Today, 02:45 PM',
    },
    {
      id: '88888888-8888-8888-8888-888888888882',
      vin: 'MAT612345H7654321',
      brand: 'TATA',
      model: 'Tata Harrier Fearless Plus Dark',
      yardLocation: 'Mumbai Stockyard • Bay 2',
      inspector: 'Amit Verma (DG004)',
      progress: 15,
      passed: 6,
      failed: 0,
      total: 42,
      status: 'IN_PROGRESS',
      updatedAt: 'Today, 01:15 PM',
    },
    {
      id: '88888888-8888-8888-8888-888888888883',
      vin: 'MAL612345C1122334',
      brand: 'HYUNDAI',
      model: 'Hyundai Creta SX (O) Turbo Petrol DCT',
      yardLocation: 'Nashik Stockyard • Bay 1',
      inspector: 'Rahul Patil (DG007)',
      progress: 0,
      passed: 0,
      failed: 0,
      total: 42,
      status: 'PENDING_START',
      updatedAt: 'Assigned 1 hour ago',
    }
  ];

  const filteredSessions = sessions.filter(s => 
    s.vin.toLowerCase().includes(searchVin.toLowerCase()) || 
    s.model.toLowerCase().includes(searchVin.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Top Title & Search Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Stockyard PDI Inspections</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Active pre-delivery inspection sessions assigned to field engineers
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by VIN or Car model..."
              value={searchVin}
              onChange={(e) => setSearchVin(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
            />
          </div>

          <Link
            to="/vehicles"
            className="px-4 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New PDI</span>
          </Link>
        </div>
      </div>

      {/* Grid of Inspection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map((s) => (
          <div 
            key={s.id} 
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
          >
            {/* Card Header: Brand, Status, and Model */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full border ${
                  s.brand === 'TATA' 
                    ? 'bg-blue-50 text-blue-800 border-blue-200' 
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                }`}>
                  {s.brand} OEM
                </span>

                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  s.status === 'IN_PROGRESS' 
                    ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {s.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending Start'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#0F172A] leading-snug">{s.model}</h3>
                <p className="text-xs font-mono font-semibold text-slate-400 mt-1">VIN: {s.vin}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.yardLocation}</p>
              </div>
            </div>

            {/* Progress Bar & Counters */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-500">
                  {s.passed} Checked {s.failed > 0 && <span className="text-rose-600">({s.failed} Defects)</span>}
                </span>
                <span className="font-extrabold text-[#0F172A] font-mono">{s.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            </div>

            {/* Card Footer: Assigned Engineer & 1-Click Action */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span className="truncate max-w-[130px]">{s.inspector}</span>
              </div>

              <Link
                to={`/pdi/${s.id}`}
                className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>{s.progress > 0 ? 'Resume Sheet' : 'Start Inspection'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
