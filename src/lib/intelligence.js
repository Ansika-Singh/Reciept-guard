/**
 * ReceiptGuard AI — Intelligence Engine
 * Pure functions for detecting:
 * 1. Potential Duplicates (merchant similarity, amount equality, date proximity, image aHash)
 * 2. Unusual Expenses (mean + 2*sigma, 2x median with >= 3 historical items)
 * 3. Repeated Purchases (>= 3 times at same merchant in 7 days)
 * 4. Spending Spikes (> 1.5x previous weekly average with >= 3 prior weeks)
 *
 * Strict wording rules applied:
 * "potential duplicate", "unusual expense", "requires review", "AI-assisted detection", "match strength: strong / moderate"
 * Offline deterministic plain-language explanations with actual amounts.
 */

import { formatINR } from './formatting.js';
import { getHammingDistance } from './imageProcessing.js';

/**
 * Normalizes merchant name by lowercasing and stripping special characters/whitespace.
 * @param {string} name
 * @returns {string}
 */
export function normalizeMerchant(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Computes similarity between two merchant strings (0.0 to 1.0).
 * Handles exact matches, prefixes, substrings, and token overlap.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function stringSimilarity(a, b) {
  if (!a || !b) return 0.0;
  const normA = normalizeMerchant(a);
  const normB = normalizeMerchant(b);

  if (normA === normB) return 1.0;
  if (!normA || !normB) return 0.0;

  // Substring or prefix match (e.g. "Starbucks" in "Starbucks Coffee", "Amazon" in "Amazon India")
  if (normA.startsWith(normB) || normB.startsWith(normA) || normA.includes(normB) || normB.includes(normA)) {
    const minLen = Math.min(normA.length, normB.length);
    if (minLen >= 4) {
      return 0.88;
    }
  }

  // Token-level check (e.g. "Blue Tokai Coffee" vs "Blue Tokai")
  const tokensA = a.toLowerCase().split(/[\s,.-]+/).filter(Boolean);
  const tokensB = b.toLowerCase().split(/[\s,.-]+/).filter(Boolean);
  const shared = tokensA.filter((t) => tokensB.includes(t));
  const minTokens = Math.min(tokensA.length, tokensB.length);
  if (minTokens > 0 && shared.length === minTokens && shared.length >= 1) {
    return 0.85;
  }

  const matrix = [];
  for (let i = 0; i <= normB.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= normA.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= normB.length; i++) {
    for (let j = 1; j <= normA.length; j++) {
      if (normB.charAt(i - 1) === normA.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  const distance = matrix[normB.length][normA.length];
  const maxLen = Math.max(normA.length, normB.length);
  return Math.max(0, 1 - distance / maxLen);
}

/**
 * Checks if two dates (ISO YYYY-MM-DD) are within +/- 1 day (inclusive).
 * @param {string} date1
 * @param {string} date2
 * @returns {boolean}
 */
export function isWithinOneDay(date1, date2) {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  if (isNaN(d1) || isNaN(d2)) return false;
  const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
  return diffDays <= 1.05; // 1 day tolerance
}

/**
 * 1. POTENTIAL DUPLICATE DETECTION
 * Signals evaluated against existing receipts:
 * - Merchant similarity >= 0.8
 * - Amount equal (within ₹0.01)
 * - Date within +/- 1 day
 * - Perceptual image hash Hamming distance <= 5 bits
 *
 * Scoring:
 * - 3 or more signals = match strength "strong"
 * - 2 signals including merchant = match strength "moderate"
 *
 * @param {object} candidate - New or existing receipt
 * @param {Array<object>} allReceipts - History
 * @returns {Array<object>} List of duplicate alerts
 */
export function detectDuplicates(candidate, allReceipts = []) {
  if (!candidate) return [];
  const alerts = [];

  for (const existing of allReceipts) {
    // Never compare against itself
    if (existing.id && candidate.id && existing.id === candidate.id) continue;

    const signals = [];
    const reasons = [];

    // Signal A: Merchant match
    const merchSim = stringSimilarity(candidate.merchant, existing.merchant);
    const merchantMatch = merchSim >= 0.8;
    if (merchantMatch) {
      signals.push('merchant');
      reasons.push(`Merchant names match (${candidate.merchant || 'Unknown'} and ${existing.merchant || 'Unknown'})`);
    }

    // Signal B: Amount match (within ₹0.01)
    const amountDiff = Math.abs(Number(candidate.total || 0) - Number(existing.total || 0));
    const amountMatch = amountDiff <= 0.01;
    if (amountMatch) {
      signals.push('amount');
      reasons.push(`Identical total amount of ${formatINR(candidate.total)}`);
    }

    // Signal C: Date within +/- 1 day
    const dateMatch = isWithinOneDay(candidate.date, existing.date);
    if (dateMatch) {
      signals.push('date');
      reasons.push(`Transaction dates are within 1 day (${candidate.date || 'N/A'} vs ${existing.date || 'N/A'})`);
    }

    // Signal D: Perceptual Image Hash match (Hamming distance <= 5 out of 64 bits)
    let imageMatch = false;
    if (candidate.imageHash && existing.imageHash) {
      const distance = getHammingDistance(candidate.imageHash, existing.imageHash);
      if (distance <= 5) {
        imageMatch = true;
        signals.push('image_hash');
        reasons.push(`Receipt image visual snapshot matches closely (${64 - distance}/64 bits identical)`);
      }
    }

    // Evaluate strength
    let strength = null;
    if (signals.length >= 3) {
      strength = 'strong';
    } else if (signals.length >= 2 && merchantMatch) {
      strength = 'moderate';
    }

    if (strength) {
      alerts.push({
        id: `dup_${candidate.id || 'new'}_${existing.id}`,
        type: 'duplicate',
        title: 'Potential Duplicate Detected',
        strength: `match strength: ${strength}`,
        rawStrength: strength,
        signals,
        reasons,
        targetReceiptId: candidate.id,
        relatedReceiptId: existing.id,
        relatedReceipt: existing,
        suggestedAction: 'Delete duplicate or mark as verified',
      });
    }
  }

  return alerts;
}

/**
 * 2. UNUSUAL EXPENSE DETECTION
 * Requires at least 3 earlier transactions in the same category.
 * Flag if amount > mean + 2*sigma, OR amount > 2x category median.
 *
 * @param {object} candidate
 * @param {Array<object>} allReceipts
 * @returns {object|null}
 */
export function detectUnusualExpense(candidate, allReceipts = []) {
  if (!candidate || !candidate.category && !candidate.suggestedCategory) return null;
  const category = candidate.category || candidate.suggestedCategory;
  const candidateTotal = Number(candidate.total) || 0;

  // Filter existing receipts in the same category (excluding current candidate)
  const categoryHistory = allReceipts.filter((r) => {
    if (candidate.id && r.id === candidate.id) return false;
    const cat = r.category || r.suggestedCategory;
    return cat === category;
  });

  // Need at least 3 earlier transactions in the same category
  if (categoryHistory.length < 3) {
    return null;
  }

  const amounts = categoryHistory.map((r) => Number(r.total) || 0).sort((a, b) => a - b);
  const n = amounts.length;

  // Compute Mean & Standard Deviation
  const sum = amounts.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;
  const variance = amounts.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Compute Median
  let median;
  const mid = Math.floor(n / 2);
  if (n % 2 === 0) {
    median = (amounts[mid - 1] + amounts[mid]) / 2;
  } else {
    median = amounts[mid];
  }

  const minHistorical = amounts[0];
  const maxHistorical = amounts[n - 1];

  const sigmaThreshold = mean + 2 * stdDev;
  const medianThreshold = 2 * median;

  const exceedsSigma = candidateTotal > sigmaThreshold;
  const exceedsMedian = candidateTotal > medianThreshold;

  if (exceedsSigma || exceedsMedian) {
    const reasons = [
      `Amount ${formatINR(candidateTotal)} is significantly above your usual ${category} range (historically ${formatINR(minHistorical)} to ${formatINR(maxHistorical)})`,
      `Average spend for ${category} is ${formatINR(mean)}, with a median of ${formatINR(median)} across ${n} past receipts`,
    ];

    if (exceedsMedian) {
      reasons.push(`This receipt is more than 2x your historical ${category} median (${formatINR(medianThreshold)})`);
    }
    if (exceedsSigma && stdDev > 0) {
      reasons.push(`Exceeds 2 standard deviations above mean (${formatINR(sigmaThreshold)})`);
    }

    return {
      id: `unusual_${candidate.id || 'new'}`,
      type: 'unusual_expense',
      title: 'Unusual Expense Requires Review',
      strength: 'requires review',
      rawStrength: 'moderate',
      reasons,
      targetReceiptId: candidate.id,
      suggestedAction: 'Review transaction details and verify line items',
    };
  }

  return null;
}

/**
 * 3. REPEATED PURCHASE DETECTION
 * Flags if the same merchant appears 3 or more times within 7 days.
 *
 * @param {object} candidate
 * @param {Array<object>} allReceipts
 * @returns {object|null}
 */
export function detectRepeatedPurchase(candidate, allReceipts = []) {
  if (!candidate || !candidate.merchant || !candidate.date) return null;

  const candidateDate = new Date(candidate.date).getTime();
  if (isNaN(candidateDate)) return null;

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  // Collect occurrences of the same merchant within 7 days of candidate date
  const occurrences = allReceipts.filter((r) => {
    if (candidate.id && r.id === candidate.id) return false;
    if (stringSimilarity(candidate.merchant, r.merchant) < 0.8) return false;
    const rDate = new Date(r.date).getTime();
    if (isNaN(rDate)) return false;
    return Math.abs(candidateDate - rDate) <= sevenDaysMs;
  });

  // Including current candidate, total count = occurrences.length + 1
  const totalCount = occurrences.length + 1;

  if (totalCount >= 3) {
    const reasons = [
      `${candidate.merchant} has appeared ${totalCount} times within a 7-day period`,
      `Recent dates: ${[candidate.date, ...occurrences.slice(0, 3).map((r) => r.date)].join(', ')}`,
      `Total accumulated spend across these ${totalCount} visits: ${formatINR(
        Number(candidate.total || 0) + occurrences.reduce((s, r) => s + (Number(r.total) || 0), 0)
      )}`,
    ];

    return {
      id: `repeat_${candidate.id || 'new'}`,
      type: 'repeated_purchase',
      title: 'Repeated Purchase Frequency',
      strength: 'requires review',
      rawStrength: 'moderate',
      reasons,
      targetReceiptId: candidate.id,
      suggestedAction: 'Verify these are separate visits and not duplicate entries',
    };
  }

  return null;
}

/**
 * 4. SPENDING SPIKE DETECTION
 * This week's category total > 1.5x the average of earlier weeks.
 * Only triggers if at least 3 earlier weeks of data exist.
 *
 * @param {string} category
 * @param {Array<object>} allReceipts
 * @returns {object|null}
 */
export function detectSpendingSpike(category, allReceipts = []) {
  if (!category || !allReceipts.length) return null;

  // Filter by category
  const receipts = allReceipts.filter(
    (r) => (r.category || r.suggestedCategory) === category && r.date
  );

  if (receipts.length < 4) return null;

  // Helper to get start-of-week timestamp (Monday)
  const getWeekStart = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
  };

  // Group amounts by week start
  const weeklyTotals = {};
  for (const r of receipts) {
    const weekKey = getWeekStart(r.date);
    if (!weeklyTotals[weekKey]) weeklyTotals[weekKey] = 0;
    weeklyTotals[weekKey] += Number(r.total) || 0;
  }

  const weekKeys = Object.keys(weeklyTotals).sort((a, b) => Number(a) - Number(b));

  // Must have at least 4 distinct weeks (current week + at least 3 earlier weeks)
  if (weekKeys.length < 4) return null;

  const latestWeekKey = weekKeys[weekKeys.length - 1];
  const currentWeekTotal = weeklyTotals[latestWeekKey];

  const priorWeekKeys = weekKeys.slice(0, weekKeys.length - 1);
  const priorSum = priorWeekKeys.reduce((acc, k) => acc + weeklyTotals[k], 0);
  const priorAvg = priorSum / priorWeekKeys.length;

  if (priorAvg > 0 && currentWeekTotal > 1.5 * priorAvg) {
    return {
      id: `spike_${category}_${latestWeekKey}`,
      type: 'spending_spike',
      title: `Spending Spike in ${category}`,
      strength: 'requires review',
      rawStrength: 'moderate',
      reasons: [
        `This week's ${category} spend is ${formatINR(currentWeekTotal)}, which is ${((currentWeekTotal / priorAvg) * 100 - 100).toFixed(0)}% above your earlier weekly average`,
        `Baseline average over previous ${priorWeekKeys.length} weeks was ${formatINR(priorAvg)} per week`,
        `AI-assisted detection identified higher than customary category outflow`,
      ],
      suggestedAction: 'Review recent category expenses to keep budget aligned',
    };
  }

  return null;
}

/**
 * Runs all intelligence audits for a given candidate receipt against existing history.
 * @param {object} candidate
 * @param {Array<object>} allReceipts
 * @returns {Array<object>} Array of alert objects
 */
export function auditReceipt(candidate, allReceipts = []) {
  const alerts = [];

  // 1. Duplicates
  const dupAlerts = detectDuplicates(candidate, allReceipts);
  alerts.push(...dupAlerts);

  // 2. Unusual expense
  const unusualAlert = detectUnusualExpense(candidate, allReceipts);
  if (unusualAlert) alerts.push(unusualAlert);

  // 3. Repeated purchase
  const repeatAlert = detectRepeatedPurchase(candidate, allReceipts);
  if (repeatAlert) alerts.push(repeatAlert);

  return alerts;
}

/**
 * Audits the entire dataset for system-wide alerts (including category spikes).
 * @param {Array<object>} allReceipts
 * @returns {Array<object>} All active alerts across receipts
 */
export function auditAllReceipts(allReceipts = []) {
  const alerts = [];
  const seenIds = new Set();

  // Audit each receipt individually
  for (let i = 0; i < allReceipts.length; i++) {
    const candidate = allReceipts[i];
    const receiptAlerts = auditReceipt(candidate, allReceipts);

    for (const alert of receiptAlerts) {
      if (!seenIds.has(alert.id)) {
        seenIds.add(alert.id);
        alerts.push(alert);
      }
    }
  }

  // Audit category spikes
  const categories = ['Food', 'Travel', 'Shopping', 'Electronics', 'Bills', 'Supplies', 'Other'];
  for (const cat of categories) {
    const spike = detectSpendingSpike(cat, allReceipts);
    if (spike && !seenIds.has(spike.id)) {
      seenIds.add(spike.id);
      alerts.push(spike);
    }
  }

  return alerts;
}
