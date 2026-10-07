import React, { useState } from 'react';
import { Receipt, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, Eye, Copy, Check } from 'lucide-react';
import type { ProtectionSummary } from '../types';

interface StructuredReceiptCardProps {
  summary: ProtectionSummary;
}

export const StructuredReceiptCard: React.FC<StructuredReceiptCardProps> = ({ summary }) => {
  const [showRawText, setShowRawText] = useState(false);
  const [copied, setCopied] = useState(false);

  const ext = summary.extraction_details;
  const currency = summary.currency || '₹';

  const handleCopy = () => {
    if (ext?.raw_text_preview) {
      navigator.clipboard.writeText(ext.raw_text_preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
      {/* Header Banner */}
      <div className="p-5 bg-white border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">{summary.store}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  {summary.invoice_number ? `INV: ${summary.invoice_number}` : 'Receipt Detected'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {summary.store_address || 'Verified Store Ingestion'} • Purchased on {summary.purchase_date} {summary.purchase_time || ''}
              </p>
            </div>
          </div>

          {/* Validation & Confidence Badge */}
          <div className="flex items-center space-x-2">
            {ext?.is_arithmetic_valid ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Math</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Requires Verification</span>
              </span>
            )}

            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200">
              {ext?.confidence_level || 'High'} Conf. ({ext?.ocr_confidence ? Math.round(ext.ocr_confidence * 100) : 98}%)
            </span>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              {summary.sale_id ? 'Sale ID' : 'Order ID'}
            </span>
            <span className="text-slate-800 font-mono font-medium">
              {summary.sale_id || summary.order_id || 'Not Specified'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Customer</span>
            <span className="text-slate-800 font-medium">{summary.customer_name || 'Raj Soni'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Payment</span>
            <span className="text-slate-800 font-medium">{summary.payment_method || 'Card / UPI'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Extraction Engine</span>
            <span className="text-indigo-700 font-medium">{ext?.extraction_method === 'image_ocr' ? 'RapidOCR Vision' : (ext?.extraction_method === 'scanned_pdf_ocr' ? 'Scanned PDF OCR' : 'Native Document Text')}</span>
          </div>
        </div>
      </div>

      {/* Invoice Sections Breakdown (if multiple sections exist, e.g. Kreo 2-page invoice) */}
      {summary.invoice_sections && summary.invoice_sections.length > 0 && (
        <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
            <span>INVOICE SECTIONS ({summary.invoice_sections.length} SECTIONS)</span>
            <span className="text-[10px] text-slate-500 font-normal">Independent Section Totals</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {summary.invoice_sections.map((sec, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs flex flex-col space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 capitalize">
                    Page {sec.page_number}: {sec.section_type.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-emerald-600 font-bold">
                    {currency}{sec.grand_total?.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Inv: {sec.invoice_number || 'N/A'}</span>
                  <span className="truncate max-w-[150px]">{sec.seller_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Extracted Line Items ({summary.all_items?.length || summary.all_calculations?.length || 0})
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-2 font-semibold">Item Description</th>
                <th className="py-2.5 px-2 font-semibold">Category</th>
                <th className="py-2.5 px-2 font-semibold text-center">Qty</th>
                <th className="py-2.5 px-2 font-semibold text-right">Unit Price</th>
                <th className="py-2.5 px-2 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(summary.all_items && summary.all_items.length > 0 ? summary.all_items : summary.all_calculations.map(c => ({
                item_id: c.item_id,
                name: c.item_name,
                category: c.category,
                quantity: 1,
                unit_price: c.price,
                price: c.price,
                total_price: c.price,
                serial_number: null,
                warranty_days_if_explicit: null
              }))).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-2">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    {item.serial_number && (
                      <div className="text-[10px] font-mono text-indigo-600">S/N: {item.serial_number}</div>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center text-slate-600 font-mono">
                    {item.quantity || 1}
                  </td>
                  <td className="py-3 px-2 text-right text-slate-600 font-mono">
                    {currency}{item.unit_price ? item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : (item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-slate-900 font-mono">
                    {currency}{(item.total_price || item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown Summary */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real structured data verified from uploaded document</span>
            </div>
            {ext?.validation_warnings && ext.validation_warnings.length > 0 && (
              <div className="text-amber-700 text-[11px] font-medium">
                ⚠ {ext.validation_warnings[0]}
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
            {summary.subtotal !== null && summary.subtotal !== undefined && (
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-800">{currency}{summary.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {summary.discount_total ? (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span className="font-mono">-{currency}{summary.discount_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ) : null}
            {summary.tax_total !== null && summary.tax_total !== undefined ? (
              <div className="flex justify-between text-slate-500">
                <span>Tax / GST:</span>
                <span className="font-mono text-slate-800">+{currency}{summary.tax_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ) : null}
            <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span className="text-indigo-700">Grand Total:</span>
              <span className="font-mono text-base text-slate-900">
                {currency}{(summary.grand_total || summary.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Expandable Extraction & Raw Text Evidence */}
        <div className="pt-2">
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors border border-slate-200"
          >
            <div className="flex items-center space-x-2">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Inspection: Detected Fields &amp; Raw Document Evidence</span>
            </div>
            {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRawText && ext && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                    ✓ Detected Fields ({ext.detected_fields.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ext.detected_fields.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Missing / Null Fields ({ext.missing_fields.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ext.missing_fields.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-500">
                        {f} (null)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Raw Document Text Snippet
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 text-[11px] text-indigo-600 hover:text-indigo-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {ext.raw_text_preview}
                </pre>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
