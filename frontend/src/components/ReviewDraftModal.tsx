import React, { useState } from 'react';
import type { ReceiptDraft, ReceiptDraftItem, CalculationResult } from '../types';
import { updateReceiptDraft, confirmReceiptDraft, API_ORIGIN } from '../services/api';
import {
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  RefreshCw,
  Lock,
  X,
  Building,
  DollarSign,
  ShieldCheck,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

interface ReviewDraftModalProps {
  draft: ReceiptDraft;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: (receiptId: string) => void;
}

export const ReviewDraftModal: React.FC<ReviewDraftModalProps> = ({
  draft,
  isOpen,
  onClose,
  onConfirmed
}) => {
  if (!isOpen) return null;

  // Local editable draft state
  const [store, setStore] = useState(draft.store || '');
  const [storeAddress, setStoreAddress] = useState(draft.store_address || '');
  const [orderId, setOrderId] = useState(draft.order_id || '');
  const [saleId, setSaleId] = useState(draft.sale_id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(draft.invoice_number || '');
  const [purchaseDate, setPurchaseDate] = useState(draft.purchase_date || '2026-09-20');
  const [purchaseTime, setPurchaseTime] = useState(draft.purchase_time || '');
  const [customerName, setCustomerName] = useState(draft.customer_name || '');
  const [paymentMethod, setPaymentMethod] = useState(draft.payment_method || 'Credit Card');
  const [currency, setCurrency] = useState(draft.currency || '₹');

  const [items, setItems] = useState<ReceiptDraftItem[]>(draft.items || []);
  const [subtotal, setSubtotal] = useState<number | ''>(draft.subtotal ?? 0);
  const [discountTotal, setDiscountTotal] = useState<number | ''>(draft.discount_total ?? 0);
  const [taxTotal, setTaxTotal] = useState<number | ''>(draft.tax_total ?? 0);
  const [shippingCharges, setShippingCharges] = useState<number | ''>(draft.shipping_charges ?? 0);
  const [grandTotal, setGrandTotal] = useState<number | ''>(draft.grand_total ?? 0);

  const [activePreviewTab, setActivePreviewTab] = useState<'document' | 'raw_text'>('document');
  const [validationStatus, setValidationStatus] = useState(draft.validation_status || 'Verified Math');
  const [validationWarnings, setValidationWarnings] = useState<string[]>(
    draft.extraction_details?.validation_warnings || []
  );
  const [previewCalculations, setPreviewCalculations] = useState<CalculationResult[]>(
    draft.preview_calculations || []
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Auto-calculate subtotal and grand total when items change
  const handleItemChange = (index: number, field: keyof ReceiptDraftItem, value: any) => {
    setHasChanges(true);
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      const q = Number(updated[index].quantity) || 1;
      const u = Number(updated[index].unit_price) || 0;
      const tot = Math.round(q * u * 100) / 100;
      updated[index].total_price = tot;
      updated[index].price = tot;
    }

    setItems(updated);

    // Update subtotal
    const newSubtotal = updated.reduce((sum, it) => sum + (Number(it.total_price) || 0), 0);
    setSubtotal(Math.round(newSubtotal * 100) / 100);

    const disc = Number(discountTotal) || 0;
    const tax = Number(taxTotal) || 0;
    const ship = Number(shippingCharges) || 0;
    const newGrandTotal = Math.round((newSubtotal - disc + tax + ship) * 100) / 100;
    setGrandTotal(newGrandTotal);
  };

  const handleAddItem = () => {
    setHasChanges(true);
    const newItem: ReceiptDraftItem = {
      draft_item_id: `item-${Date.now()}`,
      draft_id: draft.draft_id,
      name: 'New Purchased Item',
      category: 'General',
      quantity: 1,
      unit_price: 1000,
      price: 1000,
      total_price: 1000,
      serial_number: null,
      warranty_days_if_explicit: null
    };
    const updated = [...items, newItem];
    setItems(updated);

    const newSubtotal = updated.reduce((sum, it) => sum + (Number(it.total_price) || 0), 0);
    setSubtotal(newSubtotal);
    const disc = Number(discountTotal) || 0;
    const tax = Number(taxTotal) || 0;
    const ship = Number(shippingCharges) || 0;
    setGrandTotal(newSubtotal - disc + tax + ship);
  };

  const handleRemoveItem = (index: number) => {
    setHasChanges(true);
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);

    const newSubtotal = updated.reduce((sum, it) => sum + (Number(it.total_price) || 0), 0);
    setSubtotal(newSubtotal);
    const disc = Number(discountTotal) || 0;
    const tax = Number(taxTotal) || 0;
    const ship = Number(shippingCharges) || 0;
    setGrandTotal(newSubtotal - disc + tax + ship);
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const payload = {
        store,
        store_address: storeAddress || null,
        invoice_number: invoiceNumber || null,
        order_id: orderId || null,
        sale_id: saleId || null,
        purchase_date: purchaseDate,
        purchase_time: purchaseTime || null,
        customer_name: customerName || null,
        payment_method: paymentMethod || null,
        currency,
        subtotal: subtotal === '' ? null : Number(subtotal),
        discount_total: discountTotal === '' ? null : Number(discountTotal),
        tax_total: taxTotal === '' ? null : Number(taxTotal),
        shipping_charges: shippingCharges === '' ? null : Number(shippingCharges),
        grand_total: grandTotal === '' ? null : Number(grandTotal),
        items: items.map((it) => ({
          name: it.name,
          category: it.category,
          quantity: Number(it.quantity) || 1,
          unit_price: it.unit_price ? Number(it.unit_price) : null,
          discount: it.discount ? Number(it.discount) : null,
          tax: it.tax ? Number(it.tax) : null,
          price: Number(it.total_price) || Number(it.price) || 0,
          total_price: Number(it.total_price) || Number(it.price) || 0,
          serial_number: it.serial_number || null,
          warranty_days_if_explicit: it.warranty_days_if_explicit ? Number(it.warranty_days_if_explicit) : null
        }))
      };

      const res = await updateReceiptDraft(draft.draft_id, payload);
      setValidationStatus(res.validation_status);
      setValidationWarnings(res.validation_warnings || []);
      setPreviewCalculations(res.preview_calculations || []);
      setHasChanges(false);
    } catch (e) {
      console.error('Recalculation error:', e);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleConfirmAndSave = async () => {
    setIsSaving(true);
    try {
      // First save latest edits
      const payload = {
        store,
        store_address: storeAddress || null,
        invoice_number: invoiceNumber || null,
        order_id: orderId || null,
        sale_id: saleId || null,
        purchase_date: purchaseDate,
        purchase_time: purchaseTime || null,
        customer_name: customerName || null,
        payment_method: paymentMethod || null,
        currency,
        subtotal: subtotal === '' ? null : Number(subtotal),
        discount_total: discountTotal === '' ? null : Number(discountTotal),
        tax_total: taxTotal === '' ? null : Number(taxTotal),
        shipping_charges: shippingCharges === '' ? null : Number(shippingCharges),
        grand_total: grandTotal === '' ? null : Number(grandTotal),
        items: items.map((it) => ({
          name: it.name,
          category: it.category,
          quantity: Number(it.quantity) || 1,
          unit_price: it.unit_price ? Number(it.unit_price) : null,
          discount: it.discount ? Number(it.discount) : null,
          tax: it.tax ? Number(it.tax) : null,
          price: Number(it.total_price) || Number(it.price) || 0,
          total_price: Number(it.total_price) || Number(it.price) || 0,
          serial_number: it.serial_number || null,
          warranty_days_if_explicit: it.warranty_days_if_explicit ? Number(it.warranty_days_if_explicit) : null
        }))
      };

      await updateReceiptDraft(draft.draft_id, payload);
      const confirmRes = await confirmReceiptDraft(draft.draft_id);
      onConfirmed(confirmRes.receipt_id);
    } catch (e) {
      console.error('Confirmation error:', e);
      setIsSaving(false);
    }
  };

  const isMathValid = validationStatus === 'Verified Math' || validationWarnings.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200/90 w-full max-w-7xl max-h-[92vh] rounded-3xl shadow-2xl shadow-slate-300/50 flex flex-col overflow-hidden text-slate-900 my-auto">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-white/95 backdrop-blur flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Review & Verify Extracted Receipt</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700">
                  Temporary Draft
                </span>
                {hasChanges && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 animate-pulse">
                    Unsaved Edits
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Inspect extracted fields against your uploaded document. Correct any imperfections before activating protection.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center space-x-1.5 cursor-pointer"
              title="Recalculate validation & preview deadlines"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{isRecalculating ? 'Recalculating...' : 'Validate & Preview'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (TWO COLUMNS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* LEFT SIDE: DOCUMENT PREVIEW & OCR EVIDENCE (5 Cols) */}
          <div className="lg:col-span-5 p-5 flex flex-col space-y-4 bg-slate-50/50 overflow-y-auto">
            
            {/* Tab Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  onClick={() => setActivePreviewTab('document')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activePreviewTab === 'document'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Document Viewer
                </button>
                <button
                  onClick={() => setActivePreviewTab('raw_text')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activePreviewTab === 'raw_text'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Raw OCR Text
                </button>
              </div>

              {draft.filename && (
                <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                  {draft.filename}
                </span>
              )}
            </div>

            {/* Document Viewer Frame */}
            <div className="flex-1 min-h-[380px] max-h-[480px] rounded-2xl bg-white border border-slate-200 overflow-hidden relative flex flex-col shadow-xs">
              {activePreviewTab === 'document' ? (
                draft.preview_url ? (
                  draft.file_type === 'pdf' ? (
                    <iframe
                      src={`${API_ORIGIN}${draft.preview_url}`}
                      className="w-full h-full border-0 rounded-2xl bg-slate-50"
                      title="Uploaded Document Preview"
                    />
                  ) : (
                    <div className="w-full h-full p-4 flex items-center justify-center bg-slate-100/50 overflow-auto">
                      <img
                        src={`${API_ORIGIN}${draft.preview_url}`}
                        alt="Uploaded Receipt"
                        className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                      />
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
                    <FileText className="w-10 h-10 text-slate-400" />
                    <p className="text-xs">No direct document stream available.</p>
                  </div>
                )
              ) : (
                <div className="p-4 overflow-y-auto font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap selection:bg-indigo-100 selection:text-indigo-900 bg-white">
                  {draft.raw_text || 'No raw text extracted.'}
                </div>
              )}
            </div>

            {/* Extraction Confidence & Engine Metadata */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Extraction Engine:</span>
                <span className="font-semibold text-indigo-600 uppercase tracking-wide">
                  {draft.extraction_method === 'native_pdf' ? '⚡ PyMuPDF Native Text' : '🔍 RapidOCR Vision Engine'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Confidence Score:</span>
                <span className="font-bold text-emerald-600">
                  {Math.round(draft.ocr_confidence * 100)}% ({draft.extraction_details?.confidence_level || 'High'})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Status:</span>
                <span className={`font-semibold ${isMathValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {validationStatus}
                </span>
              </div>
            </div>

            {/* Preview Calculated Return Windows */}
            {previewCalculations.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Preview Return & Warranty Windows</span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                  {previewCalculations.map((pc, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-white border border-indigo-100/80 text-[11px] flex items-center justify-between shadow-2xs">
                      <span className="font-medium text-slate-800 truncate max-w-[150px]">{pc.item_name}</span>
                      <div className="text-right">
                        <span className="text-indigo-700 font-bold">Return: {pc.return_deadline}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5">({pc.return_days_remaining}d left)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Invoice Sections (For multi-page / multi-section invoices like Kreo) */}
            {draft.invoice_sections && draft.invoice_sections.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Detected Invoice Sections ({draft.invoice_sections.length})</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Independent Totals</span>
                </div>
                <div className="space-y-1.5">
                  {draft.invoice_sections.map((sec, sIdx) => (
                    <div key={sIdx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex flex-col space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-900 capitalize">
                          Page {sec.page_number}: {sec.section_type.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-emerald-700 font-bold">
                          {currency}{sec.grand_total?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Inv: {sec.invoice_number || 'N/A'}</span>
                        <span className="truncate max-w-[170px]">{sec.seller_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: EDITABLE STRUCTURED FORM (7 Cols) */}
          <div className="lg:col-span-7 p-6 flex flex-col space-y-6 overflow-y-auto">
            
            {/* Store & Header Details Card */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>Store & Header Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Store / Merchant Name *</label>
                  <input
                    type="text"
                    value={store}
                    onChange={(e) => {
                      setStore(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. DemoMart, Zara, Apple Store"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Invoice / Receipt #</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => {
                      setInvoiceNumber(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. INV-1024"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Order ID</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => {
                      setOrderId(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. 405-0187084-9011564"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Sale ID</label>
                  <input
                    type="text"
                    value={saleId}
                    onChange={(e) => {
                      setSaleId(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                    placeholder="e.g. SALE-2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Purchase Date (YYYY-MM-DD) *</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => {
                      setPurchaseDate(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Store Address</label>
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => {
                      setStoreAddress(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 42 Retail Blvd, Silicon Hub"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Purchase Time</label>
                  <input
                    type="text"
                    value={purchaseTime}
                    onChange={(e) => {
                      setPurchaseTime(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 14:35:00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="₹">₹ (INR)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Alex Mercer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Credit Card, UPI, Cash"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  <span>Purchased Line Items ({items.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={it.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                        placeholder="Item Description (e.g. Winter Jacket)"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2 text-xs">
                      <div className="col-span-4">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Category</label>
                        <select
                          value={it.category}
                          onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Clothing">Clothing</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Personal Care">Personal Care</option>
                          <option value="Home & Furniture">Home & Furniture</option>
                          <option value="General">General</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 text-center"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Unit Price ({currency})</label>
                        <input
                          type="number"
                          step="0.01"
                          value={it.unit_price ?? ''}
                          onChange={(e) => handleItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 text-right"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Total ({currency})</label>
                        <input
                          type="number"
                          step="0.01"
                          value={it.total_price ?? it.price}
                          onChange={(e) => handleItemChange(idx, 'total_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-indigo-500 text-right"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span>Financial Totals & Breakdown</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Subtotal ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={subtotal}
                    onChange={(e) => {
                      setSubtotal(e.target.value === '' ? '' : parseFloat(e.target.value));
                      setHasChanges(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-semibold text-right focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Tax / GST ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxTotal}
                    onChange={(e) => {
                      setTaxTotal(e.target.value === '' ? '' : parseFloat(e.target.value));
                      setHasChanges(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-right focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Discount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountTotal}
                    onChange={(e) => {
                      setDiscountTotal(e.target.value === '' ? '' : parseFloat(e.target.value));
                      setHasChanges(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-right focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Shipping ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={shippingCharges}
                    onChange={(e) => {
                      setShippingCharges(e.target.value === '' ? '' : parseFloat(e.target.value));
                      setHasChanges(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-right focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Grand Total ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={grandTotal}
                    onChange={(e) => {
                      setGrandTotal(e.target.value === '' ? '' : parseFloat(e.target.value));
                      setHasChanges(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border-2 border-indigo-500 text-indigo-700 font-bold text-right focus:outline-none"
                  />
                </div>
              </div>

              {/* Validation Warning Alert */}
              {validationWarnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Arithmetic Verification Notice:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-700 pl-1">
                    {validationWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* MODAL FOOTER ACTION BAR */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="text-xs text-slate-500">
            Clicking <span className="text-slate-800 font-semibold">"Confirm & Save"</span> will permanently commit this receipt, trigger policy calculations, and index into your secure vault.
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>{isRecalculating ? 'Re-extracting...' : 'Re-extract'}</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAndSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition transform hover:-translate-y-0.5 flex items-center space-x-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Confirm & Save'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
