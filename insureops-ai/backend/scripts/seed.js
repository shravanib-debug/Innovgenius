/**
 * Database Seed Script
 * Populates Neon DB with realistic historical data for dashboards.
 * Run: node scripts/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const { Sequelize } = require('sequelize');
const { neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const { v4: uuidv4 } = require('uuid');

// Configure Neon serverless (WebSocket — bypasses firewalls)
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env');
    process.exit(1);
}

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: require('@neondatabase/serverless'),
    logging: false,
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
});

// ─── Helpers ────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 6) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);

const agentTypes = ['claims', 'underwriting', 'fraud', 'support'];
const decisions = ['approved', 'rejected', 'escalated', 'flagged'];
const decisionWeights = { claims: [60, 15, 15, 10], underwriting: [50, 20, 20, 10], fraud: [30, 10, 20, 40], support: [70, 5, 20, 5] };

function weightedDecision(agent) {
    const weights = decisionWeights[agent];
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) return decisions[i];
    }
    return decisions[0];
}

const toolsByAgent = {
    claims: ['policy_lookup', 'coverage_checker', 'payout_calculator', 'fraud_screen'],
    underwriting: ['medical_risk', 'guideline_check', 'history_lookup', 'risk_calculator', 'actuarial_model'],
    fraud: ['duplicate_checker', 'pattern_analyzer', 'history_lookup', 'network_analyzer', 'risk_scorer'],
    support: ['knowledge_search', 'ticket_lookup', 'faq_retriever'],
};

const modelNames = ['openai/gpt-4o-mini', 'openai/gpt-4o-mini', 'openai/gpt-4o-mini'];

const reasonings = {
    approved: [
        'Claim validated against policy terms. Coverage confirmed. Auto-approved.',
        'Application meets all underwriting guidelines. Risk within acceptable limits.',
        'No fraud indicators detected. Claim cleared for processing.',
        'Standard policy coverage applies. Claim amount within deductible limits.',
    ],
    rejected: [
        'Claim falls outside policy coverage period. Pre-existing condition exclusion applies.',
        'Risk score exceeds maximum threshold. Disqualifying health conditions found.',
        'Duplicate claim detected. Previously processed under same policy.',
        'Policy lapsed 30 days before claim date. Coverage not active.',
    ],
    escalated: [
        'Claim amount exceeds auto-approval threshold. Requires senior adjuster review.',
        'Borderline risk score. Multiple factors require human underwriter assessment.',
        'Complex claim involving multiple policies. Needs cross-reference verification.',
        'High-value coverage request. Requires additional medical documentation.',
    ],
    flagged: [
        'Multiple red flags detected. Similar claims from same address in 90-day window.',
        'Suspicious pattern: claim filed within 15 days of policy inception.',
        'Network analysis reveals connection to previously flagged claimants.',
        'Anomalous claim pattern — amount and timing inconsistent with historical baseline.',
    ],
};

// ─── Seed Functions ─────────────────────────────────────

async function seedAlertRules() {
    console.log('📋 Seeding alert rules...');
    const rules = [
        { name: 'High Latency Alert', metric: 'latency', condition: 'gt', threshold: 5000, severity: 'warning', agent_type: null, enabled: true, cooldown_minutes: 5 },
        { name: 'Critical Latency', metric: 'latency_p95', condition: 'gt', threshold: 8000, severity: 'critical', agent_type: null, enabled: true, cooldown_minutes: 10 },
        { name: 'Error Rate Spike', metric: 'error_rate', condition: 'gt', threshold: 10, severity: 'critical', agent_type: null, enabled: true, cooldown_minutes: 5 },
        { name: 'Hourly Cost Limit', metric: 'cost_per_hour', condition: 'gt', threshold: 5.0, severity: 'warning', agent_type: null, enabled: true, cooldown_minutes: 60 },
        { name: 'Escalation Rate High', metric: 'escalation_rate', condition: 'gt', threshold: 30, severity: 'warning', agent_type: null, enabled: true, cooldown_minutes: 15 },
        { name: 'Guardrail Failure', metric: 'guardrail_failure_rate', condition: 'gt', threshold: 0, severity: 'critical', agent_type: null, enabled: true, cooldown_minutes: 1 },
        { name: 'Claims High Latency', metric: 'latency', condition: 'gt', threshold: 4000, severity: 'warning', agent_type: 'claims', enabled: true, cooldown_minutes: 5 },
        { name: 'Fraud Agent Cost', metric: 'cost', condition: 'gt', threshold: 0.50, severity: 'info', agent_type: 'fraud', enabled: true, cooldown_minutes: 30 },
    ];

    for (const rule of rules) {
        await sequelize.query(
            `INSERT INTO alert_rules (id, name, description, metric, condition, threshold, severity, agent_type, enabled, cooldown_minutes, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
             ON CONFLICT DO NOTHING`,
            { bind: [uuidv4(), rule.name, `Auto-generated rule: ${rule.name}`, rule.metric, rule.condition, rule.threshold, rule.severity, rule.agent_type, rule.enabled, rule.cooldown_minutes] }
        );
    }
    console.log(`   ✅ ${rules.length} alert rules created`);
}

async function seedTraces(count = 120) {
    console.log(`📊 Seeding ${count} traces with LLM calls, tool calls, and guardrail checks...`);
    let traceCount = 0, llmCount = 0, toolCount = 0, guardrailCount = 0;

    for (let i = 0; i < count; i++) {
        const agent = pick(agentTypes);
        const decision = weightedDecision(agent);
        const confidence = decision === 'approved' ? rand(75, 98) : decision === 'rejected' ? rand(70, 95) : rand(45, 80);
        const latency = rand(800, 6000);
        const cost = randFloat(0.02, 0.25);
        const tokens = rand(400, 2200);
        const status = Math.random() > 0.05 ? 'success' : 'error';
        const reasoning = pick(reasonings[decision]);
        const createdAt = hoursAgo(rand(0, 168)); // Last 7 days

        const traceId = uuidv4();

        // Insert trace
        await sequelize.query(
            `INSERT INTO traces (id, agent_type, timestamp, total_latency, total_cost, decision_type, confidence, reasoning, escalated, status, input_data, output_data, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)`,
            {
                bind: [
                    traceId, agent, createdAt, latency, cost,
                    decision, confidence / 100, reasoning,
                    ['escalated', 'flagged'].includes(decision), status,
                    JSON.stringify({ agent_type: agent, sample: true }),
                    JSON.stringify({ decision, confidence, reasoning, tools_used: toolsByAgent[agent] }),
                    createdAt,
                ],
            }
        );
        traceCount++;

        // Insert LLM calls (1-2 per trace)
        const numLLM = rand(1, 2);
        for (let j = 0; j < numLLM; j++) {
            const pTokens = rand(200, 800);
            const cTokens = rand(100, 500);
            await sequelize.query(
                `INSERT INTO llm_calls (id, trace_id, step_order, model, prompt_tokens, completion_tokens, latency_ms, cost_usd, status, prompt_quality, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)`,
                {
                    bind: [
                        uuidv4(), traceId, toolsByAgent[agent].length + j + 1,
                        pick(modelNames), pTokens, cTokens,
                        rand(500, 3000), randFloat(0.01, 0.15),
                        Math.random() > 0.03 ? 'success' : 'error',
                        randFloat(0.70, 0.98, 2),
                        createdAt,
                    ],
                }
            );
            llmCount++;
        }

        // Insert tool calls
        const tools = toolsByAgent[agent];
        for (let j = 0; j < tools.length; j++) {
            await sequelize.query(
                `INSERT INTO tool_calls (id, trace_id, step_order, tool_name, result_summary, duration_ms, success, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
                {
                    bind: [
                        uuidv4(), traceId, j + 1, tools[j],
                        `${tools[j]} executed successfully`,
                        rand(30, 300),
                        Math.random() > 0.02,
                        createdAt,
                    ],
                }
            );
            toolCount++;
        }

        // Insert guardrail checks
        const checks = ['pii', 'bias', 'safety', 'compliance'];
        for (const check of checks) {
            const passed = check === 'pii' ? Math.random() > 0.08 : check === 'bias' ? Math.random() > 0.05 : Math.random() > 0.02;
            await sequelize.query(
                `INSERT INTO guardrail_checks (id, trace_id, check_type, passed, details, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $6)`,
                {
                    bind: [
                        uuidv4(), traceId, check, passed,
                        passed ? `${check} check passed` : `${check} violation detected`,
                        createdAt,
                    ],
                }
            );
            guardrailCount++;
        }

        // Progress indicator
        if ((i + 1) % 20 === 0) console.log(`   ... ${i + 1}/${count} traces`);
    }

    console.log(`   ✅ ${traceCount} traces, ${llmCount} LLM calls, ${toolCount} tool calls, ${guardrailCount} guardrail checks`);
}

async function seedAlerts(count = 25) {
    console.log(`🚨 Seeding ${count} alerts...`);

    const alertDescs = [
        { severity: 'critical', rule: 'Critical Latency', metric: 'latency_p95' },
        { severity: 'critical', rule: 'Error Rate Spike', metric: 'error_rate' },
        { severity: 'warning', rule: 'High Latency Alert', metric: 'latency' },
        { severity: 'warning', rule: 'Escalation Rate High', metric: 'escalation_rate' },
        { severity: 'warning', rule: 'Hourly Cost Limit', metric: 'cost_per_hour' },
        { severity: 'info', rule: 'Fraud Agent Cost', metric: 'cost' },
        { severity: 'critical', rule: 'Guardrail Failure', metric: 'guardrail_failure_rate' },
    ];

    for (let i = 0; i < count; i++) {
        const desc = pick(alertDescs);
        const agent = pick(agentTypes);
        const acked = Math.random() > 0.6;
        const createdAt = hoursAgo(rand(0, 72));

        await sequelize.query(
            `INSERT INTO alerts (id, rule_name, triggered_at, current_value, threshold_value, severity, agent_type, acknowledged, acknowledged_at, details, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)`,
            {
                bind: [
                    uuidv4(), desc.rule, createdAt,
                    randFloat(50, 200, 2), randFloat(10, 100, 2),
                    desc.severity, agent, acked,
                    acked ? new Date(createdAt.getTime() + rand(60, 3600) * 1000) : null,
                    JSON.stringify({ rule_metric: desc.metric, agent_type: agent }),
                    createdAt,
                ],
            }
        );
    }
    console.log(`   ✅ ${count} alerts created`);
}

async function seedMetricsSnapshots(count = 168) {
    console.log(`📈 Seeding ${count} metrics snapshots (1 per hour for 7 days)...`);

    const metricTypes = [
        'total_traces', 'avg_latency', 'total_cost', 'success_rate',
        'approval_rate', 'escalation_rate', 'avg_confidence',
    ];

    for (let h = 0; h < count; h++) {
        const snapshotTime = hoursAgo(h);
        for (const metric of metricTypes) {
            let value;
            switch (metric) {
                case 'total_traces': value = rand(5, 30); break;
                case 'avg_latency': value = rand(800, 4000); break;
                case 'total_cost': value = randFloat(0.5, 5.0, 4); break;
                case 'success_rate': value = randFloat(88, 99, 2); break;
                case 'approval_rate': value = randFloat(45, 75, 2); break;
                case 'escalation_rate': value = randFloat(5, 30, 2); break;
                case 'avg_confidence': value = randFloat(65, 95, 2); break;
            }

            const agent = Math.random() > 0.3 ? pick(agentTypes) : null;

            await sequelize.query(
                `INSERT INTO metrics_snapshot (id, agent_type, snapshot_time, metric_type, metric_value, metadata, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
                {
                    bind: [
                        uuidv4(), agent, snapshotTime, metric, value,
                        JSON.stringify({ source: 'seed' }),
                        snapshotTime,
                    ],
                }
            );
        }

        if ((h + 1) % 24 === 0) console.log(`   ... ${h + 1}/${count} hours`);
    }
    console.log(`   ✅ ${count * metricTypes.length} metrics snapshots created`);
}

// ─── Main ───────────────────────────────────────────────

async function main() {
    console.log('\n🌱 InsureOps AI — Database Seed\n');

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database\n');

        await seedAlertRules();
        await seedTraces(120);
        await seedAlerts(25);
        await seedMetricsSnapshots(168);

        console.log('\n🎉 Seed complete! Database populated with demo data.\n');
    } catch (error) {
        console.error('\n❌ Seed failed:', error.message);
        console.error(error.stack);
    } finally {
        await sequelize.close();
    }
}

main();
