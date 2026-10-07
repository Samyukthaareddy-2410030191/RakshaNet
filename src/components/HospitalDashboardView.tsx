import React, { useState } from 'react';
import {
  Building2,
  HeartPulse,
  Activity,
  Ambulance as AmbIcon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Share2,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Plus,
  Droplet,
  Zap,
} from 'lucide-react';
import { Hospital, Ambulance, SosRequest, AuthUser } from '../types';

interface Props {
  currentUser: AuthUser;
  hospitals: Hospital[];
  ambulances: Ambulance[];
  sosRequests: SosRequest[];
  onTriggerDiversion: (hospitalId: string) => void;
  onUpdateBeds: (hospitalId: string, occupied: number) => void;
}

export const HospitalDashboardView: React.FC<Props> = ({
  currentUser,
  hospitals,
  ambulances,
  sosRequests,
  onTriggerDiversion,
  onUpdateBeds,
}) => {
  // Current hospital: Osmania by default or Gandhi
  const [selectedHospitalId, setSelectedHospitalId] = useState('hosp-01');
  const [isDiverted, setIsDiverted] = useState(false);
  const [bloodUnits, setBloodUnits] = useState(14);
  const [oxygenHours, setOxygenHours] = useState(28);

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];
  const occupancyPct = Math.round((currentHospital.occupiedBeds / currentHospital.totalBeds) * 100);
  const isCriticalOverload = occupancyPct >= 90;

  // Filter incoming ambulances assigned to this hospital
  const incomingAmbulances = ambulances.filter(
    (a) => a.assignedHospitalId === currentHospital.id || a.status === 'DISPATCHED'
  );

  const handleRequestDiversion = () => {
    setIsDiverted(true);
    onTriggerDiversion(currentHospital.id);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Hospital Header & Quick Hospital Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                {currentHospital.name}
              </h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  isCriticalOverload
                    ? 'bg-red-950 border-red-500 text-red-400 animate-pulse'
                    : 'bg-emerald-950 border-emerald-500 text-emerald-300'
                }`}
              >
                {isCriticalOverload ? 'CRITICAL SATURATION' : 'TRAUMA OPERATIONAL'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Superintendent: <span className="text-slate-200 font-semibold">{currentUser.name}</span> • Level{' '}
              {currentHospital.traumaLevel} Trauma Center • {currentHospital.address}
            </p>
          </div>
        </div>

        {/* Hospital Switcher dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">FACILITY:</span>
          <select
            value={selectedHospitalId}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-amber-300 rounded-lg px-3 py-1.5 text-xs font-mono outline-none cursor-pointer"
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({Math.round((h.occupiedBeds / h.totalBeds) * 100)}% Saturation)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Critical Overload Warning & Diversion Banner */}
      {isCriticalOverload && (
        <div className="bg-red-950/70 border border-red-500/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-900/60 border border-red-500 flex items-center justify-center text-red-300 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="font-bold text-red-200 text-sm flex items-center gap-2">
                <span>TRAUMA SURGE PROTOCOL ACTIVE: {occupancyPct}% BEDS OCCUPIED</span>
              </div>
              <p className="text-xs text-red-300/80 mt-0.5">
                ER and Trauma ICU are past safe capacity. Incoming casualties risk severe admission delay.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestDiversion}
            className={`px-4 py-2 rounded-lg font-bold text-xs font-mono flex items-center gap-2 shadow-lg transition cursor-pointer ${
              isDiverted
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
            }`}
          >
            {isDiverted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>DIVERSION PROTOCOL ENFORCED (DIVERTING TO GANDHI)</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>REQUEST AUTOMATED AMBULANCE DIVERSION (OR-TOOLS)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Occupancy */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Bed Saturation</span>
            <span className={occupancyPct > 85 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              {occupancyPct}%
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">
            {currentHospital.occupiedBeds} <span className="text-xs text-slate-400 font-normal">/ {currentHospital.totalBeds} Beds</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${occupancyPct > 85 ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
        </div>

        {/* ICU Trauma Beds */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Trauma ICU Beds</span>
            <span className="text-amber-400 font-bold">
              {currentHospital.icuBedsAvailable} FREE
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">
            {currentHospital.icuBedsAvailable}{' '}
            <span className="text-xs text-slate-400 font-normal">/ {currentHospital.icuBedsTotal} Units</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {currentHospital.icuBedsAvailable === 0 ? 'CRITICAL - 0 ICU AVAILABLE' : 'Trauma bay operational'}
          </div>
        </div>

        {/* Oxygen Supply */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>Liquid Oxygen Reserve</span>
            <span className="text-cyan-400 font-bold">{oxygenHours} hrs</span>
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
            {oxygenHours}h <span className="text-xs text-slate-400 font-normal">Buffer Remaining</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Backup manifold: 45 cylinders ready
          </div>
        </div>

        {/* Emergency Blood Reserves */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
            <span>O-Neg Blood Reserves</span>
            <span className="text-red-400 font-bold">{bloodUnits} Units</span>
          </div>
          <div className="text-xl font-bold font-mono text-red-300 mt-1">
            {bloodUnits} <span className="text-xs text-slate-400 font-normal">Universal Donor Packs</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Direct drone courier on standby
          </div>
        </div>
      </div>

      {/* Main Grid: Incoming Ambulances Triage List & Triage Rapid Admission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Live Incoming Ambulances */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <AmbIcon className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-100 text-sm">
                LIVE INCOMING AMBULANCE CASUALTY FLOW
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              UPDATED VIA 108 GPS TELEMETRY
            </span>
          </div>

          <div className="space-y-3">
            {incomingAmbulances.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No active ambulances en route to this facility at present.
              </div>
            ) : (
              incomingAmbulances.map((amb) => (
                <div
                  key={amb.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-amber-300 font-bold font-mono">
                      <AmbIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs">
                          {amb.callSign}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-500 text-cyan-300">
                          {amb.type}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950 border border-amber-500 text-amber-300 font-bold">
                          {amb.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Crew: <span className="text-slate-300">{amb.crewName}</span> • Fuel: {amb.fuelPct}%
                      </div>
                      <div className="text-[10px] text-red-400 font-mono mt-0.5 flex items-center gap-1">
                        <HeartPulse className="w-3 h-3" />
                        <span>Casualty: Severe drowning & hypothermia from Nadeem Colony</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Estimated ETA</div>
                      <div className="text-base font-bold font-mono text-amber-400 flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{amb.currentEtaMinutes || 12} mins</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Ambulance ${amb.callSign} trauma bay reservation confirmed. Team alerted.`)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition cursor-pointer"
                    >
                      Prepare Trauma Bay
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Rapid Bed Control & Resource Rebalancing */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h4 className="font-bold text-slate-100 text-xs border-b border-slate-800 pb-2 mb-3">
              RAPID BED ADJUSTMENT CONSOLE
            </h4>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Total Occupancy</span>
                <span className="font-bold text-amber-400">{currentHospital.occupiedBeds} Beds</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateBeds(currentHospital.id, Math.max(0, currentHospital.occupiedBeds - 10))}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition cursor-pointer"
                >
                  -10 Discharge
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateBeds(currentHospital.id, Math.min(currentHospital.totalBeds, currentHospital.occupiedBeds + 10))}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition cursor-pointer"
                >
                  +10 Admitted
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Updating bed numbers automatically recalibrates the Google OR-Tools routing penalty matrix across Greater Hyderabad.
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h4 className="font-bold text-slate-100 text-xs border-b border-slate-800 pb-2 mb-3">
              INTER-HOSPITAL CAPACITY MATRIX
            </h4>

            <div className="space-y-2 text-xs font-mono">
              {hospitals.map((h) => {
                const pct = Math.round((h.occupiedBeds / h.totalBeds) * 100);
                return (
                  <div key={h.id} className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">{h.name}</span>
                      <span className={pct > 85 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {pct}% ({h.totalBeds - h.occupiedBeds} free)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pct > 85 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
