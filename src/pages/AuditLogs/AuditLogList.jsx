import React, { useState, useEffect } from 'react';
import { auditApi } from '../../api/dashboardApi';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { Activity, Shield, Monitor } from 'lucide-react';

export default function AuditLogList() {
  const [activeTab, setActiveTab] = useState('Audit Trail');

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);

  const [loginHistory, setLoginHistory] = useState([]);
  const [loginTotal, setLoginTotal] = useState(0);
  const [loginPage, setLoginPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'Audit Trail') {
          const res = await auditApi.getLogs({ page: auditPage, limit: 10 });
          if (res.success) {
            setAuditLogs(res.data);
            setAuditTotal(res.meta?.total || res.data.length);
          }
        } else {
          const res = await auditApi.getLoginHistory({ page: loginPage, limit: 10 });
          if (res.success) {
            setLoginHistory(res.data);
            setLoginTotal(res.meta?.total || res.data.length);
          }
        }
      } catch (err) {
        showToast(err.message || 'Failed to fetch logs', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, auditPage, loginPage]);

  const auditColumns = [
    { header: 'Action', accessor: 'action', cell: (row) => <span className="font-bold text-slate-900">{row.action}</span> },
    { header: 'Module', accessor: 'module', cell: (row) => <span className="px-2 py-0.5 bg-slate-100 font-semibold rounded">{row.module}</span> },
    { header: 'User', accessor: 'userName' },
    { header: 'Role', accessor: 'userRole', cell: (row) => <span className="font-semibold text-brand-700">{row.userRole}</span> },
    { header: 'Description', accessor: 'description' },
    { header: 'IP Address', accessor: 'ipAddress', cell: (row) => <span className="font-mono text-slate-600">{row.ipAddress}</span> },
    { header: 'Timestamp', accessor: 'createdAt', cell: (row) => new Date(row.createdAt).toLocaleString() },
  ];

  const loginColumns = [
    { header: 'Email', accessor: 'email', cell: (row) => <span className="font-semibold text-slate-900">{row.email}</span> },
    { header: 'IP Address', accessor: 'ipAddress', cell: (row) => <span className="font-mono">{row.ipAddress}</span> },
    { header: 'Browser', accessor: 'browser' },
    { header: 'OS / Device', accessor: 'os', cell: (row) => `${row.os || 'Unknown'} / ${row.device || 'Desktop'}` },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Date & Time', accessor: 'createdAt', cell: (row) => new Date(row.createdAt).toLocaleString() },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('Audit Trail')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'Audit Trail' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          System Audit Trail
        </button>
        <button
          onClick={() => setActiveTab('Login History')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'Login History' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Login History & IP Tracker
        </button>
      </div>

      {activeTab === 'Audit Trail' ? (
        <DataTable
          title="Security & Action Audit Logs"
          columns={auditColumns}
          data={auditLogs}
          total={auditTotal}
          page={auditPage}
          onPageChange={setAuditPage}
          loading={loading}
          exportFilename="audit_trail_export"
        />
      ) : (
        <DataTable
          title="User Login Access History (IP & Device Log)"
          columns={loginColumns}
          data={loginHistory}
          total={loginTotal}
          page={loginPage}
          onPageChange={setLoginPage}
          loading={loading}
          exportFilename="login_history_export"
        />
      )}
    </div>
  );
}
