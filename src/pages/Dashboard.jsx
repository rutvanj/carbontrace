import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CloudFog,
  ShieldCheck,
  Building2,
  AlertTriangle,
  TrendingDown,
  ArrowUpRight,
  Truck,
  CheckCircle2,
  Clock,
  Lightbulb,
  PlusCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ChartCard } from '../components/common/ChartCard';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingState } from '../components/common/FeedbackStates';
import { formatEmissions, formatNumber, formatPercent, formatDate } from '../utils/formatters';
import {
  dashboardService,
  shipmentService,
  recommendationService
} from '../services/api';

export function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [modes, setModes] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [topRoutes, setTopRoutes] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [
          metricsData,
          timelineData,
          modesData,
          tiersData,
          suppliersData,
          routesData,
          shipmentsData,
          recsData
        ] = await Promise.all([
          dashboardService.getMetrics(),
          dashboardService.getEmissionsTimeline(),
          dashboardService.getEmissionsByMode(),
          dashboardService.getEmissionsByTier(),
          dashboardService.getTopSuppliers(),
          dashboardService.getTopRoutes(),
          shipmentService.getShipments(),
          recommendationService.getRecommendations()
        ]);

        setMetrics(metricsData);
        setTimeline(timelineData);
        setModes(modesData);
        setTiers(tiersData);
        setTopSuppliers(suppliersData);
        setTopRoutes(routesData);
        setRecentShipments(shipmentsData.slice(0, 5));
        setRecommendations(recsData.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading || !metrics) {
    return <LoadingState message="Calculating Scope 3 enterprise emissions..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Executive Emissions Dashboard"
        description="Corporate Scope 3 footprint overview across upstream suppliers, transport modalities, and auditable verification milestones."
        badge={
          <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200">
            GHG Protocol Corporate Standard
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <NavLink to="/verification" className="btn-secondary text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verify Records ({metrics.pendingEmissionsKg > 0 ? 'Pending' : '0'})</span>
            </NavLink>
            <NavLink to="/shipments/new" className="btn-primary text-xs">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Shipment</span>
            </NavLink>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Scope 3 CO₂e"
          value={formatEmissions(metrics.totalEmissionsKg)}
          subtext="YTD gross emissions"
          icon={CloudFog}
          change="-3.4%"
          changeType="positive"
        />
        <StatCard
          title="Verified Emissions"
          value={formatEmissions(metrics.verifiedEmissionsKg)}
          subtext={`${formatPercent(metrics.verificationRatePercent)} verification rate`}
          icon={CheckCircle2}
          badge={
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Auditable
            </span>
          }
        />
        <StatCard
          title="Suppliers Tracked"
          value={formatNumber(metrics.suppliersTracked)}
          subtext="Active Tier 1-3 network"
          icon={Building2}
          change="+2"
          changeType="neutral"
        />
        <StatCard
          title="High-Impact Suppliers"
          value={formatNumber(metrics.highImpactSuppliersCount)}
          subtext=">75% of emissions"
          icon={AlertTriangle}
          changeType="negative"
        />
        <StatCard
          title="Reduction Potential"
          value={formatEmissions(metrics.reductionPotentialKg)}
          subtext="Via modal & supplier shifts"
          icon={TrendingDown}
          change="18.2%"
          changeType="positive"
        />
      </div>

      {/* Flagship Charts Grid: Emissions Over Time & Transport Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emissions Over Time (Area Chart) */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Emissions Over Time (Monthly Trend)"
            subtitle="Verified official emissions vs pending unverified log submissions"
            action={
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded-sm bg-emerald-600"></span> Verified
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded-sm bg-amber-400"></span> Pending Review
                </span>
              </div>
            }
            minHeight="h-80"
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="verifiedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}t`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatEmissions(value),
                    name === 'verified' ? 'Verified Emissions' : 'Pending Verification'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="verified"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#verifiedGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#pendingGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Emissions by Transport Mode (Donut / Pie Chart) */}
        <div>
          <ChartCard
            title="Emissions by Transport Mode"
            subtitle="Modal distribution of logistics freight"
            minHeight="h-80"
          >
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={modes}
                  dataKey="emissionsKg"
                  nameKey="mode"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {modes.map((entry, index) => (
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
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Mode Legend Grid */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
              {modes.map((mode) => (
                <div key={mode.mode} className="flex items-center justify-between text-xs p-1 rounded bg-slate-50">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mode.color }} />
                    <span className="font-medium text-slate-700">{mode.mode}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{mode.share}%</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Middle Row: Supplier Tier Breakdown & Top Emission Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emissions by Supplier Tier (Bar Chart) */}
        <div>
          <ChartCard
            title="Emissions by Supplier Tier"
            subtitle="Scope 3 depth distribution across value chain"
            minHeight="h-64"
          >
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={tiers} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="tier" type="category" stroke="#475569" fontSize={12} tickLine={false} width={60} />
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
                <Bar dataKey="emissionsKg" radius={[0, 6, 6, 0]}>
                  {tiers.map((t, idx) => (
                    <Cell key={idx} fill={t.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="text-xs text-slate-500 mt-2 flex justify-between border-t border-slate-100 pt-2 font-medium">
              <span>Tier 1 (Direct Mfrs): 82.8%</span>
              <span>Tier 2 & 3: 17.2%</span>
            </div>
          </ChartCard>
        </div>

        {/* Top Emission Suppliers Table */}
        <div className="lg:col-span-2">
          <div className="card-base p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Top Emission Suppliers</h2>
                  <p className="text-xs text-slate-500">Key contributors to current carbon footprint</p>
                </div>
                <NavLink to="/suppliers" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                  <span>View All Suppliers</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                      <th className="py-2 px-2">Supplier</th>
                      <th className="py-2 px-2">Tier</th>
                      <th className="py-2 px-2 text-right">Emissions</th>
                      <th className="py-2 px-2 text-right">% of Total</th>
                      <th className="py-2 px-2 text-center">Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topSuppliers.map((supplier) => (
                      <tr
                        key={supplier.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/suppliers/${supplier.id}`)}
                      >
                        <td className="py-2.5 px-2 font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{supplier.name}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          <StatusBadge status={supplier.tier} />
                        </td>
                        <td className="py-2.5 px-2 text-right font-medium text-slate-800">
                          {formatEmissions(supplier.emissionsKg)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-medium text-slate-600">
                          {formatPercent(supplier.percentOfTotal)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <StatusBadge status={supplier.impact} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Routes & Recent Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Emission Routes */}
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Top Emission Routes</h2>
              <p className="text-xs text-slate-500">Highest intensity logistics corridors</p>
            </div>
            <NavLink to="/analytics" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>Corridor Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="space-y-3">
            {topRoutes.map((rt) => (
              <div key={rt.id} className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{rt.origin}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-xs text-slate-900">{rt.destination}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-medium text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {rt.mode}
                    </span>
                    <span>Intensity: {rt.intensity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{formatEmissions(rt.emissionsKg)}</div>
                  <div className="text-[10px] text-slate-500">{rt.count} shipments logged</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Shipments Feed */}
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Shipment Activity</h2>
              <p className="text-xs text-slate-500">Real-time logistics logs awaiting or verified</p>
            </div>
            <NavLink to="/shipments" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>View All ({recentShipments.length}+)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="divide-y divide-slate-100">
            {recentShipments.map((shipment) => (
              <div key={shipment.id} className="py-2.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{shipment.supplierName}</span>
                    <span className="text-[10px] text-slate-400">({shipment.id})</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {shipment.origin} → {shipment.destination} • <span className="font-medium text-slate-700">{shipment.transportMode}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-slate-900">
                    {formatEmissions(shipment.calculatedEmissionsKg)}
                  </span>
                  <StatusBadge status={shipment.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highlighted Reduction Opportunities Banner */}
      <div className="card-base p-5 bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 border-emerald-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Actionable Reduction Opportunities Identified
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                CarbonTrace AI detected <strong>4 high-impact decarbonization pathways</strong> across your supply chain with potential savings of <strong>{formatEmissions(metrics.reductionPotentialKg)}</strong>.
              </p>
            </div>
          </div>
          <NavLink
            to="/recommendations"
            className="btn-primary text-xs shrink-0 self-start sm:self-center"
          >
            <span>Explore Decarbonization Pathways</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
