/**
 * CarbonTrace AI — Centralized Mock Data
 * 
 * IMPORTANT NOTE FOR BACKEND INTEGRATION:
 * This file serves as the single source of truth for frontend development and demo mode.
 * In production, all these structures are mapped directly to FastAPI endpoints defined in
 * src/services/api.js. Components should NEVER import or modify mock data directly —
 * they consume services from api.js.
 */

export const INITIAL_DASHBOARD_METRICS = {
  totalEmissionsKg: 428950,
  verifiedEmissionsKg: 342100,
  pendingEmissionsKg: 86850,
  suppliersTracked: 10,
  highImpactSuppliersCount: 4,
  reductionPotentialKg: 78400,
  verificationRatePercent: 79.8,
  reportingPeriod: '2024 Q1 - Q4 (YTD)',
  scopeCoverage: 'Scope 3 (Categories 1, 4 & 9: Purchased Goods & Upstream/Downstream Transportation)'
};

export const INITIAL_SUPPLIERS = [
  {
    id: 'SUP-001',
    name: 'Apex Aluminum Smelting GmbH',
    tier: 'Tier 1',
    location: 'Duisburg, Germany',
    country: 'Germany',
    totalEmissionsKg: 142800,
    verifiedEmissionsKg: 118400,
    impactLevel: 'High',
    verificationRate: 82.9,
    status: 'Active',
    contactPerson: 'Klaus Lindemann',
    contactEmail: 'k.lindemann@apex-smelt.de',
    categories: {
      manufacturing: 85680,
      transportation: 35700,
      energy: 21420
    },
    trend: '+4.2%',
    auditScore: 91,
    recentShipmentsCount: 8
  },
  {
    id: 'SUP-002',
    name: 'SinoSteel Precision Forging',
    tier: 'Tier 1',
    location: 'Shanghai, China',
    country: 'China',
    totalEmissionsKg: 112450,
    verifiedEmissionsKg: 89600,
    impactLevel: 'High',
    verificationRate: 79.7,
    status: 'Active',
    contactPerson: 'Wei Zhang',
    contactEmail: 'w.zhang@sinosteel-pf.cn',
    categories: {
      manufacturing: 67470,
      transportation: 33735,
      energy: 11245
    },
    trend: '-2.1%',
    auditScore: 84,
    recentShipmentsCount: 6
  },
  {
    id: 'SUP-003',
    name: 'Pacific Polymers & Resins Ltd',
    tier: 'Tier 1',
    location: 'Kaohsiung, Taiwan',
    country: 'Taiwan',
    totalEmissionsKg: 58200,
    verifiedEmissionsKg: 49500,
    impactLevel: 'High',
    verificationRate: 85.1,
    status: 'Active',
    contactPerson: 'Mei-Ling Chen',
    contactEmail: 'mchen@pacificpolymers.tw',
    categories: {
      manufacturing: 34920,
      transportation: 14550,
      energy: 8730
    },
    trend: '-5.8%',
    auditScore: 94,
    recentShipmentsCount: 5
  },
  {
    id: 'SUP-004',
    name: 'Sonora Automotive Stampings',
    tier: 'Tier 1',
    location: 'Monterrey, Mexico',
    country: 'Mexico',
    totalEmissionsKg: 41600,
    verifiedEmissionsKg: 35200,
    impactLevel: 'High',
    verificationRate: 84.6,
    status: 'Active',
    contactPerson: 'Carlos Morales',
    contactEmail: 'carlos.m@sonora-auto.mx',
    categories: {
      manufacturing: 24960,
      transportation: 12480,
      energy: 4160
    },
    trend: '+1.4%',
    auditScore: 88,
    recentShipmentsCount: 4
  },
  {
    id: 'SUP-005',
    name: 'Atlas Freight & Logistics BV',
    tier: 'Tier 2',
    location: 'Rotterdam, Netherlands',
    country: 'Netherlands',
    totalEmissionsKg: 28400,
    verifiedEmissionsKg: 22100,
    impactLevel: 'Medium',
    verificationRate: 77.8,
    status: 'Active',
    contactPerson: 'Jan van der Meer',
    contactEmail: 'jan@atlasfreight.nl',
    categories: {
      manufacturing: 2840,
      transportation: 24140,
      energy: 1420
    },
    trend: '-8.3%',
    auditScore: 96,
    recentShipmentsCount: 7
  },
  {
    id: 'SUP-006',
    name: 'Nordic Pulp & Kraft Fiber AB',
    tier: 'Tier 2',
    location: 'Gothenburg, Sweden',
    country: 'Sweden',
    totalEmissionsKg: 19800,
    verifiedEmissionsKg: 16400,
    impactLevel: 'Medium',
    verificationRate: 82.8,
    status: 'Active',
    contactPerson: 'Astrid Lindholm',
    contactEmail: 'astrid@nordicpulp.se',
    categories: {
      manufacturing: 11880,
      transportation: 4950,
      energy: 2970
    },
    trend: '-12.0%',
    auditScore: 98,
    recentShipmentsCount: 3
  },
  {
    id: 'SUP-007',
    name: 'Valais Micro-Connectors SA',
    tier: 'Tier 2',
    location: 'Geneva, Switzerland',
    country: 'Switzerland',
    totalEmissionsKg: 12500,
    verifiedEmissionsKg: 10900,
    impactLevel: 'Low',
    verificationRate: 87.2,
    status: 'Active',
    contactPerson: 'Marc Dufour',
    contactEmail: 'm.dufour@valais-micro.ch',
    categories: {
      manufacturing: 7500,
      transportation: 3125,
      energy: 1875
    },
    trend: '-3.5%',
    auditScore: 92,
    recentShipmentsCount: 2
  },
  {
    id: 'SUP-008',
    name: 'Iberia Agro-Chemicals SL',
    tier: 'Tier 2',
    location: 'Valencia, Spain',
    country: 'Spain',
    totalEmissionsKg: 8900,
    verifiedEmissionsKg: 0,
    impactLevel: 'Low',
    verificationRate: 0.0,
    status: 'Under Review',
    contactPerson: 'Sofia Alvarez',
    contactEmail: 'salvarez@iberia-chem.es',
    categories: {
      manufacturing: 5340,
      transportation: 2670,
      energy: 890
    },
    trend: '+8.1%',
    auditScore: 68,
    recentShipmentsCount: 1
  },
  {
    id: 'SUP-009',
    name: 'Katanga Mineral Refining SARL',
    tier: 'Tier 3',
    location: 'Lubumbashi, DRC',
    country: 'DRC',
    totalEmissionsKg: 3200,
    verifiedEmissionsKg: 0,
    impactLevel: 'Low',
    verificationRate: 0.0,
    status: 'Under Review',
    contactPerson: 'Jean-Pierre Mutombo',
    contactEmail: 'mutombo@katangarefine.cd',
    categories: {
      manufacturing: 2240,
      transportation: 640,
      energy: 320
    },
    trend: '+15.2%',
    auditScore: 62,
    recentShipmentsCount: 1
  },
  {
    id: 'SUP-010',
    name: 'Evergreen Bio-Resins PT',
    tier: 'Tier 3',
    location: 'Jakarta, Indonesia',
    country: 'Indonesia',
    totalEmissionsKg: 1900,
    verifiedEmissionsKg: 0,
    impactLevel: 'Low',
    verificationRate: 0.0,
    status: 'Under Review',
    contactPerson: 'Budi Santoso',
    contactEmail: 'bsantoso@evergreenbio.id',
    categories: {
      manufacturing: 1140,
      transportation: 570,
      energy: 190
    },
    trend: '-4.1%',
    auditScore: 75,
    recentShipmentsCount: 1
  }
];

