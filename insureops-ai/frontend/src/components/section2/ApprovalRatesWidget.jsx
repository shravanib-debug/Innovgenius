import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#e8722a', '#7a6550'];

const ApprovalRatesWidget = ({ data, loading }) => {
    const decisions = data?.decisions || { approved: 0, rejected: 0, escalated: 0, flagged: 0 };
    const approvalRate = data?.approvalRate ?? 0;
    const escalationRate = data?.escalationRate ?? 0;
    const total = Object.values(decisions).reduce((a, b) => a + b, 0) || 1;

    const funnelSteps = [
        { label: 'Total Decisions', value: total, color: '#e8722a', pct: 100 },
        { label: 'Approved', value: decisions.approved, color: '#22c55e', pct: (decisions.approved / total) * 100 },
        { label: 'Rejected', value: decisions.rejected, color: '#ef4444', pct: (decisions.rejected / total) * 100 },
        { label: 'Escalated', value: decisions.escalated, color: '#eab308', pct: (decisions.escalated / total) * 100 },
        { label: 'Flagged', value: decisions.flagged, color: '#e8722a', pct: (decisions.flagged / total) * 100 },
    ];

    const pieData = Object.entries(decisions)
        .filter(([_, v]) => v > 0)
        .map(([key, value]) => ({ name: key, value }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Decision Distribution</h3>
                <div className="bg-[#0f0d0b] rounded-lg px-3 py-1.5">
                    <span className="text-[10px] text-[#7a6550] uppercase tracking-wider">Approval</span>
                    <span className="text-sm font-bold text-[#22c55e] ml-2">{approvalRate}%</span>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                {/* Pie chart */}
                <div className="w-28 h-28 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={3} dataKey="value">
                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1c1815', border: '1px solid #2a201a', borderRadius: '8px', fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-1.5">
                    {Object.entries(decisions).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                            <span className="text-[#a89888] capitalize">{key}</span>
                            <span className="text-[#f1ebe4] font-bold">{val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Funnel bars */}
            <div className="space-y-1.5">
                {funnelSteps.map((step) => (
                    <div key={step.label} className="relative">
                        <div
                            className="h-7 rounded-lg flex items-center px-3 transition-all duration-500"
                            style={{
                                width: `${Math.max(step.pct, 8)}%`,
                                backgroundColor: `${step.color}15`,
                                borderLeft: `3px solid ${step.color}`,
                            }}
                        >
                            <span className="text-[10px] text-[#a89888] flex-1 truncate">{step.label}</span>
                            <span className="text-[10px] font-bold text-[#f1ebe4]">{step.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-[#0f0d0b] rounded-lg p-2 text-center">
                    <p className="text-[9px] text-[#7a6550] uppercase">Approval Rate</p>
                    <p className="text-sm font-bold text-[#22c55e]">{approvalRate}%</p>
                </div>
                <div className="bg-[#0f0d0b] rounded-lg p-2 text-center">
                    <p className="text-[9px] text-[#7a6550] uppercase">Escalation Rate</p>
                    <p className="text-sm font-bold text-[#eab308]">{escalationRate}%</p>
                </div>
            </div>
        </motion.div>
    );
};

export default ApprovalRatesWidget;
