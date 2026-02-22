import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, LogOut, Bot, Activity, ScrollText, Cpu, Bell, BarChart3, Brain, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthProvider';

const ROLE_LABELS = {
    operations_manager: 'Ops Manager',
    compliance_officer: 'Compliance',
    admin: 'Admin',
};

const ROLE_COLORS = {
    operations_manager: 'bg-[#e8722a]/15 text-[#e8722a] border-[#e8722a]/30',
    compliance_officer: 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30',
    admin: 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30',
};

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const allLinks = [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'AI Monitoring', path: '/dashboard/ai-monitoring', icon: Bot },
        { name: 'AI Metrics', path: '/dashboard/section1', icon: BarChart3 },
        { name: 'Agent Monitoring', path: '/dashboard/section2', icon: Brain },
        { name: 'Traces', path: '/dashboard/traces', icon: Activity },
        { name: 'LLM Logs', path: '/dashboard/llm-logs', icon: ScrollText },
        { name: 'Agents', path: '/dashboard/agents', icon: Cpu, roles: ['operations_manager', 'admin'] },
        { name: 'Alerts', path: '/dashboard/alerts', icon: Bell },
        { name: 'Compliance', path: '/dashboard/compliance', icon: Shield, roles: ['compliance_officer', 'admin'] },
        { name: 'Claims', path: '/dashboard/claims', icon: ShieldCheck, roles: ['operations_manager', 'admin'] },
    ];

    // Filter links by user role — if no roles specified, visible to all
    const links = allLinks.filter(link => !link.roles || link.roles.includes(user?.role));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
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

            {/* User Footer */}
            <div className="p-4 border-t border-[#2a201a] space-y-3">
                {/* User info */}
                {user && (
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8722a] to-[#c45a1a] flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-bold">
                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#f1ebe4] truncate">{user.name}</p>
                            <span className={`inline-block mt-0.5 px-1.5 py-0.5 text-[9px] font-semibold rounded border ${ROLE_COLORS[user.role] || 'text-[#a89888]'}`}>
                                {ROLE_LABELS[user.role] || user.role}
                            </span>
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[#a89888] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={20} className="text-[#7a6550] group-hover:text-red-400" />
                    <span className="text-sm font-medium">Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
