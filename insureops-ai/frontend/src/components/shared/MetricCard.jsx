import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const VariantStyles = {
    default: 'border-white/10 text-white',
    success: 'border-emerald-500/30 text-emerald-400',
    warning: 'border-amber-500/30 text-amber-400',
    critical: 'border-red-500/30 text-red-400',
};

const TrendIcon = ({ trend, className }) => {
    if (trend > 0) return <ArrowUpRight className={className} />;
    if (trend < 0) return <ArrowDownRight className={className} />;
    return <Minus className={className} />;
};

const MetricCard = ({
    title,
    value,
    trend,
    trendLabel,
    variant = 'default',
    icon: Icon,
    className = '',
}) => {
    const isPositive = trend > 0;
    const isNegative = trend < 0;

    // Logic to determine trend color based on variant context
    // e.g. for Latency, increase is bad (red), for Accuracy, increase is good (green)
    // For now we'll stick to simple: green = up, red = down unless overridden
    let trendColor = isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-gray-400';

    return (
        <div className={`glass-card p-6 rounded-xl relative overflow-hidden group hover:border-[--color-accent]/30 transition-all duration-300 ${className}`}>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-[--color-text-secondary] uppercase tracking-wider">{title}</h3>
                {Icon && <Icon className="w-5 h-5 text-[--color-text-muted] group-hover:text-[--color-accent] transition-colors" />}
            </div>

            <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold tracking-tight text-[--color-text-primary] mt-1">{value}</span>
            </div>

            {(trend !== undefined || trendLabel) && (
                <div className="flex items-center gap-2 text-sm mt-3">
                    <span className={`inline-flex items-center gap-0.5 font-medium ${trendColor} bg-white/5 px-2 py-0.5 rounded-full`}>
                        {trend !== undefined && <TrendIcon trend={trend} className="w-3.5 h-3.5" />}
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                    <span className="text-[--color-text-muted] text-xs">{trendLabel || 'vs. last period'}</span>
                </div>
            )}

            {/* Decorative gradient blob */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[--color-accent] rounded-full mix-blend-overlay filter blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
        </div>
    );
};

export default MetricCard;
