import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import StatusBadge from '../../components/common/StatusBadge';
import { FileText, Clock, CheckCircle, ArrowRightLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SalesDashboard() {
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
          <h1 className="text-xl font-bold text-slate-900">Sales & Quotations Hub</h1>
          <p className="text-xs text-slate-500 font-medium">My Quotations & Conversions</p>
        </div>

        <Link
          to="/quotations/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quotation</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Today's Quotations</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.todaysQuotationsCount || 0}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><FileText className="w-5 h-5" /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Pending Quotes</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.pendingQuotationsCount || 0}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-5 h-5" /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Approved Quotes</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.approvedQuotationsCount || 0}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="w-5 h-5" /></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Converted Shipments</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{stats?.convertedQuotationsCount || 0}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><ArrowRightLeft className="w-5 h-5" /></div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800">My Recent Quotations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-3">Quotation #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.myRecentQuotations?.map((q) => (
                <tr key={q._id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{q.quotationNumber}</td>
                  <td className="p-3 text-slate-700">{q.customerName}</td>
                  <td className="p-3 font-semibold text-slate-800">${q.grandTotal?.toFixed(2)}</td>
                  <td className="p-3"><StatusBadge status={q.status} /></td>
                  <td className="p-3 text-right">
                    {q.status === 'Approved' ? (
                      <Link
                        to={`/quotations/${q._id}`}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition inline-block"
                      >
                        Convert to Shipment
                      </Link>
                    ) : (
                      <Link to={`/quotations/${q._id}`} className="text-brand-600 font-semibold hover:underline">
                        View Details
                      </Link>
                    )}
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
