import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Info,
  Calendar,
  Layers,
  MapPin,
  Scale,
  FileSpreadsheet,
  Upload,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatEmissions, formatNumber } from '../utils/formatters';
import { supplierService, shipmentService } from '../services/api';

export function AddShipment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSupplierId = searchParams.get('supplierId') || '';

  // Tab mode: 'form' | 'ai-text' | 'csv'
  const [activeTab, setActiveTab] = useState('form');

  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submittedShipment, setSubmittedShipment] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    supplierId: preselectedSupplierId,
    supplierName: '',
    supplierTier: 'Tier 1',
    origin: '',
    destination: '',
    material: '',
    weight: '',
    weightUnit: 'kg',
    transportMode: 'Road',
    distance: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // AI Free-Text Parsing State
  const [rawText, setRawText] = useState('');
  const [parsingText, setParsingText] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);

  // CSV Upload State
  const [csvFile, setCsvFile] = useState(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [csvResult, setCsvResult] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await supplierService.getSuppliers();
        setSuppliers(data);

        // If preselected, fill in details
        if (preselectedSupplierId) {
          const match = data.find((s) => String(s.id) === String(preselectedSupplierId));
          if (match) {
            setFormData((prev) => ({
              ...prev,
              supplierId: match.id,
              supplierName: match.name,
              supplierTier: match.tier
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load suppliers:', err);
      } finally {
        setLoadingSuppliers(false);
      }
    }
    load();
  }, [preselectedSupplierId]);

  const handleSupplierChange = (e) => {
    const selectedId = e.target.value;
    const match = suppliers.find((s) => String(s.id) === String(selectedId));
    setFormData((prev) => ({
      ...prev,
      supplierId: selectedId,
      supplierName: match ? match.name : '',
      supplierTier: match ? match.tier : 'Tier 1'
    }));
    if (selectedId) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.supplierId;
        return next;
      });
    }
  };

  const handleWeightChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, weight: val }));
    if (val !== '' && !isNaN(parseFloat(val)) && parseFloat(val) > 0) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.weight;
        return next;
      });
    }
  };

  const handleDistanceChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, distance: val }));
    if (val !== '' && !isNaN(parseFloat(val)) && parseFloat(val) > 0) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.distance;
        return next;
      });
    }
  };

  // Live preview estimation (Clearly annotated as non-authoritative client preview)
  const calculatePreview = () => {
    const weightNum = parseFloat(formData.weight);
    const distNum = parseFloat(formData.distance);
    if (!weightNum || !distNum || weightNum <= 0 || distNum <= 0) return 0;

    const factors = {
      Road: 0.063,
      Rail: 0.021,
      Sea: 0.012,
      Air: 0.602,
      Inland: 0.031
    };
    const factor = factors[formData.transportMode] || 0.05;
    const weightInTonnes = formData.weightUnit === 't' ? weightNum : weightNum / 1000;
    return Math.round(weightInTonnes * distNum * factor * 10) / 10;
  };

  const validate = () => {
    const errs = {};
    if (!formData.supplierId) errs.supplierId = 'Supplier entity is required';
    if (!formData.origin.trim()) errs.origin = 'Origin location is required';
    if (!formData.destination.trim()) errs.destination = 'Destination location is required';
    if (!formData.material.trim()) errs.material = 'Material / cargo payload is required';

    if (formData.weight === '' || formData.weight === null || formData.weight === undefined || String(formData.weight).trim() === '') {
      errs.weight = 'Cargo weight is required.';
    } else {
      const weightNum = parseFloat(formData.weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        errs.weight = 'Cargo weight must be greater than 0.';
      }
    }

    if (formData.distance === '' || formData.distance === null || formData.distance === undefined || String(formData.distance).trim() === '') {
      errs.distance = 'Distance is required.';
    } else {
      const distNum = parseFloat(formData.distance);
      if (isNaN(distNum) || distNum <= 0) {
        errs.distance = 'Distance must be greater than 0.';
      }
    }

    if (!formData.date) {
      errs.date = 'Valid shipment execution date is required';
    }

    if (!['Road', 'Rail', 'Sea', 'Air', 'Inland'].includes(formData.transportMode)) {
      errs.transportMode = 'Must select a valid transport mode';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      const created = await shipmentService.addShipment(formData);
      setSubmittedShipment(created);
    } catch (err) {
      console.error('Failed to submit shipment:', err);
      const detail = err?.response?.data?.detail;
      setErrors({ form: detail || 'An error occurred while transmitting the shipment to the calculation engine.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Free-Text AI Parsing Handler
  const handleParseText = async () => {
    if (!rawText.trim()) return;
    setParsingText(true);
    setErrors({});
    setParseSuccess(false);

    try {
      const parsed = await shipmentService.parseText(rawText);
      // Map backend mode to frontend select options
      const modeMap = {
        ROAD: 'Road',
        RAIL: 'Rail',
        SEA: 'Sea',
        AIR: 'Air',
        INLAND_WATERWAY: 'Inland'
      };

      setFormData((prev) => ({
        ...prev,
        origin: parsed.origin || prev.origin,
        destination: parsed.destination || prev.destination,
        weight: parsed.weight_tonnes ? String(parsed.weight_tonnes * 1000) : prev.weight,
        weightUnit: 'kg',
        distance: parsed.distance_km ? String(parsed.distance_km) : prev.distance,
        transportMode: modeMap[parsed.transport_mode] || prev.transportMode,
        material: prev.material || 'Processed Goods',
      }));

      setParseSuccess(true);
      setActiveTab('form');
    } catch (err) {
      console.error('Failed to parse text:', err);
      setErrors({ text: 'AI extraction service could not parse shipment text. Please enter details manually.' });
    } finally {
      setParsingText(false);
    }
  };

  // CSV File Upload Handler
  const handleUploadCsv = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setUploadingCsv(true);
    setErrors({});
    setCsvResult(null);

    try {
      const res = await shipmentService.uploadCsv(csvFile);
      setCsvResult(res);
    } catch (err) {
      console.error('CSV upload failed:', err);
      const detail = err?.response?.data?.detail;
      setErrors({ csv: detail || 'Failed to process CSV file. Ensure required columns: origin, destination, weight_tonnes, distance_km, transport_mode.' });
    } finally {
      setUploadingCsv(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const header = 'origin,destination,weight_tonnes,distance_km,transport_mode,supplier_id\n';
    const rows = [
      'Rotterdam Port,Munich Assembly,24.5,780,RAIL,1\n',
      'Antwerp Terminal,Frankfurt Hub,18.0,410,ROAD,2\n',
      'Shanghai Port,Hamburg Port,55.0,19500,SEA,1\n'
    ].join('');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carbontrace_shipments_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewEmissions = calculatePreview();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Back */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/shipments')}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#687266] hover:text-[#0F3D2E] mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shipments Log</span>
        </button>

        <PageHeader
          title="Trace: Log Freight Shipment"
          description="Register upstream or downstream carrier transport. Submissions are hashed and queued for ESG verification."
          badge={
            <span className="badge bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
              Step 1: TRACE (Activity Ingestion)
            </span>
          }
        />
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2.5 border-b border-[#D8CBB4] pb-2.5">
        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`px-4.5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'form'
              ? 'bg-[#0F3D2E] text-white shadow-subtle'
              : 'bg-[#F8F3E8] text-[#17352B] border border-[#D8CBB4] hover:bg-[#E8DEC9]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Manual Entry Form</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai-text')}
          className={`px-4.5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'ai-text'
              ? 'bg-[#0F3D2E] text-white shadow-subtle'
              : 'bg-[#F8F3E8] text-[#17352B] border border-[#D8CBB4] hover:bg-[#E8DEC9]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#D97706]" />
          <span>AI Text Parser</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('csv')}
          className={`px-4.5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'csv'
              ? 'bg-[#0F3D2E] text-white shadow-subtle'
              : 'bg-[#F8F3E8] text-[#17352B] border border-[#D8CBB4] hover:bg-[#E8DEC9]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Bulk CSV Upload</span>
        </button>
      </div>

      {/* Parse Success Pill */}
      {parseSuccess && (
        <div className="p-3 rounded-xl bg-[#E2EBE5] border border-[#1F5D46]/40 text-xs text-[#0F3D2E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0F3D2E]" />
            <span>AI successfully extracted logistics parameters into the form below. Review and submit.</span>
          </div>
          <button
            type="button"
            onClick={() => setParseSuccess(false)}
            className="font-bold text-[#0F3D2E] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: FORM VIEW */}
      {activeTab === 'form' && (
        submittedShipment ? (
          <div className="card-base p-8 border-[#1F5D46]/40 bg-[#E2EBE5]/50 space-y-5 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0F3D2E] flex items-center justify-center text-white shrink-0 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-[#17352B]">Shipment Submitted Successfully</h2>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-[#687266] font-semibold">Verification State:</span>
                  <StatusBadge status="Pending" />
                </div>
                <p className="text-xs text-[#687266] max-w-xl pt-1 leading-relaxed">
                  Shipment record <strong>#{submittedShipment.id}</strong> has been logged into the ledger with calculated Scope 3 emissions. It is now queued for ESG review in the Verification queue.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#D8CBB4] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#687266] block font-medium">Supplier:</span>
                <span className="font-bold text-[#17352B]">{submittedShipment.supplierName}</span>
              </div>
              <div>
                <span className="text-[#687266] block font-medium">Route:</span>
                <span className="font-bold text-[#17352B]">{submittedShipment.origin} → {submittedShipment.destination}</span>
              </div>
              <div>
                <span className="text-[#687266] block font-medium">Transport Mode:</span>
                <span className="font-bold text-[#17352B]">{submittedShipment.transportMode}</span>
              </div>
              <div>
                <span className="text-[#687266] block font-medium">Calculated Footprint:</span>
                <span className="font-extrabold text-[#0F3D2E] text-sm">{formatEmissions(submittedShipment.calculatedEmissionsKg || submittedShipment.emissions)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <NavLink to="/verification" className="btn-primary text-xs py-2 px-4">
                <ShieldCheck className="w-4 h-4" />
                <span>Open Verification Center</span>
              </NavLink>
              <NavLink to="/shipments" className="btn-secondary text-xs py-2 px-4">
                <span>View in Shipment Ledger</span>
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  setSubmittedShipment(null);
                  setFormData({
                    supplierId: '',
                    supplierName: '',
                    supplierTier: 'Tier 1',
                    origin: '',
                    destination: '',
                    material: '',
                    weight: '',
                    weightUnit: 'kg',
                    transportMode: 'Road',
                    distance: '',
                    date: new Date().toISOString().split('T')[0],
                    notes: ''
                  });
                  setErrors({});
                }}
                className="text-xs text-[#0F3D2E] hover:underline font-bold px-3 py-2"
              >
                + Log Another Shipment
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card-base p-6 space-y-5 border border-[#D8CBB4]">
              <div className="border-b border-[#D8CBB4]/60 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#17352B]">Shipment Specification</h2>
                  <p className="text-sm text-[#687266]">Complete freight telemetry parameters for activity-based emissions calculation</p>
                </div>
                <span className="text-xs font-semibold text-[#8C998B]">* Required fields</span>
              </div>

              {/* General form error */}
              {errors.form && (
                <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-sm flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                  <span>{errors.form}</span>
                </div>
              )}

              {/* Section 1: Supplier & Material */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#17352B] mb-1.5">
                    1. Supplier Entity *
                  </label>
                  <select
                    id="supplier-entity-select"
                    value={formData.supplierId || ''}
                    onChange={handleSupplierChange}
                    className="input-base text-sm"
                    disabled={loadingSuppliers}
                  >
                    <option value="">
                      {loadingSuppliers ? 'Loading suppliers...' : 'Select Supplier Entity'}
                    </option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.tier})
                      </option>
                    ))}
                  </select>
                  {errors.supplierId && (
                    <p className="mt-1 text-xs text-[#991B1B] font-semibold">{errors.supplierId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#17352B] mb-1.5">
                    2. Material / Cargo Description *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cold-Rolled Aluminum Sheet 6061-T6"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="input-base text-sm"
                  />
                  {errors.material && (
                    <p className="mt-1 text-xs text-[#991B1B] font-semibold">{errors.material}</p>
                  )}
                </div>
              </div>

              {/* Section 2: Origin & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#17352B] mb-1.5">
                    3. Origin Location *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#8C998B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Duisburg Inland Port, Germany"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="input-base pl-9 text-sm"
                    />
                  </div>
                  {errors.origin && (
                    <p className="mt-1 text-xs text-[#991B1B] font-semibold">{errors.origin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#17352B] mb-1.5">
                    4. Destination Location *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#8C998B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Stuttgart Assembly Plant 4, Germany"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="input-base pl-9 text-sm"
                    />
                  </div>
                  {errors.destination && (
                    <p className="mt-1 text-xs text-[#991B1B] font-semibold">{errors.destination}</p>
                  )}
                </div>
              </div>

              {/* Section 3: Mode, Weight & Distance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#17352B] mb-1.5">
                    5. Transport Mode *
                  </label>
                  <select
                    value={formData.transportMode}
                    onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
                    className="input-base text-sm"
                  >
                    <option value="Road">Road (Heavy Commercial Truck)</option>
                    <option value="Rail">Rail (Freight Intermodal)</option>
                    <option value="Sea">Sea (Container Vessel)</option>
                    <option value="Air">Air (Dedicated Air Cargo)</option>
                    <option value="Inland">Inland Waterway / Barge</option>
                  </select>
                  {errors.transportMode && (
                    <p className="mt-1 text-xs text-[#991B1B] font-semibold">{errors.transportMode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#17352B] mb-1.5">
                    6. Cargo Weight *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 24000"
                      value={formData.weight}
                      onChange={handleWeightChange}
                      className="input-base text-sm flex-1"
                    />
                    <select
                      value={formData.weightUnit}
                      onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                      className="input-base text-sm w-24 bg-[#E8DEC9] font-bold text-[#17352B]"
                    >
                      <option value="kg">kg</option>
                      <option value="t">tonnes</option>
                    </select>
                  </div>
                  {errors.weight && (
                    <p className="mt-1 text-xs text-[#991B1B] font-semibold">{errors.weight}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#17352B] mb-1.5">
                    7. Distance (km) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 420"
                    value={formData.distance}
                    onChange={handleDistanceChange}
                    className="input-base text-sm"
                  />
                  {errors.distance && (
                    <p className="mt-1 text-xs text-[#991B1B] font-semibold">{errors.distance}</p>
                  )}
                </div>
              </div>

              {/* Section 4: Date & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#17352B] mb-1.5">
                    8. Shipment Execution Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-base text-sm"
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-[#991B1B] font-semibold">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#17352B] mb-1.5">
                    9. Audit Notes / Bill of Lading Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BOL-88492, verified Euro VI vehicle"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-base text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Client Live Preview Box */}
            <div className="p-4.5 rounded-xl bg-[#F8F3E8] border border-[#D8CBB4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#17352B]">Estimated Carbon Preview:</span>
                  <span className="text-xl font-extrabold text-[#0F3D2E]">
                    {formatEmissions(previewEmissions)}
                  </span>
                </div>
                <p className="text-xs text-[#687266] max-w-xl">
                  GLEC v3.0 / DEFRA activity factor model. Official verification is locked upon compliance verifier sign-off.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/shipments')}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-sm py-2 px-4"
                >
                  {submitting ? 'Transmitting to Engine...' : 'Submit for Verification'}
                </button>
              </div>
            </div>
          </form>
        )
      )}

      {/* TAB 2: AI TEXT PARSER */}
      {activeTab === 'ai-text' && (
        <div className="card-base p-6 space-y-4 border border-[#D8CBB4]">
          <div className="flex items-start justify-between border-b border-[#D8CBB4]/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#17352B] flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-[#D97706]" />
                <span>AI Freight Text Ingestion</span>
              </h2>
              <p className="text-sm text-[#687266] mt-0.5">
                Paste an email dispatch, bill of lading snippet, or carrier memo. The NLP parser extracts origin, destination, weight, distance, and mode.
              </p>
            </div>
          </div>

          {errors.text && (
            <div className="p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-sm font-medium">
              {errors.text}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#17352B]">
              Carrier Dispatch / Shipment Free Text
            </label>
            <textarea
              rows={5}
              placeholder="e.g. Dispatched 48 tonnes of structural steel beams from Antwerp Port to Munich Logistics Center via Rail Freight across 780 km."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="input-base text-sm leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[#687266]">
              Quick sample:{' '}
              <button
                type="button"
                onClick={() => setRawText('Transported 24.5 tonnes of cold-rolled aluminum from Rotterdam Terminal to Stuttgart Assembly by rail over 620 km on 2026-09-12.')}
                className="text-[#0F3D2E] underline font-semibold hover:text-[#1F5D46]"
              >
                Insert sample text
              </button>
            </div>

            <button
              type="button"
              disabled={parsingText || !rawText.trim()}
              onClick={handleParseText}
              className="btn-primary text-sm py-2 px-4"
            >
              {parsingText ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Parameters...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Parse & Autofill Form</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: BULK CSV UPLOAD */}
      {activeTab === 'csv' && (
        <div className="card-base p-6 space-y-5 border border-[#D8CBB4]">
          <div className="flex items-start justify-between border-b border-[#D8CBB4]/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#17352B] flex items-center gap-2">
                <FileSpreadsheet className="w-4.5 h-4.5 text-[#0F3D2E]" />
                <span>Bulk CSV Shipment Ingestion</span>
              </h2>
              <p className="text-sm text-[#687266] mt-0.5">
                Upload batches of carrier shipments. Fast-track Scope 3 baseline data collection across logistics providers.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="btn-secondary text-sm py-2 px-3.5"
              title="Download CSV format template"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </button>
          </div>

          {errors.csv && (
            <div className="p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-sm font-medium">
              {errors.csv}
            </div>
          )}

          {csvResult && (
            <div className="p-4 rounded-xl bg-[#E2EBE5] border border-[#1F5D46]/40 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F3D2E]">
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>Bulk Ingestion Complete</span>
              </div>
              <p className="text-sm text-[#17352B]">
                Successfully processed <strong>{csvResult.inserted_ids?.length || 0}</strong> shipments into the ledger.
              </p>
              <div className="pt-1">
                <NavLink to="/shipments" className="btn-primary text-sm py-2 px-4">
                  View Uploaded Shipments
                </NavLink>
              </div>
            </div>
          )}

          <form onSubmit={handleUploadCsv} className="space-y-4">
            <div className="border-2 border-dashed border-[#D8CBB4] rounded-2xl p-8 text-center bg-[#FDFBF7] hover:bg-[#F8F3E8] transition-colors">
              <Upload className="w-9 h-9 text-[#0F3D2E] mx-auto mb-2" />
              <div className="text-sm font-bold text-[#17352B]">
                {csvFile ? csvFile.name : 'Select or drag & drop a .csv freight file'}
              </div>
              <p className="text-xs text-[#687266] mt-1">
                Columns: origin, destination, weight_tonnes, distance_km, transport_mode, supplier_id
              </p>
              <label className="mt-4 inline-block">
                <span className="btn-secondary text-sm py-2 px-4 cursor-pointer">
                  Browse Files
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={uploadingCsv || !csvFile}
                className="btn-primary text-sm py-2 px-4"
              >
                {uploadingCsv ? 'Processing Ingestion...' : 'Upload & Compute Emissions'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
