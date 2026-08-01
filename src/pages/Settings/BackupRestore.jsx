import React from 'react';
import { auditApi } from '../../api/dashboardApi';
import { useToast } from '../../context/ToastContext';
import { Database, Download, RefreshCw, ShieldCheck } from 'lucide-react';

export default function BackupRestore() {
  const { showToast } = useToast();

  const handleExport = () => {
    try {
      auditApi.exportBackup();
      showToast('Database JSON backup export triggered!', 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Database Backup & Disaster Recovery</h1>
          <p className="text-xs text-slate-500">Create full JSON database snapshot exports</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-start gap-4 p-4 bg-brand-50/60 border border-brand-100 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-brand-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-brand-900 space-y-1">
            <h3 className="font-bold text-brand-700">Enterprise Data Safety Standard</h3>
            <p>
              Exporting a backup snapshot packages all Customers, Products, Quotations, Shipments, Documents, and Master configurations into a single JSON file.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
          <div>
            <h3 className="text-xs font-bold text-slate-800">Export Full Database Snapshot</h3>
            <p className="text-[11px] text-slate-500">Includes all active schemas and soft-deleted audit records</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Snapshot</span>
          </button>
        </div>
      </div>
    </div>
  );
}
