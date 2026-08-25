import React, { useState } from 'react';
import { Wrench, AlertTriangle, CheckCircle2, Clock, Check } from 'lucide-react';

export const RepairsPage: React.FC = () => {
  const [tickets, setTickets] = useState([
    {
      id: 'rep-01',
      vin: 'MAT612345N1234567',
      model: 'Tata Nexon Fearless Plus',
      area: 'FRONT_BUMPER',
      severity: 'MAJOR',
      description: 'Panel gap mismatch near left headlamp assembly',
      priority: 'HIGH',
      status: 'OPEN',
      assignedTo: 'Vikram Singh (TECH-02)',
      createdAt: '25 Aug 2026, 12:45 PM',
    },
    {
      id: 'rep-02',
      vin: 'MAT612345P4455667',
      model: 'Tata Punch Creative iCNG',
      area: 'INTERIOR_AC',
      severity: 'CRITICAL',
      description: 'AC blower speed knob loose / erratic resistance',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      assignedTo: 'Suresh Patil (TECH-01)',
      createdAt: '25 Aug 2026, 10:20 AM',
    },
  ]);

  const markComplete = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'COMPLETED' } : t))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A2E]">Workshop Defect & Repair Queue</h2>
          <p className="text-sm text-[#718096]">Defect tickets automatically triggered from failed PDI findings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets.map((t) => (
          <div key={t.id} className="bg-white border border-[#DEE2E8] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    t.severity === 'CRITICAL' ? 'bg-[#FEECEC] text-[#C62828]' : 'bg-[#FEF7E8] text-[#92600A]'
                  }`}>
                    {t.severity} DEFECT
                  </span>
                  <span className="text-xs font-mono text-[#718096]">{t.area}</span>
                </div>
                <h3 className="text-base font-bold text-[#1A1A2E] mt-2">{t.model}</h3>
                <p className="text-xs font-mono text-[#718096]">VIN: {t.vin}</p>
              </div>

              <div className="p-3 bg-[#EBF3FD] text-[#1565A8] rounded-xl">
                <Wrench className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded-lg text-sm text-[#1A1A2E]">
              <span className="text-xs text-[#718096] block font-medium mb-1">Issue Description:</span>
              {t.description}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#DEE2E8]">
              <div className="text-xs text-[#718096]">
                <span>Status: </span>
                <strong className={t.status === 'COMPLETED' ? 'text-[#1A7C4A]' : 'text-[#1A3A6B]'}>
                  {t.status}
                </strong>
              </div>

              {t.status !== 'COMPLETED' ? (
                <button
                  onClick={() => markComplete(t.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A7C4A] hover:bg-[#146039] text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Mark Repaired
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A7C4A]">
                  <CheckCircle2 className="w-4 h-4" /> Ready for Reinspection
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
