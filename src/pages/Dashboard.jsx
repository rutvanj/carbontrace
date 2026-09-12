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
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Navigation
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

const EARTH_MODE_COLORS = {
  Road: '#0F3D2E',
  ROAD: '#0F3D2E',
  Rail: '#1F5D46',
  RAIL: '#1F5D46',
  Sea: '#6F8068',
  SEA: '#6F8068',
  Air: '#C27803',
  AIR: '#C27803',
  Inland: '#8C6D46',
  INLAND_WATERWAY: '#8C6D46'
};

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
        setTimeline(timelineData || []);
        
        // Enrich mode colors with earthy palette
        const enrichedModes = (modesData || []).map((m) => ({
          ...m,
          color: EARTH_MODE_COLORS[m.mode] || EARTH_MODE_COLORS[m.transport_mode] || '#6F8068'
        }));
        setModes(enrichedModes);

        // Enrich tier colors
        const tierColors = ['#0F3D2E', '#1F5D46', '#6F8068'];
        const enrichedTiers = (tiersData || []).map((t, i) => ({
          ...t,
          color: tierColors[i % tierColors.length]
        }));
        setTiers(enrichedTiers);

        setTopSuppliers(suppliersData || []);
        setTopRoutes(routesData || []);
        setRecentShipments((shipmentsData || []).slice(0, 5));
        setRecommendations((recsData || []).slice(0, 3));
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
        description="Scope 3 Category 4 transportation & upstream emissions telemetry. Auditable accounting under GHG Protocol and GLEC Framework v3.0."
        badge={
          <span className="badge bg-[#E2EBE5] text-[#0F3D2E] border border-[#1F5D46]/30">
            GHG Protocol Corporate Standard
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <NavLink to="/verification" className="btn-secondary text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F3D2E]" />
              <span>Verify Queue ({metrics.pendingShipments || 0} pending)</span>
            </NavLink>
            <NavLink to="/shipments/new" className="btn-primary text-xs">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Shipment</span>
            </NavLink>
          </div>
        }
      />

      {/* Flagship Journey: TRACE -> VERIFY -> REDUCE */}
      <div className="card-base p-5 bg-gradient-to-r from-[#F8F3E8] via-[#E8DEC9]/50 to-[#F8F3E8] border border-[#D8CBB4] shadow-natural">
        <div className="flex items-center justify-between pb-3 border-b border-[#D8CBB4]/60 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0F3D2E] bg-[#E2EBE5] px-2 py-0.5 rounded-full border border-[#1F5D46]/20">
              Operational Lifecycle
            </span>
            <h2 className="text-xs font-bold text-[#17352B]">CarbonTrace Protocol</h2>
          </div>
          <span className="text-[11px] text-[#687266] font-medium hidden sm:inline">
            Scope 3 Category 4 Transportation Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1: TRACE */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-[#D8CBB4] flex flex-col justify-between hover:border-[#0F3D2E] transition-all">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-[#0F3D2E] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center text-[10px]">1</span>
                  TRACE
                </span>
                <Truck className="w-4 h-4 text-[#0F3D2E]" />
              </div>
              <p className="text-[11px] text-[#687266] leading-snug">
                Log shipment waypoints, weight, and distance. Activity data is converted using GLEC/DEFRA emission factors.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#D8CBB4]/40 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#17352B]">{metrics.totalShipments} Shipments Tracked</span>
              <NavLink to="/shipments/new" className="text-[11px] font-bold text-[#0F3D2E] hover:underline flex items-center gap-0.5">
                <span>Log</span>
                <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>
          </div>

          {/* Step 2: VERIFY */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-[#D8CBB4] flex flex-col justify-between hover:border-[#0F3D2E] transition-all">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-[#0F3D2E] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center text-[10px]">2</span>
                  VERIFY
                </span>
                <ShieldCheck className="w-4 h-4 text-[#0F3D2E]" />
              </div>
              <p className="text-[11px] text-[#687266] leading-snug">
                Audit compliance gatekeeper. Only verified shipments enter official CSRD & SEC disclosures.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#D8CBB4]/40 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#17352B]">{formatPercent(metrics.verificationRatePercent)} Verified Rate</span>
              <NavLink to="/verification" className="text-[11px] font-bold text-[#0F3D2E] hover:underline flex items-center gap-0.5">
                <span>Review</span>
                <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>
          </div>

          {/* Step 3: REDUCE */}
          <div className="p-3.5 rounded-xl bg-white/90 border border-[#D8CBB4] flex flex-col justify-between hover:border-[#0F3D2E] transition-all">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-[#0F3D2E] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center text-[10px]">3</span>
                  REDUCE
                </span>
                <Lightbulb className="w-4 h-4 text-[#D97706]" />
              </div>
              <p className="text-[11px] text-[#687266] leading-snug">
                Algorithmic modal shift recommendations and What-if simulation to model low-carbon alternatives.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#D8CBB4]/40 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#0F3D2E]">{formatEmissions(metrics.reductionPotentialKg)} Potential Savings</span>
              <NavLink to="/recommendations" className="text-[11px] font-bold text-[#0F3D2E] hover:underline flex items-center gap-0.5">
                <span>Explore</span>
                <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Scope 3 CO₂e"
          value={formatEmissions(metrics.totalEmissionsKg)}
          subtext="YTD gross transport emissions"
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
            <span className="text-[10px] font-bold text-[#0F3D2E] bg-[#E2EBE5] px-2 py-0.5 rounded border border-[#1F5D46]/30">
              Auditable
            </span>
          }
        />
        <StatCard
          title="Suppliers Tracked"
          value={formatNumber(metrics.suppliersTracked)}
          subtext="Active Tier 1-3 network"
          icon={Building2}
          change="+2 this quarter"
          changeType="neutral"
        />
        <StatCard
          title="High-Impact Suppliers"
          value={formatNumber(metrics.highImpactSuppliersCount || topSuppliers.filter(s => s.impact === 'High').length)}
          subtext="Key decarbonization targets"
          icon={AlertTriangle}
          changeType="negative"
        />
        <StatCard
          title="Reduction Potential"
          value={formatEmissions(metrics.reductionPotentialKg)}
          subtext="Via modal & logistics shifts"
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
            subtitle="Verified official emissions vs pending review logs"
            action={
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-[#17352B] font-semibold">
                  <span className="w-3 h-3 rounded-sm bg-[#0F3D2E]"></span> Verified Official
                </span>
                <span className="flex items-center gap-1.5 text-[#687266] font-semibold">
                  <span className="w-3 h-3 rounded-sm bg-[#D97706]"></span> Pending Review
                </span>
              </div>
            }
            minHeight="h-80"
          >
            {timeline.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#687266]">
                No historical emissions activity recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="verifiedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F3D2E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0F3D2E" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#687266" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#687266"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `${Math.round(v / 1000)}t`}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatEmissions(value),
                      name === 'verified' ? 'Verified Emissions' : 'Pending Verification'
                    ]}
                    contentStyle={{
                      backgroundColor: '#0F3D2E',
                      borderRadius: '10px',
                      color: '#F8F3E8',
                      border: '1px solid #1F5D46',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="verified"
                    stroke="#0F3D2E"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#verifiedGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="#D97706"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pendingGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Emissions by Transport Mode (Donut Chart) */}
        <div>
          <ChartCard
            title="Emissions by Transport Mode"
            subtitle="Modal distribution of logistics freight"
            minHeight="h-80"
          >
            {modes.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#687266]">
                No transport modal data logged yet.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
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
                        backgroundColor: '#0F3D2E',
                        borderRadius: '10px',
                        color: '#F8F3E8',
                        border: '1px solid #1F5D46',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Custom Mode Legend Grid */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#D8CBB4]/60">
                  {modes.map((mode) => (
                    <div key={mode.mode} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white/80 border border-[#D8CBB4]/50">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mode.color }} />
                        <span className="font-semibold text-[#17352B]">{mode.mode}</span>
                      </div>
                      <span className="font-bold text-[#0F3D2E]">{mode.share}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
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
                <YAxis dataKey="tier" type="category" stroke="#17352B" fontSize={11} tickLine={false} width={60} />
                <Tooltip
                  formatter={(val) => [formatEmissions(val), 'Emissions']}
                  contentStyle={{
                    backgroundColor: '#0F3D2E',
                    borderRadius: '10px',
                    color: '#F8F3E8',
                    border: '1px solid #1F5D46',
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

            <div className="text-xs text-[#687266] mt-2 flex justify-between border-t border-[#D8CBB4]/60 pt-2 font-semibold">
              <span>Tier 1 (Direct Mfrs): 82.8%</span>
              <span>Tier 2 & 3: 17.2%</span>
            </div>
          </ChartCard>
        </div>

        {/* Top Emission Suppliers Table */}
        <div className="lg:col-span-2">
          <div className="card-base p-5 flex flex-col justify-between h-full border border-[#D8CBB4]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#17352B]">Top Emission Suppliers</h2>
                  <p className="text-xs text-[#687266]">Key contributors to current carbon footprint</p>
                </div>
                <NavLink to="/suppliers" className="text-xs font-bold text-[#0F3D2E] hover:underline flex items-center gap-1">
                  <span>View All Suppliers</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D8CBB4] text-[#687266] font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-2">Supplier</th>
                      <th className="py-2.5 px-2">Tier</th>
                      <th className="py-2.5 px-2 text-right">Emissions</th>
                      <th className="py-2.5 px-2 text-right">% of Total</th>
                      <th className="py-2.5 px-2 text-center">Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8CBB4]/50">
                    {topSuppliers.map((supplier) => (
                      <tr
                        key={supplier.id}
                        className="hover:bg-[#E8DEC9]/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/suppliers/${supplier.id}`)}
                      >
                        <td className="py-2.5 px-2 font-bold text-[#17352B] flex items-center gap-1.5">
                          <span>{supplier.name}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          <StatusBadge status={supplier.tier} />
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-[#0F3D2E]">
                          {formatEmissions(supplier.emissionsKg)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-semibold text-[#687266]">
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
        <div className="card-base p-5 border border-[#D8CBB4]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#17352B]">Top Emission Routes</h2>
              <p className="text-xs text-[#687266]">Highest intensity logistics corridors</p>
            </div>
            <NavLink to="/analytics" className="text-xs font-bold text-[#0F3D2E] hover:underline flex items-center gap-1">
              <span>Corridor Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="space-y-3">
            {topRoutes.map((rt) => (
              <div key={rt.id} className="p-3 rounded-xl bg-white border border-[#D8CBB4] flex items-center justify-between shadow-subtle">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#17352B]">{rt.origin}</span>
                    <span className="text-[#687266]">→</span>
                    <span className="font-bold text-xs text-[#17352B]">{rt.destination}</span>
                  </div>
                  <div className="text-[11px] text-[#687266] flex items-center gap-2">
                    <span className="font-bold text-[#0F3D2E] bg-[#E2EBE5] px-2 py-0.5 rounded border border-[#1F5D46]/30">
                      {rt.mode}
                    </span>
                    <span>Intensity: <strong>{rt.intensity}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold text-[#0F3D2E]">{formatEmissions(rt.emissionsKg)}</div>
                  <div className="text-[10px] text-[#687266] font-medium">{rt.count} shipments logged</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Shipments Feed */}
        <div className="card-base p-5 border border-[#D8CBB4]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#17352B]">Recent Shipment Activity</h2>
              <p className="text-xs text-[#687266]">Real-time logistics logs awaiting or verified</p>
            </div>
            <NavLink to="/shipments" className="text-xs font-bold text-[#0F3D2E] hover:underline flex items-center gap-1">
              <span>View All ({recentShipments.length}+)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="divide-y divide-[#D8CBB4]/50">
            {recentShipments.map((shipment) => (
              <div key={shipment.id} className="py-2.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#17352B]">{shipment.supplierName}</span>
                    <span className="text-[11px] text-[#687266]">({shipment.id})</span>
                  </div>
                  <div className="text-[11px] text-[#687266]">
                    {shipment.origin} → {shipment.destination} • <span className="font-bold text-[#17352B]">{shipment.transportMode}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-xs font-extrabold text-[#0F3D2E]">
                    {formatEmissions(shipment.calculatedEmissionsKg || shipment.emissions)}
                  </span>
                  <StatusBadge status={shipment.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highlighted Reduction Opportunities Banner */}
      <div className="card-base p-5 bg-gradient-to-r from-[#E2EBE5] via-[#F8F3E8] to-[#E8DEC9] border border-[#1F5D46]/40 shadow-natural">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#0F3D2E] text-white shrink-0 shadow-sm">
              <Lightbulb className="w-5 h-5 text-[#FEF3C7]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#17352B]">
                Actionable Reduction Opportunities Identified
              </h2>
              <p className="text-xs text-[#17352B] mt-0.5 max-w-2xl leading-relaxed">
                CarbonTrace AI detected high-impact decarbonization pathways across your transport corridors with potential savings of <strong>{formatEmissions(metrics.reductionPotentialKg)}</strong>.
              </p>
            </div>
          </div>
          <NavLink
            to="/recommendations"
            className="btn-primary text-xs shrink-0 self-start sm:self-center py-2 px-4"
          >
            <span>Explore Decarbonization Pathways</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
