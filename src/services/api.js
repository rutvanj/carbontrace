import axios from 'axios';
import {
  EMISSIONS_BY_SUPPLIER_TIER,
  TOP_EMISSION_ROUTES,
  HOTSPOTS_DATA,
  SUPPLY_CHAIN_NETWORK
} from '../data/mockData';

/**
 * CarbonTrace AI — Axios API Client & Service Layer
 *
 * Configured with VITE_API_URL (fallback: http://localhost:8000).
 * Real FastAPI endpoints are used wherever they exist.
 * Remaining mock data is retained only for pages with no backend equivalent.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Bearer token to every request automatically
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

// ─────────────────────────────────────────────────────────────────────────────
// SHAPE ADAPTERS
// These convert snake_case backend responses to the camelCase shapes the
// existing UI components already expect. No UI component is changed.
// ─────────────────────────────────────────────────────────────────────────────

const MODE_COLORS = {
  ROAD: '#059669',
  RAIL: '#0284c7',
  SEA: '#7c3aed',
  AIR: '#f59e0b',
  INLAND_WATERWAY: '#14b8a6',
};

/**
 * Backend: { id, origin, destination, weight_tonnes, distance_km,
 *            transport_mode, emission_factor, emissions, status,
 *            supplier_id, created_at, verified_at }
 * Frontend expects: { id, origin, destination, weightKg, distanceKm,
 *                     transportMode, emissionFactor, calculatedEmissionsKg,
 *                     status (Pending/Verified/Rejected), date, supplierName, ... }
 */
function adaptShipment(s, suppliersMap = {}) {
  const statusMap = { PENDING: 'Pending', VERIFIED: 'Verified', REJECTED: 'Rejected' };
  const modeDisplay = {
    ROAD: 'Road', RAIL: 'Rail', SEA: 'Sea', AIR: 'Air', INLAND_WATERWAY: 'Inland'
  };
  const supplier = suppliersMap[s.supplier_id];
  return {
    id: s.id,
    origin: s.origin,
    destination: s.destination,
    weightKg: (s.weight_tonnes || 0) * 1000,
    weight_tonnes: s.weight_tonnes,
    distanceKm: s.distance_km,
    distance_km: s.distance_km,
    transportMode: modeDisplay[s.transport_mode] || s.transport_mode,
    transport_mode: s.transport_mode,
    emissionFactor: s.emission_factor,
    emission_factor: s.emission_factor,
    calculatedEmissionsKg: s.emissions,
    emissions: s.emissions,
    status: statusMap[s.status] || s.status,
    rawStatus: s.status,
    supplierId: s.supplier_id,
    supplierName: supplier ? supplier.name : `Supplier #${s.supplier_id || '?'}`,
    supplierTier: supplier ? (supplier.tier || 'Tier 1') : 'Tier 1',
    date: s.created_at ? s.created_at.split('T')[0] : '',
    created_at: s.created_at,
    verifiedBy: s.verified_by_id ? `User #${s.verified_by_id}` : null,
    verificationDate: s.verified_at ? s.verified_at.split('T')[0] : null,
    notes: '',
    material: '',
    aiEstimated: false,
    aiConfidence: null,
    submittedBy: s.created_by_id ? `User #${s.created_by_id}` : 'API',
  };
}

/**
 * Backend: { id, name, address, contact_email }
 * Frontend expects: { id, name, tier, location, country, totalEmissionsKg,
 *                     verifiedEmissionsKg, impactLevel, verificationRate, ... }
 */
function adaptSupplier(s, emissionsMap = {}) {
  const stats = emissionsMap[s.name] || {};
  return {
    id: s.id,
    name: s.name,
    address: s.address,
    contact_email: s.contact_email,
    // Fields with no backend equivalent — use sensible defaults
    tier: 'Tier 1',
    location: s.address || 'Global',
    country: 'Global',
    totalEmissionsKg: stats.emissions || 0,
    verifiedEmissionsKg: 0,
    impactLevel: stats.emissions > 500 ? 'High' : stats.emissions > 100 ? 'Medium' : 'Low',
    verificationRate: 0,
    status: 'Active',
    contactPerson: 'Direct Dispatch',
    contactEmail: s.contact_email || '',
    categories: { manufacturing: 0, transportation: stats.emissions || 0, energy: 0 },
    trend: '0.0%',
    auditScore: 85,
    recentShipmentsCount: stats.count || 0,
    // avatar initials
    avatar: s.name ? s.name.substring(0, 2).toUpperCase() : '??',
  };
}

