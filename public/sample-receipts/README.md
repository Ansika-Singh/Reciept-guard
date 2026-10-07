# Sample Test Receipts — ReceiptGuard AI

These sample receipt images are provided for testing and evaluation during **CYRUS HACK-A-THON 2026**:

1. **`starbucks_420.svg`** — ₹420.00 Starbucks Coffee receipt (Date: Today, Food category, CGST 2.5% + SGST 2.5%).
   > **Evaluation Note:** Uploading this Starbucks receipt exercises the **Potential Duplicate** alert against the seeded Starbucks transaction. Uploading it twice also exercises the **perceptual image-hash (aHash)** signal (matching canvas perceptual hashes within <= 5 bits difference).

2. **`amazon_gst_2499.svg`** — ₹2,499.00 Amazon India tax invoice with 18% IGST for a SanDisk 1TB SSD in Electronics. Fits neatly within standard historical spending ranges.

3. **`croma_electronics_8499.svg`** — ₹8,499.00 Croma Megastore receipt for Sony Noise-Cancelling Headphones with 18% GST in Electronics.
   > **Evaluation Note:** Uploading or saving this receipt exercises the **Unusual Expense** alert, because the baseline history has 4 earlier Electronics transactions between ₹1,850 and ₹2,899 (average ~₹2,360, median ~₹2,349). ₹8,499 exceeds both mean + 2σ and 2x median!

All test receipts are formatted in pure SVG for crisp, scalable rendering at any resolution.
