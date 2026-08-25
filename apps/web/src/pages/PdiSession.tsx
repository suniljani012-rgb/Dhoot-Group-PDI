import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Check, X, Ban, ShieldCheck, CheckCircle2, 
  Camera, Video, Upload, Trash2, AlertTriangle, Play,
  ChevronRight, Car, Eye, Sparkles, Layers, RefreshCw, FileText
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  code: string;
  title: string;
  desc: string;
  photo1Label: string;
  photo2Label: string;
  hasVideo?: boolean;
  videoLabel?: string;
  isEV?: boolean;
}

interface ChecklistCategory {
  id: string;
  name: string;
  icon: string;
  items: ChecklistItem[];
}

export const PdiSessionPage: React.FC = () => {
  const { id } = useParams();
  const [activeCategory, setActiveCategory] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING' | 'FAILED'>('ALL');

  // Official Tata Motors PDI Master Checklist with 2 Photos + Video on required steps
  const categories: ChecklistCategory[] = [
    {
      id: 'cat-1',
      name: '1. Exterior, Body Panels & Paint',
      icon: '🚗',
      items: [
        {
          id: 'ext-1',
          code: 'EXT-01',
          title: 'VIN Plate, Chassis & Engine Number Verification',
          desc: 'Verify VIN stamped on bottom windshield, B-pillar badge and under-hood chassis punch matches invoice.',
          photo1Label: 'Photo 1: B-Pillar VIN Badge',
          photo2Label: 'Photo 2: Engine Bay Chassis Stamp'
        },
        {
          id: 'ext-2',
          code: 'EXT-02',
          title: 'Paint Finish, Gloss & Scratch / Dent Inspection',
          desc: 'Inspect entire clear-coat in direct daylight for transport transit scratches, paint chips, or swirl marks.',
          photo1Label: 'Photo 1: Left Side Paint Gloss',
          photo2Label: 'Photo 2: Right Side Paint Gloss'
        },
        {
          id: 'ext-3',
          code: 'EXT-03',
          title: 'Panel Gaps & Flush Alignment',
          desc: 'Measure uniform 3.5mm-4.5mm gaps around hood, front fenders, doors and rear tailgate.',
          photo1Label: 'Photo 1: Hood & Fender Gap',
          photo2Label: 'Photo 2: Tailgate & Quarter Panel Gap'
        },
        {
          id: 'ext-4',
          code: 'EXT-04',
          title: 'Front Bumper, Grille & Chrome Humanity Line',
          desc: 'Check front bumper clip fitment, lower air dam, fog lamp bezels and Tata Humanity line.',
          photo1Label: 'Photo 1: Front Grille & Chrome Line',
          photo2Label: 'Photo 2: Lower Bumper & Skid Plate'
        },
        {
          id: 'ext-5',
          code: 'EXT-05',
          title: 'Rear Bumper, Skid Plate & Tailgate Badging',
          desc: 'Ensure rear monogram (Safari/Harrier/Nexon/Punch), parking sensor bezels, and rear bumper fitment.',
          photo1Label: 'Photo 1: Tailgate Badging & Fitment',
          photo2Label: 'Photo 2: Rear Bumper & Sensors'
        },
        {
          id: 'ext-6',
          code: 'EXT-06',
          title: 'Windshield, Rear Glass & Side Windows (DOT Code)',
          desc: 'Inspect all 6/8 glasses for chips, cracks, stress lines, and matching manufacturing year/month code.',
          photo1Label: 'Photo 1: Front Windshield Glass & Stamp',
          photo2Label: 'Photo 2: Rear Defogger Glass & Stamp'
        },
        {
          id: 'ext-7',
          code: 'EXT-07',
          title: 'ORVM Glass, Housing Caps & Electric Fold',
          desc: 'Check side mirrors for scratches, auto-folding motor smoothness, and integrated LED blinkers.',
          photo1Label: 'Photo 1: Driver Side ORVM Cap & Glass',
          photo2Label: 'Photo 2: Passenger Side ORVM Cap & Glass'
        },
        {
          id: 'ext-8',
          code: 'EXT-08',
          title: 'Door Handles & Keyless Entry Request Sensors',
          desc: 'Inspect all 4 exterior door handles, welcome lights, and capacitive touch entry sensors.',
          photo1Label: 'Photo 1: Front Door Sensor Handles',
          photo2Label: 'Photo 2: Rear Door Handles'
        },
        {
          id: 'ext-9',
          code: 'EXT-09',
          title: 'Diamond Cut Alloy Wheels & Lug Nuts Torque',
          desc: 'Verify zero curb rash on diamond-cut alloys, center Tata logo caps and tightened lug nuts.',
          photo1Label: 'Photo 1: Front Right Alloy Wheel',
          photo2Label: 'Photo 2: Rear Right Alloy Wheel'
        },
        {
          id: 'ext-10',
          code: 'EXT-10',
          title: 'All 4 Tyres + Spare Wheel (DOT Mfg Date & Tread)',
          desc: 'Confirm tyre brand matching (MRF/Apollo/Goodyear), 33-36 PSI pressure and DOT week/year stamp.',
          photo1Label: 'Photo 1: Tyre DOT Date & Tread Mark',
          photo2Label: 'Photo 2: Boot Spare Wheel & Jack Kit'
        },
        {
          id: 'ext-11',
          code: 'EXT-11',
          title: 'Fuel Lid / EV Charging Flap & Seal Mechanism',
          desc: 'Check push-to-open latch, inner rubber weather strip and fuel cap tether / CCS2 flap.',
          photo1Label: 'Photo 1: Outer Fuel / EV Flap Fitment',
          photo2Label: 'Photo 2: Inner Seal & Cap Mechanism'
        },
        {
          id: 'ext-12',
          code: 'EXT-12',
          title: 'Roof Rails, Shark Fin Antenna & Roof Panel',
          desc: 'Inspect roof rails load-mounts, shark fin antenna seal and panoramic roof external frame.',
          photo1Label: 'Photo 1: Roof Panel & Rails Fitment',
          photo2Label: 'Photo 2: Shark Fin Antenna Fitment'
        }
      ]
    },
    {
      id: 'cat-2',
      name: '2. Lighting, Signals & Electricals',
      icon: '💡',
      items: [
        {
          id: 'lgt-1',
          code: 'LGT-01',
          title: 'LED DRLs & Headlamp High/Low Beam + Fog Lamps',
          desc: 'Test signature bi-LED projector throw, leveler switch, and cornering fog lamp activation.',
          photo1Label: 'Photo 1: DRLs & Low Beam Active',
          photo2Label: 'Photo 2: High Beam & Fog Lamps Active'
        },
        {
          id: 'lgt-2',
          code: 'LGT-02',
          title: 'Sequential Turn Indicators & Hazard Warning Flashers',
          desc: 'Check front and rear sequential LED swipe animation and 4-way hazard flasher sync.',
          photo1Label: 'Photo 1: Front Indicator Illumination',
          photo2Label: 'Photo 2: Rear Indicator Illumination',
          hasVideo: true,
          videoLabel: 'Video: Sequential Indicator & Hazard Swipe Video (5-10s)'
        },
        {
          id: 'lgt-3',
          code: 'LGT-03',
          title: 'Connected LED Tail Lightbar & High Mount Stop Lamp',
          desc: 'Verify edge-to-edge rear lightbar illumination, reversing lamps and 3rd brake light.',
          photo1Label: 'Photo 1: Running Lightbar Illumination',
          photo2Label: 'Photo 2: Brake Stop Lamp Illumination'
        },
        {
          id: 'lgt-4',
          code: 'LGT-04',
          title: 'Dual Horn Tone & Sound Output',
          desc: 'Test high-low dual trumpet horn output for clear, non-muffled acoustic response.',
          photo1Label: 'Photo 1: Steering Horn Pad Fitment',
          photo2Label: 'Photo 2: Engine Bay Dual Horn Unit',
          hasVideo: true,
          videoLabel: 'Video: Horn Sound Output Recording (3-5s)'
        },
        {
          id: 'lgt-5',
          code: 'LGT-05',
          title: 'Front & Rear Wiper Blades, Motor & Washer Jet Spray',
          desc: 'Test intermittent, slow, fast speeds and twin spray nozzle fan pattern onto windshield.',
          photo1Label: 'Photo 1: Wiper Rubber Blade Condition',
          photo2Label: 'Photo 2: Washer Fluid Spray Pattern',
          hasVideo: true,
          videoLabel: 'Video: Wiper Motor & Washer Spray Sweep Video (5-10s)'
        },
        {
          id: 'lgt-6',
          code: 'LGT-06',
          title: 'Power Windows One-Touch Up/Down & Anti-Pinch',
          desc: 'Inspect all 4 door windows for smooth travel without friction, glass shudder, or motor noise.',
          photo1Label: 'Photo 1: Driver Master Switch Console',
          photo2Label: 'Photo 2: Rear Window Glass Full Up'
        },
        {
          id: 'lgt-7',
          code: 'LGT-07',
          title: 'Smart Key Fobs (Lock, Unlock, Boot, Follow-Me-Home)',
          desc: 'Check both OEM smart keys range, mechanical backup key release, and battery health.',
          photo1Label: 'Photo 1: Primary Smart Key Fob',
          photo2Label: 'Photo 2: Spare Smart Key Fob'
        },
        {
          id: 'lgt-8',
          code: 'LGT-08',
          title: '360° Surround Camera & Reverse Parking Sensors',
          desc: 'Test rear camera lens clarity, dynamic steering guidelines and ultrasonic distance beep.',
          photo1Label: 'Photo 1: Infotainment 360°/Reverse Screen',
          photo2Label: 'Photo 2: Rear Tailgate Camera Lens',
          hasVideo: true,
          videoLabel: 'Video: Reverse Camera Dynamic Steering Line Video (5-10s)'
        }
      ]
    },
    {
      id: 'cat-3',
      name: '3. Interior Cabin, Dashboard & Infotainment',
      icon: '💺',
      items: [
        {
          id: 'int-1',
          code: 'INT-01',
          title: 'Dashboard Leatherette/Soft Touch & AC Vents Fitment',
          desc: 'Inspect dashboard fitment, center console alignment, and chrome air-vent louvers movement.',
          photo1Label: 'Photo 1: Full Cockpit Dashboard View',
          photo2Label: 'Photo 2: Center Console & Gear Surround'
        },
        {
          id: 'int-2',
          code: 'INT-02',
          title: 'Full Digital Instrument Cluster & Odometer (< 50 km)',
          desc: 'Verify self-test sequence, zero error warning lights, and confirm factory stockyard odometer.',
          photo1Label: 'Photo 1: Digital Cluster Self-Test Screen',
          photo2Label: 'Photo 2: Odometer Reading Proof (< 50 km)'
        },
        {
          id: 'int-3',
          code: 'INT-03',
          title: 'Touchscreen Infotainment (Harman, Apple CarPlay & Android Auto)',
          desc: 'Test 10.25"/12.3" display touch responsiveness, Bluetooth pairing, FM radio, and audio balance.',
          photo1Label: 'Photo 1: Infotainment System Home Screen',
          photo2Label: 'Photo 2: Audio & Connectivity Status',
          hasVideo: true,
          videoLabel: 'Video: Touchscreen Responsiveness & Sound Test (10s)'
        },
        {
          id: 'int-4',
          code: 'INT-04',
          title: 'Automatic Climate Control (HVAC Blower & Cooling Test)',
          desc: 'Test cooling at lowest temperature (16°C), blower fan speeds 1-7, and air recirculation flap.',
          photo1Label: 'Photo 1: AC Digital Touch Control Panel',
          photo2Label: 'Photo 2: Rear AC Vents & Controls',
          hasVideo: true,
          videoLabel: 'Video: AC Blower & Chilling Performance Video (10s)'
        },
        {
          id: 'int-5',
          code: 'INT-05',
          title: 'Voice-Assisted Panoramic Sunroof & Sunblind Mechanism',
          desc: 'Test one-touch open, tilt, slide, anti-pinch safety obstruction stop and sunblind retraction.',
          photo1Label: 'Photo 1: Sunroof Open / Tilt Position',
          photo2Label: 'Photo 2: Sunblind Fabric & Rail Tracks',
          hasVideo: true,
          videoLabel: 'Video: Sunroof Opening & Closing Operation Video (10s)'
        },
        {
          id: 'int-6',
          code: 'INT-06',
          title: 'Seats Upholstery, Ventilated Seats & Electronic Adjust',
          desc: 'Inspect Benecke-Kaliko leatherette upholstery, headrests, armrests, and 6-way power seat adjust.',
          photo1Label: 'Photo 1: Front Ventilated Seats',
          photo2Label: 'Photo 2: 2nd / 3rd Row Seats & Armrest'
        },
        {
          id: 'int-7',
          code: 'INT-07',
          title: 'Seatbelts (All 3-Point ELR & Pre-Tensioner Retract)',
          desc: 'Pull all 5/6/7 seatbelts firmly to verify inertial reel lock, smooth retraction, and buckle click.',
          photo1Label: 'Photo 1: Front Seatbelt Latches',
          photo2Label: 'Photo 2: Rear 3-Point Seatbelt Anchors'
        },
        {
          id: 'int-8',
          code: 'INT-08',
          title: 'Steering Controls, Tilt/Telescopic & Illuminated Logo',
          desc: 'Check 4-spoke illuminated steering logo, audio/cruise switches and steering lock lever.',
          photo1Label: 'Photo 1: Illuminated Tata Logo Steering',
          photo2Label: 'Photo 2: Column Tilt/Telescopic Lock'
        },
        {
          id: 'int-9',
          code: 'INT-09',
          title: 'Cabin Ambient Lighting, Vanity Mirrors & Cooled Glovebox',
          desc: 'Inspect multi-color mood lighting strips, vanity mirror lights and glovebox cooling duct.',
          photo1Label: 'Photo 1: Cabin Ambient Mood Lighting',
          photo2Label: 'Photo 2: Cooled Glovebox Compartment'
        },
        {
          id: 'int-10',
          code: 'INT-10',
          title: 'Floor Carpets, Toolkit, Jack & Warning Triangle',
          desc: 'Verify OEM floor mats, boot parcel tray, spare jack, wheel spanner, tow hook and emergency triangle.',
          photo1Label: 'Photo 1: Boot Floor & Parcel Shelf',
          photo2Label: 'Photo 2: Complete Emergency Toolkit & Jack'
        }
      ]
    },
    {
      id: 'cat-4',
      name: '4. Under-the-Hood & Fluids',
      icon: '⚙️',
      items: [
        {
          id: 'eng-1',
          code: 'ENG-01',
          title: 'Engine Oil Level & Dipstick Inspection',
          desc: 'Check oil level on dipstick between MIN and MAX. Oil should be clear amber with no burn smell.',
          photo1Label: 'Photo 1: Dipstick Oil Level Mark',
          photo2Label: 'Photo 2: Engine Oil Filler Cap Underside'
        },
        {
          id: 'eng-2',
          code: 'ENG-02',
          title: 'Engine Coolant Reservoir & Radiator Hoses',
          desc: 'Verify coolant level in expansion tank, cap seal tightness, and zero hose seepage.',
          photo1Label: 'Photo 1: Coolant Expansion Tank Level',
          photo2Label: 'Photo 2: Radiator Upper/Lower Hoses'
        },
        {
          id: 'eng-3',
          code: 'ENG-03',
          title: 'Brake & Clutch Fluid Master Cylinder Reservoir',
          desc: 'Check DOT4 brake fluid level at MAX mark with no moisture contamination or reservoir leak.',
          photo1Label: 'Photo 1: Brake Fluid Reservoir Level',
          photo2Label: 'Photo 2: Master Cylinder Line Fittings'
        },
        {
          id: 'eng-4',
          code: 'ENG-04',
          title: '12V Auxiliary Battery Health & Terminal Tightness',
          desc: 'Check battery terminal clamps, acid vent seal, and measure open-circuit voltage (> 12.6V).',
          photo1Label: 'Photo 1: Battery Terminals & Clamps',
          photo2Label: 'Photo 2: Battery Multimeter Voltage Display'
        },
        {
          id: 'eng-5',
          code: 'ENG-05',
          title: 'Engine Wire Harness, Relays & Fuse Box Cover',
          desc: 'Verify complete harness taping, no rodent nibbles, secure fuse box lid and connector locks.',
          photo1Label: 'Photo 1: Main Engine Bay Harness',
          photo2Label: 'Photo 2: Fuse Box & Relay Housing'
        },
        {
          id: 'eng-6',
          code: 'ENG-06',
          title: 'Windshield Washer Fluid Tank Full Check',
          desc: 'Ensure washer reservoir is filled with clean washer fluid and strainer is present.',
          photo1Label: 'Photo 1: Washer Fluid Reservoir Cap',
          photo2Label: 'Photo 2: Fluid Level Visible'
        },
        {
          id: 'eng-7',
          code: 'ENG-07',
          title: 'Engine Cold Start & Idling Sound (No Knock/Rattle)',
          desc: 'Crank engine on cold start. Verify instant start, steady 800-900 RPM idle without belt squeal.',
          photo1Label: 'Photo 1: Running Engine Compartment',
          photo2Label: 'Photo 2: Engine Bay Heat Shield',
          hasVideo: true,
          videoLabel: 'Video: Engine Cold Start & Smooth Idling Sound Video (10-15s)'
        },
        {
          id: 'eng-8',
          code: 'ENG-08',
          title: 'Exhaust Gas & Emissions Check (No Smoke at Rev)',
          desc: 'Inspect tailpipe exhaust at idle and 2500 RPM rev. Must have zero white, black or blue smoke.',
          photo1Label: 'Photo 1: Exhaust Tailpipe at Idle',
          photo2Label: 'Photo 2: Exhaust Silencer Mounting',
          hasVideo: true,
          videoLabel: 'Video: Exhaust Pipe Revving Smoke Test Video (5-10s)'
        }
      ]
    },
    {
      id: 'cat-5',
      name: '5. Under-Chassis, Suspension & Brakes',
      icon: '🔧',
      items: [
        {
          id: 'und-1',
          code: 'UND-01',
          title: 'Underbody Anti-Rust Coating & Crossmembers',
          desc: 'Inspect floor pan on lift for transit scraping, dented crossmembers, and uniform black anti-rust coating.',
          photo1Label: 'Photo 1: Front Subframe & Floor Pan',
          photo2Label: 'Photo 2: Rear Crossmember & Floor'
        },
        {
          id: 'und-2',
          code: 'UND-02',
          title: 'Front & Rear Suspension (Struts, Springs & Bushings)',
          desc: 'Check MacPherson struts, coil springs, rubber bump stops and anti-roll bar link bushings.',
          photo1Label: 'Photo 1: Front Left/Right Suspension Struts',
          photo2Label: 'Photo 2: Rear Suspension Twist Beam / Multi-Link'
        },
        {
          id: 'und-3',
          code: 'UND-03',
          title: 'Brake Discs, Calipers & Hydraulic Fluid Lines',
          desc: 'Inspect front ventilated brake discs for scoring, caliper pins grease seal, and rigid brake lines.',
          photo1Label: 'Photo 1: Front Brake Disc & Caliper',
          photo2Label: 'Photo 2: Rear Brake Disc / Drum Line'
        },
        {
          id: 'und-4',
          code: 'UND-04',
          title: 'Steering Rack, Tie Rod Ends & CV Axle Rubber Boots',
          desc: 'Verify rubber bellows on steering rack and drive axle CV joints have zero grease leakage or tears.',
          photo1Label: 'Photo 1: Left CV Axle Boot & Tie Rod',
          photo2Label: 'Photo 2: Right CV Axle Boot & Tie Rod'
        },
        {
          id: 'und-5',
          code: 'UND-05',
          title: 'Fuel Tank / High-Voltage Battery Protective Shielding',
          desc: 'Check fuel tank guard / EV underbody aluminum ballistic shield for impact marks.',
          photo1Label: 'Photo 1: Protective Shield Underside',
          photo2Label: 'Photo 2: Shield Mounting Bolts & Brackets'
        },
        {
          id: 'und-6',
          code: 'UND-06',
          title: 'Underbody Fluid Leakage Inspection',
          desc: 'Check engine sump plug, gearbox casing, steering rack and radiator bottom for fluid drops.',
          photo1Label: 'Photo 1: Engine Oil Sump & Drain Plug',
          photo2Label: 'Photo 2: Transmission Lower Housing',
          hasVideo: true,
          videoLabel: 'Video: Under-Chassis Full Sweep Video (10-15s)'
        }
      ]
    },
    {
      id: 'cat-6',
      name: '6. EV Battery & High Voltage (For EV Lineup)',
      icon: '⚡',
      items: [
        {
          id: 'ev-1',
          code: 'EV-01',
          title: 'High Voltage Battery State of Health (SoH) & State of Charge (SoC)',
          desc: 'Verify instrument cluster SoC is > 90% and run diagnostic OBD-II scan to confirm 100% battery SoH.',
          photo1Label: 'Photo 1: Cluster SoC % & Range Display',
          photo2Label: 'Photo 2: Diagnostic Scan SoH Report (100%)',
          isEV: true
        },
        {
          id: 'ev-2',
          code: 'EV-02',
          title: 'AC Slow Charging & Portable Charging Cable Lock',
          desc: 'Plug in 3.3kW / 7.2kW AC charging gun. Confirm motorized port lock, green LED and dash charging indicator.',
          photo1Label: 'Photo 1: AC Charger Gun Connected & Green LED',
          photo2Label: 'Photo 2: Portable Charging Box (15A Cable)',
          isEV: true
        },
        {
          id: 'ev-3',
          code: 'EV-03',
          title: 'DC Fast Charging Port (CCS2 Pins & Dust Seal Cap)',
          desc: 'Inspect 2 high-current DC pins, orange HV cables insulation, and rubber weather sealing cap.',
          photo1Label: 'Photo 1: CCS2 Fast Charging Port Pins',
          photo2Label: 'Photo 2: Weather Seal Cap & Latch',
          isEV: true
        },
        {
          id: 'ev-4',
          code: 'EV-04',
          title: 'Regen Braking Paddle Shifters & Drive Mode Selector',
          desc: 'Test Level 0, 1, 2, 3 paddle regen changes and Eco/City/Sport rotary dial engagement.',
          photo1Label: 'Photo 1: Rotary EV Drive Mode Dial',
          photo2Label: 'Photo 2: Regen Paddle Shifter Display',
          hasVideo: true,
          videoLabel: 'Video: Drive Mode Dial & Regen Paddle Switch Video (10s)',
          isEV: true
        }
      ]
    },
    {
      id: 'cat-7',
      name: '7. Road Test, Handover Kit & Final Sign-Off',
      icon: '📋',
      items: [
        {
          id: 'dyn-1',
          code: 'DYN-01',
          title: 'Transmission & Clutch Operation (Smooth Shift Engagement)',
          desc: 'Check manual 6-speed / DCA dual clutch / EV drive selector engagement without judder.',
          photo1Label: 'Photo 1: Gear Shift Lever in Neutral',
          photo2Label: 'Photo 2: Gear Indicator on Cluster Display',
          hasVideo: true,
          videoLabel: 'Video: Gear Shift Engagement & Transition Video (10s)'
        },
        {
          id: 'dyn-2',
          code: 'DYN-02',
          title: 'Braking Performance, Auto-Hold & Electronic Parking Brake',
          desc: 'Test progressive pedal bite, emergency stop straight-line tracking, and EPB hill-hold test.',
          photo1Label: 'Photo 1: Electronic Parking Brake Switch',
          photo2Label: 'Photo 2: Vehicle Stopped on Test Incline'
        },
        {
          id: 'dyn-3',
          code: 'DYN-03',
          title: 'Steering Wheel Alignment & Straight Line Tracking',
          desc: 'Verify vehicle tracks dead straight with steering centered on smooth asphalt without drift.',
          photo1Label: 'Photo 1: Centered Steering Wheel on Track',
          photo2Label: 'Photo 2: Front Wheels Straight Alignment'
        },
        {
          id: 'dyn-4',
          code: 'DYN-04',
          title: 'Cabin NVH Squeak & Rattle Road Test',
          desc: 'Drive on yard rumble strips to confirm zero dashboard squeaks, door rattles or suspension thuds.',
          photo1Label: 'Photo 1: Post-Test Drive Odometer',
          photo2Label: 'Photo 2: PDI Inspection Route Sheet'
        },
        {
          id: 'dyn-5',
          code: 'DYN-05',
          title: 'Documentation Kit (Owner Manual, Warranty, Fastag & Service Book)',
          desc: 'Ensure owner manual, warranty handbook, battery warranty card and Fastag RFID are inside glovebox.',
          photo1Label: 'Photo 1: Fastag Barcode on Windshield',
          photo2Label: 'Photo 2: Complete Manual & Warranty Docket'
        },
        {
          id: 'dyn-6',
          code: 'DYN-06',
          title: 'Vehicle Final Grooming, Washing & Delivery Ready Shine',
          desc: 'Confirm exterior wash, tyre dressing polish, cabin vacuuming and paper floor mats installed.',
          photo1Label: 'Photo 1: Finished Front 3/4 Customer Angle',
          photo2Label: 'Photo 2: Pristine Interior Cleanliness'
        }
      ]
    }
  ];

  // Inspection item state (status, photos, videos, notes)
  const [responses, setResponses] = useState<Record<string, {
    status: 'PASS' | 'FAIL' | 'NA';
    photo1?: string;
    photo2?: string;
    video?: string;
    notes?: string;
  }>>({
    'ext-1': { status: 'PASS', photo1: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400', photo2: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400' },
    'ext-2': { status: 'PASS', photo1: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400', photo2: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400' },
    'ext-3': { status: 'PASS', photo1: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400', photo2: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400' },
    'lgt-1': { status: 'PASS', photo1: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400', photo2: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400' }
  });

  const handleStatusChange = (itemId: string, status: 'PASS' | 'FAIL' | 'NA') => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], status }
    }));
  };

  const handleMediaUpload = (itemId: string, field: 'photo1' | 'photo2' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setResponses((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          status: prev[itemId]?.status || 'PASS',
          [field]: url
        }
      }));
    }
  };

  const handleRemoveMedia = (itemId: string, field: 'photo1' | 'photo2' | 'video') => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: undefined
      }
    }));
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], notes }
    }));
  };

  // Calculations
  const allItems = categories.flatMap(c => c.items);
  const totalCount = allItems.length;
  const answeredCount = Object.keys(responses).length;
  const passedCount = Object.values(responses).filter(r => r.status === 'PASS').length;
  const failedCount = Object.values(responses).filter(r => r.status === 'FAIL').length;
  const progressPct = Math.round((answeredCount / totalCount) * 100);

  // Active items based on filter
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
            All 54 inspection points verified with mandatory 2-angle photos and functional videos. Digital dossier has been submitted to <strong>QA Manager Review Queue</strong>.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Checked</span>
            <div className="text-lg font-black text-[#0F172A]">{answeredCount}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-600">Passed</span>
            <div className="text-lg font-black text-emerald-600">{passedCount}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-rose-600">Flagged</span>
            <div className="text-lg font-black text-rose-600">{failedCount}</div>
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
    <div className="space-y-6 pb-16">
      
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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Tata Motors OEM PDI Protocol
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
            <span className="text-xs font-bold text-slate-400 block">Overall Progress</span>
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

          {/* Quick Stats Widget */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Media Compliance</span>
              <span className="text-xs font-extrabold text-emerald-400">2 Photos + Video Required</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tata OEM standard requires minimum 2 high-resolution angle photos per step and video upload on mechanical/electrical components.
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
                <p className="text-xs text-slate-500">{categories[activeCategory].items.length} Checkpoints • Mandatory Dual Photo Evidence</p>
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
                  {/* Top Bar: Code, Title, and Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 bg-slate-100 text-[#0F172A] rounded-lg border border-slate-200">
                          {item.code}
                        </span>
                        {item.hasVideo && (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md flex items-center gap-1 border border-amber-200">
                            <Video className="w-3 h-3" />
                            Video Required
                          </span>
                        )}
                        {item.isEV && (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md border border-emerald-200">
                            EV Component
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-[#0F172A]">{item.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{item.desc}</p>
                    </div>

                    {/* PASS / FAIL / NA Buttons */}
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

                  {/* MANDATORY 2 PHOTOS + VIDEO CAPTURE SECTION */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#0F172A]" />
                        Mandatory Media Proofs (2 Photos {item.hasVideo ? '+ 1 Video' : ''})
                      </span>
                      {resp?.photo1 && resp?.photo2 && (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          Photos Uploaded
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      
                      {/* PHOTO 1 SLOT */}
                      <div className="border border-slate-200 bg-slate-50/70 rounded-2xl p-3 flex flex-col justify-between space-y-2 relative overflow-hidden group">
                        <span className="text-[10px] font-extrabold uppercase text-slate-600 truncate">
                          {item.photo1Label}
                        </span>

                        {resp?.photo1 ? (
                          <div className="relative rounded-xl overflow-hidden aspect-video bg-black/5 flex items-center justify-center">
                            <img src={resp.photo1} alt="Proof 1" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(item.id, 'photo1')}
                              className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-all cursor-pointer"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-300 hover:border-[#0F172A] rounded-xl aspect-video flex flex-col items-center justify-center text-slate-400 hover:text-[#0F172A] bg-white transition-all cursor-pointer">
                            <Camera className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-bold">Capture / Upload Photo 1</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleMediaUpload(item.id, 'photo1', e)} 
                            />
                          </label>
                        )}
                      </div>

                      {/* PHOTO 2 SLOT */}
                      <div className="border border-slate-200 bg-slate-50/70 rounded-2xl p-3 flex flex-col justify-between space-y-2 relative overflow-hidden group">
                        <span className="text-[10px] font-extrabold uppercase text-slate-600 truncate">
                          {item.photo2Label}
                        </span>

                        {resp?.photo2 ? (
                          <div className="relative rounded-xl overflow-hidden aspect-video bg-black/5 flex items-center justify-center">
                            <img src={resp.photo2} alt="Proof 2" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(item.id, 'photo2')}
                              className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-all cursor-pointer"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-300 hover:border-[#0F172A] rounded-xl aspect-video flex flex-col items-center justify-center text-slate-400 hover:text-[#0F172A] bg-white transition-all cursor-pointer">
                            <Camera className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-bold">Capture / Upload Photo 2</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleMediaUpload(item.id, 'photo2', e)} 
                            />
                          </label>
                        )}
                      </div>

                      {/* VIDEO SLOT (IF REQUIRED) */}
                      {item.hasVideo && (
                        <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-3 flex flex-col justify-between space-y-2 relative overflow-hidden group">
                          <span className="text-[10px] font-extrabold uppercase text-amber-900 truncate flex items-center gap-1">
                            <Video className="w-3 h-3 text-amber-600" />
                            {item.videoLabel || 'Functional Video Proof'}
                          </span>

                          {resp?.video ? (
                            <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                              <video src={resp.video} controls className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveMedia(item.id, 'video')}
                                className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-all cursor-pointer z-10"
                                title="Delete Video"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="border-2 border-dashed border-amber-300 hover:border-amber-600 rounded-xl aspect-video flex flex-col items-center justify-center text-amber-700 hover:text-amber-900 bg-white transition-all cursor-pointer">
                              <Video className="w-6 h-6 mb-1 text-amber-600 animate-pulse" />
                              <span className="text-[10px] font-bold">Record / Upload Video</span>
                              <span className="text-[9px] text-slate-400">MP4, WEBM (Max 30s)</span>
                              <input 
                                type="file" 
                                accept="video/*" 
                                className="hidden" 
                                onChange={(e) => handleMediaUpload(item.id, 'video', e)} 
                              />
                            </label>
                          )}
                        </div>
                      )}

                    </div>
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

          {/* Bottom Next/Prev Category Navigator */}
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

    </div>
  );
};
