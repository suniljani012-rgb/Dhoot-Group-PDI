import React from 'react';
import { Car, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const kpis = [
    { label: 'Total Pending PDI', value: '28', icon: Clock, color: 'text-[#92600A]', bg: 'bg-[#FEF7E8]' },
    { label: 'Passed & Delivery Ready', value: '142', icon: CheckCircle2, color: 'text-[#1A7C4A]', bg: 'bg-[#EBF7F1]' },
    { label: 'Active Repairs', value: '6', icon: AlertTriangle, color: 'text-[#C62828]', bg: 'bg-[#FEECEC]' },
    { label: 'Total Stockyard Vehicles', value: '176', icon: Car, color: 'text-[#1565A8]', bg: 'bg-[#EBF3FD]' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A2E]">Operations Dashboard</h2>
        <p className="text-sm text-[#718096]">Autoprime Tata — Stockyard & Inspection Queue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white border border-[#DEE2E8] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#718096]">{kpi.label}</span>
                <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-4 text-3xl font-bold text-[#1A1A2E]">{kpi.value}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-[#DEE2E8] rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-[#1A1A2E] mb-4">Live Vehicle Inspection Queue</h3>
        <p className="text-sm text-[#718096]">Ready for Phase 2: VIN Scan & Inspection Engine integration.</p>
      </div>
    </div>
  );
};
