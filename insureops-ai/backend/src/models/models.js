const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ─── Trace Model ──────────────────────────────────────
const Trace = sequelize.define('Trace', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    agent_type: {
        type: DataTypes.ENUM('claims', 'underwriting', 'fraud', 'support'),
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    total_latency: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    total_cost: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
        defaultValue: 0
    },
    decision_type: {
        type: DataTypes.ENUM('approved', 'rejected', 'escalated', 'flagged'),
        allowNull: true
    },
    confidence: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    reasoning: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    escalated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    human_override: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    human_decision: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('success', 'error', 'pending'),
        defaultValue: 'success'
    },
    input_data: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    output_data: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    // ─── v2 Verification Columns ─────────────────────
    insurance_type: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    claim_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'claims', key: 'id' }
    },
    verification_steps_executed: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    missing_documents: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    evidence_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    evidence_completeness_score: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    verification_latency: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    evidence_used_in_decision: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    tableName: 'traces',
    timestamps: true,
    underscored: true
});

// ─── LLM Call Model ───────────────────────────────────
const LLMCall = sequelize.define('LLMCall', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    trace_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'traces', key: 'id' }
    },
    step_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    model: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    prompt_tokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    completion_tokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    latency_ms: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    cost_usd: {
        type: DataTypes.DECIMAL(10, 6),
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING(10),
        defaultValue: 'success'
    },
    prompt_quality: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    prompt_text: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    response_text: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'llm_calls',
    timestamps: true,
    underscored: true
});

// ─── Tool Call Model ──────────────────────────────────
const ToolCall = sequelize.define('ToolCall', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    trace_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'traces', key: 'id' }
    },
    step_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    tool_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    parameters: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    result_summary: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    duration_ms: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    success: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'tool_calls',
    timestamps: true,
    underscored: true
});

// ─── Guardrail Check Model ───────────────────────────
const GuardrailCheck = sequelize.define('GuardrailCheck', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    trace_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'traces', key: 'id' }
    },
    check_type: {
        type: DataTypes.ENUM('pii', 'bias', 'safety', 'compliance'),
        allowNull: false
    },
    passed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'guardrail_checks',
    timestamps: true,
    underscored: true
});

// ─── Alert Rule Model ────────────────────────────────
const AlertRule = sequelize.define('AlertRule', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    metric: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    condition: {
        type: DataTypes.ENUM('gt', 'lt', 'eq', 'gte', 'lte'),
        allowNull: false
    },
    threshold: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: false
    },
    severity: {
        type: DataTypes.ENUM('info', 'warning', 'critical', 'investigation'),
        allowNull: false
    },
    agent_type: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    cooldown_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    }
}, {
    tableName: 'alert_rules',
    timestamps: true,
    underscored: true
});

// ─── Alert Model ─────────────────────────────────────
const Alert = sequelize.define('Alert', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    rule_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'alert_rules', key: 'id' }
    },
    rule_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    triggered_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    current_value: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true
    },
    threshold_value: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true
    },
    severity: {
        type: DataTypes.ENUM('info', 'warning', 'critical', 'investigation'),
        allowNull: false
    },
    agent_type: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    acknowledged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    acknowledged_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resolved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    tableName: 'alerts',
    timestamps: true,
    underscored: true
});

// ─── Metrics Snapshot Model ──────────────────────────
const MetricsSnapshot = sequelize.define('MetricsSnapshot', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    agent_type: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    snapshot_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    metric_type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    metric_value: {
        type: DataTypes.DECIMAL(12, 4),
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    tableName: 'metrics_snapshot',
    timestamps: true,
    underscored: true
});

// ─── Claim Model ─────────────────────────────────────
const Claim = sequelize.define('Claim', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    policy_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    insurance_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['health', 'life', 'vehicle', 'travel', 'property']]
        }
    },
    claim_type: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    incident_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    claim_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'in_review', 'approved', 'rejected', 'escalated']]
        }
    },
    verification_status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'not_started',
        validate: {
            isIn: [['not_started', 'in_progress', 'complete', 'failed']]
        }
    },
    evidence_completeness_score: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    type_specific_data: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    tableName: 'claims',
    timestamps: true,
    underscored: true
});

// ─── Claim Evidence Model ────────────────────────────
const ClaimEvidence = sequelize.define('ClaimEvidence', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    claim_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'claims', key: 'id' }
    },
    file_url: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    file_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    file_type: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
            isIn: [['pdf', 'jpg', 'png']]
        }
    },
    file_size_bytes: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    evidence_category: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    insurance_type: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    uploaded_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'claim_evidence',
    timestamps: true,
    underscored: true
});

module.exports = {
    Trace,
    LLMCall,
    ToolCall,
    GuardrailCheck,
    AlertRule,
    Alert,
    MetricsSnapshot,
    Claim,
    ClaimEvidence
};
