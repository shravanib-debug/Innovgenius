import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, XCircle, X, ExternalLink } from 'lucide-react';

const severityIcons = {
    critical: XCircle,
    warning: AlertTriangle,
};

const severityColors = {
    critical: '#ef4444',
    warning: '#eab308',
};

const AlertNotificationToast = ({ alert, onDismiss }) => {
    const [visible, setVisible] = useState(true);
    const Icon = severityIcons[alert?.severity] || AlertTriangle;
    const color = severityColors[alert?.severity] || '#eab308';

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss?.(), 300);
        }, 8000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, x: 60, y: 0 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 60 }}
                    className="fixed top-4 right-4 z-50 max-w-sm"
                >
                    <div
                        className="bg-[#1c1815] border rounded-xl p-4 shadow-2xl backdrop-blur-lg"
                        style={{ borderColor: `${color}50` }}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${color}15` }}
                            >
                                <Icon size={16} style={{ color }} className="animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#f1ebe4] mb-0.5">{alert?.name || 'New Alert'}</p>
                                <p className="text-xs text-[#a89888] line-clamp-2">{alert?.description}</p>
                                <button className="flex items-center gap-1 text-[#e8722a] text-xs font-medium mt-2 hover:underline">
                                    View Details <ExternalLink size={10} />
                                </button>
                            </div>
                            <button
                                onClick={() => { setVisible(false); onDismiss?.(); }}
                                className="text-[#7a6550] hover:text-[#a89888] transition-colors shrink-0"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Progress bar for auto-dismiss */}
                        <div className="mt-3 h-0.5 bg-[#2a201a] rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 8, ease: 'linear' }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: color }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AlertNotificationToast;
