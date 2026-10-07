import React, { useState } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  Building2,
  TrendingUp,
  Droplets,
  Utensils,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { DigitalTwinState, Hospital } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hospitals: Hospital[];
  onApplyMitigations: (mitigations: string[]) => void;
}

export const DisasterDigitalTwinModal: React.FC<Props> = ({
  isOpen,
  onClose,
  hospitals,
  onApplyMitigations,
}) => {
  const [rainfallIncrease, setRainfallIncrease] = useState<number>(30);
  const [roadInaccessibility, setRoadInaccessibility] = useState<number>(25);
  const [hospitalOutageId, setHospitalOutageId] = useState<string>('none');
  const [additionalPeopleMarooned, setAdditionalPeopleMarooned] = useState<number>(3500);

  if (!isOpen) return null;

  // Dynamic simulation calculations
  const projectedVictims = Math.round(
    12840 + additionalPeopleMarooned * 1.2 + rainfallIncrease * 45
  );
  const avgTransitSpike = Math.round(14 + roadInaccessibility * 0.45 + rainfallIncrease * 0.2);
  const waterDeficitLiters = Math.round(8900 + projectedVictims * 1.4);
  const foodPacketsNeeded = Math.round(projectedVictims * 1.8);

  const overloadedList = [
    'Osmania General Hospital (108% capacity - OVERFLOW)',
    ...(hospitalOutageId === 'hosp-01'
      ? ['Osmania Hospital Generator Fault (Evacuate ICU patients)']
      : []),
    ...(rainfallIncrease > 35 ? ["Nizam's Institute of Medical Sciences - NIMS (89% full)"] : []),
  ];

  const mitigations = [
    'Activate Gandhi Hospital Annex & LB Stadium field hospital (500 beds)',
    'Establish Green Corridor via PVNR Elevated Expressway for heavy SDRF trucks',
    'Mobilize Hyderabad Water Board (HMWSSB) 40,000L clean water tankers to Tolichowki',
    'Pre-stage 6 NDRF Inflatable Boats at Alwal & Amberpet high ground depots',
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono">
                  DISASTER DIGITAL TWIN & "WHAT IF?" SIMULATOR
                </h2>
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-400 font-mono text-[10px]">
                  STATE: LIVE SYNCHRONIZED TWIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Stress-test scenarios: model extreme rainfall surges, arterial bridge collapses, and hospital outages before they happen.
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

        {/* Simulator Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4" /> SCENARIO VARIABLE INJECTION
            </h3>

            {/* Slider 1: Rainfall */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300">Precipitation Spike (+%):</span>
                <span className="text-cyan-400 font-bold">+{rainfallIncrease}% mm/hr</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={rainfallIncrease}
                onChange={(e) => setRainfallIncrease(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Simulates Himayat Sagar & Osman Sagar weir outflow</span>
            </div>

            {/* Slider 2: Road Inaccessibility */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300">Arterial Roads Submerged:</span>
                <span className="text-red-400 font-bold">{roadInaccessibility}% Cut Off</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={roadInaccessibility}
                onChange={(e) => setRoadInaccessibility(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Blocks low-lying causeways and arterial underpasses</span>
            </div>

            {/* Slider 3: Marooned population */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300">Additional Marooned Citizens:</span>
                <span className="text-amber-400 font-bold">+{additionalPeopleMarooned.toLocaleString()} People</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={additionalPeopleMarooned}
                onChange={(e) => setAdditionalPeopleMarooned(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Flash flooding in Nadeem Colony & Tolichowki wards</span>
            </div>

            {/* Selector: Infrastructure outage */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-slate-300 block">Hospital / Power Grid Failure:</label>
              <select
                value={hospitalOutageId}
                onChange={(e) => setHospitalOutageId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 outline-none text-xs cursor-pointer"
              >
                <option value="none">None (Standard Grid & DG Backup)</option>
                <option value="hosp-01">Osmania General Hospital (Main Power + DG Failure)</option>
                <option value="substation-alwal">Alwal 132kV Power Substation Flooded</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setRainfallIncrease(50);
                  setRoadInaccessibility(40);
                  setHospitalOutageId('hosp-01');
                  setAdditionalPeopleMarooned(6000);
                }}
                className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 text-[11px] transition cursor-pointer"
              >
                LOAD EXTREME "SUPER-CYCLONE INUNDATION" PRESET
              </button>
            </div>
          </div>

          {/* Results Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> SIMULATED SYSTEM CONSEQUENCES
            </h3>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-red-900/60">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase">
                  <ShieldAlert className="w-3 h-3 text-red-400" /> Projected Victims
                </span>
                <div className="text-lg font-bold text-red-400 mt-1">
                  {projectedVictims.toLocaleString()}
                  <span className="text-[10px] text-slate-500 font-normal ml-1">(+{(projectedVictims - 12840).toLocaleString()})</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-amber-900/60">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase">
                  <Clock className="w-3 h-3 text-amber-400" /> Avg Ambulance Transit
                </span>
                <div className="text-lg font-bold text-amber-400 mt-1">
                  {avgTransitSpike} Mins
                  <span className="text-[10px] text-red-400 font-normal ml-1">(+{avgTransitSpike - 14}m delay)</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-cyan-900/60">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase">
                  <Droplets className="w-3 h-3 text-cyan-400" /> Clean Water Deficit
                </span>
                <div className="text-lg font-bold text-cyan-300 mt-1">
                  {waterDeficitLiters.toLocaleString()} L / Day
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-indigo-900/60">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase">
                  <Utensils className="w-3 h-3 text-indigo-400" /> Food Ration Demand
                </span>
                <div className="text-lg font-bold text-indigo-300 mt-1">
                  {foodPacketsNeeded.toLocaleString()} Meal Kits
                </div>
              </div>
            </div>

            {/* Overloaded Infrastructure Alert */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-bold block mb-1.5 flex items-center gap-1 text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-red-400" /> PREDICTED CRITICAL OVERLOADS:
              </span>
              <ul className="space-y-1 text-[11px] text-red-300">
                {overloadedList.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Automated Mitigation Plan */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-emerald-500/40">
              <span className="text-emerald-400 font-bold block mb-1.5 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> AI PREVENTATIVE MITIGATION ACTION PLAN:
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-200">
                {mitigations.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">[{idx + 1}]</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  onApplyMitigations(mitigations);
                  onClose();
                }}
                className="w-full mt-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                APPROVE & DEPLOY MITIGATION PLAN TO REAL-TIME SYSTEM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
