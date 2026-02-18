import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ApiRatesWidget = ({ success = 0, failure = 0, successRate = 100 }) => {
    const total = success + failure;
    const failureRate = total > 0 ? ((failure / total) * 100).toFixed(1) : '0.0';

    const chartData = useMemo(() => {
        if (total === 0) {
            return [{ name: 'No Data', value: 100, color: '#334155' }];
        }
        const items = [{ name: 'Success', value: success, color: '#10b981' }];
        if (failure > 0) {
            items.push({ name: 'Failure', value: failure, color: '#ef4444' });
        }
        return items;
    }, [success, failure, total]);

    return (
        <div className="glass-card p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-[--color-text-secondary] uppercase tracking-wider">API Health</h3>
            </div>

            <div className="flex items-center gap-6">
                <div className="h-32 w-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                                formatter={(value) => [value.toLocaleString(), 'Calls']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-lg font-bold text-[--color-text-primary]">{successRate}%</span>
                    </div>
                </div>

                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-[--color-text-secondary]">Success</span>
                        </div>
                        <span className="font-semibold text-[--color-text-primary]">{success.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-[--color-text-secondary]">Failure</span>
                        </div>
                        <span className="font-semibold text-[--color-text-primary]">{failure.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                        <div className="flex justify-between text-xs text-[--color-text-muted]">
                            <span>Total Requests</span>
                            <span>{total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[--color-text-muted] mt-1">
                            <span>Failure Rate</span>
                            <span>{failureRate}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiRatesWidget;
