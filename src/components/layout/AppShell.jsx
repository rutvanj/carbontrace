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
  const [pendingCount, setPendingCount] = useState(4);
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row text-slate-800">
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-slate-900">CarbonTrace AI</div>
            <div className="text-[10px] text-emerald-700 font-medium">Trace. Verify. Reduce.</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop & Mobile Persistent Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        )}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm ring-4 ring-emerald-50">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base text-slate-900 tracking-tight leading-none">CarbonTrace AI</h1>
                <p className="text-[11px] text-emerald-700 font-semibold tracking-wide mt-1 uppercase">Trace. Verify. Reduce.</p>
              </div>
            </div>
            {/* Close button on mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scope 3 Protocol pill */}
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Scope 3 Intelligence
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              Upstream & Logistics emissions
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                      'group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-emerald-50/80 text-emerald-900 font-semibold border-l-4 border-emerald-600 pl-2'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-700 transition-colors" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Footer Actions */}
        <div className="p-3 border-t border-slate-200/90 bg-slate-50/60 space-y-2">
          {/* User Profile Info */}
          <div className="p-2 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between shadow-subtle">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.avatar || 'CT'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Compliance Lead'}</div>
                <div className="text-[11px] text-emerald-700 font-medium truncate">{user?.role || 'ESG Officer'}</div>
              </div>
            </div>
          </div>

          {/* Settings & Logout */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => alert('CarbonTrace Settings: ESG baseline factors, DEFRA/GLEC configurations, and API keys are managed here.')}
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center p-1.5 text-xs text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              title="Logout from CarbonTrace demo"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-subtle">
          {/* Search / Global Context */}
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search suppliers, routes, audit IDs..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    navigate(`/shipments?q=${encodeURIComponent(e.target.value)}`);
                  }
                }}
              />
            </div>

            <div className="h-4 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-medium text-slate-500">Active Tenant:</span>
              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium hover:bg-amber-100 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>{pendingCount} Pending Verification</span>
              </NavLink>
            )}

            {/* Quick Add Shipment */}
            <NavLink
              to="/shipments/new"
              className="btn-primary text-xs py-1.5 px-3"
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
