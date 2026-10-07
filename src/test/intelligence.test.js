import { describe, it, expect } from 'vitest';
import {
  stringSimilarity,
  normalizeMerchant,
  isWithinOneDay,
  detectDuplicates,
  detectUnusualExpense,
  detectRepeatedPurchase,
  detectSpendingSpike,
  auditReceipt,
} from '../lib/intelligence.js';

describe('Intelligence Engine — String & Date Helpers', () => {
  it('normalizes merchant names correctly', () => {
    expect(normalizeMerchant('Starbucks Coffee, Inc.')).toBe('starbuckscoffeeinc');
    expect(normalizeMerchant('  Croma - Electronics! ')).toBe('cromaelectronics');
    expect(normalizeMerchant('')).toBe('');
  });

  it('computes high similarity for identical and minor merchant variations', () => {
    expect(stringSimilarity('Starbucks', 'Starbucks')).toBe(1.0);
    expect(stringSimilarity('Starbucks Coffee', 'Starbucks')).toBeGreaterThanOrEqual(0.8);
    expect(stringSimilarity('Amazon India', 'Amazon')).toBeGreaterThanOrEqual(0.8);
    expect(stringSimilarity('Uber India', 'McDonalds')).toBeLessThan(0.3);
  });

  it('correctly identifies dates within +/- 1 day', () => {
    expect(isWithinOneDay('2026-10-06', '2026-10-06')).toBe(true);
    expect(isWithinOneDay('2026-10-06', '2026-10-07')).toBe(true);
    expect(isWithinOneDay('2026-10-06', '2026-10-05')).toBe(true);
    expect(isWithinOneDay('2026-10-06', '2026-10-09')).toBe(false);
  });
});

describe('Intelligence Engine — Duplicate Detection', () => {
  const existingReceipts = [
    {
      id: 'rcpt_starbucks_1',
      merchant: 'Starbucks Coffee',
      date: '2026-10-06',
      total: 420.0,
      imageHash: '1111000011110000111100001111000011110000111100001111000011110000',
    },
    {
      id: 'rcpt_croma_1',
      merchant: 'Croma',
      date: '2026-09-20',
      total: 2199.0,
    },
  ];

  it('detects strong match duplicate when merchant, amount, and date match', () => {
    const candidate = {
      id: 'rcpt_new',
      merchant: 'Starbucks',
      date: '2026-10-06',
      total: 420.0,
    };

    const alerts = detectDuplicates(candidate, existingReceipts);
    expect(alerts.length).toBe(1);
    expect(alerts[0].rawStrength).toBe('strong');
    expect(alerts[0].strength).toBe('match strength: strong');
    expect(alerts[0].signals).toContain('merchant');
    expect(alerts[0].signals).toContain('amount');
    expect(alerts[0].signals).toContain('date');
    expect(alerts[0].reasons.length).toBeGreaterThanOrEqual(3);
  });

  it('detects strong match duplicate when image hash matches within 5 bits', () => {
    const candidate = {
      id: 'rcpt_new_img',
      merchant: 'Starbucks',
      date: '2026-10-06',
      total: 420.0,
      // 2 bits different
      imageHash: '1111000011110000111100001111000011110000111100001111000011110011',
    };

    const alerts = detectDuplicates(candidate, existingReceipts);
    expect(alerts.length).toBe(1);
    expect(alerts[0].rawStrength).toBe('strong');
    expect(alerts[0].signals).toContain('image_hash');
  });

  it('detects moderate match duplicate when 2 signals fire including merchant', () => {
    const candidate = {
      id: 'rcpt_new_moderate',
      merchant: 'Starbucks',
      date: '2026-08-01', // different date
      total: 420.0, // same amount
    };

    const alerts = detectDuplicates(candidate, existingReceipts);
    expect(alerts.length).toBe(1);
    expect(alerts[0].rawStrength).toBe('moderate');
    expect(alerts[0].strength).toBe('match strength: moderate');
  });

  it('does not flag completely different transactions', () => {
    const candidate = {
      id: 'rcpt_new_diff',
      merchant: 'Swiggy',
      date: '2026-10-06',
      total: 890.0,
    };

    const alerts = detectDuplicates(candidate, existingReceipts);
    expect(alerts.length).toBe(0);
  });
});

