/**
 * Currency formatting for Indian Rupee (₹).
 * Used throughout the app for consistent display.
 */
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

/**
 * Format a number as INR currency string.
 * @param {number} amount
 * @returns {string} e.g. "₹1,234.56"
 */
export function formatINR(amount) {
  if (amount == null || isNaN(amount)) return '₹0.00';
  return inrFormatter.format(amount);
}

/**
 * Format a date string to a readable format.
 * @param {string} dateStr - ISO date string
 * @returns {string} e.g. "06 Oct 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a date string to a relative time description.
 * @param {string} dateStr - ISO date string
 * @returns {string} e.g. "2 days ago"
 */
export function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return formatDate(dateStr);
}

/**
 * List of expense categories.
 */
export const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Electronics',
  'Bills',
  'Supplies',
  'Other',
];

/**
 * Category color map for chips and charts.
 */
export const CATEGORY_COLORS = {
  Food: { bg: '#FEF3C7', text: '#92400E', chart: '#F59E0B' },
  Travel: { bg: '#DBEAFE', text: '#1E40AF', chart: '#3B82F6' },
  Shopping: { bg: '#F3E8FF', text: '#6B21A8', chart: '#8B5CF6' },
  Electronics: { bg: '#E0E7FF', text: '#3730A3', chart: '#6366F1' },
  Bills: { bg: '#FEE2E2', text: '#991B1B', chart: '#EF4444' },
  Supplies: { bg: '#D1FAE5', text: '#065F46', chart: '#10B981' },
  Other: { bg: '#F3F4F6', text: '#374151', chart: '#6B7280' },
};