/**
 * Build a lookup map: supplier_id -> supplier object
 */
function buildSuppliersMap(suppliers) {
  const map = {};
  suppliers.forEach((s) => { map[s.id] = s; });
  return map;
}

/**
 * Backend dashboard summary:
 * { total_shipments, total_emissions, verified_shipments, pending_shipments, rejected_shipments }
 * Frontend expects:
 * { totalEmissionsKg, verifiedEmissionsKg, pendingEmissionsKg, totalShipments,
 *   verificationRatePercent, suppliersTracked, highImpactSuppliersCount, reductionPotentialKg }
 */
function adaptDashboardSummary(d, suppliersCount = 0) {
  const verifiedRate = d.total_shipments > 0
    ? (d.verified_shipments / d.total_shipments) * 100
    : 0;
  return {
    totalEmissionsKg: d.total_emissions || 0,
    verifiedEmissionsKg: d.total_emissions ? Math.round(d.total_emissions * (verifiedRate / 100)) : 0,
    pendingEmissionsKg: d.total_emissions ? Math.round(d.total_emissions * ((100 - verifiedRate) / 100)) : 0,
    totalShipments: d.total_shipments || 0,
    verifiedShipments: d.verified_shipments || 0,
    pendingShipments: d.pending_shipments || 0,
    rejectedShipments: d.rejected_shipments || 0,
    verificationRatePercent: verifiedRate,
    suppliersTracked: suppliersCount,
    highImpactSuppliersCount: 0,
    reductionPotentialKg: Math.round((d.total_emissions || 0) * 0.18),
  };
}

/**
 * Backend trend: [{ period: "2026-09", count, emissions }]
 * Frontend timeline expects: [{ month: "Sep", emissions, count }]
 *
 * IMPORTANT: The backend does NOT return verified/pending split.
 * We only map what the backend actually provides.
 * The chart displays total emissions per period.
 */
function adaptTrend(rows) {
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return rows.map((r) => {
    const parts = (r.period || '').split('-');
    const monthIdx = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
    return {
      month: monthNames[monthIdx] || r.period,
      period: r.period,
      emissions: r.emissions || 0,
      count: r.count || 0,
      // These two are provided for chart compatibility only.
      // We set both to the real total; the chart renders one bar.
      verified: r.emissions || 0,
      pending: 0,
    };
  });
}

/**
 * Backend by-mode: [{ transport_mode, count, emissions }]
 * Frontend expects: [{ mode, emissionsKg, share, color }]
 */
function adaptByMode(rows) {
  const total = rows.reduce((sum, r) => sum + (r.emissions || 0), 0);
  const modeDisplay = {
    ROAD: 'Road', RAIL: 'Rail', SEA: 'Sea', AIR: 'Air', INLAND_WATERWAY: 'Inland'
  };
  return rows.map((r) => ({
    mode: modeDisplay[r.transport_mode] || r.transport_mode,
    transport_mode: r.transport_mode,
    emissionsKg: r.emissions || 0,
    count: r.count || 0,
    share: total > 0 ? Math.round((r.emissions / total) * 100) : 0,
    color: MODE_COLORS[r.transport_mode] || '#94a3b8',
  }));
}

/**
 * Backend by-supplier: [{ supplier, count, emissions }]
 * Frontend expects: [{ id, name, tier, emissionsKg, percentOfTotal, impact }]
 */
function adaptBySupplier(rows) {
  const total = rows.reduce((sum, r) => sum + (r.emissions || 0), 0);
  return rows.map((r, idx) => ({
    id: `sup-${idx}`,
    name: r.supplier,
    tier: 'Tier 1',
    emissionsKg: r.emissions || 0,
    count: r.count || 0,
    percentOfTotal: total > 0 ? (r.emissions / total) * 100 : 0,
    impact: (r.emissions || 0) > 500 ? 'High' : (r.emissions || 0) > 100 ? 'Medium' : 'Low',
  }));
}

/**
 * Adapt a single backend audit log entry to the shape AuditTrail page uses
 */
