import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Flame,
  AlertTriangle,
  TrendingDown,
  Building2,
  Navigation,
  Package,
  Truck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/FeedbackStates';
import { formatEmissions, formatPercent } from '../utils/formatters';
import { hotspotService } from '../services/api';

export function Hotspots() {
  const [hotspots, setHotspots] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await hotspotService.getHotspots();
        setHotspots(data);
      } catch (err) {
        console.error('Failed to load hotspots:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !hotspots) {
    return <LoadingState message="Scanning value chain for carbon emission hotspots..." />;
  }

  const sections = [
    {
      title: 'Top Emission Suppliers',
      subtitle: 'Highest intensity corporate manufacturing partners',
      icon: Building2,
      data: hotspots.topSuppliers,
      badge: 'Scope 3 Category 1 & 4'
    },
    {
      title: 'Top Emission Routes',
      subtitle: 'Freight corridors with largest cumulative carbon burden',
      icon: Navigation,
      data: hotspots.topRoutes,
      badge: 'Upstream Logistics'
    },
    {
      title: 'Top Emission Materials',
      subtitle: 'Procured raw inputs with highest embodied carbon',
      icon: Package,
      data: hotspots.topMaterials,
      badge: 'Embodied Carbon'
    },
    {
      title: 'Top Transport Modes',
      subtitle: 'Modal emission intensity across global logistics',
      icon: Truck,
      data: hotspots.topModes,
      badge: 'Modal Share'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emission Hotspots"
        description="Pinpoint the largest sources of carbon intensity across suppliers, freight lanes, raw materials, and modal choices."
        badge={
          <span className="badge bg-rose-50 text-rose-800 border border-rose-200">
            Priority Decarbonization Targets
          </span>
        }
        actions={
          <NavLink to="/recommendations" className="btn-primary text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Targeted Reductions</span>
          </NavLink>
        }
      />

      {/* Overview callout */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 via-amber-50 to-white border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2.5">
          <Flame className="w-5 h-5 text-rose-600 shrink-0" />
          <span>
            The top <strong>4 suppliers</strong> and <strong>2 transport lanes</strong> account for over <strong>72%</strong> of your total corporate value-chain footprint. Prioritizing these hotspots yields the highest ROI on decarbonization capital.
          </span>
        </div>
      </div>

      {/* Ranked Hotspot Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className="card-base p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{sec.title}</h2>
                      <p className="text-xs text-slate-500">{sec.subtitle}</p>
                    </div>
                  </div>
                  <span className="badge bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">
                    {sec.badge}
                  </span>
                </div>

                {/* Ranked List */}
                <div className="space-y-3">
                  {sec.data.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className={`p-3.5 rounded-lg border transition-all ${
                        item.rank === 1
                          ? 'bg-rose-50/40 border-rose-200/80 shadow-subtle'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              item.rank === 1
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {item.rank}
                          </span>
                          <span className="font-semibold text-xs text-slate-900 leading-tight">
                            {item.name}
                          </span>
                        </div>
                        <StatusBadge status={item.impact} />
                      </div>

                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-slate-400 block">Footprint:</span>
                          <span className="font-bold text-slate-800">{formatEmissions(item.emissionsKg)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Share of Total:</span>
                          <span className="font-semibold text-slate-700">{formatPercent(item.share)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Potential Reduction:</span>
                          <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" />
                            {formatEmissions(item.potentialReductionKg)}
                          </span>
                        </div>
                      </div>

                      {item.action && (
                        <div className="mt-2 text-[11px] text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-200/60 flex items-center justify-between">
                          <span>Recommended Action: <strong>{item.action}</strong></span>
                          <NavLink to="/recommendations" className="text-emerald-700 font-semibold hover:underline">
                            Action →
                          </NavLink>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
