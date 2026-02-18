import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Bell, Activity } from 'lucide-react';

const demoRules = [
    { id: 1, name: 'High Latency', metric: 'P95 Latency', operator: '>', threshold: '5000ms', agent: 'All', severity: 'critical', enabled: true },
    { id: 2, name: 'Low Accuracy', metric: 'Response Accuracy', operator: '<', threshold: '80%', agent: 'All', severity: 'warning', enabled: true },
    { id: 3, name: 'Budget Exceeded', metric: 'Daily Cost', operator: '>', threshold: '$50', agent: 'All', severity: 'critical', enabled: true },
    { id: 4, name: 'High Escalation', metric: 'Escalation Rate', operator: '>', threshold: '25%', agent: 'Claims', severity: 'warning', enabled: false },
    { id: 5, name: 'Fraud Rate Spike', metric: 'Fraud Detection Rate', operator: '>', threshold: '15%', agent: 'Fraud', severity: 'critical', enabled: true },
];

const severityColors = {
    critical: 'text-[#ef4444] bg-[#ef4444]/10',
    warning: 'text-[#eab308] bg-[#eab308]/10',
    info: 'text-[#3b82f6] bg-[#3b82f6]/10',
};

const AlertRulesPanel = () => {
    const [rules, setRules] = useState(demoRules);
    const [showModal, setShowModal] = useState(false);
    const [newRule, setNewRule] = useState({ name: '', metric: '', operator: '>', threshold: '', agent: 'All', severity: 'warning' });

    const toggleRule = (id) => {
        setRules(rules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };

    const deleteRule = (id) => {
        setRules(rules.filter((r) => r.id !== id));
    };

    const addRule = () => {
        if (!newRule.name || !newRule.metric || !newRule.threshold) return;
        setRules([...rules, { ...newRule, id: Date.now(), enabled: true }]);
        setNewRule({ name: '', metric: '', operator: '>', threshold: '', agent: 'All', severity: 'warning' });
        setShowModal(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Alert Rules</h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 bg-[#e8722a] text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[#c45a1a] transition-colors"
                >
                    <Plus size={14} /> Add Rule
                </button>
            </div>

            {/* Rules table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#2a201a]">
                            <th className="text-left text-[10px] text-[#7a6550] uppercase tracking-wider py-2 pr-3 font-medium">Rule</th>
                            <th className="text-left text-[10px] text-[#7a6550] uppercase tracking-wider py-2 pr-3 font-medium">Condition</th>
                            <th className="text-left text-[10px] text-[#7a6550] uppercase tracking-wider py-2 pr-3 font-medium">Agent</th>
                            <th className="text-left text-[10px] text-[#7a6550] uppercase tracking-wider py-2 pr-3 font-medium">Severity</th>
                            <th className="text-right text-[10px] text-[#7a6550] uppercase tracking-wider py-2 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.map((rule) => (
                            <tr key={rule.id} className={`border-b border-[#2a201a]/50 ${!rule.enabled ? 'opacity-40' : ''}`}>
                                <td className="py-3 pr-3">
                                    <div className="flex items-center gap-2">
                                        <Bell size={12} className="text-[#7a6550]" />
                                        <span className="text-xs font-medium text-[#f1ebe4]">{rule.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 pr-3">
                                    <span className="text-xs text-[#a89888] font-mono">{rule.metric} {rule.operator} {rule.threshold}</span>
                                </td>
                                <td className="py-3 pr-3">
                                    <span className="text-xs text-[#a89888]">{rule.agent}</span>
                                </td>
                                <td className="py-3 pr-3">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${severityColors[rule.severity]}`}>
                                        {rule.severity}
                                    </span>
                                </td>
                                <td className="py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => toggleRule(rule.id)}
                                            className={`w-8 h-4 rounded-full transition-colors relative ${rule.enabled ? 'bg-[#22c55e]' : 'bg-[#2a201a]'}`}
                                        >
                                            <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${rule.enabled ? 'left-4.5 right-0.5' : 'left-0.5'}`}
                                                style={{ left: rule.enabled ? '17px' : '2px' }}
                                            />
                                        </button>
                                        <button onClick={() => deleteRule(rule.id)} className="text-[#7a6550] hover:text-[#ef4444] transition-colors">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Rule Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-[#f1ebe4]">New Alert Rule</h4>
                                <button onClick={() => setShowModal(false)} className="text-[#7a6550] hover:text-[#a89888]">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text" placeholder="Rule Name"
                                    className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none"
                                    value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                />
                                <input
                                    type="text" placeholder="Metric (e.g. P95 Latency)"
                                    className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none"
                                    value={newRule.metric} onChange={(e) => setNewRule({ ...newRule, metric: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <select
                                        className="bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm w-20"
                                        value={newRule.operator} onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                                    >
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                        <option value="=">=</option>
                                    </select>
                                    <input
                                        type="text" placeholder="Threshold"
                                        className="flex-1 bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none"
                                        value={newRule.threshold} onChange={(e) => setNewRule({ ...newRule, threshold: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm"
                                        value={newRule.agent} onChange={(e) => setNewRule({ ...newRule, agent: e.target.value })}
                                    >
                                        <option value="All">All Agents</option>
                                        <option value="Claims">Claims</option>
                                        <option value="Underwriting">Underwriting</option>
                                        <option value="Fraud">Fraud</option>
                                    </select>
                                    <select
                                        className="flex-1 bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm"
                                        value={newRule.severity} onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                                    >
                                        <option value="critical">Critical</option>
                                        <option value="warning">Warning</option>
                                        <option value="info">Info</option>
                                    </select>
                                </div>
                                <button
                                    onClick={addRule}
                                    className="w-full bg-[#e8722a] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#c45a1a] transition-colors"
                                >
                                    Create Rule
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AlertRulesPanel;
