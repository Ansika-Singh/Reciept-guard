import { CATEGORIES, CATEGORY_COLORS } from '../lib/formatting.js';

/**
 * CategoryPicker component
 * Displays all 7 categories as selectable chips, highlighting the AI suggested one.
 */
export default function CategoryPicker({ selected, suggested, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Expense Category
        </label>
        {suggested && (
          <span className="text-xs font-medium text-primary bg-primary-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            AI suggested: {suggested}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat;
          const isSuggested = suggested === cat;
          const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth flex items-center gap-1.5 cursor-pointer
                ${isSelected
                  ? 'ring-2 ring-primary ring-offset-1 shadow-sm'
                  : 'hover:opacity-85 opacity-70'
                }
              `}
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
              }}
              aria-pressed={isSelected}
            >
              <span>{cat}</span>
              {isSuggested && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary" title="AI Suggestion" />
              )}
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
