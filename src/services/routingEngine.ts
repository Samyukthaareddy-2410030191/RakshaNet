import { GeoPoint, RoadSegment } from '../types';

export interface RouteDetail {
  id: string;
  sourceName: string;
  destinationName: string;
  origin: GeoPoint;
  destination: GeoPoint;
  waypoints: GeoPoint[];
  distanceKm: number;
  estimatedMinutes: number;
  hasWaterloggedSection: boolean;
  blockedRoadName?: string;
  isAlternateBypass: boolean;
  corridorType: 'GREEN_CORRIDOR_ELEVATED' | 'STANDARD_SURFACE' | 'DETOUR_BYPASS';
}

export function calculateEmergencyRoute(
  origin: GeoPoint,
  destination: GeoPoint,
  roads: RoadSegment[],
  sourceName: string,
  destinationName: string
): RouteDetail {
  const isChaderghatBlocked = roads.some(
    (r) => r.id === 'road-01' && r.status === 'BLOCKED_SUBMERGED'
  );

  // Approximate midpoints based on Hyderabad coordinates
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;

  if (isChaderghatBlocked && (origin.lng > 78.46 || destination.lng > 78.46)) {
    // Alternate bypass via PVNR Expressway and Masab Tank
    const waypoints: GeoPoint[] = [
      origin,
      { lat: origin.lat + 0.004, lng: origin.lng - 0.005 },
      { lat: 17.408, lng: 78.448 }, // Masab Tank Elevated Hub
      { lat: 17.418, lng: 78.465 }, // High Ground Punjagutta Link
      { lat: destination.lat - 0.003, lng: destination.lng - 0.002 },
      destination,
    ];

    return {
      id: `route-${Date.now()}`,
      sourceName,
      destinationName,
      origin,
      destination,
      waypoints,
      distanceKm: 11.4,
      estimatedMinutes: 14,
      hasWaterloggedSection: false,
      isAlternateBypass: true,
      corridorType: 'GREEN_CORRIDOR_ELEVATED',
    };
  }

  // Normal Direct Route (or flagged if submerged)
  const waypoints: GeoPoint[] = [
    origin,
    { lat: midLat + 0.002, lng: midLng + 0.003 },
    { lat: midLat - 0.001, lng: midLng - 0.002 },
    destination,
  ];

  return {
    id: `route-direct-${Date.now()}`,
    sourceName,
    destinationName,
    origin,
    destination,
    waypoints,
    distanceKm: 8.2,
    estimatedMinutes: 18,
    hasWaterloggedSection: false,
    isAlternateBypass: false,
    corridorType: 'STANDARD_SURFACE',
  };
}
