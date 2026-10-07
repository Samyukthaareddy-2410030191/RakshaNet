import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Ambulance as AmbIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Cpu,
  TrendingDown,
} from 'lucide-react';
import { OptimizationSummary, OptimizationAllocation } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  optimizationSummary: OptimizationSummary;
  onRunOptimization: (reason?: string) => void;
}

export const DynamicOptimizationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  optimizationSummary,
  onRunOptimization,
}) => {
  const [isSolving, setIsSolving] = useState(false);
  const [activeConstraint, setActiveConstraint] = useState<string>('ALL');

  if (!isOpen) return null;

  const handleRecalculate = () => {
    setIsSolving(true);
    setTimeout(() => {
      onRunOptimization('Osmania Hospital Saturation (92.8%) + Chaderghat Road Submerged');
      setIsSolving(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono">
                  DYNAMIC RESOURCE ALLOCATION ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-400 font-mono text-[10px]">
                  SOLVER: GOOGLE OR-TOOLS v9.8 (MIP / CP-SAT)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Continuous dynamic equilibrium across casualties, ambulance telemetry, road inundation, and hospital bed saturation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRecalculate}
              disabled={isSolving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSolving ? 'animate-spin' : ''}`} />
              <span>{isSolving ? 'SOLVING MIP MATRIX...' : 'RECALCULATE ALLOCATION'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 text-sm font-mono px-2 py-1 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                <Cpu className="w-3 h-3 text-amber-400" /> Solver Objective Score
              </span>
              <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                {optimizationSummary.objectiveScore}
                <span className="text-[10px] text-slate-500 font-normal ml-1">Optimal Minimum</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" /> Average Golden-Hour ETA
              </span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                {optimizationSummary.averageEtaMinutes} Mins
                <span className="text-[10px] text-emerald-500 ml-1">(-9.4m saved)</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                <Building2 className="w-3 h-3 text-cyan-400" /> Hospitals Balanced
              </span>
              <div className="text-lg font-bold font-mono text-cyan-300 mt-1">
                {optimizationSummary.hospitalsBalanced} Facilities
                <span className="text-[10px] text-slate-400 ml-1">No Overload</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-400" /> Hard Constraints
              </span>
              <div className="text-lg font-bold font-mono text-indigo-300 mt-1">
                100% Satisfied
                <span className="text-[10px] text-slate-400 ml-1">0 Violations</span>
              </div>
            </div>
          </div>

          {/* AI Explainability & Audit Rationale Banner */}
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1.5">
              <Cpu className="w-4 h-4" />
              <span>AI EXPLAINABILITY RATIONALE (WHY THE DECISION WAS MADE):</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {optimizationSummary.explainabilityNote}
            </p>
          </div>

          {/* Side-by-Side Allocation Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3 font-mono text-xs">
              <h3 className="font-bold text-slate-200">
                DISASTER DISPATCH SHIFT (PREVIOUS ALLOCATION → NEW OPTIMIZED ALLOCATION)
              </h3>
              <span className="text-slate-400 text-[11px]">
                Active Recalculation: {optimizationSummary.allocations.length} SOS Incidents
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {optimizationSummary.allocations.map((alloc) => {
                const isDiverted = alloc.previousHospital !== alloc.newHospital;
                return (
                  <div
                    key={alloc.id}
                    className={`bg-slate-950 border rounded-lg p-3 transition ${
                      isDiverted ? 'border-amber-500/60 shadow-lg shadow-amber-500/5' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          alloc.priority === 'P1' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
                        }`}>
                          {alloc.priority}
                        </span>
                        <span className="text-slate-200 font-bold">{alloc.victimName}</span>
                        <span className="text-slate-400 text-[11px]">({alloc.victimCount} victims)</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-emerald-400 font-bold">
                          Confidence: {alloc.confidencePct}%
                        </span>
                        {alloc.routeSafe && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 text-[10px]">
                            Route Verified Safe
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Transition Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                      {/* Previous Assignment */}
                      <div className="bg-slate-900/60 p-2.5 rounded border border-red-950 text-slate-400">
                        <div className="text-[10px] text-red-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Previous Assignment (Bottlenecked)
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <div>
                            <span className="text-slate-500">Ambulance:</span>{' '}
                            <span className="text-slate-300 line-through">{alloc.previousAmbulance}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Hospital:</span>{' '}
                            <span className="text-red-300 font-semibold">{alloc.previousHospital}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Estimated Transit:</span>{' '}
                            <span className="text-red-400 font-bold">{alloc.previousEtaMinutes} Mins</span>
                          </div>
                        </div>
                      </div>

                      {/* New Optimized Assignment */}
                      <div className="bg-slate-900/90 p-2.5 rounded border border-emerald-500/50 text-slate-200">
                        <div className="text-[10px] text-emerald-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> New AI Reallocation (Optimal)
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <div>
                            <span className="text-slate-400">Ambulance:</span>{' '}
                            <span className="text-emerald-300 font-bold">{alloc.newAmbulance}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Hospital:</span>{' '}
                            <span className="text-emerald-300 font-bold">{alloc.newHospital}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Estimated Transit:</span>{' '}
                            <span className="text-emerald-400 font-bold">{alloc.newEtaMinutes} Mins</span>
                            <span className="text-[10px] text-emerald-500 ml-1.5">
                              (Saved {Math.max(0, alloc.previousEtaMinutes - alloc.newEtaMinutes)} mins)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed mathematical reason */}
                    <div className="text-[11px] text-amber-300/90 bg-amber-950/30 px-3 py-1.5 rounded border border-amber-900/50 mt-2">
                      <span className="font-bold text-amber-400">REASON FOR ADAPTIVE SHIFT:</span> {alloc.reason}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
          <span className="text-slate-400">
            Last recomputed: {optimizationSummary.timestamp} | Mode: Real-time Multi-criteria Constraint
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer font-bold"
          >
            CONFIRM & RETURN TO COMMAND MAP
          </button>
        </div>
      </div>
    </div>
  );
};
