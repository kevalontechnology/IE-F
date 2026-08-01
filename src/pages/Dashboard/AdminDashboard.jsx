import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { authApi } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import {
  Users,
  Ship,
  DollarSign,
  FileCheck,
  UserCheck,
  UserX,
  Lock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        dashboardApi.getStats(),
        authApi.getUsers({ status: 'Pending' }),
      ]);

      if (statsRes.success) setStats(statsRes.data.stats);
      if (usersRes.success) setPendingUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUserStatusUpdate = async (userId, newStatus) => {
    try {
      const res = await authApi.updateUserStatus(userId, { status: newStatus });
      if (res.success) {
        showToast(`User status updated to ${newStatus}`, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <SkeletonLoader rows={6} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin Control & Operations Center</h1>
          <p className="text-xs text-slate-500 font-medium">Enterprise Export Operations Summary</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/shipments/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Shipment</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pending Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending User Approvals</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.pendingUsersCount || 0}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 font-medium">Requires Admin Approval</p>
        </div>

        {/* Today's Shipments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Shipments</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.todaysShipmentsCount || 0}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 font-medium">Containers Dispatched Today</p>
        </div>

        {/* Total Export Revenue USD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue (USD)</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                ${stats?.totalRevenueUSD ? stats.totalRevenueUSD.toLocaleString() : '0'}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 font-medium">INR Equivalent: ₹{stats?.totalRevenueINR ? stats.totalRevenueINR.toLocaleString() : '0'}</p>
        </div>

        {/* Pending Documents */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Documents</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.pendingDocumentsCount || 0}</h3>
            </div>
            <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 font-medium">Unarchived Export PDFs</p>
        </div>
      </div>

      {/* Pending Approval Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Pending User Registrations</h2>
            <p className="text-xs text-slate-500">Review newly registered accounts and assign permissions</p>
          </div>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
            {pendingUsers.length} Pending
          </span>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No pending user registration requests. All registered users are approved.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Requested Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold text-slate-800">{u.fullName}</td>
                    <td className="p-3 text-slate-600">{u.companyName}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 font-medium text-brand-700">{u.role}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleUserStatusUpdate(u._id, 'Approved')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUserStatusUpdate(u._id, 'Rejected')}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Shipments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">Recent Shipments</h2>
            <Link to="/shipments" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentShipments?.map((s) => (
              <div key={s._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <p className="font-bold text-slate-900">Invoice #{s.invoiceNumber}</p>
                  <p className="text-slate-500">Container: {s.shippingDetails?.containerNumber} • {s.customerDetails?.customerName}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">Recent Quotations</h2>
            <Link to="/quotations" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentQuotations?.map((q) => (
              <div key={q._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <p className="font-bold text-slate-900">Quotation #{q.quotationNumber}</p>
                  <p className="text-slate-500">{q.customerName} • ${q.grandTotal?.toFixed(2)}</p>
                </div>
                <StatusBadge status={q.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
