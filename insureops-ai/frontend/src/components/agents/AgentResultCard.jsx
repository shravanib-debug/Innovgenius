import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, Clock, DollarSign, Cpu, ExternalLink, Wrench } from 'lucide-react';

const decisionConfig = {
    Approved: { icon: CheckCircle, color: '#22c55e', bg: 'bg-[#22c55e]/10', border: 'border-[#22c55e]/30' },
    Rejected: { icon: XCircle, color: '#ef4444', bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30' },
    Escalated: { icon: AlertTriangle, color: '#eab308', bg: 'bg-[#eab308]/10', border: 'border-[#eab308]/30' },
    Flagged: { icon: AlertTriangle, color: '#e8722a', bg: 'bg-[#e8722a]/10', border: 'border-[#e8722a]/30' },
};

const AgentResultCard = ({ result }) => {
    const navigate = useNavigate();

    if (!result) {
        return (
            <div className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[200px]">
                <Cpu size={32} className="text-[#3a2e24]" />
                <p className="text-[#5a4a3a] text-sm">Run an agent to see results here</p>
            </div>
        );
    }

    const config = decisionConfig[result.decision] || decisionConfig['Escalated'];
    const DecisionIcon = config.icon;
    const confidence = typeof result.confidence === 'number'
        ? (result.confidence > 1 ? result.confidence : result.confidence * 100).toFixed(0)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#1c1815] border ${config.border} rounded-xl p-6 space-y-5`}
        >
            {/* Decision header */}
            <div className={`${config.bg} rounded-xl p-4 flex items-center gap-4`}>
                <DecisionIcon size={36} style={{ color: config.color }} />
                <div>
                    <p className="text-xs text-[#a89888] uppercase tracking-wider mb-0.5">Decision</p>
                    <p className="text-2xl font-bold" style={{ color: config.color }}>{result.decision}</p>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-xs text-[#a89888] uppercase tracking-wider mb-0.5">Confidence</p>
                    <p className="text-2xl font-bold text-[#f1ebe4]">{confidence}%</p>
                </div>
            </div>

            {/* Reasoning */}
            {result.reasoning && (
                <div>
                    <p className="text-xs text-[#7a6550] uppercase tracking-wider mb-2">Reasoning</p>
                    <p className="text-sm text-[#c8b8a8] leading-relaxed bg-[#0f0d0b] rounded-lg p-3">
                        {result.reasoning}
                    </p>
                </div>
            )}

            {/* Verification & Risk Analysis (Phase 4) */}
            {result.verification && (
                <div className="space-y-3">
                    <p className="text-xs text-[#7a6550] uppercase tracking-wider mb-2 flex items-center gap-2">
                        Verification Checks
                        {result.verification.verified ? (
                            <span className="text-[#22c55e] bg-[#22c55e]/10 px-1.5 py-0.5 rounded text-[10px]">VERIFIED</span>
                        ) : (
                            <span className="text-[#e8722a] bg-[#e8722a]/10 px-1.5 py-0.5 rounded text-[10px]">FLAGGED</span>
                        )}
                    </p>

                    {/* Steps Checklist */}
                    <div className="bg-[#0f0d0b] rounded-lg p-3 space-y-2">
                        {result.verification.verification_steps?.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                {step.passed ? (
                                    <CheckCircle size={14} className="text-[#22c55e] mt-0.5 shrink-0" />
                                ) : (
                                    <AlertTriangle size={14} className="text-[#e8722a] mt-0.5 shrink-0" />
                                )}
                                <div>
                                    <p className={`text-sm font-medium ${step.passed ? 'text-[#f1ebe4]' : 'text-[#e8722a]'}`}>
                                        {step.name}
                                    </p>
                                    <p className="text-xs text-[#7a6550]">{step.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Extracted Evidence Summary */}
                    {result.evidenceAnalysis && result.evidenceAnalysis.length > 0 && (
                        <div className="pt-2">
                            <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-2">AI Evidence Analysis</p>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {result.evidenceAnalysis.map((file, idx) => {
                                    const isImage = file.file_path && file.file_path.match(/\.(jpg|jpeg|png|webp)$/i);
                                    const docType = file.doc_type || file.document_type || "Unknown Doc";

                                    return (
                                        <div key={idx} className="bg-[#0f0d0b] border border-[#2a201a] rounded-lg p-2 min-w-[140px] flex flex-col gap-2 relative group hover:border-[#e8722a]/50 transition-colors">
                                            <div className="h-20 w-full bg-[#1c1815] rounded overflow-hidden flex items-center justify-center">
                                                {isImage ? (
                                                    <img
                                                        src={`/uploads/${file.file_path}`}
                                                        alt={docType}
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    />
                                                ) : (
                                                    <div className="text-[#5a4a3a] text-xs font-mono">PDF / DOC</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[#e8722a] font-bold uppercase truncate">{docType}</p>
                                                <p className="text-[10px] text-[#a89888] truncate">{file.file_path}</p>
                                            </div>

                                            {/* Authenticity Badge */}
                                            {file.authenticity_score !== undefined && (
                                                <div className={`absolute top-1 right-1 px-1 py-0.5 rounded text-[9px] font-bold ${file.authenticity_score > 0.8 ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#eab308]/20 text-[#eab308]'
                                                    }`}>
                                                    {(file.authenticity_score * 100).toFixed(0)}% Auth
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0f0d0b] rounded-lg p-3 text-center">
                    <div className="flex justify-center mb-1"><Clock size={14} className="text-[#7a6550]" /></div>
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider">Latency</p>
                    <p className="text-sm font-bold text-[#f1ebe4]">
                        {result.latency != null
                            ? (result.latency >= 1000 ? `${(result.latency / 1000).toFixed(1)}s` : `${result.latency}ms`)
                            : '—'}
                    </p>
                </div>
                <div className="bg-[#0f0d0b] rounded-lg p-3 text-center">
                    <div className="flex justify-center mb-1"><DollarSign size={14} className="text-[#7a6550]" /></div>
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider">Cost</p>
                    <p className="text-sm font-bold text-[#f1ebe4]">${(result.cost || 0).toFixed(4)}</p>
                </div>
                <div className="bg-[#0f0d0b] rounded-lg p-3 text-center">
                    <div className="flex justify-center mb-1"><Cpu size={14} className="text-[#7a6550]" /></div>
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider">Tokens</p>
                    <p className="text-sm font-bold text-[#f1ebe4]">{result.totalTokens || '—'}</p>
                </div>
            </div>

            {/* Tools used */}
            {result.toolsUsed && result.toolsUsed.length > 0 && (
                <div>
                    <p className="text-xs text-[#7a6550] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Wrench size={11} /> Tools Used
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {result.toolsUsed.map((tool) => (
                            <span
                                key={tool}
                                className="px-2 py-1 bg-[#0f0d0b] border border-[#2a201a] rounded-md text-[11px] text-[#a89888] font-mono"
                            >
                                {tool}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Trace ID + View button */}
            {result.traceId && (
                <div className="border-t border-[#2a201a] pt-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-[#7a6550] uppercase tracking-wider">Trace ID</p>
                        <p className="text-xs font-mono text-[#a89888] mt-0.5">{result.traceId}</p>
                    </div>
                    <button
                        onClick={() => navigate(`/dashboard/traces/${result.traceId}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#e8722a] hover:bg-[#c45a1a] text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <ExternalLink size={14} />
                        View Trace Details
                    </button>
                </div>
            )}

            {!result.traceId && (
                <p className="text-[11px] text-[#5a4a3a] text-center border-t border-[#2a201a] pt-3">
                    Trace not saved (no DB connection)
                </p>
            )}
        </motion.div>
    );
};

export default AgentResultCard;
