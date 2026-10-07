import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  MapPin,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import { Volunteer } from '../types';
import { evaluateVolunteerFraud } from '../services/trustEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  volunteers: Volunteer[];
  onApproveVolunteer: (id: string) => void;
  onQuarantineVolunteer: (id: string) => void;
}

export const VolunteerTrustModal: React.FC<Props> = ({
  isOpen,
  onClose,
  volunteers,
  onApproveVolunteer,
  onQuarantineVolunteer,
}) => {
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer>(volunteers[0]);
  const [registrationTab, setRegistrationTab] = useState<'LIST' | 'PIPELINE'>('LIST');

  if (!isOpen) return null;

  const fraudEvaluation = evaluateVolunteerFraud(selectedVolunteer);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono">
                  VOLUNTEER TRUST & FRAUD ANOMALY ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-400 font-mono text-[10px]">
                  IDENTITY + GEOLOCATION KINEMATICS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-stage volunteer vetting, GPS teleportation spoof detection, and rumor mitigation.
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
          {/* Volunteer Verification Pipeline Stepper Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 uppercase">
                6-STAGE VOLUNTEER AUTHENTICATION PIPELINE
              </span>
              <span className="text-[10px] text-slate-500">Government Disaster Protocol (NDRF Vetting)</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-[10px]">
              <div className="bg-slate-900 p-2 rounded border border-emerald-500/50 text-emerald-300">
                <div className="font-bold">1. Registration</div>
                <div className="text-slate-400 text-[9px]">Mobile & Email</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-emerald-500/50 text-emerald-300">
                <div className="font-bold">2. Mobile OTP</div>
                <div className="text-slate-400 text-[9px]">2FA Authenticated</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-emerald-500/50 text-emerald-300">
                <div className="font-bold">3. National ID</div>
                <div className="text-slate-400 text-[9px]">Aadhaar / Voter OCR</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-emerald-500/50 text-emerald-300">
                <div className="font-bold">4. Skill Certs</div>
                <div className="text-slate-400 text-[9px]">Red Cross / BLS / HAM</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-emerald-500/50 text-emerald-300">
                <div className="font-bold">5. Coordinator</div>
                <div className="text-slate-400 text-[9px]">Manual Sign-off</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-amber-500/50 text-amber-300 font-bold">
                <div className="font-bold">6. Role Access</div>
                <div className="text-slate-400 text-[9px]">SITREP Authorization</div>
              </div>
            </div>
          </div>

          {/* Volunteer Roster & Anomaly Inspector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-mono text-xs">
            {/* Volunteer List (5 cols) */}
            <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-slate-300 block uppercase border-b border-slate-800 pb-2">
                ACTIVE VOLUNTEER CORPS ({volunteers.length})
              </span>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {volunteers.map((v) => {
                  const isFlagged = v.status === 'FLAGGED_SUSPICIOUS';
                  const isSelected = selectedVolunteer.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVolunteer(v)}
                      className={`w-full text-left p-3 rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-slate-900'
                          : isFlagged
                          ? 'border-red-800/80 bg-red-950/20 hover:bg-red-950/30'
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{v.name}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isFlagged
                              ? 'bg-red-950 text-red-400 border border-red-700'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          }`}
                        >
                          {isFlagged ? 'FLAGGED' : 'VERIFIED'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[11px]">
                        <span className="text-slate-400">Trust Score:</span>
                        <span
                          className={`font-bold ${
                            v.trustScore > 80 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {v.trustScore}/100
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Fraud Risk:</span>
                        <span
                          className={`font-bold ${
                            v.fraudRiskScore > 50 ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {v.fraudRiskScore}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Volunteer Fraud & Trust Dossier (7 cols) */}
            <div className="md:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{selectedVolunteer.name}</h3>
                  <span className="text-slate-400 text-[11px]">{selectedVolunteer.email} | {selectedVolunteer.mobile}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">SECTOR:</span>
                  <span className="text-amber-400 font-bold">{selectedVolunteer.district}</span>
                </div>
              </div>

              {/* Trust & Fraud Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Trust Score (Composite)</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {selectedVolunteer.trustScore} / 100
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {selectedVolunteer.missionsCompleted} Missions | {selectedVolunteer.accuracyRatePct}% Accuracy
                  </span>
                </div>

                <div className={`p-3 rounded border ${
                  selectedVolunteer.fraudRiskScore > 50
                    ? 'bg-red-950/40 border-red-600/60'
                    : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className="text-[10px] text-slate-400 uppercase block">AI Fraud Anomaly Risk</span>
                  <div className={`text-xl font-bold font-mono mt-1 ${
                    selectedVolunteer.fraudRiskScore > 50 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {selectedVolunteer.fraudRiskScore}% Risk
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Verdict: {fraudEvaluation.verdict}
                  </span>
                </div>
              </div>

              {/* Skills and Certifications */}
              <div>
                <span className="text-slate-400 text-[10px] uppercase block mb-1.5">
                  Verified Skills & Certifications:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVolunteer.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[11px]"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Anomaly Detection Report */}
              <div className="bg-slate-900/90 p-3.5 rounded border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 block uppercase text-[11px] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  FRAUD & ANOMALY DETECTIONS:
                </span>

                {fraudEvaluation.detectedAnomalies.length > 0 ? (
                  <ul className="space-y-1.5 text-[11px] text-red-300">
                    {fraudEvaluation.detectedAnomalies.map((anom, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-red-500 font-bold">⚠️</span>
                        <span>{anom}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-emerald-400 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    No anomalies detected. Geolocation kinematics consistent with ground transport.
                  </div>
                )}

                <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-800 mt-2">
                  Recommendation: {fraudEvaluation.recommendation}
                </div>
              </div>

              {/* Coordinator Decision Actions */}
              <div className="flex items-center gap-3 pt-2">
                {selectedVolunteer.status === 'FLAGGED_SUSPICIOUS' ? (
                  <button
                    onClick={() => onQuarantineVolunteer(selectedVolunteer.id)}
                    className="flex-1 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    QUARANTINE ACCOUNT & LOCK DISPATCH ACCESS
                  </button>
                ) : (
                  <button
                    onClick={() => onApproveVolunteer(selectedVolunteer.id)}
                    className="flex-1 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    CONFIRM VERIFIED VOLUNTEER STATUS
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
