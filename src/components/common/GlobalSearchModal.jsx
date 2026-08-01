import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../../api/dashboardApi';
import { Search, X, Users, Package, FileText, Ship, FileCheck, ArrowRight } from 'lucide-react';

export default function GlobalSearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchApi.search(query);
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, products, quotations, container #..."
            className="w-full py-4 text-sm font-medium text-slate-800 focus:outline-none placeholder:text-slate-400"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading && <p className="text-xs text-center text-slate-500 py-6">Searching enterprise database...</p>}

          {!loading && !results && query.length < 2 && (
            <p className="text-xs text-center text-slate-400 py-6">Type at least 2 characters to search...</p>
          )}

          {!loading && results && (
            <>
              {/* Customers */}
              {results.customers?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2 uppercase">
                    <Users className="w-3.5 h-3.5" /> Customers
                  </div>
                  <div className="space-y-1">
                    {results.customers.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => handleSelect(`/customers/${c._id}`)}
                        className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{c.customerName}</p>
                          <p className="text-slate-500">{c.company} • {c.country}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {results.products?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2 uppercase">
                    <Package className="w-3.5 h-3.5" /> Products
                  </div>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => handleSelect(`/products`)}
                        className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{p.productName}</p>
                          <p className="text-slate-500">HSN: {p.hsn} • ${p.defaultRate} / {p.unit}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipments */}
              {results.shipments?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2 uppercase">
                    <Ship className="w-3.5 h-3.5" /> Shipments & Invoices
                  </div>
                  <div className="space-y-1">
                    {results.shipments.map((s) => (
                      <div
                        key={s._id}
                        onClick={() => handleSelect(`/shipments/${s._id}`)}
                        className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">Invoice #{s.invoiceNumber}</p>
                          <p className="text-slate-500">Container: {s.shippingDetails?.containerNumber} • {s.customerDetails?.customerName}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
