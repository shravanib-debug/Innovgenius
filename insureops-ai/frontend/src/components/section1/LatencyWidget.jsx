import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const LatencyWidget = ({ data, loading }) => {
    const p50 = data?.p50 ?? 0;
    const p95 = data?.p95 ?? 0;
    const p99 = data?.p99 ?? 0;
    const avg = data?.avg ?? 0;
    const slaBreach = data?.slaBreach ?? false;

    // Build histogram from trend data instead of hardcoded mock
    const histogram = useMemo(() => {
        const trend = data?.trend || [];
        if (trend.length === 0) return [];
        const buckets = { '<1s': 0, '1-2s': 0, '2-3s': 0, '3-4s': 0, '4-5s': 0, '>5s': 0 };
        trend.forEach(t => {
            const ms = t.value || 0;
            if (ms < 1000) buckets['<1s']++;
            else if (ms < 2000) buckets['1-2s']++;
            else if (ms < 3000) buckets['2-3s']++;
            else if (ms < 4000) buckets['3-4s']++;
            else if (ms < 5000) buckets['4-5s']++;
            else buckets['>5s']++;
        });
        return Object.entries(buckets).map(([range, count]) => ({ range, count }));
    }, [data?.trend]);

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

            {/* Distribution Histogram — from real latency data */}
            {histogram.length > 0 ? (
                <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histogram}>
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
            ) : (
                <div className="h-28 flex items-center justify-center text-xs text-[#5a4a3a]">
                    No latency data available
                </div>
            )}

            <p className="text-[#7a6550] text-xs mt-2">Avg: <span className="text-[#f1ebe4] font-semibold">{formatMs(avg)}</span></p>
        </motion.div>
    );
};

export default LatencyWidget;
