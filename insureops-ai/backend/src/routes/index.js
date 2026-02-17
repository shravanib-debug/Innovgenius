/**
 * Route Registration
 * Mounts all API route modules onto the Express app.
 */

const metricsRoutes = require('./metrics');
const tracesRoutes = require('./traces');
const agentsRoutes = require('./agents');
const alertsRoutes = require('./alerts');
const telemetryRoutes = require('./telemetry');

function registerRoutes(app) {
    app.use('/api/metrics', metricsRoutes);
    app.use('/api/traces', tracesRoutes);
    app.use('/api/agents', agentsRoutes);
    app.use('/api/alerts', alertsRoutes);
    app.use('/api/telemetry', telemetryRoutes);

    console.log('🛤️  API routes registered:');
    console.log('   /api/metrics     — Dashboard metrics');
    console.log('   /api/traces      — Trace explorer');
    console.log('   /api/agents      — Agent triggers');
    console.log('   /api/alerts      — Alert management');
    console.log('   /api/telemetry   — Telemetry ingestion');
}

module.exports = { registerRoutes };
