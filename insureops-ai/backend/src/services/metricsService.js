/**
 * Metrics Service
 * Business logic layer between API routes and analytics engine.
 * Formats responses for the frontend, handles caching.
 */

const analytics = require('../core/analytics');

// Simple TTL cache (10 seconds)
const cache = new Map();
const CACHE_TTL = 10 * 1000;

function _getCached(key) {
    const entry = cache.get(key);
    if (entry && (Date.now() - entry.time) < CACHE_TTL) {
        return entry.data;
    }
    return null;
}

function _setCache(key, data) {
    cache.set(key, { data, time: Date.now() });
}

/**
 * Get overview metrics (top-level KPIs)
 */
async function getOverview(models, timerange = '24h') {
    const cacheKey = `overview_${timerange}`;
    const cached = _getCached(cacheKey);
    if (cached) return cached;

    const data = await analytics.getOverviewMetrics(models, timerange);
    _setCache(cacheKey, data);
    return data;
}

/**
 * Get Section 1 metrics (AI Application Monitoring)
 */
async function getSection1(models, timerange = '24h') {
    const cacheKey = `section1_${timerange}`;
    const cached = _getCached(cacheKey);
    if (cached) return cached;

    const data = await analytics.getSection1Metrics(models, timerange);
    _setCache(cacheKey, data);
    return data;
}

/**
 * Get Section 2 metrics (LLM Agent Monitoring)
 */
async function getSection2(models, timerange = '24h', agentFilter = null) {
    const cacheKey = `section2_${timerange}_${agentFilter || 'all'}`;
    const cached = _getCached(cacheKey);
    if (cached) return cached;

    const data = await analytics.getSection2Metrics(models, timerange, agentFilter);
    _setCache(cacheKey, data);
    return data;
}

/**
 * Get insurance-type domain metrics (v2)
 */
async function getInsuranceType(models, timerange = '24h') {
    const cacheKey = `insurance_type_${timerange}`;
    const cached = _getCached(cacheKey);
    if (cached) return cached;

    const data = await analytics.getInsuranceTypeMetrics(models, timerange);
    _setCache(cacheKey, data);
    return data;
}

/**
 * Invalidate cache (called after new trace ingestion)
 */
function invalidateCache() {
    cache.clear();
}

module.exports = {
    getOverview,
    getSection1,
    getSection2,
    getInsuranceType,
    invalidateCache
};
