import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Activity,
    Bot,
    FileSearch,
    Bell,
    Terminal,
    Shield
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    {
        section: 'Dashboard',
        links: [
            { path: '/', label: 'Overview', icon: LayoutDashboard },
        ]
    },
    {
        section: 'Monitoring',
        links: [
            { path: '/section1', label: 'AI Monitoring', icon: Activity },
            { path: '/section2', label: 'Agent Monitoring', icon: Bot },
        ]
    },
    {
        section: 'Operations',
        links: [
            { path: '/traces', label: 'Trace Explorer', icon: FileSearch },
            { path: '/alerts', label: 'Alerts', icon: Bell },
            { path: '/agents', label: 'Agent Console', icon: Terminal },
        ]
    },
];

function Sidebar() {
    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <Shield />
                </div>
                <div className="sidebar-logo-text">
                    <span className="sidebar-logo-name">InsureOps AI</span>
                    <span className="sidebar-logo-sub">Observability</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((section) => (
                    <div key={section.section}>
                        <div className="sidebar-section-label">{section.section}</div>
                        {section.links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.path === '/'}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <link.icon />
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="sidebar-status">
                    <span className="sidebar-status-dot"></span>
                    <span>All systems operational</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
