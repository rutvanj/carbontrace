import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Hash,
  Database
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/FeedbackStates';
import { auditService } from '../services/api';

export function AuditTrail() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedAI, setSelectedAI] = useState('All');
  const [inspectAudit, setInspectAudit] = useState(null);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const data = await auditService.getAuditTrail({
        search,
        status: selectedStatus
      });
      setRecords(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, [search, selectedStatus]);

  const handleReset = () => {
    setSearch('');
    setSelectedStatus('All');
    setSelectedAI('All');
  };

  const filteredRecords = records.filter((r) => {
    if (selectedAI === 'AI Ingestion' && !r.aiInvolvement.includes('AI') && !r.aiInvolvement.includes('OCR')) {
      return false;
    }
    if (selectedAI === 'Primary Only' && (r.aiInvolvement.includes('AI') || r.aiInvolvement.includes('OCR'))) {
      return false;
    }
    return true;
  });

  const columns = [
    {
      key: 'recordId',
      header: 'Audit ID & Hash',
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-xs text-slate-900">{val}</span>
          <div className="font-mono text-[10px] text-slate-400">{row.auditHash}</div>
        </div>
      )
    },
    {
      key: 'supplierName',
      header: 'Supplier & Shipment',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{val}</div>
          <div className="text-[11px] text-slate-500">{row.shipmentId} • {row.originDestination}</div>
        </div>
      )
    },
    {
      key: 'inputData',
      header: 'Telemetry Input Data',
      render: (val) => (
        <span className="text-xs text-slate-700 truncate max-w-[200px] inline-block">
          {val}
        </span>
      )
    },
    {
      key: 'factorSource',
      header: 'Factor & Standard',
      render: (val, row) => (
        <div>
          <div className="font-mono font-semibold text-[11px] text-slate-800">{row.emissionFactor}</div>
          <div className="text-[10px] text-slate-500 truncate max-w-[170px]">{val}</div>
        </div>
      )
    },
    {
      key: 'calculationMethod',
      header: 'Calculation Model',
      render: (val) => (
        <span className="text-xs text-slate-600 truncate max-w-[150px] inline-block">
          {val}
        </span>
      )
    },
    {
      key: 'aiInvolvement',
      header: 'AI Provenance',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>{row.aiConfidence}</span>
          </span>
        </div>
      )
    },
    {
      key: 'verifiedBy',
      header: 'Verified By',
      render: (val) => (
        <span className="text-xs font-medium text-slate-700">{val}</span>
      )
    },
    {
      key: 'verificationStatus',
      header: 'Status',
      align: 'center',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      align: 'right',
      render: (val) => (
        <span className="text-xs font-mono text-slate-500">{val}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setInspectAudit(row)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          title="Inspect Full Provenance"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail & ESG Provenance"
        description="Immutable record of activity data, emission factor citations, AI extraction confidence, and compliance verifications for ESG statutory filings."
        badge={
          <span className="badge bg-slate-100 text-slate-800 border border-slate-300">
            CSRD / SEC / GHG Standard Ready
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => alert('Exporting full cryptographic provenance ledger to CSV/JSON...')}
            className="btn-secondary text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Ledger</span>
          </button>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter audit records by ID, supplier, route, or standard..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: ['All', 'Verified', 'Pending', 'Rejected']
          },
          {
            key: 'ai',
            label: 'AI Ingestion',
            value: selectedAI,
            onChange: setSelectedAI,
            options: ['All', 'AI Ingestion', 'Primary Only']
          }
        ]}
        onReset={handleReset}
        totalCount={records.length}
        filteredCount={filteredRecords.length}
      />

      {/* Audit Table */}
      {loading ? (
        <LoadingState message="Loading compliance audit ledger..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredRecords}
          keyField="recordId"
          onRowClick={(row) => setInspectAudit(row)}
          emptyMessage="No audit records match the selected parameters."
        />
      )}

      {/* Detailed Provenance Modal */}
      <Modal
        isOpen={Boolean(inspectAudit)}
        onClose={() => setInspectAudit(null)}
        title={`Audit Provenance Dossier: ${inspectAudit?.recordId}`}
        subtitle="Complete ESG compliance verification trail"
        footer={
          <div className="flex items-center justify-between w-full">
            <StatusBadge status={inspectAudit?.verificationStatus} />
            <button
              type="button"
              onClick={() => setInspectAudit(null)}
              className="btn-secondary text-xs"
            >
              Close
            </button>
          </div>
        }
      >
        {inspectAudit && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block mb-0.5">Supplier:</span>
                <span className="font-semibold text-slate-900">{inspectAudit.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Associated Shipment:</span>
                <span className="font-mono font-semibold text-slate-900">{inspectAudit.shipmentId}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Origin & Waypoints:</span>
                <span className="font-medium text-slate-800">{inspectAudit.originDestination}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 space-y-2.5">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Factor Citation & Calculation Standard
              </h3>

              <div className="flex justify-between">
                <span className="text-slate-500">Applied Emission Factor:</span>
                <span className="font-mono font-bold text-emerald-800">{inspectAudit.emissionFactor}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Official Factor Source:</span>
                <span className="font-medium text-slate-800">{inspectAudit.factorSource}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Calculation Method:</span>
                <span className="font-medium text-slate-800">{inspectAudit.calculationMethod}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 space-y-2.5">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                AI Extraction & Verifier Attestation
              </h3>

              <div className="flex justify-between">
                <span className="text-slate-500">AI Involvement:</span>
                <span className="font-medium text-slate-800">{inspectAudit.aiInvolvement}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">AI Confidence Score:</span>
                <span className="font-bold text-indigo-700">{inspectAudit.aiConfidence}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Auditor / Verified By:</span>
                <span className="font-medium text-slate-800">{inspectAudit.verifiedBy}</span>
              </div>

              <div className="flex justify-between font-mono text-[11px] pt-2 border-t border-slate-100">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-600">{inspectAudit.timestamp}</span>
              </div>

              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">Cryptographic Hash:</span>
                <span className="text-slate-600">{inspectAudit.auditHash}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