export const INITIAL_SHIPMENTS = [
  {
    id: 'SHP-9021',
    supplierId: 'SUP-001',
    supplierName: 'Apex Aluminum Smelting GmbH',
    supplierTier: 'Tier 1',
    origin: 'Duisburg, Germany',
    destination: 'Stuttgart, Germany',
    material: 'Raw Aluminum Ingots (Primary)',
    weightKg: 24000,
    weightUnit: 'kg',
    transportMode: 'Road',
    distanceKm: 420,
    emissionFactor: 0.063, // kg CO2e / tonne-km
    calculatedEmissionsKg: 635.0,
    status: 'Pending',
    date: '2024-10-18',
    submittedBy: 'Hans Weber (Logistics Dispatch)',
    verifiedBy: null,
    verificationDate: null,
    aiEstimated: true,
    aiConfidence: 94,
    notes: 'Telematics route confirmed via A3 corridor. Requires verification before Q4 GHG upload.'
  },
  {
    id: 'SHP-9022',
    supplierId: 'SUP-002',
    supplierName: 'SinoSteel Precision Forging',
    supplierTier: 'Tier 1',
    origin: 'Shanghai Port, China',
    destination: 'Rotterdam Port, Netherlands',
    material: 'Forged Steel Transmission Shafts',
    weightKg: 85000,
    weightUnit: 'kg',
    transportMode: 'Sea',
    distanceKm: 19800,
    emissionFactor: 0.012,
    calculatedEmissionsKg: 20196.0,
    status: 'Verified',
    date: '2024-10-15',
    submittedBy: 'Wei Zhang (Supplier Portal)',
    verifiedBy: 'Elena Vance (ESG Officer)',
    verificationDate: '2024-10-16',
    aiEstimated: false,
    aiConfidence: 99,
    notes: 'Maersk Clean Shipping Bill of Lading attached. GLEC Framework verified.'
  },
  {
    id: 'SHP-9023',
    supplierId: 'SUP-003',
    supplierName: 'Pacific Polymers & Resins Ltd',
    supplierTier: 'Tier 1',
    origin: 'Kaohsiung, Taiwan',
    destination: 'Frankfurt Airport, Germany',
    material: 'Precision Optical Polycarbonate',
    weightKg: 4200,
    weightUnit: 'kg',
    transportMode: 'Air',
    distanceKm: 9350,
    emissionFactor: 0.602,
    calculatedEmissionsKg: 23640.5,
    status: 'Pending',
    date: '2024-10-14',
    submittedBy: 'Mei-Ling Chen (Supplier Portal)',
    verifiedBy: null,
    verificationDate: null,
    aiEstimated: true,
    aiConfidence: 91,
    notes: 'Urgent line-down shipment via Air Freight. Flagged as High Carbon Intensity.'
  },
  {
    id: 'SHP-9024',
    supplierId: 'SUP-005',
    supplierName: 'Atlas Freight & Logistics BV',
    supplierTier: 'Tier 2',
    origin: 'Rotterdam, Netherlands',
    destination: 'Munich, Germany',
    material: 'Intermodal Container Transport',
    weightKg: 38000,
    weightUnit: 'kg',
    transportMode: 'Rail',
    distanceKm: 780,
    emissionFactor: 0.021,
    calculatedEmissionsKg: 622.4,
    status: 'Verified',
    date: '2024-10-12',
    submittedBy: 'Jan van der Meer (API EDI)',
    verifiedBy: 'Elena Vance (ESG Officer)',
    verificationDate: '2024-10-13',
    aiEstimated: false,
    aiConfidence: 98,
    notes: 'Green freight rail certificate DB Cargo attached.'
  },
  {
    id: 'SHP-9025',
    supplierId: 'SUP-004',
    supplierName: 'Sonora Automotive Stampings',
    supplierTier: 'Tier 1',
    origin: 'Monterrey, Mexico',
    destination: 'Austin, TX, USA',
    material: 'Stamped Chassis Brackets',
    weightKg: 18500,
    weightUnit: 'kg',
    transportMode: 'Road',
    distanceKm: 610,
    emissionFactor: 0.065,
    calculatedEmissionsKg: 733.5,
    status: 'Verified',
    date: '2024-10-10',
    submittedBy: 'Carlos Morales (Supplier Portal)',
    verifiedBy: 'Elena Vance (ESG Officer)',
    verificationDate: '2024-10-11',
    aiEstimated: true,
    aiConfidence: 92,
    notes: 'EPA SmartWay certified trucking carrier.'
  },
  {
    id: 'SHP-9026',
    supplierId: 'SUP-008',
    supplierName: 'Iberia Agro-Chemicals SL',
    supplierTier: 'Tier 2',
    origin: 'Valencia, Spain',
    destination: 'Lyon, France',
    material: 'Industrial Solvent Drums',
    weightKg: 12000,
    weightUnit: 'kg',
    transportMode: 'Road',
    distanceKm: 890,
    emissionFactor: 0.068,
    calculatedEmissionsKg: 726.2,
    status: 'Rejected',
    date: '2024-10-09',
    submittedBy: 'Sofia Alvarez',
    verifiedBy: 'Elena Vance (ESG Officer)',
    verificationDate: '2024-10-10',
    aiEstimated: true,
    aiConfidence: 74,
    notes: 'Rejected: Discrepancy in weight docket vs fuel receipts (28% deviation).'
  },
  {
    id: 'SHP-9027',
    supplierId: 'SUP-006',
    supplierName: 'Nordic Pulp & Kraft Fiber AB',
    supplierTier: 'Tier 2',
    origin: 'Gothenburg, Sweden',
    destination: 'Hamburg, Germany',
    material: 'Recycled Corrugated Base Rolls',
    weightKg: 45000,
    weightUnit: 'kg',
    transportMode: 'Sea',
    distanceKm: 520,
    emissionFactor: 0.015,
    calculatedEmissionsKg: 351.0,
    status: 'Verified',
    date: '2024-10-08',
    submittedBy: 'Astrid Lindholm',
    verifiedBy: 'Elena Vance (ESG Officer)',
    verificationDate: '2024-10-09',
    aiEstimated: false,
    aiConfidence: 97,
    notes: 'Short-sea container feeder verified via European Clean Marine Hub.'
  },
  {
    id: 'SHP-9028',
    supplierId: 'SUP-001',
    supplierName: 'Apex Aluminum Smelting GmbH',
    supplierTier: 'Tier 1',
    origin: 'Duisburg, Germany',
    destination: 'Bratislava, Slovakia',
    material: 'Extruded Aluminum Profiles',
    weightKg: 29000,
    weightUnit: 'kg',
    transportMode: 'Road',
    distanceKm: 950,
    emissionFactor: 0.063,
    calculatedEmissionsKg: 1735.0,
    status: 'Pending',
    date: '2024-10-07',
    submittedBy: 'Hans Weber (Logistics Dispatch)',
    verifiedBy: null,
    verificationDate: null,
    aiEstimated: true,
    aiConfidence: 89,
    notes: 'Awaiting digital bill of lading confirmation.'
  },
  {
    id: 'SHP-9029',
    supplierId: 'SUP-009',
    supplierName: 'Katanga Mineral Refining SARL',
    supplierTier: 'Tier 3',
    origin: 'Lubumbashi, DRC',
    destination: 'Durban Port, South Africa',
    material: 'Refined Cobalt Hydroxide',
    weightKg: 14000,
    weightUnit: 'kg',
    transportMode: 'Road',
    distanceKm: 2650,
    emissionFactor: 0.075,
    calculatedEmissionsKg: 2782.5,
    status: 'Pending',
    date: '2024-10-05',
    submittedBy: 'Jean-Pierre Mutombo',
    verifiedBy: null,
    verificationDate: null,
    aiEstimated: true,
    aiConfidence: 85,
    notes: 'Cross-border southern African corridor. Heavy fuel factor applied.'
  },
  {
    id: 'SHP-9030',
    supplierId: 'SUP-007',
    supplierName: 'Valais Micro-Connectors SA',
    supplierTier: 'Tier 2',
    origin: 'Geneva, Switzerland',
    destination: 'Milan, Italy',
    material: 'Gold-Plated Terminal Pins',
    weightKg: 1200,
    weightUnit: 'kg',
    transportMode: 'Road',
    distanceKm: 320,
    emissionFactor: 0.062,
    calculatedEmissionsKg: 23.8,
    status: 'Verified',
    date: '2024-10-04',
    submittedBy: 'Marc Dufour',
    verifiedBy: 'Elena Vance (ESG Officer)',
    verificationDate: '2024-10-05',
    aiEstimated: false,
    aiConfidence: 99,
    notes: 'Light commercial electric delivery van utilized for Alpine leg.'
  }
];

