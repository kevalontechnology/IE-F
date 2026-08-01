import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import { documentApi } from '../../api/documentApi';
import { useToast } from '../../context/ToastContext';

export default function PDFViewerModal({ isOpen, onClose, shipment, company }) {
  const [activeTab, setActiveTab] = useState('Commercial Invoice');
  const [generating, setGenerating] = useState(false);
  const { showToast } = useToast();

  if (!shipment) return null;

  const comp = company || {
    companyName: 'GLOBAL EXPORT CORPORATION PVT LTD',
    gst: '27AAAAA0000A1Z5',
    iec: '1234567890',
    lut: 'AD270324000001X',
    address: { street: '101 Export House, Business Hub', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
    phone: '+91 22 9876 5432',
    email: 'export@globalcorp.com',
    bankDetails: { bankName: 'HDFC Bank Ltd', accountNo: '50200012345678', ifscCode: 'HDFC0000123', swiftCode: 'HDFCINBBXXX' },
  };

  const docTypes = ['Commercial Invoice', 'Packing List', 'INR Invoice', 'Annexure', 'VGM'];

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateServerPDF = async () => {
    setGenerating(true);
    try {
      const res = await documentApi.generateDocument({ shipmentId: shipment._id, docType: activeTab });
      if (res.success) {
        showToast(`${activeTab} (v${res.data.version}) generated and archived on server!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'PDF generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Document Center - Invoice #${shipment.invoiceNumber}`} maxWidth="max-w-4xl">
      {/* Document Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        {docTypes.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleGenerateServerPDF}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition border border-indigo-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{generating ? 'Archiving...' : 'Save & Archive PDF'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Document</span>
          </button>
        </div>
      </div>

      {/* Printable Document Box */}
      <div id="printable-document" className="bg-white border border-slate-300 p-8 rounded-xl shadow-xs text-slate-800 text-xs leading-relaxed">
        {/* Header Block */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-4 mb-4">
          <div>
            <h1 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">{comp.companyName}</h1>
            <p className="text-slate-600">{comp.address?.street}, {comp.address?.city}, {comp.address?.state} - {comp.address?.pincode}</p>
            <p className="text-slate-500 font-medium">IEC: {comp.iec} | GSTIN: {comp.gst} | LUT: {comp.lut}</p>
            <p className="text-slate-500">Email: {comp.email} | Phone: {comp.phone}</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold rounded text-xs tracking-wider uppercase mb-2">
              {activeTab}
            </span>
            <p className="font-semibold text-slate-700">Invoice No: <span className="text-slate-900">{shipment.invoiceNumber}</span></p>
            <p className="text-slate-500">Date: {new Date(shipment.invoiceDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Logistics & Parties Grid */}
        <div className="grid grid-cols-2 gap-4 border border-slate-200 p-3 rounded-lg bg-slate-50/50 mb-6 text-[11px]">
          <div>
            <p className="font-bold text-slate-900 uppercase text-[10px] text-slate-400">Exporter / Consignor</p>
            <p className="font-semibold">{comp.companyName}</p>
            <p>{comp.address?.street}, {comp.address?.city}</p>
            <div className="mt-2">
              <p className="font-bold text-slate-900 uppercase text-[10px] text-slate-400">Buyer / Consignee</p>
              <p className="font-semibold">{shipment.customerDetails?.customerName} ({shipment.customerDetails?.company})</p>
              <p>{shipment.customerDetails?.address}</p>
              <p>Country: {shipment.customerDetails?.country}</p>
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-900 uppercase text-[10px] text-slate-400">Shipment Details</p>
            <p><span className="font-medium text-slate-500">Container No:</span> {shipment.shippingDetails?.containerNumber}</p>
            <p><span className="font-medium text-slate-500">Seal No:</span> {shipment.shippingDetails?.sealNumber}</p>
            <p><span className="font-medium text-slate-500">Port of Loading:</span> {shipment.shippingDetails?.portOfLoading}</p>
            <p><span className="font-medium text-slate-500">Port of Discharge:</span> {shipment.shippingDetails?.portOfDischarge}</p>
            <p><span className="font-medium text-slate-500">Shipping Line:</span> {shipment.shippingDetails?.shippingLine}</p>
            <p><span className="font-medium text-slate-500">Incoterms:</span> {shipment.shippingDetails?.incoterms}</p>
          </div>
        </div>

        {/* Table Content depending on Document Type */}
        {(activeTab === 'Commercial Invoice' || activeTab === 'INR Invoice') && (
          <table className="w-full text-left border-collapse border border-slate-200 mb-6 text-[11px]">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-200">
                <th className="p-2 border-r border-slate-200 w-8">#</th>
                <th className="p-2 border-r border-slate-200">Description of Goods</th>
                <th className="p-2 border-r border-slate-200">HSN</th>
                <th className="p-2 border-r border-slate-200 text-right">Qty</th>
                <th className="p-2 border-r border-slate-200 text-right">Rate ({shipment.shippingDetails?.currency})</th>
                <th className="p-2 text-right">Total ({activeTab === 'INR Invoice' ? 'INR' : shipment.shippingDetails?.currency})</th>
              </tr>
            </thead>
            <tbody>
              {shipment.items?.map((item, idx) => {
                const rate = activeTab === 'INR Invoice' ? (item.rate * shipment.shippingDetails?.exchangeRate) : item.rate;
                const amt = activeTab === 'INR Invoice' ? (item.amount * shipment.shippingDetails?.exchangeRate) : item.amount;
                return (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="p-2 border-r border-slate-200">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-200 font-semibold">{item.productName}</td>
                    <td className="p-2 border-r border-slate-200">{item.hsn}</td>
                    <td className="p-2 border-r border-slate-200 text-right">{item.quantity} {item.unit}</td>
                    <td className="p-2 border-r border-slate-200 text-right">{rate.toFixed(2)}</td>
                    <td className="p-2 text-right font-semibold">{amt.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'Packing List' && (
          <table className="w-full text-left border-collapse border border-slate-200 mb-6 text-[11px]">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-200">
                <th className="p-2 border-r border-slate-200 w-8">#</th>
                <th className="p-2 border-r border-slate-200">Item Description</th>
                <th className="p-2 border-r border-slate-200">HSN</th>
                <th className="p-2 border-r border-slate-200 text-right">Packages</th>
                <th className="p-2 border-r border-slate-200 text-right">Net Wt (Kgs)</th>
                <th className="p-2 text-right">Gross Wt (Kgs)</th>
              </tr>
            </thead>
            <tbody>
              {shipment.items?.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="p-2 border-r border-slate-200">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-200 font-semibold">{item.productName}</td>
                  <td className="p-2 border-r border-slate-200">{item.hsn}</td>
                  <td className="p-2 border-r border-slate-200 text-right">{item.packages || 1} Box</td>
                  <td className="p-2 border-r border-slate-200 text-right">{item.netWeight}</td>
                  <td className="p-2 text-right font-semibold">{item.grossWeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'VGM' && (
          <div className="border border-slate-200 p-4 rounded-lg bg-slate-50/60 mb-6">
            <h4 className="font-bold text-slate-800 uppercase mb-2">SOLAS Verified Gross Mass (VGM) Certificate</h4>
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <p><span className="font-semibold">Container Number:</span> {shipment.shippingDetails?.containerNumber}</p>
              <p><span className="font-semibold">Container Size:</span> {shipment.shippingDetails?.containerSize}</p>
              <p><span className="font-semibold">Seal Number:</span> {shipment.shippingDetails?.sealNumber}</p>
              <p><span className="font-semibold">Weighbridge Name:</span> {shipment.shippingDetails?.weighBridgeName || 'Certified Weighbridge'}</p>
              <p><span className="font-semibold">Total Cargo Net Weight:</span> {shipment.shippingDetails?.totalNetWeight} KGS</p>
              <p><span className="font-semibold font-bold text-brand-700">VERIFIED GROSS MASS (VGM):</span> <span className="font-bold text-brand-700">{shipment.shippingDetails?.vgmWeight} KGS</span></p>
            </div>
          </div>
        )}

        {activeTab === 'Annexure' && (
          <div className="border border-slate-200 p-4 rounded-lg bg-slate-50/60 mb-6 text-[11px] space-y-2">
            <h4 className="font-bold text-slate-800 uppercase">Export Declaration Under LUT Scheme</h4>
            <p>
              We hereby declare that goods specified in Invoice No. <strong>{shipment.invoiceNumber}</strong> dated{' '}
              <strong>{new Date(shipment.invoiceDate).toLocaleDateString()}</strong> are being exported under Letter of Undertaking (LUT No: <strong>{comp.lut}</strong>) without payment of IGST under Rule 96A of CGST Rules, 2017.
            </p>
          </div>
        )}

        {/* Footer Signature */}
        <div className="flex justify-between items-end mt-12 pt-6 border-t border-slate-200">
          <div>
            <p className="text-[10px] text-slate-400">Declaration: All particulars declared above are true and correct.</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">For {comp.companyName}</p>
            <div className="h-12"></div>
            <p className="font-semibold text-slate-700 border-t border-slate-300 pt-1">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
