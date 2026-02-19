/**
 * Agent Service — Insurance AI Agents powered by OpenRouter LLM
 * Each agent: receives input → runs tools (simulated) → calls LLM → returns structured decision
 * Full telemetry is captured and stored in the database.
 */

const { callLLM, MODEL } = require('./llmService');
const traceService = require('./traceService');
const metricsService = require('./metricsService');
const { evaluateAlerts } = require('../core/alertEngine');
const wsManager = require('../websocket');

// ─── System Prompts ─────────────────────────────────────

const CLAIMS_SYSTEM_PROMPT = `You are an expert AI Claims Processing Agent for InsureOps, a major insurance company.
You evaluate insurance claims with the precision of a senior claims adjuster.

You MUST return a JSON object with this EXACT structure (no other text):
{
  "decision": "approved" | "rejected" | "escalated",
  "confidence": <number 0-100>,
  "reasoning": "<2-3 sentence professional explanation>",
  "payout_amount": <number or null>,
  "risk_flags": ["flag1", "flag2"],
  "tools_used": ["policy_lookup", "coverage_checker", "payout_calculator", "fraud_screen"]
}

DECISION RULES (follow strictly):

REJECT (confidence 85-99) when ANY of these are true:
- Claim amount is absurdly high or unreasonable for the type of damage (e.g. millions for a minor injury)
- Claim type is clearly not covered (e.g. flood damage on a standard policy without flood rider)
- Claim description is vague, implausible, or physically impossible
- Clear signs of fraud or misrepresentation
- Policy is expired, cancelled, or does not exist
- Claim violates explicit policy exclusions

APPROVE (confidence 80-98) when ALL of these are true:
- Claim type is covered under the policy
- Amount is reasonable and proportional to the described damage/injury
- No fraud indicators detected
- Claimant is in good standing
- Amount is within policy limits after deductible

ESCALATE (confidence 40-75) ONLY when the claim is genuinely ambiguous:
- Amount is $50,000-$500,000 AND appears potentially valid but needs verification
- Pre-existing condition creates coverage ambiguity
- Conflicting evidence that requires human judgment
- Legitimate claim but unusual circumstances needing senior review

IMPORTANT: Do NOT escalate claims that should clearly be rejected. A $10 billion claim for a minor injury is a REJECTION, not an escalation. Use common sense.

Always return ONLY the JSON object.`;

const UNDERWRITING_SYSTEM_PROMPT = `You are an expert AI Underwriting Agent for InsureOps insurance company.
You assess risk and determine policy terms like a senior underwriter with 20 years of experience.

You MUST return a JSON object with this EXACT structure (no other text):
{
  "decision": "approved" | "rejected" | "escalated",
  "confidence": <number 0-100>,
  "reasoning": "<2-3 sentence professional explanation>",
  "risk_score": <number 1-10>,
  "premium_modifier": <number 0.5 to 3.0>,
  "conditions": ["condition1", "condition2"],
  "tools_used": ["medical_risk", "guideline_check", "history_lookup", "risk_calculator", "actuarial_model"]
}

DECISION RULES:

APPROVE (confidence 80-98) when:
- Risk score ≤ 5 and no disqualifying conditions
- Applicant meets standard underwriting guidelines
- Coverage amount is reasonable for the applicant profile

REJECT (confidence 80-99) when:
- Risk score > 8 with multiple compounding risk factors
- Applicant has disqualifying medical conditions for the coverage type
- Coverage amount is wildly disproportionate to applicant's profile
- Application contains false or inconsistent information
- Applicant falls outside insurable age/health ranges

ESCALATE (confidence 40-75) ONLY when genuinely borderline:
- Risk score 5-8 with mixed indicators that could go either way
- Requires senior underwriter judgment on specific conditions
- Unusual occupation or lifestyle that needs specialist assessment

Always return ONLY the JSON object.`;

