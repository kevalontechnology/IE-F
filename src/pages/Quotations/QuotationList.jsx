import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { quotationApi } from '../../api/quotationApi';
import { masterApi } from '../../api/masterApi';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { Plus, ArrowRightLeft, CheckCircle, XCircle } from 'lucide-react';

export default function QuotationList() {
  const [quotations, setQuotations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Convert to Shipment state
  const [convertQuote, setConvertQuote] = useState(null);
  const [convertForm, setConvertForm] = useState({
    invoiceNumber: '',
    shippingDetails: {
      containerNumber: '',
      sealNumber: 'SEAL' + Math.floor(100000 + Math.random() * 900000),
      totalPackages: 100,
      totalNetWeight: 1000,
      totalGrossWeight: 1050,
      vgmWeight: 1050,
      portOfLoading: 'JNPT (Nhava Sheva)',
      portOfDischarge: 'Port of Jebel Ali',
      shippingLine: 'Maersk Line',
    },
  });

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await quotationApi.getQuotations({ page, limit: 10, search });
      if (res.success) {
        setQuotations(res.data);
        setTotal(res.meta?.total || res.data.length);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch quotations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [page, search]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await quotationApi.updateStatus(id, { status: newStatus });
      if (res.success) {
        showToast(`Quotation status updated to ${newStatus}`, 'success');
        fetchQuotations();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const openConvertModal = (quote) => {
    setConvertQuote(quote);
    const generatedInv = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedContainer = `TGHU${Math.floor(100000 + Math.random() * 900000)}-7`;

    // Sum line items net wt & gross wt
    let totalNet = 0;
    let totalGross = 0;
    let totalPkgs = 0;

    quote.items?.forEach((item) => {
      totalNet += (item.weight || 1) * item.quantity;
      totalGross += (item.weight || 1.05) * item.quantity;
      totalPkgs += item.packages || Math.ceil(item.quantity / 25);
    });

    setConvertForm({
      invoiceNumber: generatedInv,
      shippingDetails: {
        containerNumber: generatedContainer,
        sealNumber: 'SEAL' + Math.floor(100000 + Math.random() * 900000),
        totalPackages: totalPkgs || 100,
        totalNetWeight: totalNet || 1000,
        totalGrossWeight: totalGross || 1050,
        vgmWeight: (totalGross || 1050) + 2200, // + Container Tare Weight
        portOfLoading: 'JNPT (Nhava Sheva)',
        portOfDischarge: quote.customer?.country ? `Port of ${quote.customer.country}` : 'Port of Discharge',
        shippingLine: 'Maersk Line',
        incoterms: 'FOB',
        currency: quote.currency || 'USD',
        exchangeRate: quote.exchangeRate || 83.5,
      },
    });
  };

  const handleConvertToShipment = async (e) => {
    e.preventDefault();
    if (!convertQuote) return;

    try {
      const shipmentPayload = {
        invoiceNumber: convertForm.invoiceNumber,
        invoiceDate: new Date(),
        quotation: convertQuote._id,
        customer: convertQuote.customer._id || convertQuote.customer,
        customerDetails: {
          customerName: convertQuote.customerName,
          company: convertQuote.customer?.company || convertQuote.customerName,
          country: convertQuote.customer?.country || 'USA',
          address: convertQuote.customer?.address?.street || 'Export Destination',
          paymentTerms: convertQuote.customer?.paymentTerms || 'LC at Sight',
          currency: convertQuote.currency,
        },
        items: convertQuote.items.map((i) => ({
          product: i.product,
          productName: i.productName,
          hsn: i.hsn,
          unit: i.unit,
          quantity: i.quantity,
          rate: i.rate,
          discount: i.discount || 0,
          amount: i.amount,
          netWeight: (i.weight || 1) * i.quantity,
          grossWeight: (i.weight || 1.05) * i.quantity,
          packages: Math.ceil(i.quantity / 25),
        })),
        shippingDetails: convertForm.shippingDetails,
        financials: {
          subTotal: convertQuote.subTotal,
          discountTotal: convertQuote.discountTotal,
          grandTotal: convertQuote.grandTotal,
          grandTotalINR: convertQuote.grandTotalINR,
        },
        status: 'Pending Logistics',
      };

      const res = await quotationApi.convertToShipment(convertQuote._id, shipmentPayload);
      if (res.success) {
        showToast('Quotation successfully converted to Shipment Invoice!', 'success');
        setConvertQuote(null);
        navigate(`/shipments/${res.data._id}`);
      }
    } catch (err) {
      showToast(err.message || 'Conversion failed', 'error');
    }
  };

  const columns = [
    { header: 'Quotation #', accessor: 'quotationNumber', cell: (row) => <span className="font-bold text-slate-900">{row.quotationNumber}</span> },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Sales Rep', accessor: 'createdBy', cell: (row) => <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">{row.createdBy?.fullName || 'Sales User'}</span> },
    { header: 'Date', accessor: 'createdAt', cell: (row) => new Date(row.createdAt).toLocaleDateString() },
    { header: 'Total (USD)', accessor: 'grandTotal', cell: (row) => <span className="font-semibold text-brand-700">${row.grandTotal?.toFixed(2)}</span> },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Approved' && (
            <button
              onClick={() => openConvertModal(row)}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Convert to Shipment</span>
            </button>
          )}

          {row.status === 'Pending' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleStatusUpdate(row._id, 'Approved')}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                title="Approve Quotation"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStatusUpdate(row._id, 'Rejected')}
                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                title="Reject Quotation"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <DataTable
        title="Export Quotations Engine"
        columns={columns}
        data={quotations}
        total={total}
        page={page}
        onPageChange={setPage}
        onSearch={setSearch}
        loading={loading}
        exportFilename="quotations_export"
        actions={
          <Link
            to="/quotations/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quotation</span>
          </Link>
        }
      />

      {/* Convert Quotation to Shipment Modal */}
      <Modal isOpen={Boolean(convertQuote)} onClose={() => setConvertQuote(null)} title={`Convert Quote #${convertQuote?.quotationNumber} to Shipment`} maxWidth="max-w-xl">
        <form onSubmit={handleConvertToShipment} className="space-y-4">
          <p className="text-xs text-slate-500">
            Single Data Entry: Customer & items are automatically copied. Enter shipping details to create official export shipment:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Number</label>
              <input
                type="text"
                required
                value={convertForm.invoiceNumber}
                onChange={(e) => setConvertForm({ ...convertForm, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Container Number</label>
              <input
                type="text"
                required
                value={convertForm.shippingDetails.containerNumber}
                onChange={(e) =>
                  setConvertForm({
                    ...convertForm,
                    shippingDetails: { ...convertForm.shippingDetails, containerNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Seal Number</label>
              <input
                type="text"
                required
                value={convertForm.shippingDetails.sealNumber}
                onChange={(e) =>
                  setConvertForm({
                    ...convertForm,
                    shippingDetails: { ...convertForm.shippingDetails, sealNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shipping Line</label>
              <input
                type="text"
                required
                value={convertForm.shippingDetails.shippingLine}
                onChange={(e) =>
                  setConvertForm({
                    ...convertForm,
                    shippingDetails: { ...convertForm.shippingDetails, shippingLine: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Port of Loading</label>
              <input
                type="text"
                required
                value={convertForm.shippingDetails.portOfLoading}
                onChange={(e) =>
                  setConvertForm({
                    ...convertForm,
                    shippingDetails: { ...convertForm.shippingDetails, portOfLoading: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Port of Discharge</label>
              <input
                type="text"
                required
                value={convertForm.shippingDetails.portOfDischarge}
                onChange={(e) =>
                  setConvertForm({
                    ...convertForm,
                    shippingDetails: { ...convertForm.shippingDetails, portOfDischarge: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setConvertQuote(null)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md transition"
            >
              Generate Shipment Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
