import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';

export const QaQueuePage: React.FC = () => {
  const [queue, setQueue] = useState([
    {
      id: 'sess-01',
      vin: 'MAT612345C1122334',
      model: 'Tata Curvv.ev Empowered Plus 55',
      inspector: 'Rajesh Sharma (ENG-101)',
      passed: 20,
      failed: 0,
      submittedAt: '25 Aug 2026, 01:15 PM',
      status: 'SUBMITTED',
      certId: 'cert-101',
    },
    {
      id: 'sess-02',
      vin: 'MAT612345S9988776',
      model: 'Tata Safari Accomplished Plus',
      inspector: 'Amit Verma (ENG-104)',
      passed: 20,
      failed: 0,
      submittedAt: '25 Aug 2026, 02:00 PM',
      status: 'SUBMITTED',
      certId: 'cert-102',
    },
  ]);

  const [approvedList, setApprovedList] = useState<string[]>([]);

  const handleApprove = (id: string) => {
    setApprovedList([...approvedList, id]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A2E]">Quality Assurance Review Queue</h2>
        <p className="text-sm text-[#718096]">Verify inspections, approve delivery readiness, and issue digital PDI certificates</p>
      </div>

      <div className="space-y-4">
        {queue.map((item) => {
          const isApproved = approvedList.includes(item.id);

          return (
            <div
              key={item.id}
              className="bg-white border border-[#DEE2E8] rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#EBF3FD] text-[#1565A8]">
                    QA PENDING
                  </span>
                  <span className="text-xs font-mono text-[#718096]">VIN: {item.vin}</span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1A2E]">{item.model}</h3>
                <div className="text-xs text-[#718096]">
                  Inspected by <strong className="text-[#1A1A2E]">{item.inspector}</strong> • Submitted: {item.submittedAt}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {!isApproved ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(item.id)}
                      className="px-5 py-2.5 bg-[#1A7C4A] hover:bg-[#146039] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Issue Certificate
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2.5 border border-[#C62828] text-[#C62828] hover:bg-[#FEECEC] text-xs font-bold rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A7C4A] bg-[#EBF7F1] px-3 py-1.5 rounded-lg border border-[#A8DFC0]">
                      <CheckCircle2 className="w-4 h-4" /> Approved & Issued
                    </span>
                    <Link
                      to={`/certificates/${item.certId}`}
                      className="px-4 py-2 bg-[#1A3A6B] hover:bg-[#2C5298] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View Certificate
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
