import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Filter,
  Download,
  Calendar,
  Layers,
  Truck,
  Building2,
  TrendingDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { ChartCard } from '../components/common/ChartCard';
import { LoadingState } from '../components/common/FeedbackStates';
import { formatEmissions, formatPercent } from '../utils/formatters';
import { analyticsService, supplierService, exportService } from '../services/api';

export function CarbonAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);

  // Filter Controls
  const [timeRange, setTimeRange] = useState('YTD 2024');
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [analyticsData, supplierList] = await Promise.all([
          analyticsService.getAnalytics(),
          supplierService.getSuppliers()
        ]);
        setData(analyticsData);
        setSuppliers(supplierList);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data) {
    return <LoadingState message="Aggregating multi-dimensional emissions analytics..." />;
  }

  const exportReport = () => {
    exportService.downloadCsv();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carbon Analytics"
        description="Comprehensive emissions telemetry across time, supplier tiers, logistical transport modalities, and procured materials."
        actions={
          <button
            type="button"
            onClick={exportReport}
            className="btn-secondary text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ESG Report</span>
          </button>
        }
      />

      {/* Analytics Multi-Dimensional Filter Bar */}
      <div className="card-base p-4 bg-white border border-slate-200">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          <span>Dimension Filters</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-base text-xs"
            >
              <option value="YTD 2024">YTD 2024 (Full Year)</option>
              <option value="Q3-Q4 2024">Q3 - Q4 2024 (H2)</option>
              <option value="Q1-Q2 2024">Q1 - Q2 2024 (H1)</option>
              <option value="Trailing 12M">Trailing 12 Months</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Supplier Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="input-base text-xs"
            >
              <option value="All">All Value Tiers</option>
              <option value="Tier 1">Tier 1 (Direct Mfrs)</option>
              <option value="Tier 2">Tier 2 (Sub-tier Mfrs)</option>
              <option value="Tier 3">Tier 3 (Raw Materials)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Transport Mode</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="input-base text-xs"
            >
              <option value="All">All Modalities</option>
              <option value="Road">Road</option>
              <option value="Rail">Rail</option>
              <option value="Sea">Sea</option>
              <option value="Air">Air</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Supplier Entity</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="input-base text-xs"
            >
              <option value="All">All Suppliers ({suppliers.length})</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart 1: Emissions Over Time (Area Chart) */}
      <ChartCard
        title="Emissions Over Time & Decarbonization Trajectory"
        subtitle="Monthly Scope 3 emissions compared against annual science-based target ceiling"
        minHeight="h-80"
      >
        <ResponsiveContainer width="100%" height={290}>
          <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}t`} />
            <Tooltip
              formatter={(value, name) => [
                formatEmissions(value),
                name === 'total' ? 'Actual Monthly Total' : 'Reduction Target'
              ]}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              name="Monthly Scope 3 Footprint"
              stroke="#059669"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Charts Grid: Mode & Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Emissions by Transport Mode */}
        <ChartCard
          title="Emissions by Transport Mode"
          subtitle="Logistics intensity breakdown across sea, road, air, and rail freight"
          minHeight="h-72"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.byMode} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="mode" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}t`} />
              <Tooltip
                formatter={(val) => [formatEmissions(val), 'Emissions']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="emissionsKg" radius={[6, 6, 0, 0]}>
                {data.byMode.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Emissions by Supplier Tier */}
        <ChartCard
          title="Emissions by Value Chain Tier"
          subtitle="Direct Tier 1 contract suppliers vs upstream Tier 2/3 sub-suppliers"
          minHeight="h-72"
        >
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.byTier}
                dataKey="emissionsKg"
                nameKey="tier"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
              >
                {data.byTier.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => [formatEmissions(val), 'Emissions']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Grid: Material Intensity & Top Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 4: Emissions by Material */}
        <ChartCard
          title="Emissions by Procured Material"
          subtitle="Scope 3 Category 1 embodied carbon in key raw inputs"
          minHeight="h-72"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data.byMaterial}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
            >
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}t`} />
              <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} tickLine={false} width={130} />
              <Tooltip
                formatter={(val) => [formatEmissions(val), 'Emissions']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="emissionsKg" fill="#047857" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 5: Emissions by Supplier */}
        <ChartCard
          title="Top Supplier Emission Contributors"
          subtitle="Ranked carbon distribution among key enterprise partners"
          minHeight="h-72"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data.bySupplier}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
            >
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}t`} />
              <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} tickLine={false} width={120} />
              <Tooltip
                formatter={(val) => [formatEmissions(val), 'Emissions']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="emissionsKg" fill="#0284c7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
