import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Layers,
  CheckCircle2,
  Cpu,
  RefreshCw,
  GitCommit,
  Radio,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ServiceItem {
  name: string;
  version: string;
  status: string;
  latencyMs: number;
  type: string;
}

export const SoaArchitectureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [services, setServices] = useState<ServiceItem[]>([
    { name: 'Identity & National ID Service', version: '2.1.0', status: 'HEALTHY', latencyMs: 14, type: 'CORE' },
    { name: 'Authentication & RBAC Service', version: '1.4.0', status: 'HEALTHY', latencyMs: 19, type: 'SECURITY' },
    { name: 'Citizen SOS Ingestion Service', version: '3.0.2', status: 'HEALTHY', latencyMs: 8, type: 'DISPATCH' },
    { name: 'Volunteer & Trust Engine', version: '2.4.1', status: 'HEALTHY', latencyMs: 22, type: 'TRUST' },
    { name: 'Fraud & Teleportation Detection Service', version: '1.9.0', status: 'HEALTHY', latencyMs: 31, type: 'TRUST' },
    { name: 'Disaster State Service', version: '3.1.0', status: 'HEALTHY', latencyMs: 11, type: 'CORE' },
    { name: 'Geospatial & PostGIS Service', version: '2.0.4', status: 'HEALTHY', latencyMs: 27, type: 'GIS' },
    { name: 'Road & OSRM Routing Service', version: '2.2.0', status: 'HEALTHY', latencyMs: 18, type: 'ROUTING' },
    { name: 'Hospital Resource & Bed Service', version: '2.3.0', status: 'HEALTHY', latencyMs: 12, type: 'LOGISTICS' },
    { name: 'Ambulance GPS Telemetry Service', version: '2.1.0', status: 'HEALTHY', latencyMs: 9, type: 'LOGISTICS' },
    { name: 'AI Risk Prediction Engine (Random Forest)', version: '1.8.2', status: 'HEALTHY', latencyMs: 45, type: 'AI' },
    { name: 'Dynamic Resource Optimizer (OR-Tools)', version: '3.2.0', status: 'HEALTHY', latencyMs: 38, type: 'OPTIMIZATION' },
    { name: 'Computer Vision Recon Service', version: '2.0.1', status: 'HEALTHY', latencyMs: 82, type: 'CV' },
    { name: 'Multilingual Indic Voice SOS Service', version: '1.5.0', status: 'HEALTHY', latencyMs: 64, type: 'NLP' },
    { name: 'Disaster Digital Twin Engine', version: '2.5.0', status: 'HEALTHY', latencyMs: 29, type: 'SIMULATION' },
    { name: 'Edge Synchronization Gateway (SQLite)', version: '1.3.0', status: 'HEALTHY', latencyMs: 16, type: 'EDGE' },
    { name: 'Cryptographic Audit & Ledger Service', version: '1.1.0', status: 'HEALTHY', latencyMs: 12, type: 'SECURITY' },
  ]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/soa/directory')
        .then((res) => res.json())
        .then((data) => {
          if (data.services) setServices(data.services);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono">
                  SERVICE-ORIENTED ARCHITECTURE (SOA) SERVICE REGISTRY
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-400 font-mono text-[10px]">
                  TOPOLOGY: 20 MICROSERVICES | EVENT-DRIVEN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Stateless, independently deployable services communicating over gRPC / REST and Redis PubSub event bus.
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
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs">
          {/* SOA Principles Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold block text-[11px]">Loose Coupling</span>
              <p className="text-slate-400 text-[10px] mt-0.5">Services interact via contracts with no shared memory</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-emerald-400 font-bold block text-[11px]">Service Autonomy</span>
              <p className="text-slate-400 text-[10px] mt-0.5">Independent data stores & failover isolation</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-bold block text-[11px]">Edge Resilience</span>
              <p className="text-slate-400 text-[10px] mt-0.5">SQLite local fallback when cloud WAN severs</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-indigo-400 font-bold block text-[11px]">Event Bus Telemetry</span>
              <p className="text-slate-400 text-[10px] mt-0.5">Kafka / Redis PubSub stream broadcast</p>
            </div>
          </div>

          {/* Microservices Directory Grid */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 uppercase">
                DISCOVERABLE SOA SERVICE DIRECTORY ({services.length} ACTIVE)
              </span>
              <span className="text-emerald-400 font-bold text-[10px]">ALL SYSTEMS OPERATIONAL (100% HEALTHY)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {services.map((svc, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-200 text-[11px] truncate max-w-[200px]">
                      {svc.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      v{svc.version} | Type: <span className="text-slate-400">{svc.type}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700 text-[9px] font-bold">
                      {svc.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{svc.latencyMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
