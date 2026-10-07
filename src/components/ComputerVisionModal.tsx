import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Users,
  Car,
  Layers,
  Send,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDispatchFromCv: (detectionSummary: string, victimCount: number) => void;
}

interface CvPreset {
  id: string;
  title: string;
  source: string;
  location: string;
  svgSceneType: 'ROOFTOP_FLOOD' | 'SUBMERGED_ROAD' | 'COLLAPSED_STRUCTURE';
  detections: {
    label: string;
    count: number;
    color: string;
    confidence: number;
  }[];
  overallConfidence: number;
  tacticalNote: string;
}

const PRESETS: CvPreset[] = [
  {
    id: 'drone-hyd-01',
    title: 'NDRF Drone Recon: Nadeem Colony Terrace Clusters',
    source: 'DJI Matrice 300 RTK Thermal/Visual (4K)',
    location: 'Plot 42-48, Nadeem Colony, Tolichowki',
    svgSceneType: 'ROOFTOP_FLOOD',
    detections: [
      { label: 'Stranded Rooftop Victims', count: 8, color: '#ef4444', confidence: 94.2 },
      { label: 'Submerged Civilian Vehicles', count: 5, color: '#3b82f6', confidence: 91.5 },
      { label: 'Flooded Inundation Zone', count: 1, color: '#06b6d4', confidence: 97.8 },
      { label: 'Children / Elderly Identified', count: 3, color: '#f59e0b', confidence: 88.6 },
    ],
    overallConfidence: 93.4,
    tacticalNote: '8 individuals signaling with white cloth on 2nd-floor terrace. Water level 7.2 ft at street level.',
  },
  {
    id: 'drone-hyd-02',
    title: 'Cyberabad Police CCTV: Chaderghat Causeway Embankment',
    source: 'Axis Q6215-E PTZ Fixed Traffic Camera #14',
    location: 'Moosi Embankment, Chaderghat Bridge Approach',
    svgSceneType: 'SUBMERGED_ROAD',
    detections: [
      { label: 'Stalled Vehicles in Current', count: 3, color: '#ef4444', confidence: 95.1 },
      { label: 'Trapped Passengers', count: 4, color: '#f59e0b', confidence: 89.4 },
      { label: 'Water Depth Velocity Breach', count: 1, color: '#06b6d4', confidence: 98.2 },
    ],
    overallConfidence: 94.2,
    tacticalNote: 'Auto-rickshaw and hatchback immobilized by fast-moving water current. Immediate winch cable rescue required.',
  },
];

export const ComputerVisionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onDispatchFromCv,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<CvPreset>(PRESETS[0]);
  const [analyzing, setAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleRunAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono">
                  COMPUTER VISION RECONNAISSANCE ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-400 font-mono text-[10px]">
                  YOLOv11-RESCUE + OPENCV GEOMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated victim counting, submerged road identification, and structural damage bounding boxes from drone & CCTV streams.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-sm font-mono px-2 py-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Visual Recon Feed Canvas (7 cols) */}
          <div className="lg:col-span-7 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" /> FEED: {selectedPreset.title}
              </span>
              <span className="text-emerald-400 font-bold">
                CONFIDENCE: {selectedPreset.overallConfidence}%
              </span>
            </div>

            {/* Drone Recon Vector Screen with Bounding Boxes */}
            <div className="relative w-full h-80 bg-slate-950 border-2 border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
              {/* Synthetic Drone Visual Graphic */}
              <svg className="w-full h-full" viewBox="0 0 600 360">
                {/* Background water inundation representation */}
                <rect width="600" height="360" fill="#0f172a" />
                <path d="M 0,140 Q 200,180 400,150 T 600,160 L 600,360 L 0,360 Z" fill="#0369a1" opacity="0.6" />
                <path d="M 0,220 Q 150,240 350,210 T 600,230 L 600,360 L 0,360 Z" fill="#0284c7" opacity="0.4" />

                {/* Rooftops / Urban structures */}
                <rect x="80" y="80" width="180" height="120" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <rect x="320" y="100" width="220" height="130" fill="#1e293b" stroke="#475569" strokeWidth="2" />

                {/* Submerged car outlines */}
                <rect x="140" y="240" width="70" height="35" rx="5" fill="#334155" opacity="0.8" />
                <rect x="420" y="250" width="80" height="40" rx="5" fill="#334155" opacity="0.8" />

                {/* CV Bounding Boxes with Labels & Confidences */}
                {/* Bounding Box 1: People cluster on rooftop */}
                <g>
                  <rect x="110" y="95" width="120" height="65" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,1" />
                  <rect x="110" y="78" width="120" height="17" fill="#ef4444" opacity="0.9" />
                  <text x="115" y="90" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    VICTIMS [8] (94.2%)
                  </text>
                </g>

                {/* Bounding Box 2: Elderly / Children */}
                <g>
                  <rect x="130" y="105" width="45" height="45" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                  <rect x="130" y="152" width="60" height="14" fill="#f59e0b" opacity="0.85" />
                  <text x="133" y="162" fill="#000000" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    INFANT (88%)
                  </text>
                </g>

                {/* Bounding Box 3: Submerged Vehicles */}
                <g>
                  <rect x="130" y="235" width="90" height="50" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="2,2" />
                  <rect x="130" y="222" width="95" height="13" fill="#3b82f6" opacity="0.9" />
                  <text x="133" y="232" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    SUBMERGED SEDAN
                  </text>
                </g>

                {/* Drone Telemetry Overlay Crosshair */}
                <circle cx="300" cy="180" r="30" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="4,2" />
                <line x1="300" y1="140" x2="300" y2="220" stroke="#38bdf8" strokeWidth="0.8" />
                <line x1="260" y1="180" x2="340" y2="180" stroke="#38bdf8" strokeWidth="0.8" />
                <text x="20" y="30" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                  LAT: 17.3985° N | LON: 78.4065° E | ALT: 45m AGL
                </text>
                <text x="470" y="30" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  ● REC 00:14:22
                </text>
              </svg>

              {/* HUD scanline animation */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            </div>

            {/* Tactical Notes */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              <span className="text-cyan-400 font-bold block mb-1">ANALYSIS SITREP:</span>
              {selectedPreset.tacticalNote}
            </div>
          </div>

          {/* Detections Breakdown & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 uppercase">FEED PRESETS & SOURCES</span>
              <button
                onClick={handleRunAnalysis}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> RE-ANALYZE
              </button>
            </div>

            {/* Preset Selector */}
            <div className="space-y-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPreset(p)}
                  className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer ${
                    selectedPreset.id === p.id
                      ? 'bg-slate-950 border-cyan-500 text-slate-100 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-slate-200 text-[11px]">{p.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.source}</div>
                </button>
              ))}
            </div>

            {/* Bounding Box Telemetry Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <span className="font-bold text-slate-300 block uppercase text-[11px]">
                OBJECT DETECTION INVENTORY
              </span>

              <div className="space-y-2">
                {selectedPreset.detections.map((det, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/80 p-2 rounded border border-slate-850">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: det.color }} />
                      <span className="text-slate-200 font-semibold text-[11px]">{det.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-100 font-bold font-mono">x{det.count}</span>
                      <span className="text-[10px] text-emerald-400">({det.confidence}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto Dispatch Trigger */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onDispatchFromCv(selectedPreset.title, 8);
                  onClose();
                }}
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                CREATE VERIFIED SOS & DISPATCH RESCUE BOAT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