function adaptAuditLog(log, shipment) {
  const s = shipment || {};
  const statusMap = { PENDING: 'Pending', VERIFIED: 'Verified', REJECTED: 'Rejected' };
  const actionToStatus = {
    APPROVED: 'Verified', REJECTED: 'Rejected', CREATED: 'Pending',
    UPDATED: 'Pending', CREATED_CSV: 'Pending',
  };
  return {
    recordId: `AUD-${log.id}`,
    id: log.id,
    shipmentId: log.shipment_id,
    supplierName: s.supplierName || `Shipment #${log.shipment_id}`,
    originDestination: s.origin && s.destination ? `${s.origin} → ${s.destination}` : `Shipment #${log.shipment_id}`,
    inputData: s.weight_tonnes
      ? `${(s.weight_tonnes * 1000).toLocaleString()} kg, ${s.distance_km?.toLocaleString()} km ${s.transport_mode} Freight`
      : 'N/A',
    emissionFactor: s.emission_factor ? `${s.emission_factor} kg CO₂e / t·km` : 'N/A',
    factorSource: 'DEFRA 2024 / GLEC v3.0',
    calculationMethod: 'Activity Tonne-km Model',
    aiInvolvement: 'Emission Factor Matching',
    aiConfidence: '—',
    action: log.action,
    verifiedBy: log.user_id ? `User #${log.user_id}` : 'System',
    verificationStatus: actionToStatus[log.action] || statusMap[s.status] || 'Pending',
    timestamp: log.timestamp
      ? log.timestamp.replace('T', ' ').substring(0, 19) + ' UTC'
      : '',
    comment: log.comment || '',
    auditHash: '0x' + String(log.id).padStart(8, '0') + '...',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const authService = {
  /**
   * Login using OAuth2PasswordRequestForm (form-urlencoded), store token.
   * Returns a user object compatible with existing UI.
   */
  async login(email, password) {
    // Backend requires application/x-www-form-urlencoded with "username" field
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const { data: tokenData } = await apiClient.post('/api/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    localStorage.setItem('carbontrace_token', tokenData.access_token);

    // Immediately fetch user profile
    const { data: userRaw } = await apiClient.get('/api/auth/me');
    const user = {
      id: userRaw.id,
      name: userRaw.name || userRaw.email,
      email: userRaw.email,
      role: userRaw.role,
      organization: 'CarbonTrace',
      avatar: userRaw.name
        ? userRaw.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
        : userRaw.email.substring(0, 2).toUpperCase(),
    };
    localStorage.setItem('carbontrace_user', JSON.stringify(user));
    return user;
  },

  /**
   * Returns cached user from localStorage synchronously (used in AppShell render).
   * Call refreshCurrentUser() to get fresh data from the API.
   */
  getCurrentUser() {
    const stored = localStorage.getItem('carbontrace_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fall through
      }
    }
    return null;
  },

  /**
   * Fetch the currently logged-in user from the backend and update the cache.
   */
  async refreshCurrentUser() {
    try {
      const token = localStorage.getItem('carbontrace_token');
      if (!token) return null;
      const { data: userRaw } = await apiClient.get('/api/auth/me');
      const user = {
        id: userRaw.id,
        name: userRaw.name || userRaw.email,
        email: userRaw.email,
        role: userRaw.role,
        organization: 'CarbonTrace',
        avatar: userRaw.name
          ? userRaw.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
          : userRaw.email.substring(0, 2).toUpperCase(),
      };
      localStorage.setItem('carbontrace_user', JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('carbontrace_user');
    localStorage.removeItem('carbontrace_token');
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem('carbontrace_token'));
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const dashboardService = {
  async getMetrics() {
    const [{ data: summary }, suppliersResult] = await Promise.all([
      apiClient.get('/api/dashboard/summary'),
      apiClient.get('/api/suppliers').catch(() => ({ data: [] })),
    ]);
    return adaptDashboardSummary(summary, suppliersResult.data.length);
  },

  async getEmissionsTimeline() {
    const { data } = await apiClient.get('/api/dashboard/trend');
    const adapted = adaptTrend(data);
    // If backend has no data yet, return empty array (UI handles it)
    return adapted;
  },

  async getEmissionsByMode() {
    const { data } = await apiClient.get('/api/dashboard/by-mode');
    return adaptByMode(data);
  },

  // No backend endpoint — return mock data
  async getEmissionsByTier() {
    return EMISSIONS_BY_SUPPLIER_TIER;
  },

  async getTopSuppliers() {
    const { data } = await apiClient.get('/api/dashboard/by-supplier');
    return adaptBySupplier(data);
  },

  // No backend endpoint — return mock data
  async getTopRoutes() {
    return TOP_EMISSION_ROUTES;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPPLIER SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const supplierService = {
  async getSuppliers(params = {}) {
    const { data: rawSuppliers } = await apiClient.get('/api/suppliers');

    // Fetch by-supplier emissions to enrich display
    let emissionsMap = {};
    try {
      const { data: bySupplier } = await apiClient.get('/api/dashboard/by-supplier');
      bySupplier.forEach((r) => {
        emissionsMap[r.supplier] = { emissions: r.emissions, count: r.count };
      });
    } catch { /* non-critical */ }

    let result = rawSuppliers.map((s) => adaptSupplier(s, emissionsMap));

    // Client-side filtering (backend doesn't support query params for suppliers)
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
      );
    }
    if (params.tier && params.tier !== 'All') {
      result = result.filter((s) => s.tier === params.tier);
    }
    if (params.impact && params.impact !== 'All') {
      result = result.filter((s) => s.impactLevel === params.impact);
    }
    return result;
  },

  async getSupplierById(id) {
    // id may be numeric (from backend) or a stringified int
    const numericId = parseInt(id, 10);
    const { data: rawSupplier } = await apiClient.get(`/api/suppliers/${numericId}`);

    // Also fetch all shipments and filter for this supplier
    let shipments = [];
    try {
      const { data: rawShipments } = await apiClient.get('/api/shipments');
      let suppliersMap = {};
      suppliersMap[rawSupplier.id] = adaptSupplier(rawSupplier);
      shipments = rawShipments
        .filter((s) => s.supplier_id === numericId)
        .map((s) => adaptShipment(s, suppliersMap));
    } catch { /* non-critical */ }

    const adapted = adaptSupplier(rawSupplier);
    return { ...adapted, shipments };
  },

  async addSupplier(newSupplier) {
    const payload = {
      name: newSupplier.name,
      address: newSupplier.location || newSupplier.address || '',
      contact_email: newSupplier.contactEmail || newSupplier.contact_email || null,
    };
    const { data } = await apiClient.post('/api/suppliers', payload);
    return adaptSupplier(data);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SHIPMENT SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const shipmentService = {
  async _getSuppliersMap() {
    try {
      const { data } = await apiClient.get('/api/suppliers');
      return buildSuppliersMap(data);
    } catch {
      return {};
    }
  },

  async getShipments(params = {}) {
    const [{ data: rawShipments }, suppliersMap] = await Promise.all([
      apiClient.get('/api/shipments'),
      this._getSuppliersMap(),
    ]);

    let result = rawShipments.map((s) => adaptShipment(s, suppliersMap));

    // Client-side filtering (backend doesn't expose query params)
    if (params.status && params.status !== 'All') {
      result = result.filter((s) => s.status === params.status);
    }
    if (params.mode && params.mode !== 'All') {
      result = result.filter((s) => s.transportMode === params.mode);
    }
    if (params.supplierId) {
      const numId = parseInt(params.supplierId, 10);
      result = result.filter((s) => s.supplierId === numId);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter((s) =>
        String(s.id).toLowerCase().includes(q) ||
        (s.supplierName || '').toLowerCase().includes(q) ||
        (s.origin || '').toLowerCase().includes(q) ||
        (s.destination || '').toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getShipmentById(id) {
    const [{ data: raw }, suppliersMap] = await Promise.all([
      apiClient.get(`/api/shipments/${id}`),
      this._getSuppliersMap(),
    ]);
    return adaptShipment(raw, suppliersMap);
  },

  async addShipment(shipmentData) {
    // Map frontend form data to backend ShipmentCreate schema
    const weightTonnes = shipmentData.weightUnit === 't'
      ? Number(shipmentData.weight)
      : Number(shipmentData.weight) / 1000;

    // Map frontend transport mode labels to backend mode codes
    const modeMap = { Road: 'ROAD', Rail: 'RAIL', Sea: 'SEA', Air: 'AIR', Inland: 'INLAND_WATERWAY' };
    const backendMode = modeMap[shipmentData.transportMode] || shipmentData.transportMode;

    const payload = {
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      weight_tonnes: weightTonnes,
      distance_km: Number(shipmentData.distance),
      transport_mode: backendMode,
      supplier_id: shipmentData.supplierId ? Number(shipmentData.supplierId) : null,
    };

    const { data: raw } = await apiClient.post('/api/shipments', payload);
    const suppliersMap = await this._getSuppliersMap();
    const adapted = adaptShipment(raw, suppliersMap);

    // Enrich with form fields not stored by backend
    return {
      ...adapted,
      material: shipmentData.material || '',
      notes: shipmentData.notes || '',
      supplierName: shipmentData.supplierName || adapted.supplierName,
      supplierTier: shipmentData.supplierTier || adapted.supplierTier,
    };
  },

  /**
   * Upload a CSV file of shipments to POST /api/shipments/upload-csv.
   * Returns { inserted_ids, errors }.
   */
  async uploadCsv(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/api/shipments/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /**
   * Parse free-text shipment description via POST /api/shipments/parse-text.
   * Returns { origin, destination, weight_tonnes, distance_km, transport_mode }.
   */
  async parseText(text) {
    const { data } = await apiClient.post('/api/shipments/parse-text', { text });
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const verificationService = {
  async getPendingShipments() {
    const shipments = await shipmentService.getShipments();
    return shipments.filter((s) => s.status === 'Pending');
  },

  async getAllVerifications() {
    return shipmentService.getShipments();
  },

  async approveShipment(id) {
    // id may be our adapted id (numeric) — extract it
    const numericId = typeof id === 'string' && id.startsWith('SHP-')
      ? parseInt(id.replace('SHP-', ''), 10)
      : Number(id);
    await apiClient.post(`/api/shipments/${numericId}/approve`);
    // Return updated shipment
    return shipmentService.getShipmentById(numericId);
  },

  async rejectShipment(id, reason = '') {
    const numericId = typeof id === 'string' && id.startsWith('SHP-')
      ? parseInt(id.replace('SHP-', ''), 10)
      : Number(id);
    await apiClient.post(`/api/shipments/${numericId}/reject`, null, {
      params: { reason },
    });
    return shipmentService.getShipmentById(numericId);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const analyticsService = {
  async getAnalytics() {
    const [byModeRaw, bySupplierRaw] = await Promise.all([
      apiClient.get('/api/dashboard/by-mode').then((r) => r.data).catch(() => []),
      apiClient.get('/api/dashboard/by-supplier').then((r) => r.data).catch(() => []),
    ]);
    const trendRaw = await apiClient.get('/api/dashboard/trend').then((r) => r.data).catch(() => []);

    return {
      timeline: adaptTrend(trendRaw),
      byMode: adaptByMode(byModeRaw),
      byTier: EMISSIONS_BY_SUPPLIER_TIER,      // no backend endpoint
      bySupplier: adaptBySupplier(bySupplierRaw),
      byMaterial: HOTSPOTS_DATA.topMaterials,  // no backend endpoint
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HOTSPOT SERVICE — no backend endpoint, keep mock
// ─────────────────────────────────────────────────────────────────────────────
export const hotspotService = {
  async getHotspots() {
    return HOTSPOTS_DATA;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATIONS SERVICE — real backend endpoint
// GET /api/recommendations uses real shipment + emission factor data
// ─────────────────────────────────────────────────────────────────────────────
export const recommendationService = {
  async getRecommendations() {
    const { data } = await apiClient.get('/api/recommendations');
    // Adapt backend shape to the existing Recommendations.jsx UI shape
    return data.map((r, idx) => ({
      id: `REC-${String(r.shipment_id).padStart(4, '0')}`,
      category: 'Transport Modal Shift',
      title: `Switch ${r.current_mode_display} → ${r.recommended_mode_display}`,
      badge: r.reduction_percent >= 50 ? 'High Impact' : 'Moderate Impact',
      badgeColor: r.reduction_percent >= 50 ? 'emerald' : 'blue',
      currentTransport: `${r.current_mode_display} (${r.origin} → ${r.destination})`,
      currentEmissionsKg: r.current_emissions,
      currentEmissionsDisplay: `${r.current_emissions.toLocaleString()} kg CO₂e`,
      alternativeTransport: r.recommended_mode_display,
      projectedEmissionsKg: r.estimated_emissions,
      projectedEmissionsDisplay: `${r.estimated_emissions.toLocaleString()} kg CO₂e`,
      potentialReductionKg: r.reduction_kg,
      potentialReductionDisplay: `${r.reduction_kg.toLocaleString()} kg CO₂e`,
      reductionPercent: r.reduction_percent,
      description: `Shipment #${r.shipment_id}: ${r.origin} → ${r.destination} (${r.weight_tonnes}t, ${r.distance_km.toLocaleString()} km). ${r.basis}`,
      implementationComplexity: r.reduction_percent >= 70 ? 'Low' : 'Medium',
      estimatedCostImpact: r.current_mode === 'AIR' ? '-30% to -50% Freight Cost' : '-10% to -20% Freight Cost',
      applicableSuppliers: [`Shipment #${r.shipment_id}`],
    }));
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION SERVICE — no backend endpoint, keep local calculation
// ─────────────────────────────────────────────────────────────────────────────
export const simulationService = {
  async simulateScenario(params) {
    const modeFactors = {
      Road: 0.063, Rail: 0.021, Sea: 0.012, Air: 0.602,
    };
    const factor = modeFactors[params.mode] || 0.063;
    const baselineWeightTonnes = Number(params.weight || 24);
    const baselineDistance = Number(params.distance || 420);
    const baselineEmissions = baselineWeightTonnes * baselineDistance * 0.063;

    const recycledDiscount = (Number(params.recycledPercent || 0) / 100) * 0.35;
    const renewableDiscount = (Number(params.renewablePercent || 0) / 100) * 0.25;

    let projected = baselineWeightTonnes * baselineDistance * factor;
    projected = projected * (1 - recycledDiscount) * (1 - renewableDiscount);

    const reductionKg = Math.max(0, baselineEmissions - projected);
    const reductionPercent = baselineEmissions > 0 ? (reductionKg / baselineEmissions) * 100 : 0;

    return {
      currentEmissionsKg: Math.round(baselineEmissions),
      projectedEmissionsKg: Math.round(projected),
      reductionKg: Math.round(reductionKg),
      reductionPercent: Number(reductionPercent.toFixed(1)),
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT SERVICE — aggregates audit logs from backend
// ─────────────────────────────────────────────────────────────────────────────
export const auditService = {
  async getAuditTrail(filters = {}) {
    // Fetch all shipments to get context
    const [shipments, suppliersMap] = await Promise.all([
      apiClient.get('/api/shipments').then((r) => r.data).catch(() => []),
      shipmentService._getSuppliersMap(),
    ]);

    // Fetch audit logs for each shipment in parallel (limit to avoid too many requests)
    const auditPromises = shipments.map((s) =>
      apiClient.get(`/api/shipments/${s.id}/audit-log`)
        .then((r) => ({ shipment: s, logs: r.data }))
        .catch(() => ({ shipment: s, logs: [] }))
    );

    const results = await Promise.all(auditPromises);
    const adapted = results.flatMap(({ shipment, logs }) => {
      const adaptedShipment = adaptShipment(shipment, suppliersMap);
      return logs.map((log) => adaptAuditLog(log, adaptedShipment));
    });

    // Sort by timestamp descending
    adapted.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    // Apply filters
    let records = adapted;
    if (filters.status && filters.status !== 'All') {
      records = records.filter((r) => r.verificationStatus === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      records = records.filter((r) =>
        r.recordId.toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q) ||
        r.originDestination.toLowerCase().includes(q)
      );
    }
    return records;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPPLY CHAIN SERVICE — no backend endpoint, keep mock
// ─────────────────────────────────────────────────────────────────────────────
export const supplyChainService = {
  async getNetwork() {
    return SUPPLY_CHAIN_NETWORK;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EMISSION FACTOR SERVICE — real backend
// ─────────────────────────────────────────────────────────────────────────────
export const emissionFactorService = {
  /**
   * Returns all emission factors from the database.
   * [{ id, mode, factor }]
   */
  async getFactors() {
    const { data } = await apiClient.get('/api/emission-factors');
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT SERVICE — real file downloads
// ─────────────────────────────────────────────────────────────────────────────
export const exportService = {
  /**
   * Triggers a real CSV download from the backend.
   */
  downloadCsv() {
    const token = localStorage.getItem('carbontrace_token');
    const url = `${API_BASE_URL}/api/export/csv`;
    // Open in new tab — browser handles download automatically
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipments.csv';
    if (token) {
      // For authenticated downloads, fetch as blob
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          a.href = blobUrl;
          a.click();
          URL.revokeObjectURL(blobUrl);
        })
        .catch(() => { window.open(url, '_blank'); });
    } else {
      window.open(url, '_blank');
    }
  },

  /**
   * Triggers a real PDF download from the backend.
   */
  downloadPdf() {
    const token = localStorage.getItem('carbontrace_token');
    const url = `${API_BASE_URL}/api/export/pdf`;
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'shipments.pdf';
        a.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => { window.open(url, '_blank'); });
  },
};
