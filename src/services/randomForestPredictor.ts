export interface FeatureImportance {
  feature: string;
  weightPct: number;
  description: string;
}

export interface ZoneRiskPrediction {
  zoneId: string;
  zoneName: string;
  floodRiskPct: number;
  roadAccessibilityPct: number;
  hospitalOverloadRiskPct: number;
  waterDemandSurgePct: number;
  confidencePct: number;
  primaryRiskDrivers: string[];
  recommendedPreparation: string;
}

export const FEATURE_IMPORTANCES: FeatureImportance[] = [
  { feature: 'Hourly Rainfall Rate (IMD Doppler Radar)', weightPct: 32, description: 'Precipitation volume exceeding 45 mm/hr saturation threshold' },
  { feature: 'Contour Elevation & Digital Elevation Model (DEM)', weightPct: 24, description: 'Depression basin relative to Moosi river median level' },
  { feature: 'Drainage Culvert & Nala Discharge Capacity', weightPct: 19, description: 'Discharge volumetric flow vs silt blockage coefficient' },
  { feature: 'Settlement & Population Density (Census GIS)', weightPct: 15, description: 'Dense urban settlements with high impermeable concrete area' },
  { feature: 'Historical Monsoon Inundation (2000-2025 Data)', weightPct: 10, description: 'Empirical recurrence frequency in severe flood events' },
];

