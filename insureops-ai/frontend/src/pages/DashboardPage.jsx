import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Users, Activity, CreditCard, DollarSign, FileText } from 'lucide-react';

const StatCard = ({ title, value, change, positive, icon: Icon }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1c1815] border border-[#2a201a] p-8 rounded-2xl relative overflow-hidden group hover:border-[#e8722a]/30 transition-colors"
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon size={48} />
        </div>
        <div className="flex items-start justify-between mb-4">
            <div>
                <h3 className="text-[#a89888] text-sm font-medium mb-1">{title}</h3>
                <span className="text-3xl font-bold text-[#f1ebe4]">{value}</span>
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
            </div>
        </div>
        <div className="h-1 w-full bg-[#2a201a] rounded-full overflow-hidden">
            <div className="h-full bg-[#e8722a]" style={{ width: '60%' }} />
        </div>
    </motion.div>
);

const DashboardPage = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">Overview</h1>
                    <p className="text-[#a89888]">Welcome back, here's what's happening with your policies.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-[#2a201a] hover:bg-[#3d3028] text-[#f1ebe4] rounded-lg text-sm font-medium transition-colors">Export Report</button>
                    <button className="px-4 py-2 bg-[#e8722a] hover:bg-[#c45a1a] text-white rounded-lg text-sm font-medium transition-colors">New Policy</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Revenue" value="$45,231.89" change="+20.1%" positive={true} icon={DollarSign} />
                <StatCard title="Active Policies" value="+2350" change="+180.1%" positive={true} icon={FileText} />
                <StatCard title="Claims Processed" value="+12,234" change="+19%" positive={true} icon={Activity} />
                <StatCard title="Active Users" value="+573" change="+201 since last hour" positive={true} icon={Users} />
            </div>

            {/* Recent Transactions Section */}
            <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-8 mt-8">
                <h2 className="text-xl font-semibold text-[#f1ebe4] mb-6">Recent Transactions</h2>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-[#0c0a08]/50 rounded-xl hover:bg-[#0c0a08] transition-colors border border-transparent hover:border-[#2a201a]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#2a201a] flex items-center justify-center text-[#f1ebe4] font-bold">
                                    {['JD', 'AS', 'MK', 'LW', 'PR', 'ST', 'GB'][i - 1] || 'UR'}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-[#f1ebe4]">Policy Renewal - Auto Insurance</div>
                                    <div className="text-xs text-[#7a6550]">Today at {9 + i}:00 AM</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-[#f1ebe4]">+$350.00</div>
                                <div className="text-xs text-green-400">Completed</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
