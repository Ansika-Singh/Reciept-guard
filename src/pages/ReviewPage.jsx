import { useState, useMemo } from 'react';
import ReceiptPreview from '../components/ReceiptPreview.jsx';
import EditableField from '../components/EditableField.jsx';
import CategoryPicker from '../components/CategoryPicker.jsx';
import AlertCard from '../components/AlertCard.jsx';
import { saveReceipt, getReceipts } from '../lib/storage.js';
import { auditReceipt } from '../lib/intelligence.js';
import { formatINR } from '../lib/formatting.js';

/**
 * ReviewPage component
 * Shows receipt preview side-by-side with editable extracted fields.
 * Includes live pre-save AI-assisted audit checks and tax breakdown handling.
 */
export default function ReviewPage({ data, onSaved, onBack }) {
  // If no data provided, provide blank default
  const initial = data || {
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    total: 0,
    currency: 'INR',
    suggestedCategory: 'Food',
    tax: { total: 0, breakdown: [] },
    items: [],
  };

  const [merchant, setMerchant] = useState(initial.merchant || '');
  const [date, setDate] = useState(initial.date || new Date().toISOString().split('T')[0]);
  const [total, setTotal] = useState(initial.total !== undefined ? initial.total : 0);
  const [category, setCategory] = useState(initial.category || initial.suggestedCategory || 'Food');
  const [taxTotal, setTaxTotal] = useState(initial.tax?.total || 0);
  const [taxBreakdown, setTaxBreakdown] = useState(initial.tax?.breakdown || []);
  const [items, setItems] = useState(initial.items || []);
  const [isSaving, setIsSaving] = useState(false);

  // Candidate receipt object built from current form state
  const currentCandidate = useMemo(() => {
    return {
      id: initial.id || null,
      merchant,
      date,
      total: parseFloat(total) || 0,
      currency: 'INR',
      category,
      suggestedCategory: initial.suggestedCategory,
      tax: {
        total: parseFloat(taxTotal) || 0,
        breakdown: taxBreakdown,
      },
      items,
      thumbnail: initial.thumbnail,
      imageHash: initial.imageHash,
    };
  }, [initial, merchant, date, total, category, taxTotal, taxBreakdown, items]);

  // Live pre-save intelligence audit against all stored receipts
  const liveAlerts = useMemo(() => {
    const allExisting = getReceipts();
    return auditReceipt(currentCandidate, allExisting);
  }, [currentCandidate]);

  // Handle Tax Breakdown line edits
  const handleAddTaxLine = () => {
    setTaxBreakdown([...taxBreakdown, { label: 'GST 18%', amount: 0 }]);
  };

  const handleUpdateTaxLine = (index, field, val) => {
    const updated = [...taxBreakdown];
    updated[index] = {
      ...updated[index],
      [field]: field === 'amount' ? parseFloat(val) || 0 : val,
    };
    setTaxBreakdown(updated);

    // Auto-update tax total sum
    const newSum = updated.reduce((s, line) => s + (line.amount || 0), 0);
    setTaxTotal(newSum);
  };

  const handleRemoveTaxLine = (index) => {
    const updated = taxBreakdown.filter((_, i) => i !== index);
    setTaxBreakdown(updated);
    const newSum = updated.reduce((s, line) => s + (line.amount || 0), 0);
    setTaxTotal(newSum);
  };

  // Handle Item line edits
  const handleAddItemLine = () => {
    setItems([...items, { name: '', amount: 0 }]);
  };

  const handleUpdateItem = (index, field, val) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'amount' ? parseFloat(val) || 0 : val,
    };
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!merchant.trim()) {
      alert('Please specify a merchant name.');
      return;
    }

    setIsSaving(true);
    try {
      saveReceipt(currentCandidate);
      onSaved();
    } catch (err) {
      alert('Failed to save receipt: ' + err.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary transition-smooth cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to upload
        </button>

        <span className="text-xs text-muted">
          Review &amp; Audit Stage
        </span>
      </div>

      {/* Manual Fallback Banner if triggered */}
      {initial.sourceMode === 'manual_fallback' && (
        <div className="card p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Manual Entry Mode Active
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              {initial.fallbackReason || 'AI extraction was unavailable.'} You can review and enter your expense details manually below. Your receipt image snapshot and perceptual hash were preserved.
            </p>
          </div>
        </div>
      )}

      {/* Pre-save Live Audit Alerts Display */}
      {liveAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              AI-Assisted Pre-Save Audit ({liveAlerts.length} item{liveAlerts.length > 1 ? 's' : ''} flagged)
            </span>
            <span className="text-[11px] text-amber-800">Requires review before filing</span>
          </div>
          {liveAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} compact={false} />
          ))}
        </div>
      )}

      {/* Main Review Grid: Side-by-Side on Desktop */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Receipt Snapshot Preview */}
        <div className="lg:col-span-5 space-y-4">
          <ReceiptPreview
            src={initial.fullImage || initial.thumbnail}
            imageHash={initial.imageHash}
            dimensions={initial.dimensions}
          />

          <div className="card p-3 bg-gray-50 border border-gray-200 text-xs text-muted">
            <p className="font-semibold text-gray-700 mb-1">Audit Trail Information</p>
            <p>Verification engine runs checks on merchant similarity, exact amounts, temporal proximity, and visual hashes.</p>
          </div>
        </div>

        {/* Right Column: Editable Fields Form */}
        <div className="lg:col-span-7 card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Extracted Expense Fields</h3>
              <p className="text-xs text-muted">All fields are editable prior to final recording</p>
            </div>
            {initial.sourceMode === 'ai_extracted' && (
              <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-300">
                AI Extracted
              </span>
            )}
          </div>

          {/* Merchant & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditableField
              id="merchant"
              label="Merchant / Business"
              value={merchant}
              onChange={setMerchant}
              placeholder="e.g. Starbucks, Croma, Swiggy"
              required
            />

            <EditableField
              id="date"
              label="Transaction Date"
              type="date"
              value={date}
              onChange={setDate}
              required
            />
          </div>

          {/* Grand Total Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditableField
              id="total"
              label="Grand Total Paid"
              type="number"
              prefix="₹"
              step="0.01"
              value={total}
              onChange={setTotal}
              placeholder="0.00"
              helperText={`Formatted: ${formatINR(parseFloat(total) || 0)}`}
              required
            />

            <EditableField
              id="taxTotal"
              label="Total Tax Included"
              type="number"
              prefix="₹"
              step="0.01"
              value={taxTotal}
              onChange={setTaxTotal}
              placeholder="0.00"
              helperText="GST / CGST / SGST total"
            />
          </div>

          {/* Category Picker */}
          <CategoryPicker
            selected={category}
            suggested={initial.suggestedCategory}
            onChange={setCategory}
          />

          {/* Tax Breakdown Lines */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tax Breakdown (GST / CGST / SGST)
              </label>
              <button
                type="button"
                onClick={handleAddTaxLine}
                className="text-xs font-semibold text-primary hover:text-primary-mid transition-smooth cursor-pointer"
              >
                + Add Tax Line
              </button>
            </div>

            {taxBreakdown.length > 0 ? (
              <div className="space-y-2">
                {taxBreakdown.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. CGST 9%"
                      value={line.label || ''}
                      onChange={(e) => handleUpdateTaxLine(idx, 'label', e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-mid"
                    />
                    <div className="relative w-32">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-gray-400">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={line.amount ?? ''}
                        onChange={(e) => handleUpdateTaxLine(idx, 'amount', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white pl-6 pr-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-mid"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTaxLine(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-smooth cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">No tax breakdown rows extracted. Click "+ Add Tax Line" if required.</p>
            )}
          </div>

          {/* Itemized Lines */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Line Items
              </label>
              <button
                type="button"
                onClick={handleAddItemLine}
                className="text-xs font-semibold text-primary hover:text-primary-mid transition-smooth cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Item name / description"
                      value={item.name || ''}
                      onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-mid"
                    />
                    <div className="relative w-32">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-gray-400">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={item.amount ?? ''}
                        onChange={(e) => handleUpdateItem(idx, 'amount', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white pl-6 pr-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-mid"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-smooth cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">No individual items itemized.</p>
            )}
          </div>

          {/* Submission and Save Actions */}
          <div className="border-t border-border pt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-smooth cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-mid transition-smooth cursor-pointer flex items-center gap-2 shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {isSaving ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
