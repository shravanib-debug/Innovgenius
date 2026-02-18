import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

const mockTrend = [
    { time: '00:00', score: 72 }, { time: '02:00', score: 75 }, { time: '04:00', score: 78 },
    { time: '06:00', score: 74 }, { time: '08:00', score: 82 }, { time: '10:00', score: 85 },
    { time: '12:00', score: 83 }, { time: '14:00', score: 87 }, { time: '16:00', score: 84 },
    { time: '18:00', score: 86 }, { time: '20:00', score: 88 }, { time: '22:00', score: 85 },
];

const PromptQualityWidget = ({ data, loading }) => {
    const score = data?.score ?? 85;
    const trend = data?.trend?.map((t, i) => ({ time: t.time || `${i}`, score: Math.round((t.value || 0) * 100) })) || mockTrend;
    const gaugeColor = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
    const circumference = 2 * Math.PI * 52;
    const filled = (score / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Prompt Quality</h3>
                <span className="text-xs text-[#7a6550] font-medium">Structure · Token · Template</span>
            </div>

            <div className="flex items-center gap-6">
                {/* Gauge */}
                <div className="relative flex-shrink-0">
                    <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#2a201a" strokeWidth="8" />
                        <circle
                            cx="60" cy="60" r="52" fill="none"
                            stroke={gaugeColor} strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - filled}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-[#f1ebe4]">{score}</span>
                        <span className="text-[10px] text-[#7a6550] uppercase tracking-wider">Score</span>
                    </div>
                </div>

                {/* Trend */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#a89888] mb-2">Score Trend (24h)</p>
                    <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend}>
                                <YAxis domain={[60, 100]} hide />
                                <Tooltip
                                    contentStyle={{ background: '#1c1815', border: '1px solid #2a201a', borderRadius: '8px', fontSize: '12px' }}
                                    labelStyle={{ color: '#a89888' }}
                                    itemStyle={{ color: '#f1ebe4' }}
                                />
                                <Line type="monotone" dataKey="score" stroke={gaugeColor} strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <p className="text-[#7a6550] text-xs mt-3">Based on structure, token count, and template adherence.</p>
        </motion.div>
    );
};

export default PromptQualityWidget;
