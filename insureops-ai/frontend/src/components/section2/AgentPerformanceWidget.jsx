import { motion } from 'framer-motion';

const AGENT_LABELS = {
    claims: 'Claims Agent',
    underwriting: 'Underwriting Agent',
    fraud: 'Fraud Agent',
    support: 'Support Agent',
};

const statusColors = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };

const AgentPerformanceWidget = ({ data, loading }) => {
    // Build agent list purely from API data
    const agentTypes = ['claims', 'underwriting', 'fraud', 'support'];
    const agents = agentTypes.map(type => {
        const real = data?.[type];
        if (!real) return { name: AGENT_LABELS[type], type, success: 0, avgLatency: 0, avgCost: 0, totalTraces: 0, status: 'green' };
        return {
            name: AGENT_LABELS[type],
            type,
            success: real.successRate ?? 0,
            avgLatency: real.avgLatency ?? 0,
            avgCost: real.avgCost ?? 0,
            totalTraces: real.totalTraces ?? 0,
            status: (real.successRate ?? 100) >= 90 ? 'green' : (real.successRate ?? 100) >= 80 ? 'yellow' : 'red',
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Agent Performance</h3>

            <div className="space-y-3">
                {agents.map((agent) => (
                    <div key={agent.name} className="bg-[#0f0d0b] rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[agent.status] }} />
                                <span className="text-sm font-medium text-[#f1ebe4]">{agent.name}</span>
                            </div>
                            {agent.totalTraces !== undefined && (
                                <span className="text-[10px] text-[#7a6550]">{agent.totalTraces} traces</span>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p className="text-[9px] text-[#7a6550] uppercase">Success</p>
                                <p className="text-xs font-bold text-[#f1ebe4]">{agent.success}%</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-[#7a6550] uppercase">Avg Latency</p>
                                <p className="text-xs font-bold text-[#f1ebe4]">
                                    {agent.avgLatency ? `${(agent.avgLatency / 1000).toFixed(1)}s` : `${agent.sla}%`}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] text-[#7a6550] uppercase">Avg Cost</p>
                                <p className="text-xs font-bold text-[#e8722a]">
                                    {agent.avgCost !== undefined ? `$${agent.avgCost.toFixed(4)}` : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default AgentPerformanceWidget;
