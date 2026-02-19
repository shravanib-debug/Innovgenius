import { useCallback, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, CheckCircle, XCircle, AlertTriangle, Clock,
    DollarSign, FileText, Image, Download, ShieldCheck,
    Activity, MapPin, Calendar, User, Hash
} from 'lucide-react';
import { getClaimDetail } from '../services/api';
import { useApiData } from '../hooks/useApiData';
import VerificationPanel from '../components/traces/VerificationPanel';

const statusConfig = {
    submitted: { color: '#3b82f6', bg: 'bg-[#3b82f6]/10', border: 'border-[#3b82f6]/30', label: 'Submitted' },
    under_review: { color: '#eab308', bg: 'bg-[#eab308]/10', border: 'border-[#eab308]/30', label: 'Under Review' },
    verified: { color: '#22c55e', bg: 'bg-[#22c55e]/10', border: 'border-[#22c55e]/30', label: 'Verified' },
    approved: { color: '#22c55e', bg: 'bg-[#22c55e]/10', border: 'border-[#22c55e]/30', label: 'Approved' },
    rejected: { color: '#ef4444', bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30', label: 'Rejected' },
    escalated: { color: '#e8722a', bg: 'bg-[#e8722a]/10', border: 'border-[#e8722a]/30', label: 'Escalated' },
    pending: { color: '#7a6550', bg: 'bg-[#7a6550]/10', border: 'border-[#7a6550]/30', label: 'Pending' },
};

const typeColors = {
    health: { color: '#22c55e', icon: '🏥' },
    vehicle: { color: '#3b82f6', icon: '🚗' },
    travel: { color: '#a855f7', icon: '✈️' },
    property: { color: '#eab308', icon: '🏠' },
    life: { color: '#ec4899', icon: '❤️' },
};

const ClaimDetailPage = () => {
    const { claimId } = useParams();
    const navigate = useNavigate();
    const [lightboxImg, setLightboxImg] = useState(null);

    const fetchFn = useCallback(() => getClaimDetail(claimId), [claimId]);
    const { data: claim, loading, error } = useApiData(fetchFn, null, [claimId]);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
    const formatAmount = (a) => a ? `$${Number(a).toLocaleString()}` : '—';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3">
                <div className="w-6 h-6 border-2 border-[#e8722a] border-t-transparent rounded-full animate-spin" />
                <span className="text-[#a89888]">Loading claim...</span>
            </div>
        );
    }

    if (error || !claim) {
        return (
            <div className="space-y-4">
                <button onClick={() => navigate('/dashboard/claims')} className="flex items-center gap-2 text-[#a89888] hover:text-[#f1ebe4] text-sm transition-colors">
                    <ArrowLeft size={16} /> Back to Claims
                </button>
                <div className="bg-[#1c1815] border border-red-500/30 rounded-xl p-8 text-center">
                    <p className="text-red-400 font-semibold mb-2">Claim Not Found</p>
                    <p className="text-[#a89888] text-sm">Claim ID: {claimId}</p>
                </div>
            </div>
        );
    }

    const status = claim.status?.toLowerCase() || 'pending';
    const sCfg = statusConfig[status] || statusConfig.pending;
    const type = claim.insurance_type?.toLowerCase() || 'health';
    const tCfg = typeColors[type] || typeColors.health;
    const evidence = claim.evidence || claim.ClaimEvidences || [];
    const trace = claim.Trace || claim.trace || null;

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button
                onClick={() => navigate('/dashboard/claims')}
                className="flex items-center gap-2 text-[#a89888] hover:text-[#f1ebe4] text-sm transition-colors"
            >
                <ArrowLeft size={16} /> Back to Claims
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{tCfg.icon}</span>
                        <h1 className="text-2xl font-bold text-[#f1ebe4]">Claim Detail</h1>
                    </div>
                    <p className="font-mono text-xs text-[#7a6550]">ID: {claim.id}</p>
                    <p className="text-xs text-[#5a4a3a] mt-1">Filed: {formatDate(claim.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span
                        className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{ backgroundColor: `${tCfg.color}15`, color: tCfg.color, border: `1px solid ${tCfg.color}30` }}
                    >
                        {type}
                    </span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${sCfg.bg} border ${sCfg.border}`}
                        style={{ color: sCfg.color }}>
                        {sCfg.label}
                    </span>
                </div>
            </div>

            {/* Claim Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Amount', value: formatAmount(claim.claim_amount), icon: DollarSign, color: 'text-[#eab308]' },
                    { label: 'Policy ID', value: claim.policy_id || '—', icon: Hash, color: 'text-[#3b82f6]' },
                    { label: 'Incident Date', value: formatDate(claim.incident_date), icon: Calendar, color: 'text-[#a855f7]' },
                    { label: 'Location', value: claim.location || '—', icon: MapPin, color: 'text-[#22c55e]' },
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
                        <p className="text-sm font-bold text-[#f1ebe4] truncate">{value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Description */}
            {claim.description && (
                <div className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-5">
                    <p className="text-xs text-[#7a6550] uppercase tracking-wider mb-3">Description</p>
                    <p className="text-sm text-[#c8b8a8] leading-relaxed">{claim.description}</p>
                </div>
            )}

            {/* Evidence Gallery */}
            <div className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-[#7a6550] uppercase tracking-wider font-semibold">
                        Evidence Files ({evidence.length})
                    </p>
                    {claim.evidence_completeness_score != null && (
                        <span className="text-xs font-semibold" style={{
                            color: claim.evidence_completeness_score >= 0.8 ? '#22c55e' :
                                claim.evidence_completeness_score >= 0.5 ? '#eab308' : '#ef4444'
                        }}>
                            {(claim.evidence_completeness_score * 100).toFixed(0)}% Complete
                        </span>
                    )}
                </div>

                {evidence.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText size={32} className="text-[#2a201a] mx-auto mb-2" />
                        <p className="text-sm text-[#7a6550]">No evidence uploaded yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {evidence.map((file, i) => {
                            const isImage = (file.file_type || file.file_url || '').match(/\.(jpg|jpeg|png|gif|webp)/i) || file.file_type?.startsWith('image');
                            const fileUrl = file.file_url?.startsWith('http') ? file.file_url : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : ''}${file.file_url}`;

                            return (
                                <motion.div
                                    key={file.id || i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-[#0f0d0b] border border-[#2a201a] rounded-lg overflow-hidden group cursor-pointer hover:border-[#e8722a]/40 transition-colors"
                                    onClick={() => isImage && setLightboxImg(fileUrl)}
                                >
                                    {isImage ? (
                                        <div className="aspect-square relative">
                                            <img src={fileUrl} alt={file.evidence_category || 'Evidence'} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Image size={20} className="text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="aspect-square bg-[#1c1815] flex flex-col items-center justify-center p-4">
                                            <FileText size={28} className="text-[#e8722a] mb-2" />
                                            <p className="text-[10px] text-[#7a6550] truncate w-full text-center">
                                                {file.original_name || file.evidence_category || 'Document'}
                                            </p>
                                        </div>
                                    )}
                                    <div className="p-2">
                                        <p className="text-[10px] text-[#7a6550] uppercase tracking-wider truncate">
                                            {file.evidence_category || file.file_type || 'File'}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Verification Panel (XAI) */}
            {trace && <VerificationPanel trace={trace} />}

            {/* Linked Trace */}
            {trace && (
                <div className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-5">
                    <p className="text-xs text-[#7a6550] uppercase tracking-wider mb-3">Linked Trace</p>
                    <Link
                        to={`/dashboard/traces/${trace.id}`}
                        className="flex items-center justify-between p-3 bg-[#0f0d0b] rounded-lg hover:bg-[#1c1815] transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Activity size={16} className="text-[#e8722a]" />
                            <div>
                                <p className="text-sm font-medium text-[#f1ebe4] group-hover:text-[#e8722a] transition-colors">
                                    {trace.id}
                                </p>
                                <p className="text-xs text-[#7a6550]">
                                    {trace.agent_type} · {trace.decision} · {trace.total_latency_ms}ms
                                </p>
                            </div>
                        </div>
                        <ArrowLeft size={14} className="text-[#7a6550] rotate-180" />
                    </Link>
                </div>
            )}

            {/* Lightbox */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center cursor-pointer"
                    onClick={() => setLightboxImg(null)}
                >
                    <img src={lightboxImg} alt="Evidence preview" className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl" />
                </div>
            )}
        </div>
    );
};

export default ClaimDetailPage;
