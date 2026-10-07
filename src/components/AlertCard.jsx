/**
 * AlertCard component
 * Displays AI-assisted review alerts with plain-language deterministic reasons.
 *
 * Strict wording rules applied:
 * "potential duplicate", "unusual expense", "requires review", "AI-assisted detection", "match strength: strong / moderate"
 */

export default function AlertCard({
  alert,
  onDismiss,
  onReview,
  onDeleteDuplicate,
  compact = false,
}) {
  if (!alert) return null;

  const isDuplicate = alert.type === 'duplicate';
  const isUnusual = alert.type === 'unusual_expense';
  const isRepeat = alert.type === 'repeated_purchase';
  const isSpike = alert.type === 'spending_spike';

  // Badge styling based on alert type & strength
  const getBadgeStyle = () => {
    if (alert.rawStrength === 'strong') {
      return 'bg-amber-100 text-amber-900 border border-amber-300';
    }
    return 'bg-amber-50 text-amber-800 border border-amber-200';
  };

  return (
    <div className="card p-4 border border-alert-amber-border bg-alert-amber-bg/60 rounded-xl transition-smooth">
      {/* Alert Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-start gap-2.5">
          {/* Icon */}
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
            {isDuplicate ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            ) : isUnusual ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : isRepeat ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-gray-900 leading-snug">
                {alert.title}
              </h4>
              {alert.strength && (
                <span className={`badge text-[11px] font-semibold uppercase tracking-wider ${getBadgeStyle()}`}>
                  {alert.strength}
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-0.5">
              AI-assisted detection &middot; requires review
            </p>
          </div>
        </div>
      </div>

      {/* Deterministic Explanations List */}
      {alert.reasons && alert.reasons.length > 0 && (
        <div className="my-3 pl-2 sm:pl-10">
          <ul className="space-y-1 text-xs text-gray-800 list-disc list-outside ml-4">
            {alert.reasons.map((reason, idx) => (
              <li key={idx} className="leading-relaxed">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/70 pl-0 sm:pl-10">
          {onDismiss && (
            <button
              type="button"
              onClick={() => onDismiss(alert.id)}
              className="px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 text-xs font-semibold rounded-lg transition-smooth cursor-pointer flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Looks fine
            </button>
          )}

          {onReview && alert.targetReceiptId && (
            <button
              type="button"
              onClick={() => onReview(alert.targetReceiptId)}
              className="px-3 py-1.5 bg-primary text-white hover:bg-primary-mid text-xs font-semibold rounded-lg transition-smooth cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Review
            </button>
          )}

          {isDuplicate && onDeleteDuplicate && (
            <button
              type="button"
              onClick={() => onDeleteDuplicate(alert.targetReceiptId || alert.relatedReceiptId)}
              className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 text-xs font-semibold rounded-lg transition-smooth cursor-pointer flex items-center gap-1.5 shadow-sm ml-auto"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete duplicate
            </button>
          )}
        </div>
      )}
    </div>
  );
}
