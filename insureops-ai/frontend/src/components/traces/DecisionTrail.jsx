import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wrench, Zap, ShieldCheck, ShieldX, CheckCircle, XCircle,
    AlertTriangle, Clock, DollarSign, ChevronDown, ChevronRight,
    ArrowDownRight, FileInput, Brain, Coins, Hash
} from 'lucide-react';

/* ── colour config ─────────────────────────────── */
const typeStyle = {
    tool_call: { color: '#3b82f6', icon: Wrench, label: 'Tool Call' },
    llm_call: { color: '#e8722a', icon: Zap, label: 'LLM Call' },
    guardrail: { color: '#22c55e', icon: ShieldCheck, label: 'Guardrail' },
};

const decisionColor = {
    approved: '#22c55e',
    rejected: '#ef4444',
    escalated: '#eab308',
    flagged: '#e8722a',
};

/* ── helpers ───────────────────────────────────── */
const fmtMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`);
const fmtCost = (c) => (c > 0 ? `$${c.toFixed(6)}` : null);

const summariseInput = (input) => {
    if (!input) return [];
    const items = [];
    if (input.insurance_type) items.push({ k: 'Insurance', v: input.insurance_type });
    if (input.claim_type) items.push({ k: 'Claim Type', v: input.claim_type });
    if (input.claim_amount) items.push({ k: 'Amount', v: `$${Number(input.claim_amount).toLocaleString()}` });
    if (input.policy_number) items.push({ k: 'Policy', v: input.policy_number });
    if (input.applicant_name) items.push({ k: 'Applicant', v: input.applicant_name });
    if (input.vehicle_type) items.push({ k: 'Vehicle', v: input.vehicle_type });
    if (input.property_type) items.push({ k: 'Property', v: input.property_type });
    if (input.age) items.push({ k: 'Age', v: input.age });
    // fallback: show first 4 keys
    if (items.length === 0) {
        Object.entries(input).slice(0, 4).forEach(([k, v]) => {
            if (typeof v !== 'object') items.push({ k, v: String(v) });
        });
    }
    return items;
};

/* ── connector line ────────────────────────────── */
const Connector = () => (
    <div className="flex justify-center py-0">
        <div className="relative w-0.5 h-8 bg-gradient-to-b from-[#2a201a] to-[#3a2a1a]">
            {/* animated flowing dot */}
            <motion.div
                className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#e8722a]"
                animate={{ y: [0, 28] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    </div>
);

/* ── single expandable node ────────────────────── */
const TrailNode = ({ type, title, subtitle, badges, children, color, icon: Icon, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            <div
                onClick={() => children && setOpen(!open)}
                className={`bg-[#1c1815] border rounded-xl overflow-hidden transition-all ${children ? 'cursor-pointer hover:border-[#4a3a2a]' : ''}`}
                style={{ borderColor: `${color}30` }}
            >
                {/* colour accent bar */}
                <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

                <div className="p-4">
                    <div className="flex items-center gap-3">
                        {/* icon circle */}
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                        >
                            <Icon size={16} style={{ color }} />
                        </div>

                        {/* title / subtitle */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-[#f1ebe4] truncate">{title}</p>
                                {type && (
                                    <span
                                        className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
                                        style={{ backgroundColor: `${color}15`, color }}
                                    >
                                        {type}
                                    </span>
                                )}
                            </div>
                            {subtitle && <p className="text-xs text-[#7a6550] mt-0.5 truncate">{subtitle}</p>}
                        </div>

                        {/* badges */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {badges}
                            {children && (
                                open
                                    ? <ChevronDown size={14} className="text-[#7a6550]" />
                                    : <ChevronRight size={14} className="text-[#7a6550]" />
                            )}
                        </div>
                    </div>
                </div>

                {/* expandable details */}
                <AnimatePresence>
                    {open && children && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 pt-1 border-t border-[#2a201a]">
                                {children}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

/* ── badge helpers ─────────────────────────────── */
const Badge = ({ icon: I, text, color = '#7a6550' }) => (
    <span className="flex items-center gap-1 text-[10px] text-[#a89888]">
        <I size={10} style={{ color }} />
        {text}
    </span>
);

const StatusDot = ({ success }) => (
    success
        ? <CheckCircle size={14} className="text-[#22c55e]" />
        : <XCircle size={14} className="text-[#ef4444]" />
);

/* ── MAIN COMPONENT ────────────────────────────── */
const DecisionTrail = ({ trace }) => {
    if (!trace) return null;

    const timeline = trace.timeline || [];
    const toolCalls = timeline.filter(s => s.type === 'tool_call');
    const llmCalls = timeline.filter(s => s.type === 'llm_call');
    const guardrails = trace.guardrail_checks || [];

    const dec = (trace.decision || '').toLowerCase();
    const decColor = decisionColor[dec] || '#7a6550';
    const confidence = trace.confidence
        ? (trace.confidence > 1 ? trace.confidence : trace.confidence * 100).toFixed(0)
        : null;

    // If there's nothing to show, don't render
    if (timeline.length === 0 && guardrails.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#0f0d0b] border border-[#2a201a] rounded-2xl p-6"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#e8722a]/10 border border-[#e8722a]/30 flex items-center justify-center">
                    <Brain size={16} className="text-[#e8722a]" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-[#f1ebe4] uppercase tracking-wider">AI Decision Trail</h3>
                    <p className="text-[10px] text-[#7a6550]">Explainable step-by-step reasoning path</p>
                </div>
            </div>

            <div className="flex flex-col items-stretch">

                {/* ── 1. INPUT NODE ──────────────────────── */}
                <TrailNode
                    title="Agent Input"
                    subtitle={`${trace.agent_type || 'unknown'} agent received input`}
                    color="#a855f7"
                    icon={FileInput}
                    defaultOpen={false}
                    badges={
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#a855f7] bg-[#a855f7]/10 border border-[#a855f7]/20 capitalize">
                            {trace.agent_type}
                        </span>
                    }
                >
                    {trace.input_data && (
                        <div className="space-y-2">
                            {summariseInput(trace.input_data).map(({ k, v }) => (
                                <div key={k} className="flex items-center gap-2">
                                    <span className="text-[10px] text-[#7a6550] uppercase tracking-wider w-20 flex-shrink-0">{k}</span>
                                    <span className="text-xs text-[#c8b8a8] capitalize">{v}</span>
                                </div>
                            ))}
                            <details className="mt-2">
                                <summary className="text-[10px] text-[#5a4a3a] cursor-pointer hover:text-[#7a6550]">View raw JSON</summary>
                                <pre className="text-[10px] text-[#7a6550] font-mono mt-1 bg-[#1c1815] rounded p-2 overflow-auto max-h-32">
                                    {JSON.stringify(trace.input_data, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}
                </TrailNode>

                {/* ── 2. TOOL CALL NODES ─────────────────── */}
                {toolCalls.map((step, i) => {
                    const cfg = typeStyle.tool_call;
                    const isSuccess = step.status === 'success';
                    return (
                        <div key={`tool-${i}`}>
                            <Connector />
                            <TrailNode
                                type="TOOL"
                                title={step.name}
                                subtitle={step.details?.result_summary || (isSuccess ? 'Completed successfully' : 'Failed')}
                                color={cfg.color}
                                icon={cfg.icon}
                                badges={
                                    <div className="flex items-center gap-2">
                                        {step.duration_ms > 0 && <Badge icon={Clock} text={fmtMs(step.duration_ms)} color="#3b82f6" />}
                                        <StatusDot success={isSuccess} />
                                    </div>
                                }
                            >
                                <div className="space-y-3">
                                    {step.details?.parameters && Object.keys(step.details.parameters).length > 0 && (
                                        <div>
                                            <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1.5">Parameters</p>
                                            <div className="bg-[#1c1815] rounded-lg p-2.5 space-y-1">
                                                {Object.entries(step.details.parameters).map(([k, v]) => (
                                                    <div key={k} className="flex gap-2 text-xs">
                                                        <span className="text-[#7a6550] font-mono">{k}:</span>
                                                        <span className="text-[#c8b8a8]">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {step.details?.result_summary && (
                                        <div>
                                            <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1.5">Result</p>
                                            <p className="text-xs text-[#c8b8a8] bg-[#1c1815] rounded-lg p-2.5 leading-relaxed">
                                                {step.details.result_summary}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </TrailNode>
                        </div>
                    );
                })}

                {/* ── 3. LLM CALL NODES ──────────────────── */}
                {llmCalls.map((step, i) => {
                    const cfg = typeStyle.llm_call;
                    const d = step.details || {};
                    const totalTokens = (d.prompt_tokens || 0) + (d.completion_tokens || 0);
                    const pq = d.prompt_quality ? (d.prompt_quality > 1 ? d.prompt_quality : (d.prompt_quality * 100).toFixed(0)) : null;

                    return (
                        <div key={`llm-${i}`}>
                            <Connector />
                            <TrailNode
                                type="LLM"
                                title={step.name}
                                subtitle={d.model ? `Model: ${d.model}` : null}
                                color={cfg.color}
                                icon={cfg.icon}
                                badges={
                                    <div className="flex items-center gap-3">
                                        {totalTokens > 0 && <Badge icon={Hash} text={`${totalTokens} tok`} color="#e8722a" />}
                                        {step.duration_ms > 0 && <Badge icon={Clock} text={fmtMs(step.duration_ms)} color="#3b82f6" />}
                                        {fmtCost(step.cost_usd) && <Badge icon={Coins} text={fmtCost(step.cost_usd)} color="#eab308" />}
                                    </div>
                                }
                            >
                                <div className="space-y-3">
                                    {/* Metrics row */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                            { label: 'Prompt Tokens', val: d.prompt_tokens || 0 },
                                            { label: 'Completion Tokens', val: d.completion_tokens || 0 },
                                            { label: 'Prompt Quality', val: pq ? `${pq}%` : '—' },
                                            { label: 'Cost', val: fmtCost(step.cost_usd) || '$0' },
                                        ].map(m => (
                                            <div key={m.label} className="bg-[#1c1815] rounded-lg p-2 text-center">
                                                <p className="text-[9px] text-[#5a4a3a] uppercase tracking-wider">{m.label}</p>
                                                <p className="text-xs font-bold text-[#f1ebe4] mt-0.5">{m.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Prompt / Response */}
                                    {d.prompt_text && (
                                        <details>
                                            <summary className="text-[10px] text-[#e8722a] cursor-pointer hover:text-[#f1ebe4] font-semibold">View Prompt</summary>
                                            <pre className="text-[10px] text-[#7a6550] font-mono mt-1 bg-[#1c1815] rounded p-2.5 overflow-auto max-h-40 whitespace-pre-wrap">
                                                {d.prompt_text}
                                            </pre>
                                        </details>
                                    )}
                                    {d.response_text && (
                                        <details>
                                            <summary className="text-[10px] text-[#e8722a] cursor-pointer hover:text-[#f1ebe4] font-semibold">View Response</summary>
                                            <pre className="text-[10px] text-[#7a6550] font-mono mt-1 bg-[#1c1815] rounded p-2.5 overflow-auto max-h-40 whitespace-pre-wrap">
                                                {d.response_text}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            </TrailNode>
                        </div>
                    );
                })}

                {/* ── 4. GUARDRAIL GATE ──────────────────── */}
                {guardrails.length > 0 && (
                    <>
                        <Connector />
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#1c1815] border border-[#22c55e]/20 rounded-xl overflow-hidden"
                        >
                            <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #22c55e, transparent)' }} />
                            <div className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center">
                                        <ShieldCheck size={16} className="text-[#22c55e]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#f1ebe4]">Safety Guardrails</p>
                                        <p className="text-[10px] text-[#7a6550]">
                                            {guardrails.filter(g => g.passed).length}/{guardrails.length} checks passed
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {guardrails.map((g, i) => (
                                        <div
                                            key={i}
                                            className={`rounded-lg p-3 text-center ${g.passed
                                                    ? 'bg-[#22c55e]/5 border border-[#22c55e]/20'
                                                    : 'bg-[#ef4444]/5 border border-[#ef4444]/20'
                                                }`}
                                        >
                                            {g.passed
                                                ? <ShieldCheck size={16} className="text-[#22c55e] mx-auto mb-1" />
                                                : <ShieldX size={16} className="text-[#ef4444] mx-auto mb-1" />
                                            }
                                            <p className="text-[10px] text-[#7a6550] uppercase tracking-wider">{g.check_type}</p>
                                            <p className={`text-[10px] font-bold mt-0.5 ${g.passed ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                                {g.passed ? 'PASS' : 'FAIL'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}

                {/* ── 5. DECISION NODE ───────────────────── */}
                <Connector />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-[#1c1815] border-2 rounded-xl overflow-hidden"
                    style={{ borderColor: `${decColor}40` }}
                >
                    {/* glow accent */}
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${decColor}, ${decColor}60, transparent)` }} />

                    <div className="p-5">
                        <div className="flex items-center gap-4">
                            {/* large decision icon */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${decColor}15`, border: `2px solid ${decColor}40` }}
                            >
                                {dec === 'approved' && <CheckCircle size={24} style={{ color: decColor }} />}
                                {dec === 'rejected' && <XCircle size={24} style={{ color: decColor }} />}
                                {(dec === 'escalated' || dec === 'flagged') && <AlertTriangle size={24} style={{ color: decColor }} />}
                                {!decisionColor[dec] && <Brain size={24} style={{ color: decColor }} />}
                            </div>

                            <div className="flex-1">
                                <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">Final Decision</p>
                                <p className="text-xl font-bold capitalize" style={{ color: decColor }}>
                                    {trace.decision || 'Unknown'}
                                </p>
                            </div>

                            {/* confidence gauge */}
                            {confidence && (
                                <div className="text-center flex-shrink-0">
                                    <div className="relative w-16 h-16">
                                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                            <circle cx="18" cy="18" r="15" fill="none" stroke="#2a201a" strokeWidth="2.5" />
                                            <circle
                                                cx="18" cy="18" r="15" fill="none" stroke={decColor}
                                                strokeWidth="2.5" strokeLinecap="round"
                                                strokeDasharray={`${confidence * 0.942} 94.2`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-sm font-bold text-[#f1ebe4]">{confidence}%</span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-[#7a6550] uppercase tracking-wider mt-1">Confidence</p>
                                </div>
                            )}
                        </div>

                        {/* reasoning */}
                        {trace.reasoning && (
                            <div className="mt-4 bg-[#0f0d0b] rounded-lg p-3">
                                <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1.5">Agent Reasoning</p>
                                <p className="text-xs text-[#c8b8a8] leading-relaxed">{trace.reasoning}</p>
                            </div>
                        )}

                        {/* cost / latency summary */}
                        <div className="flex items-center gap-4 mt-3">
                            {trace.total_latency_ms > 0 && (
                                <span className="flex items-center gap-1 text-[10px] text-[#7a6550]">
                                    <Clock size={10} className="text-[#3b82f6]" />
                                    Total: {fmtMs(trace.total_latency_ms)}
                                </span>
                            )}
                            {trace.total_cost_usd > 0 && (
                                <span className="flex items-center gap-1 text-[10px] text-[#7a6550]">
                                    <DollarSign size={10} className="text-[#eab308]" />
                                    Cost: ${trace.total_cost_usd.toFixed(6)}
                                </span>
                            )}
                            {trace.total_tokens > 0 && (
                                <span className="flex items-center gap-1 text-[10px] text-[#7a6550]">
                                    <Zap size={10} className="text-[#e8722a]" />
                                    {trace.total_tokens} tokens
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default DecisionTrail;
