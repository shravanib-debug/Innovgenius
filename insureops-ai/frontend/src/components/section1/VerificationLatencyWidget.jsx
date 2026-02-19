import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle } from 'lucide-react';

const TYPE_COLORS = {
    health: '#22c55e',
    vehicle: '#3b82f6',
    travel: '#a855f7',
    property: '#eab308',
    life: '#ec4899',
};

const TYPE_ICONS = {
    health: '🏥',
    vehicle: '🚗',
    travel: '✈️',
    property: '🏠',
    life: '❤️',
};

const VerificationLatencyWidget = ({ data, loading }) => {
    const latencyByType = data?.latencyByType || {};

    const chartData = Object.entries(latencyByType)
        .map(([type, ms]) => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            type,
            latency: ms,
            color: TYPE_COLORS[type] || '#7a6550',
        }))
        .filter(d => d.latency > 0);

    // Mock data if empty
    if (chartData.length === 0 && !loading) {
        ['health', 'vehicle', 'travel', 'property', 'life'].forEach(type => {
            chartData.push({
                name: type.charAt(0).toUpperCase() + type.slice(1),
                type,
                latency: Math.floor(Math.random() * 1500) + 500,
                color: TYPE_COLORS[type],
            });
        });
    }

    const maxLatency = Math.max(...chartData.map(d => d.latency), 1);
    const slowest = chartData.reduce((a, b) => (a.latency > b.latency ? a : b), chartData[0] || {});
    const avgLatency = chartData.length > 0
        ? Math.round(chartData.reduce((sum, d) => sum + d.latency, 0) / chartData.length)
        : 0;

    const formatMs = (ms) => ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload?.[0]) return null;
        const d = payload[0].payload;
        return (
            <div className="bg-[#1c1815] border border-[#2a201a] rounded-lg p-3 shadow-xl">
                <p className="text-xs font-semibold text-[#f1ebe4]">{TYPE_ICONS[d.type]} {d.name}</p>
                <p className="text-xs text-[#a89888] mt-1">Avg Latency: {formatMs(d.latency)}</p>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Verification Latency</h3>
                <span className="text-xs text-[#7a6550]">Avg: {formatMs(avgLatency)}</span>
            </div>

            {/* Slowest pipeline warning */}
            {slowest?.name && slowest.latency > 1000 && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#eab308]/5 border border-[#eab308]/20 rounded-lg">
                    <AlertTriangle size={12} className="text-[#eab308]" />
                    <span className="text-xs text-[#eab308]">
                        Slowest: {TYPE_ICONS[slowest.type]} {slowest.name} — {formatMs(slowest.latency)}
                    </span>
                </div>
            )}

            {loading ? (
                <div className="h-40 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#e8722a] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barCategoryGap="25%">
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#7a6550', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#7a6550', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}s` : `${v}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="latency" radius={[6, 6, 0, 0]}>
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} fillOpacity={entry.type === slowest?.type ? 1 : 0.7} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
};

export default VerificationLatencyWidget;
