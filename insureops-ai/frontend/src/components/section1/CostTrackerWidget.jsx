import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockCostData = [
    { time: 'Mon', claims: 8.50, underwriting: 5.20, fraud: 6.80 },
    { time: 'Tue', claims: 9.10, underwriting: 4.90, fraud: 7.30 },
    { time: 'Wed', claims: 7.80, underwriting: 6.10, fraud: 5.90 },
    { time: 'Thu', claims: 10.20, underwriting: 5.50, fraud: 8.10 },
    { time: 'Fri', claims: 8.90, underwriting: 6.30, fraud: 6.40 },
    { time: 'Sat', claims: 6.50, underwriting: 3.80, fraud: 4.20 },
    { time: 'Sun', claims: 5.80, underwriting: 3.20, fraud: 3.90 },
];

const CostTrackerWidget = ({ data, loading }) => {
    const totalCost = data?.total ?? 0;
    const avgPerReq = data?.avgPerRequest ?? 0;
    const byAgent = data?.byAgent || {};
    const trend = data?.trend || [];

    // Build cost data for chart
    const chartData = trend.length > 0
        ? trend.map(t => ({ time: t.time?.split('T')[1]?.slice(0, 5) || t.time, cost: t.value }))
        : mockCostData;

    const budget = 50;
    const budgetUsage = Math.min((totalCost / budget) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Cost Tracker</h3>
                <span className="text-xs text-[#a89888]">Budget: ${budget}/day</span>
            </div>

            {/* Cost cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-[#0f0d0b] rounded-lg p-3 text-center">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">Total</p>
                    <p className="text-lg font-bold text-[#f1ebe4]">${totalCost.toFixed(4)}</p>
                </div>
                <div className="bg-[#0f0d0b] rounded-lg p-3 text-center">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">$/Req</p>
                    <p className="text-lg font-bold text-[#e8722a]">${avgPerReq.toFixed(4)}</p>
                </div>
                <div className="bg-[#0f0d0b] rounded-lg p-3 text-center">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">Agents</p>
                    <p className="text-lg font-bold text-[#3b82f6]">{Object.keys(byAgent).length}</p>
                </div>
            </div>

            {/* Per-agent cost breakdown */}
            {Object.keys(byAgent).length > 0 && (
                <div className="space-y-1 mb-4">
                    {Object.entries(byAgent).map(([agent, cost]) => (
                        <div key={agent} className="flex items-center justify-between text-xs">
                            <span className="text-[#a89888] capitalize">{agent}</span>
                            <span className="text-[#f1ebe4] font-medium">${parseFloat(cost).toFixed(4)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Budget gauge */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-[#7a6550] mb-1">
                    <span>Budget Usage</span>
                    <span>{budgetUsage.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-[#2a201a] rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                            width: `${budgetUsage}%`,
                            backgroundColor: budgetUsage > 80 ? '#ef4444' : budgetUsage > 60 ? '#eab308' : '#22c55e',
                        }}
                    />
                </div>
            </div>

            {/* Trend chart */}
            {chartData.length > 0 && (
                <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <XAxis dataKey="time" tick={{ fill: '#7a6550', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ background: '#1c1815', border: '1px solid #2a201a', borderRadius: '8px', fontSize: '12px' }}
                                labelStyle={{ color: '#a89888' }}
                                formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Cost']}
                            />
                            <Area type="monotone" dataKey="cost" stroke="#e8722a" fill="#e8722a" fillOpacity={0.2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
};

export default CostTrackerWidget;
