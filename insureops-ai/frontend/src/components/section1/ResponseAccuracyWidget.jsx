import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const mockData = [
    { time: 'Mon', claims: 92, underwriting: 88, fraud: 85 },
    { time: 'Tue', claims: 89, underwriting: 90, fraud: 83 },
    { time: 'Wed', claims: 91, underwriting: 87, fraud: 86 },
    { time: 'Thu', claims: 88, underwriting: 91, fraud: 82 },
    { time: 'Fri', claims: 93, underwriting: 89, fraud: 88 },
    { time: 'Sat', claims: 90, underwriting: 92, fraud: 84 },
    { time: 'Sun', claims: 94, underwriting: 90, fraud: 87 },
];

const ResponseAccuracyWidget = ({ data, loading }) => {
    // Use API data if available: { byAgent: { claims: 92, underwriting: 88, fraud: 90 }, overall: 91 }
    const overall = data?.overall ?? 91;
    const byAgent = data?.byAgent || { claims: 92, underwriting: 88, fraud: 90 };

    // Build chart data from API or mock
    const chartData = data?.byAgent
        ? [{ time: 'Current', claims: byAgent.claims || 0, underwriting: byAgent.underwriting || 0, fraud: byAgent.fraud || 0 }]
        : mockData;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Response Accuracy</h3>
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#e8722a]" />Claims</span>
                    <span className="flex items-center gap-1 text-[#a89888]"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" />Underwriting</span>
                    <span className="flex items-center gap-1 text-[#a89888]"><span className="w-2 h-2 rounded-full bg-[#22c55e]" />Fraud</span>
                </div>
            </div>

            {/* Agent accuracy cards */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                {['claims', 'underwriting', 'fraud', 'support'].map(agent => (
                    <div key={agent} className="bg-[#0f0d0b] rounded-lg p-2 text-center">
                        <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">{agent}</p>
                        <p className={`text-lg font-bold ${(byAgent[agent] || 0) >= 85 ? 'text-[#22c55e]' : 'text-[#eab308]'}`}>
                            {byAgent[agent] ?? '—'}%
                        </p>
                    </div>
                ))}
            </div>

            <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <XAxis dataKey="time" tick={{ fill: '#7a6550', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[70, 100]} tick={{ fill: '#7a6550', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip
                            contentStyle={{ background: '#1c1815', border: '1px solid #2a201a', borderRadius: '8px', fontSize: '12px' }}
                            labelStyle={{ color: '#a89888' }}
                        />
                        <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
                        <Line type="monotone" dataKey="claims" stroke="#e8722a" strokeWidth={2} dot={{ r: 3, fill: '#e8722a' }} />
                        <Line type="monotone" dataKey="underwriting" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
                        <Line type="monotone" dataKey="fraud" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <p className="text-[#7a6550] text-xs mt-2">
                Overall: <span className="text-[#f1ebe4] font-semibold">{overall}%</span> · Red dashed line = 80% threshold
            </p>
        </motion.div>
    );
};

export default ResponseAccuracyWidget;
