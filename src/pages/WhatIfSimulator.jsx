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

  // Comparison Chart Data
  const chartData = result ? [
    { name: 'Baseline (Diesel Road)', emissions: result.currentEmissionsKg, fill: '#64748b' },
    { name: 'Simulated Scenario', emissions: result.projectedEmissionsKg, fill: '#059669' }
  ] : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="What-if Decarbonization Simulator"
        description="Model the emission reduction impact of changing logistics modalities, shortening supply distances, increasing recycled material feedstocks, and scaling renewable energy."
        badge={
          <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200">
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

      {/* Disclaimed note */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Isolated Sandbox Model:</strong> Calculations here provide immediate sensitivity testing. The authoritative calculation will be powered by the FastAPI backend.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Scenario Controls */}
        <div className="card-base p-6 space-y-5 bg-white">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Scenario Parameter Sliders</h2>
            <p className="text-xs text-slate-500">Adjust variables to calculate projected Scope 3 savings</p>
          </div>

          {/* 1. Transport Mode */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Alternative Transport Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Road', 'Rail', 'Sea', 'Air'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    mode === m
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
              <span className="font-semibold text-slate-700">Transport Distance</span>
              <span className="font-bold text-emerald-700">{distance} km</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>50 km</span>
              <span>5,000 km</span>
            </div>
          </div>

          {/* 3. Shipment Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Shipment Weight</span>
              <span className="font-bold text-emerald-700">{weight} tonnes</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 t</span>
              <span>100 t</span>
            </div>
          </div>

          {/* 4. Recycled Material % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Recycled Content Blend %</span>
              <span className="font-bold text-emerald-700">{recycledPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={recycledPercent}
              onChange={(e) => setRecycledPercent(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Virgin Primary)</span>
              <span>100% (Fully Circular)</span>
            </div>
          </div>

          {/* 5. Renewable Energy % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Supplier Renewable Energy Share %</span>
              <span className="font-bold text-emerald-700">{renewablePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={renewablePercent}
              onChange={(e) => setRenewablePercent(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
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
                subtext="Absolute carbon avoided"
                icon={TrendingDown}
                changeType="positive"
              />
              <StatCard
                title="Reduction %"
                value={formatPercent(result.reductionPercent)}
                subtext="Relative decrease"
                badge={
                  <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
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
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `${Math.round(v)} kg`} />
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
                <Bar dataKey="emissions" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Scenario Synthesis Summary */}
          <div className="card-base p-5 bg-gradient-to-r from-emerald-50/60 via-white to-slate-50 border-emerald-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Scenario Analysis & Feasibility
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Switching from Road to <strong>{mode}</strong> across <strong>{distance} km</strong> while requiring <strong>{recycledPercent}% recycled materials</strong> and <strong>{renewablePercent}% clean power</strong> eliminates approximately <strong>{formatEmissions(result?.reductionKg)}</strong> per batch, delivering an estimated <strong>{result?.reductionPercent}% decarbonization</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
