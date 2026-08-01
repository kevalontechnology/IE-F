import React, { useState, useEffect } from 'react';
import { masterApi } from '../../api/masterApi';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function CustomerMaster() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    customerName: '',
    company: '',
    country: 'United States',
    gst: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', country: 'United States', postalCode: '' },
    notifyParty: '',
    paymentTerms: 'LC at Sight',
    currency: 'USD',
  });

  const { showToast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await masterApi.getCustomers({ page, limit: 10, search });
      if (res.success) {
        setCustomers(res.data);
        setTotal(res.meta?.total || res.data.length);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await masterApi.updateCustomer(editingId, form);
        showToast('Customer updated successfully', 'success');
      } else {
        await masterApi.createCustomer(form);
        showToast('Customer created successfully', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      fetchCustomers();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await masterApi.deleteCustomer(deletingId);
      showToast('Customer deleted', 'info');
      setDeletingId(null);
      fetchCustomers();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const resetForm = () => {
    setForm({
      customerName: '',
      company: '',
      country: 'United States',
      gst: '',
      email: '',
      phone: '',
      address: { street: '', city: '', state: '', country: 'United States', postalCode: '' },
      notifyParty: '',
      paymentTerms: 'LC at Sight',
      currency: 'USD',
    });
    setEditingId(null);
  };

  const openEditModal = (cust) => {
    setEditingId(cust._id);
    setForm({
      customerName: cust.customerName,
      company: cust.company,
      country: cust.country,
      gst: cust.gst || '',
      email: cust.email,
      phone: cust.phone,
      address: cust.address || { street: '', city: '', state: '', country: cust.country, postalCode: '' },
      notifyParty: cust.notifyParty || '',
      paymentTerms: cust.paymentTerms || 'LC at Sight',
      currency: cust.currency || 'USD',
    });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Customer Name', accessor: 'customerName', cell: (row) => <span className="font-bold text-slate-900">{row.customerName}</span> },
    { header: 'Company', accessor: 'company' },
    { header: 'Country', accessor: 'country' },
    { header: 'Email', accessor: 'email' },
    { header: 'Payment Terms', accessor: 'paymentTerms' },
    { header: 'Currency', accessor: 'currency' },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(row)} className="p-1 text-slate-500 hover:text-brand-600">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDeletingId(row._id)} className="p-1 text-slate-500 hover:text-rose-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <DataTable
        title="Customer Master Database"
        columns={columns}
        data={customers}
        total={total}
        page={page}
        onPageChange={setPage}
        onSearch={setSearch}
        loading={loading}
        exportFilename="customers_export"
        actions={
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        }
      />

      {/* Customer Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Customer' : 'Add New Customer'} maxWidth="max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value, address: { ...form.address, country: e.target.value } })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
              <select
                value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="LC at Sight">LC at Sight</option>
                <option value="100% Advance">100% Advance TT</option>
                <option value="30 Days Net">30 Days Net</option>
                <option value="DA 60 Days">DA 60 Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={form.address.street}
              onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={form.address.city}
                onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notify Party</label>
              <input
                type="text"
                value={form.notifyParty}
                onChange={(e) => setForm({ ...form, notifyParty: e.target.value })}
                placeholder="Logistics partner / Agent"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold">
              {editingId ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer record? It will be soft deleted."
      />
    </div>
  );
}
