import React, { useState } from 'react';
import {
  WifiOff,
  Wifi,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import { SosRequest } from '../types';
import { getOfflineQueue, simulateCloudSync, EdgeSyncSummary } from '../services/edgeSyncService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEdgeMode: boolean;
  onToggleEdgeMode: () => void;
  onSyncComplete: (summary: EdgeSyncSummary) => void;
}

export const EdgeModeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isEdgeMode,
  onToggleEdgeMode,
  onSyncComplete,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<EdgeSyncSummary | null>(null);

  if (!isOpen) return null;

  const queuedSos = getOfflineQueue();

  const handleTriggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      const { summary } = simulateCloudSync(queuedSos);
      setLastSyncResult(summary);
      setSyncing(false);
      onSyncComplete(summary);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
              isEdgeMode ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
            }`}>
              {isEdgeMode ? <WifiOff className="w-5 h-5 animate-pulse" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono">
                  CLOUD + EDGE GATEWAY SYNCHRONIZATION
                </h2>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  isEdgeMode ? 'bg-amber-950 text-amber-300 border border-amber-600' : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                }`}>
                  {isEdgeMode ? 'EDGE LOCAL (SQLITE ACTIVE)' : 'CLOUD SYNCHRONIZED'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Resilience in extreme cyclone/flood telecom blackouts. Edge nodes continue mission-critical triage locally.
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
          {/* Status Architecture Flow */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 uppercase">TELECOM LINK TOPOLOGY:</span>
              <button
                onClick={onToggleEdgeMode}
                className={`px-3 py-1.5 rounded font-bold transition cursor-pointer shadow-md ${
                  isEdgeMode
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {isEdgeMode ? 'RESTORE CLOUD INTERNET LINK' : 'SIMULATE INTERNET FAILURE'}
              </button>
            </div>

            {/* Architecture node diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              {/* Field Responders */}
              <div className="bg-slate-900 p-3 rounded border border-slate-800 text-center space-y-1">
                <HardDrive className="w-5 h-5 mx-auto text-amber-400" />
                <div className="font-bold text-slate-200">Local Handheld / Edge Box</div>
                <div className="text-[10px] text-slate-400">SQLite Database Active</div>
                <div className="text-[10px] text-emerald-400">Offline Queue: {queuedSos.length} items</div>
              </div>

              {/* Edge Gateway Daemon */}
              <div className="text-center">
                <div className="text-[10px] text-slate-400 mb-1">
                  {isEdgeMode ? '❌ WAN Disconnected (Mesh / LoRa only)' : '⚡ Fiber / 5G High Speed (12ms)'}
                </div>
                <div className="h-0.5 w-full bg-slate-800 relative">
                  <div className={`h-full ${isEdgeMode ? 'bg-amber-600' : 'bg-emerald-500'}`} />
                </div>
                <div className="text-[10px] font-bold text-slate-300 mt-1">
                  {isEdgeMode ? 'QUEUED LOCALLY' : 'AUTO-SYNC READY'}
                </div>
              </div>

              {/* Cloud Operations Center */}
              <div className="bg-slate-900 p-3 rounded border border-slate-800 text-center space-y-1">
                <Server className="w-5 h-5 mx-auto text-cyan-400" />
                <div className="font-bold text-slate-200">Cloud Operations Center</div>
                <div className="text-[10px] text-slate-400">PostgreSQL + PostGIS Cluster</div>
                <div className="text-[10px] text-cyan-300">OR-Tools Solver Server</div>
              </div>
            </div>
          </div>

          {/* Sync Trigger and Reconciliation Results */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-200">2-WAY DELTA SYNCHRONIZATION ENGINE</h3>
                <p className="text-[11px] text-slate-400">
                  Resolves timestamp conflicts, flushes local SQLite records to Postgres cloud, and recalculates global state.
                </p>
              </div>

              <button
                onClick={handleTriggerSync}
                disabled={syncing}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'RECONCILING DELTAS...' : 'RUN DELTA SYNC'}</span>
              </button>
            </div>

            {/* Reconciliation Report Card */}
            {lastSyncResult && (
              <div className="bg-slate-900/90 border border-emerald-500/50 rounded-lg p-3.5 space-y-2 text-[11px]">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  SYNCHRONIZATION COMPLETED AT {lastSyncResult.syncTimestamp} ({lastSyncResult.durationMs}ms)
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-1">
                  <div className="bg-slate-950 p-2 rounded">
                    <span className="text-slate-500 block text-[10px]">SOS Records:</span>
                    <strong className="text-slate-100">{lastSyncResult.syncedSosCount} Synced</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded">
                    <span className="text-slate-500 block text-[10px]">Resource Updates:</span>
                    <strong className="text-slate-100">{lastSyncResult.syncedResourceCount} Synced</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded">
                    <span className="text-slate-500 block text-[10px]">Volunteer Reports:</span>
                    <strong className="text-slate-100">{lastSyncResult.syncedVolunteerReports} Synced</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded">
                    <span className="text-slate-500 block text-[10px]">Conflicts:</span>
                    <strong className="text-emerald-400">{lastSyncResult.conflictsResolved} Resolved</strong>
                  </div>
                </div>

                <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                  Resolution Protocol: Coordinator Vector-Clock Precedence. No casualty data dropped.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
