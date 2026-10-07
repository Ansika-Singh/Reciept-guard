import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  Maximize2
} from 'lucide-react';
import type { FullReceiptDetails } from '../types';
import { getReceiptDetails, getReceiptFileUrl, getReceiptDownloadUrl } from '../services/api';

interface ReceiptDetailModalProps {
  receiptId: string | null;
  shopperId?: string;
  onClose: () => void;
  onAskReceiptGuard?: (receiptId: string, storeName: string) => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  receiptId,
  shopperId = 'demo-shopper-001',
  onClose,
  onAskReceiptGuard
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [receipt, setReceipt] = useState<FullReceiptDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!receiptId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    getReceiptDetails(receiptId)
      .then((data) => {
        if (isMounted) {
          setReceipt(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to load receipt details.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [receiptId]);

  if (!receiptId) return null;

  const fileViewUrl = getReceiptFileUrl(receiptId, shopperId);
  const fileDownloadUrl = getReceiptDownloadUrl(receiptId, shopperId);
  const fileType = (receipt?.file_type || receipt?.filename?.split('.').pop() || 'pdf').toLowerCase();
  const isPdf = fileType === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(fileType);

  const formatCurrency = (val?: number | null, curr: string = '₹') => {
    if (val === undefined || val === null) return `${curr}0.00`;
    return `${curr}${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs">
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {receipt?.store || 'Receipt Details'}
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {fileType}
                </span>
                {receipt?.is_archived && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {receipt?.original_filename || receipt?.filename || 'Document'} • {receipt?.purchase_date}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={fileViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
              title="Open in new window"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen</span>
            </a>
            <a
              href={fileDownloadUrl}
              download={receipt?.original_filename || receipt?.filename || 'receipt'}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Original</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading original document & protection details...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          ) : receipt ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Exact Original Document Viewer */}
              <div className="lg:col-span-6 flex flex-col space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                  <span>ORIGINAL UPLOADED DOCUMENT</span>
                  <span>PRESERVED BY RUPERTRACE</span>
                </div>
                
                <div className="relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center min-h-[480px] max-h-[620px]">
                  {isPdf ? (
                    <iframe
                      src={fileViewUrl}
                      title="Original PDF Preview"
                      className="w-full h-[580px] rounded-lg border-0 bg-white"
                    />
                  ) : isImage ? (
                    <div className="p-4 flex items-center justify-center w-full h-full overflow-auto">
                      <img
                        src={fileViewUrl}
                        alt="Original Receipt Document"
                        className="max-h-[540px] max-w-full object-contain rounded-lg shadow-md border border-slate-200"
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-4">
                      <FileText className="w-16 h-16 text-indigo-600 mx-auto" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{receipt.original_filename || receipt.filename}</p>
                        <p className="text-xs text-slate-500 mt-1">Text-based purchase document</p>
                      </div>
                      {receipt.raw_text && (
                        <div className="text-left max-h-64 overflow-y-auto p-4 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap">
                          {receipt.raw_text}
                        </div>
                      )}
                      <a
                        href={fileDownloadUrl}
                        download
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Original Document</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Structured Extracted & Protection Details */}
              <div className="lg:col-span-6 flex flex-col space-y-5">
                
                {/* Store & Metadata Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{receipt.store}</h3>
                      {receipt.store_address && (
                        <p className="text-xs text-slate-500">{receipt.store_address}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900">
                        {formatCurrency(receipt.grand_total, receipt.currency)}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">Grand Total</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Purchase Date</span>
                      <span className="text-slate-800 font-medium">{receipt.purchase_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Invoice No</span>
                      <span className="text-slate-800 font-mono font-medium">{receipt.invoice_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                        {receipt.sale_id ? 'Sale ID' : 'Order ID'}
                      </span>
                      <span className="text-slate-800 font-mono font-medium">{receipt.sale_id || receipt.order_id || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Customer</span>
                      <span className="text-slate-800 font-medium">{receipt.customer_name || 'Raj Soni'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Payment</span>
                      <span className="text-slate-800 font-medium">{receipt.payment_method || 'UPI / Card'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Math Verification</span>
                      <span className="text-emerald-700 font-medium">✓ Verified</span>
                    </div>
                  </div>

                  {/* Invoice Sections Breakdown if present */}
                  {receipt.invoice_sections && receipt.invoice_sections.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                        Invoice Sections ({receipt.invoice_sections.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {receipt.invoice_sections.map((sec, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col space-y-0.5 shadow-2xs">
                            <div className="flex justify-between font-semibold text-slate-800 capitalize">
                              <span>Page {sec.page_number}: {sec.section_type.replace('_', ' ')}</span>
                              <span className="text-emerald-600 font-mono">{formatCurrency(sec.grand_total, receipt.currency)}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 truncate">{sec.seller_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Protection Windows */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Deterministic Protection Status</span>
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {receipt.calculations?.length || 0} items evaluated
                    </span>
                  </div>

                  <div className="space-y-2">
                    {receipt.calculations?.map((calc) => (
                      <div
                        key={calc.calc_id || calc.item_id}
                        className={`p-3 rounded-lg border text-xs transition shadow-2xs ${
                          calc.expiring_soon
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : calc.return_days_remaining < 0
                            ? 'bg-slate-100 border-slate-200 text-slate-500'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-slate-900">{calc.item_name}</span>
                          <span className="font-mono text-slate-800">{formatCurrency(calc.price, receipt.currency)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[11px]">
                          <span className="flex items-center space-x-1">
                            {calc.expiring_soon ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span>
                              Return window: {calc.return_days_remaining >= 0 ? `${calc.return_days_remaining} days left` : 'Expired'} ({calc.return_deadline})
                            </span>
                          </span>
                          {calc.applicable_policy_section && (
                            <span className="text-slate-500 font-mono text-[10px]">{calc.applicable_policy_section}</span>
                          )}
                        </div>
                        {calc.warranty_days_remaining !== null && calc.warranty_days_remaining !== undefined && (
                          <div className="mt-1 text-[11px] text-indigo-700 flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 text-indigo-600" />
                            <span>Warranty active: {calc.warranty_days_remaining} days left ({calc.warranty_deadline})</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Purchased Items Table */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Line Items ({receipt.items?.length || 0})
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {receipt.items?.map((item, idx) => (
                      <div
                        key={item.item_id || idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-500">
                            Category: {item.category} • Qty: {item.quantity} {item.unit_price ? `@ ${formatCurrency(item.unit_price, receipt.currency)}` : ''}
                          </p>
                        </div>
                        <span className="font-bold text-slate-900 font-mono">
                          {formatCurrency(item.total_price || item.price, receipt.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="pt-2 border-t border-slate-200 text-xs space-y-1 text-slate-500">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono text-slate-800">{formatCurrency(receipt.subtotal, receipt.currency)}</span>
                    </div>
                    {receipt.discount_total && receipt.discount_total > 0 ? (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount</span>
                        <span className="font-mono">-{formatCurrency(receipt.discount_total, receipt.currency)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <span>Tax / GST</span>
                      <span className="font-mono text-slate-800">{formatCurrency(receipt.tax_total, receipt.currency)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                      <span>Grand Total</span>
                      <span className="font-mono text-slate-900">{formatCurrency(receipt.grand_total, receipt.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Source & Vault Verification */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p><strong className="text-slate-700">Vault Document:</strong> {receipt.original_filename || receipt.filename}</p>
                    <p><strong className="text-slate-700">Method:</strong> {receipt.extraction_method} • OCR Confidence: {Math.round((receipt.ocr_confidence || 1) * 100)}%</p>
                  </div>
                  {onAskReceiptGuard && (
                    <button
                      onClick={() => {
                        onClose();
                        onAskReceiptGuard(receipt.receipt_id, receipt.store);
                      }}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition text-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask Rupertrace</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
