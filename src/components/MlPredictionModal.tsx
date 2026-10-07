import React, { useState } from 'react';
import {
  BrainCircuit,
  BarChart3,
  Percent,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  FEATURE_IMPORTANCES,
  predictZoneRisks,
  ZoneRiskPrediction,
} from '../services/randomForestPredictor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MlPredictionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [rainfallMultiplier, setRainfallMultiplier] = useState<number>(1.0);

  if (!isOpen) return null;

  const predictions = predictZoneRisks(rainfallMultiplier);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono">
                  RANDOM FOREST DISASTER RISK PREDICTION ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500 text-indigo-300 font-mono text-[10px]">
                  ENSEMBLE: 100 TREES | GINI IMPURITY | R²: 0.941
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Supervised classification & regression trained on Hyderabad Monsoon & Godavari/Krishna basin historical hydrology.
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Row: Feature Importance Weights + Radar Sim Slider */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Feature Importance Bar Graph (7 cols) */}
            <div className="md:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase">
                  <BarChart3 className="w-4 h-4" /> Feature Importance Breakdown (Gini Score)
                </span>
                <span className="text-[10px] text-slate-500">Total: 100% Normalized</span>
              </div>

              <div className="space-y-2.5">
                {FEATURE_IMPORTANCES.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300">{item.feature}</span>
                      <span className="text-amber-400 font-bold">{item.weightPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full"
                        style={{ width: `${item.weightPct * 2.8}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Model Ingestion Parameters (5 cols) */}
            <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-4">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase border-b border-slate-800 pb-2 block">
                <Sliders className="w-4 h-4" /> Doppler Radar Precipitation Modifier
              </span>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Monsoon Intensity:</span>
                  <span className="text-amber-400 font-bold">
                    {Math.round(rainfallMultiplier * 100)}% ({rainfallMultiplier.toFixed(1)}x)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.8"
                  step="0.1"
                  value={rainfallMultiplier}
                  onChange={(e) => setRainfallMultiplier(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tree Depth:</span>
                  <span className="text-slate-200">12 (Pruned for Real-time)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Inference Latency:</span>
                  <span className="text-emerald-400 font-bold">42 ms (SOA API)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cross-Validation:</span>
                  <span className="text-slate-200">5-Fold Stratified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model F1-Score:</span>
                  <span className="text-cyan-300 font-bold">0.938</span>
                </div>
              </div>
            </div>
          </div>

          {/* Zone-by-Zone Multi-output Prediction Table */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
            <h3 className="font-bold text-slate-200 mb-3 uppercase tracking-wider">
              ZONE-BY-ZONE RANDOM FOREST OUTPUT MATRIX
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2 px-3">Disaster Sector</th>
                    <th className="py-2 px-3">Flood Risk</th>
                    <th className="py-2 px-3">Road Access</th>
                    <th className="py-2 px-3">Hospital Overload</th>
                    <th className="py-2 px-3">Water Surge</th>
                    <th className="py-2 px-3">Confidence</th>
                    <th className="py-2 px-3">Key Risk Driver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-[11px]">
                  {predictions.map((p) => (
                    <tr key={p.zoneId} className="hover:bg-slate-900/40 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-200">{p.zoneName}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          p.floodRiskPct > 85 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-300'
                        }`}>
                          {p.floodRiskPct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={p.roadAccessibilityPct < 30 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                          {p.roadAccessibilityPct}% Accessible
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={p.hospitalOverloadRiskPct > 80 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {p.hospitalOverloadRiskPct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300 font-semibold">+{p.waterDemandSurgePct}%</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">{p.confidencePct}%</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[10px] max-w-xs truncate">
                        {p.primaryRiskDrivers[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
