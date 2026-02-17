/**
 * Agent Trigger Routes
 * POST /api/agents/claims/run — trigger claims agent
 * POST /api/agents/underwriting/run — trigger underwriting agent
 * POST /api/agents/fraud/run — trigger fraud agent
 * GET /api/agents/status — agent health check
 */

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

const AGENTS_DIR = path.resolve(__dirname, '..', '..', '..', 'agents');
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

/**
 * Run a Python agent as a subprocess
 */
function runPythonAgent(agentModule, inputData) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            proc.kill();
            reject(new Error('Agent timed out after 60 seconds'));
        }, 60000);

        // Build a Python script that runs the agent and prints JSON result
        const script = `
import sys, json, os
sys.path.insert(0, '${PROJECT_ROOT.replace(/\\/g, '\\\\')}')
os.environ.setdefault('OPENROUTER_API_KEY', '${process.env.OPENROUTER_API_KEY || ''}')
os.environ.setdefault('OPENROUTER_MODEL', '${process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'}')

from agents.${agentModule} import *
from agents.base_agent import load_json_data

input_data = json.loads('${JSON.stringify(inputData).replace(/'/g, "\\'")}')
result = run_${agentModule.split('.')[0]}_agent(input_data, send_telemetry=True)

# Convert to serializable format
output = {
    'trace_id': result.get('trace_id'),
    'agent_type': result.get('agent_type'),
    'decision': result.get('decision'),
    'latency_ms': result.get('latency_ms'),
    'cost_usd': result.get('cost_usd'),
    'status': 'success'
}
print('__RESULT__' + json.dumps(output))
`;

        const proc = spawn('python', ['-c', script], {
            cwd: PROJECT_ROOT,
            env: { ...process.env }
        });

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => { stdout += data.toString(); });
        proc.stderr.on('data', (data) => { stderr += data.toString(); });

        proc.on('close', (code) => {
            clearTimeout(timeout);
            if (code !== 0) {
                return reject(new Error(`Agent exited with code ${code}: ${stderr}`));
            }

            // Extract JSON result from stdout
            const resultMatch = stdout.split('__RESULT__');
            if (resultMatch.length > 1) {
                try {
                    resolve(JSON.parse(resultMatch[1].trim()));
                } catch (e) {
                    reject(new Error(`Failed to parse agent output: ${e.message}`));
                }
            } else {
                reject(new Error('No result marker found in agent output'));
            }
        });
    });
}

/**
 * POST /api/agents/claims/run
 * Body: { claim_id, policy_id, claim_type, amount, description, ... }
 */
router.post('/claims/run', async (req, res) => {
    try {
        const input = req.body;
        if (!input.claim_type || !input.amount) {
            return res.status(400).json({
                error: 'claim_type and amount are required'
            });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });

        // Run the agent asynchronously — for demo, use direct import
        const result = await runPythonAgent('claims_agent.agent', input);
        res.end(JSON.stringify({ success: true, ...result }));
    } catch (error) {
        console.error('Claims agent error:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to run claims agent', details: error.message });
        }
    }
});

/**
 * POST /api/agents/underwriting/run
 * Body: { name, age, health_conditions, occupation, coverage_amount, ... }
 */
router.post('/underwriting/run', async (req, res) => {
    try {
        const input = req.body;
        if (!input.name || !input.age) {
            return res.status(400).json({
                error: 'name and age are required'
            });
        }

        const result = await runPythonAgent('underwriting_agent.agent', input);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Underwriting agent error:', error.message);
        res.status(500).json({ error: 'Failed to run underwriting agent', details: error.message });
    }
});

/**
 * POST /api/agents/fraud/run
 * Body: { claim_id, claimant_id, claim_description, amount, ... }
 */
router.post('/fraud/run', async (req, res) => {
    try {
        const input = req.body;
        if (!input.claim_id) {
            return res.status(400).json({
                error: 'claim_id is required'
            });
        }

        const result = await runPythonAgent('fraud_agent.agent', input);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Fraud agent error:', error.message);
        res.status(500).json({ error: 'Failed to run fraud agent', details: error.message });
    }
});

/**
 * GET /api/agents/status
 * Returns health status of all agents
 */
router.get('/status', (req, res) => {
    res.json({
        agents: {
            claims: { status: 'available', type: 'claims', framework: 'langgraph' },
            underwriting: { status: 'available', type: 'underwriting', framework: 'langgraph' },
            fraud: { status: 'available', type: 'fraud', framework: 'langgraph' },
            support: { status: 'available', type: 'support', framework: 'simulator' }
        },
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
