import { useState, useMemo } from 'react';
import { formatINR, formatDate, CATEGORIES, CATEGORY_COLORS } from '../lib/formatting.js';

/**
 * TransactionTable component
 * Searchable, filterable list of receipts with category chips, alert badges, and thumbnail previews.
 */
export default function TransactionTable({
  receipts = [],
  alerts = [],
  onReviewReceipt,
  onDeleteReceipt,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Map receipt IDs to alert tags
  const receiptAlertMap = useMemo(() => {
    const map = {};
    for (const alert of alerts) {
      if (alert.targetReceiptId) {
        if (!map[alert.targetReceiptId]) map[alert.targetReceiptId] = [];
        map[alert.targetReceiptId].push(alert);
      }
      if (alert.relatedReceiptId) {
        if (!map[alert.relatedReceiptId]) map[alert.relatedReceiptId] = [];
        map[alert.relatedReceiptId].push(alert);
      }
    }
    return map;
  }, [alerts]);

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      // Category filter
      const category = r.category || r.suggestedCategory || 'Other';
      if (selectedCategory !== 'ALL' && category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const merchantMatch = (r.merchant || '').toLowerCase().includes(q);
        const categoryMatch = category.toLowerCase().includes(q);
        const dateMatch = (r.date || '').includes(q);
        const amountMatch = String(r.total || '').includes(q);
        const itemsMatch = (r.items || []).some((item) => (item.name || '').toLowerCase().includes(q));
        return merchantMatch || categoryMatch || dateMatch || amountMatch || itemsMatch;
      }

      return true;
    });
  }, [receipts, selectedCategory, searchQuery]);

  return (
    <div className="card overflow-hidden">
      {/* Search and Category Filters Header */}
      <div className="p-4 border-b border-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search merchant, category, date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs text-gray-900 transition-smooth placeholder:text-gray-400 focus:border-primary-mid focus:ring-2 focus:ring-primary-50 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`
              px-2.5 py-1 rounded-md text-xs font-medium transition-smooth cursor-pointer whitespace-nowrap
              ${selectedCategory === 'ALL'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            All ({receipts.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = receipts.filter((r) => (r.category || r.suggestedCategory) === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-2.5 py-1 rounded-md text-xs font-medium transition-smooth cursor-pointer whitespace-nowrap
                  ${selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-gray-50/75 text-muted font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Receipt</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Audit Status</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredReceipts.map((r) => {
              const category = r.category || r.suggestedCategory || 'Other';
              const catColors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
              const rAlerts = receiptAlertMap[r.id] || [];

              return (
                <tr key={r.id} className="hover:bg-gray-50/80 transition-smooth">
                  {/* Merchant & Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail or Icon */}
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {r.thumbnail ? (
                          <img
                            src={r.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                          </svg>
                        )}
                      </div>

                      <div>
                        <div className="font-semibold text-gray-900 leading-snug">
                          {r.merchant || 'Unknown Merchant'}
                        </div>
                        {r.items && r.items.length > 0 && (
                          <div className="text-[11px] text-muted truncate max-w-xs">
                            {r.items.map((i) => i.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                    {formatDate(r.date)}
                  </td>

                  {/* Category Chip */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className="badge text-[11px] font-semibold"
                      style={{
                        backgroundColor: catColors.bg,
                        color: catColors.text,
                      }}
                    >
                      {category}
                    </span>
                  </td>

                  {/* Audit Alert Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {rAlerts.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {rAlerts.map((alert, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300"
                            title={alert.reasons?.join('; ')}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {alert.type === 'duplicate'
                              ? 'potential duplicate'
                              : alert.type === 'unusual_expense'
                              ? 'unusual expense'
                              : 'requires review'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Clean
                      </span>
                    )}
                  </td>

                  {/* Total Amount */}
                  <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                    {formatINR(r.total)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {onReviewReceipt && (
                        <button
                          type="button"
                          onClick={() => onReviewReceipt(r)}
                          className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary-50 rounded transition-smooth cursor-pointer"
                          title="Review & edit receipt"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      )}

                      {onDeleteReceipt && (
                        <button
                          type="button"
                          onClick={() => onDeleteReceipt(r.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-smooth cursor-pointer"
                          title="Delete receipt"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredReceipts.length === 0 && (
        <div className="p-12 text-center text-muted">
          <p className="text-sm font-medium text-gray-600 mb-1">No receipts match your search</p>
          <p className="text-xs">Try clearing the search query or changing the category filter.</p>
        </div>
      )}
    </div>
  );
}
