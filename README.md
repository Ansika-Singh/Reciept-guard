# ReceiptGuard AI

> **CYRUS HACK-A-THON 2026** &middot; Problem Statement 03: *"Smart Receipt & Invoice Snapshot Auditor"*  
> **Tagline:** *"Turn receipts into financial intelligence."*  
> **Team:** Pixel Pirates

---

## Overview

**ReceiptGuard AI** is an AI-assisted expense review and receipt auditing tool. OCR is only the beginning:
1. **Snap & Downscale:** Users capture or upload receipt images (drag-and-drop, camera capture, file picker). Large photos are automatically downscaled on an HTML5 canvas (max 1600px) and fingerprinted with a 64-bit Average Perceptual Hash (aHash).
2. **AI-Assisted Extraction:** Uses Google's **Gemini Vision API** (model `gemini-2.5-flash`) via direct browser fetch with structured JSON output and schema validation, specially tuned for Indian receipts (₹ INR, GST, CGST, SGST, IGST).
3. **Graceful Fallback:** If offline or if the Gemini API key is not configured, the app immediately switches to a manual-entry review mode without ever crashing, preserving the photo snapshot and thumbnail.
4. **Deterministic Intelligence Engine:** Pure, offline, unit-tested detection functions audit expenses against historical records for:
   - **Potential Duplicates:** Evaluates merchant name similarity (normalized Levenshtein / substring / token match &ge; 0.8), exact amounts (&plusmn;₹0.01), date proximity (&plusmn;1 day), and visual image hash similarity (Hamming distance &le; 5 bits).
   - **Unusual Expenses:** Flags items exceeding mean + 2&sigma; or 2&times; category median (requiring &ge;3 baseline historical transactions).
   - **Repeated Purchases:** Flags 3 or more transactions at the same merchant within a 7-day window.
   - **Spending Spikes:** Flags weekly category spending &gt; 1.5&times; the baseline average of earlier weeks (&ge;3 prior weeks).
5. **Deterministic Explanations:** Explains *why* every alert fired using plain English with actual numerical values from the user's data (no LLM latency or hallucination).

---

## Strict Wording Rules

This application strictly adheres to the following terminology guidelines:

| Permitted Terminology | Prohibited Terminology |
| :--- | :--- |
| **"potential duplicate"** | *"fraud"* |
| **"unusual expense"** | *"guaranteed"* |
| **"requires review"** | *"100% accurate"* |
| **"AI-assisted detection"** | Any invented accuracy % |
| **"match strength: strong / moderate"** | Fabricated confidence scores |

---

## Tech Stack

- **Frontend:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 with custom SaaS color palette (`#154A82` primary, `#2F6BA8` mid-blue, `#F2A56B` warm accent, amber alert tints)
- **Charts:** Chart.js & `react-chartjs-2` (Category Doughnut & Daily Spend Bar charts)
- **AI/Vision:** Google Gemini Vision Flash (`gemini-2.5-flash`) direct browser fetch
- **Storage:** `localStorage` behind an abstraction wrapper with ~200px JPEG thumbnail caching (staying well within the 5MB quota)
- **Testing:** Vitest + React Testing Library (14 unit tests passing)

---

## Quick Start & Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd "ReceiptGuard AI"

# 2. Install dependencies
npm install

# 3. (Optional) Configure Gemini API Key
cp .env.example .env
# Edit .env and set VITE_GEMINI_API_KEY=your_key_here
# Note: You can also enter the API key directly in the UI via the "API Key" button!

# 4. Start local development server
npm run dev

# 5. Run test suite
npm run test
```

The application will be running at `http://localhost:5173/`.

---

## 7-Step Hackathon Demo Script

Follow this step-by-step walkthrough to test and demonstrate all core features:

### Step 1: Load Demo Data & View Dashboard
1. Open `http://localhost:5173/` in your browser.
2. Click the **"Load Demo Data"** button in the top right.
3. Observe ~25 realistic seeded transactions appear across categories with dates calculated relative to today's date.
4. Verify the **Total Spending**, **This Month**, and **Receipts Stored** KPI cards populate.
5. Inspect the **Spending Over Time** (Bar chart) and **Spending by Category** (Doughnut chart).

