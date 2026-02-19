import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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

const InsuranceTypeDistribution = ({ data, loading }) => {
    const distribution = data?.distribution || {};
    const totalClaims = data?.totalClaims || Object.values(distribution).reduce((a, b) => a + b, 0);

    const chartData = Object.entries(distribution)
        .map(([type, count]) => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: count,
            type,
            color: TYPE_COLORS[type] || '#7a6550',
        }))
        .filter(d => d.value > 0);

    // If no data, show placeholder
    if (chartData.length === 0 && !loading) {
        chartData.push(
            { name: 'Health', value: 12, type: 'health', color: TYPE_COLORS.health },
            { name: 'Vehicle', value: 9, type: 'vehicle', color: TYPE_COLORS.vehicle },
            { name: 'Travel', value: 7, type: 'travel', color: TYPE_COLORS.travel },
            { name: 'Property', value: 5, type: 'property', color: TYPE_COLORS.property },
            { name: 'Life', value: 3, type: 'life', color: TYPE_COLORS.life },
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload?.[0]) return null;
        const d = payload[0].payload;
        const pct = totalClaims > 0 ? ((d.value / totalClaims) * 100).toFixed(1) : 0;
        return (
            <div className="bg-[#1c1815] border border-[#2a201a] rounded-lg p-3 shadow-xl">
                <p className="text-xs font-semibold text-[#f1ebe4]">{TYPE_ICONS[d.type]} {d.name}</p>
                <p className="text-xs text-[#a89888] mt-1">{d.value} claims ({pct}%)</p>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Claims by Insurance Type</h3>
                <span className="text-xs text-[#7a6550]">{totalClaims} total</span>
            </div>

            {loading ? (
                <div className="h-48 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#e8722a] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    {/* Donut chart */}
                    <div className="relative w-48 h-48 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={52}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-[#f1ebe4]">{totalClaims}</span>
                            <span className="text-[10px] text-[#7a6550] uppercase tracking-wider">Claims</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-2">
                        {chartData.map((d) => {
                            const pct = totalClaims > 0 ? ((d.value / totalClaims) * 100).toFixed(0) : 0;
                            return (
                                <div key={d.type} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                        <span className="text-[#a89888]">{TYPE_ICONS[d.type]} {d.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#f1ebe4] font-semibold">{d.value}</span>
                                        <span className="text-[#7a6550] w-8 text-right">{pct}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default InsuranceTypeDistribution;