export const EMISSIONS_OVER_TIME = [
  { month: 'Jan', verified: 26500, pending: 4200, total: 30700, target: 33000 },
  { month: 'Feb', verified: 28100, pending: 3800, total: 31900, target: 32500 },
  { month: 'Mar', verified: 31400, pending: 5100, total: 36500, target: 32000 },
  { month: 'Apr', verified: 29800, pending: 4600, total: 34400, target: 31500 },
  { month: 'May', verified: 33200, pending: 6200, total: 39400, target: 31000 },
  { month: 'Jun', verified: 30500, pending: 5800, total: 36300, target: 30500 },
  { month: 'Jul', verified: 27900, pending: 7100, total: 35000, target: 30000 },
  { month: 'Aug', verified: 29400, pending: 8400, total: 37800, target: 29500 },
  { month: 'Sep', verified: 32100, pending: 9600, total: 41700, target: 29000 },
  { month: 'Oct', verified: 34200, pending: 12400, total: 46600, target: 28500 },
  { month: 'Nov', verified: 38900, pending: 19650, total: 58550, target: 28000 }
];

export const EMISSIONS_BY_TRANSPORT_MODE = [
  { mode: 'Sea', emissionsKg: 188738, share: 44.0, color: '#0284c7', count: 18, avgDistanceKm: 12400 },
  { mode: 'Road', emissionsKg: 137264, share: 32.0, color: '#f59e0b', count: 42, avgDistanceKm: 620 },
  { mode: 'Air', emissionsKg: 77211, share: 18.0, color: '#ef4444', count: 6, avgDistanceKm: 8900 },
  { mode: 'Rail', emissionsKg: 25737, share: 6.0, color: '#10b981', count: 14, avgDistanceKm: 940 }
];

