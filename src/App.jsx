import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Suppliers } from './pages/Suppliers';
import { SupplierDetails } from './pages/SupplierDetails';
import { Shipments } from './pages/Shipments';
import { AddShipment } from './pages/AddShipment';
import { Verification } from './pages/Verification';
import { SupplyChainMap } from './pages/SupplyChainMap';
import { CarbonAnalytics } from './pages/CarbonAnalytics';
import { Hotspots } from './pages/Hotspots';
import { Recommendations } from './pages/Recommendations';
import { WhatIfSimulator } from './pages/WhatIfSimulator';
import { AuditTrail } from './pages/AuditTrail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Shell */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/:id" element={<SupplierDetails />} />
          <Route path="/supply-chain" element={<SupplyChainMap />} />
          <Route path="/analytics" element={<CarbonAnalytics />} />
          <Route path="/hotspots" element={<Hotspots />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/simulator" element={<WhatIfSimulator />} />
          <Route path="/audit" element={<AuditTrail />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/shipments/new" element={<AddShipment />} />
          <Route path="/verification" element={<Verification />} />
        </Route>

        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
