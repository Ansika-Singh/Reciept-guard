# RUPERTRACE — ReceiptGuard AI

> **"Don't just store your receipt. Protect what you already bought."**

**Rupertrace** (formerly ReceiptGuard AI) is a Personal Purchase Protection Agent built for responsible, grounded AI hackathon evaluation. Immediately at ingestion, Rupertrace parses receipts, matches store return and warranty policies, performs deterministic date arithmetic (`purchase_date + policy_days`), flags return windows expiring soon (`< 7 days`), grounds RAG Q&A, and verifies order status directly against the database truth without LLM hallucinations.

### 🔗 Live Demo

> **[https://receiptguard-ai-one.vercel.app](https://receiptguard-ai-one.vercel.app)**

---

## Features

### 📄 Smart Receipt Ingestion
- **Multi-format upload** — supports PDF, PNG, JPG, JPEG, WEBP, and TXT files.
- **Hybrid text extraction** — native selectable PDF text via PyMuPDF, with automatic OCR fallback (RapidOCR / Groq Vision API) for scanned documents and images.
- **AI-powered structured parsing** — extracts store name, purchase date, invoice number, line items, quantities, unit prices, taxes, subtotals, and grand totals into a clean structured schema.
- **Arithmetic validation** — independently verifies `qty × unit_price = line_total` and `Σ items + tax = grand_total` with explicit discrepancy warnings, never silently correcting numbers.
- **SHA-256 deduplication** — detects and prevents re-upload of identical files per shopper.

### 🛡️ Proactive Purchase Protection Engine
- **Automatic policy matching** — maps each item's category (Electronics, Clothing, Books, Food & Beverage, etc.) to the relevant store's return and warranty policy sections.
- **Deterministic deadline calculator** — computes exact return/warranty deadlines using strict Python `datetime` arithmetic (`purchase_date + policy_days`), never delegating math to an LLM.
- **Expiring-soon alerts** — flags items with return windows closing within 7 days as `EXPIRING SOON` with `ACTION REQUIRED` badges.
- **"Why this date?" breakdown** — shows the full mathematical formula (`10 Sep 2026 + 30 days = 10 Oct 2026`) with the exact policy section citation (e.g., `DemoMart Policy §3.1`).

### 💬 Grounded RAG Chat Assistant
- **Context-grounded Q&A** — answers are generated strictly from the shopper's uploaded receipts, matched policies, and calculated deadlines.
- **Anti-hallucination safeguards** — system prompt enforces factual-only responses; if information isn't in the context, the assistant explicitly says so.
- **Multi-provider AI backend** — supports OpenAI / Groq / OpenRouter APIs, local Ollama, or a zero-dependency deterministic fallback engine.
- **Source citations** — every answer includes verified source references (receipt data, policy section, or database record).

### 📦 Verified Order Tracking
- **Database-verified status** — queries real SQLite records for order status, carrier, tracking number, and estimated delivery.
- **Zero-fabrication guarantee** — unknown order IDs (e.g., `ORD-9999`) return a clean `"Order ID not found"` response, never invented data.
- **Shopper-isolated access control** — orders are scoped per shopper; cross-tenant queries return `"Access denied"`.

### 🏦 Receipt Vault & Dashboard
- **Secure receipt vault** — stores and organizes all confirmed receipts per shopper with file hash integrity.
- **Draft → Review → Confirm workflow** — AI-extracted data is presented as a reviewable draft; shoppers inspect and confirm before committing to the vault.
- **Dashboard metrics** — at-a-glance view of total receipts, items protected, upcoming deadlines, and active alerts.
- **Recent receipts widget** — quick access to the latest uploads with status indicators.

### 🔍 Policy Explorer & Audit Trail
- **Policy explorer** — browse all seeded store return/warranty policies with per-category breakdowns and section codes.
- **Full audit timeline** — every pipeline stage (upload → parse → extract → validate → policy match → calculate → index) is logged with timestamps for transparency.

### 🎨 Premium Frontend Experience
- **3D motion hero background** — tilted marquee wall with floating receipt cards and brand logos using Framer Motion.
- **Unified composer** — single input field for uploading receipts, asking questions, or checking order status.
- **Interactive demo mode** — one-click "Try Demo (60s)" flow pre-seeded with realistic receipts (DemoMart Winter Jacket ₹4,999, Running Shoes, Laptop Pro) for instant evaluation.
- **Multi-user session switcher** — demo login modal with pre-configured shopper profiles, persisted via `localStorage`.
- **Responsive design** — React 18 + TypeScript + Tailwind CSS with micro-animations and glassmorphism effects.

### 🔒 Security & Multi-Tenancy
- **Shopper-isolated vector retrieval** — ChromaDB collections are scoped per `shopper_id` (`shopper_{shopper_id}`) for strict multi-tenant data isolation.
- **Input sanitization** — documents are treated as untrusted data; instructions embedded inside uploaded files are never executed.
- **Deterministic fallback engine** — if Ollama, Chroma, or any AI provider is offline, all calculated deadlines, policies, alerts, and the full UI continue to work 100% reliably.

---

## Architecture Overview

```
                      USER / BROWSER
                            │
                            ▼
           REACT + TS FRONTEND (Vite + Tailwind)
                            │
                   REST / WEBSOCKET API
                            │
                            ▼
            FASTAPI BACKEND (Python + Pydantic)
                            │
    ┌───────────────────────┼───────────────────────┐
    ▼                       ▼                       ▼
Receipt Processing    Policy Engine          Order Service
  & Parsers          & Deterministic           & SQLite
(PyMuPDF / OCR)         Calculator                DB
    │                       │                       │
    ▼                       ▼                       ▼
Chroma Vector DB      Calculated Deadlines      Mock Orders
(Shopper-Isolated)    & Proactive Alerts       (ORD-1001 etc.)
    │                       │                       │
    └───────────────────────┼───────────────────────┘
                            ▼
                  LangChain + ChatOllama RAG
             (Grounded Q&A & Strict Fallbacks)
```

---

## Key Differentiators & Anti-Hallucination Safeguards

1. **Automatic Ingestion Pipeline**: Date arithmetic and return window calculations run immediately upon receipt ingestion before the user asks a question.
2. **Deterministic Calculator**: Date calculations (`purchase_date + policy_days`), days remaining (`deadline - as_of_date`), and expiring flags (`days_remaining < 7`) are handled strictly in Python datetime logic — never delegated to LLM arithmetic.
3. **Shopper-Isolated Retrieval**: Chroma collections are scoped per `shopper_id` (`shopper_{shopper_id}`) to guarantee multi-tenant vector data isolation.
4. **Verified Order Status**: Queries real SQLite database records (`ORD-1001` -> Delivered). Unknown order IDs (`ORD-9999`) return a clean, un-fabricated "Order ID not found" state.
5. **Deterministic Fallback Engine**: If Ollama or Chroma is offline, all calculated deadlines, policy rules, proactive alerts, and UI continue to work 100% reliably.
6. **Try Demo Mode**: One-click 60-second judge demo flow featuring pre-seeded realistic receipts (DemoMart Winter Jacket ₹4,999, Running Shoes, Laptop Pro).

---

## Tech Stack

- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy, SQLite, PyMuPDF, ChromaDB, LangChain.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion, Axios.
- **AI Providers**: OpenAI / Groq / OpenRouter APIs, Local Ollama, Deterministic Fallback Engine.
- **OCR**: RapidOCR (local), Groq Vision API (cloud), SHA-256 canonical document hashing.
- **Testing**: Pytest unit test suite covering date arithmetic, order lookups, and security isolation.
- **Deployment**: Vercel (Frontend + Serverless API), Docker, Docker Compose, Nginx.

---

## 60-Second Hackathon Judge Demo Flow

1. **Start Backend & Frontend** (or click **"Try Demo"** in UI).
2. **Click "Try Demo (60s)"** on the landing hero section.
3. **Observe Ingestion Timeline**: Watch the live step-by-step progress checklist (Uploaded -> Parsed -> Extraction -> Policy Matched -> Calculator Executed -> Expiring Windows Flagged -> Indexed).
4. **Proactive Protection Summary**:
   - Immediate **ACTION REQUIRED** alert appears: *Winter Jacket (₹4,999)* return deadline is 10 Oct 2026, **5 days remaining**, flagged as **EXPIRING SOON** (<7 days threshold).
5. **Click "Why this date?"**:
   - Inspect the mathematical formula breakdown (`10 Sep 2026 + 30 days = 10 Oct 2026`) and policy section citation (`DemoMart Policy §3.1`).
6. **Ask Grounded RAG Chat**:
   - Ask: *"Can I still return my jacket?"* -> Response returns grounded answer with verified source citations.
7. **Verify Order Status**:
   - Click chip `ORD-1001` -> Displays **Delivered** status from SQLite DB.
   - Click chip `ORD-9999` -> Displays **Order ID Not Found** without hallucination.

---

## Quickstart & Installation

### Option 1: Local Development

```bash
# 1. Clone repository & set up Python virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows

# 2. Install backend dependencies
pip install -r backend/requirements.txt

# 3. Start FastAPI Backend (Port 8000)
cd backend
python -m uvicorn app.main:app --reload --port 8000

# 4. In a new terminal, install frontend dependencies & start React Dev Server (Port 5173)
cd frontend
npm install
npm run dev
```

Open browser at `http://localhost:5173`.

---

### Option 2: Docker Compose

```bash
docker-compose up --build
```

Access frontend at `http://localhost:5173` and API docs at `http://localhost:8000/docs`.

---

### Option 3: Vercel Deployment (Live)

The production frontend and serverless API are deployed on Vercel:

> **[https://receiptguard-ai-one.vercel.app](https://receiptguard-ai-one.vercel.app)**

To deploy your own:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel --prod
```

---

## Running Automated Tests

```bash
cd backend
..\venv\Scripts\python.exe -m pytest tests/ -v
```

Tests cover:
- Deterministic return date calculations (5 days expiring soon, 7 days normal, 6 days expiring soon, 0 days, negative days).
- Valid order lookups (`ORD-1001`).
- Unknown order lookups (`ORD-9999`).
- Shopper isolation security checks.

---

## API Endpoints

- `GET /api/health` - Health check & Ollama connection status.
- `POST /api/receipts/upload` - Upload receipt file (PDF, PNG, JPG, TXT).
- `POST /api/receipts/demo-seed` - Trigger 60-second judge demo flow.
- `GET /api/receipts/{receipt_id}/summary` - Fetch proactive purchase protection summary.
- `POST /api/chat` - RAG Q&A assistant grounded in uploaded receipt and policy.
- `POST /api/orders/status` - Query mock order database by Order ID.
- `GET /api/audit/{receipt_id}` - Retrieve audit trail log.