export const EMISSIONS_BY_SUPPLIER_TIER = [
  { tier: 'Tier 1', emissionsKg: 355050, share: 82.8, color: '#059669', count: 4, desc: 'Direct Suppliers' },
  { tier: 'Tier 2', emissionsKg: 69600, share: 16.2, color: '#10b981', count: 4, desc: 'Sub-tier Component Mfrs' },
  { tier: 'Tier 3', emissionsKg: 5100, share: 1.2, color: '#6ee7b7', count: 2, desc: 'Raw Extraction & Refineries' }
];

export const TOP_EMISSION_SUPPLIERS = [
  { id: 'SUP-001', name: 'Apex Aluminum Smelting GmbH', tier: 'Tier 1', emissionsKg: 142800, percentOfTotal: 33.3, impact: 'High', primaryCategory: 'Smelting & Logistics' },
  { id: 'SUP-002', name: 'SinoSteel Precision Forging', tier: 'Tier 1', emissionsKg: 112450, percentOfTotal: 26.2, impact: 'High', primaryCategory: 'Forging & Ocean Freight' },
  { id: 'SUP-003', name: 'Pacific Polymers & Resins Ltd', tier: 'Tier 1', emissionsKg: 58200, percentOfTotal: 13.6, impact: 'High', primaryCategory: 'Polymer Synthesis' },
  { id: 'SUP-004', name: 'Sonora Automotive Stampings', tier: 'Tier 1', emissionsKg: 41600, percentOfTotal: 9.7, impact: 'High', primaryCategory: 'Metal Stamping' },
  { id: 'SUP-005', name: 'Atlas Freight & Logistics BV', tier: 'Tier 2', emissionsKg: 28400, percentOfTotal: 6.6, impact: 'Medium', primaryCategory: 'EU Intermodal' }
];

