import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import SupervisorDashboard from './SupervisorDashboard';
import SalesDashboard from './SalesDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();

  if (user?.role === 'Admin') return <AdminDashboard />;
  if (user?.role === 'Supervisor') return <SupervisorDashboard />;
  return <SalesDashboard />;
}
