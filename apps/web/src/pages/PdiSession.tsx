import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Check, X, Ban, ShieldCheck, CheckCircle2, 
  Camera, Video, Upload, Trash2, StopCircle, FolderOpen, AlertCircle
} from 'lucide-react';
import { Panel, Badge, Bar } from '../components/ui/primitives';

interface ChecklistItem {
  id: string;
  code: string;
  title: string;
  instruction: string;
  allowsVideo?: boolean;
  videoHint?: string;
  photosRequired?: number;
}

interface ChecklistCategory {
  id: string;
  stepNumber: number;
  name: string;
  shortName: string;
  items: ChecklistItem[];
}

// Client-Side Image Auto-Compressor (< 2MB)
const compressImage = async (file: File): Promise<string> => {
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

export const PdiSessionPage: React.FC = () => {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING' | 'FAILED'>('ALL');

  // Camera & Video Capture Modal State
  const [mediaModal, setMediaModal] = useState<{
    isOpen: boolean;
    itemId: string;
    mode: 'PHOTO' | 'VIDEO';
  }>({ isOpen: false, itemId: '', mode: 'PHOTO' });

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Load Checkpoints dynamically from Admin Rules (with official fallback)
  const getDynamicChecklistCategories = (): ChecklistCategory[] => {
    const saved = localStorage.getItem('autoprime_pdi_rules');
    if (saved) {
      try {
        const rules = JSON.parse(saved);
        if (Array.isArray(rules) && rules.length > 0) {
          const stages = [
            { stage: 'Exterior', stepNumber: 1, name: 'Exterior, Body Panels & Paint', shortName: 'Exterior' },
            { stage: 'Electricals', stepNumber: 2, name: 'Lighting & Electricals', shortName: 'Electricals' },
            { stage: 'Interior', stepNumber: 3, name: 'Interior Cabin & Dashboard', shortName: 'Interior' },
            { stage: 'Engine Bay', stepNumber: 4, name: 'Under-Hood & Fluid Levels', shortName: 'Engine Bay' },
            { stage: 'Underbody', stepNumber: 5, name: 'Under-Chassis, Suspension & Brakes', shortName: 'Underbody' },
            { stage: 'Road Test', stepNumber: 6, name: 'Road Test & Final Sign-Off', shortName: 'Road Test' },
          ];

          return stages.map((s, idx) => {
            const itemsInStage = rules.filter((r: any) => r.stage === s.stage);
            return {
              id: `cat-${idx + 1}`,
              stepNumber: s.stepNumber,
              name: s.name,
              shortName: s.shortName,
              items: itemsInStage.map((r: any) => ({
                id: r.id,
                code: r.id,
                title: r.title,
                instruction: r.description || 'Follow standard inspection procedure.',
                allowsVideo: r.videoRequired,
                photosRequired: r.photosRequired || 0,
                videoHint: r.videoRequired ? 'Mandatory video recording required' : undefined
              }))
            };
          });
        }
      } catch (e) {
        console.warn('Error loading dynamic rules, using defaults:', e);
      }
    }

    return [
      {
        id: 'cat-1',
        stepNumber: 1,
        name: 'Exterior, Body Panels & Paint',
        shortName: 'Exterior',
        items: [
          { id: 'ext-1', code: 'EXT-01', title: 'VIN & Chassis Number Verification', instruction: 'Match VIN stamped on windshield, B-pillar sticker and engine bay with invoice.' },
          { id: 'ext-2', code: 'EXT-02', title: 'Paint Quality & Scratch / Dent Inspection', instruction: 'Check body panels under natural daylight for scratches, transit dents or paint bubbles.' },
          { id: 'ext-3', code: 'EXT-03', title: 'Panel Gaps & Fitment Alignment', instruction: 'Ensure uniform panel gaps between bonnet, front fenders, doors and boot lid.' },
          { id: 'ext-4', code: 'EXT-04', title: 'Front & Rear Bumpers, Grille and Monograms', instruction: 'Check bumper clips, front chrome grille, and rear vehicle badge fitment.' },
          { id: 'ext-5', code: 'EXT-05', title: 'Windshield, Windows & Rear Glass', instruction: 'Inspect all glass for chips, cracks and verify matching manufacturing date code.' },
          { id: 'ext-6', code: 'EXT-06', title: 'Side Mirrors (ORVM) & Door Handles', instruction: 'Check mirror glass, power folding motor, and keyless entry sensors on door handles.' },
          { id: 'ext-7', code: 'EXT-07', title: 'Alloy Wheels & Tyres (DOT Date & Tread)', instruction: 'Inspect all 4 alloy wheels for curb scratches, tyre pressure and spare wheel in boot.' },
          { id: 'ext-8', code: 'EXT-08', title: 'Fuel / EV Charging Flap & Roof Rails', instruction: 'Check push-to-open latch, inner rubber seal, roof rails and shark fin antenna.' }
        ]
      },
      {
        id: 'cat-2',
        stepNumber: 2,
        name: 'Lighting & Electricals',
        shortName: 'Electricals',
        items: [
          { id: 'lgt-1', code: 'LGT-01', title: 'Headlamps, LED DRLs & Fog Lamps', instruction: 'Test high beam, low beam, DRL brightness and cornering fog lamps.' },
          { id: 'lgt-2', code: 'LGT-02', title: 'Turn Indicators & Hazard Flashers', instruction: 'Check front, rear and side mirror indicators for sequential blink animation.', allowsVideo: true, videoHint: 'Record 5-10s indicator blink test' },
          { id: 'lgt-3', code: 'LGT-03', title: 'Rear Connected Tail Lamps & Brake Lights', instruction: 'Verify rear lightbar glow, high-mount stop lamp, and reverse white lamps.' },
          { id: 'lgt-4', code: 'LGT-04', title: 'Dual Horn Sound & Pitch', instruction: 'Press steering horn pad to test dual trumpet tone output.', allowsVideo: true, videoHint: 'Record horn sound' },
          { id: 'lgt-5', code: 'LGT-05', title: 'Wipers & Windshield Washer Spray', instruction: 'Test wiper speeds (intermittent, low, high) and washer jet spray pattern.', allowsVideo: true, videoHint: 'Record wiper spray sweep' },
          { id: 'lgt-6', code: 'LGT-06', title: 'Power Windows & Central Locking', instruction: 'Test all 4 window switches for one-touch up/down and remote key lock/unlock.' },
          { id: 'lgt-7', code: 'LGT-07', title: 'Reverse Camera & Parking Sensors', instruction: 'Check reverse camera screen clarity and dynamic parking guideline assist.', allowsVideo: true, videoHint: 'Record reverse camera display' }
        ]
      },
      {
        id: 'cat-3',
        stepNumber: 3,
        name: 'Interior Cabin & Dashboard',
        shortName: 'Interior',
        items: [
          { id: 'int-1', code: 'INT-01', title: 'Dashboard & Center Console Fitment', instruction: 'Inspect dashboard leatherette, center armrest, and AC vent louvers.' },
          { id: 'int-2', code: 'INT-02', title: 'Digital Instrument Cluster & Odometer', instruction: 'Verify zero warning errors on speedometer cluster and confirm odometer reading (<50 km).' },
          { id: 'int-3', code: 'INT-03', title: 'Touchscreen Infotainment & Audio System', instruction: 'Test touchscreen touch response, Bluetooth, Apple CarPlay and Harman speakers.', allowsVideo: true, videoHint: 'Record touchscreen response' },
          { id: 'int-4', code: 'INT-04', title: 'AC Climate Control & Blower Cooling', instruction: 'Test cooling at lowest temperature (16°C), fan speeds and air circulation.', allowsVideo: true, videoHint: 'Record AC cooling blower' },
          { id: 'int-5', code: 'INT-05', title: 'Panoramic Sunroof & Sunblind Operation', instruction: 'Test sunroof open, tilt, slide and anti-pinch safety obstacle return.', allowsVideo: true, videoHint: 'Record sunroof opening' },
          { id: 'int-6', code: 'INT-06', title: 'Seats Upholstery & Seatbelt Locks', instruction: 'Check seat fabric/leatherette stitching, seat adjustments and all 3-point seatbelts.' },
          { id: 'int-7', code: 'INT-07', title: 'Steering Controls & Ambient Lighting', instruction: 'Verify illuminated Tata logo on steering, steering switches and mood lighting.' },
          { id: 'int-8', code: 'INT-08', title: 'Toolkit, Spare Wheel & Emergency Jack', instruction: 'Ensure jack, wheel wrench, tow hook, and warning triangle are present in boot.' }
        ]
      },
      {
        id: 'cat-4',
        stepNumber: 4,
        name: 'Under-Hood & Fluid Levels',
        shortName: 'Engine Bay',
        items: [
          { id: 'eng-1', code: 'ENG-01', title: 'Engine Oil Level & Dipstick', instruction: 'Check oil level on dipstick between MIN and MAX. Oil should be clean and amber.' },
          { id: 'eng-2', code: 'ENG-02', title: 'Coolant Reservoir & Radiator Hoses', instruction: 'Verify coolant level in expansion bottle and ensure zero fluid leaks around hoses.' },
          { id: 'eng-3', code: 'ENG-03', title: 'Brake & Clutch Fluid Level', instruction: 'Check master cylinder transparent reservoir level is at full MAX line.' },
          { id: 'eng-4', code: 'ENG-04', title: '12V Battery Terminals & Voltage', instruction: 'Inspect battery terminal clamps and verify healthy voltage reading (>12.6V).' },
          { id: 'eng-5', code: 'ENG-05', title: 'Engine Wire Harness & Fuse Box', instruction: 'Verify complete harness wiring taping with zero rodent damage or loose connectors.' },
          { id: 'eng-6', code: 'ENG-06', title: 'Engine Cold Start & Smooth Idling', instruction: 'Crank engine cold. Listen for smooth 850 RPM idle with zero abnormal rattle or knock.', allowsVideo: true, videoHint: 'Record engine idle sound' },
          { id: 'eng-7', code: 'ENG-07', title: 'Exhaust Tailpipe Emissions', instruction: 'Rev engine up to 2500 RPM. Verify tailpipe produces zero black, white or blue smoke.', allowsVideo: true, videoHint: 'Record exhaust rev smoke test' }
        ]
      },
      {
        id: 'cat-5',
        stepNumber: 5,
        name: 'Under-Chassis, Suspension & Brakes',
        shortName: 'Underbody',
        items: [
          { id: 'und-1', code: 'UND-01', title: 'Underbody Anti-Rust Coating & Floor Pan', instruction: 'Inspect floor pan on lift for transit scrape marks or dented crossmembers.' },
          { id: 'und-2', code: 'UND-02', title: 'Front & Rear Suspension (Struts & Springs)', instruction: 'Check front MacPherson struts, rear coil springs and rubber bump stops.' },
          { id: 'und-3', code: 'UND-03', title: 'Brake Discs, Calipers & Fluid Lines', instruction: 'Inspect disc surfaces for smooth finish and verify zero oil seepage on brake lines.' },
          { id: 'und-4', code: 'UND-04', title: 'Steering Rack & CV Axle Rubber Boots', instruction: 'Verify rubber bellows on steering rack and drive axle CV joints have zero tears.' },
          { id: 'und-5', code: 'UND-05', title: 'Underbody Fluid Leakage Inspection', instruction: 'Check engine oil sump, gearbox casing and radiator bottom for oil drops.', allowsVideo: true, videoHint: 'Record under-chassis inspection sweep' }
        ]
      },
      {
        id: 'cat-6',
        stepNumber: 6,
        name: 'Road Test & Final Sign-Off',
        shortName: 'Road Test',
        items: [
          { id: 'dyn-1', code: 'DYN-01', title: 'Gear Shift & Clutch Operation', instruction: 'Check smooth gear engagement (Manual/DCA/Automatic) without vibration.', allowsVideo: true, videoHint: 'Record gear shift engagement' },
          { id: 'dyn-2', code: 'DYN-02', title: 'Braking Performance & Handbrake Hold', instruction: 'Test progressive pedal bite, emergency stopping, and electronic parking brake hold.' },
          { id: 'dyn-3', code: 'DYN-03', title: 'Steering Alignment & Straight Tracking', instruction: 'Drive on flat road to verify steering is dead center with zero pulling to sides.' },
          { id: 'dyn-4', code: 'DYN-04', title: 'Cabin NVH Squeak & Rattle Test', instruction: 'Drive over yard rumble strips to confirm zero dashboard or door trim rattles.' },
          { id: 'dyn-5', code: 'DYN-05', title: 'Documentation (Owner Manual, Warranty, Fastag)', instruction: 'Confirm vehicle manual, warranty card, Fastag and service booklet are in glovebox.' },
          { id: 'dyn-6', code: 'DYN-06', title: 'Vehicle Final Grooming & Delivery Shine', instruction: 'Verify car wash, vacuumed cabin, polished tyres and delivery-ready clean state.' }
        ]
      }
    ];
  };

  const checklistCategories = getDynamicChecklistCategories();

  // Responses State (status, photos, video, defect note, severity)
  const [responses, setResponses] = useState<Record<string, {
    status?: 'PASS' | 'FAIL' | 'NA';
    photos: string[];
    video?: string;
    defectNote?: string;
    severity?: 'MINOR' | 'MAJOR' | 'CRITICAL';
  }>>({
    'ext-1': { status: 'PASS', photos: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500'] },
    'ext-2': { status: 'PASS', photos: [] },
    'ext-3': { status: 'PASS', photos: [] },
  });

  const updateItemStatus = (itemId: string, status: 'PASS' | 'FAIL' | 'NA') => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        status,
        photos: prev[itemId]?.photos || []
      }
    }));
  };

  // Upload Photo from Gallery with Auto-Compress < 2MB
  const handlePhotoUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file);
    setResponses((prev) => {
      const existing = prev[itemId]?.photos || [];
      const updated = existing.length >= 2 ? [existing[0], compressed] : [...existing, compressed];
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          status: prev[itemId]?.status || 'PASS',
          photos: updated
        }
      };
    });
  };

  // Upload Video from Gallery (< 5MB)
  const handleVideoUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Video exceeds 5 MB. Please select a shorter video clip or record directly using the in-app camera.');
    }

    const url = URL.createObjectURL(file);
    setResponses((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        status: prev[itemId]?.status || 'PASS',
        photos: prev[itemId]?.photos || [],
        video: url
      }
    }));
  };

  const removePhoto = (itemId: string, index: number) => {
    setResponses((prev) => {
      const photos = [...(prev[itemId]?.photos || [])];
      photos.splice(index, 1);
      return {
        ...prev,
        [itemId]: { ...prev[itemId], photos }
      };
    });
  };

  const removeVideo = (itemId: string) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], video: undefined }
    }));
  };

  const updateDefectDetails = (itemId: string, note: string, severity?: 'MINOR' | 'MAJOR' | 'CRITICAL') => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        status: 'FAIL',
        photos: prev[itemId]?.photos || [],
        defectNote: note,
        severity: severity || prev[itemId]?.severity || 'MINOR'
      }
    }));
  };

  // --------------------------------------------------------------------------
  // IN-APP CAMERA & VIDEO RECORDER
  // --------------------------------------------------------------------------
  const openMediaModal = async (itemId: string, mode: 'PHOTO' | 'VIDEO') => {
    setMediaModal({ isOpen: true, itemId, mode });
    setIsRecording(false);
    setRecordSeconds(0);
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
    } catch (err) {
      console.warn('Camera access note:', err);
    }
  };

  const closeMediaModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setMediaModal({ isOpen: false, itemId: '', mode: 'PHOTO' });
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

    const itemId = mediaModal.itemId;
    setResponses((prev) => {
      const existing = prev[itemId]?.photos || [];
      const updated = existing.length >= 2 ? [existing[0], dataUrl] : [...existing, dataUrl];
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          status: prev[itemId]?.status || 'PASS',
          photos: updated
        }
      };
    });
    closeMediaModal();
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      const itemId = mediaModal.itemId;
      setResponses((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          status: prev[itemId]?.status || 'PASS',
          photos: prev[itemId]?.photos || [],
          video: videoUrl
        }
      }));
      closeMediaModal();
    };

    recorder.start();
    setIsRecording(true);
    setRecordSeconds(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 30) {
            stopRecording();
            return 30;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Stats
  const allItems = checklistCategories.flatMap((c) => c.items);
  const totalCount = allItems.length;
  const answeredCount = Object.keys(responses).filter((k) => responses[k]?.status).length;
  const passedCount = Object.values(responses).filter((r) => r.status === 'PASS').length;
  const failedCount = Object.values(responses).filter((r) => r.status === 'FAIL').length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  // Active Category Items
  const activeItems = checklistCategories[currentStep].items.filter((item) => {
    if (filterMode === 'PENDING') return !responses[item.id]?.status;
    if (filterMode === 'FAILED') return responses[item.id]?.status === 'FAIL';
    return true;
  });

  if (isSubmitted) {
    return (
      <div className="max-w-lg mx-auto my-12 bg-surface border border-line rounded-panel p-8 text-center space-y-5">
        <div className="w-12 h-12 bg-ok/10 text-ok rounded-full flex items-center justify-center mx-auto border border-ok/20">
          <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink">PDI Inspection Submitted</h2>
          <p className="text-xs text-ink-3 max-w-sm mx-auto mt-1 leading-relaxed">
            All checkpoints recorded with inspection findings. Record has been forwarded to the <strong>QA Review Queue</strong>.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3 bg-canvas rounded border border-line text-center">
          <div>
            <span className="eyebrow block">Checked</span>
            <div className="text-sm font-semibold text-ink tnum mt-0.5">{answeredCount}</div>
          </div>
          <div>
            <span className="eyebrow block text-ok">Passed</span>
            <div className="text-sm font-semibold text-ok tnum mt-0.5">{passedCount}</div>
          </div>
          <div>
            <span className="eyebrow block text-danger">Defects</span>
            <div className="text-sm font-semibold text-danger tnum mt-0.5">{failedCount}</div>
          </div>
        </div>

        <div className="flex gap-2.5 justify-center pt-2">
          <Link
            to="/pdi"
            className="h-8 px-4 bg-accent hover:bg-accent-600 text-white text-xs font-semibold rounded flex items-center justify-center transition-colors cursor-pointer"
          >
            Return to PDI Queue
          </Link>
          <Link
            to="/qa"
            className="h-8 px-4 bg-surface hover:bg-canvas border border-line text-ink text-xs font-semibold rounded flex items-center justify-center transition-colors cursor-pointer"
          >
            View QA Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 pb-20 select-none">
      
      {/* 1. TOP VEHICLE SUMMARY HEADER */}
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link 
              to="/pdi" 
              className="h-8 w-8 rounded bg-canvas border border-line hover:border-line-strong flex items-center justify-center text-ink-3 hover:text-ink transition-colors shrink-0 mt-0.5"
              title="Back to PDI Queue"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone="accent">Tata PDI Sheet</Badge>
                <span className="text-xs font-mono text-ink-3 font-medium">VIN: MAT612345S9988776</span>
              </div>
              <h1 className="text-base sm:text-lg font-semibold tracking-[-0.011em] text-ink">
                Tata Safari Accomplished Plus 6S (Dark Edition)
              </h1>
              <p className="text-xs text-ink-3">
                Stockyard: Pune Yard (Bay 4) • Inspector: Vikram Malhotra (DG002)
              </p>
            </div>
          </div>

          {/* Progress & Submit Action */}
          <div className="flex items-center gap-4 shrink-0 flex-wrap sm:flex-nowrap justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-line">
            <div className="text-left lg:text-right min-w-[140px]">
              <div className="flex items-baseline gap-2 justify-between lg:justify-end">
                <span className="text-sm font-semibold text-ink tnum">{progressPercent}%</span>
                <span className="text-xs text-ink-3 tnum">({answeredCount}/{totalCount} Items)</span>
              </div>
              <Bar pct={progressPercent} tone={progressPercent === 100 ? 'ok' : 'accent'} className="mt-1.5" />
            </div>

            <button
              onClick={() => setIsSubmitted(true)}
              className="h-8 px-3.5 bg-accent hover:bg-accent-600 text-white text-xs font-semibold rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white/90" />
              <span>Submit for QA</span>
            </button>
          </div>
        </div>
      </Panel>

      {/* 2. RESPONSIVE STEPPER TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {checklistCategories.map((cat, idx) => {
          const isSelected = currentStep === idx;
          const catAnswered = cat.items.filter((i) => responses[i.id]?.status).length;
          const isComplete = catAnswered === cat.items.length;

          return (
            <button
              key={cat.id}
              onClick={() => setCurrentStep(idx)}
              className={`p-3 rounded-panel border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-accent text-white border-accent shadow-xs'
                  : 'bg-surface hover:bg-canvas border-line text-ink'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-[10px] uppercase font-semibold tracking-wider ${isSelected ? 'text-white/70' : 'text-ink-3'}`}>
                  Step {cat.stepNumber}
                </span>
                {isComplete && (
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-300' : 'text-ok'}`} />
                )}
              </div>

              <div>
                <div className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-ink'}`}>{cat.shortName}</div>
                <div className={`text-[10px] tnum mt-0.5 ${isSelected ? 'text-white/70' : 'text-ink-3'}`}>
                  {catAnswered}/{cat.items.length} Checked
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE STEP CHECKLIST SHEET */}
      <Panel
        title={
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-3 uppercase font-semibold tracking-wider">
              Step {checklistCategories[currentStep].stepNumber}:
            </span>
            <span className="text-sm font-semibold text-ink">
              {checklistCategories[currentStep].name}
            </span>
          </div>
        }
        action={
          <div className="flex items-center bg-canvas border border-line rounded p-0.5 text-xs">
            {(['ALL', 'PENDING', 'FAILED'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`h-6 px-2.5 rounded-chip text-xs font-medium transition-colors cursor-pointer ${
                  filterMode === mode
                    ? 'bg-surface text-ink border border-line shadow-xs font-semibold'
                    : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                {mode === 'ALL' ? 'All' : mode === 'PENDING' ? 'Pending' : 'Defects'}
              </button>
            ))}
          </div>
        }
      >
        <div className="divide-y divide-line">
          {activeItems.map((item, idx) => {
            const resp = responses[item.id];
            const currentStatus = resp?.status;
            const isPass = currentStatus === 'PASS';
            const isFail = currentStatus === 'FAIL';
            const isNA = currentStatus === 'NA';
            const photos = resp?.photos || [];

            return (
              <div
                key={item.id}
                className={`p-4 transition-colors ${
                  isFail 
                    ? 'bg-danger/5' 
                    : isPass 
                    ? 'bg-surface' 
                    : 'bg-surface'
                }`}
              >
                {/* Row: Title, Guidance, and PASS/FAIL Segmented Actions */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-ink-3 font-mono tnum">
                        {idx + 1}.
                      </span>
                      <span className="text-[11px] font-mono font-medium px-1.5 py-0.2 bg-canvas text-ink-2 rounded-chip border border-line">
                        {item.code}
                      </span>
                      {item.allowsVideo && (
                        <span className="text-[11px] font-medium text-warn bg-warn/10 border border-warn/20 px-1.5 py-0.2 rounded-chip flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Video Optional
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs sm:text-sm font-medium text-ink">{item.title}</h3>
                    <p className="text-xs text-ink-3 leading-relaxed">{item.instruction}</p>
                  </div>

                  {/* Clean Segmented Inspection Buttons (No Overlap) */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start mt-1 md:mt-0">
                    <button
                      type="button"
                      onClick={() => updateItemStatus(item.id, 'PASS')}
                      className={`h-7 px-3 rounded-chip text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        isPass
                          ? 'bg-ok text-white shadow-xs'
                          : 'bg-canvas hover:bg-ok/10 hover:text-ok text-ink-2 border border-line'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>PASS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateItemStatus(item.id, 'FAIL')}
                      className={`h-7 px-3 rounded-chip text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        isFail
                          ? 'bg-danger text-white shadow-xs'
                          : 'bg-canvas hover:bg-danger/10 hover:text-danger text-ink-2 border border-line'
                      }`}
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>FAIL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateItemStatus(item.id, 'NA')}
                      className={`h-7 px-2.5 rounded-chip text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        isNA
                          ? 'bg-ink text-white shadow-xs'
                          : 'bg-canvas hover:bg-line text-ink-3 border border-line'
                      }`}
                    >
                      <Ban className="w-3 h-3" />
                      <span>N/A</span>
                    </button>
                  </div>
                </div>

                {/* Evidence & Media Section */}
                <div className="mt-3 pt-2.5 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 flex-wrap">
                  
                  {/* Photo & Video Action Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-ink-3 mr-1">Proof:</span>

                    {/* Camera Snapshot */}
                    {photos.length < 2 && (
                      <button
                        type="button"
                        onClick={() => openMediaModal(item.id, 'PHOTO')}
                        className="h-6 px-2 bg-surface hover:bg-canvas border border-line text-ink-2 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3 h-3 text-ink-3" />
                        <span>Camera</span>
                      </button>
                    )}

                    {/* Gallery Photo Upload */}
                    {photos.length < 2 && (
                      <label className="h-6 px-2 bg-surface hover:bg-canvas border border-line text-ink-2 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer">
                        <FolderOpen className="w-3 h-3 text-ink-3" />
                        <span>Gallery</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(item.id, e)}
                        />
                      </label>
                    )}

                    {/* Record Video */}
                    {item.allowsVideo && !resp?.video && (
                      <button
                        type="button"
                        onClick={() => openMediaModal(item.id, 'VIDEO')}
                        className="h-6 px-2 bg-warn/10 hover:bg-warn/20 border border-warn/30 text-warn rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Video className="w-3 h-3" />
                        <span>Record Video</span>
                      </button>
                    )}

                    {/* Gallery Video */}
                    {item.allowsVideo && !resp?.video && (
                      <label className="h-6 px-2 bg-warn/10 hover:bg-warn/20 border border-warn/30 text-warn rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>Upload Video</span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => handleVideoUpload(item.id, e)}
                        />
                      </label>
                    )}
                  </div>

                  {/* Attached Media Thumbnails */}
                  {(photos.length > 0 || resp?.video) && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {photos.map((url, pIdx) => (
                        <div key={pIdx} className="relative rounded overflow-hidden w-12 h-8 border border-line group bg-canvas shrink-0">
                          <img src={url} alt={`Proof ${pIdx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(item.id, pIdx)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center transition-opacity cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3 h-3 text-rose-300" />
                          </button>
                        </div>
                      ))}

                      {resp?.video && (
                        <div className="relative rounded overflow-hidden w-12 h-8 border border-warn/40 group bg-ink shrink-0 flex items-center justify-center">
                          <Video className="w-3.5 h-3.5 text-warn" />
                          <button
                            type="button"
                            onClick={() => removeVideo(item.id)}
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center transition-opacity cursor-pointer"
                            title="Remove Video"
                          >
                            <Trash2 className="w-3 h-3 text-rose-300" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Defect Box (Visible on FAIL) */}
                {isFail && (
                  <div className="mt-2.5 p-3 bg-danger/5 border border-danger/20 rounded space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-danger flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Defect Observation & Severity Tag
                      </span>
                      <select
                        value={resp?.severity || 'MINOR'}
                        onChange={(e) => updateDefectDetails(item.id, resp?.defectNote || '', e.target.value as any)}
                        className="text-xs font-medium bg-surface border border-danger/30 text-danger rounded px-2 py-0.5 focus:outline-none"
                      >
                        <option value="MINOR">Minor Defect (Buffing / Easy Fix)</option>
                        <option value="MAJOR">Major Defect (Part Replacement)</option>
                        <option value="CRITICAL">Critical Defect (Hold Vehicle)</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="Describe the defect observation clearly for the workshop team..."
                      value={resp?.defectNote || ''}
                      onChange={(e) => updateDefectDetails(item.id, e.target.value, resp?.severity)}
                      className="w-full h-8 px-2.5 bg-surface border border-danger/20 rounded text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:border-danger"
                    />
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Step Navigation Controls */}
        <div className="p-4 border-t border-line flex items-center justify-between gap-3 flex-wrap">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            ← Previous Step
          </button>

          <span className="text-xs text-ink-3 font-medium tnum">
            Step {currentStep + 1} of {checklistCategories.length}
          </span>

          {currentStep < checklistCategories.length - 1 ? (
            <button
              onClick={() => setCurrentStep((s) => Math.min(checklistCategories.length - 1, s + 1))}
              className="h-8 px-3.5 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={() => setIsSubmitted(true)}
              className="h-8 px-4 rounded bg-ok hover:bg-ok/90 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Complete & Submit for QA
            </button>
          )}
        </div>

      </Panel>

      {/* ========================================================================= */}
      {/* IN-APP CAMERA & VIDEO RECORDING MODAL                                     */}
      {/* ========================================================================= */}
      {mediaModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface text-ink w-full max-w-md rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
            
            {/* Modal Header */}
            <div className="p-3.5 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2">
                {mediaModal.mode === 'PHOTO' ? (
                  <Camera className="w-4 h-4 text-accent" />
                ) : (
                  <Video className="w-4 h-4 text-warn" />
                )}
                <span className="text-xs font-semibold text-ink">
                  {mediaModal.mode === 'PHOTO' ? 'Capture Inspection Photo' : 'Record Video Proof (Max 30s)'}
                </span>
              </div>
              <button
                type="button"
                onClick={closeMediaModal}
                className="p-1 rounded hover:bg-surface text-ink-3 hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Camera Viewfinder */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-danger text-white px-2.5 py-0.5 rounded-full text-xs font-medium font-mono animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span>REC 00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 00:30</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-3.5 border-t border-line flex items-center justify-center gap-3 bg-canvas">
              {mediaModal.mode === 'PHOTO' ? (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="h-9 px-5 bg-accent hover:bg-accent-600 text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Snapshot</span>
                </button>
              ) : (
                <>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="h-9 px-5 bg-danger hover:bg-danger/90 text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="h-9 px-5 bg-surface border border-line hover:border-line-strong text-ink rounded text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <StopCircle className="w-4 h-4 text-danger" />
                      <span>Stop & Attach</span>
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
