
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LatencyWidget = ({ p50 = 0, p95 = 0, p99 = 0, trend = [], slaBreach = false }) => {
    // Format milliseconds to human readable
    const fmt = (ms) => ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;

    // Transform trend data for the chart
    const chartData = useMemo(() => {
        if (Array.isArray(trend) && trend.length > 0) {
            return trend.map(item => ({
                time: item.time ? item.time.split('T').pop()?.replace(':00', 'h') : '',
                value: item.value || 0
            }));
        }
        return [];
    }, [trend]);

    return (
        <div className={`bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 ${slaBreach ? 'border-red-500/30' : ''}`}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-sm font-medium text-[#f1ebe4] uppercase tracking-wider">Latency (ms)</h3>
                    <div className="flex gap-4 mt-2">
                        <div>
                            <span className="text-xs text-[#a89888] block">P50</span>
                            <span className="text-xl font-bold text-[#f1ebe4]">{fmt(p50)}</span>
                        </div>
                        <div>
                            <span className="text-xs text-[#a89888] block">P95</span>
                            <span className={`text-xl font-bold ${slaBreach ? 'text-red-400' : 'text-[#f1ebe4]'}`}>{fmt(p95)}</span>
                        </div>
                        <div>
                            <span className="text-xs text-[#a89888] block">P99</span>
                            <span className="text-xl font-bold text-[#f1ebe4]">{fmt(p99)}</span>
                        </div>
                    </div>
                </div>
                {slaBreach && (
                    <span className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded border border-red-500/20 animate-pulse">
                        SLA Breach
                    </span>
                )}
            </div>
            <div className="h-40 w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={slaBreach ? '#f43f5e' : '#3b82f6'} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={slaBreach ? '#f43f5e' : '#3b82f6'} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="time" hide />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                formatter={(value) => [`${value}ms`, 'Latency']}
                            />
                            <Area type="monotone" dataKey="value" stroke={slaBreach ? '#f43f5e' : '#3b82f6'} fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-sm text-[#a89888]">
                        No trend data available
                    </div>
                )}
            </div>
        </div>
    );
};

export default LatencyWidget;
