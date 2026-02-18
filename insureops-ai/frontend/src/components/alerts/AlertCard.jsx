import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, XCircle, Clock, Eye } from 'lucide-react';

const severityConfig = {
    critical: { icon: XCircle, color: '#ef4444', bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30', label: 'Critical' },
    warning: { icon: AlertTriangle, color: '#eab308', bg: 'bg-[#eab308]/10', border: 'border-[#eab308]/30', label: 'Warning' },
    info: { icon: Info, color: '#3b82f6', bg: 'bg-[#3b82f6]/10', border: 'border-[#3b82f6]/30', label: 'Info' },
    resolved: { icon: CheckCircle, color: '#22c55e', bg: 'bg-[#22c55e]/10', border: 'border-[#22c55e]/30', label: 'Resolved' },
};

const AlertCard = ({ alert, onAcknowledge }) => {
    const [acknowledged, setAcknowledged] = useState(alert?.acknowledged || false);
    const config = severityConfig[alert?.severity] || severityConfig.info;
    const Icon = config.icon;

    const handleAck = () => {
        setAcknowledged(true);
        onAcknowledge?.(alert);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#1c1815] border rounded-2xl p-5 ${config.border} hover:border-opacity-60 transition-all`}
        >
            <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
                    <Icon size={16} style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-[#f1ebe4]">{alert?.name || 'Alert'}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg}`} style={{ color: config.color }}>
                            {config.label}
                        </span>
                    </div>
                    <p className="text-xs text-[#a89888] mb-2">{alert?.description}</p>

                    {/* Metric details */}
                    <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#7a6550]">Current:</span>
                            <span className="text-xs font-bold text-[#f1ebe4]">{alert?.currentValue}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#7a6550]">Threshold:</span>
                            <span className="text-xs font-bold" style={{ color: config.color }}>{alert?.threshold}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#7a6550]">
                            <Clock size={10} />
                            <span className="text-[10px]">{alert?.time || 'Just now'}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {!acknowledged ? (
                            <button
                                onClick={handleAck}
                                className="bg-[#2a201a] text-[#e8722a] rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[#3d3028] transition-colors"
                            >
                                Acknowledge
                            </button>
                        ) : (
                            <span className="flex items-center gap-1 text-xs text-[#22c55e]">
                                <CheckCircle size={12} /> Acknowledged
                            </span>
                        )}
                        <button className="text-[#7a6550] hover:text-[#a89888] transition-colors">
                            <Eye size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AlertCard;
