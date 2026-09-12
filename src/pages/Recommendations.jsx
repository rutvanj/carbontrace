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
        title="Decarbonization Pathways & Recommendations"
        description="Machine learning and heuristic recommendations to transition high-emission freight, suppliers, and raw materials to lower-carbon alternatives."
        badge={
          <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200">
            Actionable Scope 3 Reductions
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
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
            className="card-base p-6 flex flex-col justify-between border-slate-200 hover:border-emerald-300 transition-colors"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    {rec.category}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                    {rec.title}
                  </h2>
                </div>
                <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 font-bold text-xs">
                  -{rec.reductionPercent}% CO₂e
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                {rec.description}
              </p>

              {/* Before vs After Comparison Block */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
                {/* Current Baseline */}
                <div className="space-y-1.5 border-r border-slate-200 pr-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Current Baseline
                  </span>
                  <div className="text-xs font-semibold text-slate-800">
                    {rec.currentTransport}
                  </div>
                  <div className="text-sm font-bold text-slate-700">
                    {rec.currentEmissionsDisplay}
                  </div>
                </div>

                {/* Alternative Solution */}
                <div className="space-y-1.5 pl-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Lower-Carbon Alternative
                  </span>
                  <div className="text-xs font-semibold text-emerald-950">
                    {rec.alternativeTransport}
                  </div>
                  <div className="text-sm font-extrabold text-emerald-800">
                    {rec.projectedEmissionsDisplay}
                  </div>
                </div>
              </div>

              {/* Net Potential Savings Pill */}
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 mb-4">
                <span className="font-medium">Net Potential Saving:</span>
                <span className="font-extrabold flex items-center gap-1 text-emerald-800">
                  <TrendingDown className="w-4 h-4" />
                  {rec.potentialReductionDisplay} (-{rec.reductionPercent}%)
                </span>
              </div>

              {/* Implementation Metadata */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                <div>
                  Complexity: <strong className="text-slate-800 font-semibold">{rec.implementationComplexity}</strong>
                </div>
                <div>
                  Cost Impact: <strong className="text-slate-800 font-semibold">{rec.estimatedCostImpact}</strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Target: {rec.applicableSuppliers?.join(', ')}
              </span>
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
        ))}
      </div>
    </div>
  );
}
