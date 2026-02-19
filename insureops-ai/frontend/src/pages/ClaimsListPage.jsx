import { useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ShieldCheck, Clock, DollarSign, Search,
    ChevronRight, Filter, FileText
} from 'lucide-react';
import { getClaims } from '../services/api';
import { useApiData } from '../hooks/useApiData';

const typeConfig = {
    health: { color: '#22c55e', icon: '🏥', label: 'Health' },
    vehicle: { color: '#3b82f6', icon: '🚗', label: 'Vehicle' },
    travel: { color: '#a855f7', icon: '✈️', label: 'Travel' },
    property: { color: '#eab308', icon: '🏠', label: 'Property' },
    life: { color: '#ec4899', icon: '❤️', label: 'Life' },
};

const statusConfig = {
    submitted: { color: '#3b82f6', label: 'Submitted' },
    under_review: { color: '#eab308', label: 'Under Review' },
    verified: { color: '#22c55e', label: 'Verified' },
    approved: { color: '#22c55e', label: 'Approved' },
    rejected: { color: '#ef4444', label: 'Rejected' },
    escalated: { color: '#e8722a', label: 'Escalated' },
    pending: { color: '#7a6550', label: 'Pending' },
};

const ClaimsListPage = () => {
    const navigate = useNavigate();
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

    const fetchFn = useCallback(() => getClaims(), []);
    const { data: rawData, loading } = useApiData(fetchFn, null, []);

    // Normalize: backend might return { claims: [...] } or [...] directly
    const claims = useMemo(() => {
        if (!rawData) return [];
        if (Array.isArray(rawData)) return rawData;
        if (rawData.claims && Array.isArray(rawData.claims)) return rawData.claims;
        if (rawData.rows && Array.isArray(rawData.rows)) return rawData.rows;
        return [];
    }, [rawData]);

    const filtered = useMemo(() => {
        return claims.filter(c => {
            if (typeFilter !== 'all' && c.insurance_type !== typeFilter) return false;
            if (statusFilter !== 'all' && c.status !== statusFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                const matchId = String(c.id).toLowerCase().includes(q);
                const matchDesc = (c.description || '').toLowerCase().includes(q);
                const matchPolicy = (c.policy_id || '').toLowerCase().includes(q);
                if (!matchId && !matchDesc && !matchPolicy) return false;
            }
            return true;
        });
    }, [claims, typeFilter, statusFilter, search]);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';
    const formatAmount = (a) => a ? `$${Number(a).toLocaleString()}` : '—';

    // Summary stats
    const stats = useMemo(() => ({
        total: claims.length,
        approved: claims.filter(c => c.status === 'approved' || c.status === 'verified').length,
        pending: claims.filter(c => c.status === 'submitted' || c.status === 'under_review' || c.status === 'pending').length,
        rejected: claims.filter(c => c.status === 'rejected').length,
    }), [claims]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#f1ebe4] mb-1">Claims</h1>
                <p className="text-sm text-[#7a6550]">View and manage insurance claims across all types</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Claims', value: stats.total, icon: FileText, color: 'text-[#e8722a]' },
                    { label: 'Approved', value: stats.approved, icon: ShieldCheck, color: 'text-[#22c55e]' },
                    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-[#eab308]' },
                    { label: 'Rejected', value: stats.rejected, icon: ShieldCheck, color: 'text-[#ef4444]' },
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
                        <p className="text-2xl font-bold text-[#f1ebe4]">{value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a6550]" />
                        <input
                            type="text"
                            placeholder="Search claims..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-[#0f0d0b] border border-[#2a201a] rounded-lg text-sm text-[#f1ebe4] placeholder-[#5a4a3a] focus:outline-none focus:border-[#e8722a]/50"
                        />
                    </div>

                    {/* Type filter */}
                    <div className="flex items-center gap-1">
                        <Filter size={12} className="text-[#7a6550]" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-[#0f0d0b] border border-[#2a201a] rounded-lg px-3 py-2 text-sm text-[#f1ebe4] focus:outline-none focus:border-[#e8722a]/50"
                        >
                            <option value="all">All Types</option>
                            {Object.entries(typeConfig).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#0f0d0b] border border-[#2a201a] rounded-lg px-3 py-2 text-sm text-[#f1ebe4] focus:outline-none focus:border-[#e8722a]/50"
                    >
                        <option value="all">All Status</option>
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Claims Table */}
            <div className="bg-[#1c1815] border border-[#2a201a] rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-3">
                        <div className="w-6 h-6 border-2 border-[#e8722a] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[#a89888]">Loading claims...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText size={32} className="text-[#2a201a] mx-auto mb-3" />
                        <p className="text-sm text-[#7a6550]">No claims found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#2a201a]">
                                    <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider font-semibold">Type</th>
                                    <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider font-semibold">ID</th>
                                    <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider font-semibold">Description</th>
                                    <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider font-semibold">Amount</th>
                                    <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider font-semibold">Status</th>
                                    <th className="text-left px-4 py-3 text-[10px] text-[#7a6550] uppercase tracking-wider font-semibold">Date</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((claim, i) => {
                                    const type = claim.insurance_type?.toLowerCase() || 'health';
                                    const tCfg = typeConfig[type] || typeConfig.health;
                                    const status = claim.status?.toLowerCase() || 'pending';
                                    const sCfg = statusConfig[status] || statusConfig.pending;

                                    return (
                                        <motion.tr
                                            key={claim.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.02 }}
                                            onClick={() => navigate(`/dashboard/claims/${claim.id}`)}
                                            className="border-b border-[#2a201a]/50 hover:bg-[#0f0d0b] cursor-pointer transition-colors group"
                                        >
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase"
                                                    style={{ backgroundColor: `${tCfg.color}10`, color: tCfg.color }}
                                                >
                                                    <span>{tCfg.icon}</span>
                                                    {tCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs text-[#7a6550]">#{claim.id}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-[#c8b8a8] truncate max-w-[250px]">
                                                    {claim.description || claim.claim_type || '—'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-semibold text-[#f1ebe4]">{formatAmount(claim.claim_amount)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                                                    style={{ backgroundColor: `${sCfg.color}15`, color: sCfg.color }}
                                                >
                                                    {sCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-[#7a6550]">{formatDate(claim.created_at || claim.incident_date)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <ChevronRight size={14} className="text-[#2a201a] group-hover:text-[#e8722a] transition-colors" />
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClaimsListPage;
