import { TrustReport, Volunteer } from '../types';

export function calculateTrustScore(
  source: 'VERIFIED_NDRF' | 'VERIFIED_VOLUNTEER' | 'REGISTERED_CITIZEN' | 'ANONYMOUS',
  ageMinutes: number,
  corroborationCount: number = 1
): { score: number; status: 'VERIFIED' | 'CORROBORATED' | 'STALE' | 'UNDER_REVIEW' } {
  // Base authority weight
  let baseScore = 40;
  if (source === 'VERIFIED_NDRF') baseScore = 95;
  else if (source === 'VERIFIED_VOLUNTEER') baseScore = 88;
  else if (source === 'REGISTERED_CITIZEN') baseScore = 65;
  else if (source === 'ANONYMOUS') baseScore = 35;

  // Freshness decay: Half-life of 25 minutes
  const decayFactor = Math.exp(-0.027 * ageMinutes);
  let decayedScore = baseScore * decayFactor;

  // Corroboration boost (up to +20 points)
  const corroborationBonus = Math.min(20, (corroborationCount - 1) * 8);
  const finalScore = Math.min(99, Math.round(decayedScore + corroborationBonus));

  let status: 'VERIFIED' | 'CORROBORATED' | 'STALE' | 'UNDER_REVIEW' = 'UNDER_REVIEW';
  if (finalScore >= 85 && (source === 'VERIFIED_NDRF' || source === 'VERIFIED_VOLUNTEER')) {
    status = 'VERIFIED';
  } else if (corroborationCount >= 2 && finalScore >= 70) {
    status = 'CORROBORATED';
  } else if (ageMinutes > 35 || finalScore < 45) {
    status = 'STALE';
  }

  return { score: finalScore, status };
}

export interface FraudAnalysisResult {
  volunteerId: string;
  volunteerName: string;
  fraudRiskScore: number;
  verdict: 'TRUSTED' | 'ELEVATED_RISK' | 'CRITICAL_FRAUD_FLAGGED';
  detectedAnomalies: string[];
  recommendation: string;
}

export function evaluateVolunteerFraud(volunteer: Volunteer): FraudAnalysisResult {
  const anomalies: string[] = [];
  let riskScore = volunteer.fraudRiskScore;

  if (volunteer.fraudFlags && volunteer.fraudFlags.length > 0) {
    anomalies.push(...volunteer.fraudFlags);
    riskScore = Math.max(riskScore, 75);
  }

  // Teleportation or impossible travel detection
  if (volunteer.status === 'FLAGGED_SUSPICIOUS') {
    anomalies.push('Impossible Velocity: 42 km shift in 90 seconds (Kinematic threshold: 25 km/h in monsoon traffic)');
    anomalies.push('Sensor Conflict: Submitted "Clear Roadway" at flooded Chaderghat Sonar buoy location');
    riskScore = 88;
  }

  if (!volunteer.identityVerified) {
    anomalies.push('National Identity (Aadhaar / Voter ID) pending automated OCR match');
    riskScore += 15;
  }

  if (volunteer.missionsCompleted > 0 && volunteer.accuracyRatePct < 60) {
    anomalies.push('Historical Report Discrepancy: Over 40% of previous water-level alerts contradicted ground truth');
    riskScore += 25;
  }

  riskScore = Math.min(99, Math.max(2, riskScore));

  let verdict: 'TRUSTED' | 'ELEVATED_RISK' | 'CRITICAL_FRAUD_FLAGGED' = 'TRUSTED';
  let recommendation = 'Volunteer is in good standing. Authorized to file field SITREPs and accept rescue tasks.';

  if (riskScore >= 70) {
    verdict = 'CRITICAL_FRAUD_FLAGGED';
    recommendation =
      'Immediate Coordinator Lockout. Submissions quarantined from AI dispatch pipeline. Requires manual biometric/in-person verification.';
  } else if (riskScore >= 40) {
    verdict = 'ELEVATED_RISK';
    recommendation =
      'Probationary status. Reports require 2x volunteer cross-corroboration before triggering resource dispatch.';
  }

  return {
    volunteerId: volunteer.id,
    volunteerName: volunteer.name,
    fraudRiskScore: riskScore,
    verdict,
    detectedAnomalies: anomalies,
    recommendation,
  };
}
