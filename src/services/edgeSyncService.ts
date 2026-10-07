import { SosRequest, AuditRecord } from '../types';

export interface EdgeSyncSummary {
  syncedSosCount: number;
  syncedResourceCount: number;
  syncedVolunteerReports: number;
  conflictsDetected: number;
  conflictsResolved: number;
  syncTimestamp: string;
  durationMs: number;
}

const LOCAL_STORAGE_KEY = 'rakshanet_edge_sqlite_queue';

export function getOfflineQueue(): SosRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueOfflineSos(sos: SosRequest): void {
  try {
    const current = getOfflineQueue();
    const updated = [...current, { ...sos, isOfflineQueued: true }];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to write to Edge SQLite store:', err);
  }
}

export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear Edge queue:', err);
  }
}

export function simulateCloudSync(queuedSos: SosRequest[]): {
  summary: EdgeSyncSummary;
  newAuditRecords: AuditRecord[];
} {
  const count = queuedSos.length > 0 ? queuedSos.length : 3;
  const summary: EdgeSyncSummary = {
    syncedSosCount: count,
    syncedResourceCount: 4,
    syncedVolunteerReports: 5,
    conflictsDetected: 1,
    conflictsResolved: 1,
    syncTimestamp: new Date().toLocaleTimeString(),
    durationMs: 340,
  };

  const newAuditRecords: AuditRecord[] = [
    {
      id: `audit-sync-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: 'Edge Gateway (Node-HYD-South-04)',
      role: 'EDGE_DAEMON',
      action: 'EDGE_TO_CLOUD_DELTA_SYNC',
      details: `Reconciled ${count} offline SOS tickets and 4 telemetry updates. Conflict in Shelter #1 bed count resolved in favor of Coordinator timestamp.`,
      hash: 'e48a73b49f992a0134bc5e4d2931',
      previousHash: 'a71e49cb92e883901a1c93f0b2',
      node: 'Edge-Gateway-Tolichowki',
    },
  ];

  clearOfflineQueue();

  return { summary, newAuditRecords };
}
