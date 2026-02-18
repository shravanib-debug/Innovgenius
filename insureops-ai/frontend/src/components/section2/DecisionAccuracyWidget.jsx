import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#e8722a', '#7a6550'];

const mockData = { approved: 412, rejected: 186, escalated: 23, flagged: 17, other: 0 };

const DecisionAccuracyWidget = ({ data, loading }) => {
    const decisions = data || mockData;
    const total = Object.values(decisions).reduce((a, b) => a + b, 0) || 1;

    // For a simple accuracy view: approved + rejected are "decisive", escalated + flagged need review
    const decisive = (decisions.approved || 0) + (decisions.rejected || 0);
    const uncertain = (decisions.escalated || 0) + (decisions.flagged || 0);
    const accuracy = ((decisive / total) * 100).toFixed(1);

    const pieData = Object.entries(decisions)
        .filter(([_, v]) => v > 0)
        .map(([key, value]) => ({ name: key, value }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Decision Accuracy</h3>
                <span className="text-sm font-bold text-[#22c55e]">{accuracy}%</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
                {/* Pie */}
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

                {/* Stats */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-[#a89888]">Decisive (Auto)</span>
                        <span className="text-[#22c55e] font-bold">{decisive}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-[#a89888]">Needs Review</span>
                        <span className="text-[#eab308] font-bold">{uncertain}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-[#a89888]">Total</span>
                        <span className="text-[#f1ebe4] font-bold">{total}</span>
                    </div>
                </div>
            </div>

            {/* Decision matrix */}
            <p className="text-xs text-[#a89888] mb-2">Decision Matrix</p>
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#22c55e]/10 rounded-lg p-2 text-center border border-[#22c55e]/20">
                    <p className="text-[9px] text-[#22c55e] uppercase tracking-wider">Approved</p>
                    <p className="text-lg font-bold text-[#22c55e]">{decisions.approved || 0}</p>
                </div>
                <div className="bg-[#ef4444]/10 rounded-lg p-2 text-center border border-[#ef4444]/20">
                    <p className="text-[9px] text-[#ef4444] uppercase tracking-wider">Rejected</p>
                    <p className="text-lg font-bold text-[#ef4444]">{decisions.rejected || 0}</p>
                </div>
                <div className="bg-[#eab308]/10 rounded-lg p-2 text-center border border-[#eab308]/20">
                    <p className="text-[9px] text-[#eab308] uppercase tracking-wider">Escalated</p>
                    <p className="text-lg font-bold text-[#eab308]">{decisions.escalated || 0}</p>
                </div>
                <div className="bg-[#e8722a]/10 rounded-lg p-2 text-center border border-[#e8722a]/20">
                    <p className="text-[9px] text-[#e8722a] uppercase tracking-wider">Flagged</p>
                    <p className="text-lg font-bold text-[#e8722a]">{decisions.flagged || 0}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default DecisionAccuracyWidget;
