import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Network,
  BarChart3,
  Flame,
  Lightbulb,
  Sliders,
  FileCheck2,
  Truck,
  CheckCircle,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ShieldAlert,
  Leaf,
  Bell,
  Search
} from 'lucide-react';
import { cn } from '../../utils/formatters';
import { authService, verificationService } from '../../services/api';

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [user, setUser] = useState(authService.getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  // Restore user from API on mount
  useEffect(() => {
    authService.refreshCurrentUser()
      .then((u) => { if (u) setUser(u); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Check pending count
    verificationService.getPendingShipments()
      .then(records => setPendingCount(records.length))
      .catch(() => {});
  }, [location.pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Suppliers', path: '/suppliers', icon: Users },
    { name: 'Supply Chain', path: '/supply-chain', icon: Network },
    { name: 'Carbon Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Hotspots', path: '/hotspots', icon: Flame },
    { name: 'Recommendations', path: '/recommendations', icon: Lightbulb },
    { name: 'What-if Simulator', path: '/simulator', icon: Sliders },
    { name: 'Audit Trail', path: '/audit', icon: FileCheck2 },
    { name: 'Shipments', path: '/shipments', icon: Truck },
    {
      name: 'Verification',
      path: '/verification',
      icon: CheckCircle,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'amber'
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3EBDD] flex flex-col lg:flex-row text-[#17352B]">
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden bg-[#0F3D2E] text-white border-b border-[#173F32] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E2EBE5] flex items-center justify-center text-[#0F3D2E] shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white">CarbonTrace AI</div>
            <div className="text-[10px] text-[#C5D7CC] font-semibold tracking-wider">TRACE. VERIFY. REDUCE.</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-[#E2EBE5] hover:bg-[#173F32] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop & Mobile Persistent Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#0F3D2E] border-r border-[#173F32] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        )}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 border-b border-[#173F32] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E2EBE5] flex items-center justify-center text-[#0F3D2E] shadow-sm ring-4 ring-[#173F32]">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base text-white tracking-tight leading-none">CarbonTrace AI</h1>
                <p className="text-[10px] text-[#C5D7CC] font-bold tracking-widest mt-1 uppercase">TRACE. VERIFY. REDUCE.</p>
              </div>
            </div>
            {/* Close button on mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#C5D7CC] hover:text-white hover:bg-[#173F32]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scope 3 Protocol pill */}
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-[#173F32]/80 border border-[#1F5D46] text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#E2EBE5]">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
              Scope 3 Intelligence
            </div>
            <div className="text-[11px] text-[#C5D7CC] mt-0.5 font-medium">
              Category 4 Logistics Emissions
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            <div className="px-3 pb-1.5 text-[10px] font-bold text-[#94B8A2] uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all',
                      isActive
                        ? 'bg-[#1F5D46] text-white font-bold border-l-4 border-[#E8DEC9] pl-2 shadow-subtle'
                        : 'text-[#C5D7CC] hover:text-white hover:bg-[#173F32]'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#94B8A2] group-hover:text-white transition-colors" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Footer Actions */}
        <div className="p-3 border-t border-[#173F32] bg-[#0B2C21]/60 space-y-2">
          {/* User Profile Info */}
          <div className="p-2.5 rounded-xl bg-[#173F32] border border-[#1F5D46] flex items-center justify-between shadow-subtle">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#0F3D2E] text-[#E2EBE5] border border-[#1F5D46] flex items-center justify-center font-bold text-xs shrink-0">
                {user?.avatar || 'CT'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">{user?.name || 'Compliance Lead'}</div>
                <div className="text-[10px] text-[#94B8A2] font-semibold truncate">{user?.role || 'ESG Officer'}</div>
              </div>
            </div>
          </div>

          {/* Settings & Logout */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => alert('CarbonTrace Settings: ESG baseline factors, DEFRA/GLEC configurations, and API keys are managed here.')}
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs text-[#C5D7CC] hover:text-white hover:bg-[#173F32] border border-transparent rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center p-1.5 text-xs text-[#C5D7CC] hover:text-[#FECACA] hover:bg-[#991B1B]/40 rounded-lg transition-colors"
              title="Logout from CarbonTrace"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-[#F8F3E8] border-b border-[#D8CBB4] sticky top-0 z-30 shadow-subtle">
          {/* Search / Global Context */}
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-[#8C998B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search suppliers, routes, audit IDs..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D8CBB4] rounded-lg text-[#17352B] placeholder-[#8C998B] focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    navigate(`/shipments?q=${encodeURIComponent(e.target.value)}`);
                  }
                }}
              />
            </div>

            <div className="h-4 w-px bg-[#D8CBB4]"></div>

            <div className="flex items-center gap-2 text-xs text-[#687266]">
              <span className="font-semibold text-[#687266]">Active Tenant:</span>
              <span className="font-bold text-[#0F3D2E] bg-[#E8DEC9] px-2.5 py-0.5 rounded-full border border-[#D8CBB4]">
                Global Logistics Corp
              </span>
            </div>
          </div>

          {/* Quick Actions & Indicators */}
          <div className="flex items-center gap-3">
            {/* Pending verification alert */}
            {pendingCount > 0 && (
              <NavLink
                to="/verification"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-semibold hover:bg-[#FDE68A] transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#D97706]" />
                <span>{pendingCount} Pending Verification</span>
              </NavLink>
            )}

            {/* Quick Add Shipment */}
            <NavLink
              to="/shipments/new"
              className="btn-primary text-xs py-1.5 px-3.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Shipment</span>
            </NavLink>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
