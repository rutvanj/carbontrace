import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Sliders,
  DollarSign,
  Layers,
  CheckCircle2,
  RefreshCw,
  Building2,
  Truck
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingState } from '../components/common/FeedbackStates';
import { formatEmissions, formatPercent } from '../utils/formatters';
import { recommendationService } from '../services/api';

export function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await recommendationService.getRecommendations();
        setRecommendations(data);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <LoadingState message="Generating AI decarbonization recommendations..." />;
  }

  const categories = ['All', 'Transport Modal Shift', 'Modal Shift', 'Supplier Transition', 'Material Circularity'];

  const filtered = recommendations.filter((r) => {
    if (filterCategory === 'All') return true;
    return r.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reduce: Decarbonization Pathways"
        description="Machine learning and heuristic recommendations to transition high-emission freight corridors and transport modes to verified lower-carbon alternatives."
        badge={
          <span className="badge bg-[#E2EBE5] text-[#0F3D2E] border border-[#1F5D46]/30">
            Step 3: REDUCE (Algorithmic Decarbonization)
          </span>
        }
        actions={
          <NavLink to="/simulator" className="btn-primary text-xs">
            <Sliders className="w-3.5 h-3.5" />
            <span>Launch What-if Simulator</span>
          </NavLink>
        }
      />

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterCategory === cat
                ? 'bg-[#0F3D2E] text-white shadow-subtle'
                : 'bg-[#F8F3E8] text-[#17352B] hover:bg-[#E8DEC9] border border-[#D8CBB4]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((rec) => (
          <div
            key={rec.id}
            className="card-base p-6 flex flex-col justify-between border border-[#D8CBB4] hover:border-[#0F3D2E] hover:shadow-natural transition-all duration-200"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[11px] font-extrabold text-[#0F3D2E] uppercase tracking-wider">
                    {rec.category}
                  </span>
                  <h2 className="text-base font-extrabold text-[#17352B] mt-0.5 leading-snug">
                    {rec.title}
                  </h2>
                </div>
                <span className="badge bg-[#E2EBE5] text-[#0F3D2E] border border-[#1F5D46]/40 shrink-0 font-extrabold text-xs">
                  -{rec.reductionPercent}% CO₂e
                </span>
              </div>

              <p className="text-xs text-[#687266] leading-relaxed mb-5">
                {rec.description}
              </p>

              {/* Before vs After Comparison Block */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#FDFBF7] border border-[#D8CBB4] mb-4">
                {/* Current Baseline */}
                <div className="space-y-1.5 border-r border-[#D8CBB4]/70 pr-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#687266]">
                    Current Baseline
                  </span>
                  <div className="text-xs font-bold text-[#17352B] truncate">
                    {rec.currentTransport}
                  </div>
                  <div className="text-sm font-extrabold text-[#991B1B]">
                    {rec.currentEmissionsDisplay}
                  </div>
                </div>

                {/* Alternative Solution */}
                <div className="space-y-1.5 pl-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F3D2E]">
                    Lower-Carbon Alternative
                  </span>
                  <div className="text-xs font-bold text-[#0F3D2E] truncate">
                    {rec.alternativeTransport}
                  </div>
                  <div className="text-sm font-extrabold text-[#0F3D2E]">
                    {rec.projectedEmissionsDisplay}
                  </div>
                </div>
              </div>

              {/* Net Potential Savings Pill */}
              <div className="p-3 rounded-xl bg-[#E2EBE5] border border-[#1F5D46]/30 flex items-center justify-between text-xs text-[#0F3D2E] mb-4">
                <span className="font-bold">Net Potential Savings:</span>
                <span className="font-extrabold flex items-center gap-1 text-[#0F3D2E]">
                  <TrendingDown className="w-4 h-4" />
                  {rec.potentialReductionDisplay} (-{rec.reductionPercent}%)
                </span>
              </div>

              {/* Implementation Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs text-[#687266] pt-3 border-t border-[#D8CBB4]/50">
                <div>
                  Complexity: <strong className="text-[#17352B] font-bold">{rec.implementationComplexity}</strong>
                </div>
                <div>
                  Cost Impact: <strong className="text-[#17352B] font-bold">{rec.estimatedCostImpact}</strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-[#D8CBB4]/50 flex items-center justify-between">
              <span className="text-[11px] text-[#687266] font-medium">
                Target: {rec.applicableSuppliers?.join(', ')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/simulator?rec=${rec.id}`)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <span>Simulate Impact</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
