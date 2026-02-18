import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const mockAgents = [
    { name: 'Claims Agent', type: 'claims', completion: 96.2, success: 91.5, sla: 94.8, sparkline: [88, 90, 91, 89, 92, 91, 93, 92, 91], status: 'green' },
    { name: 'Underwriting Agent', type: 'underwriting', completion: 94.8, success: 89.2, sla: 92.1, sparkline: [85, 87, 88, 86, 89, 90, 88, 89, 90], status: 'green' },
    { name: 'Fraud Agent', type: 'fraud', completion: 98.1, success: 85.4, sla: 88.5, sparkline: [82, 84, 83, 85, 86, 84, 85, 86, 85], status: 'yellow' },
    { name: 'Support Agent', type: 'support', completion: 92.3, success: 87.9, sla: 90.2, sparkline: [86, 85, 87, 88, 86, 87, 88, 89, 88], status: 'green' },
];

const statusColors = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };

const AgentPerformanceWidget = ({ data, loading }) => {
    // If we have real data from API, merge with mock display
    const agents = mockAgents.map(mock => {
        const real = data?.[mock.type];
        if (!real) return mock;
        return {
            ...mock,
            success: real.successRate ?? mock.success,
            sla: real.avgLatency ? (real.avgLatency < 5000 ? 95 : 80) : mock.sla,
            completion: real.totalTraces > 0 ? 100 : mock.completion,
            status: (real.successRate ?? 100) >= 90 ? 'green' : (real.successRate ?? 100) >= 80 ? 'yellow' : 'red',
            avgLatency: real.avgLatency,
            avgCost: real.avgCost,
            totalTraces: real.totalTraces,
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
