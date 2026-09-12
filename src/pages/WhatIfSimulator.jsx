import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  TrendingDown,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { ChartCard } from '../components/common/ChartCard';
import { LoadingState } from '../components/common/FeedbackStates';
import { formatEmissions, formatPercent } from '../utils/formatters';
import { simulationService } from '../services/api';

export function WhatIfSimulator() {
  // Scenario Parameters
  const [mode, setMode] = useState('Rail'); // Defaulting to rail alternative
  const [distance, setDistance] = useState(650);
  const [weight, setWeight] = useState(25); // tonnes
  const [recycledPercent, setRecycledPercent] = useState(40);
  const [renewablePercent, setRenewablePercent] = useState(60);

  // Result State
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const runSimulation = async () => {
    setCalculating(true);
    try {
      const sim = await simulationService.simulateScenario({
        mode,
        distance,
        weight,
        recycledPercent,
        renewablePercent
      });
      setResult(sim);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [mode, distance, weight, recycledPercent, renewablePercent]);

  const handleReset = () => {
    setMode('Road');
    setDistance(420);
    setWeight(24);
    setRecycledPercent(0);
    setRenewablePercent(0);
  };

  // Scenario presets
  const applyPreset = (presetMode, presetDist, presetWeight, presetRecycled, presetRenewable) => {
    setMode(presetMode);
    setDistance(presetDist);
    setWeight(presetWeight);
    setRecycledPercent(presetRecycled);
    setRenewablePercent(presetRenewable);
  };

  // Comparison Chart Data
  const chartData = result ? [
    { name: 'Baseline (Diesel Road)', emissions: result.currentEmissionsKg, fill: '#687266' },
    { name: 'Simulated Scenario', emissions: result.projectedEmissionsKg, fill: '#0F3D2E' }
  ] : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="What-if Decarbonization Simulator"
        description="Model the emission reduction impact of changing logistics modalities, shortening supply distances, increasing recycled material feedstocks, and scaling renewable energy."
        badge={
          <span className="badge bg-[#E2EBE5] text-[#0F3D2E] border border-[#1F5D46]/30">
            Interactive Scenario Sandbox
          </span>
        }
        actions={
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Road Baseline</span>
          </button>
        }
      />

      {/* Disclaimed note & Scenario Presets */}
      <div className="p-4 rounded-xl bg-[#F8F3E8] border border-[#D8CBB4] text-xs text-[#17352B] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-subtle">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0F3D2E] shrink-0" />
          <span className="text-xs text-[#687266]">
            <strong>Sensitivity Engine:</strong> Instant scenario modeling grounded in activity tonne-km factors.
          </span>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-[#687266]">Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('Rail', 750, 24, 25, 40)}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#D8CBB4] hover:bg-[#E8DEC9] text-[11px] font-semibold text-[#17352B] transition-colors"
          >
            Rail Freight Shift
          </button>
          <button
            type="button"
            onClick={() => applyPreset('Road', 180, 20, 60, 80)}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#D8CBB4] hover:bg-[#E8DEC9] text-[11px] font-semibold text-[#17352B] transition-colors"
          >
            Nearshore Circular
          </button>
          <button
            type="button"
            onClick={() => applyPreset('Sea', 3500, 45, 10, 20)}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#D8CBB4] hover:bg-[#E8DEC9] text-[11px] font-semibold text-[#17352B] transition-colors"
          >
            Maritime Bulk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Scenario Controls */}
        <div className="card-base p-6 space-y-5 border border-[#D8CBB4] bg-[#F8F3E8]">
          <div className="border-b border-[#D8CBB4]/60 pb-3">
            <h2 className="text-sm font-bold text-[#17352B]">Scenario Parameter Sliders</h2>
            <p className="text-xs text-[#687266]">Adjust variables to calculate projected Scope 3 savings</p>
          </div>

          {/* 1. Transport Mode */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#17352B]">
              Alternative Transport Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Road', 'Rail', 'Sea', 'Air'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    mode === m
                      ? 'bg-[#0F3D2E] text-white border-[#0F3D2E] shadow-subtle'
                      : 'bg-white text-[#17352B] border-[#D8CBB4] hover:bg-[#E8DEC9]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Distance Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-[#17352B]">Transport Distance</span>
              <span className="font-extrabold text-[#0F3D2E]">{distance} km</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full accent-[#0F3D2E] h-1.5 bg-[#D8CBB4] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#687266] font-semibold">
              <span>50 km</span>
              <span>5,000 km</span>
            </div>
          </div>

          {/* 3. Shipment Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-[#17352B]">Shipment Weight</span>
              <span className="font-extrabold text-[#0F3D2E]">{weight} tonnes</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full accent-[#0F3D2E] h-1.5 bg-[#D8CBB4] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#687266] font-semibold">
              <span>1 t</span>
              <span>100 t</span>
            </div>
          </div>

          {/* 4. Recycled Material % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-[#17352B]">Recycled Content Blend %</span>
              <span className="font-extrabold text-[#0F3D2E]">{recycledPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={recycledPercent}
              onChange={(e) => setRecycledPercent(Number(e.target.value))}
              className="w-full accent-[#0F3D2E] h-1.5 bg-[#D8CBB4] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#687266] font-semibold">
              <span>0% (Virgin Primary)</span>
              <span>100% (Fully Circular)</span>
            </div>
          </div>

          {/* 5. Renewable Energy % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-[#17352B]">Supplier Renewable Energy Share %</span>
              <span className="font-extrabold text-[#0F3D2E]">{renewablePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={renewablePercent}
              onChange={(e) => setRenewablePercent(Number(e.target.value))}
              className="w-full accent-[#0F3D2E] h-1.5 bg-[#D8CBB4] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#687266] font-semibold">
              <span>0% (Standard Grid)</span>
              <span>100% (Solar/Wind PPA)</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Results & Visual Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {/* Result Metric Cards */}
          {result && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                title="Current Baseline"
                value={formatEmissions(result.currentEmissionsKg)}
                subtext="Diesel Road Default"
              />
              <StatCard
                title="Projected Footprint"
                value={formatEmissions(result.projectedEmissionsKg)}
                subtext="Simulated Scope 3"
              />
              <StatCard
                title="Net Reduction"
                value={formatEmissions(result.reductionKg)}
                subtext="Avoided carbon"
                icon={TrendingDown}
                changeType="positive"
              />
              <StatCard
                title="Reduction %"
                value={formatPercent(result.reductionPercent)}
                subtext="Relative decrease"
                badge={
                  <span className="badge bg-[#E2EBE5] text-[#0F3D2E] border border-[#1F5D46]/30 font-bold">
                    -{result.reductionPercent}%
                  </span>
                }
              />
            </div>
          )}

          {/* Side-by-Side Comparison Chart */}
          <ChartCard
            title="Baseline vs. Simulated Scenario Comparison"
            subtitle="Comparing standard business-as-usual vs adjusted parameters"
            minHeight="h-72"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#17352B" fontSize={11} tickLine={false} />
                <YAxis stroke="#687266" fontSize={11} tickLine={false} tickFormatter={(v) => `${Math.round(v)} kg`} />
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
                <Bar dataKey="emissions" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Scenario Synthesis Summary */}
          <div className="card-base p-5 bg-gradient-to-r from-[#E2EBE5] via-[#F8F3E8] to-[#E8DEC9] border border-[#1F5D46]/40 shadow-subtle">
            <h3 className="text-xs font-bold text-[#0F3D2E] uppercase tracking-wider mb-1.5">
              Decarbonization Feasibility Insight
            </h3>
            <p className="text-xs text-[#17352B] leading-relaxed">
              Transitioning this transport stream to <strong>{mode}</strong> over <strong>{distance} km</strong> while requiring <strong>{recycledPercent}% recycled materials</strong> and <strong>{renewablePercent}% clean power</strong> eliminates approximately <strong>{formatEmissions(result?.reductionKg)}</strong> per delivery, yielding an estimated <strong>{result?.reductionPercent}% emissions reduction</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
