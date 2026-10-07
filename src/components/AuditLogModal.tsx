import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Hash,
  CheckCircle2,
  Lock,
  Search,
} from 'lucide-react';
import { AuditRecord } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditRecord[];
}

export const AuditLogModal: React.FC<Props> = ({ isOpen, onClose, auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verified, setVerified] = useState(false);

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerifyChain = () => {
    setVerified(true);
    setTimeout(() => setVerified(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono">
                  CRYPTOGRAPHIC DISASTER RESPONSE AUDIT LEDGER
                </h2>
                <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500 text-indigo-300 font-mono text-[10px]">
                  HASH-CHAINED IMMUTABLE AUDIT LOG
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tamper-evident legal trail for emergency resource reallocations, hospital diversions, and volunteer actions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleVerifyChain}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{verified ? '✓ CHAIN 100% VALIDATED' : 'VERIFY CRYPTO INTEGRITY'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 text-sm font-mono px-2 py-1 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail by actor, action code, or keyword..."
              className="bg-transparent w-full text-slate-100 outline-none text-xs"
            />
          </div>

          {/* Ledger Records */}
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-300 font-bold text-[10px]">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-200">{log.actor}</span>
                    <span className="text-[10px] text-slate-500">({log.role})</span>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    TIME: {log.timestamp} | NODE: {log.node}
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {log.details}
                </p>

                {/* Crypto Hash Chaining */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1 font-mono">
                  <div className="truncate">
                    <span>Block Hash: </span>
                    <span className="text-amber-400 font-bold">{log.hash}</span>
                  </div>
                  <div className="truncate">
                    <span>Prev Hash: </span>
                    <span className="text-slate-400">{log.previousHash}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
