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
          <span className="badge bg-[#E2EBE5] text-[#0F3D2E] border border-[#1F5D46]/30 font-semibold">
            Multi-Tier Value Chain
          </span>
        }
      />

      {/* Network Explanation Banner */}
      <div className="card-base p-3.5 bg-[#E8DEC9]/50 border border-[#D8CBB4] text-xs text-[#17352B] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0F3D2E] shrink-0" />
          <span>
            Click on any supplier node to inspect Scope 3 footprint, sub-tier dependencies, and audit status. Higher-impact nodes are marked with distinct carbon indicators.
          </span>
        </div>
      </div>

      {/* Interactive Network Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visual Map (3 columns for Anchor, Tier 1, Tier 2, Tier 3) */}
        <div className="lg:col-span-3 card-base p-6 bg-[#F8F3E8] border border-[#D8CBB4] overflow-x-auto">
          <div className="min-w-[700px] flex items-start justify-between gap-6 relative">
            {/* Column 0: Anchor OEM */}
            <div className="w-48 space-y-4">
              <div className="text-xs font-bold text-[#6F8068] uppercase tracking-wider text-center">
                Reporting Entity
              </div>
              <div
                onClick={() => setSelectedNode(network.anchor)}
                className={`p-4 rounded-xl border cursor-pointer transition-all shadow-subtle ${
                  selectedNode?.id === network.anchor.id
                    ? 'border-[#0F3D2E] ring-2 ring-[#0F3D2E]/20 bg-[#E8DEC9]/60'
                    : 'border-[#D8CBB4] bg-[#F8F3E8] hover:border-[#1F5D46]/40'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#0F3D2E] text-[#F8F3E8] flex items-center justify-center mb-2 mx-auto">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#17352B] text-center">{network.anchor.name}</div>
                <div className="text-[10px] text-[#687266] text-center mt-0.5">{network.anchor.location}</div>
                <div className="mt-2 text-center">
                  <span className="badge bg-[#E2EBE5] text-[#0F3D2E] border border-[#1F5D46]/30 text-[10px] font-semibold">
                    Anchor Corporate Hub
                  </span>
                </div>
              </div>
            </div>

            {/* Column 1: Tier 1 Direct Suppliers */}
            <div className="w-52 space-y-3">
              <div className="text-xs font-bold text-[#6F8068] uppercase tracking-wider text-center">
                Tier 1 (Direct Mfrs)
              </div>
              {network.tier1.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all shadow-subtle relative ${
                    node.impact === 'High' ? 'border-l-4 border-l-[#B45309]' : ''
                  } ${
                    selectedNode?.id === node.id
                      ? 'border-[#0F3D2E] ring-2 ring-[#0F3D2E]/20 shadow-md bg-[#E8DEC9]/60'
                      : 'border-[#D8CBB4] bg-[#F8F3E8] hover:border-[#1F5D46]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-[#17352B] leading-tight">{node.name}</div>
                    <StatusBadge status={node.impact} />
                  </div>
                  <div className="text-[11px] text-[#687266] mt-1">{node.material} • {node.location}</div>
                  <div className="mt-2 pt-2 border-t border-[#D8CBB4]/60 flex items-center justify-between text-[11px]">
                    <span className="text-[#687266]">Footprint:</span>
                    <span className="font-bold text-[#0F3D2E]">{formatEmissions(node.emissionsKg)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2: Tier 2 Sub-Suppliers */}
            <div className="w-52 space-y-3">
              <div className="text-xs font-bold text-[#6F8068] uppercase tracking-wider text-center">
                Tier 2 (Components)
              </div>
              {network.tier2.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all shadow-subtle ${
                    selectedNode?.id === node.id
                      ? 'border-[#0F3D2E] ring-2 ring-[#0F3D2E]/20 shadow-md bg-[#E8DEC9]/60'
                      : 'border-[#D8CBB4] bg-[#F8F3E8] hover:border-[#1F5D46]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-[#17352B] leading-tight">{node.name}</div>
                    <StatusBadge status={node.impact} />
                  </div>
                  <div className="text-[11px] text-[#687266] mt-1">{node.material} • {node.location}</div>
                  <div className="mt-2 pt-2 border-t border-[#D8CBB4]/60 flex items-center justify-between text-[11px]">
                    <span className="text-[#687266]">Footprint:</span>
                    <span className="font-bold text-[#0F3D2E]">{formatEmissions(node.emissionsKg)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 3: Tier 3 Extraction */}
            <div className="w-52 space-y-3">
              <div className="text-xs font-bold text-[#6F8068] uppercase tracking-wider text-center">
                Tier 3 (Raw Materials)
              </div>
              {network.tier3.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all shadow-subtle ${
                    selectedNode?.id === node.id
                      ? 'border-[#0F3D2E] ring-2 ring-[#0F3D2E]/20 shadow-md bg-[#E8DEC9]/60'
                      : 'border-[#D8CBB4] bg-[#F8F3E8] hover:border-[#1F5D46]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-[#17352B] leading-tight">{node.name}</div>
                    <StatusBadge status={node.impact} />
                  </div>
                  <div className="text-[11px] text-[#687266] mt-1">{node.material} • {node.location}</div>
                  <div className="mt-2 pt-2 border-t border-[#D8CBB4]/60 flex items-center justify-between text-[11px]">
                    <span className="text-[#687266]">Footprint:</span>
                    <span className="font-bold text-[#0F3D2E]">{formatEmissions(node.emissionsKg)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node Detail Inspector Panel */}
        <div className="card-base p-5 flex flex-col justify-between border border-[#D8CBB4]">
          <div>
            <div className="border-b border-[#D8CBB4] pb-3 mb-4">
              <div className="text-[10px] font-bold text-[#6F8068] uppercase tracking-wider">
                Node Inspector
              </div>
              <h2 className="text-base font-bold text-[#17352B] mt-0.5">
                {selectedNode?.name || 'Select a Node'}
              </h2>
              <div className="text-xs text-[#687266] flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#6F8068]" />
                <span>{selectedNode?.location}</span>
              </div>
            </div>

            {selectedNode && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[#687266] block mb-0.5">Value Chain Tier:</span>
                  <StatusBadge status={selectedNode.tier || 'Tier 1'} />
                </div>

                <div>
                  <span className="text-[#687266] block mb-0.5">Material Specialization:</span>
                  <span className="font-semibold text-[#17352B]">{selectedNode.material || 'Corporate Operations'}</span>
                </div>

                <div>
                  <span className="text-[#687266] block mb-0.5">Scope 3 Emissions:</span>
                  <span className="font-extrabold text-[#0F3D2E] text-sm">
                    {formatEmissions(selectedNode.emissionsKg)}
                  </span>
                </div>

                <div>
                  <span className="text-[#687266] block mb-0.5">Impact Severity:</span>
                  <StatusBadge status={selectedNode.impact} />
                </div>

                {selectedNode.verification && (
                  <div>
                    <span className="text-[#687266] block mb-0.5">Audit Verification Rate:</span>
                    <span className="font-semibold text-[#0F3D2E]">{selectedNode.verification}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedNode && selectedNode.id !== 'NODE-ROOT' && (
            <div className="pt-4 border-t border-[#D8CBB4] mt-4">
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
