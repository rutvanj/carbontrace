import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  Download,
  FileText,
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
import { auditService, exportService } from '../services/api';

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
          <span className="font-mono font-bold text-xs text-[#17352B]">{val}</span>
          <div className="font-mono text-[10px] text-[#6F8068]">{row.auditHash}</div>
        </div>
      )
    },
    {
      key: 'supplierName',
      header: 'Supplier & Shipment',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-[#17352B]">{val}</div>
          <div className="text-[11px] text-[#687266]">{row.shipmentId} • {row.originDestination}</div>
        </div>
      )
    },
    {
      key: 'inputData',
      header: 'Telemetry Input Data',
      render: (val) => (
        <span className="text-xs text-[#17352B] truncate max-w-[200px] inline-block">
          {val}
        </span>
      )
    },
    {
      key: 'factorSource',
      header: 'Factor & Standard',
      render: (val, row) => (
        <div>
          <div className="font-mono font-bold text-[11px] text-[#0F3D2E]">{row.emissionFactor}</div>
          <div className="text-[10px] text-[#687266] truncate max-w-[170px]">{val}</div>
        </div>
      )
    },
    {
      key: 'calculationMethod',
      header: 'Calculation Model',
      render: (val) => (
        <span className="text-xs text-[#687266] truncate max-w-[150px] inline-block">
          {val}
        </span>
      )
    },
    {
      key: 'aiInvolvement',
      header: 'AI Provenance',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <span className="badge bg-[#E8DEC9] text-[#0F3D2E] border border-[#D8CBB4] text-[10px]">
            <Sparkles className="w-3 h-3 text-[#0F3D2E]" />
            <span>{row.aiConfidence}</span>
          </span>
        </div>
      )
    },
    {
      key: 'verifiedBy',
      header: 'Verified By',
      render: (val) => (
        <span className="text-xs font-medium text-[#17352B]">{val}</span>
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
        <span className="text-xs font-mono text-[#687266]">{val}</span>
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
          className="p-1.5 rounded-lg text-[#687266] hover:text-[#0F3D2E] hover:bg-[#E8DEC9]/50 transition-colors"
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
          <span className="badge bg-[#E2EBE5] text-[#0F3D2E] border border-[#1F5D46]/30 font-semibold">
            CSRD / SEC / GHG Protocol Ready
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportService.downloadCsv()}
              className="btn-secondary text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => exportService.downloadPdf()}
              className="btn-primary text-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Audit Ledger</span>
            </button>
          </div>
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
            <div className="p-3 rounded-lg bg-[#E8DEC9]/50 border border-[#D8CBB4] grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#687266] block mb-0.5">Supplier:</span>
                <span className="font-semibold text-[#17352B]">{inspectAudit.supplierName}</span>
              </div>
              <div>
                <span className="text-[#687266] block mb-0.5">Associated Shipment:</span>
                <span className="font-mono font-semibold text-[#17352B]">{inspectAudit.shipmentId}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#687266] block mb-0.5">Origin & Waypoints:</span>
                <span className="font-medium text-[#17352B]">{inspectAudit.originDestination}</span>
              </div>
            </div>

            <div className="border border-[#D8CBB4] rounded-lg p-4 space-y-2.5 bg-[#F8F3E8]">
              <h3 className="font-bold text-[#0F3D2E] uppercase tracking-wider text-[11px]">
                Factor Citation & Calculation Standard
              </h3>

              <div className="flex justify-between">
                <span className="text-[#687266]">Applied Emission Factor:</span>
                <span className="font-mono font-bold text-[#0F3D2E]">{inspectAudit.emissionFactor}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#687266]">Official Factor Source:</span>
                <span className="font-medium text-[#17352B]">{inspectAudit.factorSource}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#687266]">Calculation Method:</span>
                <span className="font-medium text-[#17352B]">{inspectAudit.calculationMethod}</span>
              </div>
            </div>

            <div className="border border-[#D8CBB4] rounded-lg p-4 space-y-2.5 bg-[#F8F3E8]">
              <h3 className="font-bold text-[#0F3D2E] uppercase tracking-wider text-[11px]">
                AI Extraction & Verifier Attestation
              </h3>

              <div className="flex justify-between">
                <span className="text-[#687266]">AI Involvement:</span>
                <span className="font-medium text-[#17352B]">{inspectAudit.aiInvolvement}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#687266]">AI Confidence Score:</span>
                <span className="font-bold text-[#0F3D2E]">{inspectAudit.aiConfidence}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#687266]">Auditor / Verified By:</span>
                <span className="font-medium text-[#17352B]">{inspectAudit.verifiedBy}</span>
              </div>

              <div className="flex justify-between font-mono text-[11px] pt-2 border-t border-[#D8CBB4]">
                <span className="text-[#6F8068]">Timestamp:</span>
                <span className="text-[#17352B]">{inspectAudit.timestamp}</span>
              </div>

              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-[#6F8068]">Cryptographic Hash:</span>
                <span className="text-[#17352B] truncate max-w-[280px]">{inspectAudit.auditHash}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