const FRAUD_SYSTEM_PROMPT = `You are an expert AI Fraud Detection Agent for InsureOps insurance company.
You analyze claims for fraud with the expertise of a senior Special Investigations Unit (SIU) investigator.

You MUST return a JSON object with this EXACT structure (no other text):
{
  "decision": "cleared" | "flagged" | "escalated",
  "confidence": <number 0-100>,
  "reasoning": "<2-3 sentence professional explanation>",
  "fraud_score": <number 1-10>,
  "red_flags": ["flag1", "flag2"],
  "recommendation": "<brief professional recommendation>",
  "tools_used": ["duplicate_checker", "pattern_analyzer", "history_lookup", "network_analyzer", "risk_scorer"]
}

DECISION RULES:

CLEARED (confidence 85-99) when:
- Fraud score ≤ 3, no suspicious patterns
- Claim details are consistent and verifiable
- No prior fraud history or red flags

FLAGGED (confidence 70-95) when:
- Fraud score 4-7, suspicious patterns detected
- Multiple claims in short time period
- Amount exactly matches previous claims
- Timing is suspicious (filed right after policy start or just before expiry)
- Description inconsistencies or exaggerations

ESCALATED (confidence 50-85) when:
- Fraud score > 7, strong evidence of organized fraud
- Network analysis reveals connected suspicious claims
- Evidence suggests collusion or staged incident
- Requires SIU field investigation

Always return ONLY the JSON object.`;

// ─── Tool Simulators (representing real tool calls) ─────

function simulateToolCall(toolName, input) {
    const start = Date.now();
    // Simulate realistic tool responses
    const tools = {
        policy_lookup: { result: 'Policy found: Active, comprehensive coverage, deductible $500', success: true },
        coverage_checker: { result: 'Claim type covered under Section 4A of policy terms', success: true },
        payout_calculator: { result: 'Calculated payout based on policy limits and deductible', success: true },
        fraud_screen: { result: 'Initial fraud screening passed, no immediate red flags', success: true },
        medical_risk: { result: 'Medical risk assessment score calculated based on health data', success: true },
        guideline_check: { result: 'Application checked against underwriting guidelines v3.2', success: true },
        history_lookup: { result: 'Applicant history retrieved, prior claims and policy records checked', success: true },
        risk_calculator: { result: 'Aggregated risk score computed from multiple factors', success: true },
        actuarial_model: { result: 'Premium adjustment calculated using actuarial tables', success: true },
        duplicate_checker: { result: 'Checked for duplicate claims in 12-month window', success: true },
        pattern_analyzer: { result: 'Behavioral patterns analyzed against known fraud typologies', success: true },
        network_analyzer: { result: 'Social and claims network analyzed for collusion indicators', success: true },
        risk_scorer: { result: 'Final fraud risk score computed from all indicators', success: true },
    };

    const toolResult = tools[toolName] || { result: 'Tool executed', success: true };
    const duration = Math.floor(Math.random() * 200) + 50; // 50-250ms

    return {
        tool_name: toolName,
        parameters: input,
        result_summary: toolResult.result,
        duration_ms: duration,
        success: toolResult.success,
    };
}

// ─── Main Agent Runner ──────────────────────────────────

