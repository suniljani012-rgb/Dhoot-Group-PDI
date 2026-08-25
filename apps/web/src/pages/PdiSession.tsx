import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Ban, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const PdiSessionPage: React.FC = () => {
  const { id } = useParams();
  const [activeCategory, setActiveCategory] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    {
      id: 'cat-1',
      name: 'Exterior & Bodywork',
      items: [
        { id: '1', code: 'EXT-01', title: 'Panel Gaps & Alignment', type: 'PASS_FAIL' },
        { id: '2', code: 'EXT-02', title: 'Paint Finish & Scratch Inspection', type: 'PASS_FAIL' },
        { id: '3', code: 'EXT-03', title: 'Windshield & Glass Integrity', type: 'PASS_FAIL' },
        { id: '4', code: 'EXT-04', title: 'Wiper Blades & Washer Jet', type: 'PASS_FAIL' },
      ],
    },
    {
      id: 'cat-2',
      name: 'Lighting & Electricals',
      items: [
        { id: '5', code: 'LGT-01', title: 'LED DRLs & Headlamp High/Low Beam', type: 'PASS_FAIL' },
        { id: '6', code: 'LGT-02', title: 'Turn Indicators & Hazard Lamps', type: 'PASS_FAIL' },
        { id: '7', code: 'LGT-03', title: 'Tail Lamps & Signature Lightbar', type: 'PASS_FAIL' },
        { id: '8', code: 'LGT-04', title: 'Dual Horn Functionality', type: 'PASS_FAIL' },
      ],
    },
    {
      id: 'cat-3',
      name: 'Underhood & Fluid Levels',
      items: [
        { id: '9', code: 'ENG-01', title: 'Engine Oil Level & Dipstick', type: 'PASS_FAIL' },
        { id: '10', code: 'ENG-02', title: 'Coolant Reservoir Level', type: 'PASS_FAIL' },
        { id: '11', code: 'ENG-03', title: 'Brake & Clutch Fluid Level', type: 'PASS_FAIL' },
        { id: '12', code: 'ENG-04', title: '12V Battery Terminal Voltage (V)', type: 'NUMERIC' },
      ],
    },
  ];

  const [responses, setResponses] = useState<Record<string, { status: string; value?: string }>>({
    '1': { status: 'PASS' },
    '2': { status: 'PASS' },
    '3': { status: 'PASS' },
    '4': { status: 'PASS' },
  });

  const handleResponse = (itemId: string, status: string, value?: string) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { status, value: value ?? prev[itemId]?.value },
    }));
  };

  const totalItemsCount = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const answeredCount = Object.keys(responses).length;
  const progressPct = Math.round((answeredCount / totalItemsCount) * 100);

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white border border-[#DEE2E8] rounded-2xl p-8 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 bg-[#EBF7F1] text-[#1A7C4A] rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A2E]">Inspection Submitted!</h2>
        <p className="text-sm text-[#718096]">
          All checklist items have been logged. Vehicle has been forwarded to <strong>QA Review Queue</strong>.
        </p>
        <Link
          to="/pdi"
          className="inline-block px-6 py-2.5 bg-[#1A3A6B] text-white text-sm font-medium rounded-lg hover:bg-[#2C5298]"
        >
          Return to PDI Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white border border-[#DEE2E8] rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/pdi" className="p-2 bg-[#F8F9FA] rounded-lg text-[#718096] hover:text-[#1A1A2E]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-[#1A1A2E]">Tata Safari Accomplished Plus 6S</h2>
            <span className="text-xs font-mono text-[#718096]">VIN: MAT612345S9988776</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-[#718096] block">Overall Progress</span>
            <span className="text-base font-bold text-[#1A3A6B]">{progressPct}% ({answeredCount}/{totalItemsCount})</span>
          </div>
          <button
            onClick={() => setIsSubmitted(true)}
            className="px-5 py-2.5 bg-[#1A7C4A] hover:bg-[#146039] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            Submit for QA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Category Sidebar Navigation */}
        <div className="bg-white border border-[#DEE2E8] rounded-xl p-3 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-[#718096] px-3 py-2 block">Categories</span>
          {categories.map((cat, idx) => {
            const isSelected = activeCategory === idx;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  isSelected ? 'bg-[#1A3A6B] text-white' : 'text-[#4A5568] hover:bg-[#F8F9FA]'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {cat.items.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Inspection Item Runner */}
        <div className="md:col-span-3 bg-white border border-[#DEE2E8] rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-[#1A1A2E] pb-3 border-b border-[#DEE2E8]">
            {categories[activeCategory].name}
          </h3>

          <div className="space-y-4">
            {categories[activeCategory].items.map((item) => {
              const currentStatus = responses[item.id]?.status;
              const isPass = currentStatus === 'PASS';
              const isFail = currentStatus === 'FAIL';
              const isNA = currentStatus === 'NA';

              return (
                <div
                  key={item.id}
                  className="p-4 border border-[#DEE2E8] rounded-xl hover:border-[#1A3A6B] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-[#1565A8] bg-[#EBF3FD] px-2 py-0.5 rounded">
                      {item.code}
                    </span>
                    <h4 className="text-sm font-semibold text-[#1A1A2E] mt-1">{item.title}</h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleResponse(item.id, 'PASS')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isPass 
                          ? 'bg-[#1A7C4A] text-white shadow-sm ring-2 ring-[#1A7C4A]' 
                          : 'bg-[#EBF7F1] text-[#1A7C4A] hover:bg-[#A8DFC0]'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      PASS
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResponse(item.id, 'FAIL')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isFail 
                          ? 'bg-[#C62828] text-white shadow-sm ring-2 ring-[#C62828]' 
                          : 'bg-[#FEECEC] text-[#C62828] hover:bg-[#F5A8A8]'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      FAIL
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResponse(item.id, 'NA')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isNA 
                          ? 'bg-[#4A5568] text-white shadow-sm' 
                          : 'bg-[#F1F3F5] text-[#718096] hover:bg-gray-200'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      N/A
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
