import axios from 'axios';
import {
  INITIAL_DASHBOARD_METRICS,
  INITIAL_SUPPLIERS,
  INITIAL_SHIPMENTS,
  EMISSIONS_OVER_TIME,
  EMISSIONS_BY_TRANSPORT_MODE,
  EMISSIONS_BY_SUPPLIER_TIER,
  TOP_EMISSION_SUPPLIERS,
  TOP_EMISSION_ROUTES,
  HOTSPOTS_DATA,
  RECOMMENDATIONS,
  AUDIT_RECORDS,
  SUPPLY_CHAIN_NETWORK
} from '../data/mockData';

/**
 * CarbonTrace AI — Axios API Client & Service Layer
 * 
 * Configured with VITE_API_URL.
 * Supports transparent fallback to realistic in-memory state for development and demos.
 * Once FastAPI endpoints are deployed by teammate, replace fallback branches with live endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for future Auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('carbontrace_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Reactive in-memory state for demo / offline mode
let suppliersState = [...INITIAL_SUPPLIERS];
let shipmentsState = [...INITIAL_SHIPMENTS];
let auditRecordsState = [...AUDIT_RECORDS];
let metricsState = { ...INITIAL_DASHBOARD_METRICS };

// Helper to simulate network latency for authentic feel
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

/* ==========================================================================
   AUTH SERVICE (Mock State for Demo)
   ========================================================================== */
export const authService = {
  async login(email, password) {
    await delay(300);
    const mockUser = {
      id: 'USR-042',
      name: 'Elena Vance',
      email: email || 'elena.vance@carbontrace.corp',
      role: 'ESG Compliance Lead',
      organization: 'Global Logistics Corp',
      avatar: 'EV'
    };
    localStorage.setItem('carbontrace_user', JSON.stringify(mockUser));
    localStorage.setItem('carbontrace_token', 'demo_jwt_token_esg_lead');
    return mockUser;
  },

  getCurrentUser() {
    const stored = localStorage.getItem('carbontrace_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return {
      id: 'USR-042',
      name: 'Elena Vance',
      email: 'elena.vance@carbontrace.corp',
      role: 'ESG Compliance Lead',
      organization: 'Global Logistics Corp',
      avatar: 'EV'
    };
  },

  logout() {
    localStorage.removeItem('carbontrace_user');
    localStorage.removeItem('carbontrace_token');
  }
};

/* ==========================================================================
   DASHBOARD SERVICE
   ========================================================================== */
export const dashboardService = {
  async getMetrics() {
    await delay();
    // Recalculate based on current shipmentsState
    const verifiedTotal = shipmentsState
      .filter(s => s.status === 'Verified')
      .reduce((sum, s) => sum + s.calculatedEmissionsKg, 0);
    const pendingTotal = shipmentsState
      .filter(s => s.status === 'Pending')
      .reduce((sum, s) => sum + s.calculatedEmissionsKg, 0);

    return {
      ...metricsState,
      verifiedEmissionsKg: Math.round(300000 + verifiedTotal),
      pendingEmissionsKg: Math.round(pendingTotal),
      totalEmissionsKg: Math.round(300000 + verifiedTotal + pendingTotal)
    };
  },

  async getEmissionsTimeline() {
    await delay();
    return EMISSIONS_OVER_TIME;
  },

  async getEmissionsByMode() {
    await delay();
    return EMISSIONS_BY_TRANSPORT_MODE;
  },

  async getEmissionsByTier() {
    await delay();
    return EMISSIONS_BY_SUPPLIER_TIER;
  },

  async getTopSuppliers() {
    await delay();
    return TOP_EMISSION_SUPPLIERS;
  },

  async getTopRoutes() {
    await delay();
    return TOP_EMISSION_ROUTES;
  }
};

/* ==========================================================================
   SUPPLIER SERVICE
   ========================================================================== */