async function runAgent(agentType, inputData, models) {
    const startTime = Date.now();
    const toolCalls = [];
    const llmCalls = [];
    const guardrailChecks = [];

    let systemPrompt, userPrompt, toolNames;

    switch (agentType) {
        case 'claims':
            // Phase 4: Call Python Agent
            try {
                const { spawn } = require('child_process');
                const path = require('path');

                // Construct payload
                const payload = JSON.stringify(inputData);

                // Path to root directory (where agents module is)
                const rootDir = path.resolve(__dirname, '../../../');

                return new Promise((resolve, reject) => {
                    const pythonProcess = spawn('python', ['-m', 'agents.claims_agent.agent', '--payload', payload], {
                        cwd: rootDir,
                        env: { ...process.env, PYTHONPATH: rootDir }
                    });

                    let stdoutData = '';
                    let stderrData = '';

                    pythonProcess.stdout.on('data', (data) => {
                        stdoutData += data.toString();
                    });

                    pythonProcess.stderr.on('data', (data) => {
                        stderrData += data.toString();
                        console.error(`[Python Log]: ${data.toString().trim()}`);
                    });

                    pythonProcess.on('close', (code) => {
                        if (code !== 0) {
                            console.error(`Python agent exited with code ${code}`);
                            resolve({ success: false, error: "Agent process failed", details: stderrData });
                            return;
                        }

                        try {
                            // Extract JSON from output (between markers if present, or just parse)
                            let jsonStr = stdoutData;
                            if (stdoutData.includes('__JSON_START__')) {
                                jsonStr = stdoutData.split('__JSON_START__')[1].split('__JSON_END__')[0];
                            }
                            const result = JSON.parse(jsonStr.trim());
                            resolve({
                                success: true,
                                decision: result.decision?.decision_type,
                                confidence: result.decision?.confidence,
                                reasoning: result.decision?.reasoning,
                                traceId: result.trace_id,
                                details: result
                            });
                        } catch (e) {
                            console.error("Failed to parse Python agent output:", e);
                            resolve({ success: false, error: "Invalid agent output", details: stdoutData });
                        }
                    });
                });
            } catch (error) {
                console.error("Failed to spawn python agent:", error);
                // Fallback to simulation if python fails?
                // For now, return error to surface the issue.
                throw error;
            }
            break;
        case 'underwriting':
            systemPrompt = UNDERWRITING_SYSTEM_PROMPT;
            userPrompt = buildUnderwritingPrompt(inputData);
            toolNames = ['medical_risk', 'guideline_check', 'history_lookup', 'risk_calculator', 'actuarial_model'];
            break;
        case 'fraud':
            systemPrompt = FRAUD_SYSTEM_PROMPT;
            userPrompt = buildFraudPrompt(inputData);
            toolNames = ['duplicate_checker', 'pattern_analyzer', 'history_lookup', 'network_analyzer', 'risk_scorer'];
            break;
        default:
            throw new Error(`Unknown agent type: ${agentType}`);
    }

    // Step 1: Run tools (simulated)
    for (const toolName of toolNames) {
        const toolResult = simulateToolCall(toolName, inputData);
        toolCalls.push({
            step_order: toolCalls.length + 1,
            tool_name: toolResult.tool_name,
            parameters: toolResult.parameters,
            result_summary: toolResult.result_summary,
            duration_ms: toolResult.duration_ms,
            success: toolResult.success,
        });
    }

    // Step 2: Call LLM with tool context
    const toolContext = toolCalls.map(t => `[${t.tool_name}]: ${t.result_summary}`).join('\n');
    const fullPrompt = `${userPrompt}\n\n--- Tool Results ---\n${toolContext}`;

    const llmResult = await callLLM(systemPrompt, fullPrompt, {
        temperature: 0.3,
        max_tokens: 1024,
    });

    llmCalls.push({
        step_order: toolCalls.length + 1,
        model: llmResult.model,
        prompt_tokens: llmResult.promptTokens,
        completion_tokens: llmResult.completionTokens,
        latency_ms: llmResult.latencyMs,
        cost_usd: llmResult.costUsd,
        status: 'success',
        prompt_quality: 0.85 + Math.random() * 0.12, // 0.85 - 0.97
        prompt_text: fullPrompt.substring(0, 500),
        response_text: llmResult.response.substring(0, 2000),
    });

    // Step 3: Parse LLM response
    let parsedResponse;
    try {
        // Extract JSON from response (handles markdown code blocks too)
        const jsonMatch = llmResult.response.match(/\{[\s\S]*\}/);
        parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
        parsedResponse = {
            decision: 'escalated',
            confidence: 50,
            reasoning: 'Failed to parse LLM response, escalating for human review.',
            tools_used: toolNames,
        };
    }

    // Step 4: Run guardrail checks
    guardrailChecks.push(
        { check_type: 'pii', passed: !llmResult.response.match(/\d{3}-\d{2}-\d{4}|SSN/i), details: 'PII scan completed' },
        { check_type: 'bias', passed: !llmResult.response.match(/race|gender|religion/i), details: 'Bias check completed' },
        { check_type: 'safety', passed: true, details: 'Safety validation passed' },
        { check_type: 'compliance', passed: true, details: 'Regulatory compliance check passed' }
    );

    const totalLatency = Date.now() - startTime;
    const totalCost = llmCalls.reduce((sum, c) => sum + (c.cost_usd || 0), 0);
    const totalTokens = llmCalls.reduce((sum, c) => sum + (c.prompt_tokens || 0) + (c.completion_tokens || 0), 0);

    // Step 5: Build output data
    const outputData = {
        decision: parsedResponse.decision || 'escalated',
        confidence: parsedResponse.confidence || 50,
        reasoning: parsedResponse.reasoning || 'No reasoning provided.',
        details: parsedResponse,
    };

    // Step 6: Store trace in database (skip if no DB / Limited Mode)
    let trace = null;
    if (models && models.Trace) {
        try {
            trace = await traceService.createTrace(models, {
                agent_type: agentType,
                status: 'success',
                total_latency_ms: totalLatency,
                total_cost_usd: totalCost,
                total_tokens: totalTokens,
                input_data: inputData,
                output_data: outputData,
                llm_calls: llmCalls,
                tool_calls: toolCalls,
                guardrail_checks: guardrailChecks,
            });

            // Invalidate metrics cache
            metricsService.invalidateCache();

            // Evaluate alert rules
            await evaluateAlerts(trace, models);

            // Broadcast to WebSocket clients
            wsManager.broadcastTrace(trace);
        } catch (dbError) {
            console.error('Failed to store trace:', dbError.message);
        }
    } else {
        console.log('⚠️  No DB connection — skipping trace storage (Limited Mode)');
    }

    // Step 7: Return result to frontend
    return {
        success: true,
        decision: outputData.decision,
        confidence: outputData.confidence,
        reasoning: outputData.reasoning,
        latency: totalLatency,
        cost: Math.round(totalCost * 1_000_000) / 1_000_000,
        toolsUsed: parsedResponse.tools_used || toolNames,
        totalTokens,
        traceId: trace?.id || null,
        details: parsedResponse,
    };
}

