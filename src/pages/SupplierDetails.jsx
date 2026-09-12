import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Truck,
  PlusCircle,
  FileCheck2,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ChartCard } from '../components/common/ChartCard';
import { DataTable } from '../components/common/DataTable';
import { LoadingState, ErrorState } from '../components/common/FeedbackStates';
import { formatEmissions, formatPercent, formatDate } from '../utils/formatters';
import { supplierService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function SupplierDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await supplierService.getSupplierById(id);
        setSupplier(data);
      } catch (err) {
        setError(err.message || 'Supplier not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingState message="Loading supplier dossier..." />;
  if (error || !supplier) {
    return (
      <ErrorState
        title="Supplier Dossier Unavailable"
        message={error || 'Could not locate supplier identifier.'}
        onRetry={() => navigate('/suppliers')}
      />
    );
  }

  // Category breakdown chart data
  const categoryData = [
    { name: 'Manufacturing', emissions: supplier.categories?.manufacturing || 0, fill: '#0F3D2E' },
    { name: 'Transportation', emissions: supplier.categories?.transportation || 0, fill: '#1F5D46' },
    { name: 'Electricity/Grid', emissions: supplier.categories?.energy || 0, fill: '#B45309' }
  ];

  const shipmentColumns = [
    {
      key: 'id',
      header: 'Shipment ID',
      render: (val) => <span className="font-semibold text-[#17352B]">{val}</span>
    },
    {
      key: 'route',
      header: 'Origin → Destination',
      render: (_, row) => (
        <span className="text-xs text-[#17352B]">
          {row.origin} → {row.destination}
        </span>
      )
    },
    {
      key: 'transportMode',
      header: 'Mode',
      render: (val) => (
        <span className="badge bg-[#E8DEC9]/60 text-[#17352B] border border-[#D8CBB4]">
          {val}
        </span>
      )
    },
    {
      key: 'material',
      header: 'Material Payload',
      render: (val) => <span className="text-xs text-[#687266] truncate max-w-[150px] inline-block">{val}</span>
    },
    {
      key: 'calculatedEmissionsKg',
      header: 'Emissions',
      align: 'right',
      render: (val) => <span className="font-bold text-[#17352B]">{formatEmissions(val)}</span>
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
      render: (val) => <span className="text-xs text-[#687266]">{formatDate(val)}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/suppliers')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#687266] hover:text-[#0F3D2E] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Supplier Directory</span>
        </button>

        <PageHeader
          title={supplier.name}
          description={`Verified ESG dossier for ${supplier.id} (${supplier.tier}) located in ${supplier.location}.`}
          badge={<StatusBadge status={supplier.impactLevel} />}
          actions={
            <div className="flex items-center gap-2">
              <NavLink
                to={`/shipments/new?supplierId=${supplier.id}`}
                className="btn-primary text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Log Shipment for Supplier</span>
              </NavLink>
            </div>
          }
        />
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scope 3 Footprint"
          value={formatEmissions(supplier.totalEmissionsKg)}
          subtext="Annual cumulative load"
          icon={Layers}
          change={supplier.trend}
          changeType={supplier.trend?.startsWith('-') ? 'positive' : 'negative'}
        />
        <StatCard
          title="Verified Emissions"
          value={formatEmissions(supplier.verifiedEmissionsKg)}
          subtext="Audited & reported"
          icon={ShieldCheck}
          badge={<StatusBadge status={supplier.status} />}
        />
        <StatCard
          title="Verification Ratio"
          value={formatPercent(supplier.verificationRate)}
          subtext="Audit completeness"
          icon={CheckCircle2}
        />
        <StatCard
          title="ESG Audit Score"
          value={`${supplier.auditScore} / 100`}
          subtext="High reliability"
          icon={FileCheck2}
        />
      </div>

      {/* Detailed Content Grid: Categories & Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Bar Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Scope 3 Category Breakdown"
            subtitle="Distribution between manufacturing energy, direct processing, and transport logistics"
            minHeight="h-72"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#17352B" fontSize={12} tickLine={false} />
                <YAxis stroke="#687266" fontSize={12} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}t`} />
                <Tooltip
                  formatter={(val) => [formatEmissions(val), 'Emissions']}
                  contentStyle={{
                    backgroundColor: '#0F3D2E',
                    borderRadius: '8px',
                    color: '#F8F3E8',
                    border: '1px solid #1F5D46',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="emissions" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Profile Card */}
        <div className="card-base p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#17352B] border-b border-[#D8CBB4] pb-2">
            Supplier Compliance Profile
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#687266] block mb-0.5">Tier Classification:</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={supplier.tier} />
                <span className="text-[#17352B] font-medium">Direct Value Chain</span>
              </div>
            </div>

            <div>
              <span className="text-[#687266] block mb-0.5">Primary Facility:</span>
              <span className="font-semibold text-[#17352B] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#6F8068]" />
                {supplier.location}
              </span>
            </div>

            <div>
              <span className="text-[#687266] block mb-0.5">ESG Contact Officer:</span>
              <span className="font-semibold text-[#17352B]">{supplier.contactPerson}</span>
              <span className="text-[#687266] block text-[11px]">{supplier.contactEmail}</span>
            </div>

            <div>
              <span className="text-[#687266] block mb-0.5">Transportation Contribution:</span>
              <span className="font-bold text-[#17352B]">
                {formatEmissions(supplier.categories?.transportation)}
              </span>
              <span className="text-[#687266] block text-[11px]">
                {supplier.totalEmissionsKg > 0
                  ? `${Math.round(((supplier.categories?.transportation || 0) / supplier.totalEmissionsKg) * 100)}% of total emissions`
                  : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Shipments for this Supplier */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#17352B]">
            Recent Logged Shipments ({supplier.shipments?.length || 0})
          </h2>
          <NavLink
            to={`/shipments?supplierId=${supplier.id}`}
            className="text-xs font-semibold text-[#0F3D2E] hover:underline"
          >
            View in Shipment Manager →
          </NavLink>
        </div>

        <DataTable
          columns={shipmentColumns}
          data={supplier.shipments || []}
          keyField="id"
          emptyMessage="No shipments logged for this supplier yet."
        />
      </div>
    </div>
  );
}
