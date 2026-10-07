/**
 * Gemini Vision API integration for ReceiptGuard AI
 * Calls Gemini directly from browser with structured JSON output schema.
 * Note: Prototype implementation for CYRUS HACK-A-THON 2026.
 */

// Single model constant for easy switching: 'gemini-1.5-flash' or 'gemini-2.0-flash'
export const GEMINI_MODEL = 'gemini-1.5-flash';

/**
 * Strict JSON Schema for Gemini structured output
 */
const RECEIPT_EXTRACTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    merchant: {
      type: 'STRING',
      description: 'Business or merchant name as printed on the receipt.',
    },
    date: {
      type: 'STRING',
      description: 'Transaction date in YYYY-MM-DD ISO format. If missing or unclear, use today.',
    },
    total: {
      type: 'NUMBER',
      description: 'Final grand total amount paid including all taxes.',
    },
    currency: {
      type: 'STRING',
      description: 'Currency code, usually INR for Indian receipts (or ₹).',
    },
    tax: {
      type: 'OBJECT',
      properties: {
        total: {
          type: 'NUMBER',
          description: 'Total tax amount charged.',
        },
        breakdown: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              label: {
                type: 'STRING',
                description: 'Tax category label such as CGST, SGST, IGST, VAT, or Service Tax.',
              },
              amount: {
                type: 'NUMBER',
                description: 'Tax amount in number.',
              },
            },
            required: ['label', 'amount'],
          },
        },
      },
      required: ['total', 'breakdown'],
    },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: {
            type: 'STRING',
            description: 'Item or line description.',
          },
          amount: {
            type: 'NUMBER',
            description: 'Item subtotal or line price.',
          },
        },
        required: ['name', 'amount'],
      },
    },
    suggestedCategory: {
      type: 'STRING',
      enum: ['Food', 'Travel', 'Shopping', 'Electronics', 'Bills', 'Supplies', 'Other'],
      description: 'Best matching category among: Food, Travel, Shopping, Electronics, Bills, Supplies, Other.',
    },
  },
  required: ['merchant', 'date', 'total', 'currency', 'tax', 'items', 'suggestedCategory'],
};

/**
 * Extracts structured data from a receipt image using Gemini Vision API.
 * @param {string} base64Data - Raw base64 string without data:image prefix
 * @param {string} mimeType - e.g. "image/jpeg" or "image/png"
 * @param {string} [overrideKey] - Optional API key override
 * @returns {Promise<object>} Extracted receipt JSON
 */
export async function extractReceiptWithGemini(base64Data, mimeType = 'image/jpeg', overrideKey = null) {
  const apiKey = overrideKey || import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('MISSING_API_KEY');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const systemInstruction = `You are an expert Indian receipt and invoice data extractor for an expense review application called ReceiptGuard AI.
Carefully inspect the provided receipt image.
1. Extract the merchant name accurately (e.g. Starbucks, Croma, Amazon India, Swiggy, Uber).
2. Extract the date in strict ISO format YYYY-MM-DD.
3. Extract the grand total number. Convert Indian Rupee symbols (₹, INR, Rs) into a pure float number.
4. Extract all itemized goods/services in the items array with name and amount.
5. Extract tax totals and breakdown (specifically looking for Indian GST, CGST, SGST, IGST line items). If no explicit tax is listed, set tax.total to 0 and tax.breakdown to [].
6. Suggest the single best expense category from: Food, Travel, Shopping, Electronics, Bills, Supplies, Other.
Return ONLY valid JSON complying with the provided schema.`;

  const payload = {
    contents: [
      {
        parts: [
          { text: systemInstruction },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RECEIPT_EXTRACTION_SCHEMA,
      temperature: 0.1,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedMessage = response.statusText;
    try {
      const errJson = JSON.parse(errorBody);
      parsedMessage = errJson?.error?.message || response.statusText;
    } catch {
      // ignore
    }
    throw new Error(`Gemini API error (${response.status}): ${parsedMessage}`);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('No extraction output returned from Gemini');
  }

  try {
    const parsed = JSON.parse(textOutput);

    // Sanitize and normalize fields
    return {
      merchant: String(parsed.merchant || 'Unknown Merchant').trim(),
      date: parsed.date || new Date().toISOString().split('T')[0],
      total: Number(parsed.total) || 0,
      currency: parsed.currency || 'INR',
      tax: {
        total: Number(parsed.tax?.total) || 0,
        breakdown: Array.isArray(parsed.tax?.breakdown) ? parsed.tax.breakdown : [],
      },
      items: Array.isArray(parsed.items) ? parsed.items : [],
      suggestedCategory: parsed.suggestedCategory || 'Other',
    };
  } catch (err) {
    throw new Error(`Failed to parse structured JSON from Gemini: ${err.message}`);
  }
}
