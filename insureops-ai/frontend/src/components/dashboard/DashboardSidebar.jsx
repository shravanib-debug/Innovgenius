import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Activity,
    Bot,
    FileSearch,
    Bell,
    Terminal,
    Shield,
    Star,
    FolderOpen,
    User,
    ShoppingCart
} from 'lucide-react';

const navSections = [
    {
        heading: 'Favorites',
        links: [
            { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
            { path: '/dashboard/section1', label: 'AI Monitoring', icon: Activity },
        ]
    },
    {
        heading: 'Dashboards',
        links: [
            { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true, highlight: true },
            { path: '/dashboard/section2', label: 'Agent Monitoring', icon: Bot },
            { path: '/dashboard/traces', label: 'Trace Explorer', icon: FileSearch },
        ]
    },
    {
        heading: 'Pages',
        links: [
            { path: '/dashboard/alerts', label: 'Alerts', icon: Bell },
            { path: '/dashboard/agents', label: 'Agent Console', icon: Terminal },
        ]
    },
];

function DashboardSidebar() {
    return (
        <aside className="fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-y-auto overflow-x-hidden min-h-screen"
            style={{
                width: '280px',
                background: 'linear-gradient(180deg, #0c0a08 0%, #100d0a 100%)',
                borderRight: '1px solid var(--color-border)'
            }}>

            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #e8722a, #f2923c)', boxShadow: '0 0 20px rgba(232, 114, 42, 0.3)' }}>
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>InsureOps AI</span>
                    <span className="text-[11px] uppercase tracking-[0.08em] font-medium" style={{ color: 'var(--color-text-muted)' }}>Observability</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4">
                {navSections.map((section, idx) => (
                    <div key={section.heading} className={idx > 0 ? 'mt-6' : ''}>
                        <div className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-muted)' }}>
                            {section.heading}
                        </div>
                        {section.links.map((link) => (
                            <NavLink
                                key={link.path + link.label}
                                to={link.path}
                                end={link.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium mb-1 no-underline relative transition-all duration-150
                  ${isActive
                                        ? ''
                                        : 'hover:bg-white/[0.04]'
                                    }`
                                }
                                style={({ isActive }) => ({
                                    color: isActive ? '#f2923c' : 'var(--color-text-secondary)',
                                    background: isActive ? 'rgba(232, 114, 42, 0.1)' : 'transparent',
                                })}
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                                                style={{ height: '60%', background: '#e8722a' }} />
                                        )}
                                        <link.icon className="w-5 h-5 flex-shrink-0" style={{ opacity: isActive ? 1 : 0.65 }} />
                                        <span>{link.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-6 py-5" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2.5 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ background: '#22c55e', animation: 'pulseGlow 2s ease-in-out infinite' }} />
                    <span>All systems operational</span>
                </div>
            </div>
        </aside>
    );
}

export default DashboardSidebar;
