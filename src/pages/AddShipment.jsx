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
  Scale
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatEmissions, formatNumber } from '../utils/formatters';
import { supplierService, shipmentService } from '../services/api';

export function AddShipment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSupplierId = searchParams.get('supplierId') || '';

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

  useEffect(() => {
    async function load() {
      try {
        const data = await supplierService.getSuppliers();
        setSuppliers(data);

        // If preselected, fill in details
        if (preselectedSupplierId) {
          const match = data.find((s) => s.id === preselectedSupplierId);
          if (match) {
            setFormData((prev) => ({
              ...prev,
              supplierId: match.id,
              supplierName: match.name,
              supplierTier: match.tier
            }));
          }
        } else if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            supplierId: data[0].id,
            supplierName: data[0].name,
            supplierTier: data[0].tier
          }));
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
    const match = suppliers.find((s) => s.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      supplierId: selectedId,
      supplierName: match ? match.name : '',
      supplierTier: match ? match.tier : 'Tier 1'
    }));
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
      Air: 0.602
    };
    const factor = factors[formData.transportMode] || 0.05;
    const weightInTonnes = formData.weightUnit === 't' ? weightNum : weightNum / 1000;
    return weightInTonnes * distNum * factor;
  };

  const validate = () => {
    const errs = {};
    if (!formData.supplierId) errs.supplierId = 'Supplier is required';
    if (!formData.origin.trim()) errs.origin = 'Origin location is required';
    if (!formData.destination.trim()) errs.destination = 'Destination location is required';
    if (!formData.material.trim()) errs.material = 'Material payload is required';

    const weightNum = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weightNum) || weightNum <= 0) {
      errs.weight = 'Weight must be a positive numeric value';
    }

    const distNum = parseFloat(formData.distance);
    if (!formData.distance || isNaN(distNum) || distNum <= 0) {
      errs.distance = 'Distance must be a positive numeric value (km)';
    }

    if (!formData.date) {
      errs.date = 'Valid shipment date is required';
    }

    if (!['Road', 'Rail', 'Sea', 'Air'].includes(formData.transportMode)) {
      errs.transportMode = 'Must select a valid transport mode';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const created = await shipmentService.addShipment(formData);
      setSubmittedShipment(created);
    } catch (err) {
      console.error('Failed to submit shipment:', err);
      setErrors({ form: 'An error occurred while saving the shipment.' });
    } finally {
      setSubmitting(false);
    }
  };

  const previewEmissions = calculatePreview();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Back */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/shipments')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shipments Log</span>
        </button>

        <PageHeader
          title="Log Logistics Shipment"
          description="Register upstream or downstream carrier transport. Submissions are queued for ESG audit and verification."
          badge={
            <span className="badge bg-amber-50 text-amber-800 border border-amber-200">
              Requires ESG Verification
            </span>
          }
        />
      </div>

      {/* Success Notification State */}
      {submittedShipment ? (
        <div className="card-base p-8 border-emerald-200 bg-emerald-50/20 space-y-5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Shipment submitted successfully.</h2>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-600">Verification Status:</span>
                <StatusBadge status="Pending" />
              </div>
              <p className="text-xs text-slate-500 max-w-xl pt-1">
                Shipment record <strong>{submittedShipment.id}</strong> has been logged into the audit ledger. It is now awaiting formal review by the compliance team in the Verification queue.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Supplier:</span>
              <span className="font-semibold text-slate-800">{submittedShipment.supplierName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Route:</span>
              <span className="font-semibold text-slate-800">{submittedShipment.origin} → {submittedShipment.destination}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Transport Mode:</span>
              <span className="font-semibold text-slate-800">{submittedShipment.transportMode}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Estimated Footprint:</span>
              <span className="font-bold text-emerald-800">{formatEmissions(submittedShipment.calculatedEmissionsKg)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <NavLink to="/verification" className="btn-primary text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Go to Verification Center</span>
            </NavLink>
            <NavLink to="/shipments" className="btn-secondary text-xs">
              <span>View in Shipment Ledger</span>
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setSubmittedShipment(null);
                setFormData({
                  supplierId: suppliers[0]?.id || '',
                  supplierName: suppliers[0]?.name || '',
                  supplierTier: suppliers[0]?.tier || 'Tier 1',
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
              }}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-2"
            >
              + Log Another Shipment
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-base p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Shipment Specification</h2>
                <p className="text-xs text-slate-500">Provide freight logistics details for carbon calculation</p>
              </div>
              <span className="text-[11px] text-slate-400">* Required fields</span>
            </div>

            {/* General form error */}
            {errors.form && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Section 1: Supplier & Material */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier Entity *
                </label>
                <select
                  value={formData.supplierId}
                  onChange={handleSupplierChange}
                  className="input-base text-xs"
                  disabled={loadingSuppliers}
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.tier})
                    </option>
                  ))}
                </select>
                {errors.supplierId && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.supplierId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material / Cargo Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cold-Rolled Aluminum Sheet 6061-T6"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="input-base text-xs"
                />
                {errors.material && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.material}</p>
                )}
              </div>
            </div>

            {/* Section 2: Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Origin Location (City, Port, or Facility) *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Duisburg Inland Port, Germany"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="input-base pl-9 text-xs"
                  />
                </div>
                {errors.origin && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.origin}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Location (Facility or Hub) *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Stuttgart Assembly Plant 4, Germany"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="input-base pl-9 text-xs"
                  />
                </div>
                {errors.destination && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.destination}</p>
                )}
              </div>
            </div>

            {/* Section 3: Mode, Weight & Distance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transport Mode *
                </label>
                <select
                  value={formData.transportMode}
                  onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
                  className="input-base text-xs"
                >
                  <option value="Road">Road (Heavy Commercial Truck)</option>
                  <option value="Rail">Rail (Freight Intermodal)</option>
                  <option value="Sea">Sea (Container Vessel)</option>
                  <option value="Air">Air (Dedicated Air Cargo)</option>
                </select>
                {errors.transportMode && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.transportMode}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cargo Weight *
                </label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 24000"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="input-base text-xs flex-1"
                  />
                  <select
                    value={formData.weightUnit}
                    onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                    className="input-base text-xs w-20 bg-slate-50"
                  >
                    <option value="kg">kg</option>
                    <option value="t">tonnes</option>
                  </select>
                </div>
                {errors.weight && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.weight}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Distance (km) *
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 420"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  className="input-base text-xs"
                />
                {errors.distance && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.distance}</p>
                )}
              </div>
            </div>

            {/* Section 4: Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shipment Execution Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-base text-xs"
                />
                {errors.date && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Audit Notes / Bill of Lading Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. BOL-88492, verified Euro VI vehicle"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-base text-xs"
                />
              </div>
            </div>
          </div>

          {/* Client Preview Box (Annotated as non-authoritative) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Estimated Carbon Preview:</span>
                <span className="text-sm font-extrabold text-emerald-800">
                  {formatEmissions(previewEmissions)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 max-w-xl">
                Note: This is an estimated client preview. The FastAPI backend will be the authoritative source for distance validation, verified emission factors, and GLEC/DEFRA audit compliance.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/shipments')}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-xs"
              >
                {submitting ? 'Transmitting...' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
