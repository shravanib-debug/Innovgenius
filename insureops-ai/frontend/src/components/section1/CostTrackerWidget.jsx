
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AGENT_COLORS = {
    claims: '#3b82f6',
    underwriting: '#10b981',
    fraud: '#f59e0b',
    support: '#a855f7'
};

const CostTrackerWidget = ({ total = 0, byAgent = {}, trend = [], avgPerRequest = 0 }) => {
    const budget = 50.00; // Daily budget threshold
    const percentUsed = budget > 0 ? (total / budget) * 100 : 0;

    // Build per-agent bar chart
    const agentChart = useMemo(() => {
        return Object.entries(byAgent).map(([agent, cost]) => ({
            agent: agent.charAt(0).toUpperCase() + agent.slice(1),
            cost: Math.round(cost * 100) / 100,
            fill: AGENT_COLORS[agent] || '#64748b'
        }));
    }, [byAgent]);

    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-[#f1ebe4] uppercase tracking-wider">Est. Daily Cost</h3>
                <span className="text-xs bg-white/5 px-2 py-1 rounded text-[#a89888]">Budget: ${budget}/day</span>
            </div>
            <div className="mb-6">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#f1ebe4]">${total.toFixed(2)}</span>
                    <span className="text-sm text-[#a89888]">USD</span>
                </div>
                <p className="text-xs text-[#a89888] mt-1">Avg ${avgPerRequest.toFixed(4)}/request</p>
                {/* Progress bar */}
                <div className="mt-3 w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${percentUsed > 90 ? 'bg-red-500' : percentUsed > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    ></div>
                </div>
                <p className="text-xs text-[#a89888] mt-1 text-right">{percentUsed.toFixed(0)}% of daily budget</p>
            </div>
            <div className="h-32 w-full">
                {agentChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={agentChart}>
                            <XAxis dataKey="agent" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                formatter={(value) => [`$${value}`, 'Cost']}
                            />
                            <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                                {agentChart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-sm text-[#a89888]">
                        No cost data available
                    </div>
                )}
            </div>
        </div>
    );
};

export default CostTrackerWidget;
