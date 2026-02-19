const { Sequelize } = require('sequelize');
const config = require('../backend/src/config');
const { neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure Neon
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;

async function checkDatabase() {
    console.log('🔌 Connecting to database...');

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
        // Try to read from .env if not in process.env (for local run)
        require('dotenv').config({ path: '../backend/.env' });
    }

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is missing!');
        return;
    }

    const sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectModule: require('@neondatabase/serverless'),
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Connection successful.');

        const [results] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('\n📊 Tables in database:');
        const tableNames = results.map(r => r.table_name);
        if (tableNames.length === 0) {
            console.log('   (No tables found)');
        } else {
            tableNames.forEach(t => console.log(`   - ${t}`));
        }

        const hasClaims = tableNames.includes('claims');
        const hasEvidence = tableNames.includes('claim_evidence');

        console.log('\nApp verification:');
        console.log(`   claims table: ${hasClaims ? '✅ Exists' : '❌ MISSING'}`);
        console.log(`   claim_evidence table: ${hasEvidence ? '✅ Exists' : '❌ MISSING'}`);

    } catch (error) {
        console.error('❌ Error checking database:', error);
    } finally {
        await sequelize.close();
    }
}

checkDatabase();
