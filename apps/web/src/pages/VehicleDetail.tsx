import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Car, Calendar, ShieldCheck, CheckCircle2, UserCheck } from 'lucide-react';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams();
  const [assignedStatus, setAssignedStatus] = useState('PDI_PENDING');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/vehicles" className="p-2 bg-white border border-[#DEE2E8] rounded-lg text-[#718096] hover:text-[#1A1A2E]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A2E]">Tata Harrier — Fearless Plus Dark</h2>
          <p className="text-sm font-mono text-[#718096]">VIN: MAT612345H7654321</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specs Card */}
        <div className="lg:col-span-2 bg-white border border-[#DEE2E8] rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-[#1A1A2E]">Vehicle Specifications</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-[#F8F9FA] rounded-lg">
              <span className="text-xs text-[#718096] block">Model</span>
              <span className="text-sm font-semibold text-[#1A1A2E]">Tata Harrier</span>
            </div>
            <div className="p-3 bg-[#F8F9FA] rounded-lg">
              <span className="text-xs text-[#718096] block">Variant</span>
              <span className="text-sm font-semibold text-[#1A1A2E]">Fearless Plus Dark</span>
            </div>
            <div className="p-3 bg-[#F8F9FA] rounded-lg">
              <span className="text-xs text-[#718096] block">Fuel Type</span>
              <span className="text-sm font-semibold text-[#1A1A2E]">DIESEL</span>
            </div>
            <div className="p-3 bg-[#F8F9FA] rounded-lg">
              <span className="text-xs text-[#718096] block">Transmission</span>
              <span className="text-sm font-semibold text-[#1A1A2E]">AUTOMATIC</span>
            </div>
            <div className="p-3 bg-[#F8F9FA] rounded-lg">
              <span className="text-xs text-[#718096] block">Color</span>
              <span className="text-sm font-semibold text-[#1A1A2E]">Oberon Black</span>
            </div>
            <div className="p-3 bg-[#F8F9FA] rounded-lg">
              <span className="text-xs text-[#718096] block">Manufacturing Year</span>
              <span className="text-sm font-semibold text-[#1A1A2E]">2026</span>
            </div>
          </div>

          <div className="border-t border-[#DEE2E8] pt-6">
            <h3 className="text-base font-bold text-[#1A1A2E] mb-4">Inspection Lifecycle</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAssignedStatus('PDI_IN_PROGRESS')}
                className="px-4 py-2 bg-[#1A3A6B] text-white rounded-lg text-sm font-medium hover:bg-[#2C5298]"
              >
                Assign PDI Engineer
              </button>
              <span className="text-xs text-[#718096]">Current: <strong className="text-[#1A1A2E]">{assignedStatus}</strong></span>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white border border-[#DEE2E8] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#1A1A2E]">Status Timeline</h3>
          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1A7C4A] shrink-0" />
              <div>
                <p className="font-semibold text-[#1A1A2E]">Vehicle Received</p>
                <span className="text-xs text-[#718096]">24 Aug 2026, 10:15 AM</span>
              </div>
            </div>
            <div className="flex gap-3">
              <UserCheck className="w-5 h-5 text-[#1565A8] shrink-0" />
              <div>
                <p className="font-semibold text-[#1A1A2E]">PDI Queued</p>
                <span className="text-xs text-[#718096]">25 Aug 2026, 09:30 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
