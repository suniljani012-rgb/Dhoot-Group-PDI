import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react';
import { Panel, Badge } from '../components/ui/primitives';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams();
  const [assignedStatus, setAssignedStatus] = useState('PDI_PENDING');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      <div className="flex items-center gap-3">
        <Link 
          to="/vehicles" 
          className="h-8 w-8 rounded bg-surface border border-line hover:border-line-strong flex items-center justify-center text-ink-3 hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="accent">Tata</Badge>
            <h1 className="text-lg font-semibold tracking-[-0.011em] text-ink">
              Tata Harrier — Fearless Plus Dark
            </h1>
          </div>
          <p className="text-xs font-mono text-ink-3 mt-0.5">VIN: MAT612345H7654321</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Specs Card */}
        <div className="lg:col-span-2 space-y-4">
          <Panel title="Vehicle Specifications">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-canvas border border-line rounded">
                  <span className="eyebrow block">Model</span>
                  <span className="font-medium text-ink">Tata Harrier</span>
                </div>
                <div className="p-2.5 bg-canvas border border-line rounded">
                  <span className="eyebrow block">Variant</span>
                  <span className="font-medium text-ink">Fearless Plus Dark</span>
                </div>
                <div className="p-2.5 bg-canvas border border-line rounded">
                  <span className="eyebrow block">Fuel Type</span>
                  <span className="font-medium text-ink">DIESEL</span>
                </div>
                <div className="p-2.5 bg-canvas border border-line rounded">
                  <span className="eyebrow block">Transmission</span>
                  <span className="font-medium text-ink">AUTOMATIC</span>
                </div>
                <div className="p-2.5 bg-canvas border border-line rounded">
                  <span className="eyebrow block">Color</span>
                  <span className="font-medium text-ink">Oberon Black</span>
                </div>
                <div className="p-2.5 bg-canvas border border-line rounded">
                  <span className="eyebrow block">Manufacturing Year</span>
                  <span className="font-medium text-ink tnum">2026</span>
                </div>
              </div>

              <div className="border-t border-line pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-ink-3">Current Status:</span>
                  <div className="mt-0.5">
                    <Badge tone="warn">{assignedStatus}</Badge>
                  </div>
                </div>
                <button
                  onClick={() => setAssignedStatus('PDI_IN_PROGRESS')}
                  className="h-8 px-3 rounded bg-accent hover:bg-accent-600 text-white text-xs font-medium transition-colors"
                >
                  Assign PDI Engineer
                </button>
              </div>
            </div>
          </Panel>
        </div>

        {/* Status Timeline */}
        <Panel title="Status Timeline">
          <div className="p-4 space-y-3 text-xs">
            <div className="flex gap-2.5 items-start">
              <CheckCircle2 className="w-4 h-4 text-ok shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-ink">Vehicle Received</p>
                <span className="text-[11px] text-ink-3 tnum">24 Aug 2026, 10:15 AM</span>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <UserCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-ink">PDI Queued</p>
                <span className="text-[11px] text-ink-3 tnum">25 Aug 2026, 09:30 AM</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};
