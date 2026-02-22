import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EscalationWidget = ({ data, loading }) => {
    const escalationRate = data?.escalationRate ?? 0;
    const trend = data?.escalationTrend?.map(t => ({
        time: t.time?.split('T')[1]?.slice(0, 5) || t.time,
        count: t.value
    })) || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 hover:border-[#e8722a]/25 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f1ebe4]">Escalation Frequency</h3>
                <div className="bg-[#0f0d0b] rounded-lg px-3 py-1.5">
                    <span className="text-[10px] text-[#7a6550] uppercase tracking-wider">Rate</span>
                    <span className={`text-sm font-bold ml-2 ${escalationRate > 30 ? 'text-[#ef4444]' : escalationRate > 15 ? 'text-[#eab308]' : 'text-[#22c55e]'}`}>
                        {escalationRate}%
                    </span>
                </div>
            </div>

            {/* Trend */}
            <div className="h-36 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend}>
                        <XAxis dataKey="time" tick={{ fill: '#7a6550', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#7a6550', fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
                        <Tooltip contentStyle={{ background: '#1c1815', border: '1px solid #2a201a', borderRadius: '8px', fontSize: '12px' }} labelStyle={{ color: '#a89888' }} />
                        <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <p className="text-[#7a6550] text-xs">
                Escalation rate {'>'} 30% triggers a warning. Currently at <span className="text-[#f1ebe4] font-semibold">{escalationRate}%</span>.
            </p>
        </motion.div>
    );
};

export default EscalationWidget;
