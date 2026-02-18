import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const AGENT_COLORS = {
    claims: '#3b82f6',
    underwriting: '#10b981',
    fraud: '#f59e0b',
    support: '#a855f7'
};

const ResponseAccuracyWidget = ({ byAgent = {}, overall = 0 }) => {
    const chartData = useMemo(() => {
        return Object.entries(byAgent).map(([agent, accuracy]) => ({
            agent: agent.charAt(0).toUpperCase() + agent.slice(1),
            accuracy,
            key: agent,
            fill: AGENT_COLORS[agent] || '#64748b'
        }));
    }, [byAgent]);

    // Compute trend vs a baseline of 80%
    const overallTrend = overall > 0 ? (overall - 80).toFixed(1) : '0.0';

    return (
        <div className="glass-card p-6 rounded-xl col-span-2">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-sm font-medium text-[--color-text-secondary] uppercase tracking-wider">Response Accuracy</h3>
                    <p className="text-2xl font-bold text-[--color-text-primary] mt-1">
                        {overall}%
                        <span className={`text-sm font-normal ml-2 ${parseFloat(overallTrend) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {parseFloat(overallTrend) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(overallTrend))}% vs baseline
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs bg-white/5 rounded border border-white/10 text-[--color-text-muted]">Per Agent</span>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis type="category" dataKey="agent" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={100} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                            formatter={(value) => [`${value}%`, 'Accuracy']}
                        />
                        <ReferenceLine x={80} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: '80% threshold', position: 'top', fill: '#ef4444', fontSize: 10 }} />
                        <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ResponseAccuracyWidget;
