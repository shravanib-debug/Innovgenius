import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, Clock, DollarSign, Search, ChevronLeft, ChevronRight, ExternalLink, Wifi } from 'lucide-react';
import { getTraces } from '../services/api';
import { useApiData } from '../hooks/useApiData';
import { useWS } from '../contexts/WebSocketProvider';

const decisionConfig = {
    approved: { icon: CheckCircle, color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10' },
    rejected: { icon: XCircle, color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10' },
    escalated: { icon: AlertTriangle, color: 'text-[#eab308]', bg: 'bg-[#eab308]/10' },
    flagged: { icon: AlertTriangle, color: 'text-[#e8722a]', bg: 'bg-[#e8722a]/10' },
};

const agentColors = {
    claims: 'text-[#e8722a]',
    underwriting: 'text-[#3b82f6]',
    fraud: 'text-[#ef4444]',
    support: 'text-[#22c55e]',
};

const TracesPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [agentFilter, setAgentFilter] = useState('');
    const [decisionFilter, setDecisionFilter] = useState('');
    const [search, setSearch] = useState('');

    const fetchFn = useCallback(() => getTraces({
        page,
        limit: 20,
        agent_type: agentFilter || undefined,
        decision: decisionFilter || undefined,
    }), [page, agentFilter, decisionFilter]);

    const { data, loading, isLive, refetch } = useApiData(fetchFn, null, [page, agentFilter, decisionFilter]);
    const { subscribe, isConnected: wsConnected } = useWS();

    // Auto-refresh when a new trace arrives via WebSocket
    useEffect(() => {
        const unsub = subscribe('new_trace', () => { refetch(); });
        return unsub;
    }, [subscribe, refetch]);

    const traces = data?.traces || [];
    const pagination = data?.pagination || { page: 1, totalPages: 1, totalItems: 0 };

    const filteredTraces = search
        ? traces.filter(t =>
            t.id?.toLowerCase().includes(search.toLowerCase()) ||
            t.agent_type?.toLowerCase().includes(search.toLowerCase()) ||
            t.decision?.toLowerCase().includes(search.toLowerCase())
        )
        : traces;

    const formatLatency = (ms) => ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
    const formatTime = (ts) => {
        if (!ts) return '—';
        const d = new Date(ts);
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">Trace Explorer</h1>
                    <p className="text-[#a89888]">Browse and inspect all agent execution traces.</p>
                    {isLive && (
                        <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            {pagination.totalItems} traces in DB
                        </span>
                    )}
                    {wsConnected && (
                        <span className="inline-flex items-center gap-1.5 mt-2 ml-2 px-2 py-0.5 text-[10px] bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 rounded-full">
                            <Wifi size={10} />
                            REAL-TIME
                        </span>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a6550]" />
                    <input
                        type="text"
                        placeholder="Search by trace ID, agent, decision..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#1c1815] border border-[#2a201a] rounded-lg text-sm text-[#f1ebe4] placeholder-[#5a4a3a] focus:outline-none focus:border-[#e8722a]/50"
                    />
                </div>

                {/* Agent filter */}
                <select
                    value={agentFilter}
                    onChange={e => { setAgentFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 bg-[#1c1815] border border-[#2a201a] rounded-lg text-sm text-[#f1ebe4] focus:outline-none focus:border-[#e8722a]/50"
                >
                    <option value="">All Agents</option>
                    <option value="claims">Claims</option>
                    <option value="underwriting">Underwriting</option>
                    <option value="fraud">Fraud</option>
                    <option value="support">Support</option>
                </select>

                {/* Decision filter */}
                <select
                    value={decisionFilter}
                    onChange={e => { setDecisionFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 bg-[#1c1815] border border-[#2a201a] rounded-lg text-sm text-[#f1ebe4] focus:outline-none focus:border-[#e8722a]/50"
                >
                    <option value="">All Decisions</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="escalated">Escalated</option>
                    <option value="flagged">Flagged</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#2a201a]">
                                <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider">Trace ID</th>
                                <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider">Agent</th>
                                <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider">Decision</th>
                                <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider">Confidence</th>
                                <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider">Latency</th>
                                <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider">Cost</th>
                                <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider">Time</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-[#7a6550]">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-[#e8722a] border-t-transparent rounded-full animate-spin" />
                                            Loading traces...
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredTraces.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-[#7a6550]">
                                        No traces found. Run an agent to generate traces.
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredTraces.map((trace, i) => {
                                const dec = trace.decision?.toLowerCase();
                                const cfg = decisionConfig[dec] || decisionConfig['escalated'];
                                const DecIcon = cfg.icon;
                                const conf = trace.confidence
                                    ? (trace.confidence > 1 ? trace.confidence : trace.confidence * 100).toFixed(0)
                                    : null;

                                return (
                                    <motion.tr
                                        key={trace.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="border-b border-[#2a201a]/50 hover:bg-[#0f0d0b]/50 transition-colors group"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs text-[#a89888]">
                                                {trace.id?.slice(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-semibold capitalize ${agentColors[trace.agent_type] || 'text-[#a89888]'}`}>
                                                {trace.agent_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {dec ? (
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                                                    <DecIcon size={11} />
                                                    {trace.decision}
                                                </span>
                                            ) : (
                                                <span className="text-[#5a4a3a] text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-[#f1ebe4]">
                                                {conf ? `${conf}%` : '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-[#f1ebe4] flex items-center gap-1">
                                                <Clock size={11} className="text-[#7a6550]" />
                                                {formatLatency(trace.total_latency_ms || 0)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-[#f1ebe4]">
                                                ${(trace.total_cost_usd || 0).toFixed(4)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-[#7a6550]">{formatTime(trace.created_at)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => navigate(`/dashboard/traces/${trace.id}`)}
                                                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 bg-[#e8722a]/10 hover:bg-[#e8722a]/20 text-[#e8722a] rounded-lg text-xs font-medium transition-all"
                                            >
                                                <ExternalLink size={11} />
                                                Details
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a201a]">
                        <span className="text-xs text-[#7a6550]">
                            Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} total
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={pagination.page <= 1}
                                className="p-1.5 rounded-lg bg-[#0f0d0b] border border-[#2a201a] text-[#a89888] hover:text-[#f1ebe4] disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={pagination.page >= pagination.totalPages}
                                className="p-1.5 rounded-lg bg-[#0f0d0b] border border-[#2a201a] text-[#a89888] hover:text-[#f1ebe4] disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TracesPage;
