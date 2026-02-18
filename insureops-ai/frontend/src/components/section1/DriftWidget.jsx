
import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// Simulated distributions — in production these would come from the backend
const baselineData = Array.from({ length: 20 }, (_, i) => ({
    x: i,
    y: Math.exp(-Math.pow(i - 10, 2) / 10)
}));

const DriftWidget = ({ score = 0.05, status = 'normal' }) => {
    // Shift the "current" distribution based on actual drift score
    const shift = score * 10; // Higher drift → more visual shift
    const currentData = Array.from({ length: 20 }, (_, i) => ({
        x: i,
        y: Math.exp(-Math.pow(i - (10 + shift), 2) / (10 + shift))
    }));

    const isWarning = status !== 'normal';

    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-[#f1ebe4] uppercase tracking-wider">Model Drift</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${!isWarning ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {!isWarning ? 'Healthy' : 'Drift Detected'}
                </span>
            </div>
            <div className="flex items-end justify-between mb-4">
                <div>
                    <span className="text-[#a89888] text-xs">Drift Score (KL Div)</span>
                    <p className={`text-2xl font-bold ${isWarning ? 'text-red-400' : 'text-[#f1ebe4]'}`}>{score}</p>
                </div>
                <span className="text-xs text-[#a89888]">Threshold: 0.3</span>
            </div>
            <div className="h-32 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart>
                        <Area data={baselineData} dataKey="y" stroke="none" fill="#94a3b8" fillOpacity={0.2} />
                        <Area data={currentData} dataKey="y" stroke={isWarning ? '#ef4444' : '#e07020'} strokeWidth={2} fill={`url(#driftGradient-${status})`} fillOpacity={0.6} />
                        <defs>
                            <linearGradient id={`driftGradient-${status}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isWarning ? '#ef4444' : '#e07020'} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={isWarning ? '#ef4444' : '#e07020'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                    </AreaChart>
                </ResponsiveContainer>
                <div className="absolute top-0 right-0 p-2 text-xs text-[#a89888]">
                    <span className="inline-block w-2 h-2 bg-slate-500/50 mr-1 rounded-full"></span> Baseline
                    <span className={`inline-block w-2 h-2 ml-2 mr-1 rounded-full ${isWarning ? 'bg-red-400' : 'bg-orange-400'}`}></span> Current
                </div>
            </div>
            <p className="text-xs text-[#a89888] mt-2">
                Output distribution comparison. Higher score indicates significant deviation from training/baseline data.
            </p>
        </div>
    );
};

export default DriftWidget;
