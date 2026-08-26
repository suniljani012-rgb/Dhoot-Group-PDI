import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, CheckCircle2, Camera, Video, Upload, Trash2, 
  Search, ArrowRight, Clock, FileText, Check, ShieldCheck,
  AlertCircle, X, StopCircle, FolderOpen, Calendar, MapPin,
  RefreshCw, Hash
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand, saveStockInventory, getActiveStockyards } from '../data/seedData';
import { formatDate } from '../utils/dateUtils';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';

interface IncomingVehicle {
  id: string;
  vin: string;
  brand: 'TATA' | 'HYUNDAI';
  model: string;
  variant: string;
  color: string;
  fuel_type?: string;
  fsc_code?: string;
  dealer_code?: string;
  engineNo: string;
  plantCode: string;
  dispatchDate: string;
  trailerNo: string;
  transporter: string;
  status: 'YARD_RECEIVING_PENDING' | 'RECEIVED_IN_YARD';
  customer_name?: string;
  sales_consultant?: string;
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

  const [activeYardsList, setActiveYardsList] = useState(() => getActiveStockyards(currentBrand?.code));

  useEffect(() => {
    fetchIncomingStock();
    setActiveYardsList(getActiveStockyards(currentBrand?.code));

    // Realtime Stock Synchronization
    const handleStockUpdate = () => {
      fetchIncomingStock();
    };

    const handleYardsUpdate = () => {
      setActiveYardsList(getActiveStockyards(currentBrand?.code));
    };

    window.addEventListener('stock-updated', handleStockUpdate);
    window.addEventListener('stockyards-updated', handleYardsUpdate);
    return () => {
      window.removeEventListener('stock-updated', handleStockUpdate);
      window.removeEventListener('stockyards-updated', handleYardsUpdate);
    };
  }, [currentBrand?.code]);

  const mapVehicles = (rows: any[]): IncomingVehicle[] => {
    return rows.map((v: any) => {
      const s = (v.status || v.vehicle_status || '').toUpperCase();
      const isPending = s === 'YARD_RECEIVING_PENDING' || s === 'GATE_INWARD_PENDING' || s === 'IN_TRANSIT';

      return {
        id: v.id || v.vin,
        vin: v.vin,
        brand: (v.brand || (v.vin?.startsWith('MAL') || (v.model && v.model.toLowerCase().includes('hyundai')) ? 'HYUNDAI' : 'TATA')) as 'TATA' | 'HYUNDAI',
        model: v.model || 'OEM Vehicle',
        variant: v.variant || 'Standard',
        color: v.color || 'White',
        fuel_type: v.fuel_type || 'PETROL',
        fsc_code: v.fsc_code || '',
        dealer_code: v.dealer_code || 'DLR-MH01',
        engineNo: v.engine_no || v.engine_number || 'ENG-001',
        plantCode: v.plant_code || (v.model?.toLowerCase().includes('hyundai') ? 'PLT-CHE' : 'PLT-PUN'),
        dispatchDate: v.purchase_date || '2026-08-25',
        trailerNo: v.trailer_no || 'TR-LOG-01',
        transporter: v.transporter || 'Auto Carrier Logistics',
        customer_name: v.customer_name || '',
        sales_consultant: v.sales_consultant || '',
        status: isPending ? ('YARD_RECEIVING_PENDING' as const) : ('RECEIVED_IN_YARD' as const),
        yardBay: v.location || 'Bay 1 (Inspection Staging)',
        odometerReading: v.odometer || 6,
        paperPdiPhoto: v.paper_pdi_photo,
        unloadingVideo: v.unloading_video,
        receivedAt: v.received_at ? formatDate(v.received_at) : undefined
      };
    });
  };

  const fetchIncomingStock = async () => {
    setLoading(true);
    try {
      const localRows = getVehiclesForBrand(currentBrand.code);
      setVehicles(mapVehicles(localRows));
    } catch (e) {
      console.warn('Yard stock load note:', e);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // In-App Camera/Video Recorder State
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
    const activeYards = getActiveStockyards(currentBrand?.code);
    setYardBay(vehicle.yardBay || (activeYards.length > 0 ? activeYards[0].name : 'Basni Yard'));
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

  // Capture Photo
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

  // Start Video Recording
  const startRecord = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setUnloadingVideo(URL.createObjectURL(blob));
      closeCamera();
    };
    recorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setRecordSecs(0);
  };

