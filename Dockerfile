# Multi-stage Docker build for Fullstack ReceiptGuard AI (FastAPI + React)
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Copy built frontend assets from Stage 1 into the backend distribution path
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

ENV PORT=8000
ENV DEMO_MODE=true
ENV STORAGE_PROVIDER=local
ENV AI_PROVIDER=deterministic
ENV IS_SERVERLESS=false

EXPOSE 8000

CMD ["sh", "-c", "uvicorn api.index:app --host 0.0.0.0 --port $PORT"]
