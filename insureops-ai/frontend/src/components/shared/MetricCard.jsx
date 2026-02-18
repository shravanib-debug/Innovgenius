import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const variantClasses = {
    default: 'border-[#2a201a]',
    success: 'border-[#22c55e]/30',
    warning: 'border-[#eab308]/30',
    critical: 'border-[#ef4444]/30',
};

const variantAccent = {
    default: 'text-[#e8722a]',
    success: 'text-[#22c55e]',
    warning: 'text-[#eab308]',
    critical: 'text-[#ef4444]',
};

const MetricCard = ({ title, value, subtitle, change, positive = true, variant = 'default', icon: Icon }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#1c1815] border rounded-xl p-4 relative overflow-hidden group hover:border-[#e8722a]/25 transition-colors ${variantClasses[variant]}`}
        >
            {Icon && (
                <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon size={32} />
                </div>
            )}
            <p className="text-[#a89888] text-xs font-medium mb-1 uppercase tracking-wide">{title}</p>
            <div className="flex items-end gap-2 mb-1">
                <span className={`text-2xl font-bold ${variantAccent[variant] || 'text-[#f1ebe4]'}`}>{value}</span>
                {change && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {change}
                    </span>
                )}
            </div>
            {subtitle && <p className="text-[#7a6550] text-xs">{subtitle}</p>}
        </motion.div>
    );
};

export default MetricCard;
