import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const PromptQualityWidget = ({ score = 85, trend = [] }) => {
    const data = [{ name: 'Quality', value: score, fill: 'var(--color-accent)' }];

    // Calculate trend percentage from trend array
    const trendPct = (() => {
        if (Array.isArray(trend) && trend.length >= 2) {
            const first = trend[0]?.value ?? 0;
            const last = trend[trend.length - 1]?.value ?? 0;
            return first > 0 ? Math.round(((last - first) / first) * 10000) / 100 : 0;
        }
        return typeof trend === 'number' ? trend : 0;
    })();

    const getQualityLabel = (s) => {
        if (s >= 90) return 'Excellent';
        if (s >= 80) return 'Good';
        if (s >= 60) return 'Fair';
        return 'Needs Work';
    };

    return (
        <div className="glass-card p-6 rounded-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-[--color-text-secondary] uppercase tracking-wider">Prompt Quality</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trendPct >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {trendPct > 0 ? '+' : ''}{trendPct}%
                </span>
            </div>

            <div className="h-48 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={10} data={data} startAngle={90} endAngle={-270}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-[--color-text-primary]">{score}</span>
                    <span className="text-sm text-[--color-text-muted] font-medium">{getQualityLabel(score)}</span>
                </div>
            </div>

            <p className="text-xs text-center text-[--color-text-muted] mt-2">
                Based on structure, token efficiency, and template adherence.
            </p>
        </div>
    );
};

export default PromptQualityWidget;
