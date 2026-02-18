const { Sequelize } = require('sequelize');
const config = require('./index');

// Use DATABASE_URL connection string (Neon, Supabase, etc.) when available,
// otherwise fall back to individual host/user/password config fields.
const databaseUrl = config.database.url;
const isCloudDB = databaseUrl && !databaseUrl.includes('localhost');

const sequelize = isCloudDB
    ? new Sequelize(databaseUrl, {
        dialect: 'postgres',
        logging: config.nodeEnv === 'development' ? console.log : false,
        pool: config.database.pool,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    })
    : new Sequelize(
        config.database.name,
        config.database.user,
        config.database.password,
        {
            host: config.database.host,
            port: config.database.port,
            dialect: 'postgres',
            logging: config.nodeEnv === 'development' ? console.log : false,
            pool: config.database.pool,
            define: {
                timestamps: true,
                underscored: true,
                freezeTableName: true
            }
        }
    );

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connected successfully');
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        throw error;
    }
}

module.exports = { sequelize, testConnection };
