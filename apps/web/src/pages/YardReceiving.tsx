import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, CheckCircle2, Camera, Video, Upload, Trash2, 
  Search, ArrowRight, Clock, FileText, Check, ShieldCheck,
  AlertCircle, X, StopCircle, FolderOpen, Calendar, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const [searchVin, setSearchVin] = useState('');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'RECEIVED'>('PENDING');

  // Seeded In-Transit & Inward Fleet
  const [vehicles, setVehicles] = useState<IncomingVehicle[]>([
    {
      id: 'inc-1',
      vin: 'MAT612345S9988776',
      brand: 'TATA',
      model: 'Tata Safari Accomplished Plus 6S',
      variant: 'Dark Edition Kryotec 2.0L AT',
      color: 'Oberon Black',
      engineNo: 'ENG-KY-90881',
      plantCode: 'Tata Motors Pune Plant',
      dispatchDate: '24 Aug 2026',
      trailerNo: 'MH-12-TR-4421',
      transporter: 'VRL Logistics Logistics Fleet',
      status: 'YARD_RECEIVING_PENDING',
    },
    {
      id: 'inc-2',
      vin: 'MAT612345H7654321',
      brand: 'TATA',
      model: 'Tata Harrier Fearless Plus Dark',
      variant: '2.0L Kryotec Turbo Diesel 6MT',
      color: 'Oberon Black',
      engineNo: 'ENG-KY-90882',
      plantCode: 'Tata Motors Pune Plant',
      dispatchDate: '24 Aug 2026',
      trailerNo: 'MH-14-BT-9901',
      transporter: 'Tata Transporter Fleet #4',
      status: 'YARD_RECEIVING_PENDING',
    },
    {
      id: 'inc-3',
      vin: 'MALC12345C1122334',
      brand: 'HYUNDAI',
      model: 'Hyundai Creta SX (O) Turbo DCT',
      variant: '1.5L Turbo GDi 7-Speed DCT',
      color: 'Ranger Khaki',
      engineNo: 'ENG-HY-77612',
      plantCode: 'Hyundai Sriperumbudur Plant',
      dispatchDate: '23 Aug 2026',
      trailerNo: 'TN-04-TR-1109',
      transporter: 'South Auto Carriers',
      status: 'YARD_RECEIVING_PENDING',
    },
    {
      id: 'inc-4',
      vin: 'MAT612345N1234567',
      brand: 'TATA',
      model: 'Tata Nexon Fearless Plus S DT',
      variant: '1.2L Revotron Turbo Petrol 7DCA',
      color: 'Daytona Grey',
      engineNo: 'ENG-NX-33412',
      plantCode: 'Tata Motors Sanand Plant',
      dispatchDate: '22 Aug 2026',
      trailerNo: 'GJ-01-TR-8812',
      transporter: 'Express Auto Carriers',
      status: 'RECEIVED_IN_YARD',
      paperPdiPhoto: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500',
      unloadingVideo: 'sample-video',
      odometerReading: 8,
      receivedAt: '25 Aug 2026, 10:15 AM',
      yardBay: 'Pune Central Yard • Bay 2'
    }
  ]);

  // Receiving Modal State
  const [selectedVehicle, setSelectedVehicle] = useState<IncomingVehicle | null>(null);
  const [paperPdiPhoto, setPaperPdiPhoto] = useState<string | null>(null);
  const [unloadingVideo, setUnloadingVideo] = useState<string | null>(null);
  const [odometer, setOdometer] = useState<string>('6');
  const [yardBay, setYardBay] = useState<string>('Bay 1 (Inspection Staging)');
  const [receivingNotes, setReceivingNotes] = useState<string>('Unloaded safely from carrier. Zero physical transit damages.');
  const [isReceivingSuccess, setIsReceivingSuccess] = useState(false);

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
    <div className="max-w-6xl mx-auto space-y-6 pb-20 select-none">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Truck className="w-3 h-3" />
              Yard Gate Inward Desk
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A] mt-1">Vehicle Inward & Gate Receiving</h1>
          <p className="text-xs text-slate-500 font-medium">
            Receive incoming carrier trailers, verify Tata physical PDI sheets, and log unloading video proofs.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by VIN, Model or Trailer No..."
            value={searchVin}
            onChange={(e) => setSearchVin(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
          />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'PENDING'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Receiving Pending (In-Transit)</span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono ${
            activeTab === 'PENDING' ? 'bg-amber-400 text-slate-900 font-bold' : 'bg-slate-200 text-slate-700'
          }`}>
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('RECEIVED')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'RECEIVED'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Received in Yard (PDI Ready)</span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono ${
            activeTab === 'RECEIVED' ? 'bg-emerald-400 text-slate-900 font-bold' : 'bg-slate-200 text-slate-700'
          }`}>
            {receivedCount}
          </span>
        </button>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedVehicles.map((v) => (
          <div
            key={v.id}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  v.brand === 'TATA' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                }`}>
                  {v.brand} OEM
                </span>

                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  v.status === 'YARD_RECEIVING_PENDING'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {v.status === 'YARD_RECEIVING_PENDING' ? 'In-Transit to Yard' : 'Received in Yard'}
                </span>
              </div>

              {/* Title & Specs */}
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">{v.model}</h3>
                <p className="text-xs text-slate-500 font-medium">{v.variant} • {v.color}</p>
                <div className="mt-2 space-y-0.5 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>VIN: <span className="font-bold text-[#0F172A]">{v.vin}</span></div>
                  <div>Engine: {v.engineNo}</div>
                  <div>Trailer: <span className="font-semibold text-slate-800">{v.trailerNo}</span> ({v.transporter})</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400">
                Dispatched: {v.dispatchDate}
              </span>

              {v.status === 'YARD_RECEIVING_PENDING' ? (
                <button
                  type="button"
                  onClick={() => openReceivingModal(v)}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Receive Vehicle</span>
                </button>
              ) : (
                <Link
                  to="/pdi/88888888-8888-8888-8888-888888888881"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Start PDI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* VEHICLE RECEIVING MODAL (PDI PAPER PHOTO + UNLOADING VIDEO)               */}
      {/* ========================================================================= */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Gate Inward Protocol
                </span>
                <h2 className="text-base font-bold text-[#0F172A] mt-1">
                  Receive Vehicle into Stockyard
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {!isReceivingSuccess ? (
                <>
                  {/* Vehicle Summary Banner */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">{selectedVehicle.model}</h3>
                      <p className="text-xs font-mono text-slate-500">VIN: {selectedVehicle.vin}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Trailer: {selectedVehicle.trailerNo} • Plant: {selectedVehicle.plantCode}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Truck className="w-5 h-5 text-[#0F172A]" />
                    </div>
                  </div>

                  {/* 1. MANDATORY TATA PHYSICAL PDI SHEET PHOTO */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#0F172A]">
                      1. Tata Physical PDI Sheet / Inward Gatepass Photo <span className="text-rose-600">*</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Capture or upload a clear photo of the official paper PDI sheet / transport challan delivered with the car.
                    </p>

                    {paperPdiPhoto ? (
                      <div className="relative rounded-2xl overflow-hidden aspect-video max-h-48 border border-slate-200 bg-black/5 flex items-center justify-center">
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
                          className="p-4 border-2 border-dashed border-slate-300 hover:border-[#0F172A] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-600 hover:text-[#0F172A] bg-slate-50/50 hover:bg-white transition-all cursor-pointer"
                        >
                          <Camera className="w-5 h-5" />
                          <span className="text-xs font-bold">Take Live Photo</span>
                        </button>

                        <label className="p-4 border-2 border-dashed border-slate-300 hover:border-[#0F172A] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-600 hover:text-[#0F172A] bg-slate-50/50 hover:bg-white transition-all cursor-pointer">
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
                    <label className="block text-xs font-bold text-[#0F172A]">
                      2. Carrier Unloading Walkaround Video (Max 30s) <span className="text-rose-600">*</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Record or upload a 10-30s walkaround video showing the vehicle being unloaded from the carrier trailer without dents.
                    </p>

                    {unloadingVideo ? (
                      <div className="relative rounded-2xl overflow-hidden aspect-video max-h-48 border border-amber-300 bg-black flex items-center justify-center">
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
                          className="p-4 border-2 border-dashed border-amber-300 hover:border-amber-600 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-amber-800 bg-amber-50/30 hover:bg-amber-50 transition-all cursor-pointer"
                        >
                          <Video className="w-5 h-5 text-amber-600 animate-pulse" />
                          <span className="text-xs font-bold">Record Live Video</span>
                        </button>

                        <label className="p-4 border-2 border-dashed border-amber-300 hover:border-amber-600 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-amber-800 bg-amber-50/30 hover:bg-amber-50 transition-all cursor-pointer">
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
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Stockyard Staging Bay
                      </label>
                      <select
                        value={yardBay}
                        onChange={(e) => setYardBay(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
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
                    className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>Confirm Yard Receiving & Move to PDI Queue</span>
                  </button>
                </>
              ) : (
                /* Success Confirmation View */
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#0F172A]">Vehicle Successfully Received in Yard!</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Tata physical PDI sheet and carrier unloading video have been attached. Vehicle status updated to <strong>PDI Pending (In Yard)</strong>.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVehicle(null)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Close
                    </button>
                    <Link
                      to="/pdi/88888888-8888-8888-8888-888888888881"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-xs cursor-pointer flex items-center gap-1.5"
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
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                  className="px-8 py-3 bg-white hover:bg-slate-100 text-[#0F172A] rounded-2xl font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
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
                      className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <div className="w-3 h-3 bg-white rounded-full" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecord}
                      className="px-8 py-3 bg-white hover:bg-slate-100 text-[#0F172A] rounded-2xl font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
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
