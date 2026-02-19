import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, CheckCircle, XCircle, AlertTriangle, Clock,
    DollarSign, Cpu, Wrench, ShieldCheck, ShieldX, Zap
} from 'lucide-react';
import { getTraceDetail } from '../services/api';
import { useApiData } from '../hooks/useApiData';
import VerificationPanel from '../components/traces/VerificationPanel';

const decisionConfig = {
    approved: { icon: CheckCircle, color: '#22c55e', bg: 'bg-[#22c55e]/10', border: 'border-[#22c55e]/30' },
    rejected: { icon: XCircle, color: '#ef4444', bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30' },
    escalated: { icon: AlertTriangle, color: '#eab308', bg: 'bg-[#eab308]/10', border: 'border-[#eab308]/30' },
    flagged: { icon: AlertTriangle, color: '#e8722a', bg: 'bg-[#e8722a]/10', border: 'border-[#e8722a]/30' },
};

const stepTypeConfig = {
    tool_call: { color: '#3b82f6', label: 'Tool', icon: Wrench },
    llm_call: { color: '#e8722a', label: 'LLM', icon: Zap },
    guardrail: { color: '#22c55e', label: 'Guard', icon: ShieldCheck },
};

const TraceDetailPage = () => {
    const { traceId } = useParams();
    const navigate = useNavigate();

    const fetchFn = useCallback(() => getTraceDetail(traceId), [traceId]);
    const { data: trace, loading, error } = useApiData(fetchFn, null, [traceId]);

    const formatLatency = (ms) => ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
    const formatTime = (ts) => ts ? new Date(ts).toLocaleString() : '—';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3">
                <div className="w-6 h-6 border-2 border-[#e8722a] border-t-transparent rounded-full animate-spin" />
                <span className="text-[#a89888]">Loading trace...</span>
            </div>
        );
    }

    if (error || !trace) {
        return (
            <div className="space-y-4">
                <button onClick={() => navigate('/dashboard/traces')} className="flex items-center gap-2 text-[#a89888] hover:text-[#f1ebe4] text-sm transition-colors">
                    <ArrowLeft size={16} /> Back to Traces
                </button>
                <div className="bg-[#1c1815] border border-red-500/30 rounded-xl p-8 text-center">
                    <p className="text-red-400 font-semibold mb-2">Trace Not Found</p>
                    <p className="text-[#a89888] text-sm">Trace ID: {traceId}</p>
                </div>
            </div>
        );
    }

    const dec = trace.decision?.toLowerCase();
    const cfg = decisionConfig[dec] || decisionConfig['escalated'];
    const DecIcon = cfg.icon;
    const confidence = trace.confidence
        ? (trace.confidence > 1 ? trace.confidence : trace.confidence * 100).toFixed(0)
        : null;

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button
                onClick={() => navigate('/dashboard/traces')}
                className="flex items-center gap-2 text-[#a89888] hover:text-[#f1ebe4] text-sm transition-colors"
            >
                <ArrowLeft size={16} /> Back to Traces
            </button>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#f1ebe4] mb-1">Trace Detail</h1>
                    <p className="font-mono text-xs text-[#7a6550]">{trace.id}</p>
                    <p className="text-xs text-[#5a4a3a] mt-1">{formatTime(trace.created_at)}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                    <DecIcon size={18} style={{ color: cfg.color }} />
                    <span className="font-bold capitalize" style={{ color: cfg.color }}>{trace.decision || 'Unknown'}</span>
                    {confidence && <span className="text-xs text-[#a89888]">· {confidence}%</span>}
                </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Agent', value: trace.agent_type, icon: Cpu, color: 'text-[#e8722a]' },
                    { label: 'Total Latency', value: formatLatency(trace.total_latency_ms || 0), icon: Clock, color: 'text-[#3b82f6]' },
                    { label: 'Total Cost', value: `$${(trace.total_cost_usd || 0).toFixed(6)}`, icon: DollarSign, color: 'text-[#eab308]' },
                    { label: 'Total Tokens', value: trace.total_tokens || '—', icon: Zap, color: 'text-[#22c55e]' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Icon size={14} className={color} />
                            <p className="text-[10px] text-[#7a6550] uppercase tracking-wider">{label}</p>
                        </div>
                        <p className="text-lg font-bold text-[#f1ebe4] capitalize">{value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Reasoning */}
            {trace.reasoning && (
                <div className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-5">
                    <p className="text-xs text-[#7a6550] uppercase tracking-wider mb-3">Agent Reasoning</p>
                    <p className="text-sm text-[#c8b8a8] leading-relaxed">{trace.reasoning}</p>
                </div>
            )}

            {/* Execution Timeline */}
            {trace.timeline && trace.timeline.length > 0 && (
                <div className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-5">
                    <p className="text-xs text-[#7a6550] uppercase tracking-wider mb-4">Execution Timeline</p>
                    <div className="space-y-2">
                        {trace.timeline.map((step, i) => {
                            const typeCfg = stepTypeConfig[step.type] || stepTypeConfig['tool_call'];
                            const StepIcon = typeCfg.icon;
                            const isSuccess = step.status === 'success' || step.status === 'passed';

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex items-start gap-3 p-3 bg-[#0f0d0b] rounded-lg"
                                >
                                    {/* Step number */}
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-[#7a6550] bg-[#1c1815] border border-[#2a201a] flex-shrink-0 mt-0.5">
                                        {i + 1}
                                    </div>

                                    {/* Type badge */}
                                    <div
                                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 mt-0.5"
                                        style={{ backgroundColor: `${typeCfg.color}15`, color: typeCfg.color }}
                                    >
                                        <StepIcon size={10} />
                                        {typeCfg.label}
                                    </div>

                                    {/* Name + details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#f1ebe4] truncate">{step.name}</p>
                                        {step.details?.result_summary && (
                                            <p className="text-xs text-[#7a6550] mt-0.5 truncate">{step.details.result_summary}</p>
                                        )}
                                        {step.details?.response_text && (
                                            <p className="text-xs text-[#7a6550] mt-0.5 line-clamp-2">{step.details.response_text}</p>
                                        )}
                                    </div>

                                    {/* Duration */}
                                    {step.duration_ms > 0 && (
                                        <span className="text-xs text-[#7a6550] flex-shrink-0 flex items-center gap-1">
                                            <Clock size={10} />
                                            {formatLatency(step.duration_ms)}
                                        </span>
                                    )}

                                    {/* Status */}
                                    <div className="flex-shrink-0">
                                        {isSuccess
                                            ? <ShieldCheck size={14} className="text-[#22c55e]" />
                                            : <ShieldX size={14} className="text-[#ef4444]" />
                                        }
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Guardrail Checks */}
            {trace.guardrail_checks && trace.guardrail_checks.length > 0 && (
                <div className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-5">
                    <p className="text-xs text-[#7a6550] uppercase tracking-wider mb-4">Safety & Guardrail Checks</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {trace.guardrail_checks.map((check, i) => (
                            <div key={i} className={`rounded-lg p-3 text-center ${check.passed ? 'bg-[#22c55e]/5 border border-[#22c55e]/20' : 'bg-[#ef4444]/5 border border-[#ef4444]/20'}`}>
                                {check.passed
                                    ? <ShieldCheck size={18} className="text-[#22c55e] mx-auto mb-1" />
                                    : <ShieldX size={18} className="text-[#ef4444] mx-auto mb-1" />
                                }
                                <p className="text-[10px] text-[#7a6550] uppercase tracking-wider">{check.check_type}</p>
                                <p className={`text-xs font-semibold mt-0.5 ${check.passed ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                    {check.passed ? 'Passed' : 'Failed'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Verification & XAI Panel (v2) */}
            <VerificationPanel trace={trace} />

            {/* Input / Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trace.input_data && (
                    <div className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-5">
                        <p className="text-xs text-[#7a6550] uppercase tracking-wider mb-3">Input Data</p>
                        <pre className="text-xs text-[#a89888] font-mono overflow-auto max-h-48 bg-[#0f0d0b] rounded-lg p-3">
                            {JSON.stringify(trace.input_data, null, 2)}
                        </pre>
                    </div>
                )}
                {trace.output_data && (
                    <div className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-5">
                        <p className="text-xs text-[#7a6550] uppercase tracking-wider mb-3">Output Data</p>
                        <pre className="text-xs text-[#a89888] font-mono overflow-auto max-h-48 bg-[#0f0d0b] rounded-lg p-3">
                            {JSON.stringify(trace.output_data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TraceDetailPage;
