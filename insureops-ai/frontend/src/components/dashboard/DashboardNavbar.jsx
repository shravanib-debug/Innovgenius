import { useState } from 'react';
import { Search, Bell, Settings, Grid3x3, User, ChevronDown } from 'lucide-react';

function DashboardNavbar() {
    const [searchFocused, setSearchFocused] = useState(false);

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
            style={{
                background: 'rgba(12, 10, 8, 0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--color-border)'
            }}>

            {/* Left: Breadcrumbs / Tabs */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Dashboards</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>/</span>
                    <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Default</span>
                </div>
            </div>

            {/* Right: Search + Icons */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all duration-200"
                        style={{
                            width: searchFocused ? '220px' : '160px',
                            background: 'rgba(168, 144, 112, 0.06)',
                            border: `1px solid ${searchFocused ? 'rgba(232, 114, 42, 0.3)' : 'var(--color-border)'}`,
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-sans)',
                        }}
                    />
                </div>

                {/* Icon buttons */}
                {[Settings, Bell, Grid3x3].map((Icon, i) => (
                    <button
                        key={i}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 hover:bg-white/[0.05] relative"
                        style={{ color: 'var(--color-text-muted)', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                        <Icon className="w-[18px] h-[18px]" />
                        {i === 1 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                                style={{ background: '#e8722a', boxShadow: '0 0 6px rgba(232, 114, 42, 0.5)' }} />
                        )}
                    </button>
                ))}

                {/* User avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center ml-1"
                    style={{ background: 'linear-gradient(135deg, #e8722a, #f2923c)' }}>
                    <User className="w-4 h-4 text-white" />
                </div>
            </div>
        </header>
    );
}

export default DashboardNavbar;
