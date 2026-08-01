import React, { useState, useEffect } from 'react';
import { masterApi } from '../../api/masterApi';
import { genericMasterApi } from '../../api/genericMasterApi';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SearchableSelect from '../../components/common/SearchableSelect';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function ProductMaster() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    productName: '',
    hsn: '10063020',
    category: 'Agro Commodities',
    description: '',
    unit: 'KGS',
    weight: 1.0,
    grossWeight: 1.02,
    packing: 'Carton Box',
    defaultRate: 1.5,
    currency: 'USD',
  });

  const { showToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [pRes, catRes, hsnRes] = await Promise.all([
        masterApi.getProducts({ page, limit: 10, search }),
        genericMasterApi.getAll('product_categories', { status: 'Active' }),
        genericMasterApi.getAll('hsn_codes', { status: 'Active' }),
      ]);
      if (pRes.success) {
        setProducts(pRes.data);
        setTotal(pRes.meta?.total || pRes.data.length);
      }
      if (catRes.success) setCategories(catRes.data);
      if (hsnRes.success) setHsnCodes(hsnRes.data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await masterApi.updateProduct(editingId, form);
        showToast('Product updated successfully', 'success');
      } else {
        await masterApi.createProduct(form);
        showToast('Product created successfully', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await masterApi.deleteProduct(deletingId);
      showToast('Product deleted', 'info');
      setDeletingId(null);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const resetForm = () => {
    setForm({
      productName: '',
      hsn: '',
      category: 'Agro Commodities',
      description: '',
      unit: 'KGS',
      weight: 1.0,
      grossWeight: 1.02,
      packing: 'Carton Box',
      defaultRate: 1.5,
      currency: 'USD',
    });
    setEditingId(null);
  };

  const openEditModal = (p) => {
    setEditingId(p._id);
    setForm({
      productName: p.productName,
      hsn: p.hsn,
      category: p.category || 'Agro Commodities',
      description: p.description || '',
      unit: p.unit || 'KGS',
      weight: p.weight || 1.0,
      grossWeight: p.grossWeight || 1.02,
      packing: p.packing || 'Carton Box',
      defaultRate: p.defaultRate || 0,
      currency: p.currency || 'USD',
    });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Product Name', accessor: 'productName', cell: (row) => <span className="font-bold text-slate-900">{row.productName}</span> },
    { header: 'HSN Code', accessor: 'hsn', cell: (row) => <span className="font-mono text-slate-700">{row.hsn}</span> },
    { header: 'Category', accessor: 'category' },
    { header: 'Unit', accessor: 'unit' },
    { header: 'Packing', accessor: 'packing' },
    { header: 'Default Rate', accessor: 'defaultRate', cell: (row) => <span className="font-semibold text-brand-700">${row.defaultRate}</span> },
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
        title="Product Master Catalog"
        columns={columns}
        data={products}
        total={total}
        page={page}
        onPageChange={setPage}
        onSearch={setSearch}
        loading={loading}
        exportFilename="products_catalog_export"
        actions={
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        }
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Product' : 'Add New Product'} maxWidth="max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">HSN Code</label>
              <input
                type="text"
                required
                value={form.hsn}
                onChange={(e) => setForm({ ...form, hsn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="KGS">KGS</option>
                <option value="MTS">MTS</option>
                <option value="PCS">PCS</option>
                <option value="BOXES">BOXES</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Rate ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.defaultRate}
                onChange={(e) => setForm({ ...form, defaultRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Packing Type</label>
              <input
                type="text"
                value={form.packing}
                onChange={(e) => setForm({ ...form, packing: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Net Weight per unit (Kgs)</label>
              <input
                type="number"
                step="0.01"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gross Weight per unit (Kgs)</label>
              <input
                type="number"
                step="0.01"
                value={form.grossWeight}
                onChange={(e) => setForm({ ...form, grossWeight: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
            />
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
              {editingId ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? It will be soft deleted."
      />
    </div>
  );
}