export const TOP_EMISSION_ROUTES = [
  { id: 'RT-1', origin: 'Shanghai Port, CN', destination: 'Rotterdam Port, NL', mode: 'Sea', emissionsKg: 78500, count: 6, intensity: '0.012 kg/t-km' },
  { id: 'RT-2', origin: 'Kaohsiung, TW', destination: 'Frankfurt Airport, DE', mode: 'Air', emissionsKg: 54300, count: 4, intensity: '0.602 kg/t-km' },
  { id: 'RT-3', origin: 'Duisburg, DE', destination: 'Stuttgart, DE', mode: 'Road', emissionsKg: 28400, count: 14, intensity: '0.063 kg/t-km' },
  { id: 'RT-4', origin: 'Monterrey, MX', destination: 'Austin, TX, US', mode: 'Road', emissionsKg: 19800, count: 9, intensity: '0.065 kg/t-km' },
  { id: 'RT-5', origin: 'Lubumbashi, CD', destination: 'Durban, ZA', mode: 'Road', emissionsKg: 11200, count: 3, intensity: '0.075 kg/t-km' }
];

export const HOTSPOTS_DATA = {
  topSuppliers: [
    { rank: 1, name: 'Apex Aluminum Smelting GmbH', tier: 'Tier 1', emissionsKg: 142800, share: 33.3, impact: 'High', potentialReductionKg: 35000, action: 'Clean Energy PPA' },
    { rank: 2, name: 'SinoSteel Precision Forging', tier: 'Tier 1', emissionsKg: 112450, share: 26.2, impact: 'High', potentialReductionKg: 22000, action: 'Electric Arc Furnace' },
    { rank: 3, name: 'Pacific Polymers & Resins Ltd', tier: 'Tier 1', emissionsKg: 58200, share: 13.6, impact: 'High', potentialReductionKg: 18500, action: 'Bio-Polymer Blends' },
    { rank: 4, name: 'Sonora Automotive Stampings', tier: 'Tier 1', emissionsKg: 41600, share: 9.7, impact: 'High', potentialReductionKg: 8200, action: 'Scrap Metal Loop' }
  ],
  topRoutes: [
    { rank: 1, name: 'Shanghai (CN) → Rotterdam (NL)', mode: 'Sea', emissionsKg: 78500, share: 18.3, impact: 'High', potentialReductionKg: 15700, action: 'Slow Steaming & Bio-LNG' },
    { rank: 2, name: 'Kaohsiung (TW) → Frankfurt (DE)', mode: 'Air', emissionsKg: 54300, share: 12.7, impact: 'High', potentialReductionKg: 42000, action: 'Switch to Sea/Express Rail' },
    { rank: 3, name: 'Duisburg (DE) → Stuttgart (DE)', mode: 'Road', emissionsKg: 28400, share: 6.6, impact: 'Medium', potentialReductionKg: 23600, action: 'Modal Shift to Electric Rail' },
    { rank: 4, name: 'Monterrey (MX) → Austin (US)', mode: 'Road', emissionsKg: 19800, share: 4.6, impact: 'Medium', potentialReductionKg: 6400, action: 'Class-8 Electric Trucking' }
  ],
  topMaterials: [
    { rank: 1, name: 'Primary Virgin Aluminum', emissionsKg: 138000, share: 32.2, impact: 'High', potentialReductionKg: 48000, action: 'Secondary Recycled Ingot' },
    { rank: 2, name: 'Forged Alloy Steel', emissionsKg: 98500, share: 23.0, impact: 'High', potentialReductionKg: 29500, action: 'Low-Carbon Steel Supply' },
    { rank: 3, name: 'Virgin Polycarbonate (BPA-based)', emissionsKg: 52400, share: 12.2, impact: 'High', potentialReductionKg: 21000, action: 'Bio-Circular Feedstock' },
    { rank: 4, name: 'Solvent-Based Coatings', emissionsKg: 14200, share: 3.3, impact: 'Medium', potentialReductionKg: 5800, action: 'Waterborne Low-VOC Coating' }
  ],
  topModes: [
    { rank: 1, name: 'Ocean Container Freight', emissionsKg: 188738, share: 44.0, impact: 'High', potentialReductionKg: 37700, action: 'Green Corridor Vessels' },
    { rank: 2, name: 'Heavy Duty Diesel Trucking', emissionsKg: 137264, share: 32.0, impact: 'High', potentialReductionKg: 41100, action: 'Rail Intermodal Shifts' },
    { rank: 3, name: 'Dedicated Air Cargo', emissionsKg: 77211, share: 18.0, impact: 'High', potentialReductionKg: 54000, action: 'Transit Lead Time Buffer' },
    { rank: 4, name: 'Diesel Freight Rail', emissionsKg: 25737, share: 6.0, impact: 'Low', potentialReductionKg: 7700, action: 'Electrified Rail Routes' }
  ]
};