export const supplierService = {
  async getSuppliers(params = {}) {
    await delay();
    let result = [...suppliersState];
    if (params.tier && params.tier !== 'All') {
      result = result.filter(s => s.tier === params.tier);
    }
    if (params.impact && params.impact !== 'All') {
      result = result.filter(s => s.impactLevel === params.impact);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.location.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getSupplierById(id) {
    await delay();
    const supplier = suppliersState.find(s => s.id === id);
    if (!supplier) {
      throw new Error(`Supplier ${id} not found`);
    }
    const shipments = shipmentsState.filter(s => s.supplierId === id);
    return { ...supplier, shipments };
  },

  async addSupplier(newSupplier) {
    await delay(300);
    const id = `SUP-${String(suppliersState.length + 1).padStart(3, '0')}`;
    const created = {
      id,
      name: newSupplier.name,
      tier: newSupplier.tier || 'Tier 1',
      location: newSupplier.location || 'Unknown',
      country: newSupplier.country || 'Global',
      totalEmissionsKg: 0,
      verifiedEmissionsKg: 0,
      impactLevel: 'Low',
      verificationRate: 0,
      status: 'Active',
      contactPerson: newSupplier.contactPerson || 'Direct Dispatch',
      contactEmail: newSupplier.contactEmail || '',
      categories: { manufacturing: 0, transportation: 0, energy: 0 },
      trend: '0.0%',
      auditScore: 85,
      recentShipmentsCount: 0
    };
    suppliersState.unshift(created);
    return created;
  }
};

/* ==========================================================================
   SHIPMENT SERVICE
   ========================================================================== */
export const shipmentService = {
  async getShipments(params = {}) {
    await delay();
    let result = [...shipmentsState];
    if (params.status && params.status !== 'All') {
      result = result.filter(s => s.status === params.status);
    }
    if (params.mode && params.mode !== 'All') {
      result = result.filter(s => s.transportMode === params.mode);
    }
    if (params.supplierId) {
      result = result.filter(s => s.supplierId === params.supplierId);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(s =>
        s.supplierName.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.material.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getShipmentById(id) {
    await delay();
    const shipment = shipmentsState.find(s => s.id === id);
    if (!shipment) throw new Error(`Shipment ${id} not found`);
    return shipment;
  },

  async addShipment(shipmentData) {
    await delay(400);

    // Baseline preview calculation for prototype UI only
    // NOTE: In production, FastAPI backend will compute authoritative distance & emissions
    const modeFactors = {
      Road: 0.063,
      Rail: 0.021,
      Sea: 0.012,
      Air: 0.602
    };

    const factor = modeFactors[shipmentData.transportMode] || 0.05;
    const weightTonnes = shipmentData.weightUnit === 't' 
      ? Number(shipmentData.weight) 
      : Number(shipmentData.weight) / 1000;
    const distanceKm = Number(shipmentData.distance);
    const estimatedEmissionsKg = Number((weightTonnes * distanceKm * factor).toFixed(1));

    const id = `SHP-${9000 + shipmentsState.length + 1}`;
    const newRecord = {
      id,
      supplierId: shipmentData.supplierId || 'SUP-001',
      supplierName: shipmentData.supplierName || 'Apex Aluminum Smelting GmbH',
      supplierTier: shipmentData.supplierTier || 'Tier 1',
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      material: shipmentData.material,
      weightKg: shipmentData.weightUnit === 't' ? Number(shipmentData.weight) * 1000 : Number(shipmentData.weight),
      weightUnit: shipmentData.weightUnit || 'kg',
      transportMode: shipmentData.transportMode,
      distanceKm: distanceKm,
      emissionFactor: factor,
      calculatedEmissionsKg: estimatedEmissionsKg,
      status: 'Pending', // New shipments always require verification before reporting
      date: shipmentData.date || new Date().toISOString().split('T')[0],
      submittedBy: 'Elena Vance (ESG Compliance Lead)',
      verifiedBy: null,
      verificationDate: null,
      aiEstimated: true,
      aiConfidence: 93,
      notes: shipmentData.notes || 'Submitted via shipment portal. Pending ESG verification.'
    };

    shipmentsState.unshift(newRecord);

    // Also create matching pending audit record
    auditRecordsState.unshift({
      recordId: `AUD-2024-${8850 + shipmentsState.length}`,
      shipmentId: id,
      supplierName: newRecord.supplierName,
      originDestination: `${newRecord.origin} → ${newRecord.destination}`,
      inputData: `${newRecord.weightKg.toLocaleString()} kg, ${newRecord.distanceKm.toLocaleString()} km ${newRecord.transportMode} Freight`,
      emissionFactor: `${newRecord.emissionFactor} kg CO₂e / t·km`,
      factorSource: 'DEFRA 2024 Activity Standards',
      calculationMethod: 'Activity Tonne-km Model (Pending Verification)',
      aiInvolvement: 'Automated Georouting & Factor Matching',
      aiConfidence: '93%',
      verifiedBy: 'Pending Audit Review',
      verificationStatus: 'Pending',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      auditHash: '0x' + Math.random().toString(16).substring(2, 10) + '...new'
    });

    return newRecord;
  }
};

/* ==========================================================================
   VERIFICATION SERVICE
   ========================================================================== */
export const verificationService = {
  async getPendingShipments() {
    await delay();
    return shipmentsState.filter(s => s.status === 'Pending');
  },

  async getAllVerifications() {
    await delay();
    return shipmentsState;
  },

  async approveShipment(id, notes = '') {
    await delay(300);
    const index = shipmentsState.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`Shipment ${id} not found`);

    const updated = {
      ...shipmentsState[index],
      status: 'Verified',
      verifiedBy: 'Elena Vance (ESG Compliance Lead)',
      verificationDate: new Date().toISOString().split('T')[0],
      notes: notes ? `${shipmentsState[index].notes} | Audit Note: ${notes}` : shipmentsState[index].notes
    };

    shipmentsState[index] = updated;

    // Update audit record
    const auditIdx = auditRecordsState.findIndex(a => a.shipmentId === id);
    if (auditIdx !== -1) {
      auditRecordsState[auditIdx] = {
        ...auditRecordsState[auditIdx],
        verificationStatus: 'Verified',
        verifiedBy: 'Elena Vance (ESG Compliance Lead)',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      };
    }

    return updated;
  },

  async rejectShipment(id, reason = '') {
    await delay(300);
    const index = shipmentsState.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`Shipment ${id} not found`);

    const updated = {
      ...shipmentsState[index],
      status: 'Rejected',
      verifiedBy: 'Elena Vance (ESG Compliance Lead)',
      verificationDate: new Date().toISOString().split('T')[0],
      notes: `Rejected: ${reason || 'Data discrepancy in transport manifest.'}`
    };

    shipmentsState[index] = updated;

    // Update audit record
    const auditIdx = auditRecordsState.findIndex(a => a.shipmentId === id);
    if (auditIdx !== -1) {
      auditRecordsState[auditIdx] = {
        ...auditRecordsState[auditIdx],
        verificationStatus: 'Rejected',
        verifiedBy: 'Elena Vance (ESG Compliance Lead)',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      };
    }

    return updated;
  }
};

/* ==========================================================================
   ANALYTICS SERVICE
   ========================================================================== */
export const analyticsService = {
  async getAnalytics(filters = {}) {
    await delay();
    return {
      timeline: EMISSIONS_OVER_TIME,
      byMode: EMISSIONS_BY_TRANSPORT_MODE,
      byTier: EMISSIONS_BY_SUPPLIER_TIER,
      bySupplier: TOP_EMISSION_SUPPLIERS,
      byMaterial: HOTSPOTS_DATA.topMaterials
    };
  }
};

/* ==========================================================================
   HOTSPOTS SERVICE
   ========================================================================== */
export const hotspotService = {
  async getHotspots() {
    await delay();
    return HOTSPOTS_DATA;
  }
};

/* ==========================================================================
   RECOMMENDATIONS SERVICE
   ========================================================================== */
export const recommendationService = {
  async getRecommendations() {
    await delay();
    return RECOMMENDATIONS;
  }
};

/* ==========================================================================
   SIMULATION SERVICE
   ========================================================================== */
export const simulationService = {
  async simulateScenario(params) {
    await delay(200);

    // Mock calculation preview for What-If scenario (will be powered by FastAPI)
    const modeFactors = {
      Road: 0.063,
      Rail: 0.021,
      Sea: 0.012,
      Air: 0.602
    };

    const factor = modeFactors[params.mode] || 0.063;
    const baselineWeightTonnes = Number(params.weight || 24);
    const baselineDistance = Number(params.distance || 420);
    const baselineEmissions = baselineWeightTonnes * baselineDistance * 0.063; // road baseline

    // Reductions from recycled content and renewable power
    const recycledDiscount = (Number(params.recycledPercent || 0) / 100) * 0.35; // up to 35% reduction
    const renewableDiscount = (Number(params.renewablePercent || 0) / 100) * 0.25; // up to 25% reduction

    let projected = baselineWeightTonnes * baselineDistance * factor;
    projected = projected * (1 - recycledDiscount) * (1 - renewableDiscount);

    const reductionKg = Math.max(0, baselineEmissions - projected);
    const reductionPercent = baselineEmissions > 0 ? (reductionKg / baselineEmissions) * 100 : 0;

    return {
      currentEmissionsKg: Math.round(baselineEmissions),
      projectedEmissionsKg: Math.round(projected),
      reductionKg: Math.round(reductionKg),
      reductionPercent: Number(reductionPercent.toFixed(1))
    };
  }
};

/* ==========================================================================
   AUDIT SERVICE
   ========================================================================== */
export const auditService = {
  async getAuditTrail(filters = {}) {
    await delay();
    let records = [...auditRecordsState];
    if (filters.status && filters.status !== 'All') {
      records = records.filter(r => r.verificationStatus === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(r =>
        r.recordId.toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q) ||
        r.originDestination.toLowerCase().includes(q) ||
        r.factorSource.toLowerCase().includes(q)
      );
    }
    return records;
  }
};

/* ==========================================================================
   SUPPLY CHAIN SERVICE
   ========================================================================== */
export const supplyChainService = {
  async getNetwork() {
    await delay();
    return SUPPLY_CHAIN_NETWORK;
  }
};
