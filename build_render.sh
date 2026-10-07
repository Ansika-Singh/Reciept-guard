#!/usr/bin/env bash
set -e

echo "=== ReceiptGuard AI: Render Build Started ==="

# 1. Ensure Node.js and npm are available in userland if not already present
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found in system path. Installing standalone Node.js v20..."
  mkdir -p /tmp/node20
  curl -fsSL https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz | tar -xJ --strip-components=1 -C /tmp/node20
  export PATH="/tmp/node20/bin:$PATH"
fi

echo "Node version: $(node -v)"
echo "NPM version:  $(npm -v)"

# 2. Build the React Frontend
echo "Building React frontend with Vite..."
cd frontend
npm install
npm run build
cd ..

# 3. Install Python Dependencies
echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "=== ReceiptGuard AI: Render Build Completed Successfully ==="
