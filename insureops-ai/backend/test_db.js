require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize } = require('./src/config/database');

async function check() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected!\n');

        const tables = ['traces', 'llm_calls', 'tool_calls', 'guardrail_checks', 'alerts', 'alert_rules', 'metrics_snapshot'];
        for (const t of tables) {
            try {
                const [[{ count }]] = await sequelize.query(`SELECT COUNT(*) as count FROM ${t}`);
                console.log(`  ${t}: ${count} rows`);
            } catch (e) {
                console.log(`  ${t}: ERROR - ${e.message}`);
            }
        }
    } catch (e) {
        console.error('❌', e.message);
    } finally {
        await sequelize.close();
    }
}
check();
