import React from 'react';
import {
  AlertTriangle,
  Users,
  Activity,
  Ambulance as AmbIcon,
  Building2,
  ShieldCheck,
  RefreshCw,
  GitBranch,
} from 'lucide-react';
import { DisasterZone, Hospital, Ambulance, SosRequest } from '../types';

interface Props {
  zones: DisasterZone[];
  hospitals: Hospital[];
  ambulances: Ambulance[];
  sosRequests: SosRequest[];
  isEdgeMode: boolean;
  onOpenOptimizer: () => void;
  onOpenDigitalTwin: () => void;
}

export const AiSituationAssessment: React.FC<Props> = ({
  zones,
  hospitals,
  ambulances,
  sosRequests,
  isEdgeMode,
  onOpenOptimizer,
  onOpenDigitalTwin,
}) => {
  const totalVictims = sosRequests.reduce((acc, s) => acc + s.victimCount, 0);
  const p1Count = sosRequests.filter((s) => s.priority === 'P1').length;
  const availableAmbs = ambulances.filter((a) => a.status === 'AVAILABLE').length;

  const totalBeds = hospitals.reduce((acc, h) => acc + h.totalBeds, 0);
  const occupiedBeds = hospitals.reduce((acc, h) => acc + h.occupiedBeds, 0);
  const hospitalCapacityPct = Math.round((occupiedBeds / totalBeds) * 100);

  const osmaniaHosp = hospitals.find((h) => h.id === 'hosp-01');
  const osmaniaOverloadPct = osmaniaHosp
    ? Math.round((osmaniaHosp.occupiedBeds / osmaniaHosp.totalBeds) * 100)
    : 92;

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 backdrop-blur-md">
      {/* Upper row: Continuous Loop & High Level Alert */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/70 border border-red-600/60 text-red-400 font-mono font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            AI SITUATION LEVEL: CRITICAL (INUNDATION RED ALERT)
          </div>
          <span className="text-slate-400 font-mono hidden md:inline">
            ZONE: GREATER HYDERABAD MUNICIPAL (MOOSI BASIN)
          </span>
        </div>

        {/* Adaptive Control Loop Banner */}
        <div className="hidden lg:flex items-center gap-1 font-mono text-[11px] text-slate-400 bg-slate-950/70 px-3 py-1 rounded border border-slate-800">
          <span className="text-amber-400 font-bold">ADAPTIVE LOOP:</span>
          <span className="text-emerald-400">PERCEIVE</span>
          <span>→</span>
          <span className="text-cyan-400">VALIDATE</span>
          <span>→</span>
          <span className="text-indigo-400">PREDICT</span>
          <span>→</span>
          <span className="text-amber-300 font-bold">OPTIMIZE</span>
          <span>→</span>
          <span className="text-violet-400">DEPLOY</span>
          <span>→</span>
          <span className="text-pink-400 font-bold">REALLOCATE</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenOptimizer}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold font-mono text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            DYNAMIC OPTIMIZER (OR-TOOLS)
          </button>
          <button
            type="button"
            onClick={onOpenDigitalTwin}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs transition cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" />
            DIGITAL TWIN
          </button>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-2.5">
        <div className="bg-slate-950/80 border border-slate-800 rounded p-2 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3 text-red-400" /> Affected Pop
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-slate-100 font-mono">12,840</span>
            <span className="text-[10px] text-red-400 font-mono">+18% / hr</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded p-2 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> P1 High Urgency
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-amber-400 font-mono">{p1Count}</span>
            <span className="text-[10px] text-slate-400 font-mono">/ {sosRequests.length} SOS</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded p-2 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
            <AmbIcon className="w-3 h-3 text-emerald-400" /> Ambulances
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-emerald-400 font-mono">{availableAmbs}</span>
            <span className="text-[10px] text-slate-400 font-mono">/ {ambulances.length} Active</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded p-2 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3 text-cyan-400" /> Hospital Cap.
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-cyan-300 font-mono">{hospitalCapacityPct}%</span>
            <span className="text-[10px] text-red-400 font-mono font-semibold">Osmania: {osmaniaOverloadPct}%</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded p-2 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> Submerged Roads
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-rose-400 font-mono">2 Arteries</span>
            <span className="text-[10px] text-slate-400 font-mono">PVNR Open</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded p-2 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-violet-400" /> Responders
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-violet-300 font-mono">72 Active</span>
            <span className="text-[10px] text-slate-400 font-mono">NDRF + Vol</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded p-2 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> AI Confidence
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-emerald-400 font-mono">93.4%</span>
            <span className="text-[10px] text-emerald-500 font-mono">RandomForest</span>
          </div>
        </div>
      </div>
    </div>
  );
};
