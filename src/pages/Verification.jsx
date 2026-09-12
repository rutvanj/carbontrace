import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Check,
  X,
  FileCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/common/DataTable';
import { LoadingState } from '../components/common/FeedbackStates';
import { formatEmissions, formatNumber, formatDate } from '../utils/formatters';
import { verificationService } from '../services/api';

export function Verification() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending', 'Verified', 'Rejected', 'All'
  const [inspectRecord, setInspectRecord] = useState(null);

  // Reject Modal State
  const [rejectingRecord, setRejectingRecord] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Toast / notification feedback
  const [bannerNotice, setBannerNotice] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const all = await verificationService.getAllVerifications();
      setRecords(all);
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (record) => {
    setActionLoading(true);
    try {
      await verificationService.approveShipment(record.id, 'Verified via CarbonTrace ESG Compliance Review');
      setBannerNotice({
        type: 'success',
        message: `Shipment ${record.id} (${record.supplierName}) has been officially VERIFIED and included in official Scope 3 reporting.`
      });
      await loadData();
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingRecord) return;
    setActionLoading(true);
    try {
      await verificationService.rejectShipment(rejectingRecord.id, rejectReason);
      setBannerNotice({
        type: 'error',
        message: `Shipment ${rejectingRecord.id} rejected. Reason: "${rejectReason || 'Data discrepancy in transport manifest.'}"`
      });
      setRejectingRecord(null);
      setRejectReason('');
      await loadData();
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (activeTab === 'All') return true;
    return r.status === activeTab;
  });

  const pendingCount = records.filter((r) => r.status === 'Pending').length;
  const verifiedCount = records.filter((r) => r.status === 'Verified').length;
  const rejectedCount = records.filter((r) => r.status === 'Rejected').length;

  const columns = [
    {
      key: 'id',
      header: 'Record ID',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900">{val}</span>
          <div className="text-[10px] text-slate-400">{formatDate(row.date)}</div>
        </div>
      )
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{val}</div>
          <div className="text-[11px] text-slate-500">{row.supplierTier}</div>
        </div>
      )
    },
    {
      key: 'route',
      header: 'Transport Route',
      render: (_, row) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800">{row.origin}</div>
          <div className="text-slate-400">↳ {row.destination}</div>
        </div>
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
      key: 'weightKg',
      header: 'Weight',
      align: 'right',
      render: (val) => <span className="text-xs font-medium text-slate-700">{formatNumber(val)} kg</span>
    },
    {
      key: 'distanceKm',
      header: 'Distance',
      align: 'right',
      render: (val) => <span className="text-xs font-medium text-slate-700">{formatNumber(val)} km</span>
    },
    {
      key: 'emissionFactor',
      header: 'Factor',
      align: 'right',
      render: (val) => <span className="text-[11px] text-slate-500">{val} kg/t·km</span>
    },
    {
      key: 'calculatedEmissionsKg',
      header: 'Emissions',
      align: 'right',
      render: (val) => <span className="font-bold text-slate-900">{formatEmissions(val)}</span>
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      header: 'Audit Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setInspectRecord(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Inspect Provenance"
          >
            <Eye className="w-4 h-4" />
          </button>

          {row.status === 'Pending' && (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleApprove(row)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                title="Approve record as Official Verified Emission"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Approve</span>
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setRejectingRecord(row)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                title="Reject with audit deviation note"
              >
                <X className="w-3.5 h-3.5 text-rose-600" />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification Center"
        description="Strict ESG review gatekeeper. Only verified records enter official statutory corporate reporting and public disclosures."
        badge={
          <span className="badge bg-amber-50 text-amber-800 border border-amber-200">
            {pendingCount} Awaiting Compliance Approval
          </span>
        }
      />

      {/* Banner Feedback */}
      {bannerNotice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{bannerNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerNotice(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Principles Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Audit Principle:</strong> Pending shipments carry unverified estimates. Once approved, the backend marks the entry as auditable and locks the emission calculation.
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-700 font-medium shrink-0">
          <span>Official Verified: <strong>{verifiedCount}</strong></span>
          <span>Pending: <strong>{pendingCount}</strong></span>
          <span>Rejected: <strong>{rejectedCount}</strong></span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('Pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'Pending'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('Verified')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'Verified'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Verified Official ({verifiedCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('Rejected')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'Rejected'
              ? 'bg-rose-100 text-rose-900 border border-rose-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'All'
              ? 'bg-slate-800 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Records ({records.length})
        </button>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingState message="Loading verification records..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredRecords}
          keyField="id"
          onRowClick={(row) => setInspectRecord(row)}
          emptyMessage={`No records found in "${activeTab}" state.`}
        />
      )}

      {/* Rejection Confirmation Modal */}
      <Modal
        isOpen={Boolean(rejectingRecord)}
        onClose={() => setRejectingRecord(null)}
        title={`Reject Shipment ${rejectingRecord?.id}?`}
        subtitle="Provide a non-compliance reason for supplier feedback and audit trail"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRejectingRecord(null)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRejectConfirm}
              className="btn-danger text-xs"
            >
              {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Rejecting this shipment will remove its emissions from prospective corporate reporting and notify <strong>{rejectingRecord?.supplierName}</strong> to rectify shipping documents.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Deviation Reason *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Weight docket mismatch with bill of lading; incorrect transport route specified."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input-base text-xs"
            />
          </div>
        </div>
      </Modal>

      {/* Inspection Modal */}
      <Modal
        isOpen={Boolean(inspectRecord)}
        onClose={() => setInspectRecord(null)}
        title={`Verification Details: ${inspectRecord?.id}`}
        subtitle="Detailed factor attribution and submission metadata"
        footer={
          <div className="flex items-center justify-between w-full">
            <StatusBadge status={inspectRecord?.status} />
            <button
              type="button"
              onClick={() => setInspectRecord(null)}
              className="btn-secondary text-xs"
            >
              Close
            </button>
          </div>
        }
      >
        {inspectRecord && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block mb-0.5">Supplier:</span>
                <span className="font-semibold text-slate-800">{inspectRecord.supplierName}</span>
                <span className="text-slate-500 block text-[11px]">{inspectRecord.supplierTier}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Material:</span>
                <span className="font-semibold text-slate-800">{inspectRecord.material}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Route:</span>
                <span className="font-medium text-slate-800">{inspectRecord.origin} → {inspectRecord.destination}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Emissions:</span>
                <span className="font-extrabold text-emerald-800 text-sm">
                  {formatEmissions(inspectRecord.calculatedEmissionsKg)}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted By:</span>
                <span className="font-medium text-slate-800">{inspectRecord.submittedBy || 'API EDI Connector'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emission Factor Source:</span>
                <span className="font-medium text-slate-800">GLEC Framework v3.0 / DEFRA 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Calculated Distance:</span>
                <span className="font-medium text-slate-800">{formatNumber(inspectRecord.distanceKm)} km ({inspectRecord.transportMode})</span>
              </div>
              {inspectRecord.aiEstimated && (
                <div className="flex justify-between text-indigo-700 font-semibold pt-1 border-t border-slate-100">
                  <span>AI Estimation Model Confidence:</span>
                  <span>{inspectRecord.aiConfidence}%</span>
                </div>
              )}
            </div>

            {inspectRecord.notes && (
              <div className="p-2.5 rounded bg-slate-50 text-[11px] text-slate-600 border border-slate-200">
                <span className="font-semibold block mb-0.5">Notes:</span>
                <span className="italic">{inspectRecord.notes}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
