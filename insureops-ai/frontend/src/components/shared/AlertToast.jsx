import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Bell, CheckCircle, XCircle } from 'lucide-react';
import { useWS } from '../../contexts/WebSocketProvider';

const severityConfig = {
    critical: { color: '#ef4444', bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30', icon: XCircle },
    warning: { color: '#eab308', bg: 'bg-[#eab308]/10', border: 'border-[#eab308]/30', icon: AlertTriangle },
    info: { color: '#3b82f6', bg: 'bg-[#3b82f6]/10', border: 'border-[#3b82f6]/30', icon: Bell },
    success: { color: '#22c55e', bg: 'bg-[#22c55e]/10', border: 'border-[#22c55e]/30', icon: CheckCircle },
};

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 6000;

const AlertToast = () => {
    const { subscribe } = useWS();
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        setToasts(prev => {
            const next = [{ id, ...toast, createdAt: Date.now() }, ...prev];
            return next.slice(0, MAX_TOASTS); // keep only latest N
        });

        // Auto-dismiss
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, AUTO_DISMISS_MS);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Subscribe to alert events
    useEffect(() => {
        const unsub1 = subscribe('new_alert', (data) => {
            const alert = data.alert || data;
            addToast({
                title: alert.rule_name || alert.alert_type || 'Alert Triggered',
                message: alert.message || alert.details || 'A new alert has been fired.',
                severity: alert.severity || 'warning',
            });
        });

        const unsub2 = subscribe('alert_update', (data) => {
            const alert = data.alert || data;
            addToast({
                title: alert.rule_name || alert.alert_type || 'Alert',
                message: alert.message || alert.details || 'Alert update received.',
                severity: alert.severity || 'warning',
            });
        });

        // Also show a subtle toast when a new trace completes
        const unsub3 = subscribe('new_trace', (data) => {
            const trace = data.trace || data;
            addToast({
                title: `${(trace.agent_type || 'Agent').charAt(0).toUpperCase() + (trace.agent_type || 'agent').slice(1)} Trace`,
                message: `Decision: ${trace.decision_type || trace.output_data?.decision || 'completed'}`,
                severity: 'success',
            });
        });

        return () => { unsub1(); unsub2(); unsub3(); };
    }, [subscribe, addToast]);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 380 }}>
            <AnimatePresence>
                {toasts.map((toast) => {
                    const cfg = severityConfig[toast.severity] || severityConfig.info;
                    const Icon = cfg.icon;

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 80, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm ${cfg.bg} ${cfg.border}`}
                            style={{ backgroundColor: 'rgba(15, 13, 11, 0.95)' }}
                        >
                            {/* Icon */}
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: `${cfg.color}15` }}
                            >
                                <Icon size={16} style={{ color: cfg.color }} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#f1ebe4] truncate">{toast.title}</p>
                                <p className="text-xs text-[#7a6550] mt-0.5 line-clamp-2">{toast.message}</p>
                            </div>

                            {/* Dismiss */}
                            <button
                                onClick={() => dismiss(toast.id)}
                                className="flex-shrink-0 p-1 hover:bg-[#2a201a] rounded-lg transition-colors"
                            >
                                <X size={12} className="text-[#7a6550]" />
                            </button>

                            {/* Auto-dismiss progress bar */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-0.5 rounded-b-xl"
                                style={{ backgroundColor: cfg.color }}
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default AlertToast;
