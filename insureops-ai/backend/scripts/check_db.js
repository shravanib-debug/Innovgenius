const path = require('path');
const crypto = require('crypto');

// 1. Load env vars FIRST
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const ws = require('ws');
// Manually configure neon serverless for the app's sequelize instance if needed
// But since we are requiring the app's models, we rely on the app's config.
// However, the app's config might not use the neon serverless driver explicitly unless configured.
// Let's check if we need to patch pg or something.
// backend/src/config/database.js likely uses 'pg' or '@neondatabase/serverless'.

const { neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = ws;

async function checkDatabase() {
    console.log('🔌 Connecting to database via Sequelize models...');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is missing! Check .env file path.');
        return;
    }

    try {
        // 2. Require models AFTER env is loaded
        const { sequelize } = require('../src/config/database');
        const { Claim } = require('../src/models');

        await sequelize.authenticate();
        console.log('✅ Connection successful.');

        console.log('\n🧪 Attempting Sequelize model insert (Claim.create)...');

        // Payload that failed in the API
        const testPayload = {
            policy_id: 'POL-TEST-SEQ',
            insurance_type: 'health',
            claim_amount: 125000,
            description: 'Test claim from script',
            location: 'Script Location',
            status: 'pending',
            verification_status: 'not_started',
            evidence_completeness_score: 0.00,
            type_specific_data: {}
        };

        console.log('   Payload:', JSON.stringify(testPayload));

        const claim = await Claim.create(testPayload);
        console.log('   ✅ Sequelize Insert successful! ID:', claim.id);

        // Cleanup
        await claim.destroy();
        console.log('   🧹 Test record deleted.');

    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        if (error.errors) {
            error.errors.forEach(e => console.error(`   - ${e.message} (${e.type})`));
        }
        if (error.parent) {
            console.error('   Parent error:', error.parent.message);
        }
        if (error.stack) {
            console.error('   Stack:', error.stack.split('\n')[1]);
        }
    } finally {
        // We might not be able to close strictly if we don't have access to sequelize instance easily
        // But we imported it from models/index.js usually
        const { sequelize } = require('../src/models');
        if (sequelize) await sequelize.close();
    }
}

checkDatabase();
