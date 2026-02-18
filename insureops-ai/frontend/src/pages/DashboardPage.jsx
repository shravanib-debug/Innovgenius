import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Clock, DollarSign, AlertTriangle, Target,
    ArrowUpRight, ArrowDownRight, Zap, ShieldCheck, Bot, TrendingUp
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getOverviewMetrics, getTraces } from '../services/api';
import { useApiData } from '../hooks/useApiData';

// Mini sparkline data for KPIs
const latencySparkline = [
    { v: 1800 }, { v: 2100 }, { v: 1950 }, { v: 2300 }, { v: 2050 },
    { v: 1900 }, { v: 2200 }, { v: 2400 }, { v: 2150 }, { v: 1980 },
    { v: 2100 }, { v: 2050 },
];
const costSparkline = [
    { v: 3.2 }, { v: 4.1 }, { v: 3.8 }, { v: 5.2 }, { v: 4.6 },
    { v: 5.8 }, { v: 6.1 }, { v: 5.4 }, { v: 7.2 }, { v: 6.8 },
    { v: 7.5 }, { v: 8.1 },
];
const tracesSparkline = [
    { v: 18 }, { v: 22 }, { v: 15 }, { v: 28 }, { v: 32 },
    { v: 25 }, { v: 30 }, { v: 35 }, { v: 28 }, { v: 38 },
    { v: 42 }, { v: 45 },
];
const accuracySparkline = [
    { v: 88 }, { v: 90 }, { v: 87 }, { v: 91 }, { v: 89 },
    { v: 92 }, { v: 90 }, { v: 93 }, { v: 91 }, { v: 88 },
    { v: 90 }, { v: 91 },
];

// Agent health data
const agentHealth = [
    {
        name: 'Claims Agent',
        status: 'healthy',
        accuracy: 92.4,
        latency: '2.1s',
        tracesToday: 128,
        lastRun: '2 min ago',
        trend: +1.2,
    },
    {
        name: 'Underwriting Agent',
        status: 'warning',
        accuracy: 86.1,
        latency: '3.4s',
        tracesToday: 84,
        lastRun: '5 min ago',
        trend: -2.4,
    },
    {
        name: 'Fraud Detection Agent',
        status: 'healthy',
        accuracy: 94.7,
        latency: '4.0s',
        tracesToday: 62,
        lastRun: '8 min ago',
        trend: +0.8,
    },
    {
        name: 'Customer Support Agent',
        status: 'healthy',
        accuracy: 89.3,
        latency: '0.8s',
        tracesToday: 312,
        lastRun: '1 min ago',
        trend: +0.3,
    },
];

// Recent trace activity
const recentActivity = [
    { id: 'trc-a1b2c3', agent: 'Claims', decision: 'Approved', confidence: 0.94, latency: 2340, cost: 0.08, time: '2 min ago' },
    { id: 'trc-d4e5f6', agent: 'Fraud', decision: 'Flagged', confidence: 0.91, latency: 4120, cost: 0.15, time: '5 min ago' },
    { id: 'trc-g7h8i9', agent: 'Underwriting', decision: 'Escalated', confidence: 0.68, latency: 3890, cost: 0.12, time: '8 min ago' },
    { id: 'trc-j0k1l2', agent: 'Claims', decision: 'Rejected', confidence: 0.88, latency: 1890, cost: 0.06, time: '12 min ago' },
    { id: 'trc-m3n4o5', agent: 'Support', decision: 'Resolved', confidence: 0.95, latency: 820, cost: 0.03, time: '14 min ago' },
    { id: 'trc-p6q7r8', agent: 'Underwriting', decision: 'Approved', confidence: 0.92, latency: 2100, cost: 0.07, time: '18 min ago' },
    { id: 'trc-s9t0u1', agent: 'Fraud', decision: 'Cleared', confidence: 0.97, latency: 3200, cost: 0.11, time: '22 min ago' },
];

const decisionColors = {
    Approved: 'text-[#22c55e]',
    Rejected: 'text-[#ef4444]',
    Escalated: 'text-[#eab308]',
    Flagged: 'text-[#e8722a]',
    Resolved: 'text-[#3b82f6]',
    Cleared: 'text-[#22c55e]',
};

const decisionBgColors = {
    Approved: 'bg-[#22c55e]/10',
    Rejected: 'bg-[#ef4444]/10',
    Escalated: 'bg-[#eab308]/10',
    Flagged: 'bg-[#e8722a]/10',
    Resolved: 'bg-[#3b82f6]/10',
    Cleared: 'bg-[#22c55e]/10',
};

