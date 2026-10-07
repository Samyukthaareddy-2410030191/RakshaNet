import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  HeartPulse,
  Building2,
  Ambulance as AmbIcon,
  LifeBuoy,
  Shield,
  Eye,
  Info,
  ExternalLink,
  CheckCircle2,
  Navigation,
  Zap,
  Plane,
  Truck,
  Tent,
  ChevronDown,
  ChevronUp,
  CloudRain,
  MapPin,
  Landmark,
  Compass,
  Crosshair,
  Building,
  Filter,
  SlidersHorizontal,
  X,
  Volume2,
  PhoneCall,
  Radio,
  Sparkles,
} from 'lucide-react';
import {
  DisasterZone,
  Hospital,
  Ambulance,
  RescueTeam,
  RoadSegment,
  Shelter,
  SosRequest,
  GeoPoint,
} from '../types';

interface InteractiveMapProps {
  zones: DisasterZone[];
  hospitals: Hospital[];
  ambulances: Ambulance[];
  rescueTeams: RescueTeam[];
  roads: RoadSegment[];
  shelters: Shelter[];
  sosRequests: SosRequest[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string | null) => void;
  activeRoute: {
    origin: GeoPoint;
    destination: GeoPoint;
    label: string;
    isDetour: boolean;
  } | null;
  onOpenOptimizer: () => void;
  onRequestAerialRecon?: () => void;
  onClearSelectedRoad?: () => void;
  onEmergencyShelterSetup?: () => void;
}

// Coordinate projection helper for Greater Hyderabad (GHMC & Outer Ring Road)
// Lat bounds: 17.32 to 17.53
// Lng bounds: 17.32 to 78.56
const BOUNDS = {
  minLat: 17.33,
  maxLat: 17.52,
  minLng: 78.33,
  maxLng: 78.55,
};

// 30 Authentic Major Hyderabad Areas & Localities across all administrative zones
export interface HyderabadLocality {
  id: string;
  name: string;
  category: 'OLD_CITY' | 'CENTRAL' | 'WEST_CYBERABAD' | 'SECUNDERABAD_NORTH' | 'EAST';
  categoryLabel: string;
  coords: GeoPoint;
  subtext: string;
  riskStatus: 'CRITICAL_FLOOD' | 'HIGH_WATERLOG' | 'MODERATE' | 'SAFE_HIGH_GROUND';
  isMajorHub: boolean;
}