  // Stop Recording
  const stopRecord = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Timer Effect for Video
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSecs(prev => {
          if (prev >= 30) {
            stopRecord();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
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
    if (file.size > 15 * 1024 * 1024) {
      alert('Video exceeds 15 MB. Please select a shorter video.');
    }
    setUnloadingVideo(URL.createObjectURL(file));
  };

  // Submit Inward Gate Receiving & Synchronize with Stock Sheet
  const handleConfirmReceiving = () => {
    if (!selectedVehicle) return;

    // 1. Update component state
    setVehicles(prev => prev.map(v => {
      if (v.vin === selectedVehicle.vin) {
        return {
          ...v,
          status: 'RECEIVED_IN_YARD',
          paperPdiPhoto: paperPdiPhoto || undefined,
          unloadingVideo: unloadingVideo || undefined,
          odometerReading: Number(odometer) || 8,
          receivedAt: formatDate(new Date()),
          yardBay
        };
      }
      return v;
    }));

    // 2. Synchronize with localStorage stock sheet
    try {
      const saved = localStorage.getItem('dhoot_stock_inventory');
      if (saved) {
        let stockList: any[] = JSON.parse(saved);
        if (Array.isArray(stockList)) {
          stockList = stockList.map((item: any) => {
            if ((item.vin || '').toUpperCase().trim() === selectedVehicle.vin.toUpperCase().trim()) {
              return {
                ...item,
                status: 'RECEIVED',
                vehicle_status: 'RECEIVED',
                location: yardBay,
                odometer: Number(odometer) || 8,
                paper_pdi_photo: paperPdiPhoto,
                unloading_video: unloadingVideo,
                receiving_notes: receivingNotes,
                received_at: new Date().toISOString()
              };
            }
            return item;
          });

          saveStockInventory(stockList);
        }
      }
    } catch (e) {
      console.warn('Error syncing inward with stock inventory:', e);
    }

    setIsReceivingSuccess(true);
  };

  // Enhanced Filter & Fast Search including Last 5 Digits of VIN
  const cleanSearch = searchVin.trim().toLowerCase();

  const displayedVehicles = vehicles.filter(v => {
    const vin = (v.vin || '').toLowerCase();
    const vinLast5 = vin.slice(-5);
    const vinLast6 = vin.slice(-6);

    const matchesSearch = 
      !cleanSearch ||
      vin.includes(cleanSearch) || 
      vinLast5.includes(cleanSearch) ||
      vinLast6.includes(cleanSearch) ||
      (v.model || '').toLowerCase().includes(cleanSearch) ||
      (v.variant || '').toLowerCase().includes(cleanSearch) ||
      (v.color || '').toLowerCase().includes(cleanSearch) ||
      (v.customer_name || '').toLowerCase().includes(cleanSearch) ||
      (v.trailerNo || '').toLowerCase().includes(cleanSearch) ||
      (v.plantCode || '').toLowerCase().includes(cleanSearch);
    
    if (activeTab === 'PENDING') return matchesSearch && v.status === 'YARD_RECEIVING_PENDING';
    return matchesSearch && v.status === 'RECEIVED_IN_YARD';
  });

  const pendingCount = vehicles.filter(v => v.status === 'YARD_RECEIVING_PENDING').length;
  const receivedCount = vehicles.filter(v => v.status === 'RECEIVED_IN_YARD').length;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto select-none pb-20">
      
      {/* Top Banner */}
      <PageHeader
        title="Gate Inward Receiving"
        subtitle="Carrier Arrival Protocol • Fast VIN 5-Digit Search • Stock Sheet Auto-Sync & Staging"
        action={
          <Link
            to="/stock"
            className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-accent" />
            <span>View Stock Ledger</span>
          </Link>
        }
      />

      {/* Yard Gate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total Inward Fleet" value={vehicles.length} note="Units in Stock Ledger" />
        <Stat label="Pending In-Transit" value={pendingCount} note="Pending Gate Inward" tone={pendingCount > 0 ? "warn" : "default"} />
        <Stat label="Received in Yard" value={receivedCount} note="Staged in Yard Bays" tone="ok" />
        <Stat label="Ready for PDI" value={receivedCount} note="Available in PDI Queue" />
      </div>

      {/* High-Speed VIN Search & Quick Filter Bar */}
      <div className="p-3 bg-canvas border border-line rounded flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-accent absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Type Last 5 Digits of VIN (e.g. 88776), Full Chassis, Model, or Trailer No..."
              value={searchVin}
              onChange={(e) => setSearchVin(e.target.value)}
              className="w-full h-8 pl-9 pr-3 text-xs bg-surface border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent font-medium shadow-xs"
            />
          </div>
          {searchVin && (
            <button
              onClick={() => setSearchVin('')}
              className="h-8 px-2.5 bg-surface border border-line hover:bg-canvas text-xs font-medium text-ink-3 rounded transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-ink-3">
          <Hash className="w-3.5 h-3.5 text-accent" />
          <span>Showing <strong>{displayedVehicles.length}</strong> matching vehicles</span>
        </div>
      </div>

      {/* Inward Ledger Panel */}
      <Panel
        title={
          <div className="flex items-center gap-2">
            <span>Inward Gate Manifest</span>
            <Badge tone="accent">{displayedVehicles.length} Units</Badge>
          </div>
        }
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-canvas border border-line rounded p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={
                  activeTab === 'PENDING'
                    ? 'h-7 px-3 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 bg-surface text-ink border border-line shadow-xs font-semibold'
                    : 'h-7 px-3 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 text-ink-3 hover:text-ink-2'
                }
              >
                <span>Pending In-Transit</span>
                <span className="text-[10px] tnum font-semibold">({pendingCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('RECEIVED')}
                className={
                  activeTab === 'RECEIVED'
                    ? 'h-7 px-3 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 bg-surface text-ink border border-line shadow-xs font-semibold'
                    : 'h-7 px-3 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 text-ink-3 hover:text-ink-2'
                }
              >
                <span>Received in Yard</span>
                <span className="text-[10px] tnum font-semibold">({receivedCount})</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Chassis / VIN (Last 5 Bold)</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Brand & Model</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Variant & Color</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Fuel</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Plant / Dealer</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Dispatch Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Staging Bay</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Inward Status</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-ink-3">
                    Loading inward consignments...
                  </td>
                </tr>
              ) : displayedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="py-10 text-center space-y-2">
                      <Truck className="w-8 h-8 text-ink-3 mx-auto" />
                      <p className="font-semibold text-ink text-sm">
                        {searchVin ? 'No vehicles match your VIN / model search.' : (activeTab === 'PENDING' ? 'No pending in-transit vehicles.' : 'No vehicles received in yard yet.')}
                      </p>
                      <p className="text-xs text-ink-3">
                        {activeTab === 'PENDING' && 'Import stock from Stock page or clear search filter.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedVehicles.map((v, idx) => {
                  const vinPrefix = v.vin.length > 5 ? v.vin.slice(0, -5) : '';
                  const vinSuffix = v.vin.length > 5 ? v.vin.slice(-5) : v.vin;

                  return (
                    <tr 
                      key={v.id || idx} 
                      className="hover:bg-canvas transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center text-ink-3 tnum whitespace-nowrap">
                        {idx + 1}
                      </td>

                      {/* VIN with highlighted last 5 digits */}
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        <span className="text-ink-3">{vinPrefix}</span>
                        <span className="text-accent font-bold bg-accent-soft px-1 py-0.5 rounded border border-accent-line ml-0.5">
                          {vinSuffix}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Badge tone={v.brand === 'HYUNDAI' ? 'accent' : 'neutral'}>
                            {v.brand === 'HYUNDAI' ? 'Hyundai' : 'Tata'}
                          </Badge>
                          <span className="font-semibold text-ink">{v.model}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="text-ink">{v.variant}</div>
                        <div className="text-[11px] text-ink-3">{v.color}</div>
                      </td>

                      <td className="py-2.5 px-3 uppercase text-ink-3 whitespace-nowrap">
                        {v.fuel_type || 'PETROL'}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-ink-3 whitespace-nowrap">
                        {v.plantCode} • {v.dealer_code}
                      </td>

                      <td className="py-2.5 px-3 text-ink-3 tnum whitespace-nowrap">
                        {formatDate(v.dispatchDate)}
                      </td>

                      <td className="py-2.5 px-3 text-ink whitespace-nowrap">
                        {v.yardBay || 'Bay 1 (Inspection Staging)'}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {v.status === 'YARD_RECEIVING_PENDING' ? (
                          <Badge tone="warn">Gate Inward Pending</Badge>
                        ) : (
                          <Badge tone="ok">Received in Yard</Badge>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {v.status === 'YARD_RECEIVING_PENDING' ? (
                          <button
                            type="button"
                            onClick={() => openReceivingModal(v)}
                            className="h-7 px-3 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Receive at Gate</span>
                          </button>
                        ) : (
                          <Link
                            to="/pdi"
                            className="h-7 px-2.5 rounded bg-ok/10 text-ok border border-ok/20 hover:bg-ok hover:text-white text-xs font-semibold transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                          >
                            <span>Inspect in PDI</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ========================================================================= */}
      {/* VEHICLE RECEIVING MODAL (PDI PAPER PHOTO + UNLOADING VIDEO)               */}
      {/* ========================================================================= */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none">
          <div className="bg-surface text-ink w-full max-w-2xl rounded-panel overflow-hidden border border-line shadow-pop flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    Gate Inward: Receive {selectedVehicle.model}
                  </h2>
                  <p className="text-xs text-ink-3 mt-0.5 font-mono">
                    VIN: {selectedVehicle.vin} • Last 5: <strong className="text-accent">{selectedVehicle.vin.slice(-5)}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {!isReceivingSuccess ? (
                <>
                  {/* Vehicle Summary Banner */}
                  <div className="p-3 bg-canvas rounded border border-line flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-ink">{selectedVehicle.model} {selectedVehicle.variant}</h3>
                      <p className="text-[11px] text-ink-2 mt-0.5">Color: {selectedVehicle.color} • Fuel: {selectedVehicle.fuel_type}</p>
                      <p className="text-[11px] text-ink-3 mt-0.5">
                        Plant: {selectedVehicle.plantCode} • Dealer: {selectedVehicle.dealer_code}
                      </p>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="eyebrow block">Chassis Stamp</span>
                      <span className="font-bold text-accent">{selectedVehicle.vin.slice(-5)}</span>
                    </div>
                  </div>

                  {/* 1. MANDATORY PHYSICAL PDI SHEET PHOTO */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-ink">
                      1. OEM Physical PDI Sheet / Inward Gatepass Photo <span className="text-danger">*</span>
                    </label>
                    <p className="text-[11px] text-ink-3">
                      Capture or upload a clear photo of the official paper PDI sheet / transport challan delivered with the car.
                    </p>

                    {paperPdiPhoto ? (
                      <div className="relative rounded overflow-hidden aspect-video max-h-44 border border-line bg-black/5 flex items-center justify-center">
                        <img src={paperPdiPhoto} alt="Paper PDI Sheet" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPaperPdiPhoto(null)}
                          className="absolute top-2 right-2 p-1.5 bg-danger text-white rounded transition-all cursor-pointer shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => openCamera('PHOTO')}
                          className="p-3.5 border border-dashed border-line hover:border-accent rounded flex flex-col items-center justify-center gap-1 text-ink-2 hover:text-accent bg-canvas transition-all cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span className="text-xs font-semibold">Take Live Photo</span>
                        </button>

                        <label className="p-3.5 border border-dashed border-line hover:border-accent rounded flex flex-col items-center justify-center gap-1 text-ink-2 hover:text-accent bg-canvas transition-all cursor-pointer">
                          <FolderOpen className="w-4 h-4" />
                          <span className="text-xs font-semibold">Upload Photo</span>
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
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-ink">
                      2. Carrier Unloading Walkaround Video (Optional/Max 30s)
                    </label>
                    <p className="text-[11px] text-ink-3">
                      Record or upload a 10-30s walkaround video showing the vehicle being unloaded from carrier trailer.
                    </p>

                    {unloadingVideo ? (
                      <div className="relative rounded overflow-hidden aspect-video max-h-44 border border-line bg-black flex items-center justify-center">
                        <video src={unloadingVideo} controls className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUnloadingVideo(null)}
                          className="absolute top-2 right-2 p-1.5 bg-danger text-white rounded transition-all cursor-pointer shadow-xs z-10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => openCamera('VIDEO')}
                          className="p-3.5 border border-dashed border-line hover:border-accent rounded flex flex-col items-center justify-center gap-1 text-ink-2 hover:text-accent bg-canvas transition-all cursor-pointer"
                        >
                          <Video className="w-4 h-4 text-accent" />
                          <span className="text-xs font-semibold">Record Live Video</span>
                        </button>

                        <label className="p-3.5 border border-dashed border-line hover:border-accent rounded flex flex-col items-center justify-center gap-1 text-ink-2 hover:text-accent bg-canvas transition-all cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span className="text-xs font-semibold">Upload Video</span>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Odometer on Arrival (KM) *
                      </label>
                      <input
                        type="number"
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                        className="w-full p-2 bg-canvas border border-line rounded text-xs font-bold text-ink focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Assign Stockyard Staging Bay *
                      </label>
                      <select
                        value={yardBay}
                        onChange={(e) => setYardBay(e.target.value)}
                        className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                      >
                        {activeYardsList.map(y => (
                          <option key={y.id} value={y.name}>
                            {y.name} ({y.city})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmReceiving}
                      className="w-full h-9 rounded text-xs font-semibold text-white bg-accent hover:bg-accent-600 shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Confirm Gate Receiving & Sync with Stock Sheet</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Success Confirmation View */
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-ok/10 text-ok flex items-center justify-center mx-auto border border-ok/20">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-ink">Vehicle Successfully Received in Yard!</h3>
                    <p className="text-xs text-ink-3 max-w-md mx-auto leading-relaxed">
                      Vehicle <strong>{selectedVehicle.vin}</strong> has been received, staged in <strong>{yardBay}</strong>, and synced with Stock Ledger and PDI Queue.
                    </p>
                  </div>
                  <div className="flex gap-2.5 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVehicle(null)}
                      className="h-8 px-4 rounded text-xs font-semibold border border-line text-ink hover:bg-canvas cursor-pointer"
                    >
                      Close
                    </button>
                    <Link
                      to="/pdi"
                      className="h-8 px-4 rounded text-xs font-semibold bg-accent hover:bg-accent-600 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Proceed to PDI Queue</span>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none">
          <div className="bg-surface text-ink w-full max-w-lg rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
            
            <div className="px-4 py-3 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2">
                {cameraModal.mode === 'PHOTO' ? <Camera className="w-4 h-4 text-accent" /> : <Video className="w-4 h-4 text-warn" />}
                <span className="text-xs font-semibold text-ink">
                  {cameraModal.mode === 'PHOTO' ? 'Capture Paper PDI Sheet' : 'Record Carrier Unloading Video'}
                </span>
              </div>
              <button
                type="button"
                onClick={closeCamera}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
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
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-danger text-white px-2.5 py-1 rounded text-xs font-bold font-mono animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span>REC 00:{recordSecs < 10 ? '0' + recordSecs : recordSecs} / 00:30</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-line flex items-center justify-center gap-3 bg-canvas">
              {cameraModal.mode === 'PHOTO' ? (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="h-8 px-6 bg-accent hover:bg-accent-600 text-white rounded font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
                      className="h-8 px-6 bg-danger hover:bg-danger/90 text-white rounded font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecord}
                      className="h-8 px-6 bg-accent hover:bg-accent-600 text-white rounded font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <StopCircle className="w-4 h-4" />
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
