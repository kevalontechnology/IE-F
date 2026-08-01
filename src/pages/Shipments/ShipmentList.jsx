import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shipmentApi } from '../../api/shipmentApi';
import { masterApi } from '../../api/masterApi';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PDFViewerModal from '../../components/pdf/PDFViewerModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Plus, FileCheck, Trash2, Eye } from 'lucide-react';

export default function ShipmentList() {
  const [shipments, setShipments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [company, setCompany] = useState(null);

  const { showToast } = useToast();

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        shipmentApi.getShipments({ page, limit: 10, search }),
        masterApi.getCompany(),
      ]);

      if (sRes.success) {
        setShipments(sRes.data);
        setTotal(sRes.meta?.total || sRes.data.length);
      }
      if (cRes.success) setCompany(cRes.data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch shipments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [page, search]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await shipmentApi.deleteShipment(deletingId);
      showToast('Shipment record soft deleted', 'info');
      setDeletingId(null);
      fetchShipments();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const columns = [
    { header: 'Invoice #', accessor: 'invoiceNumber', cell: (row) => <span className="font-bold text-slate-900">{row.invoiceNumber}</span> },
    { header: 'Customer', accessor: 'customerDetails', cell: (row) => row.customerDetails?.customerName },
    { header: 'Container #', accessor: 'containerNumber', cell: (row) => <span className="font-mono font-semibold text-slate-700">{row.shippingDetails?.containerNumber}</span> },
    { header: 'Port of Loading', accessor: 'portOfLoading', cell: (row) => row.shippingDetails?.portOfLoading },
    { header: 'Port of Discharge', accessor: 'portOfDischarge', cell: (row) => row.shippingDetails?.portOfDischarge },
    { header: 'Grand Total (USD)', accessor: 'grandTotal', cell: (row) => <span className="font-semibold text-emerald-700">${row.financials?.grandTotal?.toFixed(2)}</span> },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Export PDFs',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedShipment(row)}
            className="flex items-center gap-1 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Generate PDFs</span>
          </button>
          <button onClick={() => setDeletingId(row._id)} className="p-1 text-slate-400 hover:text-rose-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <DataTable
        title="Export Shipment & Containers Engine"
        columns={columns}
        data={shipments}
        total={total}
        page={page}
        onPageChange={setPage}
        onSearch={setSearch}
        loading={loading}
        exportFilename="shipments_export"
        actions={
          <Link
            to="/shipments/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Multi-Step Shipment</span>
          </Link>
        }
      />

      {/* PDF Document Viewer Modal */}
      {selectedShipment && (
        <PDFViewerModal
          isOpen={Boolean(selectedShipment)}
          onClose={() => setSelectedShipment(null)}
          shipment={selectedShipment}
          company={company}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Shipment Record"
        message="Are you sure you want to delete this shipment? It will be soft deleted."
      />
    </div>
  );
}