const statusColors = {
    healthy: { dot: 'bg-[#22c55e]', text: 'text-[#22c55e]', border: 'border-[#22c55e]/20' },
    warning: { dot: 'bg-[#eab308]', text: 'text-[#eab308]', border: 'border-[#eab308]/20' },
    critical: { dot: 'bg-[#ef4444]', text: 'text-[#ef4444]', border: 'border-[#ef4444]/20' },
};

// KPI Card with sparkline
const KPICard = ({ title, value, change, positive, icon: Icon, sparkData, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#1c1815] border border-[#2a201a] p-5 rounded-2xl relative overflow-hidden group hover:border-[#e8722a]/30 transition-all duration-300"
    >
        <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#0f0d0b] border border-[#2a201a] flex items-center justify-center">
                <Icon size={18} className={color || 'text-[#e8722a]'} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {change}
            </div>
        </div>
        <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-[#f1ebe4] mb-2">{value}</p>
        {sparkData && (
            <div className="h-8 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData}>
                        <defs>
                            <linearGradient id={`grad-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color === 'text-[#ef4444]' ? '#ef4444' : '#e8722a'} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={color === 'text-[#ef4444]' ? '#ef4444' : '#e8722a'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="v"
                            stroke={color === 'text-[#ef4444]' ? '#ef4444' : '#e8722a'}
                            strokeWidth={1.5}
                            fill={`url(#grad-${title.replace(/\s/g, '')})`}
                            dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        )}
    </motion.div>
);

const DashboardPage = () => {
    const navigate = useNavigate();
    const fetchOverview = useCallback(() => getOverviewMetrics('24h'), []);
    const { data: overview, isLive } = useApiData(fetchOverview, null, []);

    // Derive KPI values from real data (or defaults)
    const totalTraces = overview?.totalTraces ?? 0;
    const avgLatency = overview?.avgLatency ?? 0;
    const totalCost = overview?.totalCost ?? 0;
    const activeAlerts = overview?.activeAlerts ?? 0;
    const successRate = overview?.successRate ?? 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">Overview</h1>
                    <p className="text-[#a89888]">Real-time health snapshot of your AI agents and LLM infrastructure.</p>
                    {isLive && (
                        <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            LIVE DATA
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                        <span className="text-xs font-medium text-[#22c55e]">All Systems Operational</span>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/agents')}
                        className="px-4 py-2 bg-[#e8722a] hover:bg-[#c45a1a] text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Run Agent
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard
                    title="Total Traces (24h)"
                    value={totalTraces.toString()}
                    change={isLive ? 'LIVE' : 'N/A'}
                    positive={true}
                    icon={Activity}
                    sparkData={tracesSparkline}
                    delay={0}
                />
                <KPICard
                    title="Avg Latency"
                    value={avgLatency >= 1000 ? `${(avgLatency / 1000).toFixed(1)}s` : `${avgLatency}ms`}
                    change={avgLatency < 3000 ? 'OK' : 'HIGH'}
                    positive={avgLatency < 3000}
                    icon={Clock}
                    sparkData={latencySparkline}
                    delay={0.05}
                />
                <KPICard
                    title="Total Cost (24h)"
                    value={`$${totalCost.toFixed(4)}`}
                    change={isLive ? 'LIVE' : 'N/A'}
                    positive={totalCost < 50}
                    icon={DollarSign}
                    sparkData={costSparkline}
                    color="text-[#eab308]"
                    delay={0.1}
                />
                <KPICard
                    title="Active Alerts"
                    value={activeAlerts.toString()}
                    change={activeAlerts > 0 ? `${activeAlerts} open` : 'Clear'}
                    positive={activeAlerts === 0}
                    icon={AlertTriangle}
                    color="text-[#ef4444]"
                    delay={0.15}
                />
                <KPICard
                    title="Success Rate"
                    value={`${successRate}%`}
                    change={successRate >= 95 ? 'Excellent' : successRate >= 85 ? 'Good' : 'Low'}
                    positive={successRate >= 85}
                    icon={Target}
                    sparkData={accuracySparkline}
                    color="text-[#22c55e]"
                    delay={0.2}
                />
            </div>

            {/* Agent Health + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Agent Health Cards */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-semibold text-[#f1ebe4]">Agent Health</h2>
                        <button
                            onClick={() => navigate('/dashboard/section2')}
                            className="text-xs text-[#e8722a] hover:text-[#f2923c] font-medium transition-colors"
                        >
                            View Details →
                        </button>
                    </div>
                    {agentHealth.map((agent, i) => (
                        <motion.div
                            key={agent.name}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className={`bg-[#1c1815] border ${statusColors[agent.status].border} rounded-xl p-4 hover:border-[#e8722a]/30 transition-all duration-200 cursor-pointer`}
                            onClick={() => navigate('/dashboard/section2')}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${statusColors[agent.status].dot}`} />
                                    <span className="text-sm font-semibold text-[#f1ebe4]">{agent.name}</span>
                                </div>
                                <span className={`text-[10px] uppercase font-medium ${statusColors[agent.status].text}`}>
                                    {agent.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <p className="text-[10px] text-[#5a4a3a] mb-0.5">Accuracy</p>
                                    <p className="text-sm font-bold text-[#f1ebe4]">{agent.accuracy}%</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#5a4a3a] mb-0.5">Latency</p>
                                    <p className="text-sm font-bold text-[#f1ebe4]">{agent.latency}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#5a4a3a] mb-0.5">Traces</p>
                                    <p className="text-sm font-bold text-[#f1ebe4]">{agent.tracesToday}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#5a4a3a] mb-0.5">Trend</p>
                                    <p className={`text-sm font-bold flex items-center gap-0.5 ${agent.trend >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                        {agent.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        {Math.abs(agent.trend)}%
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Trace Activity */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-[#f1ebe4]">Recent Traces</h2>
                        <button
                            onClick={() => navigate('/dashboard/traces')}
                            className="text-xs text-[#e8722a] hover:text-[#f2923c] font-medium transition-colors"
                        >
                            View All →
                        </button>
                    </div>
                    <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-7 gap-2 px-4 py-2.5 bg-[#0f0d0b] text-[10px] text-[#5a4a3a] uppercase tracking-wider font-medium">
                            <span>Trace ID</span>
                            <span>Agent</span>
                            <span>Decision</span>
                            <span>Confidence</span>
                            <span>Latency</span>
                            <span>Cost</span>
                            <span>Time</span>
                        </div>
                        {/* Table rows */}
                        <div className="divide-y divide-[#2a201a]/50">
                            {recentActivity.map((trace, i) => (
                                <motion.div
                                    key={trace.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.15 + i * 0.04 }}
                                    className="grid grid-cols-7 gap-2 px-4 py-3 hover:bg-[#0f0d0b]/50 transition-colors cursor-pointer items-center"
                                    onClick={() => navigate('/dashboard/traces')}
                                >
                                    <span className="text-xs font-mono text-[#7a6550]">{trace.id}</span>
                                    <span className="text-xs font-medium text-[#f1ebe4]">{trace.agent}</span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block w-fit ${decisionColors[trace.decision]} ${decisionBgColors[trace.decision]}`}>
                                        {trace.decision}
                                    </span>
                                    <span className="text-xs text-[#a89888]">{(trace.confidence * 100).toFixed(0)}%</span>
                                    <span className="text-xs text-[#a89888]">{(trace.latency / 1000).toFixed(1)}s</span>
                                    <span className="text-xs text-[#a89888]">${trace.cost.toFixed(2)}</span>
                                    <span className="text-xs text-[#5a4a3a]">{trace.time}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-5 hover:border-[#e8722a]/30 transition-all cursor-pointer group"
                    onClick={() => navigate('/dashboard/section1')}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#e8722a]/10 border border-[#e8722a]/20 flex items-center justify-center group-hover:bg-[#e8722a]/20 transition-colors">
                            <Zap size={20} className="text-[#e8722a]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[#f1ebe4]">AI App Monitoring</h3>
                            <p className="text-[10px] text-[#5a4a3a]">Section 1</p>
                        </div>
                    </div>
                    <p className="text-xs text-[#7a6550]">Prompt quality, response accuracy, latency, API rates, cost tracking, and model drift detection.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-5 hover:border-[#e8722a]/30 transition-all cursor-pointer group"
                    onClick={() => navigate('/dashboard/section2')}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center group-hover:bg-[#3b82f6]/20 transition-colors">
                            <Bot size={20} className="text-[#3b82f6]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[#f1ebe4]">LLM Agent Monitoring</h3>
                            <p className="text-[10px] text-[#5a4a3a]">Section 2</p>
                        </div>
                    </div>
                    <p className="text-xs text-[#7a6550]">Human approval rates, agent performance, decision accuracy, tool usage, escalations, and compliance.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-5 hover:border-[#e8722a]/30 transition-all cursor-pointer group"
                    onClick={() => navigate('/dashboard/alerts')}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center group-hover:bg-[#ef4444]/20 transition-colors">
                            <ShieldCheck size={20} className="text-[#ef4444]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[#f1ebe4]">Alerts & Compliance</h3>
                            <p className="text-[10px] text-[#5a4a3a]">Active: 4</p>
                        </div>
                    </div>
                    <p className="text-xs text-[#7a6550]">Threshold alerts, PII detection, bias monitoring, and compliance guardrails.</p>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardPage;
