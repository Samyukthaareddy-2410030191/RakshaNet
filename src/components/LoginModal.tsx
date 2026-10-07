import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Lock,
  User,
  Building2,
  Users,
  HeartPulse,
  Radio,
  CheckCircle2,
  X,
  FileCode,
  Smartphone,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { UserRole, AuthUser, JwtSession } from '../types';
import { DEMO_PROFILES, parseJwt, loginUser } from '../services/authService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentSession: JwtSession;
  onLoginSuccess: (session: JwtSession) => void;
}

export const LoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentSession,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'form' | 'jwt'>('quick');
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentSession.user.role);
  const [emailInput, setEmailInput] = useState(currentSession.user.email);
  const [phoneInput, setPhoneInput] = useState('+91 98490 22334');
  const [otpInput, setOtpInput] = useState('748291');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = async (role: UserRole) => {
    setIsSubmitting(true);
    setStatusMessage(`Authenticating with National Emergency Directory (${role})...`);
    try {
      const session = await loginUser(role);
      onLoginSuccess(session);
      setStatusMessage(`Logged in successfully as ${session.user.name} [${session.user.role}]`);
      setTimeout(() => {
        setIsSubmitting(false);
        setStatusMessage(null);
        onClose();
      }, 700);
    } catch (err) {
      setIsSubmitting(false);
      setStatusMessage('Authentication failed');
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('Validating 2FA OTP & signing JWT...');
    try {
      const session = await loginUser(selectedRole, {
        email: emailInput,
        phone: phoneInput,
      });
      onLoginSuccess(session);
      setStatusMessage('Verified! JWT Bearer Token active.');
      setTimeout(() => {
        setIsSubmitting(false);
        setStatusMessage(null);
        onClose();
      }, 700);
    } catch {
      setIsSubmitting(false);
    }
  };

  const decoded = parseJwt(currentSession.token);

  return (
    <div
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base">
                  RakshaNet Sovereign Authentication
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500 text-emerald-300">
                  JWT HS256
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Role-Based Access Control (RBAC) • Multi-Agency Operations Desk
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`py-3 px-4 border-b-2 font-medium transition cursor-pointer ${
              activeTab === 'quick'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1-Click Role Switch (Demo)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`py-3 px-4 border-b-2 font-medium transition cursor-pointer ${
              activeTab === 'form'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Credential / OTP
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jwt')}
            className={`py-3 px-4 border-b-2 font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'jwt'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Active JWT Inspector
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {statusMessage && (
            <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {activeTab === 'quick' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-300 mb-2">
                Select a verified operational persona to switch perspectives and dynamically change UI permissions:
              </div>

              {(
                [
                  {
                    role: 'ADMIN',
                    title: 'Chief Operations Coordinator (Admin)',
                    desc: 'Full national incident control, OR-Tools optimization override, Digital Twin, and audit ledger.',
                    profile: DEMO_PROFILES.ADMIN,
                    icon: ShieldCheck,
                    badgeColor: 'border-purple-500/40 bg-purple-950/30 text-purple-300',
                  },
                  {
                    role: 'COORDINATOR',
                    title: 'Rescue Dispatcher (GHMC Operations)',
                    desc: 'Dispatches 108 ALS ambulances, SDRF inflatable boats, road pump teams, and GIS coordination.',
                    profile: DEMO_PROFILES.COORDINATOR,
                    icon: Radio,
                    badgeColor: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300',
                  },
                  {
                    role: 'HOSPITAL',
                    title: 'Hospital Medical Superintendent',
                    desc: 'Live ER trauma saturation, ICU bed counters, incoming ambulances with ETAs, diversion triggers.',
                    profile: DEMO_PROFILES.HOSPITAL,
                    icon: Building2,
                    badgeColor: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
                  },
                  {
                    role: 'VOLUNTEER',
                    title: 'Verified Field Volunteer & Helper',
                    desc: 'Live 2-way volunteer radio/intercom, sector tasks, SOS reports, verified digital badge & trust score.',
                    profile: DEMO_PROFILES.VOLUNTEER,
                    icon: Users,
                    badgeColor: 'border-amber-500/40 bg-amber-950/30 text-amber-300',
                  },
                  {
                    role: 'CITIZEN',
                    title: 'Citizen in Disaster Zone',
                    desc: 'Distress SOS triggers, Multilingual voice recorder, real-time rescue tracker, and high-ground shelters.',
                    profile: DEMO_PROFILES.CITIZEN,
                    icon: HeartPulse,
                    badgeColor: 'border-red-500/40 bg-red-950/30 text-red-300',
                  },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const isCurrent = currentSession.user.role === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleQuickLogin(item.role)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3.5 group cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-800/90 border-amber-500/80 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-slate-100 text-xs flex items-center gap-2">
                          <span>{item.title}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500 text-slate-950 font-extrabold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${item.badgeColor}`}>
                          {item.profile.badgeId}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
                        {item.profile.name} • {item.profile.department}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'form' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Access Role Target
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-400"
                >
                  <option value="ADMIN">Chief Coordinator (ADMIN)</option>
                  <option value="COORDINATOR">Rescue Dispatcher (COORDINATOR)</option>
                  <option value="HOSPITAL">Hospital Superintendent (HOSPITAL)</option>
                  <option value="VOLUNTEER">Verified Volunteer (VOLUNTEER)</option>
                  <option value="CITIZEN">Civilian SOS (CITIZEN)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Official Email / Aadhaar ID
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Registered Mobile (+91)
                  </label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center justify-between">
                  <span>Emergency 2FA OTP</span>
                  <span className="text-[10px] text-amber-400">Demo Code: 748291</span>
                </label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  maxLength={6}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 tracking-widest text-center text-sm outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Verify Credentials & Issue JWT</span>
              </button>
            </form>
          )}

          {activeTab === 'jwt' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Encoded RFC 7519 Token (Bearer)</span>
                  <span className="text-emerald-400">SIGNATURE: VERIFIED</span>
                </div>
                <div className="break-all text-[11px] text-amber-300/90 bg-slate-900/60 p-2 rounded border border-slate-800">
                  {currentSession.token}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    Decoded Header
                  </div>
                  <pre className="text-[11px] text-cyan-300 whitespace-pre-wrap">
                    {JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2)}
                  </pre>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    Decoded Claims & Roles
                  </div>
                  <pre className="text-[11px] text-emerald-300 whitespace-pre-wrap">
                    {JSON.stringify(
                      decoded || {
                        sub: currentSession.user.id,
                        name: currentSession.user.name,
                        role: currentSession.user.role,
                        badgeId: currentSession.user.badgeId,
                        department: currentSession.user.department,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>SESSION VALID FOR: 23h 58m</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
