import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

const ComplianceWidget = ({ data, loading }) => {
    const defaultCompliance = { pii: { passed: 0, failed: 0 }, bias: { passed: 0, failed: 0 }, safety: { passed: 0, failed: 0 }, compliance: { passed: 0, failed: 0 } };
    const compliance = data && Object.keys(data).length > 0 ? data : defaultCompliance;

    const getStatus = (item) => {
        if (item.failed > 5) return 'red';
        if (item.failed > 0) return 'yellow';
        return 'green';
    };

    const statusIcon = {
        green: <ShieldCheck size={18} className="text-[#22c55e]" />,
        yellow: <ShieldAlert size={18} className="text-[#eab308]" />,
        red: <ShieldX size={18} className="text-[#ef4444]" />,
    };

    const totalPassed = Object.values(compliance).reduce((sum, c) => sum + (c.passed || 0), 0);
    const totalFailed = Object.values(compliance).reduce((sum, c) => sum + (c.failed || 0), 0);
    const overallRate = totalPassed + totalFailed > 0
        ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)
        : '100.0';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Safety & Compliance</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${parseFloat(overallRate) >= 99 ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#eab308]/10 text-[#eab308]'}`}>
                    {overallRate}%
                </span>
            </div>

            {/* Scorecards */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(compliance).map(([key, val]) => {
                    const status = getStatus(val);
                    return (
                        <div key={key} className="bg-[#0f0d0b] rounded-lg p-3 text-center">
                            <div className="flex justify-center mb-1">{statusIcon[status]}</div>
                            <p className="text-[9px] text-[#7a6550] uppercase tracking-wider">{key}</p>
                            <p className="text-sm font-bold text-[#f1ebe4]">
                                {val.passed}<span className="text-[#22c55e]">/{val.passed + val.failed}</span>
                            </p>
                            {val.failed > 0 && (
                                <p className="text-[10px] text-[#ef4444] mt-0.5">{val.failed} failed</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Summary bar */}
            <div>
                <div className="flex justify-between text-xs text-[#7a6550] mb-1">
                    <span>Overall Compliance</span>
                    <span>{totalPassed} passed / {totalFailed} failed</span>
                </div>
                <div className="h-2 bg-[#2a201a] rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700 bg-[#22c55e]"
                        style={{ width: `${overallRate}%` }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default ComplianceWidget;
