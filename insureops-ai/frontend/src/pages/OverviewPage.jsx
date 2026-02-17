import {
    Activity,
    Clock,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    Zap,
    Bot,
    ShieldCheck,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import './OverviewPage.css';

// Demo KPI data (will be replaced with API data in Phase 4+)
const kpiData = [
    {
        label: 'Total Traces (24h)',
        value: '1,247',
        trend: '+12%',
        trendDirection: 'up',
        icon: Activity,
        color: 'blue'
    },
    {
        label: 'Avg Latency',
        value: '2.4s',
        trend: '-8%',
        trendDirection: 'down',
        icon: Clock,
        color: 'teal'
    },
    {
        label: 'Total Cost (Today)',
        value: '$34.52',
        trend: '+5%',
        trendDirection: 'up',
        icon: DollarSign,
        color: 'orange'
    },
    {
        label: 'Active Alerts',
        value: '3',
        trend: '+2',
        trendDirection: 'up',
        icon: AlertTriangle,
        color: 'red'
    },
    {
        label: 'Overall Accuracy',
        value: '87.3%',
        trend: '+1.2%',
        trendDirection: 'up',
        icon: TrendingUp,
        color: 'green'
    }
];

const agentStatus = [
    {
        name: 'Claims Agent',
        status: 'healthy',
        traces: 342,
        accuracy: '89%',
        latency: '2.3s',
        icon: Zap
    },
    {
        name: 'Underwriting Agent',
        status: 'warning',
        traces: 287,
        accuracy: '84%',
        latency: '3.1s',
        icon: ShieldCheck
    },
    {
        name: 'Fraud Detection',
        status: 'healthy',
        traces: 198,
        accuracy: '91%',
        latency: '2.8s',
        icon: AlertTriangle
    },
    {
        name: 'Customer Support',
        status: 'healthy',
        traces: 420,
        accuracy: '93%',
        latency: '0.9s',
        icon: Bot
    }
];

function OverviewPage() {
    return (
        <div className="page-container animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p>Real-time monitoring of all AI systems and agents</p>
                </div>
                <div className="header-actions">
                    <span className="last-updated">
                        <Clock size={14} />
                        Last updated: just now
                    </span>
                </div>
            </div>

            {/* KPI Row */}
            <div className="kpi-row">
                {kpiData.map((kpi) => (
                    <div key={kpi.label} className={`kpi-card kpi-${kpi.color}`}>
                        <div className="kpi-card-header">
                            <span className="kpi-label">{kpi.label}</span>
                            <div className={`kpi-icon kpi-icon-${kpi.color}`}>
                                <kpi.icon size={18} />
                            </div>
                        </div>
                        <div className="kpi-value">{kpi.value}</div>
                        <div className={`kpi-trend ${kpi.trendDirection === 'up' && kpi.color !== 'red' ? 'up' : kpi.color === 'red' ? 'down' : 'up'}`}>
                            {kpi.trendDirection === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            <span>{kpi.trend} vs yesterday</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Agent Status Grid */}
            <div className="section-header">
                <h2>Agent Health Status</h2>
                <p>Real-time health of all insurance AI agents</p>
            </div>

            <div className="agent-grid">
                {agentStatus.map((agent) => (
                    <div key={agent.name} className="agent-card card">
                        <div className="agent-card-header">
                            <div className="agent-info">
                                <div className={`agent-icon agent-icon-${agent.status}`}>
                                    <agent.icon size={20} />
                                </div>
                                <div>
                                    <h3>{agent.name}</h3>
                                    <span className={`badge badge-${agent.status === 'healthy' ? 'success' : 'warning'}`}>
                                        {agent.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="agent-metrics">
                            <div className="agent-metric">
                                <span className="agent-metric-label">Traces (24h)</span>
                                <span className="agent-metric-value">{agent.traces}</span>
                            </div>
                            <div className="agent-metric">
                                <span className="agent-metric-label">Accuracy</span>
                                <span className="agent-metric-value">{agent.accuracy}</span>
                            </div>
                            <div className="agent-metric">
                                <span className="agent-metric-label">Avg Latency</span>
                                <span className="agent-metric-value">{agent.latency}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Insights */}
            <div className="section-header" style={{ marginTop: 'var(--spacing-xl)' }}>
                <h2>Recent Activity</h2>
                <p>Latest agent executions and alerts</p>
            </div>

            <div className="widget-grid-2">
                {/* Recent Traces */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Recent Traces</span>
                        <a href="/traces" className="btn btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>
                            View All →
                        </a>
                    </div>
                    <div className="recent-traces-list">
                        {[
                            { id: 'TR-001', agent: 'Claims', decision: 'approved', latency: '2.3s', cost: '$0.035', time: '2 min ago' },
                            { id: 'TR-002', agent: 'Fraud', decision: 'flagged', latency: '3.5s', cost: '$0.052', time: '5 min ago' },
                            { id: 'TR-003', agent: 'Underwriting', decision: 'escalated', latency: '4.1s', cost: '$0.055', time: '8 min ago' },
                            { id: 'TR-004', agent: 'Support', decision: 'approved', latency: '0.9s', cost: '$0.012', time: '12 min ago' },
                            { id: 'TR-005', agent: 'Claims', decision: 'rejected', latency: '1.9s', cost: '$0.028', time: '15 min ago' },
                        ].map((trace) => (
                            <div key={trace.id} className="trace-row">
                                <div className="trace-id">{trace.id}</div>
                                <div className="trace-agent">{trace.agent}</div>
                                <span className={`badge badge-${trace.decision === 'approved' ? 'success' :
                                        trace.decision === 'flagged' ? 'error' :
                                            trace.decision === 'escalated' ? 'warning' :
                                                'info'
                                    }`}>
                                    {trace.decision}
                                </span>
                                <div className="trace-latency">{trace.latency}</div>
                                <div className="trace-cost">{trace.cost}</div>
                                <div className="trace-time">{trace.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Alerts */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Active Alerts</span>
                        <a href="/alerts" className="btn btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>
                            View All →
                        </a>
                    </div>
                    <div className="alerts-list">
                        {[
                            { severity: 'warning', name: 'Latency Spike', agent: 'Claims', value: '5.2s > 5.0s', time: '1 hour ago' },
                            { severity: 'critical', name: 'Accuracy Drop', agent: 'Fraud', value: '76.5% < 80%', time: '3 hours ago' },
                            { severity: 'warning', name: 'High Escalation', agent: 'Underwriting', value: '55% > 50%', time: '1 day ago' },
                        ].map((alert, i) => (
                            <div key={i} className={`alert-row alert-${alert.severity}`}>
                                <div className={`alert-severity-dot alert-dot-${alert.severity}`}></div>
                                <div className="alert-content">
                                    <div className="alert-name">{alert.name}</div>
                                    <div className="alert-detail">{alert.agent} — {alert.value}</div>
                                </div>
                                <div className="alert-time">{alert.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OverviewPage;
