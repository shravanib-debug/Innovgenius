import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const toolColors = ['#e8722a', '#f2923c', '#3b82f6', '#60a5fa', '#22c55e', '#4ade80', '#eab308', '#fbbf24', '#ef4444', '#a855f7'];

const mockToolData = [
    { name: 'policy_lookup', calls: 342, success: 98 },
    { name: 'coverage_checker', calls: 298, success: 97 },
    { name: 'payout_calculator', calls: 256, success: 99 },
    { name: 'risk_score_calc', calls: 189, success: 96 },
    { name: 'duplicate_checker', calls: 312, success: 94 },
    { name: 'pattern_analyzer', calls: 284, success: 92 },
];

const ToolUsageWidget = ({ data, loading }) => {
    // Transform API data: { tool_name: { count, successCount, avgDuration, successRate } }
    const toolFrequency = data && Object.keys(data).length > 0
        ? Object.entries(data).map(([name, info], i) => ({
            name,
            calls: info.count,
            success: info.successRate ?? 100,
            avgMs: info.avgDuration ?? 0,
            fill: toolColors[i % toolColors.length],
        })).sort((a, b) => b.calls - a.calls)
        : mockToolData.map((t, i) => ({ ...t, fill: toolColors[i % toolColors.length] }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Tool Usage</h3>

            {/* Frequency bars */}
            <div className="h-44 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={toolFrequency} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#a89888', fontSize: 9 }} width={100} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ background: '#1c1815', border: '1px solid #2a201a', borderRadius: '8px', fontSize: '12px' }}
                            labelStyle={{ color: '#a89888' }}
                            formatter={(val, name) => [val, name === 'calls' ? 'Calls' : name]}
                        />
                        <Bar dataKey="calls" radius={[0, 4, 4, 0]}>
                            {toolFrequency.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Tool stats table */}
            <div className="space-y-1.5">
                {toolFrequency.slice(0, 5).map((tool) => (
                    <div key={tool.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tool.fill }} />
                        <span className="text-[#a89888] flex-1 truncate">{tool.name}</span>
                        <span className="text-[#f1ebe4] font-semibold">{tool.calls}</span>
                        <span className={`text-[10px] font-medium ${tool.success >= 95 ? 'text-[#22c55e]' : 'text-[#eab308]'}`}>
                            {tool.success}%
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default ToolUsageWidget;
