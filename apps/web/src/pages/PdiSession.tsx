import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Check, X, Ban, ShieldCheck, CheckCircle2, 
  Camera, Video, Upload, Trash2, AlertTriangle, Play,
  ChevronRight, Car, Eye, Sparkles, Layers, RefreshCw, 
  FileText, StopCircle, Maximize2, Image as ImageIcon,
  FolderOpen, HelpCircle, CheckSquare
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  code: string;
  title: string;
  desc: string;
  hasVideoSuggestion?: boolean;
  videoLabel?: string;
  isEV?: boolean;
}

interface ChecklistCategory {
  id: string;
  name: string;
  icon: string;
  items: ChecklistItem[];
}

interface ItemMedia {
  photos: string[]; // up to 2-3 photos flexibly
  video?: string;
}

// Client-Side High Performance Image Compressor (< 2MB)
const compressImageFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920; // Crisp Full HD
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

        // Compress to ensure under 2 MB
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
  const [activeCategory, setActiveCategory] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING' | 'FAILED'>('ALL');

  // Camera & Video Capture Modal State
  const [captureModal, setCaptureModal] = useState<{
    isOpen: boolean;
    itemId: string;
    mode: 'PHOTO' | 'VIDEO';
  }>({ isOpen: false, itemId: '', mode: 'PHOTO' });

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Master Tata Motors Checklist (54 Checkpoints)
  const categories: ChecklistCategory[] = [
    {
      id: 'cat-1',
      name: '1. Exterior, Body & Paint',
      icon: '🚗',
      items: [
        { id: 'ext-1', code: 'EXT-01', title: 'VIN Plate, Chassis & Engine Number', desc: 'Verify VIN stamped on bottom windshield, B-pillar badge and under-hood chassis punch.' },
        { id: 'ext-2', code: 'EXT-02', title: 'Paint Finish, Gloss & Scratch / Dent Check', desc: 'Inspect entire clear-coat in direct daylight for scratches, paint chips, or swirl marks.' },
        { id: 'ext-3', code: 'EXT-03', title: 'Panel Gaps & Flush Alignment', desc: 'Measure uniform 3.5mm-4.5mm gaps around hood, front fenders, doors and rear tailgate.' },
        { id: 'ext-4', code: 'EXT-04', title: 'Front Bumper, Grille & Humanity Line', desc: 'Check front bumper fitment, lower air dam, fog lamp bezels and Tata Humanity line.' },
        { id: 'ext-5', code: 'EXT-05', title: 'Rear Bumper, Skid Plate & Badging', desc: 'Ensure rear monogram, parking sensor bezels, and rear bumper fitment.' },
        { id: 'ext-6', code: 'EXT-06', title: 'Windshield, Rear Glass & Side Windows', desc: 'Inspect all 6/8 glasses for chips, cracks, stress lines, and matching DOT code.' },
        { id: 'ext-7', code: 'EXT-07', title: 'ORVM Glass, Housing Caps & Electric Fold', desc: 'Check side mirrors for scratches, auto-folding motor smoothness, and blinkers.' },
        { id: 'ext-8', code: 'EXT-08', title: 'Door Handles & Keyless Entry Sensors', desc: 'Inspect all 4 exterior door handles, welcome lights, and capacitive touch sensors.' },
        { id: 'ext-9', code: 'EXT-09', title: 'Diamond Cut Alloy Wheels & Lug Nuts', desc: 'Verify zero curb rash on diamond-cut alloys, center logo caps and tightened lug nuts.' },
        { id: 'ext-10', code: 'EXT-10', title: 'All 4 Tyres + Spare Wheel (DOT Date)', desc: 'Confirm matching tyre brand, 33-36 PSI pressure and DOT week/year stamp.' },
        { id: 'ext-11', code: 'EXT-11', title: 'Fuel Lid / EV Charging Flap & Seal', desc: 'Check push-to-open latch, inner rubber weather strip and fuel cap / CCS2 flap.' },
        { id: 'ext-12', code: 'EXT-12', title: 'Roof Rails, Shark Fin Antenna & Roof', desc: 'Inspect roof rails load-mounts, shark fin antenna seal and panoramic roof external frame.' }
      ]
    },
    {
      id: 'cat-2',
      name: '2. Lighting & Electricals',
      icon: '💡',
      items: [
        { id: 'lgt-1', code: 'LGT-01', title: 'LED DRLs & Headlamp High/Low Beam', desc: 'Test bi-LED projector throw, leveler switch, and cornering fog lamp activation.' },
        { id: 'lgt-2', code: 'LGT-02', title: 'Sequential Turn Indicators & Hazard Lamps', desc: 'Check front and rear sequential LED swipe animation and 4-way hazard flasher.', hasVideoSuggestion: true, videoLabel: 'Sequential Indicator / Hazard Sweep Video' },
        { id: 'lgt-3', code: 'LGT-03', title: 'Connected LED Tail Lightbar & Brake Light', desc: 'Verify edge-to-edge rear lightbar illumination, reversing lamps and 3rd brake light.' },
        { id: 'lgt-4', code: 'LGT-04', title: 'Dual Horn Tone & Sound Output', desc: 'Test high-low dual trumpet horn output for clear, non-muffled acoustic response.', hasVideoSuggestion: true, videoLabel: 'Horn Sound Recording' },
        { id: 'lgt-5', code: 'LGT-05', title: 'Wiper Blades, Motor & Washer Jet Spray', desc: 'Test intermittent, slow, fast speeds and twin spray nozzle fan pattern.', hasVideoSuggestion: true, videoLabel: 'Wiper Sweep & Spray Video' },
        { id: 'lgt-6', code: 'LGT-06', title: 'Power Windows One-Touch & Anti-Pinch', desc: 'Inspect all 4 door windows for smooth travel without friction or motor noise.' },
        { id: 'lgt-7', code: 'LGT-07', title: 'Smart Key Fobs (Lock, Unlock, Boot Release)', desc: 'Check both OEM smart keys range, mechanical backup key release, and battery.' },
        { id: 'lgt-8', code: 'LGT-08', title: '360° Surround Camera & Reverse Guidelines', desc: 'Test rear camera lens clarity, dynamic steering guidelines and ultrasonic beep.', hasVideoSuggestion: true, videoLabel: 'Reverse Camera & Dynamic Lines Video' }
      ]
    },
    {
      id: 'cat-3',
      name: '3. Interior & Infotainment',
      icon: '💺',
      items: [
        { id: 'int-1', code: 'INT-01', title: 'Dashboard Leatherette & AC Vents Fitment', desc: 'Inspect dashboard fitment, center console alignment, and chrome air-vent louvers.' },
        { id: 'int-2', code: 'INT-02', title: 'Digital Instrument Cluster & Odometer (<50km)', desc: 'Verify self-test sequence, zero error warning lights, and confirm factory odometer.' },
        { id: 'int-3', code: 'INT-03', title: 'Touchscreen Infotainment (Harman Audio)', desc: 'Test touchscreen responsiveness, Bluetooth pairing, Apple CarPlay & Android Auto.', hasVideoSuggestion: true, videoLabel: 'Touchscreen Responsiveness & Sound Video' },
        { id: 'int-4', code: 'INT-04', title: 'Automatic Climate Control (HVAC Cooling)', desc: 'Test cooling at 16°C, blower fan speeds 1-7, and air recirculation flap.', hasVideoSuggestion: true, videoLabel: 'AC Blower & Cooling Performance Video' },
        { id: 'int-5', code: 'INT-05', title: 'Panoramic Sunroof & Sunblind Operation', desc: 'Test one-touch open, tilt, slide, anti-pinch safety obstruction stop.', hasVideoSuggestion: true, videoLabel: 'Sunroof Slide & Anti-Pinch Video' },
        { id: 'int-6', code: 'INT-06', title: 'Seats Upholstery & Ventilated Seats', desc: 'Inspect leatherette upholstery, headrests, armrests, and power seat adjust.' },
        { id: 'int-7', code: 'INT-07', title: 'Seatbelts (All 3-Point ELR & Pre-Tensioner)', desc: 'Pull all seatbelts firmly to verify inertial reel lock and smooth retraction.' },
        { id: 'int-8', code: 'INT-08', title: 'Steering Wheel Controls & Illuminated Logo', desc: 'Check 4-spoke illuminated steering logo, audio switches and column lock.' },
        { id: 'int-9', code: 'INT-09', title: 'Cabin Ambient Lighting & Cooled Glovebox', desc: 'Inspect multi-color mood lighting strips and glovebox cooling duct.' },
        { id: 'int-10', code: 'INT-10', title: 'Floor Carpets, Toolkit, Jack & Warning Triangle', desc: 'Verify OEM floor mats, spare jack, wheel spanner, tow hook and triangle.' }
      ]
    },
    {
      id: 'cat-4',
      name: '4. Under-Hood & Fluids',
      icon: '⚙️',
      items: [
        { id: 'eng-1', code: 'ENG-01', title: 'Engine Oil Level & Dipstick Inspection', desc: 'Check oil level on dipstick between MIN and MAX. Oil should be clear amber.' },
        { id: 'eng-2', code: 'ENG-02', title: 'Coolant Expansion Reservoir & Hoses', desc: 'Verify coolant level in expansion tank, cap seal tightness, and zero hose seepage.' },
        { id: 'eng-3', code: 'ENG-03', title: 'Brake & Clutch Fluid Master Reservoir', desc: 'Check DOT4 brake fluid level at MAX mark with no moisture contamination.' },
        { id: 'eng-4', code: 'ENG-04', title: '12V Auxiliary Battery Health & Voltage', desc: 'Check battery terminal clamps, acid vent seal, and measure voltage (>12.6V).' },
        { id: 'eng-5', code: 'ENG-05', title: 'Engine Wire Harness, Relays & Fuse Box', desc: 'Verify complete harness taping, no rodent bites, and secure fuse box lid.' },
        { id: 'eng-6', code: 'ENG-06', title: 'Windshield Washer Fluid Tank Full', desc: 'Ensure washer reservoir is filled with clean washer fluid and strainer is present.' },
        { id: 'eng-7', code: 'ENG-07', title: 'Engine Cold Start & Idling Sound', desc: 'Crank engine on cold start. Verify instant start, steady 800-900 RPM idle.', hasVideoSuggestion: true, videoLabel: 'Engine Cold Start & Idling Sound Video' },
        { id: 'eng-8', code: 'ENG-08', title: 'Exhaust Gas & Tailpipe Emissions', desc: 'Inspect tailpipe exhaust at idle and 2500 RPM rev. Must have zero smoke.', hasVideoSuggestion: true, videoLabel: 'Exhaust Pipe Smoke Test Video' }
      ]
    },
    {
      id: 'cat-5',
      name: '5. Under-Chassis & Brakes',
      icon: '🔧',
      items: [
        { id: 'und-1', code: 'UND-01', title: 'Underbody Anti-Rust Coating & Crossmembers', desc: 'Inspect floor pan on lift for transit scraping, dented crossmembers, and coating.' },
        { id: 'und-2', code: 'UND-02', title: 'Front & Rear Suspension (Struts & Springs)', desc: 'Check MacPherson struts, coil springs, bump stops and anti-roll bar bushings.' },
        { id: 'und-3', code: 'UND-03', title: 'Brake Discs, Calipers & Hydraulic Lines', desc: 'Inspect front brake discs for scoring, caliper pins grease seal, and rigid lines.' },
        { id: 'und-4', code: 'UND-04', title: 'Steering Rack, Tie Rods & CV Axle Boots', desc: 'Verify rubber bellows on steering rack and drive axle CV joints have zero tears.' },
        { id: 'und-5', code: 'UND-05', title: 'Fuel Tank / High-Voltage Battery Shield', desc: 'Check fuel tank guard / EV underbody ballistic shield for impact marks.' },
        { id: 'und-6', code: 'UND-06', title: 'Underbody Fluid Leakage Full Inspection', desc: 'Check engine sump plug, gearbox casing, and radiator bottom for fluid drops.', hasVideoSuggestion: true, videoLabel: 'Underbody Inspection Sweep Video' }
      ]
    },
    {
      id: 'cat-6',
      name: '6. EV Battery & High Voltage',
      icon: '⚡',
      items: [
        { id: 'ev-1', code: 'EV-01', title: 'High Voltage Battery SoH & SoC (>90%)', desc: 'Verify cluster SoC is > 90% and run diagnostic scan to confirm 100% SoH.', isEV: true },
        { id: 'ev-2', code: 'EV-02', title: 'AC Slow Charging & Portable Cable Lock', desc: 'Confirm motorized port lock, green LED and dash charging indicator.', isEV: true },
        { id: 'ev-3', code: 'EV-03', title: 'DC Fast Charging Port (CCS2 Pins & Cap)', desc: 'Inspect 2 high-current DC pins, orange HV cables, and rubber weather cap.', isEV: true },
        { id: 'ev-4', code: 'EV-04', title: 'Regen Braking Paddles & Drive Selector', desc: 'Test Level 0, 1, 2, 3 paddle regen changes and Eco/City/Sport dial engagement.', hasVideoSuggestion: true, videoLabel: 'Drive Mode & Regen Paddle Video', isEV: true }
      ]
    },
    {
      id: 'cat-7',
      name: '7. Road Test & Handover',
      icon: '📋',
      items: [
        { id: 'dyn-1', code: 'DYN-01', title: 'Transmission & Clutch Operation', desc: 'Check manual 6-speed / DCA dual clutch engagement without judder.', hasVideoSuggestion: true, videoLabel: 'Gear Shift Engagement Video' },
        { id: 'dyn-2', code: 'DYN-02', title: 'Braking Performance & Auto-Hold / EPB', desc: 'Test progressive pedal bite, emergency stop straight-line tracking, and EPB.' },
        { id: 'dyn-3', code: 'DYN-03', title: 'Steering Wheel Alignment & Road Tracking', desc: 'Verify vehicle tracks dead straight with steering centered on smooth road.' },
        { id: 'dyn-4', code: 'DYN-04', title: 'Cabin NVH Squeak & Rattle Road Test', desc: 'Drive on yard rumble strips to confirm zero dashboard squeaks or door rattles.' },
        { id: 'dyn-5', code: 'DYN-05', title: 'Documentation Kit (Manual, Fastag, Book)', desc: 'Ensure owner manual, warranty handbook, battery warranty and Fastag RFID are present.' },
        { id: 'dyn-6', code: 'DYN-06', title: 'Final Grooming, Washing & Delivery Polish', desc: 'Confirm exterior wash, tyre dressing polish, cabin vacuuming and paper floor mats.' }
      ]
    }
  ];

  // Responses state
  const [responses, setResponses] = useState<Record<string, {
    status: 'PASS' | 'FAIL' | 'NA';
    photos: string[];
    video?: string;
    notes?: string;
  }>>({
    'ext-1': { 
      status: 'PASS', 
      photos: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500'] 
    },
    'ext-2': { 
      status: 'PASS', 
      photos: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500'] 
    },
    'lgt-1': { 
      status: 'PASS', 
      photos: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500'] 
    }
  });

  const handleStatusChange = (itemId: string, status: 'PASS' | 'FAIL' | 'NA') => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { 
        ...prev[itemId], 
        status, 
        photos: prev[itemId]?.photos || [] 
      }
    }));
  };

  // Upload Photo from Gallery with Auto-Compress under 2 MB
  const handlePhotoUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImageFile(file);
    setResponses((prev) => {
      const existingPhotos = prev[itemId]?.photos || [];
      const updatedPhotos = existingPhotos.length >= 2 
        ? [existingPhotos[0], compressed] 
        : [...existingPhotos, compressed];

      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          status: prev[itemId]?.status || 'PASS',
          photos: updatedPhotos
        }
      };
    });
  };

  // Upload Video from Gallery with Size Check (< 5 MB)
  const handleVideoUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Video file exceeds 5 MB. Please select a shorter video or record directly using the in-app camera.');
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

  const handleNotesChange = (itemId: string, notes: string) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { 
        ...prev[itemId], 
        status: prev[itemId]?.status || 'PASS',
        photos: prev[itemId]?.photos || [],
        notes 
      }
    }));
  };

  // --------------------------------------------------------------------------
  // IN-APP CAMERA & VIDEO RECORDER HANDLERS
  // --------------------------------------------------------------------------
  const openCameraModal = async (itemId: string, mode: 'PHOTO' | 'VIDEO') => {
    setCaptureModal({ isOpen: true, itemId, mode });
    setIsRecording(false);
    setRecordSeconds(0);
    recordedChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'VIDEO'
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
    }
  };

  const closeCameraModal = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    setCaptureModal({ isOpen: false, itemId: '', mode: 'PHOTO' });
    setIsRecording(false);
  };

  // Capture Photo from Live Camera Viewfinder
  const capturePhotoSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const itemId = captureModal.itemId;
    setResponses((prev) => {
      const existingPhotos = prev[itemId]?.photos || [];
      const updatedPhotos = existingPhotos.length >= 2 
        ? [existingPhotos[0], photoDataUrl] 
        : [...existingPhotos, photoDataUrl];

      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          status: prev[itemId]?.status || 'PASS',
          photos: updatedPhotos
        }
      };
    });

    closeCameraModal();
  };

  // Start Video Recording in Live Viewfinder
  const startVideoRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(mediaStreamRef.current, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      const itemId = captureModal.itemId;
      setResponses((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          status: prev[itemId]?.status || 'PASS',
          photos: prev[itemId]?.photos || [],
          video: videoUrl
        }
      }));
      closeCameraModal();
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordSeconds(0);
  };

  // Stop Recording
  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Timer effect during recording
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordSeconds(s => {
          if (s >= 30) { // Max 30s video to keep < 5MB
            stopVideoRecording();
            return 30;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Clean up media streams
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Stats
  const allItems = categories.flatMap(c => c.items);
  const totalCount = allItems.length;
  const answeredCount = Object.keys(responses).length;
  const passedCount = Object.values(responses).filter(r => r.status === 'PASS').length;
  const failedCount = Object.values(responses).filter(r => r.status === 'FAIL').length;
  const totalPhotos = Object.values(responses).reduce((acc, curr) => acc + (curr.photos?.length || 0), 0);
  const totalVideos = Object.values(responses).filter(r => r.video).length;
  const progressPct = Math.round((answeredCount / totalCount) * 100);

  // Filtered items
  const currentCategoryItems = categories[activeCategory].items.filter(item => {
    if (filterMode === 'PENDING') return !responses[item.id];
    if (filterMode === 'FAILED') return responses[item.id]?.status === 'FAIL';
    return true;
  });

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white border border-[#E2E8F0] rounded-3xl p-10 text-center shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 shadow-inner">
          <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
            Inspection Protocol Completed
          </span>
          <h2 className="text-2xl font-black text-[#0F172A]">Tata PDI Master Submitted!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            All 54 checkpoints recorded with high-res photos and video proof. The inspection dossier has been submitted to <strong>QA Manager Review Queue</strong>.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Checked</span>
            <div className="text-base font-black text-[#0F172A]">{answeredCount}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-600">Passed</span>
            <div className="text-base font-black text-emerald-600">{passedCount}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-600">Photos</span>
            <div className="text-base font-black text-blue-600">{totalPhotos}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-600">Videos</span>
            <div className="text-base font-black text-amber-600">{totalVideos}</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <Link
            to="/pdi"
            className="px-6 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-bold rounded-2xl shadow transition-all"
          >
            Return to PDI Queue
          </Link>
          <Link
            to="/qa"
            className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-[#0F172A] text-sm font-bold rounded-2xl shadow-xs transition-all"
          >
            Go to QA Reviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 select-none">
      
      {/* Top Header Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/pdi" 
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0F172A] rounded-2xl transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Tata Motors PDI Protocol
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">VIN: MAT612345S9988776</span>
            </div>
            <h1 className="text-xl font-black text-[#0F172A] mt-1">Tata Safari Accomplished Plus 6S (Dark Edition)</h1>
            <p className="text-xs text-slate-500 font-medium">Stockyard Bay: SY-PUNE-BAY4 • Inspector: Vikram Malhotra (DG002)</p>
          </div>
        </div>

        {/* Progress & Submit Action */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 block">Inspection Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-[#0F172A] font-mono">{progressPct}%</span>
              <span className="text-xs font-semibold text-slate-400">({answeredCount}/{totalCount})</span>
            </div>
            <div className="w-32 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setIsSubmitted(true)}
            className="px-6 py-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-extrabold rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Submit for QA</span>
          </button>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Category Navigation (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 shadow-xs space-y-1.5">
            <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Inspection Modules</span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">7 Categories</span>
            </div>

            {categories.map((cat, idx) => {
              const isSelected = activeCategory === idx;
              const catAnswered = cat.items.filter(i => responses[i.id]).length;
              const isComplete = catAnswered === cat.items.length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#0F172A] text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate max-w-[180px]">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {catAnswered}/{cat.items.length}
                    </span>
                    {isComplete && <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Guidelines Box */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Media Guidelines</span>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md">
                Auto-Compressed
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              • <strong>Photos:</strong> Max 2 MB (Auto-compressed to Full HD).<br/>
              • <strong>Videos:</strong> Max 5 MB / 30s clips.<br/>
              • Capture live from in-app camera or upload from device gallery.
            </p>
          </div>
        </div>

        {/* Right Inspection Checkpoints & Media Uploader (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Category Banner & Filter */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2.5 bg-slate-100 rounded-2xl">{categories[activeCategory].icon}</span>
              <div>
                <h2 className="text-base font-black text-[#0F172A]">{categories[activeCategory].name}</h2>
                <p className="text-xs text-slate-500">{categories[activeCategory].items.length} Checkpoints</p>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['ALL', 'PENDING', 'FAILED'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    filterMode === mode ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist Items List */}
          <div className="space-y-4">
            {currentCategoryItems.map((item) => {
              const resp = responses[item.id];
              const currentStatus = resp?.status;
              const isPass = currentStatus === 'PASS';
              const isFail = currentStatus === 'FAIL';
              const isNA = currentStatus === 'NA';
              const photos = resp?.photos || [];

              return (
                <div 
                  key={item.id}
                  className={`bg-white border rounded-3xl p-5 shadow-xs space-y-4 transition-all ${
                    isFail 
                      ? 'border-rose-300 bg-rose-50/20' 
                      : isPass 
                        ? 'border-slate-200 hover:border-slate-300' 
                        : 'border-[#E2E8F0]'
                  }`}
                >
                  {/* Item Header & Pass/Fail Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 bg-slate-100 text-[#0F172A] rounded-lg border border-slate-200">
                          {item.code}
                        </span>
                        {item.hasVideoSuggestion && (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md flex items-center gap-1 border border-amber-200">
                            <Video className="w-3 h-3" />
                            Video Option
                          </span>
                        )}
                        {item.isEV && (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md border border-emerald-200">
                            EV Point
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-[#0F172A]">{item.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{item.desc}</p>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'PASS')}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                          isPass
                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        PASS
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'FAIL')}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                          isFail
                            ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        <X className="w-4 h-4 stroke-[3]" />
                        FAIL
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'NA')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isNA
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        N/A
                      </button>
                    </div>
                  </div>

                  {/* MEDIA CONTROLS & GALLERY (LIVE CAMERA + FILE UPLOAD) */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    
                    {/* Action Bar for Media */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#0F172A]" />
                        <span>Media Attachments ({photos.length} Photo{photos.length !== 1 ? 's' : ''}{resp?.video ? ', 1 Video' : ''})</span>
                      </div>

                      {/* Add Media Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 1. Live Camera Photo */}
                        {photos.length < 2 && (
                          <button
                            type="button"
                            onClick={() => openCameraModal(item.id, 'PHOTO')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0F172A] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Take Photo</span>
                          </button>
                        )}

                        {/* 2. Gallery Photo Upload */}
                        {photos.length < 2 && (
                          <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0F172A] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Upload Photo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handlePhotoUpload(item.id, e)} 
                            />
                          </label>
                        )}

                        {/* 3. Record Video */}
                        {!resp?.video && (
                          <button
                            type="button"
                            onClick={() => openCameraModal(item.id, 'VIDEO')}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5 text-amber-700" />
                            <span>Record Video</span>
                          </button>
                        )}

                        {/* 4. Gallery Video Upload */}
                        {!resp?.video && (
                          <label className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                            <Upload className="w-3.5 h-3.5 text-amber-700" />
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
                    </div>

                    {/* Media Previews Grid */}
                    {(photos.length > 0 || resp?.video) && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                        
                        {/* Render Attached Photos */}
                        {photos.map((photoUrl, idx) => (
                          <div key={idx} className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 group">
                            <img src={photoUrl} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded">
                                Photo {idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removePhoto(item.id, idx)}
                                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all cursor-pointer"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Render Attached Video */}
                        {resp?.video && (
                          <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-amber-300 group flex items-center justify-center">
                            <video src={resp.video} controls className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeVideo(item.id)}
                              className="absolute top-2 right-2 p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg shadow transition-all cursor-pointer z-10"
                              title="Delete Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                      </div>
                    )}

                  </div>

                  {/* Notes / Observation Input */}
                  {(isFail || resp?.notes) && (
                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder="Add defect notes or specific damage observation (optional)..."
                        value={resp?.notes || ''}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                      />
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Bottom Module Pagination */}
          <div className="flex items-center justify-between p-4 bg-white border border-[#E2E8F0] rounded-3xl shadow-xs">
            <button
              disabled={activeCategory === 0}
              onClick={() => setActiveCategory(prev => Math.max(0, prev - 1))}
              className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous Module
            </button>

            <span className="text-xs font-bold text-slate-500">
              Module {activeCategory + 1} of {categories.length}
            </span>

            {activeCategory < categories.length - 1 ? (
              <button
                onClick={() => setActiveCategory(prev => Math.min(categories.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-xs cursor-pointer"
              >
                Next Module
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitted(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
              >
                Complete & Submit for QA
              </button>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* IN-APP CAMERA & VIDEO RECORDING MODAL VIEWPORT                           */}
      {/* ========================================================================= */}
      {captureModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] text-white w-full max-w-lg rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {captureModal.mode === 'PHOTO' ? (
                  <Camera className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Video className="w-5 h-5 text-amber-400" />
                )}
                <span className="text-sm font-black">
                  {captureModal.mode === 'PHOTO' ? 'Live Camera Snapshot' : 'Record Video Proof (Max 30s)'}
                </span>
              </div>
              <button
                type="button"
                onClick={closeCameraModal}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
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

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-rose-600/90 text-white px-3 py-1 rounded-full text-xs font-bold font-mono animate-pulse">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  <span>REC 00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 00:30</span>
                </div>
              )}
            </div>

            {/* Viewfinder Actions */}
            <div className="p-5 border-t border-slate-800 flex items-center justify-center gap-4">
              {captureModal.mode === 'PHOTO' ? (
                <button
                  type="button"
                  onClick={capturePhotoSnapshot}
                  className="px-8 py-3.5 bg-white hover:bg-slate-100 text-[#0F172A] rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>Capture Photo</span>
                </button>
              ) : (
                <>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startVideoRecording}
                      className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <div className="w-3.5 h-3.5 bg-white rounded-full" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVideoRecording}
                      className="px-8 py-3.5 bg-white hover:bg-slate-100 text-[#0F172A] rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <StopCircle className="w-5 h-5 text-rose-600" />
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