export const RECOMMENDATIONS = [
  {
    id: 'REC-001',
    category: 'Transport Modal Shift',
    title: 'Shift Central European Freight from Road to Electrified Rail',
    badge: 'High Impact',
    badgeColor: 'emerald',
    currentTransport: 'Road (Diesel 40t Semi-Trailer)',
    currentEmissionsKg: 636,
    currentEmissionsDisplay: '636 kg CO₂e / trip',
    alternativeTransport: 'Rail (Electrified Intermodal Corridor)',
    projectedEmissionsKg: 106,
    projectedEmissionsDisplay: '106 kg CO₂e / trip',
    potentialReductionKg: 530,
    potentialReductionDisplay: '530 kg CO₂e',
    reductionPercent: 83.3,
    description: 'Transitioning regular Duisburg-to-Stuttgart ingot deliveries to DB Cargo Rail eliminates over 83% of trip emissions with just a +4 hour transit buffer.',
    implementationComplexity: 'Low',
    estimatedCostImpact: '-4% Operating Freight Cost',
    applicableSuppliers: ['Apex Aluminum Smelting GmbH']
  },
  {
    id: 'REC-002',
    category: 'Modal Shift',
    title: 'Replace Emergency Air Freight with Ocean Sea-Air Hybrid',
    badge: 'High Impact',
    badgeColor: 'emerald',
    currentTransport: 'Air (Boeing 777F Cargo)',
    currentEmissionsKg: 23640,
    currentEmissionsDisplay: '23,640 kg CO₂e / shipment',
    alternativeTransport: 'Sea-Air Hybrid (Direct Sea to Dubai + Air to Frankfurt)',
    projectedEmissionsKg: 7800,
    projectedEmissionsDisplay: '7,800 kg CO₂e / shipment',
    potentialReductionKg: 15840,
    potentialReductionDisplay: '15,840 kg CO₂e',
    reductionPercent: 67.0,
    description: 'Avoid dedicated direct Air cargo from Taiwan by utilizing high-frequency container feeders with transshipment air buffers, reducing scope 3 logistics emissions by 67%.',
    implementationComplexity: 'Medium',
    estimatedCostImpact: '-38% Freight Cost',
    applicableSuppliers: ['Pacific Polymers & Resins Ltd']
  },
  {
    id: 'REC-003',
    category: 'Supplier Transition',
    title: 'Incentivize Renewable PPA at Primary Aluminum Smelter',
    badge: 'Strategic',
    badgeColor: 'blue',
    currentTransport: 'Current Grid Mix (Duisburg Coal/Gas blend)',
    currentEmissionsKg: 85680,
    currentEmissionsDisplay: '85,680 kg CO₂e / quarter',
    alternativeTransport: 'Dedicated On-Site Solar + Wind PPA Offtake',
    projectedEmissionsKg: 51400,
    projectedEmissionsDisplay: '51,400 kg CO₂e / quarter',
    potentialReductionKg: 34280,
    potentialReductionDisplay: '34,280 kg CO₂e',
    reductionPercent: 40.0,
    description: 'Offer preferential supplier terms to Apex Aluminum Smelting in exchange for certified Guarantees of Origin (GoO) for 100% renewable electricity in smelting.',
    implementationComplexity: 'High',
    estimatedCostImpact: '+1.5% Premium, Offset by Carbon Credits',
    applicableSuppliers: ['Apex Aluminum Smelting GmbH']
  },
  {
    id: 'REC-004',
    category: 'Material Circularity',
    title: 'Incorporate 40% Post-Consumer Recycled Aluminum',
    badge: 'Circular Economy',
    badgeColor: 'emerald',
    currentTransport: 'Virgin Primary Bauxite Smelted Ingot',
    currentEmissionsKg: 65000,
    currentEmissionsDisplay: '65,000 kg CO₂e / batch',
    alternativeTransport: 'Certified 40% Recycled Scrap Ingot Blend',
    projectedEmissionsKg: 37700,
    projectedEmissionsDisplay: '37,700 kg CO₂e / batch',
    potentialReductionKg: 27300,
    potentialReductionDisplay: '27,300 kg CO₂e',
    reductionPercent: 42.0,
    description: 'Recycling aluminum consumes 95% less energy than primary production. Blending 40% verified post-consumer scrap yields immediate scope 3 category 1 decarbonization.',
    implementationComplexity: 'Medium',
    estimatedCostImpact: 'Neutral / -2% Material Cost',
    applicableSuppliers: ['Apex Aluminum Smelting GmbH', 'Sonora Automotive Stampings']
  }
];

