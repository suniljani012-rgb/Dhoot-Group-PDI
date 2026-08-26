import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, CheckCircle2, Camera, Video, Upload, Trash2, 
  Search, ArrowRight, Clock, FileText, Check, ShieldCheck,
  AlertCircle, X, StopCircle, FolderOpen, Calendar, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand } from '../data/seedData';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';

interface IncomingVehicle {
  id: string;
  vin: string;
  brand: 'TATA' | 'HYUNDAI';
  model: string;
  variant: string;
  color: string;
  engineNo: string;
  plantCode: string;
  dispatchDate: string;
  trailerNo: string;
  transporter: string;
  status: 'YARD_RECEIVING_PENDING' | 'RECEIVED_IN_YARD';
  paperPdiPhoto?: string;
  unloadingVideo?: string;
  odometerReading?: number;
  receivedAt?: string;
  yardBay?: string;
}

// Image Compressor (< 2MB)
const compressImageFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length * 0.75 > 2 * 1024 * 1024 && quality > 0.4) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
    };
  });
};

export const YardReceivingPage: React.FC = () => {
  const { currentBrand } = useAuth();
  
  const [vehicles, setVehicles] = useState<IncomingVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'RECEIVED'>('PENDING');
  const [searchVin, setSearchVin] = useState('');

  // Receiving Modal State
  const [selectedVehicle, setSelectedVehicle] = useState<IncomingVehicle | null>(null);
  const [paperPdiPhoto, setPaperPdiPhoto] = useState<string | null>(null);
  const [unloadingVideo, setUnloadingVideo] = useState<string | null>(null);
  const [odometer, setOdometer] = useState<string>('6');
  const [yardBay, setYardBay] = useState<string>('Bay 1 (Inspection Staging)');
  const [receivingNotes, setReceivingNotes] = useState<string>('Unloaded safely from carrier. Zero physical transit damages.');
  const [isReceivingSuccess, setIsReceivingSuccess] = useState(false);

  useEffect(() => {
    fetchIncomingStock();
  }, [currentBrand?.code]);

  const mapVehicles = (rows: any[]): IncomingVehicle[] => {
    return rows.map((v: any) => ({
      id: v.id || v.vin,
      vin: v.vin,
      brand: (v.brand || (v.vin?.startsWith('MAL') ? 'HYUNDAI' : 'TATA')) as 'TATA' | 'HYUNDAI',
      model: v.model || 'OEM Vehicle',
      variant: v.variant || 'Standard',
      color: v.color || 'White',
      engineNo: v.engine_no || v.engine_number || 'ENG-001',
      plantCode: v.plant_code || 'OEM Plant',
      dispatchDate: v.purchase_date || '2026-08-25',
      trailerNo: v.trailer_no || 'TR-LOG-01',
      transporter: v.transporter || 'Auto Carrier Logistics',
      status: (v.status === 'YARD_RECEIVING_PENDING' || v.status === 'IN_TRANSIT') ? ('YARD_RECEIVING_PENDING' as const) : ('RECEIVED_IN_YARD' as const)
    }));
  };

  const fetchIncomingStock = async () => {
    setLoading(true);
    try {
      const orgParam = currentBrand && currentBrand.code !== 'DHOOT-ALL' ? `?organization_id=${currentBrand.orgId}` : '';
      const res = await fetch(getApiUrl(`/api/v1/stock${orgParam}`));
      if (res.ok) {
        const json = await res.json();
        const rows = json.data || [];
        if (rows.length > 0) {
          setVehicles(mapVehicles(rows));
          setLoading(false);
          return;
        }
      }
      setVehicles(mapVehicles(getVehiclesForBrand(currentBrand.code)));
    } catch (e) {
      setVehicles(mapVehicles(getVehiclesForBrand(currentBrand.code)));
    } finally {
      setLoading(false);
    }
  };

  // In-App Camera/Video Recorder State for Gate Receiving
  const [cameraModal, setCameraModal] = useState<{
    isOpen: boolean;
    mode: 'PHOTO' | 'VIDEO';
  }>({ isOpen: false, mode: 'PHOTO' });

  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const openReceivingModal = (vehicle: IncomingVehicle) => {
    setSelectedVehicle(vehicle);
    setPaperPdiPhoto(null);
    setUnloadingVideo(null);
    setOdometer('8');
    setYardBay('Bay 1 (Inspection Staging)');
    setIsReceivingSuccess(false);
  };

  // Open In-App Camera
  const openCamera = async (mode: 'PHOTO' | 'VIDEO') => {
    setCameraModal({ isOpen: true, mode });
    setIsRecording(false);
    setRecordSecs(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'VIDEO'
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn('Camera note:', e);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setCameraModal({ isOpen: false, mode: 'PHOTO' });
    setIsRecording(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPaperPdiPhoto(dataUrl);
    closeCamera();
  };

  const startRecord = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const rec = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    recorderRef.current = rec;

    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setUnloadingVideo(URL.createObjectURL(blob));
      closeCamera();
    };

    rec.start();
    setIsRecording(true);
    setRecordSecs(0);
  };

  const stopRecord = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    let t: any;
    if (isRecording) {
      t = setInterval(() => {
        setRecordSecs(s => {
          if (s >= 30) {
            stopRecord();
            return 30;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Upload Paper PDI Photo from File
  const handlePaperPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    setPaperPdiPhoto(compressed);
  };

  // Upload Video from File
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Video exceeds 5 MB. Please select a shorter video.');
    }
    setUnloadingVideo(URL.createObjectURL(file));
  };

  // Submit Inward Gate Receiving
  const handleConfirmReceiving = () => {
    if (!selectedVehicle) return;

    setVehicles(prev => prev.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          status: 'RECEIVED_IN_YARD',
          paperPdiPhoto: paperPdiPhoto || undefined,
          unloadingVideo: unloadingVideo || undefined,
          odometerReading: Number(odometer) || 8,
          receivedAt: 'Just Now',
          yardBay
        };
      }
      return v;
    }));

    setIsReceivingSuccess(true);
  };

  // Filtered List
  const displayedVehicles = vehicles.filter(v => {
    const matchesSearch = v.vin.toLowerCase().includes(searchVin.toLowerCase()) || 
                          v.model.toLowerCase().includes(searchVin.toLowerCase()) ||
                          v.trailerNo.toLowerCase().includes(searchVin.toLowerCase());
    
    if (activeTab === 'PENDING') return matchesSearch && v.status === 'YARD_RECEIVING_PENDING';
    return matchesSearch && v.status === 'RECEIVED_IN_YARD';
  });

  const pendingCount = vehicles.filter(v => v.status === 'YARD_RECEIVING_PENDING').length;
  const receivedCount = vehicles.filter(v => v.status === 'RECEIVED_IN_YARD').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* Top Banner */}
      <PageHeader
        title="Gate Inward Receiving"
        subtitle="Record carrier trailer arrivals, verify OEM documents, and stage vehicles in stockyard bays"
      />

      {/* Yard Gate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total Inward" value={vehicles.length} note="Carrier Transits" />
        <Stat label="Receiving Pending" value={pendingCount} note="Trailer In-Transit" tone="warn" />
        <Stat label="Received in Yard" value={receivedCount} note="Bay Staged" tone="ok" />
        <Stat label="Ready for PDI" value={receivedCount} note="Inspection Queue" />
      </div>

      {/* Inward Ledger Panel */}
      <Panel
        title="Inward Gate Manifest"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-canvas border border-line rounded p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`h-6 px-2.5 rounded-chip text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'PENDING'
                    ? 'bg-surface text-ink border border-line shadow-xs font-semibold'
                    : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                <span>Pending In-Transit</span>
                <span className="text-[10px] tnum">({pendingCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('RECEIVED')}
                className={`h-6 px-2.5 rounded-chip text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'RECEIVED'
                    ? 'bg-surface text-ink border border-line shadow-xs font-semibold'
                    : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                <span>Received in Yard</span>
                <span className="text-[10px] tnum">({receivedCount})</span>
              </button>
            </div>

            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VIN, Model, Trailer..."
                value={searchVin}
                onChange={(e) => setSearchVin(e.target.value)}
                className="w-full h-7 pl-7 pr-2.5 text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">VIN / Chassis</th>
                <th className="py-2.5 px-3">Model & Variant</th>
                <th className="py-2.5 px-3">Colour</th>
                <th className="py-2.5 px-3">Plant & Dispatch</th>
                <th className="py-2.5 px-3">Trailer / Carrier</th>
                <th className="py-2.5 px-3">Transporter</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Proof Media</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {displayedVehicles.map((v, idx) => {
                const isHyundai = v.model.toLowerCase().includes('hyundai') || v.vin.startsWith('MAL');
                return (
                  <tr key={v.id} className="hover:bg-canvas/80 transition-colors">
                    <td className="py-2.5 px-3 text-center text-ink-3 tnum">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-ink">
                      {v.vin}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <Badge tone="accent">{isHyundai ? 'Hyundai' : 'Tata'}</Badge>
                        <span className="font-medium text-ink">{v.model}</span>
                      </div>
                      <div className="text-[11px] text-ink-3">{v.variant}</div>
                    </td>
                    <td className="py-2.5 px-3 text-ink-2">
                      {v.color}
                    </td>
                    <td className="py-2.5 px-3 text-ink-2">
                      <div className="font-medium text-ink">{v.plantCode}</div>
                      <div className="text-[10px] text-ink-3 font-mono">{v.dispatchDate}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-ink">
                      {v.trailerNo}
                    </td>
                    <td className="py-2.5 px-3 text-ink-2">
                      {v.transporter}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge tone={v.status === 'YARD_RECEIVING_PENDING' ? 'warn' : 'ok'}>
                        {v.status === 'YARD_RECEIVING_PENDING' ? 'Pending' : 'Received'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      {v.paperPdiPhoto ? (
                        <Badge tone="ok">Proof verified</Badge>
                      ) : (
                        <span className="text-ink-3 italic text-xs">Pending</span>
                      )}
                    </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {v.status === 'YARD_RECEIVING_PENDING' ? (
                          <button
                            type="button"
                            onClick={() => openReceivingModal(v)}
                            className="h-7 px-3 bg-accent hover:bg-accent-600 text-white text-xs font-semibold rounded transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5 text-amber-300" />
                            <span>Receive at Gate</span>
                          </button>
                        ) : (
                          <Link
                            to="/pdi"
                            className="h-7 px-3 bg-ok hover:bg-ok/90 text-white text-xs font-semibold rounded transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
                          >
                            <span>Start PDI</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ========================================================================= */}
      {/* VEHICLE RECEIVING MODAL (PDI PAPER PHOTO + UNLOADING VIDEO)               */}
      {/* ========================================================================= */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-panel shadow-pop border border-line overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Gate Inward Protocol
                </span>
                <h2 className="text-base font-bold text-ink mt-1">
                  Receive Vehicle into Stockyard
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {!isReceivingSuccess ? (
                <>
                  {/* Vehicle Summary Banner */}
                  <div className="p-4 bg-canvas rounded border border-line flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-ink">{selectedVehicle.model}</h3>
                      <p className="text-xs font-mono text-slate-500">VIN: {selectedVehicle.vin}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Trailer: {selectedVehicle.trailerNo} • Plant: {selectedVehicle.plantCode}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded bg-white border border-line flex items-center justify-center text-slate-700 shadow-xs">
                      <Truck className="w-5 h-5 text-ink" />
                    </div>
                  </div>

                  {/* 1. MANDATORY TATA PHYSICAL PDI SHEET PHOTO */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-ink">
                      1. Tata Physical PDI Sheet / Inward Gatepass Photo <span className="text-rose-600">*</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Capture or upload a clear photo of the official paper PDI sheet / transport challan delivered with the car.
                    </p>

                    {paperPdiPhoto ? (
                      <div className="relative rounded overflow-hidden aspect-video max-h-48 border border-line bg-black/5 flex items-center justify-center">
                        <img src={paperPdiPhoto} alt="Paper PDI Sheet" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPaperPdiPhoto(null)}
                          className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all cursor-pointer shadow-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => openCamera('PHOTO')}
                          className="p-4 border-2 border-dashed border-slate-300 hover:border-[#0F172A] rounded flex flex-col items-center justify-center gap-1.5 text-slate-600 hover:text-ink bg-canvas/50 hover:bg-white transition-all cursor-pointer"
                        >
                          <Camera className="w-5 h-5" />
                          <span className="text-xs font-bold">Take Live Photo</span>
                        </button>

                        <label className="p-4 border-2 border-dashed border-slate-300 hover:border-[#0F172A] rounded flex flex-col items-center justify-center gap-1.5 text-slate-600 hover:text-ink bg-canvas/50 hover:bg-white transition-all cursor-pointer">
                          <FolderOpen className="w-5 h-5" />
                          <span className="text-xs font-bold">Gallery Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePaperPhotoUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* 2. MANDATORY UNLOADING WALKAROUND VIDEO */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-ink">
                      2. Carrier Unloading Walkaround Video (Max 30s) <span className="text-rose-600">*</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Record or upload a 10-30s walkaround video showing the vehicle being unloaded from the carrier trailer without dents.
                    </p>

                    {unloadingVideo ? (
                      <div className="relative rounded overflow-hidden aspect-video max-h-48 border border-amber-300 bg-black flex items-center justify-center">
                        <video src={unloadingVideo} controls className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUnloadingVideo(null)}
                          className="absolute top-2 right-2 p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg transition-all cursor-pointer shadow-md z-10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => openCamera('VIDEO')}
                          className="p-4 border-2 border-dashed border-amber-300 hover:border-amber-600 rounded flex flex-col items-center justify-center gap-1.5 text-amber-800 bg-amber-50/30 hover:bg-amber-50 transition-all cursor-pointer"
                        >
                          <Video className="w-5 h-5 text-amber-600 animate-pulse" />
                          <span className="text-xs font-bold">Record Live Video</span>
                        </button>

                        <label className="p-4 border-2 border-dashed border-amber-300 hover:border-amber-600 rounded flex flex-col items-center justify-center gap-1.5 text-amber-800 bg-amber-50/30 hover:bg-amber-50 transition-all cursor-pointer">
                          <Upload className="w-5 h-5 text-amber-600" />
                          <span className="text-xs font-bold">Upload Video File</span>
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleVideoUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* 3. Inward Parameters (Odometer, Bay, Remarks) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Odometer on Arrival (KM)
                      </label>
                      <input
                        type="number"
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Stockyard Staging Bay
                      </label>
                      <select
                        value={yardBay}
                        onChange={(e) => setYardBay(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                      >
                        <option value="Bay 1 (Inspection Staging)">Bay 1 (Inspection Staging)</option>
                        <option value="Bay 2 (PDI Staging Area)">Bay 2 (PDI Staging Area)</option>
                        <option value="Bay 3 (EV Charging Staging)">Bay 3 (EV Charging Staging)</option>
                        <option value="Bay 4 (Ready Fleet Stock)">Bay 4 (Ready Fleet Stock)</option>
                      </select>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button
                    type="button"
                    onClick={handleConfirmReceiving}
                    className="w-full py-3.5 px-4 rounded text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>Confirm Yard Receiving & Move to PDI Queue</span>
                  </button>
                </>
              ) : (
                /* Success Confirmation View */
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink">Vehicle Successfully Received in Yard!</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Tata physical PDI sheet and carrier unloading video have been attached. Vehicle status updated to <strong>PDI Pending (In Yard)</strong>.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVehicle(null)}
                      className="px-5 py-2.5 rounded text-xs font-bold border border-line text-slate-700 hover:bg-canvas cursor-pointer"
                    >
                      Close
                    </button>
                    <Link
                      to="/pdi/88888888-8888-8888-8888-888888888881"
                      className="px-5 py-2.5 rounded text-xs font-bold bg-accent hover:bg-accent-600 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Proceed to PDI Sheet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-APP CAMERA / VIDEO RECORDER MODAL VIEWPORT                            */}
      {/* ========================================================================= */}
      {cameraModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] text-white w-full max-w-lg rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {cameraModal.mode === 'PHOTO' ? <Camera className="w-5 h-5 text-emerald-400" /> : <Video className="w-5 h-5 text-amber-400" />}
                <span className="text-sm font-bold">
                  {cameraModal.mode === 'PHOTO' ? 'Capture Paper PDI Sheet' : 'Record Carrier Unloading Video'}
                </span>
              </div>
              <button
                type="button"
                onClick={closeCamera}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-rose-600/90 text-white px-3 py-1 rounded-full text-xs font-bold font-mono animate-pulse">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  <span>REC 00:{recordSecs < 10 ? `0${recordSecs}` : recordSecs} / 00:30</span>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-800 flex items-center justify-center gap-4">
              {cameraModal.mode === 'PHOTO' ? (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-8 py-3 bg-white hover:bg-slate-100 text-ink rounded font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              ) : (
                <>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecord}
                      className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <div className="w-3 h-3 bg-white rounded-full" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecord}
                      className="px-8 py-3 bg-white hover:bg-slate-100 text-ink rounded font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <StopCircle className="w-4 h-4 text-rose-600" />
                      <span>Stop & Save Video</span>
                    </button>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
