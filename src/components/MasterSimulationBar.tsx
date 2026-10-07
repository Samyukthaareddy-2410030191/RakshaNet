import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
} from 'lucide-react';

interface Props {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onReset: () => void;
  onJumpToStep: (step: number) => void;
}

const STEP_LABELS = [
  '1. Rainfall Surge & Flood Inundation',
  '2. Critical Citizen Voice SOS Ingestion',
  '3. Initial OR-Tools Dispatch Allocation',
  '4. Road Submergence & Hospital Overload Alert',
  '5. Continuous AI Reallocation (Gandhi Diversion)',
  '6. Volunteer Geolocation Fraud Quarantine',
  '7. Drone Computer Vision Recon & Detection',
  '8. Telecom Blackout & Edge SQLite Sync',
  '9. Disaster Digital Twin "What If?" Scenario',
  '10. Cryptographic Audit Ledger Verification',
];

export const MasterSimulationBar: React.FC<Props> = ({
  currentStep,
  totalSteps,
  isPlaying,
  onTogglePlay,
  onNextStep,
  onReset,
  onJumpToStep,
}) => {
  return (
    <div className="bg-slate-950/95 border-t border-slate-800 px-4 py-2 text-slate-100 font-mono text-xs flex flex-wrap items-center justify-between gap-3 shadow-2xl z-30">
      {/* Left: Simulation Title & Step Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/70 border border-red-500/50 text-red-400 font-bold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span>HYDERABAD FLOOD SIMULATION</span>
        </div>

        <div className="text-[11px] text-slate-300">
          <span className="text-amber-400 font-bold">STEP {currentStep} / {totalSteps}:</span>{' '}
          <span className="font-semibold">{STEP_LABELS[currentStep - 1]}</span>
        </div>
      </div>

      {/* Center: Quick Step Jumpers */}
      <div className="hidden lg:flex items-center gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <button
              key={stepNum}
              type="button"
              onClick={() => onJumpToStep(stepNum)}
              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition cursor-pointer ${
                isCurrent
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : isDone
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                  : 'bg-slate-900 text-slate-500 hover:text-slate-300'
              }`}
              title={STEP_LABELS[i]}
            >
              {stepNum}
            </button>
          );
        })}
      </div>

      {/* Right: Simulation Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'PAUSE AUTO' : 'AUTO-PLAY DEMO'}</span>
        </button>

        <button
          type="button"
          onClick={onNextStep}
          disabled={currentStep >= totalSteps}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer disabled:opacity-50"
        >
          <span>NEXT STEP</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onReset}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
          title="Reset Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
