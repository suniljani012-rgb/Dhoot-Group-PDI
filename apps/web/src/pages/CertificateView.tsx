import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, ShieldCheck, QrCode, CheckCircle2 } from 'lucide-react';

export const CertificateViewPage: React.FC = () => {
  const { id } = useParams();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/qa" className="p-2 bg-white border border-[#DEE2E8] rounded-lg text-[#718096] hover:text-[#1A1A2E] flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to QA Queue
        </Link>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-[#1A3A6B] hover:bg-[#2C5298] text-white text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Official Certificate Paper Document */}
      <div className="bg-white border-2 border-[#1A3A6B] rounded-2xl p-10 shadow-lg space-y-8 relative overflow-hidden">
        {/* Watermark Logo Accent */}
        <div className="absolute right-6 top-6 opacity-10 pointer-events-none">
          <img src="/logo.png" alt="Watermark" className="w-64 h-64 object-contain" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1A3A6B] pb-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Dhoot Group Logo" className="h-16 w-16 object-contain" />
            <div>
              <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight">AUTOPRIME TATA</h1>
              <p className="text-xs uppercase font-bold text-[#718096]">Dhoot Group — Authorized Tata Motors Dealership</p>
              <p className="text-[11px] text-[#718096]">Pune Central Branch • Nagar Road, Pune, MH 411014</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1565A8] bg-[#EBF3FD] px-3 py-1 rounded-full border border-[#9DC7F0]">
              OFFICIAL CERTIFICATE
            </span>
            <div className="mt-2 text-xs font-mono font-bold text-[#1A1A2E]">CERT: PDI-TATA-2026-9812</div>
            <div className="text-[11px] text-[#718096]">Date: 25 Aug 2026</div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black uppercase tracking-wider text-[#1A3A6B]">
            PRE-DELIVERY INSPECTION CERTIFICATE
          </h2>
          <p className="text-xs text-[#4A5568] max-w-xl mx-auto">
            This certifies that the vehicle identified below has undergone a comprehensive 120-point quality audit in accordance with Tata Motors OEM specifications and is certified 100% Delivery Ready.
          </p>
        </div>

        {/* Vehicle Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#F8F9FA] border border-[#DEE2E8] rounded-xl text-xs">
          <div>
            <span className="text-[#718096] block uppercase text-[10px] font-semibold">Model / Variant</span>
            <span className="font-bold text-sm text-[#1A1A2E]">Tata Curvv.ev</span>
            <span className="text-[11px] text-[#718096] block">Empowered Plus 55</span>
          </div>
          <div>
            <span className="text-[#718096] block uppercase text-[10px] font-semibold">VIN / Chassis Number</span>
            <span className="font-mono font-bold text-xs text-[#1A1A2E]">MAT612345C1122334</span>
            <span className="text-[11px] text-[#718096] block">CH: CH-CRV-3319</span>
          </div>
          <div>
            <span className="text-[#718096] block uppercase text-[10px] font-semibold">Fuel & Color</span>
            <span className="font-bold text-sm text-[#1A1A2E]">EV (Electric)</span>
            <span className="text-[11px] text-[#718096] block">Virtual Sunrise</span>
          </div>
          <div>
            <span className="text-[#718096] block uppercase text-[10px] font-semibold">Odometer & Battery</span>
            <span className="font-bold text-sm text-[#1A1A2E]">18 KM</span>
            <span className="text-[11px] text-[#1A7C4A] font-semibold block">SOC: 98% (12.8V)</span>
          </div>
        </div>

        {/* Inspection Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A2E]">Quality Audit Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[#EBF7F1] border border-[#A8DFC0] rounded-lg text-center">
              <span className="text-[#1A7C4A] font-extrabold text-lg block">100%</span>
              <span className="text-[#1A7C4A] font-semibold text-[11px]">Exterior & Body</span>
            </div>
            <div className="p-3 bg-[#EBF7F1] border border-[#A8DFC0] rounded-lg text-center">
              <span className="text-[#1A7C4A] font-extrabold text-lg block">100%</span>
              <span className="text-[#1A7C4A] font-semibold text-[11px]">Electrical & Lighting</span>
            </div>
            <div className="p-3 bg-[#EBF7F1] border border-[#A8DFC0] rounded-lg text-center">
              <span className="text-[#1A7C4A] font-extrabold text-lg block">100%</span>
              <span className="text-[#1A7C4A] font-semibold text-[11px]">Underhood & Fluids</span>
            </div>
            <div className="p-3 bg-[#EBF7F1] border border-[#A8DFC0] rounded-lg text-center">
              <span className="text-[#1A7C4A] font-extrabold text-lg block">100%</span>
              <span className="text-[#1A7C4A] font-semibold text-[11px]">Brakes & Road Test</span>
            </div>
          </div>
        </div>

        {/* Verification & Signatures */}
        <div className="pt-6 border-t-2 border-[#1A3A6B] flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#DEE2E8] rounded-xl bg-[#F8F9FA]">
              <QrCode className="w-16 h-16 text-[#1A1A2E]" />
            </div>
            <div className="text-left space-y-0.5">
              <span className="text-[10px] font-bold text-[#1A7C4A] uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Digitally Verified
              </span>
              <p className="text-[11px] font-mono text-[#718096]">TOKEN: QR-9921ABCD</p>
              <p className="text-[10px] text-[#718096]">Scan QR to verify certificate validity</p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="font-serif italic font-bold text-base text-[#1A3A6B]">K. R. Deshmukh</div>
            <div className="text-xs font-bold text-[#1A1A2E]">Quality Assurance Manager</div>
            <div className="text-[11px] text-[#718096]">Dhoot Group PDI Authority</div>
          </div>
        </div>
      </div>
    </div>
  );
};
