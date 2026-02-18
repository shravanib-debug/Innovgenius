import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import AlertCard from '../components/alerts/AlertCard';
import AlertRulesPanel from '../components/alerts/AlertRulesPanel';
import AlertNotificationToast from '../components/alerts/AlertNotificationToast';
import { getAlerts, acknowledgeAlert } from '../services/api';
import { useApiData } from '../hooks/useApiData';

const demoAlerts = [
    { id: 1, name: 'P95 Latency Spike', severity: 'critical', description: 'Claims Agent P95 latency exceeded 5s threshold.', currentValue: '6.2s', threshold: '5.0s', time: '2 min ago', acknowledged: false },
    { id: 2, name: 'Fraud Detection Accuracy Drop', severity: 'warning', description: 'Fraud Agent accuracy has fallen below 85% threshold.', currentValue: '82.1%', threshold: '85%', time: '14 min ago', acknowledged: false },
    { id: 3, name: 'Daily Budget Warning', severity: 'warning', description: 'API cost approaching daily budget limit.', currentValue: '$42.30', threshold: '$50.00', time: '28 min ago', acknowledged: true },
];

const AlertsPage = () => {
    const [filter, setFilter] = useState('all');
    const [showToast, setShowToast] = useState(true);

    const fetchAlerts = useCallback(() => getAlerts(), []);
    const { data: apiData, isLive, refetch } = useApiData(fetchAlerts, null, []);

    // Transform API alerts to display format, or use demo alerts as fallback
    const allAlerts = apiData?.alerts
        ? apiData.alerts.map(a => ({
            id: a.id,
            name: a.rule_name || 'Alert',
            severity: a.severity,
            description: a.details ? JSON.stringify(a.details) : `${a.rule_name} triggered`,
            currentValue: a.current_value ? parseFloat(a.current_value).toFixed(2) : '—',
            threshold: a.threshold_value ? parseFloat(a.threshold_value).toFixed(2) : '—',
            time: new Date(a.triggered_at || a.created_at).toLocaleString(),
            acknowledged: a.acknowledged,
            agent_type: a.agent_type,
        }))
        : demoAlerts;

    const filteredAlerts = allAlerts.filter((a) => {
        if (filter === 'active') return !a.acknowledged;
        if (filter === 'acknowledged') return a.acknowledged;
        return true;
    });

    const handleAcknowledge = async (alertId) => {
        try {
            await acknowledgeAlert(alertId);
            refetch();
        } catch (e) {
            console.warn('Failed to acknowledge alert:', e.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Toast */}
            {showToast && filteredAlerts.length > 0 && (
                <AlertNotificationToast
                    alert={filteredAlerts[0]}
                    onDismiss={() => setShowToast(false)}
                />
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">Alerts</h1>
                    <p className="text-[#a89888]">Monitor and manage alert rules, active alerts, and notifications.</p>
                    {isLive && (
                        <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            LIVE DATA
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {['all', 'active', 'acknowledged'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f
                                ? 'bg-[#e8722a] text-white'
                                : 'bg-[#1c1815] text-[#a89888] border border-[#2a201a] hover:text-[#f1ebe4]'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-3">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-4 text-center">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">Total Alerts</p>
                    <p className="text-2xl font-bold text-[#f1ebe4]">{allAlerts.length}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[#1c1815] border border-[#ef4444]/20 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">Critical</p>
                    <p className="text-2xl font-bold text-[#ef4444]">{allAlerts.filter(a => a.severity === 'critical').length}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1c1815] border border-[#eab308]/20 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">Warnings</p>
                    <p className="text-2xl font-bold text-[#eab308]">{allAlerts.filter(a => a.severity === 'warning').length}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#1c1815] border border-[#22c55e]/20 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-[#7a6550] uppercase tracking-wider mb-1">Acknowledged</p>
                    <p className="text-2xl font-bold text-[#22c55e]">{allAlerts.filter(a => a.acknowledged).length}</p>
                </motion.div>
            </div>

            {/* Active alerts */}
            <div>
                <h2 className="text-lg font-semibold text-[#f1ebe4] mb-3">
                    {filter === 'all' ? 'All Alerts' : filter === 'active' ? 'Active Alerts' : 'Acknowledged Alerts'}
                    <span className="text-sm font-normal text-[#7a6550] ml-2">({filteredAlerts.length})</span>
                </h2>
                <div className="space-y-3">
                    {filteredAlerts.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} onAcknowledge={isLive ? handleAcknowledge : undefined} />
                    ))}
                    {filteredAlerts.length === 0 && (
                        <p className="text-center text-[#7a6550] py-8">No alerts to display.</p>
                    )}
                </div>
            </div>

            {/* Rules panel */}
            <AlertRulesPanel />
        </div>
    );
};

export default AlertsPage;