### Step 2: Test Potential Duplicate Alert (Live Upload)
1. Click **"Add Receipt"** or navigate to the Upload screen.
2. In the **"CYRUS Hackathon Quick-Test Receipts"** section, click **"Starbucks Coffee (₹420)"** (or drag `public/sample-receipts/starbucks_420.svg`).
3. The image is downscaled, visual hash is computed, and the receipt is routed to the Review screen.
4. **Observe the live pre-save alert:**
   - Title: **"Potential Duplicate Detected"**
   - Badge: `match strength: strong`
   - Reasons:
     - *"Merchant names match (Starbucks Coffee and Starbucks Coffee)"*
     - *"Identical total amount of ₹420.00"*
     - *"Transaction dates are within 1 day"*
     - *"Receipt image visual snapshot matches closely"*
5. Click **"Save Expense"** to file the receipt.

### Step 3: Test Unusual Expense Alert (Live Upload)
1. Click **"Add Receipt"** again.
2. Click the **"Croma Megastore (₹8,499)"** preset button (or upload `public/sample-receipts/croma_electronics_8499.svg`).
3. Notice the category is set to **Electronics**.
4. **Observe the live pre-save alert:**
   - Title: **"Unusual Expense Requires Review"**
   - Badge: `requires review`
   - Reasons:
     - *"Amount ₹8,499.00 is significantly above your usual Electronics range (historically ₹1,850.00 to ₹2,899.00)"*
     - *"This receipt is more than 2x your historical Electronics median (₹4,698.00)"*
     - *"Exceeds 2 standard deviations above mean"*
5. Click **"Save Expense"**.

### Step 4: Inspect the Dashboard "Requires Review" Section
1. Return to the Dashboard.
2. Look at the **"Requires Review"** summary card (highlighted in amber).
3. Under **"Items Requiring Review"**, examine the generated alert cards.
4. Click **"Looks fine"** on any alert to dismiss it. Verify that the dismissal is stored and the count decreases.
5. On the duplicate alert, you can also click **"Delete duplicate"** to purge the redundant transaction.

### Step 5: Test Search and Category Filtering
1. In the **Recorded Transactions** table:
   - Type `"Starbucks"` in the search bar &rarr; filters instantly to Starbucks visits with alert badges.
   - Type `"Electronics"` &rarr; displays historical baseline electronics purchases plus the new ₹8,499 item.
   - Click the **"Food"** or **"Shopping"** category filter pills.
2. Notice the ~200px thumbnail preview next to each receipt, preserved without overflowing localStorage.

### Step 6: Test Normal Receipt (Amazon India ₹2,499)
1. Click **"Add Receipt"** and select **"Amazon India (₹2,499)"**.
2. Notice the 18% IGST tax breakdown (`₹381.20`) and items line (`SanDisk Extreme 1TB SSD`).
3. Verify that **no alert is raised**, showing status **"Clean"** because it fits within customary spending patterns.

### Step 7: Test Offline / Manual Entry Fallback
1. If the Gemini API key is absent or network is disconnected, upload any receipt image or click **"Manual Entry"**.
2. A clear banner states:
   > *"Manual Entry Mode Active — AI extraction was unavailable. Please verify or input your receipt details below. Your receipt image snapshot and perceptual hash were preserved."*
3. The app **never crashes** and allows smooth manual recording.

---

## Known Limitations

1. **Client-Side Storage Quota:** Receipts and thumbnails are stored in browser `localStorage`. To avoid the ~5 MB browser quota limit, images are converted to ~200px JPEG thumbnails for persistence rather than storing raw 10MB camera files.
2. **Prototype API Key Exposure:** The Gemini API key is configured in the frontend environment (`VITE_GEMINI_API_KEY` or browser override). In a production release, Gemini API calls should be proxied through a secure backend server.
3. **Single Currency Focus:** Tailored for Indian Rupee (₹ INR) receipts with Indian tax breakdowns (GST/CGST/SGST/IGST). Multi-currency conversion is not yet supported.
4. **Perceptual aHash Simplicity:** Average hash (aHash 8&times;8) is computationally lightweight for pure in-browser execution; highly warped or cropped receipts may require perceptual pHash/dHash algorithms for advanced image matching.
5. **No Multi-User Authentication:** Designed as a single-user prototype without cloud database synchronization.
