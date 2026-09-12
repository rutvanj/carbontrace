import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ShieldCheck, ArrowRight, CheckCircle2, Lock, Mail, AlertCircle } from 'lucide-react';
import { authService } from '../services/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F3EBDD] paper-texture flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F3D2E] text-[#F8F3E8] shadow-subtle ring-8 ring-[#E8DEC9] mb-4">
          <Leaf className="w-8 h-8 text-[#E8DEC9]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17352B]">
          CarbonTrace AI
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm font-bold text-[#0F3D2E] tracking-widest uppercase">
          TRACE. VERIFY. REDUCE.
        </p>
        <p className="mt-2 text-xs text-[#687266] max-w-sm mx-auto">
          Scope 3 Category 4 transportation emissions tracking, verification, and reduction platform.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="card-base p-8 shadow-subtle border border-[#D8CBB4] bg-[#F8F3E8]">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-[#17352B] mb-1">
                Corporate ESG Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6F8068] absolute left-3 top-1/2 -translate-y-1/2" />
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
                <label className="block text-xs font-semibold text-[#17352B]">
                  Password
                </label>
                <span className="text-[11px] text-[#0F3D2E] font-medium hover:underline cursor-pointer">
                  SSO Portal
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6F8068] absolute left-3 top-1/2 -translate-y-1/2" />
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

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

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

          {/* ESG Compliance Demo Credentials with 1-click fill */}
          <div className="mt-6 pt-5 border-t border-[#D8CBB4]">
            <div className="p-3.5 rounded-lg bg-[#E8DEC9]/50 border border-[#D8CBB4] text-xs">
              <div className="flex items-center gap-2 text-[#0F3D2E] font-bold mb-2">
                <ShieldCheck className="w-4 h-4 text-[#0F3D2E]" />
                <span>One-Click Demo Roles</span>
              </div>
              <p className="text-[11px] text-[#687266] mb-2.5">
                Click any credential card to auto-fill credentials:
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAutofill('entry@example.com', 'entrypass')}
                  className="px-2 py-1.5 rounded bg-[#F8F3E8] border border-[#D8CBB4] hover:border-[#0F3D2E] text-[11px] font-semibold text-[#17352B] transition-all text-center"
                >
                  Data Entry
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill('verifier@example.com', 'verifierpass')}
                  className="px-2 py-1.5 rounded bg-[#F8F3E8] border border-[#D8CBB4] hover:border-[#0F3D2E] text-[11px] font-semibold text-[#17352B] transition-all text-center"
                >
                  Verifier
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill('admin@example.com', 'adminpass')}
                  className="px-2 py-1.5 rounded bg-[#F8F3E8] border border-[#D8CBB4] hover:border-[#0F3D2E] text-[11px] font-semibold text-[#17352B] transition-all text-center"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-6 text-center text-xs text-[#6F8068]">
          Compliant with GHG Protocol Corporate Value Chain Standard & GLEC Framework v3.0
        </div>
      </div>
    </div>
  );
}

