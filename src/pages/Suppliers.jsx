import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  Mail,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/FeedbackStates';
import { formatEmissions, formatPercent } from '../utils/formatters';
import { supplierService } from '../services/api';

export function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedImpact, setSelectedImpact] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Form State for Add Supplier
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    tier: 'Tier 1',
    location: '',
    country: '',
    contactPerson: '',
    contactEmail: ''
  });

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getSuppliers({
        search,
        tier: selectedTier,
        impact: selectedImpact
      });
      setSuppliers(data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [search, selectedTier, selectedImpact]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedTier('All');
    setSelectedImpact('All');
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.location) return;

    setIsSubmitting(true);
    try {
      await supplierService.addSupplier(newSupplier);
      setIsAddModalOpen(false);
      setNewSupplier({
        name: '',
        tier: 'Tier 1',
        location: '',
        country: '',
        contactPerson: '',
        contactEmail: ''
      });
      await loadSuppliers();
    } catch (err) {
      console.error('Failed to add supplier:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Supplier Name',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs border border-slate-200">
            {row.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900 hover:text-emerald-700 transition-colors">
              {row.name}
            </div>
            <div className="text-[11px] text-slate-500">{row.id} • {row.contactPerson}</div>
          </div>
        </div>
      )
    },
    {
      key: 'tier',
      header: 'Tier',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'location',
      header: 'Location',
      render: (val) => (
        <span className="flex items-center gap-1 text-slate-600 text-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{val}</span>
        </span>
      )
    },
    {
      key: 'totalEmissionsKg',
      header: 'Total Scope 3',
      align: 'right',
      render: (val) => (
        <span className="font-semibold text-slate-900">
          {formatEmissions(val)}
        </span>
      )
    },
    {
      key: 'impactLevel',
      header: 'Impact Level',
      align: 'center',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'verificationRate',
      header: 'Verification Rate',
      align: 'center',
      render: (val) => (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${val}%` }}
            />
          </div>
          <span className="text-slate-700">{formatPercent(val, 0)}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (val) => (
        <span className="badge bg-slate-100 text-slate-700 border border-slate-200">
          {val}
        </span>
      )
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
            navigate(`/suppliers/${row.id}`);
          }}
          className="btn-secondary text-xs py-1 px-2.5"
        >
          <span>Details</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Directory"
        description="Comprehensive inventory of multi-tier supply chain partners, reported emissions, audit scores, and verification status."
        actions={
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Supplier</span>
          </button>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter by name, ID, or location..."
        filters={[
          {
            key: 'tier',
            label: 'Tier',
            value: selectedTier,
            onChange: setSelectedTier,
            options: ['All', 'Tier 1', 'Tier 2', 'Tier 3']
          },
          {
            key: 'impact',
            label: 'Impact',
            value: selectedImpact,
            onChange: setSelectedImpact,
            options: ['All', 'High', 'Medium', 'Low']
          }
        ]}
        onReset={handleResetFilters}
        totalCount={suppliers.length}
        filteredCount={suppliers.length}
      />

      {/* Data Table */}
      {loading ? (
        <LoadingState message="Loading supplier records..." />
      ) : (
        <DataTable
          columns={columns}
          data={suppliers}
          keyField="id"
          onRowClick={(row) => navigate(`/suppliers/${row.id}`)}
          emptyMessage="No suppliers matched your query."
        />
      )}

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Value-Chain Supplier"
        subtitle="Registers supplier to the CarbonTrace network for Scope 3 emissions telemetry"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-supplier-form"
              disabled={isSubmitting}
              className="btn-primary text-xs"
            >
              {isSubmitting ? 'Onboarding...' : 'Save & Onboard'}
            </button>
          </>
        }
      >
        <form id="add-supplier-form" onSubmit={handleAddSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier Entity Name *
            </label>
            <input
              type="text"
              required
              value={newSupplier.name}
              onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              placeholder="e.g. Rheinmetall Materials AG"
              className="input-base text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Value-Chain Tier *
              </label>
              <select
                value={newSupplier.tier}
                onChange={(e) => setNewSupplier({ ...newSupplier, tier: e.target.value })}
                className="input-base text-xs"
              >
                <option value="Tier 1">Tier 1 (Direct Contract)</option>
                <option value="Tier 2">Tier 2 (Sub-tier Mfr)</option>
                <option value="Tier 3">Tier 3 (Raw Materials)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                value={newSupplier.country}
                onChange={(e) => setNewSupplier({ ...newSupplier, country: e.target.value })}
                placeholder="e.g. Germany"
                className="input-base text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Facility Address *
            </label>
            <input
              type="text"
              required
              value={newSupplier.location}
              onChange={(e) => setNewSupplier({ ...newSupplier, location: e.target.value })}
              placeholder="e.g. Duisburg Industrial Park"
              className="input-base text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={newSupplier.contactPerson}
                onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                placeholder="e.g. Klaus Lindemann"
                className="input-base text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={newSupplier.contactEmail}
                onChange={(e) => setNewSupplier({ ...newSupplier, contactEmail: e.target.value })}
                placeholder="klaus@rheinmetall.de"
                className="input-base text-xs"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
