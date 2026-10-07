/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { AiSituationAssessment } from './components/AiSituationAssessment';
import { InteractiveMap } from './components/InteractiveMap';
import { DynamicOptimizationModal } from './components/DynamicOptimizationModal';
import { DisasterDigitalTwinModal } from './components/DisasterDigitalTwinModal';
import { MlPredictionModal } from './components/MlPredictionModal';
import { SosManagementModal } from './components/SosManagementModal';
import { ComputerVisionModal } from './components/ComputerVisionModal';
import { VolunteerTrustModal } from './components/VolunteerTrustModal';
import { EdgeModeModal } from './components/EdgeModeModal';
import { GestureControlModal } from './components/GestureControlModal';
import { RakshaCopilotModal } from './components/RakshaCopilotModal';
import { SoaArchitectureModal } from './components/SoaArchitectureModal';
import { AuditLogModal } from './components/AuditLogModal';
import { MasterSimulationBar } from './components/MasterSimulationBar';
import { LoginModal } from './components/LoginModal';
import { VolunteerWorkspaceView } from './components/VolunteerWorkspaceView';
import { HospitalDashboardView } from './components/HospitalDashboardView';
import { CitizenPortalView } from './components/CitizenPortalView';

import {
  INITIAL_DISASTER_ZONES,
  INITIAL_HOSPITALS,
  INITIAL_AMBULANCES,
  INITIAL_RESCUE_TEAMS,
  INITIAL_ROAD_SEGMENTS,
  INITIAL_SHELTERS,
  INITIAL_SOS_REQUESTS,
  INITIAL_VOLUNTEERS,
} from './data/initialDisasterData';

import {
  DisasterZone,
  Hospital,
  Ambulance,
  RescueTeam,
  RoadSegment,
  Shelter,
  SosRequest,
  Volunteer,
  AuditRecord,
  UserRole,
  GeoPoint,
  JwtSession,
  AuthUser,
} from './types';

import { runDynamicOrToolsOptimization } from './services/optimizationEngine';
import { createAuditRecord, INITIAL_AUDIT_LOGS } from './services/auditLogger';
import { queueOfflineSos, EdgeSyncSummary } from './services/edgeSyncService';
import { getInitialSession, DEMO_PROFILES, loginUser } from './services/authService';

