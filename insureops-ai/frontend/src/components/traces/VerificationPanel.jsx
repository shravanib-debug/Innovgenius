import { motion } from 'framer-motion';
import {
    ShieldCheck, ShieldX, AlertTriangle, FileText, Clock,
    CheckCircle, XCircle, Loader, ChevronRight, Eye
} from 'lucide-react';

const statusConfig = {
    passed: { icon: CheckCircle, color: '#22c55e', bg: 'bg-[#22c55e]/10', border: 'border-[#22c55e]/30', label: 'Passed' },
    failed: { icon: XCircle, color: '#ef4444', bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30', label: 'Failed' },
    in_progress: { icon: Loader, color: '#3b82f6', bg: 'bg-[#3b82f6]/10', border: 'border-[#3b82f6]/30', label: 'Running' },
    pending: { icon: Clock, color: '#7a6550', bg: 'bg-[#7a6550]/10', border: 'border-[#7a6550]/30', label: 'Pending' },
};

const typeColors = {
    health: '#22c55e',
    vehicle: '#3b82f6',
    travel: '#a855f7',
    property: '#eab308',
    life: '#ec4899',
};

/**
 * VerificationPanel — XAI explanation panel for trace detail view.
 * Shows insurance type, verification steps timeline, evidence referenced,
 * confidence gauge, and missing documents warnings.
 *
 * Props:
 *   trace - The trace object containing v2 verification fields
 */
const VerificationPanel = ({ trace }) => {
    if (!trace) return null;

    const insuranceType = trace.insurance_type || trace.input_data?.insurance_type;
    const verificationSteps = trace.verification_steps || trace.output_data?.details?.verification_steps || [];
    const missingDocs = trace.missing_documents || trace.output_data?.details?.missing_documents || [];
    const evidenceUsed = trace.evidence_used_in_decision || trace.output_data?.details?.evidence_used || [];
    const evidenceCount = trace.evidence_count || trace.output_data?.details?.evidence_count || 0;
    const completeness = trace.evidence_completeness_score || trace.output_data?.details?.evidence_completeness_score || 0;
    const verificationLatency = trace.verification_latency_ms || trace.output_data?.details?.verification_latency_ms || 0;

    // If no verification data at all, don't render
    if (!insuranceType && verificationSteps.length === 0) return null;

    const typeColor = typeColors[insuranceType] || '#e8722a';
    const confidencePercent = trace.confidence > 1 ? trace.confidence : (trace.confidence * 100);
    const completenessPercent = completeness > 1 ? completeness : (completeness * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-5 space-y-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-[#e8722a]" />
                    <p className="text-xs text-[#7a6550] uppercase tracking-wider font-semibold">
                        Verification & Explainability
                    </p>
                </div>
                {insuranceType && (
                    <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{ backgroundColor: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}30` }}
                    >
                        {insuranceType}
                    </span>
                )}
            </div>

            {/* KPIs row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#0f0d0b] rounded-lg p-3">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">Evidence Files</p>
                    <p className="text-lg font-bold text-[#f1ebe4]">{evidenceCount}</p>
                </div>
                <div className="bg-[#0f0d0b] rounded-lg p-3">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">Completeness</p>
                    <div className="flex items-center gap-2">
                        <p className="text-lg font-bold" style={{ color: completenessPercent >= 80 ? '#22c55e' : completenessPercent >= 50 ? '#eab308' : '#ef4444' }}>
                            {completenessPercent.toFixed(0)}%
                        </p>
                    </div>
                </div>
                <div className="bg-[#0f0d0b] rounded-lg p-3">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">Confidence</p>
                    <p className="text-lg font-bold text-[#e8722a]">{confidencePercent.toFixed(0)}%</p>
                </div>
                <div className="bg-[#0f0d0b] rounded-lg p-3">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">Verify Latency</p>
                    <p className="text-lg font-bold text-[#3b82f6]">
                        {verificationLatency >= 1000 ? `${(verificationLatency / 1000).toFixed(1)}s` : `${Math.round(verificationLatency)}ms`}
                    </p>
                </div>
            </div>

            {/* Confidence gauge */}
            <div className="bg-[#0f0d0b] rounded-lg p-3">
                <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-2">Decision Confidence</p>
                <div className="relative w-full h-3 bg-[#1c1815] rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${confidencePercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                            background: `linear-gradient(90deg, ${confidencePercent >= 80 ? '#22c55e' : confidencePercent >= 60 ? '#eab308' : '#ef4444'}, ${typeColor})`,
                        }}
                    />
                </div>
            </div>

            {/* Verification Steps Timeline */}
            {verificationSteps.length > 0 && (
                <div>
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-3 font-semibold">Verification Pipeline</p>
                    <div className="space-y-2">
                        {verificationSteps.map((step, i) => {
                            const stepStatus = step.status || 'pending';
                            const cfg = statusConfig[stepStatus] || statusConfig.pending;
                            const StepIcon = cfg.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className={`flex items-center gap-3 p-3 rounded-lg ${cfg.bg} border ${cfg.border}`}
                                >
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#0f0d0b] flex-shrink-0"
                                        style={{ color: cfg.color }}>
                                        {i + 1}
                                    </div>
                                    <StepIcon size={16} style={{ color: cfg.color }} className="flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#f1ebe4]">{step.step_name || step.name}</p>
                                        {step.details && (
                                            <p className="text-xs text-[#7a6550] mt-0.5 truncate">{step.details}</p>
                                        )}
                                    </div>
                                    {step.duration_ms > 0 && (
                                        <span className="text-xs text-[#7a6550] flex items-center gap-1 flex-shrink-0">
                                            <Clock size={10} />
                                            {step.duration_ms >= 1000 ? `${(step.duration_ms / 1000).toFixed(1)}s` : `${Math.round(step.duration_ms)}ms`}
                                        </span>
                                    )}
                                    <span className="text-xs font-semibold flex-shrink-0" style={{ color: cfg.color }}>
                                        {cfg.label}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Evidence Referenced */}
            {evidenceUsed.length > 0 && (
                <div>
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-3 font-semibold">Evidence Used in Decision</p>
                    <div className="flex flex-wrap gap-2">
                        {evidenceUsed.map((doc, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f0d0b] border border-[#2a201a] rounded-lg text-xs text-[#c8b8a8]">
                                <FileText size={12} className="text-[#e8722a]" />
                                {doc}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Missing Documents Warning */}
            {missingDocs.length > 0 && (
                <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-[#ef4444]" />
                        <p className="text-xs text-[#ef4444] font-semibold uppercase tracking-wider">Missing Documents</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {missingDocs.map((doc, i) => (
                            <span key={i} className="px-2 py-1 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded text-xs text-[#ef4444]">
                                {doc}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default VerificationPanel;
