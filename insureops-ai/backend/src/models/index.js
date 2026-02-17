const { Trace, LLMCall, ToolCall, GuardrailCheck, AlertRule, Alert, MetricsSnapshot } = require('./models');

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

module.exports = {
    Trace,
    LLMCall,
    ToolCall,
    GuardrailCheck,
    AlertRule,
    Alert,
    MetricsSnapshot
};
