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
      setError(err.message || 'Invalid email or password.');
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
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        {/* Logo Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0F3D2E] text-[#F8F3E8] shadow-natural ring-8 ring-[#E8DEC9] mb-4">
          <Leaf className="w-9 h-9 text-[#E8DEC9]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#17352B]">
          CarbonTrace AI
        </h1>
        <p className="mt-2 text-sm sm:text-base font-bold text-[#0F3D2E] tracking-widest uppercase">
          TRACE. VERIFY. REDUCE.
        </p>
        <p className="mt-2 text-sm text-[#687266] max-w-md mx-auto leading-relaxed">
          Scope 3 Category 4 transportation emissions tracking, verification, and reduction platform.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="card-base p-8 sm:p-9 shadow-natural border border-[#D8CBB4] bg-[#F8F3E8]">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-bold text-[#17352B] mb-1.5">
                Corporate ESG Email
              </label>
              <div className="relative">
                <Mail className="w-4.5 h-4.5 text-[#6F8068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base pl-10 text-sm py-2.5"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-[#17352B]">
                  Password
                </label>
                <span className="text-xs text-[#0F3D2E] font-semibold hover:underline cursor-pointer">
                  SSO Portal
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4.5 h-4.5 text-[#6F8068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base pl-10 text-sm py-2.5"
                  placeholder="Enter your security token"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-sm font-semibold">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-[#DC2626]" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 shadow-subtle font-bold"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter CarbonTrace Portal</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ESG Compliance Demo Credentials with 1-click fill */}
          <div className="mt-7 pt-6 border-t border-[#D8CBB4]">
            <div className="p-4 rounded-xl bg-[#E8DEC9]/50 border border-[#D8CBB4] text-sm">
              <div className="flex items-center gap-2 text-[#0F3D2E] font-bold mb-2">
                <ShieldCheck className="w-4.5 h-4.5 text-[#0F3D2E]" />
                <span>One-Click Demo Roles</span>
              </div>
              <p className="text-xs text-[#687266] mb-3">
                Click any credential card to auto-fill credentials:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleAutofill('entry@example.com', 'entrypass')}
                  className="px-3 py-2 rounded-lg bg-[#F8F3E8] border border-[#D8CBB4] hover:border-[#0F3D2E] text-xs font-bold text-[#17352B] transition-all text-center shadow-sm hover:shadow"
                >
                  Data Entry
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill('verifier@example.com', 'verifierpass')}
                  className="px-3 py-2 rounded-lg bg-[#F8F3E8] border border-[#D8CBB4] hover:border-[#0F3D2E] text-xs font-bold text-[#17352B] transition-all text-center shadow-sm hover:shadow"
                >
                  Verifier
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill('admin@example.com', 'adminpass')}
                  className="px-3 py-2 rounded-lg bg-[#F8F3E8] border border-[#D8CBB4] hover:border-[#0F3D2E] text-xs font-bold text-[#17352B] transition-all text-center shadow-sm hover:shadow"
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

