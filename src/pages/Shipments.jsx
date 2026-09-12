import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  MapPin,
  Calendar,
  Scale
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/FeedbackStates';
import { formatEmissions, formatNumber, formatDate } from '../utils/formatters';
import { shipmentService } from '../services/api';

export function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [activeShipment, setActiveShipment] = useState(null);
  const navigate = useNavigate();

  const loadShipments = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getShipments({
        search,
        status: selectedStatus,
        mode: selectedMode,
        supplierId: searchParams.get('supplierId') || undefined
      });
      setShipments(data);
    } catch (err) {
      console.error('Failed to load shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, [search, selectedStatus, selectedMode, searchParams]);

  const handleReset = () => {
    setSearch('');
    setSelectedStatus('All');
    setSelectedMode('All');
  };

  const columns = [
    {
      key: 'id',
      header: 'Shipment ID',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900">{val}</span>
          {row.aiEstimated && (
            <span className="block text-[10px] text-indigo-600 font-medium">AI Factor {row.aiConfidence}%</span>
          )}
        </div>
      )
    },
    {
      key: 'supplierName',
      header: 'Supplier & Tier',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{val}</div>
          <div className="text-[11px] text-slate-500">{row.supplierTier}</div>
        </div>
      )
    },
    {
      key: 'route',
      header: 'Route (Origin → Destination)',
      render: (_, row) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800">{row.origin}</div>
          <div className="text-slate-400">↳ {row.destination}</div>
        </div>
      )
    },
    {
      key: 'weightKg',
      header: 'Weight',
      align: 'right',
      render: (val) => (
        <span className="text-xs font-medium text-slate-700">
          {formatNumber(val)} kg
        </span>
      )
    },
    {
      key: 'transportMode',
      header: 'Mode',
      render: (val) => (
        <span className="badge bg-slate-100 text-slate-800 border border-slate-200">
          {val}
        </span>
      )
    },
    {
      key: 'distanceKm',
      header: 'Distance',
      align: 'right',
      render: (val) => (
        <span className="text-xs font-medium text-slate-700">
          {formatNumber(val)} km
        </span>
      )
    },
    {
      key: 'calculatedEmissionsKg',
      header: 'Calculated CO₂e',
      align: 'right',
      render: (val) => (
        <span className="font-bold text-slate-900">
          {formatEmissions(val)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'date',
      header: 'Date',
      align: 'right',
      render: (val) => formatDate(val)
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveShipment(row);
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Inspect Shipment Provenance"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipment Logistics Log"
        description="Comprehensive audit ledger of freight shipments, carrier waypoints, emission factors, and verification states."
        actions={
          <NavLink to="/shipments/new" className="btn-primary text-xs">
            <Plus className="w-4 h-4" />
            <span>Add New Shipment</span>
          </NavLink>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by ID, supplier, route, or material..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: ['All', 'Verified', 'Pending', 'Rejected']
          },
          {
            key: 'mode',
            label: 'Mode',
            value: selectedMode,
            onChange: setSelectedMode,
            options: ['All', 'Road', 'Rail', 'Sea', 'Air']
          }
        ]}
        onReset={handleReset}
        totalCount={shipments.length}
        filteredCount={shipments.length}
      />

      {/* Shipments Table */}
      {loading ? (
        <LoadingState message="Loading shipment freight logs..." />
      ) : (
        <DataTable
          columns={columns}
          data={shipments}
          keyField="id"
          onRowClick={(row) => setActiveShipment(row)}
          emptyMessage="No shipments found for the selected filters."
        />
      )}

      {/* Shipment Details Provenance Modal */}
      <Modal
        isOpen={Boolean(activeShipment)}
        onClose={() => setActiveShipment(null)}
        title={`Shipment Dossier: ${activeShipment?.id}`}
        subtitle="Full telemetry, emission calculation methodology, and audit trail"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Status:</span>
              <StatusBadge status={activeShipment?.status} />
            </div>
            <button
              type="button"
              onClick={() => setActiveShipment(null)}
              className="btn-secondary text-xs"
            >
              Close Dossier
            </button>
          </div>
        }
      >
        {activeShipment && (
          <div className="space-y-4 text-xs">
            {/* Top row metadata */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block mb-0.5">Supplier:</span>
                <span className="font-semibold text-slate-900">{activeShipment.supplierName}</span>
                <span className="text-slate-500 block text-[11px]">{activeShipment.supplierTier}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Material:</span>
                <span className="font-semibold text-slate-800">{activeShipment.material}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Shipment Date:</span>
                <span className="font-semibold text-slate-800">{formatDate(activeShipment.date)}</span>
              </div>
            </div>

            {/* Logistics & Calculation Breakdown */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                Calculated Scope 3 Emissions
              </h3>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Calculated Footprint:</span>
                <span className="text-base font-extrabold text-emerald-800">
                  {formatEmissions(activeShipment.calculatedEmissionsKg)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>Weight: <strong>{formatNumber(activeShipment.weightKg)} kg</strong></div>
                <div>Distance: <strong>{formatNumber(activeShipment.distanceKm)} km</strong></div>
                <div>Transport Mode: <strong>{activeShipment.transportMode}</strong></div>
                <div>Emission Factor: <strong>{activeShipment.emissionFactor} kg CO₂e / t·km</strong></div>
              </div>

              {activeShipment.aiEstimated && (
                <div className="mt-2 p-2.5 rounded bg-indigo-50/70 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>AI Route & Emission Estimation Model</span>
                  </div>
                  <span className="font-bold">{activeShipment.aiConfidence}% Confidence</span>
                </div>
              )}
            </div>

            {/* Verification & Submission Trail */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-2 text-[11px]">
              <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Audit Provenance & Compliance
              </h3>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted By:</span>
                <span className="font-medium text-slate-800">{activeShipment.submittedBy || 'API EDI Connector'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verified By:</span>
                <span className="font-medium text-slate-800">{activeShipment.verifiedBy || 'Pending Compliance Review'}</span>
              </div>
              {activeShipment.verificationDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Timestamp:</span>
                  <span className="font-medium text-slate-800">{formatDate(activeShipment.verificationDate)}</span>
                </div>
              )}
              {activeShipment.notes && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Notes / Waybill References:</span>
                  <span className="text-slate-700 italic">{activeShipment.notes}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
