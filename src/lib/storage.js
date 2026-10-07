/**
 * LocalStorage wrapper for ReceiptGuard AI
 * Stores receipts, thumbnails, and dismissed alert records with safety and error handling.
 */

const STORAGE_KEYS = {
  RECEIPTS: 'receiptguard_expenses_v1',
  DISMISSED_ALERTS: 'receiptguard_dismissed_alerts_v1',
  API_KEY_OVERRIDE: 'receiptguard_api_key_override_v1',
};

/**
 * Retrieves all stored receipts.
 * @returns {Array<object>}
 */
export function getReceipts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to read receipts from localStorage:', err);
    return [];
  }
}

/**
 * Saves a new receipt or updates an existing one.
 * @param {object} receipt - Must have id or one will be assigned
 * @returns {object} saved receipt
 */
export function saveReceipt(receipt) {
  const current = getReceipts();
  const id = receipt.id || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const cleanReceipt = {
    ...receipt,
    id,
    savedAt: receipt.savedAt || new Date().toISOString(),
    total: Number(receipt.total) || 0,
    items: Array.isArray(receipt.items) ? receipt.items : [],
    tax: {
      total: Number(receipt.tax?.total) || 0,
      breakdown: Array.isArray(receipt.tax?.breakdown) ? receipt.tax.breakdown : [],
    },
    // We only keep a lightweight ~200px thumbnail in storage to stay well within 5MB quota
    thumbnail: receipt.thumbnail || null,
    // Perceptual hash for image comparison
    imageHash: receipt.imageHash || null,
  };

  const existingIndex = current.findIndex((r) => r.id === id);
  if (existingIndex >= 0) {
    current[existingIndex] = cleanReceipt;
  } else {
    // Newest first
    current.unshift(cleanReceipt);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to persist receipt in localStorage (quota may be full):', err);
    // If quota exceeded, attempt to strip thumbnails from older receipts and retry
    const fallbackList = current.map((r, idx) => (idx > 5 ? { ...r, thumbnail: null } : r));
    try {
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(fallbackList));
    } catch (innerErr) {
      alert('Local storage quota exceeded. Please export or reset data.');
    }
  }

  return cleanReceipt;
}

/**
 * Deletes a receipt by ID.
 * @param {string} id
 * @returns {boolean}
 */
export function deleteReceipt(id) {
  const current = getReceipts();
  const filtered = current.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(filtered));
  return filtered.length < current.length;
}

/**
 * Replaces all receipts with a batch (useful for demo data loading or resetting).
 * @param {Array<object>} receipts
 */
export function setAllReceipts(receipts) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts || []));
  } catch (err) {
    console.error('Failed to set batch receipts:', err);
  }
}

/**
 * Clears all stored receipts and alert states.
 */
export function clearAllStorage() {
  localStorage.removeItem(STORAGE_KEYS.RECEIPTS);
  localStorage.removeItem(STORAGE_KEYS.DISMISSED_ALERTS);
}

/**
 * Dismissed alerts persistence
 */
export function getDismissedAlerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DISMISSED_ALERTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Marks an alert as dismissed ("Looks fine").
 * @param {string} alertId - e.g. "duplicate_rcpt123_rcpt456"
 */
export function dismissAlert(alertId) {
  const dismissed = getDismissedAlerts();
  if (!dismissed.includes(alertId)) {
    dismissed.push(alertId);
    localStorage.setItem(STORAGE_KEYS.DISMISSED_ALERTS, JSON.stringify(dismissed));
  }
}

/**
 * Checks if an alert has already been dismissed.
 * @param {string} alertId
 * @returns {boolean}
 */
export function isAlertDismissed(alertId) {
  const dismissed = getDismissedAlerts();
  return dismissed.includes(alertId);
}

/**
 * AI Provider selection ('local' | 'groq' | 'gemini')
 */
export function getAiProvider() {
  const saved = localStorage.getItem('receiptguard_ai_provider_v1');
  if (saved) return saved;
  if (import.meta.env.VITE_GROQ_API_KEY) return 'groq';
  return 'local';
}

export function setAiProvider(provider) {
  localStorage.setItem('receiptguard_ai_provider_v1', provider);
}

/**
 * Custom Gemini API key override
 */
export function getCustomApiKey() {
  return localStorage.getItem(STORAGE_KEYS.API_KEY_OVERRIDE) || '';
}

export function setCustomApiKey(key) {
  if (!key) {
    localStorage.removeItem(STORAGE_KEYS.API_KEY_OVERRIDE);
  } else {
    localStorage.setItem(STORAGE_KEYS.API_KEY_OVERRIDE, key.trim());
  }
}

/**
 * Custom Groq API key override
 */
export function getGroqApiKey() {
  return localStorage.getItem('receiptguard_groq_api_key_v1') || '';
}

export function setGroqApiKey(key) {
  if (!key) {
    localStorage.removeItem('receiptguard_groq_api_key_v1');
  } else {
    localStorage.setItem('receiptguard_groq_api_key_v1', key.trim());
  }
}
