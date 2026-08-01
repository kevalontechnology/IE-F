import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import PendingApproval from './pages/Auth/PendingApproval';

import DashboardRouter from './pages/Dashboard/DashboardRouter';
import CustomerMaster from './pages/Masters/CustomerMaster';
import ProductMaster from './pages/Masters/ProductMaster';
import CompanyMaster from './pages/Masters/CompanyMaster';
import QuotationList from './pages/Quotations/QuotationList';
import QuotationForm from './pages/Quotations/QuotationForm';
import ShipmentList from './pages/Shipments/ShipmentList';
import ShipmentWizard from './pages/Shipments/ShipmentWizard';
import DocumentCenter from './pages/Documents/DocumentCenter';
import UserManagement from './pages/Settings/UserManagement';
import AuditLogList from './pages/AuditLogs/AuditLogList';
import BackupRestore from './pages/Settings/BackupRestore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-500">
        Loading Enterprise CRM Portal...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Routes>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/customers" element={<CustomerMaster />} />
            <Route path="/products" element={<ProductMaster />} />
            <Route path="/company" element={<CompanyMaster />} />

            <Route path="/quotations" element={<QuotationList />} />
            <Route path="/quotations/new" element={<QuotationForm />} />

            <Route path="/shipments" element={<ShipmentList />} />
            <Route path="/shipments/new" element={<ShipmentWizard />} />
            <Route path="/shipments/:id" element={<ShipmentList />} />

            <Route path="/documents" element={<DocumentCenter />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/audit-logs" element={<AuditLogList />} />
            <Route path="/backup" element={<BackupRestore />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