describe('Intelligence Engine — Unusual Expense Detection', () => {
  // 4 electronics purchases between 1800 and 3000
  const history = [
    { id: '1', category: 'Electronics', total: 1850 },
    { id: '2', category: 'Electronics', total: 2200 },
    { id: '3', category: 'Electronics', total: 2499 },
    { id: '4', category: 'Electronics', total: 2899 },
  ];

  it('does NOT flag when history has fewer than 3 transactions', () => {
    const smallHistory = [
      { id: '1', category: 'Supplies', total: 500 },
      { id: '2', category: 'Supplies', total: 600 },
    ];
    const candidate = { id: '3', category: 'Supplies', total: 10000 };
    const alert = detectUnusualExpense(candidate, smallHistory);
    expect(alert).toBeNull();
  });

  it('flags an ₹8,499 electronics purchase when history is ₹1,800-₹3,000', () => {
    const candidate = {
      id: '5',
      category: 'Electronics',
      total: 8499,
    };

    const alert = detectUnusualExpense(candidate, history);
    expect(alert).not.toBeNull();
    expect(alert.title).toBe('Unusual Expense Requires Review');
    expect(alert.strength).toBe('requires review');
    expect(alert.reasons.some((r) => r.includes('Electronics'))).toBe(true);
    expect(alert.reasons.some((r) => r.includes('8,499'))).toBe(true);
  });

  it('does NOT flag a normal ₹2,400 electronics purchase', () => {
    const candidate = {
      id: '5',
      category: 'Electronics',
      total: 2400,
    };

    const alert = detectUnusualExpense(candidate, history);
    expect(alert).toBeNull();
  });
});

describe('Intelligence Engine — Repeated Purchase Detection', () => {
  const history = [
    { id: '1', merchant: 'Blue Tokai', date: '2026-10-01', total: 250 },
    { id: '2', merchant: 'Blue Tokai Coffee', date: '2026-10-03', total: 280 },
  ];

  it('flags when same merchant appears 3 or more times within 7 days', () => {
    const candidate = {
      id: '3',
      merchant: 'Blue Tokai',
      date: '2026-10-05',
      total: 310,
    };

    const alert = detectRepeatedPurchase(candidate, history);
    expect(alert).not.toBeNull();
    expect(alert.type).toBe('repeated_purchase');
    expect(alert.reasons[0]).toContain('3 times within a 7-day period');
  });

  it('does not flag if purchases are spread far apart', () => {
    const spreadHistory = [
      { id: '1', merchant: 'Blue Tokai', date: '2026-08-01', total: 250 },
      { id: '2', merchant: 'Blue Tokai', date: '2026-09-01', total: 280 },
    ];
    const candidate = {
      id: '3',
      merchant: 'Blue Tokai',
      date: '2026-10-05',
      total: 310,
    };

    const alert = detectRepeatedPurchase(candidate, spreadHistory);
    expect(alert).toBeNull();
  });
});

describe('Intelligence Engine — Spending Spike Detection', () => {
  it('flags weekly category spike when current week is > 1.5x previous average with >= 3 prior weeks', () => {
    const history = [
      // Week 1 (4 weeks ago): 1000
      { id: '1', category: 'Shopping', total: 1000, date: '2026-09-01' },
      // Week 2 (3 weeks ago): 1200
      { id: '2', category: 'Shopping', total: 1200, date: '2026-09-08' },
      // Week 3 (2 weeks ago): 1100
      { id: '3', category: 'Shopping', total: 1100, date: '2026-09-15' },
      // Week 4 (Current week): 5000 (> 1.5x avg of ~1100)
      { id: '4', category: 'Shopping', total: 5000, date: '2026-09-22' },
    ];

    const spike = detectSpendingSpike('Shopping', history);
    expect(spike).not.toBeNull();
    expect(spike.type).toBe('spending_spike');
    expect(spike.title).toContain('Spending Spike in Shopping');
    expect(spike.reasons[0]).toContain('Shopping spend is');
  });

  it('does not flag if less than 3 prior weeks of data exist', () => {
    const shortHistory = [
      { id: '1', category: 'Shopping', total: 1000, date: '2026-09-01' },
      { id: '2', category: 'Shopping', total: 5000, date: '2026-09-08' },
    ];

    const spike = detectSpendingSpike('Shopping', shortHistory);
    expect(spike).toBeNull();
  });
});
