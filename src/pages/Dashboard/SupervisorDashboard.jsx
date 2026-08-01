import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import StatusBadge from '../../components/common/StatusBadge';
import { Ship, Clock, CheckCircle2, FileCheck, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SupervisorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getStats();
        if (res.success) setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8"><SkeletonLoader rows={5} /></div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Logistics & Shipment Operations</h1>
          <p className="text-xs text-slate-500 font-medium">Supervisor Management Panel</p>
        </div>

        <Link
          to="/shipments/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Multi-Step Shipment</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Today's Shipments</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.todaysShipmentsCount || 0}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Ship className="w-5 h-5" /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Pending Logistics</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.pendingShipmentsCount || 0}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-5 h-5" /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Completed Shipments</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.completedShipmentsCount || 0}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Recent Shipment Dispatches</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Container #</th>
                <th className="p-3">Port of Loading</th>
                <th className="p-3">Port of Discharge</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentShipments?.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{s.invoiceNumber}</td>
                  <td className="p-3 font-medium text-slate-700">{s.shippingDetails?.containerNumber}</td>
                  <td className="p-3 text-slate-600">{s.shippingDetails?.portOfLoading}</td>
                  <td className="p-3 text-slate-600">{s.shippingDetails?.portOfDischarge}</td>
                  <td className="p-3"><StatusBadge status={s.status} /></td>
                  <td className="p-3 text-right">
                    <Link to={`/shipments/${s._id}`} className="text-brand-600 font-semibold hover:underline">
                      Generate PDFs
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
