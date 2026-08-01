import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotationApi } from '../../api/quotationApi';
import { masterApi } from '../../api/masterApi';
import { useToast } from '../../context/ToastContext';
import SearchableSelect from '../../components/common/SearchableSelect';
import { Plus, Trash2, Save, FileText, ArrowLeft } from 'lucide-react';

export default function QuotationForm() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const generateQuoteNo = `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const [form, setForm] = useState({
    quotationNumber: generateQuoteNo,
    quotationDate: new Date().toISOString().split('T')[0],
    customer: '',
    customerName: '',
    currency: 'USD',
    exchangeRate: 83.5,
    items: [
      {
        product: '',
        productName: '',
        hsn: '',
        description: '',
        unit: 'KGS',
        weight: 1,
        packing: 'Carton Box',
        quantity: 1000,
        rate: 1.5,
        discount: 0,
        amount: 1500,
      },
    ],
    subTotal: 1500,
    discountTotal: 0,
    grandTotal: 1500,
    grandTotalINR: 125250,
    notes: 'Quotation valid for 15 days from date of issue.',
    termsAndConditions: '100% LC at Sight / Advance TT. FOB JNPT Port, India.',
  });

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes] = await Promise.all([masterApi.getCustomers({ limit: 100 }), masterApi.getProducts({ limit: 100 })]);
        if (cRes.success) setCustomers(cRes.data);
        if (pRes.success) setProducts(pRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleCustomerSelect = (custVal) => {
    setSelectedCustomerId(custVal);
    const found = customers.find((c) => c._id === custVal);
    if (found) {
      setForm((prev) => ({
        ...prev,
        customer: found._id,
        customerName: found.customerName,
        currency: found.currency || 'USD',
      }));
    }
  };

  const handleProductSelect = (idx, prodId) => {
    const p = products.find((prod) => prod._id === prodId);
    if (!p) return;

    const newItems = [...form.items];
    const qty = newItems[idx].quantity || 1;
    const rate = p.defaultRate || 1;
    const discount = newItems[idx].discount || 0;
    const amt = qty * rate * (1 - discount / 100);

    newItems[idx] = {
      ...newItems[idx],
      product: p._id,
      productName: p.productName,
      hsn: p.hsn,
      description: p.description || '',
      unit: p.unit || 'KGS',
      weight: p.weight || 1,
      packing: p.packing || 'Carton Box',
      rate: rate,
      amount: amt,
    };

    recalculateTotals(newItems, form.exchangeRate);
  };

  const handleItemChange = (idx, field, val) => {
    const newItems = [...form.items];
    newItems[idx][field] = val;

    const qty = parseFloat(newItems[idx].quantity) || 0;
    const rate = parseFloat(newItems[idx].rate) || 0;
    const discount = parseFloat(newItems[idx].discount) || 0;
    newItems[idx].amount = qty * rate * (1 - discount / 100);

    recalculateTotals(newItems, form.exchangeRate);
  };

  const recalculateTotals = (items, exRate) => {
    let sub = 0;
    items.forEach((i) => (sub += i.amount || 0));
    const grand = sub;
    const grandINR = grand * (exRate || 83.5);

    setForm((prev) => ({
      ...prev,
      items,
      subTotal: sub,
      grandTotal: grand,
      grandTotalINR: grandINR,
    }));
  };

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: '',
          productName: '',
          hsn: '',
          description: '',
          unit: 'KGS',
          weight: 1,
          packing: 'Carton Box',
          quantity: 100,
          rate: 1,
          discount: 0,
          amount: 100,
        },
      ],
    }));
  };

  const removeItemRow = (idx) => {
    if (form.items.length === 1) return;
    const newItems = form.items.filter((_, i) => i !== idx);
    recalculateTotals(newItems, form.exchangeRate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer) {
      showToast('Please select a customer', 'error');
      return;
    }

    try {
      const res = await quotationApi.createQuotation({ ...form, status: 'Pending' });
      if (res.success) {
        showToast('Quotation created and sent for approval!', 'success');
        navigate('/quotations');
      }
    } catch (err) {
      showToast(err.message || 'Quotation creation failed', 'error');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Create Export Quotation</h1>
            <p className="text-xs text-slate-500">Form auto-calculates totals in USD & INR</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quotation Number</label>
            <input
              type="text"
              required
              value={form.quotationNumber}
              onChange={(e) => setForm({ ...form, quotationNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
            />
          </div>
          <div>
            <SearchableSelect
              label="Select Customer"
              placeholder="Search Customer..."
              value={selectedCustomerId}
              onChange={handleCustomerSelect}
              options={customers.map((c) => ({ value: c._id, label: c.customerName, subLabel: c.company }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Exchange Rate (USD to INR)</label>
            <input
              type="number"
              step="0.1"
              value={form.exchangeRate}
              onChange={(e) => {
                const ex = parseFloat(e.target.value) || 83.5;
                setForm({ ...form, exchangeRate: ex });
                recalculateTotals(form.items, ex);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Line Items</h2>
            <button
              type="button"
              onClick={addItemRow}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item Line
            </button>
          </div>

          <div className="space-y-2">
            {form.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="col-span-4">
                  <SearchableSelect
                    placeholder="Select Product..."
                    value={item.product}
                    onChange={(val) => handleProductSelect(idx, val)}
                    options={products.map((p) => ({ value: p._id, label: p.productName, subLabel: `HSN: ${p.hsn}` }))}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                  />
                </div>
                <div className="col-span-3 text-right font-bold text-slate-900">
                  ${item.amount?.toFixed(2)}
                </div>
                <div className="col-span-1 text-right">
                  <button type="button" onClick={() => removeItemRow(idx)} className="p-1 text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-4 border-t border-slate-100 text-xs">
          <div className="w-64 space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Subtotal:</span>
              <span>${form.subTotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-slate-900 text-sm border-t border-slate-200 pt-2">
              <span>Grand Total (USD):</span>
              <span className="text-brand-600">${form.grandTotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-500 text-[11px]">
              <span>Grand Total (INR @ {form.exchangeRate}):</span>
              <span>₹{form.grandTotalINR?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/quotations')}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Submit Quotation</span>
          </button>
        </div>
      </form>
    </div>
  );
}
