import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Activity, FileText, AlertTriangle, AlertCircle, Eye, UserX, Map, FileStack } from 'lucide-react';
import {
    getComplianceOverview,
    getBiasAnalysis,
    getPolicyRules,
    getAuditLogs
} from '../services/api';
import { Link } from 'react-router-dom';

const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
};

export default function CompliancePage() {
    const [timerange, setTimerange] = useState('24h');
    const [loading, setLoading] = useState(true);

    // Data states
    const [overview, setOverview] = useState(null);
    const [bias, setBias] = useState(null);
    const [rules, setRules] = useState([]);
    const [audits, setAudits] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [timerange]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [overviewData, biasData, rulesData, auditsData] = await Promise.all([
                getComplianceOverview(timerange),
                getBiasAnalysis(timerange.includes('d') ? timerange : '7d'), // Bias needs more data
                getPolicyRules(timerange),
                getAuditLogs({ limit: 10, timerange })
            ]);

            setOverview(overviewData);
            setBias(biasData);
            setRules(rulesData);
            setAudits(auditsData.audit_logs || []);
        } catch (err) {
            console.error('Failed to load compliance data:', err);
            setError('Failed to load live compliance data. Please check your backend connection.');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-500 flex items-center gap-3">
                    <AlertTriangle size={24} />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2a201a]">
                <div>
                    <h1 className="text-3xl font-bold text-[#f1ebe4] tracking-tight flex items-center gap-3">
                        <Shield className="text-[#3b82f6]" size={36} />
                        Security & Compliance
                    </h1>
                    <p className="text-[#a89888] mt-2 max-w-2xl text-lg">
                        Live audit trails, PII scanning, and AI bias monitoring for regulatory oversight.
                    </p>
                </div>

                <div className="flex gap-2 p-1.5 bg-[#1a1412] rounded-lg border border-[#2a201a] shrink-0">
                    {['1h', '24h', '7d', '30d'].map((tr) => (
                        <button
                            key={tr}
                            onClick={() => setTimerange(tr)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timerange === tr
                                    ? 'bg-[#2a201a] text-[#f1ebe4] shadow-sm'
                                    : 'text-[#7a6550] hover:text-[#a89888]'
                                }`}
                        >
                            {tr.toUpperCase()}
                        </button>
                    ))}
                </div>
            </header>

            {loading && !overview ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* SECTION A: High-Level KPIs */}
                    <motion.div {...fadeIn} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* PII Clean Rate */}
                        <div className="bg-[#110e0c] border border-[#2a201a] rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[#7a6550] text-sm font-medium uppercase tracking-wider">PII Clean Rate</p>
                                    <h3 className="text-4xl font-bold text-[#f1ebe4] mt-1">
                                        {overview?.pii.clean_rate}%
                                    </h3>
                                </div>
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <ShieldCheck className="text-emerald-500" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-[#a89888]">
                                {overview?.pii.clean} clean out of {overview?.total_checks} traces
                            </p>
                        </div>

                        {/* Critical Exposures */}
                        <div className="bg-[#110e0c] border border-[rgba(239,68,68,0.2)] rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-red-400/80 text-sm font-medium uppercase tracking-wider">Critical PII Exposures</p>
                                    <h3 className="text-4xl font-bold text-red-500 mt-1">
                                        {overview?.pii.critical}
                                    </h3>
                                </div>
                                <div className="p-3 bg-red-500/10 rounded-xl">
                                    <ShieldAlert className="text-red-500" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-red-400/60">
                                Requires immediate attention
                            </p>
                        </div>

                        {/* Policy Compliance */}
                        <div className="bg-[#110e0c] border border-[#2a201a] rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[#7a6550] text-sm font-medium uppercase tracking-wider">Policy Compliance</p>
                                    <h3 className="text-4xl font-bold text-[#f1ebe4] mt-1">
                                        {overview?.policy.avg_compliance_rate}%
                                    </h3>
                                </div>
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <FileCheck className="text-blue-400" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-[#a89888]">
                                Average rule pass rate
                            </p>
                        </div>

                        {/* Total Violations */}
                        <div className="bg-[#110e0c] border border-[#2a201a] rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[#7a6550] text-sm font-medium uppercase tracking-wider">Total Violations</p>
                                    <h3 className="text-4xl font-bold text-[#f1ebe4] mt-1">
                                        {overview?.policy.total_violations}
                                    </h3>
                                </div>
                                <div className="p-3 bg-orange-500/10 rounded-xl">
                                    <AlertCircle className="text-orange-400" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-[#a89888]">
                                Across {overview?.policy.rules_count} enforced rules
                            </p>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* SECTION B: Policy Rules */}
                        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.1 }} className="lg:col-span-2 bg-[#110e0c] border border-[#2a201a] rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-[#f1ebe4]">Policy Rule Enforcement</h2>
                                    <p className="text-sm text-[#a89888]">Pass/fail rates for active governance rules.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {rules.map((rule) => (
                                    <div key={rule.id} className="flex items-center justify-between p-4 bg-[#1a1412] border border-[#2a201a] rounded-xl hover:border-[#3a2d24] transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-[#f1ebe4] font-medium">{rule.name}</h4>
                                                {rule.pass_rate < 90 && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                                        WARNING
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[#7a6550] mt-1">{rule.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-lg font-bold ${rule.pass_rate >= 95 ? 'text-emerald-400' : rule.pass_rate >= 85 ? 'text-orange-400' : 'text-red-400'}`}>
                                                {rule.pass_rate}%
                                            </span>
                                            <p className="text-xs text-[#7a6550]">{rule.violations} violations</p>
                                        </div>
                                    </div>
                                ))}
                                {rules.length === 0 && (
                                    <p className="text-[#7a6550] text-center py-4">No policy rules found.</p>
                                )}
                            </div>
                        </motion.div>

                        {/* SECTION B2: Bias Radar/Grid */}
                        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.2 }} className="bg-[#110e0c] border border-[#2a201a] rounded-2xl p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-[#f1ebe4] flex items-center gap-2">
                                    <Activity className="text-purple-400" size={20} />
                                    Fairness & Bias
                                </h2>
                                <p className="text-sm text-[#a89888]">7-day rolling demographic analysis.</p>
                            </div>

                            {bias ? (
                                <div className="space-y-4">
                                    {/* Overall status flag */}
                                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${bias.overall_bias_detected ? 'bg-orange-500/10 border-orange-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                                        {bias.overall_bias_detected ? (
                                            <AlertTriangle className="text-orange-500 shrink-0" size={20} />
                                        ) : (
                                            <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                                        )}
                                        <div>
                                            <p className={`text-sm font-semibold ${bias.overall_bias_detected ? 'text-orange-400' : 'text-emerald-400'}`}>
                                                {bias.overall_bias_detected ? 'Statistically Significant Bias Detected' : 'No Significant Bias Detected'}
                                            </p>
                                            <p className="text-xs mt-1 text-[#a89888]">{bias.total_traces_analyzed} traces analyzed.</p>
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    {[
                                        { key: 'geography', label: 'Geographic Region', icon: Map },
                                        { key: 'age_group', label: 'Age Group', icon: UserX },
                                        { key: 'gender', label: 'Gender', icon: Users },
                                        { key: 'claim_type', label: 'Claim Type', icon: FileStack }
                                    ].map(cat => (
                                        <div key={cat.key} className="p-3 bg-[#1a1412] rounded-lg border border-[#2a201a] flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-[#f1ebe4]">
                                                <cat.icon size={16} className="text-[#7a6550]" />
                                                <span className="text-sm">{cat.label}</span>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${bias[cat.key]?.bias_detected
                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    : 'text-emerald-500'
                                                }`}>
                                                {bias[cat.key]?.bias_detected ? 'BIASED' : 'FAIR'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[#7a6550] text-center text-sm py-4">Insufficient data for bias analysis.</p>
                            )}
                        </motion.div>
                    </div>

                    {/* SECTION C: Live Audit Trail */}
                    <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.3 }} className="bg-[#110e0c] border border-[#2a201a] rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-[#2a201a] flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-[#f1ebe4]">Live Audit Trail</h2>
                                <p className="text-sm text-[#a89888]">Immutable compliance records for recent agent actions.</p>
                            </div>
                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-semibold text-emerald-400">LIVE</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#1a1412] border-b border-[#2a201a]">
                                        <th className="p-4 text-xs font-semibold text-[#7a6550] uppercase tracking-wider pl-6">Timestamp</th>
                                        <th className="p-4 text-xs font-semibold text-[#7a6550] uppercase tracking-wider">Agent</th>
                                        <th className="p-4 text-xs font-semibold text-[#7a6550] uppercase tracking-wider">Status</th>
                                        <th className="p-4 text-xs font-semibold text-[#7a6550] uppercase tracking-wider">Trace ID / Link</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2a201a]">
                                    {audits.map((audit) => (
                                        <tr key={audit.id} className="hover:bg-[#1a1412] transition-colors group">
                                            <td className="p-4 text-sm text-[#a89888] whitespace-nowrap pl-6">
                                                {new Date(audit.timestamp).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-block px-2.5 py-1 bg-[#2a201a] text-[#f1ebe4] text-xs font-medium rounded capitalize">
                                                    {audit.agent_type}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded capitalize ${audit.overall_status === 'compliant' ? 'text-emerald-400 bg-emerald-500/10' :
                                                        audit.overall_status === 'warning' ? 'text-orange-400 bg-orange-500/10' :
                                                            audit.overall_status === 'critical' ? 'text-red-400 bg-red-500/10' :
                                                                'text-blue-400 bg-blue-500/10'
                                                    }`}>
                                                    {audit.overall_status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <Link
                                                    to={`/dashboard/traces/${audit.trace_id}`}
                                                    className="font-mono text-xs text-[#3b82f6] hover:text-blue-400 hover:underline flex items-center gap-1.5 transition-colors"
                                                >
                                                    <Eye size={14} />
                                                    {audit.trace_id.split('-')[0]}...
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {audits.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-[#7a6550]">
                                                No audit logs found for the selected time range.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}

// Helper component since lucide icon was missing
function FileCheck({ className, size }) {
    return <FileText className={className} size={size} />;
}
function Users({ className, size }) {
    return <UserX className={className} size={size} />;
}
