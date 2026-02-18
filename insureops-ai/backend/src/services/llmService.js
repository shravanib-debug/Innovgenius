/**
 * LLM Service — OpenRouter Integration
 * Calls OpenRouter API with insurance-specific prompts, tracks tokens and cost.
 */

const config = require('../config');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY || '';
const MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

// Cost per 1M tokens (approx for gpt-4o-mini via OpenRouter)
const COST_PER_1M_INPUT = 0.15;
const COST_PER_1M_OUTPUT = 0.60;

/**
 * Call OpenRouter API
 * @param {string} systemPrompt — system-level instruction
 * @param {string} userPrompt   — user-level input
 * @param {object} options      — temperature, max_tokens, etc.
 * @returns {{ response, promptTokens, completionTokens, latencyMs, costUsd, model }}
 */
async function callLLM(systemPrompt, userPrompt, options = {}) {
    const {
        temperature = 0.3,
        max_tokens = 1024,
        response_format = undefined,
    } = options;

    const startTime = Date.now();

    const body = {
        model: MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens,
    };

    if (response_format) {
        body.response_format = response_format;
    }

    const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://insureops.ai',
            'X-Title': 'InsureOps AI',
        },
        body: JSON.stringify(body),
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`OpenRouter API error (${res.status}): ${errorBody}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const usage = data.usage || {};

    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const costUsd = (promptTokens / 1_000_000) * COST_PER_1M_INPUT +
        (completionTokens / 1_000_000) * COST_PER_1M_OUTPUT;

    return {
        response: choice?.message?.content || '',
        promptTokens,
        completionTokens,
        latencyMs,
        costUsd: Math.round(costUsd * 1_000_000) / 1_000_000,
        model: data.model || MODEL,
        finishReason: choice?.finish_reason || 'stop',
    };
}

module.exports = { callLLM, MODEL };
