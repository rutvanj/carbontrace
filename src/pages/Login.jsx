import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ShieldCheck, ArrowRight, CheckCircle2, Lock, Mail } from 'lucide-react';
import { authService } from '../services/api';

export function Login() {
  const [email, setEmail] = useState('elena.vance@carbontrace.corp');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-slate-100/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-md ring-8 ring-emerald-50 mb-4">
          <Leaf className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          CarbonTrace AI
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm font-semibold text-emerald-700 tracking-wider uppercase">
          Trace. Verify. Reduce.
        </p>
        <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto">
          Enterprise Scope 3 supply-chain carbon intelligence and verification platform.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="card-base p-8 shadow-dropdown">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate ESG Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base pl-9 text-xs"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-emerald-700 hover:underline cursor-pointer">
                  Single Sign-On (SSO)
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base pl-9 text-xs"
                  placeholder="Enter your security token"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter CarbonTrace Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ESG Compliance Demo Banner */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/50 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Hackathon Demo Access</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Clicking above logs you in as <strong>Elena Vance</strong> (Lead ESG Compliance Officer) with access to all verified Scope 3 analytics and simulation modules.
              </p>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Compliant with GHG Protocol Corporate Value Chain Standard & GLEC v3.0
        </div>
      </div>
    </div>
  );
}