export const AUDIT_RECORDS = [
  {
    recordId: 'AUD-2024-8841',
    shipmentId: 'SHP-9022',
    supplierName: 'SinoSteel Precision Forging',
    originDestination: 'Shanghai Port (CN) → Rotterdam Port (NL)',
    inputData: '85,000 kg, 19,800 km Sea Freight (Container vessel >8000 TEU)',
    emissionFactor: '0.012 kg CO₂e / t·km',
    factorSource: 'GLEC Framework v3.0 (Global Logistics Emissions Council)',
    calculationMethod: 'Well-to-Wheel (WTW) tonne-km Activity-Based Model',
    aiInvolvement: 'OCR Bill-of-Lading Extraction & Waypoint Verification',
    aiConfidence: '99%',
    verifiedBy: 'Elena Vance (Lead ESG Auditor, Internal Compliance)',
    verificationStatus: 'Verified',
    timestamp: '2024-10-16 14:22 UTC',
    auditHash: '0x8f31b4e87042...9a21c'
  },
  {
    recordId: 'AUD-2024-8842',
    shipmentId: 'SHP-9024',
    supplierName: 'Atlas Freight & Logistics BV',
    originDestination: 'Rotterdam (NL) → Munich (DE)',
    inputData: '38,000 kg, 780 km Freight Rail (Electrified Intermodal)',
    emissionFactor: '0.021 kg CO₂e / t·km',
    factorSource: 'DEFRA 2024 GHG Conversion Factors for Company Reporting',
    calculationMethod: 'Distance-Based Primary Carrier Activity Log',
    aiInvolvement: 'Route GPS Verification & Grid Factor Allocation',
    aiConfidence: '98%',
    verifiedBy: 'Elena Vance (Lead ESG Auditor, Internal Compliance)',
    verificationStatus: 'Verified',
    timestamp: '2024-10-13 09:41 UTC',
    auditHash: '0x3c71a9f02281...4b10e'
  },
  {
    recordId: 'AUD-2024-8843',
    shipmentId: 'SHP-9021',
    supplierName: 'Apex Aluminum Smelting GmbH',
    originDestination: 'Duisburg (DE) → Stuttgart (DE)',
    inputData: '24,000 kg, 420 km Road Freight (Euro VI Articulated 33t)',
    emissionFactor: '0.063 kg CO₂e / t·km',
    factorSource: 'DEFRA 2024 GHG Freight Conversion Matrix',
    calculationMethod: 'Activity Tonne-km Fuel Surcharge Standard',
    aiInvolvement: 'AI Route Estimation & Fuel Consumption Model',
    aiConfidence: '94%',
    verifiedBy: 'Awaiting Audit Review',
    verificationStatus: 'Pending',
    timestamp: '2024-10-18 11:05 UTC',
    auditHash: '0x59a1f499b110...7c84d'
  },
  {
    recordId: 'AUD-2024-8844',
    shipmentId: 'SHP-9023',
    supplierName: 'Pacific Polymers & Resins Ltd',
    originDestination: 'Kaohsiung (TW) → Frankfurt Airport (DE)',
    inputData: '4,200 kg, 9,350 km Dedicated Air Freight (Long-haul belly/freighter)',
    emissionFactor: '0.602 kg CO₂e / t·km',
    factorSource: 'ICAO Carbon Emissions Calculator Model 2024',
    calculationMethod: 'Great Circle Distance (GCD) + 95 km uplift',
    aiInvolvement: 'AI Anomaly Detection: High Intensity Alert Flagged',
    aiConfidence: '91%',
    verifiedBy: 'Awaiting Audit Review',
    verificationStatus: 'Pending',
    timestamp: '2024-10-14 16:50 UTC',
    auditHash: '0x71e9882ac002...3d99f'
  },
  {
    recordId: 'AUD-2024-8845',
    shipmentId: 'SHP-9026',
    supplierName: 'Iberia Agro-Chemicals SL',
    originDestination: 'Valencia (ES) → Lyon (FR)',
    inputData: '12,000 kg, 890 km Road Freight',
    emissionFactor: '0.068 kg CO₂e / t·km',
    factorSource: 'EPA GHG Emission Factors Hub v2.1',
    calculationMethod: 'Vendor Declared Fuel Factor',
    aiInvolvement: 'AI Discrepancy Flag: Fuel vs Weight Docket mismatch',
    aiConfidence: '74%',
    verifiedBy: 'Elena Vance (Lead ESG Auditor, Internal Compliance)',
    verificationStatus: 'Rejected',
    timestamp: '2024-10-10 17:15 UTC',
    auditHash: '0x12b8941da65e...8f12a'
  }
];

