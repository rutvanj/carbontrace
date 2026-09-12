import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  Building2,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  ExternalLink,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/FeedbackStates';
import { formatEmissions } from '../utils/formatters';
import { supplyChainService } from '../services/api';

export function SupplyChainMap() {
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await supplyChainService.getNetwork();
        setNetwork(data);
        // Default select Tier 1 highest impact supplier
        if (data?.tier1?.length > 0) {
          setSelectedNode(data.tier1[0]);
        }
      } catch (err) {
        console.error('Failed to load supply chain network:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !network) {
    return <LoadingState message="Visualizing multi-tier supply chain network..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supply Chain Network Map"
        description="Multi-tier upstream topology showing value-chain relationships from raw extraction (Tier 3) to OEM final assembly."
        badge={
          <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200">
            Multi-Tier Value Chain
          </span>
        }
      />

      {/* Network Explanation Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            Click on any supplier node to inspect Scope 3 footprint, sub-tier dependencies, and audit status. Higher-impact nodes are marked with distinct carbon indicators.
          </span>
        </div>
      </div>

      {/* Interactive Network Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visual Map (3 columns for Anchor, Tier 1, Tier 2, Tier 3) */}
        <div className="lg:col-span-3 card-base p-6 bg-slate-50/50 overflow-x-auto">
          <div className="min-w-[700px] flex items-start justify-between gap-6 relative">
            {/* Column 0: Anchor OEM */}
            <div className="w-48 space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                Reporting Entity
              </div>
              <div
                onClick={() => setSelectedNode(network.anchor)}
                className={`p-4 rounded-xl border bg-white cursor-pointer transition-all shadow-subtle ${
                  selectedNode?.id === network.anchor.id
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 mx-auto">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 text-center">{network.anchor.name}</div>
                <div className="text-[10px] text-slate-500 text-center mt-0.5">{network.anchor.location}</div>
                <div className="mt-2 text-center">
                  <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px]">
                    Anchor Corporate Hub
                  </span>
                </div>
              </div>
            </div>

            {/* Column 1: Tier 1 Direct Suppliers */}
            <div className="w-52 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                Tier 1 (Direct Mfrs)
              </div>
              {network.tier1.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border bg-white cursor-pointer transition-all shadow-subtle relative ${
                    node.impact === 'High' ? 'border-l-4 border-l-rose-500' : ''
                  } ${
                    selectedNode?.id === node.id
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-slate-900 leading-tight">{node.name}</div>
                    <StatusBadge status={node.impact} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{node.material} • {node.location}</div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Footprint:</span>
                    <span className="font-bold text-slate-800">{formatEmissions(node.emissionsKg)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2: Tier 2 Sub-Suppliers */}
            <div className="w-52 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                Tier 2 (Components)
              </div>
              {network.tier2.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border bg-white cursor-pointer transition-all shadow-subtle ${
                    selectedNode?.id === node.id
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-slate-900 leading-tight">{node.name}</div>
                    <StatusBadge status={node.impact} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{node.material} • {node.location}</div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Footprint:</span>
                    <span className="font-bold text-slate-800">{formatEmissions(node.emissionsKg)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 3: Tier 3 Extraction */}
            <div className="w-52 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                Tier 3 (Raw Materials)
              </div>
              {network.tier3.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border bg-white cursor-pointer transition-all shadow-subtle ${
                    selectedNode?.id === node.id
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-slate-900 leading-tight">{node.name}</div>
                    <StatusBadge status={node.impact} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{node.material} • {node.location}</div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Footprint:</span>
                    <span className="font-bold text-slate-800">{formatEmissions(node.emissionsKg)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node Detail Inspector Panel */}
        <div className="card-base p-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Node Inspector
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                {selectedNode?.name || 'Select a Node'}
              </h2>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedNode?.location}</span>
              </div>
            </div>

            {selectedNode && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Value Chain Tier:</span>
                  <StatusBadge status={selectedNode.tier || 'Tier 1'} />
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Material Specialization:</span>
                  <span className="font-semibold text-slate-800">{selectedNode.material || 'Corporate Operations'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Scope 3 Emissions:</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {formatEmissions(selectedNode.emissionsKg)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Impact Severity:</span>
                  <StatusBadge status={selectedNode.impact} />
                </div>

                {selectedNode.verification && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Audit Verification Rate:</span>
                    <span className="font-semibold text-emerald-800">{selectedNode.verification}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedNode && selectedNode.id !== 'NODE-ROOT' && (
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => navigate(`/suppliers/${selectedNode.id}`)}
                className="w-full btn-primary text-xs py-2"
              >
                <span>View Full Supplier Dossier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