export default function App() {
  // Domain State
  const [zones, setZones] = useState<DisasterZone[]>(INITIAL_DISASTER_ZONES);
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [ambulances, setAmbulances] = useState<Ambulance[]>(INITIAL_AMBULANCES);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>(INITIAL_RESCUE_TEAMS);
  const [roads, setRoads] = useState<RoadSegment[]>(INITIAL_ROAD_SEGMENTS);
  const [shelters, setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [sosRequests, setSosRequests] = useState<SosRequest[]>(INITIAL_SOS_REQUESTS);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(INITIAL_AUDIT_LOGS);

  // Authentication & Session State
  const [session, setSession] = useState<JwtSession>(getInitialSession);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // App Modes & Navigation
  const [isEdgeMode, setIsEdgeMode] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<string>('map');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Active Dispatch Route for Map Visualization
  const [activeRoute, setActiveRoute] = useState<{
    origin: GeoPoint;
    destination: GeoPoint;
    label: string;
    isDetour: boolean;
  } | null>({
    origin: { lat: 17.3985, lng: 78.4062 }, // Nadeem Colony (Tolichowki)
    destination: { lat: 17.4249, lng: 78.5042 }, // Gandhi Hospital Secunderabad (Bypass via PVNR)
    label: '108-ALS-Delta 01 → Gandhi Hospital (PVNR Bypass)',
    isDetour: true,
  });

  // Dynamic Optimizer Result
  const [optimizationSummary, setOptimizationSummary] = useState(() =>
    runDynamicOrToolsOptimization(INITIAL_SOS_REQUESTS, INITIAL_AMBULANCES, INITIAL_HOSPITALS, INITIAL_ROAD_SEGMENTS)
  );

  // Master Simulation State
  const [simulationStep, setSimulationStep] = useState<number>(1);
  const [isPlayingSimulation, setIsPlayingSimulation] = useState<boolean>(false);
  const simulationTimerRef = useRef<any>(null);

  // Switch role handler: switches JWT session and loads role's primary deck
  const handleRoleChange = async (newRole: UserRole) => {
    try {
      const updatedSession = await loginUser(newRole);
      setSession(updatedSession);
    } catch {
      setSession({
        token: 'offline-jwt-' + newRole,
        user: DEMO_PROFILES[newRole],
        issuedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        algorithm: 'HS256',
        isValid: true,
      });
    }

    // Set role primary workspace view
    if (newRole === 'HOSPITAL') {
      setActiveView('hospital-deck');
    } else if (newRole === 'VOLUNTEER') {
      setActiveView('volunteer-hub');
    } else if (newRole === 'CITIZEN') {
      setActiveView('citizen-portal');
    } else {
      setActiveView('map');
    }
  };

  // Optimization Runner
  const handleRunOptimization = (reason?: string) => {
    const updated = runDynamicOrToolsOptimization(sosRequests, ambulances, hospitals, roads, reason);
    setOptimizationSummary(updated);

    // Update ambulances dispatch targets
    setAmbulances((prev) =>
      prev.map((amb) => {
        if (amb.id === 'amb-108-01') {
          return {
            ...amb,
            assignedHospitalId: 'hosp-02', // Gandhi Hospital
            currentEtaMinutes: 14,
            status: 'DISPATCHED',
          };
        }
        return amb;
      })
    );

    // Add Audit Record
    const audit = createAuditRecord(
      'OR-Tools Optimization Solver',
      'ALGORITHM_DAEMON',
      'RECALCULATE_DISPATCH_MATRIX',
      reason || 'Dynamic MIP recomputation completed. Diverted critical casualty away from Osmania Hospital to Gandhi Hospital.',
      auditLogs[0]?.hash
    );
    setAuditLogs((prev) => [audit, ...prev]);
  };

  // SOS Creation Handler
  const handleCreateSos = (sosData: Omit<SosRequest, 'id' | 'trackingCode' | 'timestamp'>) => {
    const newId = `sos-${Date.now()}`;
    const code = `SOS-HYD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSos: SosRequest = {
      ...sosData,
      id: newId,
      trackingCode: code,
      timestamp: 'Just now',
    };

    if (isEdgeMode) {
      queueOfflineSos(newSos);
    }

    setSosRequests((prev) => [newSos, ...prev]);

    const audit = createAuditRecord(
      sosData.citizenName,
      'CITIZEN',
      'CREATE_EMERGENCY_SOS',
      `Emergency SOS ${code} submitted from ${sosData.address}. Urgency: ${sosData.priority}. Victims: ${sosData.victimCount}.`,
      auditLogs[0]?.hash
    );
    setAuditLogs((prev) => [audit, ...prev]);

    // Automatically trigger optimizer update
    handleRunOptimization('New P1 Citizen SOS Ingested');
  };

  const handleUpdateSosStatus = (id: string, status: SosRequest['status']) => {
    setSosRequests((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  // Volunteer Actions
  const handleApproveVolunteer = (id: string) => {
    setVolunteers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'ACTIVE', coordinatorApproved: true } : v))
    );
    const v = volunteers.find((vol) => vol.id === id);
    const audit = createAuditRecord(
      'Chief Coordinator 104',
      'COORDINATOR',
      'APPROVE_VOLUNTEER_CREDENTIALS',
      `Approved deployment credentials for volunteer ${v?.name || id}. Identity & BLS certification confirmed.`,
      auditLogs[0]?.hash
    );
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const handleQuarantineVolunteer = (id: string) => {
    setVolunteers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'SUSPENDED', fraudRiskScore: 94 } : v))
    );
    const v = volunteers.find((vol) => vol.id === id);
    const audit = createAuditRecord(
      'AI Fraud Detection Service',
      'SECURITY_DAEMON',
      'QUARANTINE_VOLUNTEER_FRAUD',
      `Revoked field dispatch permissions for entity ${v?.name || id} due to kinematic GPS teleportation anomaly.`,
      auditLogs[0]?.hash
    );
    setAuditLogs((prev) => [audit, ...prev]);
  };

  // CV Drone Recon SOS Generation
  const handleDispatchFromCv = (summary: string, victimCount: number) => {
    handleCreateSos({
      citizenName: 'AI Drone Reconnaissance (Automated Detection)',
      mobile: 'CIVIL_DEFENSE_RECON_01',
      location: { lat: 17.3985, lng: 78.4068 },
      address: 'Plot 44, Nadeem Colony Rooftops',
      emergencyType: 'FLOOD_TRAPPED',
      victimCount,
      medicalUrgency: true,
      priority: 'P1',
      status: 'VERIFIED',
      trustScore: 98,
      voiceTranscript: `Computer Vision detected ${victimCount} stranded rooftop victims via 4K thermal drone feed.`,
    });
  };

  // Hospital In-Charge Trigger Diversion Handler
  const handleTriggerHospitalDiversion = (hospitalId: string) => {
    const hosp = hospitals.find((h) => h.id === hospitalId);
    handleRunOptimization(`Emergency Diversion Protocol Enforced by ${hosp?.name || 'Hospital Superintendent'}`);
    setActiveRoute({
      origin: { lat: 17.3985, lng: 78.4062 },
      destination: { lat: 17.4249, lng: 78.5042 },
      label: '108-ALS-Delta 01 → Gandhi Hospital (PVNR Bypass Divert)',
      isDetour: true,
    });
    const audit = createAuditRecord(
      session.user.name,
      'HOSPITAL',
      'ENFORCE_EMERGENCY_DIVERSION',
      `Hospital Superintendent enforced ambulance diversion away from ${hosp?.name || hospitalId} to Gandhi Hospital due to saturation.`,
      auditLogs[0]?.hash
    );
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const handleUpdateHospitalBeds = (hospitalId: string, occupiedBeds: number) => {
    setHospitals((prev) =>
      prev.map((h) =>
        h.id === hospitalId
          ? {
              ...h,
              occupiedBeds,
              status: occupiedBeds / h.totalBeds > 0.9 ? 'CRITICAL_OVERLOAD' : 'OPTIMAL',
            }
          : h
      )
    );
    handleRunOptimization(`Hospital Bed Count Updated for ${hospitalId} to ${occupiedBeds}`);
  };

  // Quick Action Handlers
  const handleRequestAerialRecon = () => {
    const audit = createAuditRecord(
      'Chief Operations Coordinator',
      'COORDINATOR',
      'DISPATCH_AERIAL_RECON_UAV',
      'Dispatched 4K Thermal Recon Drone Unit (Falcon-01) over Sector 4 (Nadeem Colony & Chaderghat). Live thermal stream connected to CV pipeline.',
      auditLogs[0]?.hash
    );
    setAuditLogs((prev) => [audit, ...prev]);
    setActiveView('cv');
  };

  const handleClearSelectedRoad = () => {
    setRoads((prev) =>
      prev.map((r) =>
        r.id === 'road-01' || r.status === 'BLOCKED_SUBMERGED'
          ? {
              ...r,
              status: 'CLEAR',
              waterDepthInches: 0,
              speedReductionPct: 0,
              confidencePct: 99,
              verifiedBy: 'GHMC Emergency De-watering Squad',
            }
          : r
      )
    );

    setActiveRoute({
      origin: { lat: 17.3985, lng: 78.4062 },
      destination: { lat: 17.4249, lng: 78.5042 },
      label: '108-ALS-Delta 01 → Direct Express Corridor (Causeway Cleared)',
      isDetour: false,
    });

    const audit = createAuditRecord(
      'GHMC Disaster De-watering Squad',
      'RESCUE_WORKER',
      'CLEAR_ROAD_OBSTRUCTION',
      'De-watered Chaderghat Causeway using four 500-HP high-discharge pumps. Water depth reduced from 44in to 0in. Arterial roadway re-opened.',
      auditLogs[0]?.hash
    );
    setAuditLogs((prev) => [audit, ...prev]);

    handleRunOptimization('Road Cleared: Chaderghat Causeway de-watered & reopened');
  };

  const handleEmergencyShelterSetup = () => {
    const newShelterId = `shelter-masab-${Date.now()}`;
    const newShelter: Shelter = {
      id: newShelterId,
      name: 'Masab Tank High-Ground Emergency Relief Hub',
      location: { lat: 17.4085, lng: 78.4485 },
      maxCapacity: 2500,
      currentOccupancy: 120,
      foodStockDays: 7,
      waterStockLiters: 30000,
      medicalOfficerPresent: true,
      generatorAvailable: true,
    };

    setShelters((prev) => [newShelter, ...prev]);

    const audit = createAuditRecord(
      'Hyderabad Disaster Relief Authority',
      'ADMIN',
      'ACTIVATE_EMERGENCY_SHELTER',
      'Activated Masab Tank High-Ground Relief Hub (2,500 bed capacity, 30,000L drinking water reservoir, on-site EMT station).',
      auditLogs[0]?.hash
    );
    setAuditLogs((prev) => [audit, ...prev]);
  };

  // Edge Sync Complete
  const handleSyncComplete = (summary: EdgeSyncSummary) => {
    const audit = createAuditRecord(
      'Edge Gateway Daemon (Node-HYD-04)',
      'EDGE_GATEWAY',
      'RECONCILE_SQLITE_CLOUD_DELTA',
      `Synchronized ${summary.syncedSosCount} offline SOS tickets and resolved ${summary.conflictsResolved} state conflict via coordinator vector timestamp.`,
      auditLogs[0]?.hash
    );
    setAuditLogs((prev) => [audit, ...prev]);
  };

  // Master Simulation Step Handler
  const handleExecuteSimulationStep = (step: number) => {
    setSimulationStep(step);

    if (step === 1) {
      setZones((prev) =>
        prev.map((z) => (z.id === 'zone-hyd-01' ? { ...z, waterLevelMeters: 2.65, floodProbabilityPct: 98 } : z))
      );
    } else if (step === 2) {
      setActiveView('sos');
    } else if (step === 3) {
      handleRunOptimization('Step 3: Initial OR-Tools Allocation');
      setActiveView('optimizer');
    } else if (step === 4) {
      setRoads((prev) =>
        prev.map((r) => (r.id === 'road-01' ? { ...r, status: 'BLOCKED_SUBMERGED', waterDepthInches: 48 } : r))
      );
      setHospitals((prev) =>
        prev.map((h) => (h.id === 'hosp-01' ? { ...h, occupiedBeds: 1120, status: 'CRITICAL_OVERLOAD' } : h))
      );
      setActiveView('hospital-deck');
    } else if (step === 5) {
      handleRunOptimization('Step 5: Road Blocked + Osmania Hospital Overload (95%)');
      setActiveRoute({
        origin: { lat: 17.3985, lng: 78.4062 },
        destination: { lat: 17.4249, lng: 78.5042 },
        label: '108-ALS-Delta 01 → Gandhi Hospital (PVNR Elevated Bypass)',
        isDetour: true,
      });
      setActiveView('optimizer');
    } else if (step === 6) {
      setActiveView('volunteers');
    } else if (step === 7) {
      setActiveView('cv');
    } else if (step === 8) {
      setIsEdgeMode(true);
      setActiveView('edge');
    } else if (step === 9) {
      setIsEdgeMode(false);
      setActiveView('digital-twin');
    } else if (step === 10) {
      setActiveView('audit');
    }
  };

  const handleNextSimulationStep = () => {
    if (simulationStep < 10) {
      handleExecuteSimulationStep(simulationStep + 1);
    } else {
      setIsPlayingSimulation(false);
    }
  };

  const handleResetState = () => {
    setZones(INITIAL_DISASTER_ZONES);
    setHospitals(INITIAL_HOSPITALS);
    setAmbulances(INITIAL_AMBULANCES);
    setRescueTeams(INITIAL_RESCUE_TEAMS);
    setRoads(INITIAL_ROAD_SEGMENTS);
    setShelters(INITIAL_SHELTERS);
    setSosRequests(INITIAL_SOS_REQUESTS);
    setVolunteers(INITIAL_VOLUNTEERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setIsEdgeMode(false);
    setSimulationStep(1);
    setIsPlayingSimulation(false);
    setActiveView('map');
  };

  // Auto-play timer
  useEffect(() => {
    if (isPlayingSimulation) {
      simulationTimerRef.current = setInterval(() => {
        setSimulationStep((prev) => {
          if (prev >= 10) {
            setIsPlayingSimulation(false);
            clearInterval(simulationTimerRef.current);
            return prev;
          }
          const next = prev + 1;
          handleExecuteSimulationStep(next);
          return next;
        });
      }, 5000);
    } else {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    }
    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, [isPlayingSimulation]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Application Header */}
      <Header
        currentRole={session.user.role}
        currentUser={session.user}
        onRoleChange={handleRoleChange}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        isEdgeMode={isEdgeMode}
        onToggleEdgeMode={() => setIsEdgeMode(!isEdgeMode)}
        onStartSimulation={() => {
          handleExecuteSimulationStep(1);
          setIsPlayingSimulation(true);
        }}
        onResetState={handleResetState}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* AI Situation Assessment Real-time Telemetry Bar */}
      <AiSituationAssessment
        zones={zones}
        hospitals={hospitals}
        ambulances={ambulances}
        sosRequests={sosRequests}
        isEdgeMode={isEdgeMode}
        onOpenOptimizer={() => setActiveView('optimizer')}
        onOpenDigitalTwin={() => setActiveView('digital-twin')}
      />

      {/* Main Command Center Workspace */}
      <main className="flex-1 p-3 md:p-4 space-y-4">
        {/* Role-Specific Dedicated Workspaces or Tactical GIS Map */}
        {activeView === 'hospital-deck' ? (
          <HospitalDashboardView
            currentUser={session.user}
            hospitals={hospitals}
            ambulances={ambulances}
            sosRequests={sosRequests}
            onTriggerDiversion={handleTriggerHospitalDiversion}
            onUpdateBeds={handleUpdateHospitalBeds}
          />
        ) : activeView === 'volunteer-hub' || activeView === 'intercom' ? (
          <VolunteerWorkspaceView
            currentUser={session.user}
            sosRequests={sosRequests}
            onOpenMap={() => setActiveView('map')}
            onSubmitIncidentReport={(report) => {
              handleCreateSos({
                citizenName: `Volunteer Report (${session.user.name})`,
                mobile: session.user.phone || '9988776655',
                location: { lat: 17.3985, lng: 78.4068 },
                address: report.fieldAddress,
                emergencyType: 'FLOOD_TRAPPED',
                victimCount: report.victimsFound,
                medicalUrgency: true,
                priority: 'P1',
                status: 'VERIFIED',
                trustScore: 98,
                voiceTranscript: `${report.fieldNotes} [Water depth: ${report.waterDepth}]`,
              });
            }}
          />
        ) : activeView === 'citizen-portal' ? (
          <CitizenPortalView
            currentUser={session.user}
            sosRequests={sosRequests}
            shelters={shelters}
            onCreateSos={handleCreateSos}
            onOpenMap={() => setActiveView('map')}
          />
        ) : (
          /* Central Tactical Map Canvas */
          <InteractiveMap
            zones={zones}
            hospitals={hospitals}
            ambulances={ambulances}
            rescueTeams={rescueTeams}
            roads={roads}
            shelters={shelters}
            sosRequests={sosRequests}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={setSelectedIncidentId}
            activeRoute={activeRoute}
            onOpenOptimizer={() => setActiveView('optimizer')}
            onRequestAerialRecon={handleRequestAerialRecon}
            onClearSelectedRoad={handleClearSelectedRoad}
            onEmergencyShelterSetup={handleEmergencyShelterSetup}
          />
        )}
      </main>

      {/* Floating Simulation Presentation Control Bar */}
      <MasterSimulationBar
        currentStep={simulationStep}
        totalSteps={10}
        isPlaying={isPlayingSimulation}
        onTogglePlay={() => setIsPlayingSimulation(!isPlayingSimulation)}
        onNextStep={handleNextSimulationStep}
        onReset={handleResetState}
        onJumpToStep={handleExecuteSimulationStep}
      />

      {/* Sovereign Authentication & JWT Inspector Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentSession={session}
        onLoginSuccess={(newSession) => {
          setSession(newSession);
          if (newSession.user.role === 'HOSPITAL') setActiveView('hospital-deck');
          else if (newSession.user.role === 'VOLUNTEER') setActiveView('volunteer-hub');
          else if (newSession.user.role === 'CITIZEN') setActiveView('citizen-portal');
          else setActiveView('map');
        }}
      />

      {/* Sub-system Modals */}
      <DynamicOptimizationModal
        isOpen={activeView === 'optimizer'}
        onClose={() => setActiveView('map')}
        optimizationSummary={optimizationSummary}
        onRunOptimization={handleRunOptimization}
      />

      <DisasterDigitalTwinModal
        isOpen={activeView === 'digital-twin'}
        onClose={() => setActiveView('map')}
        hospitals={hospitals}
        onApplyMitigations={(mits) => {
          const audit = createAuditRecord(
            session.user.name,
            session.user.role,
            'DEPLOY_DIGITAL_TWIN_MITIGATIONS',
            `Applied preventative interventions: ${mits.join('; ')}`,
            auditLogs[0]?.hash
          );
          setAuditLogs((prev) => [audit, ...prev]);
        }}
      />

      <MlPredictionModal
        isOpen={activeView === 'predictions'}
        onClose={() => setActiveView('map')}
      />

      <SosManagementModal
        isOpen={activeView === 'sos'}
        onClose={() => setActiveView('map')}
        sosRequests={sosRequests}
        onCreateSos={handleCreateSos}
        onUpdateStatus={handleUpdateSosStatus}
        isEdgeMode={isEdgeMode}
      />

      <ComputerVisionModal
        isOpen={activeView === 'cv'}
        onClose={() => setActiveView('map')}
        onDispatchFromCv={handleDispatchFromCv}
      />

      <VolunteerTrustModal
        isOpen={activeView === 'volunteers'}
        onClose={() => setActiveView('map')}
        volunteers={volunteers}
        onApproveVolunteer={handleApproveVolunteer}
        onQuarantineVolunteer={handleQuarantineVolunteer}
      />

      <EdgeModeModal
        isOpen={activeView === 'edge'}
        onClose={() => setActiveView('map')}
        isEdgeMode={isEdgeMode}
        onToggleEdgeMode={() => setIsEdgeMode(!isEdgeMode)}
        onSyncComplete={handleSyncComplete}
      />

      <GestureControlModal
        isOpen={activeView === 'gesture'}
        onClose={() => setActiveView('map')}
        onApproveProposal={() => handleRunOptimization('Approved via Hand Gesture (Thumbs Up)')}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        onToggleLayer={() => {}}
      />

      <RakshaCopilotModal
        isOpen={activeView === 'copilot'}
        onClose={() => setActiveView('map')}
        hospitals={hospitals}
        ambulances={ambulances}
        sosRequests={sosRequests}
        onExecuteAction={(act) => {
          if (act.includes('Recalculate')) handleRunOptimization(act);
          else if (act.includes('Digital Twin')) setActiveView('digital-twin');
        }}
      />

      <SoaArchitectureModal
        isOpen={activeView === 'soa'}
        onClose={() => setActiveView('map')}
      />

      <AuditLogModal
        isOpen={activeView === 'audit'}
        onClose={() => setActiveView('map')}
        auditLogs={auditLogs}
      />
    </div>
  );
}