export const HYDERABAD_LOCALITIES: HyderabadLocality[] = [
  // Old City / South
  { id: 'loc-charminar', name: 'Charminar', category: 'OLD_CITY', categoryLabel: 'Old City & Heritage Core', coords: { lat: 17.3616, lng: 78.4747 }, subtext: 'Monument & Heritage Core', riskStatus: 'MODERATE', isMajorHub: true },
  { id: 'loc-afzalgunj', name: 'Afzal Gunj / High Court', category: 'OLD_CITY', categoryLabel: 'Old City & Heritage Core', coords: { lat: 17.373, lng: 78.475 }, subtext: 'Osmania General Hospital Area', riskStatus: 'HIGH_WATERLOG', isMajorHub: false },
  { id: 'loc-falaknuma', name: 'Falaknuma', category: 'OLD_CITY', categoryLabel: 'Old City & Heritage Core', coords: { lat: 17.336, lng: 78.468 }, subtext: 'Palace & South Drainage Basin', riskStatus: 'HIGH_WATERLOG', isMajorHub: false },
  { id: 'loc-chandra', name: 'Chandrayangutta / Baba Nagar', category: 'OLD_CITY', categoryLabel: 'Old City & Heritage Core', coords: { lat: 17.345, lng: 78.484 }, subtext: 'Phoolbagh Flood Basin', riskStatus: 'CRITICAL_FLOOD', isMajorHub: false },
  { id: 'loc-bahadurpura', name: 'Bahadurpura & Zoo Park', category: 'OLD_CITY', categoryLabel: 'Old City & Heritage Core', coords: { lat: 17.355, lng: 78.452 }, subtext: 'Mir Alam Tank Catchment', riskStatus: 'HIGH_WATERLOG', isMajorHub: false },
  { id: 'loc-chaderghat', name: 'Chaderghat', category: 'OLD_CITY', categoryLabel: 'Old City & Heritage Core', coords: { lat: 17.376, lng: 78.489 }, subtext: 'Moosi River Causeway Submersion', riskStatus: 'CRITICAL_FLOOD', isMajorHub: true },
  { id: 'loc-moosarambagh', name: 'Moosarambagh', category: 'OLD_CITY', categoryLabel: 'Old City & Heritage Core', coords: { lat: 17.372, lng: 78.502 }, subtext: 'Old Bridge Submerged Area', riskStatus: 'CRITICAL_FLOOD', isMajorHub: false },

  // West & Cyberabad
  { id: 'loc-tolichowki', name: 'Tolichowki & Nadeem Colony', category: 'WEST_CYBERABAD', categoryLabel: 'West & Cyberabad IT Spine', coords: { lat: 17.399, lng: 78.406 }, subtext: 'Shah Hatim Basin - P1 Red Alert', riskStatus: 'CRITICAL_FLOOD', isMajorHub: true },
  { id: 'loc-golconda', name: 'Golconda Fort', category: 'WEST_CYBERABAD', categoryLabel: 'West & Cyberabad IT Spine', coords: { lat: 17.383, lng: 78.401 }, subtext: 'Bada Bazar & Ancient Ramparts', riskStatus: 'MODERATE', isMajorHub: false },
  { id: 'loc-mehdipatnam', name: 'Mehdipatnam', category: 'WEST_CYBERABAD', categoryLabel: 'West & Cyberabad IT Spine', coords: { lat: 17.392, lng: 78.441 }, subtext: 'Rythu Bazar / Transit Junction', riskStatus: 'MODERATE', isMajorHub: false },
  { id: 'loc-banjara', name: 'Banjara Hills', category: 'WEST_CYBERABAD', categoryLabel: 'West & Cyberabad IT Spine', coords: { lat: 17.416, lng: 78.435 }, subtext: 'Road No. 12 High-Ground Ridge', riskStatus: 'SAFE_HIGH_GROUND', isMajorHub: true },
  { id: 'loc-jubilee', name: 'Jubilee Hills', category: 'WEST_CYBERABAD', categoryLabel: 'West & Cyberabad IT Spine', coords: { lat: 17.422, lng: 78.412 }, subtext: 'Checkpost & Apollo Hospital Ridge', riskStatus: 'SAFE_HIGH_GROUND', isMajorHub: false },
  { id: 'loc-madhapur', name: 'Madhapur', category: 'WEST_CYBERABAD', categoryLabel: 'West & Cyberabad IT Spine', coords: { lat: 17.448, lng: 78.391 }, subtext: 'Durgam Cheruvu & Mindspace Hub', riskStatus: 'SAFE_HIGH_GROUND', isMajorHub: false },
  { id: 'loc-hitec', name: 'Hitec City', category: 'WEST_CYBERABAD', categoryLabel: 'West & Cyberabad IT Spine', coords: { lat: 17.450, lng: 78.378 }, subtext: 'Cyber Towers Tech Spine', riskStatus: 'SAFE_HIGH_GROUND', isMajorHub: true },
  { id: 'loc-gachibowli', name: 'Gachibowli', category: 'WEST_CYBERABAD', categoryLabel: 'West & Cyberabad IT Spine', coords: { lat: 17.440, lng: 78.348 }, subtext: 'Stadium & Financial District', riskStatus: 'SAFE_HIGH_GROUND', isMajorHub: false },
  { id: 'loc-kukatpally', name: 'Kukatpally (KPHB)', category: 'WEST_CYBERABAD', categoryLabel: 'West & Cyberabad IT Spine', coords: { lat: 17.493, lng: 78.398 }, subtext: 'High-Density Residential Hub', riskStatus: 'HIGH_WATERLOG', isMajorHub: true },
  { id: 'loc-nizampet', name: 'Nizampet', category: 'WEST_CYBERABAD', categoryLabel: 'West & Cyberabad IT Spine', coords: { lat: 17.499, lng: 78.382 }, subtext: 'Bhandari Layout Inundation', riskStatus: 'HIGH_WATERLOG', isMajorHub: false },
  { id: 'loc-miyapur', name: 'Miyapur', category: 'WEST_CYBERABAD', categoryLabel: 'West & Cyberabad IT Spine', coords: { lat: 17.496, lng: 78.358 }, subtext: 'Metro Terminus Staging Base', riskStatus: 'MODERATE', isMajorHub: false },

  // Central Hyderabad
  { id: 'loc-masabtank', name: 'Masab Tank', category: 'CENTRAL', categoryLabel: 'Central Hyderabad', coords: { lat: 17.408, lng: 78.448 }, subtext: 'High-Ground Relief Hub (2,500 Beds)', riskStatus: 'SAFE_HIGH_GROUND', isMajorHub: true },
  { id: 'loc-khairatabad', name: 'Khairatabad', category: 'CENTRAL', categoryLabel: 'Central Hyderabad', coords: { lat: 17.412, lng: 78.460 }, subtext: 'Bada Ganesh & Secretariat Link', riskStatus: 'MODERATE', isMajorHub: false },
  { id: 'loc-punjagutta', name: 'Punjagutta', category: 'CENTRAL', categoryLabel: 'Central Hyderabad', coords: { lat: 17.425, lng: 78.452 }, subtext: 'NIMS Hospital & Metro Junction', riskStatus: 'MODERATE', isMajorHub: false },
  { id: 'loc-tankbund', name: 'Tank Bund / Secretariat', category: 'CENTRAL', categoryLabel: 'Central Hyderabad', coords: { lat: 17.418, lng: 78.475 }, subtext: 'Hussain Sagar Front & Sluice Gates', riskStatus: 'HIGH_WATERLOG', isMajorHub: true },
  { id: 'loc-abids', name: 'Abids & Koti', category: 'CENTRAL', categoryLabel: 'Central Hyderabad', coords: { lat: 17.388, lng: 78.478 }, subtext: 'Commercial Banking Strip', riskStatus: 'MODERATE', isMajorHub: false },
  { id: 'loc-nampally', name: 'Nampally', category: 'CENTRAL', categoryLabel: 'Central Hyderabad', coords: { lat: 17.394, lng: 78.468 }, subtext: 'Railway Station & Exhibition Grounds', riskStatus: 'MODERATE', isMajorHub: false },

  // Secunderabad & North
  { id: 'loc-secunderabad', name: 'Secunderabad Junction', category: 'SECUNDERABAD_NORTH', categoryLabel: 'Secunderabad & North Basin', coords: { lat: 17.434, lng: 78.501 }, subtext: 'Railway Command & Gandhi Hospital Link', riskStatus: 'MODERATE', isMajorHub: true },
  { id: 'loc-begumpet', name: 'Begumpet', category: 'SECUNDERABAD_NORTH', categoryLabel: 'Secunderabad & North Basin', coords: { lat: 17.444, lng: 78.468 }, subtext: 'Airport Nala & Brahmanwadi', riskStatus: 'HIGH_WATERLOG', isMajorHub: false },
  { id: 'loc-paradise', name: 'Paradise / MG Road', category: 'SECUNDERABAD_NORTH', categoryLabel: 'Secunderabad & North Basin', coords: { lat: 17.441, lng: 78.486 }, subtext: 'Commercial Core & SD Road', riskStatus: 'MODERATE', isMajorHub: false },
  { id: 'loc-marredpally', name: 'Marredpally', category: 'SECUNDERABAD_NORTH', categoryLabel: 'Secunderabad & North Basin', coords: { lat: 17.452, lng: 78.510 }, subtext: 'Cantonment High Ridge', riskStatus: 'SAFE_HIGH_GROUND', isMajorHub: false },
  { id: 'loc-bowenpally', name: 'Bowenpally', category: 'SECUNDERABAD_NORTH', categoryLabel: 'Secunderabad & North Basin', coords: { lat: 17.472, lng: 78.485 }, subtext: 'Hasmathpet Lake Drainage Corridor', riskStatus: 'MODERATE', isMajorHub: false },
  { id: 'loc-alwal', name: 'Alwal & Lothkunta', category: 'SECUNDERABAD_NORTH', categoryLabel: 'Secunderabad & North Basin', coords: { lat: 17.502, lng: 78.508 }, subtext: 'Lake Catchment Depression', riskStatus: 'CRITICAL_FLOOD', isMajorHub: true },

  // East Hyderabad
  { id: 'loc-amberpet', name: 'Amberpet', category: 'EAST', categoryLabel: 'East Hyderabad Corridor', coords: { lat: 17.398, lng: 78.514 }, subtext: 'Cheena Bazar & Ali Cafe', riskStatus: 'MODERATE', isMajorHub: false },
  { id: 'loc-tarnaka', name: 'Tarnaka / Osmania Univ', category: 'EAST', categoryLabel: 'East Hyderabad Corridor', coords: { lat: 17.428, lng: 78.528 }, subtext: 'OU Campus High-Ground Shelter', riskStatus: 'SAFE_HIGH_GROUND', isMajorHub: true },
  { id: 'loc-uppal', name: 'Uppal & Ramanthapur', category: 'EAST', categoryLabel: 'East Hyderabad Corridor', coords: { lat: 17.402, lng: 78.548 }, subtext: 'Cricket Stadium & Pedda Cheruvu', riskStatus: 'HIGH_WATERLOG', isMajorHub: true },
  { id: 'loc-dilsukhnagar', name: 'Dilsukhnagar', category: 'EAST', categoryLabel: 'East Hyderabad Corridor', coords: { lat: 17.368, lng: 78.528 }, subtext: 'Metro Commercial Strip', riskStatus: 'MODERATE', isMajorHub: false },
  { id: 'loc-malakpet', name: 'Malakpet', category: 'EAST', categoryLabel: 'East Hyderabad Corridor', coords: { lat: 17.373, lng: 78.511 }, subtext: 'Yashoda Hospital & Race Course', riskStatus: 'HIGH_WATERLOG', isMajorHub: false },
];

