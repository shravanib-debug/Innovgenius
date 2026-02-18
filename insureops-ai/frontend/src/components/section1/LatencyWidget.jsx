import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockHistogram = [
    { range: '<1s', count: 45 }, { range: '1-2s', count: 78 }, { range: '2-3s', count: 62 },
    { range: '3-4s', count: 35 }, { range: '4-5s', count: 18 }, { range: '>5s', count: 8 },
];

const LatencyWidget = ({ data, loading }) => {
    const p50 = data?.p50 ?? 1800;
    const p95 = data?.p95 ?? 3200;
    const p99 = data?.p99 ?? 4800;
    const avg = data?.avg ?? 2100;
    const slaBreach = data?.slaBreach ?? false;

    const formatMs = (ms) => ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Latency</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${slaBreach ? 'bg-[#ef4444]/10 text-[#ef4444]' : 'bg-[#22c55e]/10 text-[#22c55e]'}`}>
                    {slaBreach ? 'SLA BREACH' : 'SLA OK'}
                </span>
            </div>

            {/* Percentile cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-[#0f0d0b] rounded-lg p-3 text-center">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">P50</p>
                    <p className="text-lg font-bold text-[#f1ebe4]">{formatMs(p50)}</p>
                </div>
                <div className="bg-[#0f0d0b] rounded-lg p-3 text-center">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">P95</p>
                    <p className="text-lg font-bold text-[#eab308]">{formatMs(p95)}</p>
                </div>
                <div className="bg-[#0f0d0b] rounded-lg p-3 text-center">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">P99</p>
                    <p className="text-lg font-bold text-[#e8722a]">{formatMs(p99)}</p>
                </div>
            </div>

            {/* Distribution Histogram */}
            <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockHistogram}>
                        <XAxis dataKey="range" tick={{ fill: '#7a6550', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{ background: '#1c1815', border: '1px solid #2a201a', borderRadius: '8px', fontSize: '12px' }}
                            labelStyle={{ color: '#a89888' }}
                        />
                        <Bar dataKey="count" fill="#e8722a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <p className="text-[#7a6550] text-xs mt-2">Avg: <span className="text-[#f1ebe4] font-semibold">{formatMs(avg)}</span></p>
        </motion.div>
    );
};

export default LatencyWidget;