export function predictZoneRisks(rainfallModifier: number = 1.0): ZoneRiskPrediction[] {
  // Simulates Random Forest Ensemble (100 Decision Trees with Gini impurity split)
  return [
    {
      zoneId: 'zone-hyd-01',
      zoneName: 'Nadeem Colony & Tolichowki',
      floodRiskPct: Math.min(99, Math.round(92 * rainfallModifier)),
      roadAccessibilityPct: Math.max(8, Math.round(22 / rainfallModifier)),
      hospitalOverloadRiskPct: Math.min(95, Math.round(88 * rainfallModifier)),
      waterDemandSurgePct: Math.min(96, Math.round(78 * rainfallModifier)),
      confidencePct: 94,
      primaryRiskDrivers: [
        'Shah Hatim Talab surplus nala backflow',
        'Topographical depression (Elevation: 512m MSL)',
        'Heavy runoff from Jubilee Hills ridges',
      ],
      recommendedPreparation: 'Immediate NDRF boat staging; preemptive power feeder trip to prevent electrocution.',
    },
    {
      zoneId: 'zone-hyd-02',
      zoneName: 'Chaderghat & Moosi Embankment',
      floodRiskPct: Math.min(99, Math.round(89 * rainfallModifier)),
      roadAccessibilityPct: Math.max(5, Math.round(28 / rainfallModifier)),
      hospitalOverloadRiskPct: Math.min(98, Math.round(94 * rainfallModifier)),
      waterDemandSurgePct: Math.min(92, Math.round(71 * rainfallModifier)),
      confidencePct: 91,
      primaryRiskDrivers: [
        'Himayat Sagar & Osman Sagar flood gates opened (12 gates)',
        'River embankment overflow into low-lying katcha dwellings',
      ],
      recommendedPreparation: 'Evacuation of 450 riparian families to LB Stadium high-ground shelter.',
    },
    {
      zoneId: 'zone-hyd-03',
      zoneName: 'Alwal Lake Catchment Area',
      floodRiskPct: Math.min(95, Math.round(82 * rainfallModifier)),
      roadAccessibilityPct: Math.max(15, Math.round(44 / rainfallModifier)),
      hospitalOverloadRiskPct: Math.min(85, Math.round(62 * rainfallModifier)),
      waterDemandSurgePct: Math.min(88, Math.round(65 * rainfallModifier)),
      confidencePct: 88,
      primaryRiskDrivers: ['Alwal surplus weir overflow', 'Encroached stormwater nala constriction'],
      recommendedPreparation: 'Position high-capacity tractor de-watering pumps along Dinakar Nagar.',
    },
    {
      zoneId: 'zone-hyd-04',
      zoneName: 'Moosarambagh & Malakpet',
      floodRiskPct: Math.min(96, Math.round(80 * rainfallModifier)),
      roadAccessibilityPct: Math.max(12, Math.round(36 / rainfallModifier)),
      hospitalOverloadRiskPct: Math.min(90, Math.round(75 * rainfallModifier)),
      waterDemandSurgePct: Math.min(82, Math.round(60 * rainfallModifier)),
      confidencePct: 89,
      primaryRiskDrivers: ['Old bridge causeway water level 3.2 ft over guardrails', 'Traffic bottleneck at metro pillars'],
      recommendedPreparation: 'Police barricades at Amberpet junction; divert south traffic to Dilsukhnagar.',
    },
    {
      zoneId: 'zone-hyd-05',
      zoneName: 'Amberpet Cheena Bazar',
      floodRiskPct: Math.min(85, Math.round(64 * rainfallModifier)),
      roadAccessibilityPct: Math.max(30, Math.round(60 / rainfallModifier)),
      hospitalOverloadRiskPct: Math.min(75, Math.round(52 * rainfallModifier)),
      waterDemandSurgePct: Math.min(70, Math.round(48 * rainfallModifier)),
      confidencePct: 86,
      primaryRiskDrivers: ['Sewer manhole overflow', 'Commercial ground storage inundation'],
      recommendedPreparation: 'Deploy municipal mobile sanitation units & dry ration kits.',
    },
    {
      zoneId: 'zone-hyd-06',
      zoneName: 'Begumpet Brahmanwadi & Rasoolpura',
      floodRiskPct: Math.min(80, Math.round(56 * rainfallModifier)),
      roadAccessibilityPct: Math.max(35, Math.round(66 / rainfallModifier)),
      hospitalOverloadRiskPct: Math.min(68, Math.round(45 * rainfallModifier)),
      waterDemandSurgePct: Math.min(65, Math.round(42 * rainfallModifier)),
      confidencePct: 84,
      primaryRiskDrivers: ['Begumpet Nala capacity limit near railway culvert'],
      recommendedPreparation: 'Activate GHMC emergency emergency clearing squads with heavy excavators.',
    },
    {
      zoneId: 'zone-hyd-07',
      zoneName: 'Hafiz Baba Nagar & Phoolbagh (Chandrayangutta)',
      floodRiskPct: Math.min(98, Math.round(91 * rainfallModifier)),
      roadAccessibilityPct: Math.max(10, Math.round(24 / rainfallModifier)),
      hospitalOverloadRiskPct: Math.min(94, Math.round(86 * rainfallModifier)),
      waterDemandSurgePct: Math.min(95, Math.round(85 * rainfallModifier)),
      confidencePct: 92,
      primaryRiskDrivers: ['Balapur lake surplus breach', 'High-density narrow lanes in Old City South', 'Drinking water contamination risk'],
      recommendedPreparation: 'Deploy SDRF marine boat squad; deliver chlorination tablets & emergency drinking water tanker.',
    },
    {
      zoneId: 'zone-hyd-08',
      zoneName: 'Nizampet & Kukatpally (Bhandari Layout)',
      floodRiskPct: Math.min(90, Math.round(78 * rainfallModifier)),
      roadAccessibilityPct: Math.max(25, Math.round(45 / rainfallModifier)),
      hospitalOverloadRiskPct: Math.min(76, Math.round(58 * rainfallModifier)),
      waterDemandSurgePct: Math.min(84, Math.round(66 * rainfallModifier)),
      confidencePct: 88,
      primaryRiskDrivers: ['Turka Cheruvu weir overflow', 'Deep basement car parking flooding', 'Apartment power backup outage'],
      recommendedPreparation: 'Station 200-HP high-head de-watering pumps along main arterial entrance.',
    },
    {
      zoneId: 'zone-hyd-09',
      zoneName: 'Falaknuma, Bahadurpura & Mir Alam Basin',
      floodRiskPct: Math.min(92, Math.round(81 * rainfallModifier)),
      roadAccessibilityPct: Math.max(20, Math.round(38 / rainfallModifier)),
      hospitalOverloadRiskPct: Math.min(88, Math.round(72 * rainfallModifier)),
      waterDemandSurgePct: Math.min(86, Math.round(68 * rainfallModifier)),
      confidencePct: 87,
      primaryRiskDrivers: ['Mir Alam Tank spillway backflow', 'Low-elevation topography near Nehru Zoo Park'],
      recommendedPreparation: 'Preemptive sandbag barricading along zoo drainage channel; mobilize community shelter.',
    },
    {
      zoneId: 'zone-hyd-10',
      zoneName: 'Ramanthapur Pedda Cheruvu & Uppal',
      floodRiskPct: Math.min(86, Math.round(72 * rainfallModifier)),
      roadAccessibilityPct: Math.max(30, Math.round(52 / rainfallModifier)),
      hospitalOverloadRiskPct: Math.min(74, Math.round(54 * rainfallModifier)),
      waterDemandSurgePct: Math.min(78, Math.round(58 * rainfallModifier)),
      confidencePct: 86,
      primaryRiskDrivers: ['Pedda Cheruvu lake surplus weir backflow', 'Uppal main road waterlogging'],
      recommendedPreparation: 'Traffic diversion onto Uppal-Habsiguda elevated flyover; deploy GHMC clearance squads.',
    },
  ];
}
