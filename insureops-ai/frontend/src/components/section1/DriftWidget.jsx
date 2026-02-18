import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const mockDriftTrend = [
    { day: 'Mon', score: 0.08 }, { day: 'Tue', score: 0.12 }, { day: 'Wed', score: 0.10 },
    { day: 'Thu', score: 0.15 }, { day: 'Fri', score: 0.18 }, { day: 'Sat', score: 0.22 },
    { day: 'Sun', score: 0.19 },
];

const DriftWidget = ({ data, loading }) => {
    const currentDrift = data?.score ?? 0.19;
    const status = data?.status ?? 'normal';
    const driftColor = status === 'critical' ? '#ef4444' : status === 'warning' ? '#eab308' : '#22c55e';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Model Drift</h3>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: driftColor }} />
                    <span className="text-sm font-bold" style={{ color: driftColor }}>{currentDrift.toFixed(2)}</span>
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded-full font-semibold ${status === 'critical' ? 'bg-red-500/10 text-red-400' :
                            status === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-green-500/10 text-green-400'
                        }`}>{status}</span>
                </div>
            </div>

            {/* Drift score trend */}
            <div className="h-28 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockDriftTrend}>
                        <XAxis dataKey="day" tick={{ fill: '#7a6550', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 0.4]} tick={{ fill: '#7a6550', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip
                            contentStyle={{ background: '#1c1815', border: '1px solid #2a201a', borderRadius: '8px', fontSize: '12px' }}
                            labelStyle={{ color: '#a89888' }}
                            formatter={(val) => [val.toFixed(3), 'Drift Score']}
                        />
                        <ReferenceLine y={0.3} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'Alert', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                        <Line type="monotone" dataKey="score" stroke={driftColor} strokeWidth={2} dot={{ r: 3, fill: driftColor }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <p className="text-[#7a6550] text-xs">
                Measures output distribution stability. Score {'>'} 0.3 triggers a warning.
            </p>
        </motion.div>
    );
};

export default DriftWidget;
