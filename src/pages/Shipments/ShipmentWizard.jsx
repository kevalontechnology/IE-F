import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentApi } from '../../api/shipmentApi';
import { masterApi } from '../../api/masterApi';
import { genericMasterApi } from '../../api/genericMasterApi';
import { useToast } from '../../context/ToastContext';
import SearchableSelect from '../../components/common/SearchableSelect';
import PDFViewerModal from '../../components/pdf/PDFViewerModal';
import {
  Users,
  Package,
  Ship,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';

export default function ShipmentWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [company, setCompany] = useState(null);
  const [paymentTermsList, setPaymentTermsList] = useState([]);
  const [exportTermsList, setExportTermsList] = useState([]);
  const [containerQuantitiesList, setContainerQuantitiesList] = useState([]);
  const [portsList, setPortsList] = useState([]);
  const [shippingLinesList, setShippingLinesList] = useState([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const autoInvoiceNo = `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const autoContainerNo = `MSCU${Math.floor(100000 + Math.random() * 900000)}-4`;

  const [shipmentData, setShipmentData] = useState({
    invoiceNumber: autoInvoiceNo,
    invoiceDate: new Date().toISOString().split('T')[0],
    customer: '',
    customerDetails: {
      customerName: '',
      company: '',
      country: 'United States',
      gst: '',
      address: '',
      notifyParty: '',
      paymentTerms: 'LC at Sight',
      currency: 'USD',
    },
    items: [
      {
        product: '',
        productName: '',
        hsn: '',
        description: '',
        unit: 'KGS',
        quantity: 1000,
        rate: 1.5,
        discount: 0,
        amount: 1500,
        netWeight: 1000,
        grossWeight: 1050,
        packages: 40,
        packingType: '25 KG Bags',
      },
    ],
    shippingDetails: {
      containerNumber: autoContainerNo,
      containerSize: '1 x 20 FT',
      sealNumber: 'SEAL' + Math.floor(100000 + Math.random() * 900000),
      electronicSealNumber: '',
      totalPackages: 40,
      packageType: 'Carton Boxes',
      totalNetWeight: 1000,
      totalGrossWeight: 1050,
      vgmWeight: 3250, // Gross wt + 2200 Tare wt
      weighBridgeName: 'Certified Port Weighbridge',
      portOfLoading: 'JNPT (Nhava Sheva)',
      portOfDischarge: 'Port of Jebel Ali',
      shippingLine: 'Maersk Line',
      blNumber: 'MAEU' + Math.floor(10000000 + Math.random() * 90000000),
      vesselName: 'MAERSK ALABAMA V.2401',
      etd: '',
      eta: '',
      currency: 'USD',
      exchangeRate: 83.5,
      incoterms: 'FOB',
      lutNumber: 'AD270324000001X',
    },
    financials: {
      subTotal: 1500,
      discountTotal: 0,
      grandTotal: 1500,
      grandTotalINR: 125250,
    },
    status: 'Pending Logistics',
  });

  const [savedShipment, setSavedShipment] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [cRes, pRes, compRes, ptRes, etRes, cqRes, portRes, slRes] = await Promise.all([
          masterApi.getCustomers({ limit: 100 }),
          masterApi.getProducts({ limit: 100 }),
          masterApi.getCompany(),
          genericMasterApi.getAll('payment_terms', { status: 'Active' }),
          genericMasterApi.getAll('export_terms', { status: 'Active' }),
          genericMasterApi.getAll('container_quantities', { status: 'Active' }),
          masterApi.getPorts(),
          masterApi.getShippingLines(),
        ]);
        if (cRes.success) setCustomers(cRes.data);
        if (pRes.success) setProducts(pRes.data);
        if (compRes.success) setCompany(compRes.data);
        if (ptRes.success) setPaymentTermsList(ptRes.data);
        if (etRes.success) setExportTermsList(etRes.data);
        if (cqRes.success) setContainerQuantitiesList(cqRes.data);
        if (portRes.success) setPortsList(portRes.data);
        if (slRes.success) setShippingLinesList(slRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadMasters();
  }, []);

  // Step 1: Customer Selection Auto-Fill
  const handleCustomerSelect = (custVal) => {
    setSelectedCustomerId(custVal);
    const found = customers.find((c) => c._id === custVal);
    if (found) {
      setShipmentData((prev) => ({
        ...prev,
        customer: found._id,
        customerDetails: {
          customerName: found.customerName,
          company: found.company,
          country: found.country,
          gst: found.gst || '',
          address: `${found.address?.street}, ${found.address?.city}, ${found.address?.country}`,
          notifyParty: found.notifyParty || '',
          paymentTerms: found.paymentTerms || 'LC at Sight',
          currency: found.currency || 'USD',
        },
      }));
      showToast(`Auto-filled customer details for ${found.customerName}`, 'info');
    }
  };

  // Step 2: Products Auto-Fill & Calculation
  const handleProductSelect = (idx, prodId) => {
    const p = products.find((prod) => prod._id === prodId);
    if (!p) return;

    const newItems = [...shipmentData.items];
    const qty = newItems[idx].quantity || 1;
    const rate = p.defaultRate || 1;
    const discount = newItems[idx].discount || 0;
    const amt = qty * rate * (1 - discount / 100);

    const netWt = (p.weight || 1) * qty;
    const grossWt = (p.grossWeight || 1.05) * qty;
    const pkgs = Math.ceil(qty / 25);

    newItems[idx] = {
      ...newItems[idx],
      product: p._id,
      productName: p.productName,
      hsn: p.hsn,
      description: p.description || '',
      unit: p.unit || 'KGS',
      rate: rate,
      amount: amt,
      netWeight: netWt,
      grossWeight: grossWt,
      packages: pkgs,
    };

    recalculateShipmentTotals(newItems, shipmentData.shippingDetails.exchangeRate);
  };

  const handleItemChange = (idx, field, val) => {
    const newItems = [...shipmentData.items];
    newItems[idx][field] = val;

    const qty = parseFloat(newItems[idx].quantity) || 0;
    const rate = parseFloat(newItems[idx].rate) || 0;
    const discount = parseFloat(newItems[idx].discount) || 0;
    newItems[idx].amount = qty * rate * (1 - discount / 100);

    recalculateShipmentTotals(newItems, shipmentData.shippingDetails.exchangeRate);
  };

  const recalculateShipmentTotals = (items, exRate) => {
    let sub = 0;
    let totalNet = 0;
    let totalGross = 0;
    let totalPkgs = 0;

    items.forEach((i) => {
      sub += i.amount || 0;
      totalNet += i.netWeight || 0;
      totalGross += i.grossWeight || 0;
      totalPkgs += i.packages || 0;
    });

    const grand = sub;
    const grandINR = grand * (exRate || 83.5);
    const vgm = totalGross + 2200; // Container Tare Weight

    setShipmentData((prev) => ({
      ...prev,
      items,
      shippingDetails: {
        ...prev.shippingDetails,
        totalNetWeight: totalNet,
        totalGrossWeight: totalGross,
        totalPackages: totalPkgs,
        vgmWeight: vgm,
      },
      financials: {
        subTotal: sub,
        discountTotal: 0,
        grandTotal: grand,
        grandTotalINR: grandINR,
      },
    }));
  };

  const addItemRow = () => {
    setShipmentData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: '',
          productName: '',
          hsn: '',
          description: '',
          unit: 'KGS',
          quantity: 100,
          rate: 1,
          discount: 0,
          amount: 100,
          netWeight: 100,
          grossWeight: 105,
          packages: 4,
          packingType: 'Bags',
        },
      ],
    }));
  };

  const removeItemRow = (idx) => {
    if (shipmentData.items.length === 1) return;
    const newItems = shipmentData.items.filter((_, i) => i !== idx);
    recalculateShipmentTotals(newItems, shipmentData.shippingDetails.exchangeRate);
  };

  // Submit Final Single Entry Shipment
  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const res = await shipmentApi.createShipment(shipmentData);
      if (res.success) {
        showToast('Single Entry Shipment Created Successfully!', 'success');
        setSavedShipment(res.data);
        setShowPDFModal(true);
      }
    } catch (err) {
      showToast(err.message || 'Shipment creation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const wizardSteps = [
    { number: 1, title: 'Customer Info', icon: Users },
    { number: 2, title: 'Products & Weight', icon: Package },
    { number: 3, title: 'Shipping & Logistics', icon: Ship },
    { number: 4, title: 'Review & Generate PDFs', icon: FileCheck },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Wizard Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h1 className="text-lg font-bold text-slate-900">Multi-Step Shipment Wizard</h1>
        <p className="text-xs text-slate-500">Single Data Entry: Fill once to automatically generate 5 Export PDF Documents</p>

        {/* Steps Progress Indicator */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {wizardSteps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <div
                key={step.number}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold transition ${
                  isCurrent
                    ? 'bg-brand-50 border-brand-500 text-brand-700'
                    : isCompleted
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isCurrent
                      ? 'bg-brand-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: CUSTOMER SELECTION */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Step 1: Select Customer & Destination</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <SearchableSelect
                label="Customer Master"
                placeholder="Search & Select Customer..."
                value={selectedCustomerId}
                onChange={handleCustomerSelect}
                options={customers.map((c) => ({ value: c._id, label: c.customerName, subLabel: `${c.company} (${c.country})` }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                readOnly
                value={shipmentData.customerDetails.company}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Country</label>
              <input
                type="text"
                value={shipmentData.customerDetails.country}
                onChange={(e) =>
                  setShipmentData({
                    ...shipmentData,
                    customerDetails: { ...shipmentData.customerDetails, country: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <SearchableSelect
                label="Payment Terms"
                placeholder="Select Payment Term..."
                value={shipmentData.customerDetails.paymentTerms}
                onChange={(val) =>
                  setShipmentData({
                    ...shipmentData,
                    customerDetails: { ...shipmentData.customerDetails, paymentTerms: val },
                  })
                }
                options={paymentTermsList.map((pt) => ({ value: pt.name, label: pt.name, subLabel: pt.description }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Export Currency</label>
              <input
                type="text"
                value={shipmentData.customerDetails.currency}
                onChange={(e) =>
                  setShipmentData({
                    ...shipmentData,
                    customerDetails: { ...shipmentData.customerDetails, currency: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-brand-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Buyer Address</label>
            <textarea
              rows={2}
              value={shipmentData.customerDetails.address}
              onChange={(e) =>
                setShipmentData({
                  ...shipmentData,
                  customerDetails: { ...shipmentData.customerDetails, address: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                if (!shipmentData.customer) {
                  showToast('Please select a customer first.', 'error');
                  return;
                }
                setCurrentStep(2);
              }}
              className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-md transition"
            >
              <span>Next: Products & Weight</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PRODUCTS & WEIGHT */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">Step 2: Add Line Items & Weight Breakdown</h2>
            <button
              type="button"
              onClick={addItemRow}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product Row
            </button>
          </div>

          <div className="space-y-3">
            {shipmentData.items.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <SearchableSelect
                      label="Select Product"
                      placeholder="Search Product..."
                      value={item.product}
                      onChange={(val) => handleProductSelect(idx, val)}
                      options={products.map((p) => ({ value: p._id, label: p.productName, subLabel: `HSN: ${p.hsn}` }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qty</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Line Amount</label>
                    <p className="font-bold text-slate-900 pt-1">${item.amount?.toFixed(2)}</p>
                  </div>
                  <div className="col-span-1 text-right pt-4">
                    <button type="button" onClick={() => removeItemRow(idx)} className="p-1 text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-medium">Net Wt: </span>
                    <input
                      type="number"
                      value={item.netWeight}
                      onChange={(e) => handleItemChange(idx, 'netWeight', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-0.5 border rounded bg-white font-semibold"
                    /> KGS
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Gross Wt: </span>
                    <input
                      type="number"
                      value={item.grossWeight}
                      onChange={(e) => handleItemChange(idx, 'grossWeight', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-0.5 border rounded bg-white font-semibold"
                    /> KGS
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Packages: </span>
                    <input
                      type="number"
                      value={item.packages}
                      onChange={(e) => handleItemChange(idx, 'packages', parseInt(e.target.value) || 1)}
                      className="w-20 px-2 py-0.5 border rounded bg-white font-semibold"
                    /> Boxes
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-md transition"
            >
              <span>Next: Shipping & Logistics</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SHIPPING & LOGISTICS DETAILS */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Step 3: Container & Logistics Details</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Number</label>
              <input
                type="text"
                required
                value={shipmentData.invoiceNumber}
                onChange={(e) => setShipmentData({ ...shipmentData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Container Number</label>
              <input
                type="text"
                required
                value={shipmentData.shippingDetails.containerNumber}
                onChange={(e) =>
                  setShipmentData({
                    ...shipmentData,
                    shippingDetails: { ...shipmentData.shippingDetails, containerNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Seal Number</label>
              <input
                type="text"
                required
                value={shipmentData.shippingDetails.sealNumber}
                onChange={(e) =>
                  setShipmentData({
                    ...shipmentData,
                    shippingDetails: { ...shipmentData.shippingDetails, sealNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Electronic Seal Number (E-Seal)</label>
              <input
                type="text"
                required
                placeholder="e.g. ESEAL98765432"
                value={shipmentData.shippingDetails.electronicSealNumber || ''}
                onChange={(e) =>
                  setShipmentData({
                    ...shipmentData,
                    shippingDetails: { ...shipmentData.shippingDetails, electronicSealNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-brand-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <SearchableSelect
                label="Port of Loading"
                placeholder="Select Loading Port..."
                value={shipmentData.shippingDetails.portOfLoading}
                onChange={(val) =>
                  setShipmentData({
                    ...shipmentData,
                    shippingDetails: { ...shipmentData.shippingDetails, portOfLoading: val },
                  })
                }
                options={portsList.map((p) => ({ value: p.portName, label: p.portName, subLabel: `${p.portCode} (${p.type})` }))}
              />
            </div>
            <div>
              <SearchableSelect
                label="Port of Discharge"
                placeholder="Select Discharge Port..."
                value={shipmentData.shippingDetails.portOfDischarge}
                onChange={(val) =>
                  setShipmentData({
                    ...shipmentData,
                    shippingDetails: { ...shipmentData.shippingDetails, portOfDischarge: val },
                  })
                }
                options={portsList.map((p) => ({ value: p.portName, label: p.portName, subLabel: `${p.portCode} (${p.type})` }))}
              />
            </div>
            <div>
              <SearchableSelect
                label="Shipping Line"
                placeholder="Select Shipping Line..."
                value={shipmentData.shippingDetails.shippingLine}
                onChange={(val) =>
                  setShipmentData({
                    ...shipmentData,
                    shippingDetails: { ...shipmentData.shippingDetails, shippingLine: val },
                  })
                }
                options={shippingLinesList.map((sl) => ({ value: sl.name, label: sl.name, subLabel: sl.code }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Cargo Net Weight</label>
              <p className="font-bold text-slate-900 text-sm">{shipmentData.shippingDetails.totalNetWeight} KGS</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Cargo Gross Weight</label>
              <p className="font-bold text-slate-900 text-sm">{shipmentData.shippingDetails.totalGrossWeight} KGS</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-700 mb-1">Calculated Solas VGM Weight</label>
              <p className="font-extrabold text-brand-600 text-sm">{shipmentData.shippingDetails.vgmWeight} KGS</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-md transition"
            >
              <span>Next: Review & Generate PDFs</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & GENERATE PDFS */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Step 4: Review Shipment & Auto-Generate Documents</h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 uppercase">Customer Summary</h3>
              <p><span className="text-slate-500">Consignee:</span> {shipmentData.customerDetails.customerName} ({shipmentData.customerDetails.company})</p>
              <p><span className="text-slate-500">Country:</span> {shipmentData.customerDetails.country}</p>
              <p><span className="text-slate-500">Payment Terms:</span> {shipmentData.customerDetails.paymentTerms}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 uppercase">Shipping Summary</h3>
              <p><span className="text-slate-500">Invoice #:</span> {shipmentData.invoiceNumber}</p>
              <p><span className="text-slate-500">Container #:</span> {shipmentData.shippingDetails.containerNumber}</p>
              <p><span className="text-slate-500">Solas VGM Weight:</span> {shipmentData.shippingDetails.vgmWeight} KGS</p>
            </div>
          </div>

          <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl text-xs text-brand-900 space-y-1">
            <h4 className="font-bold text-brand-700">Documents Auto-Generated from Single Data Entry:</h4>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Commercial Invoice (USD Foreign Currency)</li>
              <li>Packing List (Itemized Package & Weight Breakdown)</li>
              <li>INR Invoice (Domestic Customs GST INR Calculation)</li>
              <li>Annexure (Rule 96A CGST LUT Declaration)</li>
              <li>VGM Certificate (Solas Verified Gross Mass)</li>
            </ul>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <FileCheck className="w-4 h-4" />
              <span>{loading ? 'Creating Shipment...' : 'Save Shipment & Generate Export PDFs'}</span>
            </button>
          </div>
        </div>
      )}

      {/* PDF Viewer Popup after successful submission */}
      {savedShipment && (
        <PDFViewerModal
          isOpen={showPDFModal}
          onClose={() => {
            setShowPDFModal(false);
            navigate('/shipments');
          }}
          shipment={savedShipment}
          company={company}
        />
      )}
    </div>
  );
}