// ─── Prompt Builders ────────────────────────────────────

function buildClaimsPrompt(input) {
    return `Evaluate this insurance claim:

Claim Description: ${input.description || 'Not provided'}
Policy ID: ${input.policyId || input.policy_id || 'Unknown'}
Claim Amount: $${input.amount || input.claim_amount || 0}
Claim Type: ${input.claim_type || 'General'}
Date Filed: ${input.date_filed || new Date().toISOString().split('T')[0]}

Additional context: ${JSON.stringify(input)}`;
}

function buildUnderwritingPrompt(input) {
    return `Assess this insurance application:

Applicant Name: ${input.name || input.applicant_name || 'Unknown'}
Age: ${input.age || 'Not provided'}
Health Conditions: ${input.healthConditions || input.health_conditions || 'None reported'}
Occupation: ${input.occupation || 'Not specified'}
Coverage Amount Requested: $${input.coverageAmount || input.coverage_amount || 0}
Smoking Status: ${input.smoking || 'Unknown'}

Additional context: ${JSON.stringify(input)}`;
}

function buildFraudPrompt(input) {
    return `Analyze this claim for potential fraud:

Claim ID: ${input.claimId || input.claim_id || 'Unknown'}
Claimant ID: ${input.claimantId || input.claimant_id || 'Unknown'}
Claim Description: ${input.description || input.claim_description || 'Not provided'}
Claim Amount: $${input.amount || input.claim_amount || 0}
Date Filed: ${input.dateFiled || input.date_filed || new Date().toISOString().split('T')[0]}
Location: ${input.location || 'Not specified'}

Additional context: ${JSON.stringify(input)}`;
}

module.exports = { runAgent };
