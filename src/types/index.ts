export type DisasterSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type UserRole = 'ADMIN' | 'COORDINATOR' | 'HOSPITAL' | 'VOLUNTEER' | 'CITIZEN';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface DisasterZone {
  id: string;
  name: string;
  district: string;
  center: GeoPoint;
  radiusMeters: number;
  severity: DisasterSeverity;
  waterLevelMeters: number;
  affectedPopulation: number;
  roadAccessScorePct: number;
  floodProbabilityPct: number;
  keyHazards: string[];
  lastUpdated: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: GeoPoint;
  address: string;
  district: string;
  totalBeds: number;
  occupiedBeds: number;
  icuBedsTotal: number;
  icuBedsAvailable: number;
  traumaLevel: 1 | 2 | 3;
  oxygenSupplyHours: number;
  bloodUnitsAvailable: number;
  powerBackupStatus: 'ONLINE_GRID' | 'DIESEL_GENERATOR' | 'CRITICAL_UPS';
  status: 'OPTIMAL' | 'NEAR_CAPACITY' | 'CRITICAL_OVERLOAD';
}

export interface Ambulance {
  id: string;
  callSign: string;
  type: 'ALS' | 'BLS' | 'BOAT_AMBULANCE';
  location: GeoPoint;
  status: 'AVAILABLE' | 'DISPATCHED' | 'EN_ROUTE_HOSPITAL' | 'MAINTENANCE';
  assignedVictimId?: string;
  assignedHospitalId?: string;
  fuelPct: number;
  crewName: string;
  currentEtaMinutes?: number;
}

export interface RescueTeam {
  id: string;
  callSign: string;
  agency: 'NDRF' | 'SDRF_TELANGANA' | 'GHMC_HYDRAA' | 'FIRE_SERVICES';
  personnelCount: number;
  boatEquipped: boolean;
  location: GeoPoint;
  assignedSector: string;
  status: 'STANDBY' | 'DEPLOYED' | 'ACTIVE_RESCUE';
  equipment: string[];
}

export interface RoadSegment {
  id: string;
  name: string;
  start: GeoPoint;
  end: GeoPoint;
  status: 'CLEAR' | 'WATERLOGGED' | 'BLOCKED_SUBMERGED' | 'CONGESTED';
  waterDepthInches: number;
  speedReductionPct: number;
  alternateRouteId?: string;
  verifiedBy: string;
  reportAgeMinutes: number;
  confidencePct: number;
}

export interface Shelter {
  id: string;
  name: string;
  location: GeoPoint;
  maxCapacity: number;
  currentOccupancy: number;
  foodStockDays: number;
  waterStockLiters: number;
  medicalOfficerPresent: boolean;
  generatorAvailable: boolean;
}

export interface SosRequest {
  id: string;
  trackingCode: string;
  timestamp: string;
  citizenName: string;
  mobile: string;
  location: GeoPoint;
  address: string;
  emergencyType:
    | 'FLOOD_TRAPPED'
    | 'INJURED_MEDICAL'
    | 'BUILDING_COLLAPSE'
    | 'MISSING_PERSON'
    | 'FOOD_WATER_DEFICIT'
    | 'FIRE';
  victimCount: number;
  medicalUrgency: boolean;
  priority: 'P1' | 'P2' | 'P3';
  status: 'NEW' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  assignedAmbulanceId?: string;
  assignedHospitalId?: string;
  assignedRescueTeamId?: string;
  trustScore: number;
  photoUrl?: string;
  voiceTranscript?: string;
  detectedLanguage?: string;
  isOfflineQueued?: boolean;
}

export interface Volunteer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  district: string;
  skills: string[];
  identityVerified: boolean;
  phoneVerified: boolean;
  coordinatorApproved: boolean;
  status: 'PENDING_OTP' | 'PENDING_APPROVAL' | 'ACTIVE' | 'FLAGGED_SUSPICIOUS' | 'SUSPENDED';
  trustScore: number;
  fraudRiskScore: number;
  fraudFlags: string[];
  missionsCompleted: number;
  accuracyRatePct: number;
  location: GeoPoint;
  lastReportTime: string;
}

export interface TrustReport {
  id: string;
  subject: string;
  entityType: 'ROAD_BLOCK' | 'SOS' | 'SHELTER_CAPACITY' | 'FLOOD_LEVEL';
  source: 'VERIFIED_NDRF' | 'VERIFIED_VOLUNTEER' | 'REGISTERED_CITIZEN' | 'ANONYMOUS';
  timestamp: string;
  ageMinutes: number;
  confidencePct: number;
  status: 'VERIFIED' | 'CORROBORATED' | 'STALE' | 'UNDER_REVIEW';
  details: string;
}

export interface OptimizationAllocation {
  id: string;
  sosId: string;
  victimName: string;
  victimCount: number;
  priority: 'P1' | 'P2' | 'P3';
  previousAmbulance: string;
  newAmbulance: string;
  previousHospital: string;
  newHospital: string;
  previousEtaMinutes: number;
  newEtaMinutes: number;
  reason: string;
  confidencePct: number;
  routeSafe: boolean;
}

export interface OptimizationSummary {
  timestamp: string;
  algorithm: string;
  objectiveScore: number;
  allocations: OptimizationAllocation[];
  totalVictimsCovered: number;
  averageEtaMinutes: number;
  hospitalsBalanced: number;
  explainabilityNote: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  hash: string;
  previousHash: string;
  node: string;
}

export interface DigitalTwinState {
  rainfallIncreasePct: number;
  waterLevelSpikeCm: number;
  roadInaccessiblePct: number;
  hospitalOutageId: string | null;
  projectedVictimsAffected: number;
  avgTravelTimeSpikeMinutes: number;
  overloadedHospitals: string[];
  additionalSheltersRequired: number;
  cleanWaterDeficitLiters: number;
  foodPacketsNeeded: number;
  recommendedMitigations: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeId: string;
  department: string;
  phone?: string;
  token?: string;
}

export interface JwtSession {
  token: string;
  user: AuthUser;
  issuedAt: number;
  expiresAt: number;
  algorithm: string;
  isValid: boolean;
}

export interface IntercomMessage {
  id: string;
  channel: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderBadge: string;
  text: string;
  timestamp: string;
  isUrgent?: boolean;
  location?: GeoPoint;
}
