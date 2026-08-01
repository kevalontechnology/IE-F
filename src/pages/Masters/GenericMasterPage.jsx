import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { genericMasterApi } from '../../api/genericMasterApi';
import { MASTER_CONFIG } from '../../config/master.config';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, RotateCcw } from 'lucide-react';

export default function GenericMasterPage({ masterType: propType }) {
  const { type: paramType } = useParams();
  const type = propType || paramType || 'payment_terms';
  const config = MASTER_CONFIG[type] || MASTER_CONFIG['payment_terms'];

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({});
  const { showToast } = useToast();

  const fetchMasterData = async () => {
    setLoading(true);
    try {
      const res = await genericMasterApi.getAll(type, { page, limit: 10, search, status: statusFilter });
      if (res.success) {
        setItems(res.data);
        setTotal(res.meta?.total || res.data.length);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load master records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    resetForm();
  }, [type]);

  useEffect(() => {
    fetchMasterData();
  }, [type, page, search, statusFilter]);

  const resetForm = () => {
    const initial = {};
    config.fields.forEach((f) => {
      initial[f.name] = f.type === 'number' ? 0 : '';
    });
    setFormData(initial);
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingId(record._id);
    const formValues = {};
    config.fields.forEach((f) => {
      formValues[f.name] = record[f.name] ?? '';
    });
    setFormData(formValues);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await genericMasterApi.update(type, editingId, formData);
        showToast(`${config.singularName} updated successfully`, 'success');
      } else {
        await genericMasterApi.create(type, formData);
        showToast(`${config.singularName} created successfully`, 'success');
      }
      setIsModalOpen(false);
      resetForm();
      fetchMasterData();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await genericMasterApi.toggleStatus(type, id);
      if (res.success) {
        showToast(`Status toggled to ${res.data.status}`, 'success');
        fetchMasterData();
      }
    } catch (err) {
      showToast(err.message || 'Status toggle failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await genericMasterApi.delete(type, deletingId);
      showToast(`${config.singularName} deleted`, 'info');
      setDeletingId(null);
      fetchMasterData();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const tableColumns = [
    ...config.tableColumns.map((col) => ({
      header: col.header,
      accessor: col.accessor,
      cell: (row) =>
        col.accessor === 'status' ? (
          <StatusBadge status={row.status} />
        ) : col.accessor === config.nameField ? (
          <span className="font-bold text-slate-900">{row[col.accessor]}</span>
        ) : (
          row[col.accessor] || '—'
        ),
    })),
    {
      header: 'Status Control',
      cell: (row) => (
        <button
          onClick={() => handleToggleStatus(row._id)}
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded transition ${
            row.status === 'Active' ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          {row.status === 'Active' ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-amber-600" />}
          <span>{row.status}</span>
        </button>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenEdit(row)} className="p-1 text-slate-500 hover:text-brand-600" title="Edit Record">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDeletingId(row._id)} className="p-1 text-slate-500 hover:text-rose-600" title="Soft Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <DataTable
        title={`Admin Master Management — ${config.displayName}`}
        columns={tableColumns}
        data={items}
        total={total}
        page={page}
        onPageChange={setPage}
        onSearch={setSearch}
        loading={loading}
        exportFilename={`${config.key}_master_export`}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        }
        actions={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add {config.singularName}</span>
          </button>
        }
      />

      {/* Dynamic Master Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? `Edit ${config.singularName}` : `Add New ${config.singularName}`} maxWidth="max-w-md">
        <form onSubmit={handleSave} className="space-y-4">
          {config.fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  rows={3}
                  required={f.required}
                  value={formData[f.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  required={f.required}
                  value={formData[f.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [f.name]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-xs">
              {editingId ? `Update ${config.singularName}` : `Create ${config.singularName}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title={`Delete ${config.singularName}`}
        message={`Are you sure you want to soft-delete this ${config.singularName}? If referenced in active shipments or products, deletion will be blocked.`}
      />
    </div>
  );
}
