import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const mockBreakdown = [
    { type: 'Timeout', count: 12, fill: '#eab308' },
    { type: '4xx', count: 8, fill: '#e8722a' },
    { type: '5xx', count: 5, fill: '#ef4444' },
    { type: 'Rate Limit', count: 3, fill: '#3b82f6' },
];

const COLORS = ['#22c55e', '#ef4444'];

const ApiRatesWidget = ({ data, loading }) => {
    const success = data?.success ?? 235;
    const failure = data?.failure ?? 14;
    const successRate = data?.successRate ?? 94;

    const donutData = [
        { name: 'Success', value: successRate },
        { name: 'Failure', value: 100 - successRate },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">API Success / Failure</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${successRate >= 90 ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
                    {successRate}%
                </span>
            </div>

            <div className="flex items-center gap-4">
                {/* Donut */}
                <div className="relative flex-shrink-0 w-28 h-28">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={donutData} cx="50%" cy="50%" innerRadius={32} outerRadius={48} paddingAngle={3} dataKey="value">
                                {donutData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1c1815', border: '1px solid #2a201a', borderRadius: '8px', fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-[#7a6550] font-medium">API</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[#a89888]">Successful Calls</span>
                        <span className="text-sm font-bold text-[#22c55e]">{success}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[#a89888]">Failed Calls</span>
                        <span className="text-sm font-bold text-[#ef4444]">{failure}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[#a89888]">Total</span>
                        <span className="text-sm font-bold text-[#f1ebe4]">{success + failure}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ApiRatesWidget;
