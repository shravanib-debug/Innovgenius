const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: false });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const config = require('./src/config');
const { sequelize, testConnection } = require('./src/config/database');
const { registerRoutes } = require('./src/routes');
const wsManager = require('./src/websocket');
const models = require('./src/models');

const app = express();
const server = createServer(app);

// ─── Middleware ────────────────────────────────────────
app.use(helmet());
const allowedOrigins = config.frontendUrl
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, health checks)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── Make models accessible in routes via app.locals ──
app.locals.models = models;

// ─── Health Check ─────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'InsureOps AI Backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        websocket: wsManager.getStats()
    });
});

// ─── API Info ─────────────────────────────────────────
app.get('/api', (req, res) => {
    res.json({
        message: 'InsureOps AI API',
        version: '1.0.0',
        endpoints: {
            metrics: '/api/metrics',
            traces: '/api/traces',
            agents: '/api/agents',
            alerts: '/api/alerts',
            telemetry: '/api/telemetry'
        }
    });
});

// ─── Register API Routes ─────────────────────────────
registerRoutes(app);

// ─── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(err.status || 500).json({
        error: config.nodeEnv === 'development' ? err.message : 'Internal server error'
    });
});

// ─── Start Server ─────────────────────────────────────
async function startServer() {
    try {
        // Test database connection
        await testConnection();

        // Sync Sequelize models (creates tables if they don't exist)
        await sequelize.sync({ alter: false });
        console.log('📦 Database models synced');

        // Initialize WebSocket server
        wsManager.init(server);

        // Start HTTP server
        server.listen(config.port, () => {
            console.log(`\n🛡️  InsureOps AI Backend`);
            console.log(`   Server:      http://localhost:${config.port}`);
            console.log(`   Health:      http://localhost:${config.port}/health`);
            console.log(`   API:         http://localhost:${config.port}/api`);
            console.log(`   WebSocket:   ws://localhost:${config.port}/ws`);
            console.log(`   Environment: ${config.nodeEnv}\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        console.log('⚠️  Starting in limited mode (no database)...');

        // Start anyway for API endpoints that don't need DB
        wsManager.init(server);
        server.listen(config.port, () => {
            console.log(`\n🛡️  InsureOps AI Backend (Limited Mode — No DB)`);
            console.log(`   Server:      http://localhost:${config.port}`);
            console.log(`   WebSocket:   ws://localhost:${config.port}/ws\n`);
        });
    }
}

startServer();

module.exports = { app, server };
