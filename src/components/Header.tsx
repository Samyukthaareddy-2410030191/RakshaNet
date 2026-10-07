import React from 'react';
import {
  Radio,
  Wifi,
  WifiOff,
  UserCheck,
  Shield,
  Layers,
  Sparkles,
  Camera,
  HeartPulse,
  BrainCircuit,
  MessageSquare,
  Play,
  RotateCcw,
  Sliders,
  Server,
  FileText,
  Hand,
  Building2,
  Users,
  Key,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { UserRole, AuthUser } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  currentUser: AuthUser;
  onRoleChange: (role: UserRole) => void;
  onOpenLoginModal: () => void;
  isEdgeMode: boolean;
  onToggleEdgeMode: () => void;
  onStartSimulation: () => void;
  onResetState: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentUser,
  onRoleChange,
  onOpenLoginModal,
  isEdgeMode,
  onToggleEdgeMode,
  onStartSimulation,
  onResetState,
  activeView,
  setActiveView,
}) => {
  // Build role-tailored view tabs
  const getTabsForRole = () => {
    if (currentRole === 'HOSPITAL') {
      return [
        { id: 'hospital-deck', label: 'Hospital Command Deck', icon: Building2, highlight: true },
        { id: 'map', label: 'Tactical GIS Map', icon: Layers },
        { id: 'optimizer', label: 'Dynamic Diversion (OR-Tools)', icon: Sparkles },
        { id: 'intercom', label: 'Field Radio & Triage Comms', icon: Radio },
        { id: 'copilot', label: 'Raksha Copilot', icon: MessageSquare },
      ];
    }
    if (currentRole === 'VOLUNTEER') {
      return [
        { id: 'volunteer-hub', label: 'Volunteer & Helper Hub', icon: Users, highlight: true },
        { id: 'map', label: 'Tactical GIS Map', icon: Layers },
        { id: 'intercom', label: '360° Field Intercom & Radio', icon: Radio },
        { id: 'sos', label: 'SOS Incident Queue', icon: HeartPulse },
        { id: 'copilot', label: 'Raksha Copilot', icon: MessageSquare },
      ];
    }
    if (currentRole === 'CITIZEN') {
      return [
        { id: 'citizen-portal', label: 'Civilian Emergency Lifeline', icon: HeartPulse, highlight: true },
        { id: 'map', label: 'Evacuation & Flood Map', icon: Layers },
        { id: 'sos', label: 'Voice SOS & Assistance', icon: MessageSquare },
      ];
    }

    // Default for ADMIN & COORDINATOR: Complete Operations Suite
    return [
      { id: 'map', label: 'Command GIS Map', icon: Layers },
      { id: 'optimizer', label: 'Dynamic Optimizer (OR-Tools)', icon: Sparkles },
      { id: 'volunteer-hub', label: 'Volunteers & Comms Hub', icon: Users },
      { id: 'hospital-deck', label: 'Hospital Deck', icon: Building2 },
      { id: 'citizen-portal', label: 'Citizen Portal', icon: HeartPulse },
      { id: 'digital-twin', label: 'Digital Twin Simulation', icon: Sliders },
      { id: 'predictions', label: 'AI Risk (Random Forest)', icon: BrainCircuit },
      { id: 'cv', label: 'Drone CV Recon', icon: Camera },
      { id: 'volunteers', label: 'Volunteer Fraud Engine', icon: UserCheck },
      { id: 'copilot', label: 'Raksha Copilot', icon: MessageSquare },
      { id: 'edge', label: 'Edge Mode & Sync', icon: WifiOff },
      { id: 'soa', label: 'SOA Services', icon: Server },
      { id: 'audit', label: 'Audit Ledger', icon: FileText },
    ];
  };

  const navTabs = getTabsForRole();

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 sticky top-0 z-40 select-none">
      {/* Tier 1: State Sovereign Banner + Status + User Profile & JWT Badge */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800/80 text-[11px] font-mono gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-amber-400 font-semibold tracking-wider">
            GOVERNMENT OF TELANGANA & NDRF EMERGENCY OPERATIONS CENTER
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden md:inline">INCIDENT: TS-HYD-MONSOON-2026</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Cloud / Edge Indicator */}
          <button
            type="button"
            onClick={onToggleEdgeMode}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition cursor-pointer font-bold text-[10px] ${
              isEdgeMode
                ? 'bg-amber-950/80 text-amber-300 border-amber-600 animate-pulse'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
            }`}
            title="Toggle Cloud vs Edge SQLite Mode"
          >
            {isEdgeMode ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
            <span>{isEdgeMode ? 'EDGE MODE (SQLITE)' : 'CLOUD HYBRID'}</span>
          </button>

          {/* User Profile & JWT Badge trigger */}
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 px-2.5 py-0.5 rounded-lg border border-slate-700 hover:border-amber-400 transition cursor-pointer text-slate-200"
            title="Open Sovereign Authentication & JWT Inspector"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-slate-100">{currentUser.name.split(' ')[0]}</span>
            <span className="px-1 py-0.2 rounded text-[9px] bg-slate-800 border border-slate-600 text-amber-300 font-mono">
              {currentRole}
            </span>
            <span className="px-1 py-0.2 rounded text-[8px] bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono">
              JWT
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Fast RBAC Role Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px]">ROLE:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-amber-300 font-bold text-[11px] outline-none cursor-pointer"
            >
              <option value="ADMIN" className="bg-slate-900 text-slate-100">Admin (NDRF Chief)</option>
              <option value="COORDINATOR" className="bg-slate-900 text-slate-100">Rescue Dispatcher</option>
              <option value="HOSPITAL" className="bg-slate-900 text-slate-100">Hospital In-Charge</option>
              <option value="VOLUNTEER" className="bg-slate-900 text-slate-100">Verified Volunteer</option>
              <option value="CITIZEN" className="bg-slate-900 text-slate-100">Citizen Distress SOS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tier 2: Branding & Master Controls */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 via-red-600 to-indigo-700 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border border-slate-950"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400 bg-clip-text text-transparent">
                RakshaNet AI
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                v3.2
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans hidden sm:block">
              Autonomous Disaster Response & Continuous Resource Allocation
            </p>
          </div>
        </div>

        {/* Master Simulation Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onStartSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-red-600/30 transition transform active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">START HYDERABAD FLOOD SIMULATION</span>
            <span className="sm:hidden">SIMULATION</span>
          </button>

          <button
            type="button"
            onClick={onResetState}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition cursor-pointer"
            title="Reset to Initial Incident State"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Tier 3: Balanced & Segregated Navigation Sub-bar */}
      <div className="px-4 border-t border-slate-800/80 bg-slate-950/70 overflow-x-auto scrollbar-none flex items-center gap-1 py-1 text-xs font-mono">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer text-xs ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold shadow-sm'
                  : tab.highlight
                  ? 'bg-slate-900 text-slate-200 border border-slate-700 hover:border-amber-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
