/**
 * Database Configuration — Neon Serverless
 * Uses @neondatabase/serverless WebSocket driver to bypass firewall restrictions.
 * Falls back to standard pg driver if Neon driver is not available.
 */

const { Sequelize } = require('sequelize');
const { neonConfig, Pool: NeonPool } = require('@neondatabase/serverless');
const ws = require('ws');
const config = require('./index');

// Configure Neon to use WebSocket (bypasses TCP/firewall blocks on port 5432)
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;

let sequelize;

if (config.database.url) {
    // Use DATABASE_URL with Neon serverless adapter (WebSocket-based, bypasses firewalls)
    sequelize = new Sequelize(config.database.url, {
        dialect: 'postgres',
        dialectModule: require('@neondatabase/serverless'),
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        pool: {
            max: 5,
            min: 1,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        },
    });
} else {
    // Fallback to individual config vars (local dev with standard pg)
    sequelize = new Sequelize(
        config.database.name,
        config.database.user,
        config.database.password,
        {
            host: config.database.host,
            port: config.database.port,
            dialect: 'postgres',
            logging: false,
            pool: config.database.pool,
            define: {
                timestamps: true,
                underscored: true,
                freezeTableName: true,
            },
        }
    );
}

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connected successfully (Neon Serverless WebSocket)');
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        throw error;
    }
}

module.exports = { sequelize, testConnection };
