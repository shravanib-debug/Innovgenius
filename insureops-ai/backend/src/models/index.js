const { Trace, LLMCall, ToolCall, GuardrailCheck, AlertRule, Alert, MetricsSnapshot, Claim, ClaimEvidence, ComplianceEvent } = require('./models');

// ─── Associations ─────────────────────────────────────

// Trace → LLM Calls (one-to-many)
Trace.hasMany(LLMCall, { foreignKey: 'trace_id', as: 'llm_calls', onDelete: 'CASCADE' });
LLMCall.belongsTo(Trace, { foreignKey: 'trace_id', as: 'trace' });

// Trace → Tool Calls (one-to-many)
Trace.hasMany(ToolCall, { foreignKey: 'trace_id', as: 'tool_calls', onDelete: 'CASCADE' });
ToolCall.belongsTo(Trace, { foreignKey: 'trace_id', as: 'trace' });

// Trace → Guardrail Checks (one-to-many)
Trace.hasMany(GuardrailCheck, { foreignKey: 'trace_id', as: 'guardrail_checks', onDelete: 'CASCADE' });
GuardrailCheck.belongsTo(Trace, { foreignKey: 'trace_id', as: 'trace' });

// AlertRule → Alerts (one-to-many)
AlertRule.hasMany(Alert, { foreignKey: 'rule_id', as: 'alerts', onDelete: 'SET NULL' });
Alert.belongsTo(AlertRule, { foreignKey: 'rule_id', as: 'rule' });

// ─── v2 Associations ─────────────────────────────────

// Claim → ClaimEvidence (one-to-many)
Claim.hasMany(ClaimEvidence, { foreignKey: 'claim_id', as: 'evidence', onDelete: 'CASCADE' });
ClaimEvidence.belongsTo(Claim, { foreignKey: 'claim_id', as: 'claim' });

// Claim → Trace (one-to-one: a claim produces one trace)
Claim.hasOne(Trace, { foreignKey: 'claim_id', as: 'trace' });
Trace.belongsTo(Claim, { foreignKey: 'claim_id', as: 'claim' });

// Trace → ComplianceEvent (one-to-many)
Trace.hasMany(ComplianceEvent, { foreignKey: 'trace_id', as: 'compliance_events', onDelete: 'CASCADE' });
ComplianceEvent.belongsTo(Trace, { foreignKey: 'trace_id', as: 'trace' });

module.exports = {
    Trace,
    LLMCall,
    ToolCall,
    GuardrailCheck,
    AlertRule,
    Alert,
    MetricsSnapshot,
    Claim,
    ClaimEvidence,
    ComplianceEvent
};
