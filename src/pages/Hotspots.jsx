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
          <span className="badge bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] font-semibold">
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
      <div className="card-base p-4 bg-[#E8DEC9]/50 border border-[#D8CBB4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#17352B]">
        <div className="flex items-center gap-2.5">
          <Flame className="w-5 h-5 text-[#B45309] shrink-0" />
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
            <div key={idx} className="card-base p-5 flex flex-col justify-between border border-[#D8CBB4]">
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-[#D8CBB4] pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#E8DEC9] text-[#0F3D2E] border border-[#D8CBB4]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#17352B]">{sec.title}</h2>
                      <p className="text-xs text-[#687266]">{sec.subtitle}</p>
                    </div>
                  </div>
                  <span className="badge bg-[#E8DEC9]/60 text-[#17352B] border border-[#D8CBB4] text-[10px]">
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
                          ? 'bg-[#E8DEC9]/50 border-[#1F5D46]/40 shadow-subtle'
                          : 'bg-[#F8F3E8] border-[#D8CBB4] hover:border-[#1F5D46]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              item.rank === 1
                                ? 'bg-[#0F3D2E] text-[#F8F3E8]'
                                : 'bg-[#E8DEC9] text-[#17352B]'
                            }`}
                          >
                            {item.rank}
                          </span>
                          <span className="font-semibold text-xs text-[#17352B] leading-tight">
                            {item.name}
                          </span>
                        </div>
                        <StatusBadge status={item.impact} />
                      </div>

                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-2 border-t border-[#D8CBB4]/60">
                        <div>
                          <span className="text-[#687266] block">Footprint:</span>
                          <span className="font-bold text-[#17352B]">{formatEmissions(item.emissionsKg)}</span>
                        </div>
                        <div>
                          <span className="text-[#687266] block">Share of Total:</span>
                          <span className="font-semibold text-[#17352B]">{formatPercent(item.share)}</span>
                        </div>
                        <div>
                          <span className="text-[#687266] block">Potential Reduction:</span>
                          <span className="font-bold text-[#0F3D2E] flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" />
                            {formatEmissions(item.potentialReductionKg)}
                          </span>
                        </div>
                      </div>

                      {item.action && (
                        <div className="mt-2 text-[11px] text-[#0F3D2E] bg-[#E2EBE5] px-2.5 py-1.5 rounded border border-[#1F5D46]/30 flex items-center justify-between">
                          <span>Recommended Action: <strong>{item.action}</strong></span>
                          <NavLink to="/recommendations" className="text-[#0F3D2E] font-bold hover:underline">
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
