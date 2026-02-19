# ── InsureOps AI Backend ──────────────────────────────────
# Hybrid Node.js + Python image
# Node.js runs the Express server; Python runs the Claims agent
# ──────────────────────────────────────────────────────────

FROM node:18-bullseye-slim

# ── Install Python 3 & pip ───────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Make python3 the default python
RUN ln -sf /usr/bin/python3 /usr/bin/python

WORKDIR /app

# ── Install Python dependencies (agents) ─────────────────
COPY agents/requirements.txt /app/agents/requirements.txt
RUN pip3 install --no-cache-dir -r /app/agents/requirements.txt

# ── Copy the agents module ───────────────────────────────
COPY agents/ /app/agents/

# ── Install Node.js dependencies (backend) ───────────────
COPY backend/package.json backend/package-lock.json /app/backend/
RUN cd /app/backend && npm ci --omit=dev

# ── Copy backend source ─────────────────────────────────
COPY backend/ /app/backend/

# ── Copy .env (will be overridden by docker-compose env) ─
# The server.js reads .env from the parent directory
COPY .env* /app/

EXPOSE 5000

# ── Start the Express server ─────────────────────────────
CMD ["node", "/app/backend/server.js"]