// Simulated Doppler Radar Rainfall Intensity Polygons (Aesthetic semi-transparent radar contours)
interface RainfallPolygon {
  id: string;
  name: string;
  intensityMmHr: number;
  category: 'EXTREME' | 'HEAVY' | 'MODERATE' | 'LIGHT';
  fillColor: string;
  strokeColor: string;
  points: GeoPoint[];
}

const RAINFALL_POLYGONS: RainfallPolygon[] = [
  {
    id: 'rain-zone-1',
    name: 'Sector 4: Tolichowki / Nadeem Basin',
    intensityMmHr: 78,
    category: 'EXTREME',
    fillColor: 'rgba(168, 85, 247, 0.28)', // Purple / Magenta
    strokeColor: '#c084fc',
    points: [
      { lat: 17.412, lng: 78.395 },
      { lat: 17.418, lng: 78.422 },
      { lat: 17.394, lng: 78.428 },
      { lat: 17.382, lng: 78.406 },
      { lat: 17.39, lng: 78.388 },
    ],
  },
  {
    id: 'rain-zone-2',
    name: 'Sector 2: Chaderghat & Moosi Causeway',
    intensityMmHr: 65,
    category: 'HEAVY',
    fillColor: 'rgba(239, 68, 68, 0.24)', // Red
    strokeColor: '#f87171',
    points: [
      { lat: 17.386, lng: 78.468 },
      { lat: 17.389, lng: 78.516 },
      { lat: 17.364, lng: 78.522 },
      { lat: 17.357, lng: 78.478 },
      { lat: 17.369, lng: 78.462 },
    ],
  },
  {
    id: 'rain-zone-3',
    name: 'Sector 7: Alwal Catchment Depression',
    intensityMmHr: 54,
    category: 'HEAVY',
    fillColor: 'rgba(249, 115, 22, 0.22)', // Orange
    strokeColor: '#fb923c',
    points: [
      { lat: 17.518, lng: 78.49 },
      { lat: 17.52, lng: 78.528 },
      { lat: 17.492, lng: 78.532 },
      { lat: 17.484, lng: 78.496 },
    ],
  },
  {
    id: 'rain-zone-4',
    name: 'Sector 5: Amberpet - Begumpet Corridor',
    intensityMmHr: 36,
    category: 'MODERATE',
    fillColor: 'rgba(234, 179, 8, 0.18)', // Yellow / Amber
    strokeColor: '#fde047',
    points: [
      { lat: 17.458, lng: 78.452 },
      { lat: 17.462, lng: 78.494 },
      { lat: 17.422, lng: 78.522 },
      { lat: 17.412, lng: 78.468 },
    ],
  },
  {
    id: 'rain-zone-5',
    name: 'Sector 8: Cyberabad / Hitec Ridge',
    intensityMmHr: 16,
    category: 'LIGHT',
    fillColor: 'rgba(6, 182, 212, 0.15)', // Cyan / Blue
    strokeColor: '#38bdf8',
    points: [
      { lat: 17.446, lng: 78.338 },
      { lat: 17.452, lng: 78.388 },
      { lat: 17.402, lng: 78.396 },
      { lat: 17.394, lng: 78.344 },
    ],
  },
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  zones,
  hospitals,
  ambulances,
  rescueTeams,
  roads,
  shelters,
  sosRequests,
  selectedIncidentId,
  onSelectIncident,
  activeRoute,
  onOpenOptimizer,
  onRequestAerialRecon,
  onClearSelectedRoad,
  onEmergencyShelterSetup,
}) => {
  // Navigation & Zoom State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Floating Dropdown Popovers
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isRadarLegendOpen, setIsRadarLegendOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Selected Locality for Quick-Jump and spotlight beacon
  const [selectedLocalityId, setSelectedLocalityId] = useState<string | null>(null);

  // Density & Region Filter to de-clutter 30 areas
  const [localityDensity, setLocalityDensity] = useState<'HUBS' | 'ALL'>('HUBS');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');

  // Layer filters
  const [showZones, setShowZones] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showAmbulances, setShowAmbulances] = useState(true);
  const [showRescueTeams, setShowRescueTeams] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showSos, setShowSos] = useState(true);
  const [showRainfallHeatmap, setShowRainfallHeatmap] = useState(true);
  const [showLocalities, setShowLocalities] = useState(true);

  // Inspector item
  const [inspectedEntity, setInspectedEntity] = useState<any | null>(null);

  // Toast feedback helper
  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback(null);
    }, 4500);
  };

  const handleAerialRecon = () => {
    showFeedback('🛰️ Aerial Recon UAV Falcon-01 airborne over Sector 4 (Tolichowki / Nadeem Colony). 4K video stream live.');
    setIsQuickActionsOpen(false);
    if (onRequestAerialRecon) onRequestAerialRecon();
  };

  const handleClearRoad = () => {
    showFeedback('🚜 De-watering Squad deployed: Chaderghat Causeway cleared with 500-HP high-discharge pumps.');
    setIsQuickActionsOpen(false);
    if (onClearSelectedRoad) onClearSelectedRoad();
  };

  const handleShelterSetup = () => {
    showFeedback('⛺ Relief Shelter Deployed: Masab Tank High-Ground Hub online (2,500 Beds & Clean Water).');
    setIsQuickActionsOpen(false);
    if (onEmergencyShelterSetup) onEmergencyShelterSetup();
  };

  // Transform lat/lng to canvas/SVG percentage (0 - 100%)
  const project = (point: GeoPoint) => {
    const x = ((point.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
    // Invert lat for screen Y
    const y = (1 - (point.lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, select, input, textarea, a, [role="button"], .no-drag')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoom = (delta: number) => {
    setZoom((prev) => {
      const next = Math.min(3.5, Math.max(0.6, prev + delta));
      return Number(next.toFixed(2));
    });
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedLocalityId(null);
  };

  // Quick Jump to Hyderabad Locality with smooth tactical centering
  const handleJumpToLocality = (localityId: string) => {
    const loc = HYDERABAD_LOCALITIES.find((l) => l.id === localityId);
    if (!loc) {
      setSelectedLocalityId(null);
      return;
    }

    setSelectedLocalityId(loc.id);
    setZoom(1.8);

    // Pan calculation to center this locality on the 100% canvas
    const pt = project(loc.coords);
    const targetPanX = (50 - pt.x) * 6;
    const targetPanY = (50 - pt.y) * 6;

    setPan({ x: targetPanX, y: targetPanY });
    showFeedback(`📍 Tactical Camera Focused: ${loc.name} (${loc.subtext})`);
    setInspectedEntity({ type: 'HYDERABAD_LOCALITY', data: loc });
  };

  // Preset View Quick Switches
  const applyPresetView = (preset: 'OVERVIEW' | 'FLOOD' | 'MEDICAL' | 'RADAR') => {
    if (preset === 'OVERVIEW') {
      setShowZones(true);
      setShowHospitals(true);
      setShowAmbulances(true);
      setShowRescueTeams(true);
      setShowRoads(true);
      setShowShelters(true);
      setShowSos(true);
      setShowRainfallHeatmap(true);
      setShowLocalities(true);
      setLocalityDensity('HUBS');
    } else if (preset === 'FLOOD') {
      setShowZones(true);
      setShowHospitals(false);
      setShowAmbulances(false);
      setShowRescueTeams(true);
      setShowRoads(true);
      setShowShelters(true);
      setShowSos(true);
      setShowRainfallHeatmap(true);
      setShowLocalities(true);
    } else if (preset === 'MEDICAL') {
      setShowZones(false);
      setShowHospitals(true);
      setShowAmbulances(true);
      setShowRescueTeams(true);
      setShowRoads(true);
      setShowShelters(true);
      setShowSos(true);
      setShowRainfallHeatmap(false);
      setShowLocalities(true);
    } else if (preset === 'RADAR') {
      setShowZones(false);
      setShowHospitals(false);
      setShowAmbulances(false);
      setShowRescueTeams(false);
      setShowRoads(false);
      setShowShelters(false);
      setShowSos(false);
      setShowRainfallHeatmap(true);
      setShowLocalities(true);
      setIsRadarLegendOpen(true);
    }
  };

  // Filtered localities according to density and region filter
  const displayedLocalities = useMemo(() => {
    return HYDERABAD_LOCALITIES.filter((loc) => {
      // Region filter
      if (selectedRegionFilter !== 'ALL' && loc.category !== selectedRegionFilter) {
        return false;
      }
      // Density filter: if HUBS mode, show if isMajorHub or currently selected or if user is zoomed in > 1.4x
      if (localityDensity === 'HUBS' && zoom < 1.4) {
        return loc.isMajorHub || selectedLocalityId === loc.id;
      }
      return true;
    });
  }, [localityDensity, selectedRegionFilter, zoom, selectedLocalityId]);

  // Count active layers for badge
  const activeLayerCount = [
    showLocalities,
    showZones,
    showSos,
    showHospitals,
    showAmbulances,
    showRoads,
    showShelters,
    showRainfallHeatmap,
  ].filter(Boolean).length;

  return (
    <div className="relative w-full h-[660px] bg-slate-950 overflow-hidden select-none border border-slate-800 rounded-2xl shadow-2xl flex">
      {/* Tactical Canvas Area */}
      <div
        className="relative flex-1 h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={(e) => {
          handleZoom(e.deltaY < 0 ? 0.2 : -0.2);
        }}
      >
        {/* Transform container */}
        <div
          className="absolute inset-0 transition-transform duration-100"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
          }}
        >
          {/* Base Tactical Grid Background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tacticalGrid)" />
          </svg>

          {/* Hyderabad Major Waterbodies & River Courses (SVG Vector GIS Basemap) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="moosiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#ef4444" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
              </linearGradient>
              <radialGradient id="lakeGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#082f49" stopOpacity="0.25" />
              </radialGradient>
            </defs>

            {/* Hussain Sagar Lake (Tank Bund & Buddha Statue) */}
            <path
              d="M 62 43 C 65 40, 69 42, 68 47 C 67 51, 63 52, 61 49 C 60 46, 61 44, 62 43 Z"
              fill="url(#lakeGrad)"
              stroke="#0284c7"
              strokeWidth="0.8"
            />
            <text x="64.5" y="46.5" fontSize="1.3" fill="#38bdf8" textAnchor="middle" className="font-mono font-bold select-none opacity-90">
              Hussain Sagar
            </text>

            {/* Mir Alam Tank (South/Zoo Park) */}
            <path
              d="M 52 79 C 55 77, 57 79, 56 83 C 54 85, 50 84, 51 81 Z"
              fill="url(#lakeGrad)"
              stroke="#0284c7"
              strokeWidth="0.7"
            />
            <text x="53.5" y="82.5" fontSize="1.1" fill="#38bdf8" textAnchor="middle" className="font-mono select-none opacity-80">
              Mir Alam Tank
            </text>

            {/* Durgam Cheruvu (Madhapur / Cable Bridge) */}
            <path
              d="M 28 35 C 31 33, 33 36, 31 39 C 29 40, 27 38, 28 35 Z"
              fill="url(#lakeGrad)"
              stroke="#0284c7"
              strokeWidth="0.7"
            />
            <text x="30" y="37.5" fontSize="1.1" fill="#38bdf8" textAnchor="middle" className="font-mono select-none opacity-80">
              Durgam Cheruvu
            </text>

            {/* Osman Sagar / Gandipet Reservoir (West Outflow) */}
            <ellipse cx="9" cy="62" rx="6" ry="4.5" fill="url(#lakeGrad)" stroke="#0284c7" strokeWidth="0.8" />
            <text x="9" y="63" fontSize="1.2" fill="#38bdf8" textAnchor="middle" className="font-mono select-none opacity-80">
              Gandipet
            </text>

            {/* Moosi River Basin Trajectory (Flows West to East) */}
            <path
              d="M 4 64 C 20 66, 36 68, 48 71 C 58 73, 68 72, 78 74 C 88 75, 96 76, 100 77"
              fill="none"
              stroke="url(#moosiGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />

            {/* Outer Ring Road (ORR) Express Perimeter Outline */}
            <ellipse
              cx="50"
              cy="52"
              rx="46"
              ry="44"
              fill="none"
              stroke="#334155"
              strokeWidth="1.2"
              strokeDasharray="4,2"
              className="opacity-40"
            />
            <text x="14" y="40" fontSize="1.2" fill="#64748b" textAnchor="middle" className="font-mono select-none">
              ORR Express Corridor
            </text>

            {/* Moosi Course Label */}
            <text x="54" y="74.5" fontSize="1.3" fill="#38bdf8" textAnchor="middle" className="font-mono font-semibold select-none opacity-90">
              ~ Moosi River Course (Inundation Danger) ~
            </text>
          </svg>

          {/* Simulated Rainfall Intensity Heatmap Polygons */}
          {showRainfallHeatmap && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <radialGradient id="radarPulse" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </radialGradient>
              </defs>
              {RAINFALL_POLYGONS.map((poly) => {
                const pointsString = poly.points
                  .map((p) => {
                    const pt = project(p);
                    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                  })
                  .join(' ');

                const centerPt = project({
                  lat: poly.points.reduce((sum, p) => sum + p.lat, 0) / poly.points.length,
                  lng: poly.points.reduce((sum, p) => sum + p.lng, 0) / poly.points.length,
                });

                return (
                  <g key={poly.id}>
                    <polygon
                      points={pointsString}
                      fill={poly.fillColor}
                      stroke={poly.strokeColor}
                      strokeWidth="0.7"
                      strokeDasharray="2.5,1.5"
                    />
                    <circle
                      cx={centerPt.x}
                      cy={centerPt.y}
                      r="1.1"
                      fill={poly.strokeColor}
                      className="animate-ping"
                      opacity="0.5"
                    />
                    <circle
                      cx={centerPt.x}
                      cy={centerPt.y}
                      r="0.8"
                      fill={poly.strokeColor}
                    />
                    <text
                      x={centerPt.x}
                      y={centerPt.y + 2.5}
                      fill={poly.strokeColor}
                      fontSize="1.2"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                      className="select-none"
                    >
                      {poly.intensityMmHr} mm/h
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Road Network Vectors */}
          {showRoads && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {roads.map((road) => {
                const p1 = project(road.start);
                const p2 = project(road.end);
                const isBlocked = road.status === 'BLOCKED_SUBMERGED';
                const isCongested = road.status === 'CONGESTED';

                return (
                  <g key={road.id}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={isBlocked ? '#ef4444' : isCongested ? '#f59e0b' : '#10b981'}
                      strokeWidth={isBlocked ? '1.8' : '1.2'}
                      strokeDasharray={isBlocked ? '3,2' : undefined}
                      opacity={isBlocked ? 0.95 : 0.75}
                    />
                    {isBlocked && (
                      <circle
                        cx={(p1.x + p2.x) / 2}
                        cy={(p1.y + p2.y) / 2}
                        r="1.4"
                        fill="#ef4444"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Active Ambulance / Emergency Dispatch Trajectory Polyline */}
          {activeRoute && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {(() => {
                const o = project(activeRoute.origin);
                const d = project(activeRoute.destination);
                return (
                  <g>
                    <line
                      x1={o.x}
                      y1={o.y}
                      x2={d.x}
                      y2={d.y}
                      stroke="#f59e0b"
                      strokeWidth="2.2"
                      strokeDasharray="4,2"
                      className="animate-pulse"
                    />
                    <circle cx={o.x} cy={o.y} r="1.5" fill="#10b981" />
                    <circle cx={d.x} cy={d.y} r="1.5" fill="#f59e0b" />
                  </g>
                );
              })()}
            </svg>
          )}

          {/* Authentic Hyderabad Localities (Clean Minimal GIS Cartography) */}
          {showLocalities &&
            displayedLocalities.map((loc) => {
              const pos = project(loc.coords);
              const isSelected = selectedLocalityId === loc.id;
              const isHub = loc.isMajorHub;

              return (
                <div
                  key={loc.id}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLocalityId(loc.id);
                    setInspectedEntity({ type: 'HYDERABAD_LOCALITY', data: loc });
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-15 group no-drag select-none"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {/* Spotlight Targeting Ring when selected */}
                  {isSelected && (
                    <span className="absolute -inset-2.5 rounded-full border-2 border-amber-400 bg-amber-400/20 animate-ping pointer-events-none" />
                  )}

                  <div className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full transition-all duration-150 ${
                        isSelected
                          ? 'bg-amber-400 scale-150 shadow-[0_0_10px_#fbbf24]'
                          : isHub
                          ? 'bg-amber-400/90 shadow-[0_0_6px_rgba(251,191,36,0.6)] group-hover:scale-125'
                          : 'bg-slate-400/70 group-hover:bg-amber-300 group-hover:scale-125'
                      }`}
                    />
                    <span
                      className={`text-[9.5px] font-sans tracking-tight transition select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] whitespace-nowrap ${
                        isSelected
                          ? 'text-amber-300 font-bold bg-slate-950/95 px-2 py-0.5 rounded-md border border-amber-500 shadow-xl'
                          : isHub
                          ? 'text-slate-200 font-semibold bg-slate-950/70 px-1.5 py-0.2 rounded border border-slate-700/60 group-hover:text-amber-200'
                          : 'text-slate-300/80 group-hover:text-amber-200 group-hover:font-semibold'
                      }`}
                    >
                      {loc.name}
                    </span>
                  </div>

                  {/* Clean Hover Telemetry Card */}
                  <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-950/95 border border-slate-700/90 text-[10px] text-slate-200 whitespace-nowrap rounded-lg font-sans z-30 shadow-2xl backdrop-blur-md">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span>{loc.name}</span>
                      <span className="text-[9px] text-slate-400 font-normal">({loc.category})</span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{loc.subtext}</div>
                  </div>
                </div>
              );
            })}

          {/* Flood Inundation Zones (Clean Tactical GIS Contour Styling) */}
          {showZones &&
            zones.map((zone) => {
              const pos = project(zone.center);
              const isCrit = zone.severity === 'CRITICAL';
              return (
                <div
                  key={zone.id}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectedEntity({ type: 'DISASTER_ZONE', data: zone });
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group no-drag"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {/* Glowing translucent GIS contour circle */}
                  <div
                    className={`rounded-full transition duration-300 ${
                      isCrit
                        ? 'border border-red-500/60 shadow-[0_0_24px_rgba(239,68,68,0.3)] animate-pulse'
                        : zone.severity === 'HIGH'
                        ? 'border border-orange-500/50 shadow-[0_0_18px_rgba(249,115,22,0.25)]'
                        : 'border border-yellow-500/40 shadow-[0_0_14px_rgba(234,179,8,0.2)]'
                    }`}
                    style={{
                      width: `${Math.max(48, (zone.radiusMeters / 1500) * 85)}px`,
                      height: `${Math.max(48, (zone.radiusMeters / 1500) * 85)}px`,
                      background: isCrit
                        ? 'radial-gradient(circle, rgba(239, 68, 68, 0.26) 0%, rgba(239, 68, 68, 0.08) 70%, transparent 100%)'
                        : zone.severity === 'HIGH'
                        ? 'radial-gradient(circle, rgba(249, 115, 22, 0.22) 0%, rgba(249, 115, 22, 0.06) 70%, transparent 100%)'
                        : 'radial-gradient(circle, rgba(234, 179, 8, 0.18) 0%, rgba(234, 179, 8, 0.04) 70%, transparent 100%)',
                    }}
                  />
                  {/* Clean Dark Tactical HUD Label (No garish white boxes) */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-[9px] font-mono font-bold text-rose-200 bg-slate-950/85 border border-rose-500/50 px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                      <span>{zone.name.split('&')[0].trim()}</span>
                    </span>
                  </div>
                </div>
              );
            })}

          {/* Shelters */}
          {showShelters &&
            shelters.map((shelter) => {
              const pos = project(shelter.location);
              return (
                <div
                  key={shelter.id}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectedEntity({ type: 'SHELTER', data: shelter });
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-25 group no-drag"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className="w-6 h-6 rounded-md bg-purple-950 border border-purple-400 text-purple-300 flex items-center justify-center shadow-lg group-hover:scale-125 transition">
                    <Tent className="w-3.5 h-3.5" />
                  </div>
                  <div className="hidden group-hover:block absolute bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-purple-400 text-[10px] text-purple-200 whitespace-nowrap rounded font-mono z-30 shadow-xl">
                    {shelter.name}
                  </div>
                </div>
              );
            })}

          {/* Hospitals */}
          {showHospitals &&
            hospitals.map((hosp) => {
              const pos = project(hosp.location);
              const isOverloaded = hosp.status === 'CRITICAL_OVERLOAD';
              return (
                <div
                  key={hosp.id}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectedEntity({ type: 'HOSPITAL', data: hosp });
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group no-drag"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shadow-lg transition group-hover:scale-125 ${
                      isOverloaded
                        ? 'bg-red-950 border-red-500 text-red-400 animate-bounce'
                        : 'bg-emerald-950 border-emerald-400 text-emerald-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="hidden group-hover:block absolute top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-slate-700 text-[10px] text-slate-200 whitespace-nowrap rounded font-mono z-30 shadow-xl">
                    {hosp.name} [{Math.round((hosp.occupiedBeds / hosp.totalBeds) * 100)}% Saturation]
                  </div>
                </div>
              );
            })}

          {/* Rescue Teams */}
          {showRescueTeams &&
            rescueTeams.map((team) => {
              const pos = project(team.location);
              return (
                <div
                  key={team.id}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectedEntity({ type: 'RESCUE_TEAM', data: team });
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-25 group no-drag"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg group-hover:scale-125 transition">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div className="hidden group-hover:block absolute top-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-cyan-400 text-[10px] text-cyan-200 whitespace-nowrap rounded font-mono z-30 shadow-xl">
                    {team.callSign} ({team.personnelCount} personnel)
                  </div>
                </div>
              );
            })}

          {/* Ambulances */}
          {showAmbulances &&
            ambulances.map((amb) => {
              const pos = project(amb.location);
              const isDispatched = amb.status === 'DISPATCHED';
              return (
                <div
                  key={amb.id}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectedEntity({ type: 'AMBULANCE', data: amb });
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-35 group no-drag"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div
                    className={`w-7 h-7 rounded-md border flex items-center justify-center shadow-lg transition group-hover:scale-125 ${
                      isDispatched
                        ? 'bg-amber-950 border-amber-400 text-amber-300 animate-bounce'
                        : 'bg-slate-900 border-slate-600 text-slate-300'
                    }`}
                  >
                    <AmbIcon className="w-4 h-4" />
                  </div>
                  <div className="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-amber-400 text-[10px] text-amber-200 whitespace-nowrap rounded font-mono z-40 shadow-xl">
                    {amb.callSign} [{amb.type}] - {amb.status}
                  </div>
                </div>
              );
            })}

          {/* Citizen SOS Beacons */}
          {showSos &&
            sosRequests.map((sos) => {
              const pos = project(sos.location);
              const isP1 = sos.priority === 'P1';
              return (
                <div
                  key={sos.id}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIncident(sos.id);
                    setInspectedEntity({ type: 'SOS', data: sos });
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-40 group no-drag"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {isP1 && (
                    <span className="absolute -inset-2.5 rounded-full bg-red-600 opacity-75 animate-ping" />
                  )}
                  <div
                    className={`relative w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-2xl transition group-hover:scale-125 font-mono text-[10px] font-bold ${
                      isP1
                        ? 'bg-red-600 text-white border-white shadow-red-500/50'
                        : 'bg-amber-500 text-slate-950 border-slate-900'
                    }`}
                  >
                    <HeartPulse className="w-4 h-4" />
                  </div>

                  <div className="absolute top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-950/95 border border-red-500/70 text-[9px] font-mono text-red-300 whitespace-nowrap shadow-lg">
                    {sos.priority} | {sos.victimCount} victims
                  </div>
                </div>
              );
            })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* UNIFIED TOP COMMAND HUD: Single Organized, Glassmorphic Bar */}
        {/* ------------------------------------------------------------- */}
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute top-3 left-3 right-3 z-40 flex flex-wrap items-center justify-between gap-2 bg-slate-950/90 border border-slate-800/90 p-2 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-sans no-drag select-none"
        >
          {/* Left: Hyderabad Locality Selector & Density Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-750 rounded-xl px-2.5 py-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={selectedLocalityId || ''}
                onChange={(e) => handleJumpToLocality(e.target.value)}
                className="bg-transparent text-slate-100 text-xs font-sans outline-none cursor-pointer max-w-[185px] sm:max-w-[220px]"
              >
                <option value="" className="bg-slate-900 text-slate-300">
                  Jump to Hyderabad Area (30 Areas)...
                </option>
                <optgroup label="🏛️ Old City & Heritage Core" className="bg-slate-900 text-slate-200">
                  <option value="loc-charminar">Charminar (Heritage Core)</option>
                  <option value="loc-afzalgunj">Afzal Gunj / Osmania Hospital</option>
                  <option value="loc-chaderghat">Chaderghat & Moosi Causeway</option>
                  <option value="loc-moosarambagh">Moosarambagh Old Bridge</option>
                  <option value="loc-falaknuma">Falaknuma Palace Basin</option>
                  <option value="loc-chandra">Chandrayangutta / Baba Nagar</option>
                  <option value="loc-bahadurpura">Bahadurpura / Zoo Park</option>
                </optgroup>
                <optgroup label="💻 West & Cyberabad IT Spine" className="bg-slate-900 text-slate-200">
                  <option value="loc-tolichowki">Tolichowki & Nadeem Colony (P1 Red Alert)</option>
                  <option value="loc-golconda">Golconda Fort Bada Bazar</option>
                  <option value="loc-mehdipatnam">Mehdipatnam Rythu Bazar</option>
                  <option value="loc-banjara">Banjara Hills Road #12</option>
                  <option value="loc-jubilee">Jubilee Hills Checkpost</option>
                  <option value="loc-hitec">Hitec City Cyber Towers</option>
                  <option value="loc-madhapur">Madhapur Durgam Cheruvu</option>
                  <option value="loc-gachibowli">Gachibowli Financial District</option>
                  <option value="loc-kukatpally">Kukatpally (KPHB)</option>
                  <option value="loc-nizampet">Nizampet Bhandari Layout</option>
                  <option value="loc-miyapur">Miyapur Metro Staging</option>
                </optgroup>
                <optgroup label="🏢 Central Hyderabad" className="bg-slate-900 text-slate-200">
                  <option value="loc-masabtank">Masab Tank Relief Hub (High Ground)</option>
                  <option value="loc-khairatabad">Khairatabad Bada Ganesh</option>
                  <option value="loc-tankbund">Tank Bund / Hussain Sagar</option>
                  <option value="loc-punjagutta">Punjagutta NIMS Hospital</option>
                  <option value="loc-abids">Abids & Koti</option>
                  <option value="loc-nampally">Nampally Station</option>
                </optgroup>
                <optgroup label="🚆 Secunderabad & North" className="bg-slate-900 text-slate-200">
                  <option value="loc-secunderabad">Secunderabad Junction / Gandhi Hosp</option>
                  <option value="loc-begumpet">Begumpet Airport Nala</option>
                  <option value="loc-paradise">Paradise & SD Road</option>
                  <option value="loc-marredpally">Marredpally Cantonment</option>
                  <option value="loc-bowenpally">Bowenpally Checkpost</option>
                  <option value="loc-alwal">Alwal & Lothkunta Basin</option>
                </optgroup>
                <optgroup label="🌳 East Hyderabad" className="bg-slate-900 text-slate-200">
                  <option value="loc-amberpet">Amberpet Cheena Bazar</option>
                  <option value="loc-tarnaka">Tarnaka / Osmania University</option>
                  <option value="loc-uppal">Uppal Stadium & Pedda Cheruvu</option>
                  <option value="loc-dilsukhnagar">Dilsukhnagar Metro</option>
                  <option value="loc-malakpet">Malakpet Yashoda Hospital</option>
                </optgroup>
              </select>
            </div>

            {/* Density Toggle (Major Hubs vs All 30 Localities) */}
            <div className="hidden sm:flex items-center bg-slate-900/90 border border-slate-750 rounded-xl p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setLocalityDensity('HUBS')}
                className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
                  localityDensity === 'HUBS'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Show 12 Major Landmark Hubs (Clean un-cluttered view)"
              >
                Key Hubs
              </button>
              <button
                type="button"
                onClick={() => setLocalityDensity('ALL')}
                className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
                  localityDensity === 'ALL'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Show All 30 Hyderabad Areas"
              >
                All 30
              </button>
            </div>
          </div>

          {/* Center: Tactical View Presets */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1 text-[11px]">
            <button
              type="button"
              onClick={() => applyPresetView('OVERVIEW')}
              className="px-2.5 py-0.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => applyPresetView('FLOOD')}
              className="px-2.5 py-0.5 rounded-lg text-rose-300 hover:bg-slate-800 hover:text-rose-200 transition cursor-pointer flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Floods</span>
            </button>
            <button
              type="button"
              onClick={() => applyPresetView('MEDICAL')}
              className="px-2.5 py-0.5 rounded-lg text-emerald-300 hover:bg-slate-800 hover:text-emerald-200 transition cursor-pointer flex items-center gap-1"
            >
              <HeartPulse className="w-3 h-3 text-emerald-400" />
              <span>Medical & SOS</span>
            </button>
            <button
              type="button"
              onClick={() => applyPresetView('RADAR')}
              className="px-2.5 py-0.5 rounded-lg text-cyan-300 hover:bg-slate-800 hover:text-cyan-200 transition cursor-pointer flex items-center gap-1"
            >
              <CloudRain className="w-3 h-3 text-cyan-400" />
              <span>Radar</span>
            </button>
          </div>

          {/* Right: Layers Popover + Fast Actions + Tactile Zoom Controls */}
          <div className="flex items-center gap-1.5">
            {/* Layers Dropdown Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsLayersOpen(!isLayersOpen);
                  setIsQuickActionsOpen(false);
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  isLayersOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-750'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Layers ({activeLayerCount})</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLayersOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Layer Menu */}
              {isLayersOpen && (
                <div className="absolute right-0 top-10 w-64 bg-slate-950/98 border border-slate-750 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in duration-150 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    <span>Tactical GIS Layers</span>
                    <button
                      type="button"
                      onClick={() => setIsLayersOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    {[
                      { label: `Hyderabad Localities (${HYDERABAD_LOCALITIES.length})`, active: showLocalities, toggle: () => setShowLocalities(!showLocalities) },
                      { label: 'Flood Inundation Contours', active: showZones, toggle: () => setShowZones(!showZones) },
                      { label: 'Citizen SOS Distress Beacons', active: showSos, toggle: () => setShowSos(!showSos) },
                      { label: 'Hospitals & Trauma Centers', active: showHospitals, toggle: () => setShowHospitals(!showHospitals) },
                      { label: 'Ambulances & ALS Units', active: showAmbulances, toggle: () => setShowAmbulances(!showAmbulances) },
                      { label: 'Road Infrastructure & Blockages', active: showRoads, toggle: () => setShowRoads(!showRoads) },
                      { label: 'High-Ground Relief Shelters', active: showShelters, toggle: () => setShowShelters(!showShelters) },
                      { label: 'Doppler Radar Precipitation', active: showRainfallHeatmap, toggle: () => setShowRainfallHeatmap(!showRainfallHeatmap) },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={item.toggle}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition cursor-pointer text-left ${
                          item.active
                            ? 'bg-slate-850 text-amber-300 font-semibold border border-amber-500/40'
                            : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className={`w-2 h-2 rounded-full ${item.active ? 'bg-amber-400' : 'bg-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tactical Actions Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsQuickActionsOpen(!isQuickActionsOpen);
                  setIsLayersOpen(false);
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  isQuickActionsOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-750'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Actions</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Fast Actions Dropdown */}
              {isQuickActionsOpen && (
                <div className="absolute right-0 top-10 w-72 bg-slate-950/98 border border-slate-750 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in duration-150 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    <span>Tactical Fast Actions</span>
                    <button
                      type="button"
                      onClick={() => setIsQuickActionsOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAerialRecon}
                    className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Plane className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-100 text-[11px]">Request Aerial Recon UAV</div>
                      <div className="text-[10px] text-slate-400">Deploy thermal drone over Sector 4</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearRoad}
                    className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500 text-slate-200 text-xs flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-100 text-[11px]">Clear Chaderghat Causeway</div>
                      <div className="text-[10px] text-slate-400">Activate 500-HP high-discharge pumps</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleShelterSetup}
                    className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500 text-slate-200 text-xs flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Tent className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-100 text-[11px]">Setup Masab Tank Shelter</div>
                      <div className="text-[10px] text-slate-400">Deploy 2,500 beds & clean water</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Tactical Zoom Dock */}
            <div className="flex items-center bg-slate-900/90 border border-slate-750 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => handleZoom(-0.3)}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-[10px] font-mono text-amber-300 font-bold">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => handleZoom(0.3)}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300 flex items-center justify-center transition cursor-pointer ml-0.5"
                title="Reset View"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Acknowledgement Toast Banner */}
        {actionFeedback && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-18 left-1/2 -translate-x-1/2 p-2.5 px-4 rounded-xl bg-slate-950/98 border border-amber-500/90 text-amber-200 text-xs shadow-2xl animate-in fade-in duration-150 backdrop-blur-xl z-50 flex items-center gap-2 max-w-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
            <span className="font-mono text-[11px] leading-tight">{actionFeedback}</span>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-slate-400 hover:text-white ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Sleek Collapsible Doppler Radar Legend (Docked cleanly bottom-right) */}
        {/* ------------------------------------------------------------- */}
        {showRainfallHeatmap && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute bottom-3.5 right-3.5 z-40 no-drag select-none"
          >
            {isRadarLegendOpen ? (
              <div className="bg-slate-950/95 border border-purple-500/60 rounded-xl p-2.5 backdrop-blur-md font-mono text-[10px] space-y-1.5 shadow-2xl w-60 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-purple-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-purple-400" />
                    <span>DOPPLER RADAR SCALE</span>
                  </span>
                  <button
                    onClick={() => setIsRadarLegendOpen(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                      <span>&gt; 70 mm/h</span>
                    </span>
                    <span className="text-purple-400 font-bold">EXTREME</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                      <span>50 - 70 mm/h</span>
                    </span>
                    <span className="text-red-400 font-bold">HEAVY</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
                      <span>35 - 50 mm/h</span>
                    </span>
                    <span className="text-orange-400 font-bold">MODERATE</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                      <span>&lt; 20 mm/h</span>
                    </span>
                    <span className="text-cyan-400 font-bold">LIGHT</span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsRadarLegendOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-purple-500/60 text-purple-300 font-mono text-[10px] shadow-xl backdrop-blur-md transition cursor-pointer"
              >
                <CloudRain className="w-3 h-3 text-purple-400" />
                <span>Radar: 16 - 78 mm/h</span>
                <ChevronUp className="w-3 h-3 text-purple-400" />
              </button>
            )}
          </div>
        )}

        {/* Tactical Coordinates HUD at bottom-left */}
        <div className="absolute bottom-3.5 left-3.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1 text-[10px] font-mono text-slate-400 z-30 hidden md:flex items-center gap-2 backdrop-blur-sm pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>GREATER HYDERABAD (GHMC)</span>
          <span className="text-slate-600">|</span>
          <span>WGS84 17.3850° N, 78.4867° E</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 360-DEGREE SIDE INSPECTOR DRAWER (Comprehensive Telemetry)    */}
      {/* ------------------------------------------------------------- */}
      {inspectedEntity && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="w-80 h-full bg-slate-900/98 border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto z-40 animate-in slide-in-from-right duration-200 no-drag backdrop-blur-xl shadow-2xl"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>{inspectedEntity.type.replace('_', ' ')} TELEMETRY</span>
              </span>
              <button
                onClick={() => setInspectedEntity(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 1. Locality Telemetry */}
            {inspectedEntity.type === 'HYDERABAD_LOCALITY' && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>{inspectedEntity.data.name}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    {inspectedEntity.data.subtext}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Zone Division:</span>
                    <span className="text-cyan-300 font-bold">{inspectedEntity.data.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flood Assessment:</span>
                    <span
                      className={`font-bold ${
                        inspectedEntity.data.riskStatus === 'CRITICAL_FLOOD'
                          ? 'text-red-400'
                          : inspectedEntity.data.riskStatus === 'SAFE_HIGH_GROUND'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {inspectedEntity.data.riskStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS Coordinates:</span>
                    <span className="text-slate-300">
                      {inspectedEntity.data.coords.lat.toFixed(4)}°N, {inspectedEntity.data.coords.lng.toFixed(4)}°E
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleJumpToLocality(inspectedEntity.data.id)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Center Tactical View Here</span>
                </button>
              </div>
            )}

            {/* 2. Disaster Zone Telemetry */}
            {inspectedEntity.type === 'DISASTER_ZONE' && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>{inspectedEntity.data.name}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    District: {inspectedEntity.data.district}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flood Inundation Risk:</span>
                    <span className="text-red-400 font-bold">{inspectedEntity.data.floodProbabilityPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Water Depth:</span>
                    <span className="text-amber-300 font-bold">{inspectedEntity.data.waterLevelMeters} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Affected Population:</span>
                    <span className="text-slate-200 font-bold">{inspectedEntity.data.affectedPopulation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Road Passability:</span>
                    <span className="text-cyan-300 font-bold">{inspectedEntity.data.roadAccessScorePct}%</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 mb-1 font-bold">Key Hazards & Obstacles:</div>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
                    {inspectedEntity.data.keyHazards.map((h: string, idx: number) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 3. Hospital Telemetry */}
            {inspectedEntity.type === 'HOSPITAL' && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>{inspectedEntity.data.name}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {inspectedEntity.data.address}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bed Occupancy:</span>
                    <span className="text-amber-400 font-bold">
                      {inspectedEntity.data.occupiedBeds} / {inspectedEntity.data.totalBeds} (
                      {Math.round((inspectedEntity.data.occupiedBeds / inspectedEntity.data.totalBeds) * 100)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trauma ICU Free:</span>
                    <span className="text-red-400 font-bold">{inspectedEntity.data.icuBedsAvailable} Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Oxygen Buffer:</span>
                    <span className="text-cyan-300">{inspectedEntity.data.oxygenSupplyHours} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Blood Units:</span>
                    <span className="text-slate-200">{inspectedEntity.data.bloodUnitsAvailable} packs</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Ambulance Telemetry */}
            {inspectedEntity.type === 'AMBULANCE' && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-base font-bold text-amber-400 flex items-center gap-1.5">
                    <AmbIcon className="w-4 h-4" />
                    <span>{inspectedEntity.data.callSign}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Type: {inspectedEntity.data.type} • Status: {inspectedEntity.data.status}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Crew:</span>
                    <span className="text-slate-200">{inspectedEntity.data.crewName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fuel Level:</span>
                    <span className="text-emerald-400 font-bold">{inspectedEntity.data.fuelPct}%</span>
                  </div>
                  {inspectedEntity.data.currentEtaMinutes && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">ETA to Destination:</span>
                      <span className="text-amber-400 font-bold">{inspectedEntity.data.currentEtaMinutes} mins</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Rescue Team Telemetry */}
            {inspectedEntity.type === 'RESCUE_TEAM' && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-base font-bold text-cyan-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span>{inspectedEntity.data.callSign}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Sector: {inspectedEntity.data.assignedSector} • Status: {inspectedEntity.data.status}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Team Personnel:</span>
                    <span className="text-slate-200 font-bold">{inspectedEntity.data.personnelCount} Commandos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Boats & Rafts:</span>
                    <span className="text-cyan-300 font-bold">{inspectedEntity.data.boatCapacity} Inflated Crafts</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 mb-1 font-bold">Equipment Onboard:</div>
                  <div className="flex flex-wrap gap-1">
                    {inspectedEntity.data.equipment?.map((eq: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. Relief Shelter Telemetry */}
            {inspectedEntity.type === 'SHELTER' && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-base font-bold text-purple-300 flex items-center gap-1.5">
                    <Tent className="w-4 h-4" />
                    <span>{inspectedEntity.data.name}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    High Ground Elevation: {inspectedEntity.data.elevationMeters}m
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Occupancy:</span>
                    <span className="text-purple-300 font-bold">
                      {inspectedEntity.data.currentOccupancy} / {inspectedEntity.data.capacity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clean Water Rations:</span>
                    <span className="text-emerald-400 font-bold">{inspectedEntity.data.foodWaterStockHours} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Medical Tent:</span>
                    <span className="text-cyan-300 font-bold">Operational</span>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Citizen SOS Telemetry */}
            {inspectedEntity.type === 'SOS' && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-base font-bold text-red-400 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4" />
                    <span>{inspectedEntity.data.trackingCode}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Reported by: {inspectedEntity.data.citizenName} ({inspectedEntity.data.mobile})
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Urgency Level:</span>
                    <span className="text-red-400 font-bold">{inspectedEntity.data.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Victim Count:</span>
                    <span className="text-slate-100 font-bold">{inspectedEntity.data.victimCount} People</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Field Address:</span>
                    <span className="text-slate-300">{inspectedEntity.data.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ML Trust Score:</span>
                    <span className="text-emerald-400 font-bold">{inspectedEntity.data.trustScore}% Verified</span>
                  </div>
                </div>

                {inspectedEntity.data.voiceTranscript && (
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-amber-500/40 text-[11px] text-amber-200 italic">
                    "{inspectedEntity.data.voiceTranscript}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={onOpenOptimizer}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recalculate Dynamic Dispatch</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
