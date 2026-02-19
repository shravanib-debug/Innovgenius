const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const ws = require('ws');
const { neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = ws;

async function fixSchema() {
    console.log('🔧 Fixing Database Schema (Robust Version)...');

    if (!process.env.DATABASE_URL) {
        console.log('❌ DATABASE_URL is missing!');
        return;
    }

    const sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectModule: require('@neondatabase/serverless'),
        logging: msg => console.log(`[Sequelize] ${msg}`), // Log SQL to stdout
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema_v2.sql');
        console.log(`📖 Reading schema from ${schemaPath}...`);

        let schemaSql;
        try {
            schemaSql = fs.readFileSync(schemaPath, 'utf8');
            console.log(`   Read ${schemaSql.length} bytes.`);
        } catch (err) {
            console.log(`❌ Failed to read schema file: ${err.message}`);
            return;
        }

        // Drop tables manually first
        console.log('🗑️  Dropping tables...');
        try {
            await sequelize.query('DROP TABLE IF EXISTS claim_evidence CASCADE');
            console.log('   Dropped claim_evidence');
            await sequelize.query('DROP TABLE IF EXISTS claims CASCADE');
            console.log('   Dropped claims');
        } catch (err) {
            console.log(`⚠️  Warning dropping tables: ${err.message}`);
        }

        console.log('� Applying schema SQL...');
        try {
            // Remove comments to avoid parsing issues if any? No, pg handles valid SQL.
            // But we can try to split? No, just run it.
            await sequelize.query(schemaSql);
            console.log('✅ Schema applied successfully!');
        } catch (err) {
            console.log(`❌ Failed to apply schema: ${err.message}`);
            if (err.parent) console.log(`   Parent: ${err.parent.message}`);
            if (err.original) console.log(`   Original: ${err.original.message}`);
            return;
        }

        // Validate
        const [results] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'claims'");
        console.log('\n📊 Validating columns:');
        if (results.length > 0) {
            results.forEach(r => console.log(`   - ${r.column_name} (${r.data_type})`));
            const columns = results.map(r => r.column_name);
            if (columns.includes('type_specific_data')) {
                console.log('\n✅ SUCCCESS: type_specific_data column exists!');
            } else {
                console.log('\n❌ FAILURE: type_specific_data column STILL missing!');
            }
        } else {
            console.log('   (No columns found! Table creation might have failed)');
        }

    } catch (error) {
        console.log(`❌ Fatal Check Error: ${error.message}`);
    } finally {
        await sequelize.close();
    }
}

fixSchema();
