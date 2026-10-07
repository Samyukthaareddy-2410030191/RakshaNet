import { AuditRecord } from '../types';

export function createAuditRecord(
  actor: string,
  role: string,
  action: string,
  details: string,
  previousHash: string = '00000000000000000000000000000000'
): AuditRecord {
  const timestamp = new Date().toLocaleTimeString();
  const rawString = `${timestamp}:${actor}:${role}:${action}:${details}:${previousHash}`;

  // Simple deterministic hash simulation for tamper resistance display
  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    const char = rawString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(16, '0') + 'f7c8';

  return {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    actor,
    role,
    action,
    details,
    hash: hexHash,
    previousHash,
    node: 'Command-Center-HQ-HYD',
  };
}

export const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'audit-001',
    timestamp: '19:42:10',
    actor: 'Dr. Fatima (Coordinator 104)',
    role: 'COORDINATOR',
    action: 'EMERGENCY_TRIAGE_VERIFICATION',
    details: 'Verified P1 status for SOS-HYD-9812 (Nadeem Colony). Critical elderly patient oxygen requirement confirmed.',
    hash: '9a7bc2418e90f231e847',
    previousHash: '00000000000000000000',
    node: 'Command-Center-HQ-HYD',
  },
  {
    id: 'audit-002',
    timestamp: '19:46:33',
    actor: 'OR-Tools Optimization Engine',
    role: 'SYSTEM_OPTIMIZER',
    action: 'DYNAMIC_AMBULANCE_REALLOCATION',
    details: 'Diverted Ambulance 108-ALS-Delta 01 from Osmania Hospital (92.8% overload) to Gandhi Hospital (48% capacity). Saved estimated 14 mins transit.',
    hash: '3f28d81a4b9012c89e21',
    previousHash: '9a7bc2418e90f231e847',
    node: 'Optimization-Cluster-Worker-02',
  },
  {
    id: 'audit-003',
    timestamp: '19:51:02',
    actor: 'AI Fraud Detection Engine',
    role: 'SECURITY_DAEMON',
    action: 'VOLUNTEER_ACCOUNT_QUARANTINE',
    details: 'Flagged entity Rajesh Verma (ID: vol-004) for GPS teleportation anomaly (42km jump in 90s) & contradictory false road clearance report.',
    hash: 'bb59a8c1409f87214a1e',
    previousHash: '3f28d81a4b9012c89e21',
    node: 'Fraud-Analysis-Daemon-01',
  },
];