export const SUPPLY_CHAIN_NETWORK = {
  anchor: {
    id: 'NODE-ROOT',
    name: 'CarbonTrace Enterprise (OEM)',
    tier: 'OEM Anchor',
    location: 'Munich, Germany',
    emissionsKg: 0,
    impact: 'Low',
    role: 'Reporting Corporate Entity'
  },
  tier1: [
    { id: 'SUP-001', name: 'Apex Aluminum GmbH', location: 'Germany', emissionsKg: 142800, impact: 'High', material: 'Smelted Ingot', verification: '82.9%' },
    { id: 'SUP-002', name: 'SinoSteel Forging', location: 'China', emissionsKg: 112450, impact: 'High', material: 'Forged Steel', verification: '79.7%' },
    { id: 'SUP-003', name: 'Pacific Polymers', location: 'Taiwan', emissionsKg: 58200, impact: 'High', material: 'Polycarbonates', verification: '85.1%' },
    { id: 'SUP-004', name: 'Sonora Stampings', location: 'Mexico', emissionsKg: 41600, impact: 'High', material: 'Chassis Stampings', verification: '84.6%' }
  ],
  tier2: [
    { id: 'SUP-005', name: 'Atlas Freight BV', parentId: 'SUP-001', location: 'Netherlands', emissionsKg: 28400, impact: 'Medium', material: 'Intermodal Freight', verification: '77.8%' },
    { id: 'SUP-006', name: 'Nordic Pulp AB', parentId: 'SUP-003', location: 'Sweden', emissionsKg: 19800, impact: 'Medium', material: 'Recycled Fiber', verification: '82.8%' },
    { id: 'SUP-007', name: 'Valais Micro SA', parentId: 'SUP-002', location: 'Switzerland', emissionsKg: 12500, impact: 'Low', material: 'Connector Pins', verification: '87.2%' },
    { id: 'SUP-008', name: 'Iberia Agro SL', parentId: 'SUP-003', location: 'Spain', emissionsKg: 8900, impact: 'Low', material: 'Solvents', verification: '0.0%' }
  ],
  tier3: [
    { id: 'SUP-009', name: 'Katanga Minerals', parentId: 'SUP-002', location: 'DRC', emissionsKg: 3200, impact: 'Low', material: 'Refined Cobalt', verification: '0.0%' },
    { id: 'SUP-010', name: 'Evergreen Bio-Resins', parentId: 'SUP-003', location: 'Indonesia', emissionsKg: 1900, impact: 'Low', material: 'Bio-Feedstocks', verification: '0.0%' }
  ]
};
