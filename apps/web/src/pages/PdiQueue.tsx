import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, ArrowRight, UserCheck } from 'lucide-react';

export const PdiQueuePage: React.FC = () => {
  const sessions = [
    {
      id: '88888888-8888-8888-8888-888888888881',
      vin: 'MAT612345S9988776',
      model: 'Tata Safari Accomplished Plus',
      inspector: 'Rajesh Sharma (ENG-101)',
      progress: 65,
      passed: 13,
      failed: 0,
      status: 'IN_PROGRESS',
      startedAt: '25 Aug 2026, 11:30 AM',
    },
    {
      id: '88888888-8888-8888-8888-888888888882',
      vin: 'MAT612345H7654321',
      model: 'Tata Harrier Fearless Plus Dark',
      inspector: 'Amit Verma (ENG-104)',
      progress: 20,
      passed: 4,
      failed: 0,
      status: 'IN_PROGRESS',
      startedAt: '25 Aug 2026, 12:15 PM',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A2E]">Active PDI Inspections</h2>
        <p className="text-sm text-[#718096]">Live stockyard vehicle inspection sessions in progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((s) => (
          <div key={s.id} className="bg-white border border-[#DEE2E8] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1565A8] bg-[#EBF3FD] px-2.5 py-0.5 rounded">
                  {s.status.replace('_', ' ')}
                </span>
                <h3 className="text-lg font-bold text-[#1A1A2E] mt-2">{s.model}</h3>
                <p className="text-xs font-mono text-[#718096]">VIN: {s.vin}</p>
              </div>
              <div className="p-3 bg-[#EBF7F1] text-[#1A7C4A] rounded-xl">
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#718096]">
                <span>Progress: {s.passed} items verified</span>
                <span className="font-bold text-[#1A1A2E]">{s.progress}%</span>
              </div>
              <div className="w-full bg-[#F1F3F5] rounded-full h-2">
                <div
                  className="bg-[#1A3A6B] h-2 rounded-full transition-all"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#DEE2E8]">
              <div className="flex items-center gap-2 text-xs text-[#718096]">
                <UserCheck className="w-4 h-4 text-[#1565A8]" />
                <span>{s.inspector}</span>
              </div>
              <Link
                to={`/pdi/${s.id}`}
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#1A3A6B] hover:bg-[#2C5298] text-white text-xs font-medium rounded-lg transition-colors"
              >
                Resume PDI
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
