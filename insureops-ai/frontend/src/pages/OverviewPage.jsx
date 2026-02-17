import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Eye, MousePointerClick, UserPlus, Users,
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
    Clock, AlertTriangle, CheckCircle, XCircle,
    Bug, Zap, ShieldCheck, Bot, ChevronDown
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getOverviewMetrics, getRecentTraces, getActiveAlerts, getAgentStatus } from '../services/api';

// ─── Chart mock data (used when API has no trend data) ──
const chartData = [
    { month: 'Jan', thisYear: 12000, lastYear: 8000 },
    { month: 'Feb', thisYear: 15000, lastYear: 10000 },
    { month: 'Mar', thisYear: 18000, lastYear: 12000 },
    { month: 'Apr', thisYear: 14000, lastYear: 15000 },
    { month: 'May', thisYear: 22000, lastYear: 18000 },
    { month: 'Jun', thisYear: 28000, lastYear: 20000 },
    { month: 'Jul', thisYear: 25000, lastYear: 22000 },
    { month: 'Aug', thisYear: 30000, lastYear: 24000 },
    { month: 'Sep', thisYear: 27000, lastYear: 21000 },
    { month: 'Oct', thisYear: 32000, lastYear: 26000 },
    { month: 'Nov', thisYear: 29000, lastYear: 23000 },
    { month: 'Dec', thisYear: 35000, lastYear: 28000 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg px-3 py-2 text-xs"
                style={{ background: 'rgba(28, 24, 21, 0.95)', border: '1px solid var(--color-border)', backdropFilter: 'blur(8px)' }}>
                <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// ─── Time-ago helper ──────
function timeAgo(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

function OverviewPage() {
    const [metrics, setMetrics] = useState(null);
    const [traces, setTraces] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [agentStatus, setAgentStatus] = useState(null);
    const [timeRange, setTimeRange] = useState('24h');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [m, t, al, ag] = await Promise.all([
                getOverviewMetrics(timeRange),
                getRecentTraces(5),
                getActiveAlerts(),
                getAgentStatus()
            ]);
            setMetrics(m);
            setTraces(t);
            setAlerts(al);
            setAgentStatus(ag);
            setLoading(false);
        }
        fetchData();
    }, [timeRange]);

    const statCards = metrics ? [
        {
            label: 'Views',
            value: metrics.totalTraces?.toLocaleString() || '0',
            change: '+11.01%',
            changeType: 'up',
            icon: Eye,
            description: 'Total traces processed'
        },
        {
            label: 'Visits',
            value: metrics.avgLatency ? `${(metrics.avgLatency / 1000).toFixed(1)}s` : '0s',
            change: '-0.03%',
            changeType: 'down',
            icon: MousePointerClick,
            description: 'Average latency'
        },
        {
            label: 'New Users',
            value: metrics.activeAlerts?.toString() || '0',
            change: '+15.03%',
            changeType: 'up',
            icon: UserPlus,
            description: 'Active alerts'
        },
        {
            label: 'Active Users',
            value: metrics.successRate ? `${metrics.successRate}%` : '100%',
            change: '+6.08%',
            changeType: 'up',
            icon: Users,
            description: 'Success rate'
        },
    ] : [];

    // Traffic/agent breakdown data
    const trafficData = metrics?.agentBreakdown
        ? Object.entries(metrics.agentBreakdown).map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: count,
            percentage: Math.round((count / metrics.totalTraces) * 100)
        })).sort((a, b) => b.value - a.value)
        : [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

            {/* Page Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Overview</h1>
                </div>
                <button
                    onClick={() => setTimeRange(t => t === '24h' ? '7d' : t === '7d' ? '1h' : '24h')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/[0.05]"
                    style={{
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border)',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)'
                    }}
                >
                    {timeRange === '1h' ? 'Last Hour' : timeRange === '7d' ? 'This Week' : 'Today'}
                    <ChevronDown className="w-4 h-4" />
                </button>
            </motion.div>

            {/* ── Stat Cards Row ──────────── */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statCards.map((card, i) => (
                    <div
                        key={card.label}
                        className="glass-card glow-border rounded-2xl p-5 transition-all duration-250 hover:-translate-y-0.5 cursor-default"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                                {card.label}
                            </span>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(232, 114, 42, 0.1)' }}>
                                <card.icon className="w-4 h-4" style={{ color: '#e8722a' }} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                            {loading ? '—' : card.value}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium"
                            style={{ color: card.changeType === 'up' ? '#22c55e' : '#ef4444' }}>
                            {card.changeType === 'up'
                                ? <ArrowUpRight className="w-3.5 h-3.5" />
                                : <ArrowDownRight className="w-3.5 h-3.5" />
                            }
                            <span>{card.change}</span>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── Main Content Grid ──────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

                {/* Chart Panel (2/3) */}
                <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Total Users</h2>
                            <div className="flex items-center gap-4 mt-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#e8722a' }} />
                                    This year
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'rgba(168, 144, 112, 0.3)' }} />
                                    Last year
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-1.5 text-xs">
                            {['Total Users', 'Total Projects', 'Operating Status'].map((tab, i) => (
                                <button key={tab}
                                    className="px-3 py-1.5 rounded-md font-medium transition-all duration-150"
                                    style={{
                                        background: i === 0 ? 'rgba(232, 114, 42, 0.1)' : 'transparent',
                                        color: i === 0 ? '#f2923c' : 'var(--color-text-muted)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--font-sans)'
                                    }}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        {loading ? '—' : `${((metrics?.totalTraces || 0) * 24).toLocaleString()}`}
                    </div>

                    <div className="h-52 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradThisYear" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#e8722a" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#e8722a" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradLastYear" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#a89070" stopOpacity={0.1} />
                                        <stop offset="100%" stopColor="#a89070" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                                    tickFormatter={v => `${Math.round(v / 1000)}K`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="lastYear" name="Last Year" stroke="rgba(168, 144, 112, 0.3)" strokeWidth={2}
                                    fill="url(#gradLastYear)" dot={false} />
                                <Area type="monotone" dataKey="thisYear" name="This Year" stroke="#e8722a" strokeWidth={2.5}
                                    fill="url(#gradThisYear)" dot={false} activeDot={{ r: 4, fill: '#e8722a', stroke: '#1c1815', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Traffic by Agent Panel (1/3) */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
                    <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                        Traffic by Website
                    </h2>
                    <div className="space-y-4">
                        {(trafficData.length > 0 ? trafficData : [
                            { name: 'Google', value: 342, percentage: 45 },
                            { name: 'YouTube', value: 287, percentage: 30 },
                            { name: 'Instagram', value: 198, percentage: 15 },
                            { name: 'Pinterest', value: 120, percentage: 10 },
                        ]).map((item) => (
                            <div key={item.name}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                        {item.name}
                                    </span>
                                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                                        {item.value?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-full h-2 rounded-full overflow-hidden"
                                    style={{ background: 'rgba(168, 144, 112, 0.08)' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percentage}%` }}
                                        transition={{ duration: 0.8, delay: 0.3 }}
                                        className="h-full rounded-full"
                                        style={{ background: 'linear-gradient(90deg, #e8722a, #f2923c)' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Bottom panels ──────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Notifications Panel */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            Notifications
                        </h2>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(232, 114, 42, 0.1)', color: '#f2923c' }}>
                            {alerts.length} new
                        </span>
                    </div>
                    <div className="space-y-3">
                        {(alerts.length > 0 ? alerts : []).map((alert, i) => (
                            <div key={alert.id || i} className="flex items-start gap-3 p-3 rounded-xl transition-colors duration-150 hover:bg-white/[0.02]"
                                style={{ border: '1px solid var(--color-border-light)' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{
                                        background: alert.severity === 'critical' ? 'var(--color-error-bg)' : 'var(--color-warning-bg)',
                                    }}>
                                    {alert.severity === 'critical'
                                        ? <XCircle className="w-4 h-4" style={{ color: 'var(--color-error)' }} />
                                        : <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                        {alert.name || 'Alert'}
                                    </p>
                                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                                        {alert.agent_type ? `${alert.agent_type} agent` : ''} {alert.current_value && alert.threshold ? `— ${alert.current_value} > ${alert.threshold}` : ''}
                                    </p>
                                </div>
                                <span className="text-[10px] whitespace-nowrap mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                    {timeAgo(alert.created_at)}
                                </span>
                            </div>
                        ))}
                        {alerts.length === 0 && (
                            <div className="text-center py-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                No active alerts
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Activities Panel */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            Activities
                        </h2>
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                            Recent traces
                        </span>
                    </div>
                    <div className="space-y-3">
                        {traces.map((trace, i) => {
                            const agentIcons = { claims: Zap, fraud: AlertTriangle, underwriting: ShieldCheck, support: Bot };
                            const AgentIcon = agentIcons[trace.agent_type] || Bot;
                            const decisionColors = {
                                approved: '#22c55e', rejected: '#ef4444', escalated: '#eab308', flagged: '#f97316'
                            };

                            return (
                                <div key={trace.id} className="flex items-start gap-3 p-3 rounded-xl transition-colors duration-150 hover:bg-white/[0.02]"
                                    style={{ border: '1px solid var(--color-border-light)' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                        style={{ background: 'rgba(232, 114, 42, 0.1)' }}>
                                        <AgentIcon className="w-4 h-4" style={{ color: '#e8722a' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                            {trace.agent_type?.charAt(0).toUpperCase()}{trace.agent_type?.slice(1)} Agent
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                            <span className="font-mono text-[10px]" style={{ color: 'var(--color-accent-light)', opacity: 0.7 }}>
                                                {trace.id?.slice(0, 8)}
                                            </span>
                                            {trace.decision && (
                                                <span className="ml-2 font-medium" style={{ color: decisionColors[trace.decision] || 'var(--color-text-muted)' }}>
                                                    {trace.decision}
                                                </span>
                                            )}
                                            <span className="ml-2">${(trace.total_cost_usd || 0).toFixed(3)}</span>
                                        </p>
                                    </div>
                                    <span className="text-[10px] whitespace-nowrap mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                        {timeAgo(trace.created_at)}
                                    </span>
                                </div>
                            );
                        })}
                        {traces.length === 0 && (
                            <div className="text-center py-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                <Bot className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                No recent traces
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default OverviewPage;
