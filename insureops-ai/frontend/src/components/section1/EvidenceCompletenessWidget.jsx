import { motion } from 'framer-motion';

const TYPE_CONFIG = {
    health: { color: '#22c55e', icon: '🏥', label: 'Health' },
    vehicle: { color: '#3b82f6', icon: '🚗', label: 'Vehicle' },
    travel: { color: '#a855f7', icon: '✈️', label: 'Travel' },
    property: { color: '#eab308', icon: '🏠', label: 'Property' },
    life: { color: '#ec4899', icon: '❤️', label: 'Life' },
};

const GaugeArc = ({ score, color, size = 80 }) => {
    const radius = (size - 8) / 2;
    const circumference = Math.PI * radius; // Half circle
    const pct = Math.max(0, Math.min(score > 1 ? score : score * 100, 100));
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - pct / 100);

    const getColor = (v) => {
        if (v >= 80) return color;
        if (v >= 50) return '#eab308';
        return '#ef4444';
    };

    return (
        <div className="relative" style={{ width: size, height: size / 2 + 16 }}>
            <svg
                width={size}
                height={size / 2 + 8}
                viewBox={`0 0 ${size} ${size / 2 + 8}`}
            >
                {/* Background arc */}
                <path
                    d={`M 4 ${size / 2 + 4} A ${radius} ${radius} 0 0 1 ${size - 4} ${size / 2 + 4}`}
                    fill="none"
                    stroke="#2a201a"
                    strokeWidth={6}
                    strokeLinecap="round"
                />
                {/* Value arc */}
                <motion.path
                    d={`M 4 ${size / 2 + 4} A ${radius} ${radius} 0 0 1 ${size - 4} ${size / 2 + 4}`}
                    fill="none"
                    stroke={getColor(pct)}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </svg>
            {/* Center value */}
            <div className="absolute bottom-0 left-0 right-0 text-center">
                <span className="text-sm font-bold" style={{ color: getColor(pct) }}>
                    {pct.toFixed(0)}%
                </span>
            </div>
        </div>
    );
};

const EvidenceCompletenessWidget = ({ data, loading }) => {
    const completenessByType = data?.completenessByType || {};

    // Use defaults if empty
    const types = Object.keys(TYPE_CONFIG);
    const gauges = types.map(type => ({
        ...TYPE_CONFIG[type],
        type,
        score: completenessByType[type] != null ? completenessByType[type] : 0,
    }));

    // Mock data if no scores
    const hasData = gauges.some(g => g.score > 0);

    const avgScore = gauges.length > 0
        ? gauges.reduce((sum, g) => sum + (g.score > 1 ? g.score / 100 : g.score), 0) / gauges.length
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors md:col-span-2"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Evidence Completeness</h3>
                <span className="text-xs text-[#7a6550]">
                    Avg: <span style={{ color: avgScore >= 0.8 ? '#22c55e' : avgScore >= 0.5 ? '#eab308' : '#ef4444' }}>
                        {(avgScore * 100).toFixed(0)}%
                    </span>
                </span>
            </div>

            {loading ? (
                <div className="h-32 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#e8722a] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex justify-between items-end gap-2">
                    {gauges.map(g => (
                        <div key={g.type} className="flex flex-col items-center gap-1">
                            <GaugeArc score={g.score} color={g.color} size={80} />
                            <div className="text-center mt-1">
                                <span className="text-sm">{g.icon}</span>
                                <p className="text-[10px] text-[#7a6550] uppercase tracking-wider">{g.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default EvidenceCompletenessWidget;
