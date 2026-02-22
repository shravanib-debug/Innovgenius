/**
 * Route Registration
 * Mounts all API route modules onto the Express app.
 */

const path = require('path');
const express = require('express');
const metricsRoutes = require('./metrics');
const tracesRoutes = require('./traces');
const agentsRoutes = require('./agents');
const alertsRoutes = require('./alerts');
const telemetryRoutes = require('./telemetry');
const claimsRoutes = require('./claims');
const evidenceRoutes = require('./evidence');
const complianceRoutes = require('./compliance');
const authRoutes = require('./auth');

function registerRoutes(app) {
    // ─── Static file serving for evidence uploads ────
    app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));

    // ─── API Routes ──────────────────────────────────
    app.use('/api/metrics', metricsRoutes);
    app.use('/api/traces', tracesRoutes);
    app.use('/api/agents', agentsRoutes);
    app.use('/api/alerts', alertsRoutes);
    app.use('/api/telemetry', telemetryRoutes);
    app.use('/api/claims', claimsRoutes);
    app.use('/api/claims/:id/evidence', evidenceRoutes);
    app.use('/api/compliance', complianceRoutes);
    app.use('/api/auth', authRoutes);

    console.log('🛤️  API routes registered:');
    console.log('   /api/metrics     — Dashboard metrics');
    console.log('   /api/traces      — Trace explorer');
    console.log('   /api/agents      — Agent triggers');
    console.log('   /api/alerts      — Alert management');
    console.log('   /api/telemetry   — Telemetry ingestion');
    console.log('   /api/claims      — Claims CRUD (v2)');
    console.log('   /api/claims/:id/evidence — Evidence upload (v2)');
    console.log('   /uploads         — Static evidence files');
    console.log('   /api/compliance  — Safety & compliance monitoring');
    console.log('   /api/auth        — Authentication & RBAC');
}

module.exports = { registerRoutes };

