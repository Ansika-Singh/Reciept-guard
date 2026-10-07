# RECEIPTGUARD AI
> **"Don't just store your receipt. Protect what you already bought."**

ReceiptGuard AI is a Personal Purchase Protection Agent built for responsible, grounded AI hackathon evaluation. Immediately at ingestion, ReceiptGuard parses receipts, matches store return and warranty policies, performs deterministic date arithmetic (`purchase_date + policy_days`), flags return windows expiring soon (`< 7 days`), grounds RAG Q&A, and verifies order status directly against the database truth without LLM hallucinations.

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
- **Testing**: Pytest unit test suite covering date arithmetic, order lookups, and security isolation.
- **Deployment**: Docker, Docker Compose, Nginx.

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
