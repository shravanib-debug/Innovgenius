import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Users, ShieldCheck, LogOut, Bot, Activity, ScrollText, Cpu, Bell, BarChart3, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const location = useLocation();

    const links = [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'AI Monitoring', path: '/dashboard/ai-monitoring', icon: Bot },
        { name: 'AI Metrics', path: '/dashboard/section1', icon: BarChart3 },
        { name: 'Agent Monitoring', path: '/dashboard/section2', icon: Brain },
        { name: 'Traces', path: '/dashboard/traces', icon: Activity },
        { name: 'LLM Logs', path: '/dashboard/llm-logs', icon: ScrollText },
        { name: 'Agents', path: '/dashboard/agents', icon: Cpu },
        { name: 'Alerts', path: '/dashboard/alerts', icon: Bell },
        { name: 'Policies', path: '/dashboard/policies', icon: FileText },
        { name: 'Claims', path: '/dashboard/claims', icon: ShieldCheck },
        { name: 'Customers', path: '/dashboard/customers', icon: Users },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings },
    ];

    return (
        <aside className="w-64 shrink-0 h-screen sticky top-0 bg-[#0c0a08] border-r border-[#2a201a] z-50 flex flex-col">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-[#2a201a]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg leading-none mb-0.5">S</span>
                    </div>
                    <span className="text-lg font-semibold text-[#f1ebe4] tracking-tight">Savio</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden ${isActive
                                ? 'bg-orange-500/10 text-orange-400'
                                : 'text-[#a89888] hover:text-[#f1ebe4] hover:bg-[#1c1815]'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-full"
                                />
                            )}
                            <link.icon size={20} className={isActive ? 'text-orange-400' : 'text-[#7a6550] group-hover:text-[#f1ebe4] transition-colors'} />
                            <span className="text-sm font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[#2a201a]">
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[#a89888] hover:text-[#f1ebe4] hover:bg-[#1c1815] transition-colors">
                    <LogOut size={20} className="text-[#7a6550]" />
                    <span className="text-sm font-medium">Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
