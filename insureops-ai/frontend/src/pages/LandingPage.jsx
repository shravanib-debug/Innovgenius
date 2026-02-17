import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { AboutDemo } from '@/components/blocks/cta-section-with-gallery';

/* ─── 4-pointed pinwheel / origami star (matches reference) ─── */
const PinwheelStar = ({ size = 48, style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style}>
        {/* Top triangle — orange */}
        <polygon points="32,4 38,28 26,28" fill="#f97316" />
        {/* Right triangle — red/pink */}
        <polygon points="60,32 36,26 36,38" fill="#ef4444" />
        {/* Bottom triangle — dark red */}
        <polygon points="32,60 26,36 38,36" fill="#dc2626" />
        {/* Left triangle — warm yellow */}
        <polygon points="4,32 28,38 28,26" fill="#fbbf24" />
    </svg>
);

/* ─── Asterisk / Snowflake logo SVG ─── */
const LogoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="1" x2="12" y2="23" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <line x1="1" y1="12" x2="23" y2="12" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <line x1="4.2" y1="4.2" x2="19.8" y2="19.8" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <line x1="19.8" y1="4.2" x2="4.2" y2="19.8" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2.5" fill="#f97316" />
    </svg>
);

function LandingPage() {
    const [hoveredLink, setHoveredLink] = useState(null);

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: '#060504' }}>

            {/* ═══════════════════════════════════════════
          BACKGROUND — Dark lines BEHIND, orange glow IN THE MIDDLE
       ═══════════════════════════════════════════ */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">

                {/* ── Dark vertical lines BEHIND everything ── */}
                {[
                    { left: '8%', opacity: 0.04 },
                    { left: '13%', opacity: 0.05 },
                    { left: '18%', opacity: 0.06 },
                    { left: '23%', opacity: 0.07 },
                    { left: '28%', opacity: 0.08 },
                    { left: '33%', opacity: 0.10 },
                    { left: '37%', opacity: 0.12 },
                    { left: '41%', opacity: 0.14 },
                    { left: '45%', opacity: 0.16 },
                    { left: '48%', opacity: 0.18 },
                    { left: '50%', opacity: 0.18 },
                    { left: '52%', opacity: 0.18 },
                    { left: '55%', opacity: 0.16 },
                    { left: '59%', opacity: 0.14 },
                    { left: '63%', opacity: 0.12 },
                    { left: '67%', opacity: 0.10 },
                    { left: '72%', opacity: 0.08 },
                    { left: '77%', opacity: 0.07 },
                    { left: '82%', opacity: 0.06 },
                    { left: '87%', opacity: 0.05 },
                    { left: '92%', opacity: 0.04 },
                ].map((line, i) => (
                    <div
                        key={i}
                        className="absolute top-0 h-full"
                        style={{
                            left: line.left,
                            width: i % 2 === 0 ? '1px' : '2px',
                            opacity: line.opacity,
                            background: 'linear-gradient(180deg, rgba(180, 120, 60, 0.6) 0%, rgba(140, 90, 40, 0.4) 30%, rgba(100, 60, 20, 0.15) 60%, transparent 85%)',
                            maskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 80%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 80%)',
                        }}
                    />
                ))}

                {/* ── ORANGE GLOW — centered in the MIDDLE of the hero area ── */}
                <div className="absolute left-1/2 -translate-x-1/2"
                    style={{
                        top: '100px',
                        width: '900px',
                        height: '500px',
                        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(200, 80, 0, 0.7) 0%, rgba(160, 60, 0, 0.35) 30%, rgba(120, 40, 0, 0.12) 55%, transparent 75%)',
                    }} />
                {/* Inner hot core glow */}
                <div className="absolute left-1/2 -translate-x-1/2"
                    style={{
                        top: '130px',
                        width: '500px',
                        height: '350px',
                        background: 'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(240, 130, 30, 0.45) 0%, rgba(200, 80, 0, 0.15) 50%, transparent 75%)',
                    }} />

                {/* ── Horizontal glow accent bar ── */}
                <div className="absolute left-1/2 -translate-x-1/2 w-[65%] h-[2px]"
                    style={{ top: '100px', background: 'linear-gradient(90deg, transparent, rgba(255, 160, 50, 0.4) 25%, rgba(255, 180, 70, 0.8) 50%, rgba(255, 160, 50, 0.4) 75%, transparent)', filter: 'blur(1px)' }} />
                <div className="absolute left-1/2 -translate-x-1/2 w-[50%] h-[40px]"
                    style={{ top: '82px', background: 'linear-gradient(90deg, transparent, rgba(220, 110, 20, 0.08) 25%, rgba(240, 140, 40, 0.18) 50%, rgba(220, 110, 20, 0.08) 75%, transparent)' }} />

                {/* ── Bottom warm ambient ── */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[350px] rounded-full opacity-15 blur-[100px]"
                    style={{ background: 'radial-gradient(circle, #c06818 0%, #7a3a10 40%, transparent 70%)' }} />
            </div>


            {/* ═══════════════════════════════════════════
          DECORATIVE PINWHEEL STARS (matching reference)
       ═══════════════════════════════════════════ */}

            {/* Left star — near headline left side */}
            <motion.div
                className="absolute z-10"
                style={{ top: '310px', left: '13%' }}
                animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
                <PinwheelStar size={48} />
            </motion.div>

            {/* Right star — larger, to the right of "Growth" */}
            <motion.div
                className="absolute z-10"
                style={{ top: '260px', right: '14%' }}
                animate={{ y: [4, -8, 4], rotate: [0, -15, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            >
                <PinwheelStar size={52} style={{ transform: 'rotate(15deg)' }} />
            </motion.div>

            {/* Bottom-right star — smaller accent */}
            <motion.div
                className="absolute z-10"
                style={{ bottom: '35%', right: '8%' }}
                animate={{ y: [3, -5, 3], rotate: [0, 20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
                <PinwheelStar size={32} style={{ transform: 'rotate(-20deg)' }} />
            </motion.div>


            {/* ═══════════════════════════════════════════
          NAVBAR — Fixed, taller, transparent
       ═══════════════════════════════════════════ */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 xl:px-24 py-6"
                style={{
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    background: 'rgba(6, 5, 4, 0.4)',
                }}
            >
                {/* Logo — left: orange asterisk + "Savio" */}
                <Link to="/" className="flex items-center gap-2.5 no-underline">
                    <LogoIcon />
                    <span className="text-[16px] font-medium tracking-tight" style={{ color: '#ffffff' }}>
                        Savio
                    </span>
                </Link>

                {/* Nav Links — centered */}
                <div className="hidden md:flex items-center gap-8">
                    {['Home', 'Pricing', 'Features', 'Resources', 'About'].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className="text-[14px] font-light no-underline transition-opacity duration-200"
                            style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                opacity: hoveredLink === item ? 1 : 0.85,
                            }}
                            onMouseEnter={() => setHoveredLink(item)}
                            onMouseLeave={() => setHoveredLink(null)}
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Get Started — WHITE pill, dark text */}
                <Link
                    to="/dashboard"
                    className="hidden md:flex items-center justify-center rounded-full text-[14px] font-medium no-underline transition-all duration-200 hover:opacity-90"
                    style={{
                        background: '#ffffff',
                        color: '#111111',
                        padding: '10px 24px',
                    }}
                >
                    Get Started
                </Link>
            </motion.nav>

            {/* Spacer for fixed navbar */}
            <div className="h-20" />


            {/* ═══════════════════════════════════════════
          HERO SECTION — Centered
       ═══════════════════════════════════════════ */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-[calc(100vh-5rem)]">

                {/* Announcement badge */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex items-center gap-2 px-5 py-2 rounded-full mb-10 lg:mb-12 text-[13px] font-normal tracking-wide"
                    style={{
                        background: 'rgba(200, 120, 40, 0.06)',
                        border: '1px solid rgba(200, 120, 40, 0.2)',
                        color: 'rgba(220, 160, 80, 0.85)'
                    }}
                >
                    <span style={{ fontSize: '12px' }}>✦</span>
                    We are launching soon. Stay Tuned
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="text-[2.75rem] sm:text-[3.5rem] lg:text-[4.5rem] font-semibold leading-[1.1] tracking-[-0.02em] max-w-4xl mb-7"
                    style={{ color: '#f1ebe4' }}
                >
                    Take Control Of Your
                    <br />
                    Financial{' '}
                    <span
                        className="italic font-normal font-serif"
                    >
                        Growth
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-[15px] max-w-md mb-12 lg:mb-14 leading-relaxed"
                    style={{ color: 'rgba(168, 152, 136, 0.8)' }}
                >
                    AI-powered money management that helps you grow
                    <br className="hidden sm:block" />
                    savings without changing your lifestyle.
                </motion.p>

                {/* CTA Buttons — centered, larger & brighter */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="relative z-20 flex items-center gap-5 mb-10"
                >
                    <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 px-10 py-5 rounded-full text-[17px] font-semibold text-white no-underline transition-all duration-300 hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', minWidth: '220px' }}
                    >
                        Start Saving Today
                    </Link>

                    <a
                        href="#demo"
                        className="flex items-center justify-center gap-2 px-10 py-5 rounded-full text-[17px] font-medium no-underline transition-all duration-300 hover:bg-white/[0.1]"
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#f1ebe4',
                            minWidth: '200px'
                        }}
                    >
                        <Play size={16} fill="currentColor" className="opacity-80" />
                        Watch Demo
                    </a>
                </motion.div>
            </div>


            {/* ═══════════════════════════════════════════
          DASHBOARD MOCKUP — CENTERED, floating
       ═══════════════════════════════════════════ */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.8 }}
                className="relative z-10 mx-auto px-6"
                style={{ maxWidth: '960px', marginBottom: '-80px' }}
            >
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        boxShadow: '0 -4px 60px rgba(180, 90, 20, 0.15), 0 20px 80px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(168, 144, 112, 0.12)',
                        background: 'linear-gradient(180deg, #191512 0%, #110f0c 100%)',
                    }}
                >
                    <div className="p-5 sm:p-6">
                        {/* Dashboard navbar */}
                        <div className="flex items-center justify-between mb-5 pb-3" style={{ borderBottom: '1px solid rgba(168, 144, 112, 0.06)' }}>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8722a, #f2923c)' }}>
                                        <span className="text-[8px] text-white font-bold">✦</span>
                                    </div>
                                    <span className="text-[11px] font-bold" style={{ color: '#a89888' }}>Savio</span>
                                </div>
                                <div className="hidden sm:flex items-center gap-3 ml-2 text-[9px]" style={{ color: '#5a4a3a' }}>
                                    <span>☐</span><span>☆</span>
                                    <span className="font-medium" style={{ color: '#7a6550' }}>Dashboards</span>
                                    <span>|</span>
                                    <span>Default</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-6 rounded-md flex items-center gap-1 px-2"
                                    style={{ background: 'rgba(168, 144, 112, 0.05)', border: '1px solid rgba(168, 144, 112, 0.07)' }}>
                                    <span className="text-[8px]" style={{ color: '#5a4a3a' }}>🔍 Search...</span>
                                </div>
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-5 h-5 rounded-full" style={{ background: 'rgba(168, 144, 112, 0.05)' }} />)}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {/* Sidebar */}
                            <div className="hidden lg:block w-40 flex-shrink-0 pr-3" style={{ borderRight: '1px solid rgba(168, 144, 112, 0.05)' }}>
                                {[
                                    { title: 'Favorites', items: [{ l: 'Overview' }, { l: 'Projects' }] },
                                    { title: 'Dashboards', items: [{ l: 'Overview', a: true }, { l: 'eCommerce' }, { l: 'Projects' }] },
                                    { title: 'Pages', items: [{ l: 'User Profile' }] },
                                ].map(section => (
                                    <div key={section.title} className="mb-3">
                                        <div className="text-[7px] uppercase tracking-[0.15em] mb-1 px-1 font-medium" style={{ color: '#4a3e34' }}>{section.title}</div>
                                        {section.items.map(item => (
                                            <div key={item.l + section.title} className="flex items-center gap-1.5 px-1 py-1 rounded-md mb-px"
                                                style={{ background: item.a ? 'rgba(232, 114, 42, 0.08)' : 'transparent' }}>
                                                {item.a && <div className="w-[2px] h-2.5 rounded-full" style={{ background: '#e8722a' }} />}
                                                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.a ? '#e8722a' : 'rgba(168, 144, 112, 0.1)' }} />
                                                <span className="text-[9px]" style={{ color: item.a ? '#d4944a' : '#5a4a3a' }}>{item.l}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Center content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[12px] font-semibold" style={{ color: '#d5c4a1' }}>Overview</span>
                                    <div className="text-[9px] px-2 py-0.5 rounded" style={{ color: '#7a6550', background: 'rgba(168, 144, 112, 0.05)' }}>Today ▾</div>
                                </div>

                                {/* Stat cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
                                    {[
                                        { label: 'Views', value: '7,265', change: '+11.01%', up: true },
                                        { label: 'Visits', value: '3,671', change: '-0.03%', up: false },
                                        { label: 'New Users', value: '256', change: '+15.03%', up: true },
                                        { label: 'Active Users', value: '2,318', change: '+6.08%', up: true },
                                    ].map((s) => (
                                        <div key={s.label} className="rounded-lg p-3"
                                            style={{ background: 'rgba(168, 144, 112, 0.03)', border: '1px solid rgba(168, 144, 112, 0.06)' }}>
                                            <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: '#5a4a3a' }}>{s.label}</div>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-base font-bold" style={{ color: '#e8ddd0' }}>{s.value}</span>
                                                <span className="text-[8px] font-semibold" style={{ color: s.up ? '#22c55e' : '#ef4444' }}>
                                                    {s.change} {s.up ? '↗' : '↘'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart + Traffic */}
                                <div className="flex gap-2.5">
                                    <div className="flex-1 rounded-lg p-3"
                                        style={{ background: 'rgba(168, 144, 112, 0.03)', border: '1px solid rgba(168, 144, 112, 0.06)' }}>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] font-semibold" style={{ color: '#a89888' }}>Total Users</span>
                                            <span className="text-[8px]" style={{ color: '#4a3e34' }}>Total Projects</span>
                                            <span className="text-[8px]" style={{ color: '#4a3e34' }}>Operating Status</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[7px] mb-2" style={{ color: '#4a3e34' }}>
                                            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full inline-block" style={{ background: '#e8722a' }} /> This year</span>
                                            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full inline-block" style={{ background: '#3d3028' }} /> Last year</span>
                                        </div>
                                        <div className="h-20">
                                            <svg viewBox="0 0 400 70" className="w-full h-full" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="rgba(232,114,42,0.12)" />
                                                        <stop offset="100%" stopColor="rgba(232,114,42,0)" />
                                                    </linearGradient>
                                                </defs>
                                                {[18, 36, 54].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(168,144,112,0.04)" strokeWidth="0.5" />)}
                                                <polyline fill="none" stroke="rgba(168,144,112,0.1)" strokeWidth="1"
                                                    points="0,48 45,44 90,52 135,40 180,50 225,36 270,42 315,30 360,36 400,32" />
                                                <polygon fill="url(#areaGrad)"
                                                    points="0,44 45,36 90,42 135,25 180,32 225,18 270,22 315,12 360,16 400,10 400,70 0,70" />
                                                <polyline fill="none" stroke="#d97218" strokeWidth="1.5"
                                                    points="0,44 45,36 90,42 135,25 180,32 225,18 270,22 315,12 360,16 400,10" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Traffic */}
                                    <div className="hidden lg:block w-36 rounded-lg p-3"
                                        style={{ background: 'rgba(168, 144, 112, 0.03)', border: '1px solid rgba(168, 144, 112, 0.06)' }}>
                                        <span className="text-[10px] font-semibold block mb-2.5" style={{ color: '#a89888' }}>Traffic by Website</span>
                                        {[{ n: 'Google', p: 75 }, { n: 'YouTube', p: 55 }, { n: 'Instagram', p: 35 }, { n: 'Pinterest', p: 20 }].map(t => (
                                            <div key={t.n} className="mb-2">
                                                <span className="text-[7px] block mb-0.5" style={{ color: '#5a4a3a' }}>{t.n}</span>
                                                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(168, 144, 112, 0.05)' }}>
                                                    <div className="h-full rounded-full" style={{ width: `${t.p}%`, background: 'linear-gradient(90deg, #d97218, #e8923c)' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right panel — Notifications + Activities */}
                            <div className="hidden xl:block w-44 flex-shrink-0 pl-3 space-y-4" style={{ borderLeft: '1px solid rgba(168, 144, 112, 0.05)' }}>
                                <div>
                                    <span className="text-[10px] font-semibold block mb-2" style={{ color: '#a89888' }}>Notifications</span>
                                    {[
                                        { emoji: '🔧', text: 'You fixed a bug.', time: 'Just now' },
                                        { emoji: '👤', text: 'New user registered.', time: '59 minutes ago' },
                                        { emoji: '🔧', text: 'You fixed a bug.', time: '12 hours ago' },
                                        { emoji: '🔔', text: 'Andi Lane subscribed to you.', time: 'Today, 11:59 AM' },
                                    ].map((n, i) => (
                                        <div key={i} className="flex items-start gap-1.5 py-1" style={{ borderBottom: '1px solid rgba(168, 144, 112, 0.04)' }}>
                                            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[7px]"
                                                style={{ background: 'rgba(232, 114, 42, 0.08)' }}>{n.emoji}</div>
                                            <div>
                                                <div className="text-[8px] font-medium leading-tight" style={{ color: '#b8a890' }}>{n.text}</div>
                                                <div className="text-[6px]" style={{ color: '#4a3e34' }}>{n.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <span className="text-[10px] font-semibold block mb-2" style={{ color: '#a89888' }}>Activities</span>
                                    {[
                                        { c: '#ef4444', text: 'Changed the style.', time: 'Just now' },
                                        { c: '#3b82f6', text: 'Released a new version.', time: '59 minutes ago' },
                                        { c: '#22c55e', text: 'Submitted a bug.', time: '12 hours ago' },
                                    ].map((a, i) => (
                                        <div key={i} className="flex items-start gap-1.5 py-1" style={{ borderBottom: '1px solid rgba(168, 144, 112, 0.04)' }}>
                                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: a.c }} />
                                            <div>
                                                <div className="text-[8px] font-medium leading-tight" style={{ color: '#b8a890' }}>{a.text}</div>
                                                <div className="text-[6px]" style={{ color: '#4a3e34' }}>{a.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Spacer for cropped mockup */}
            <div className="h-28" />

            {/* ═══════════════════════════════════════════
          CTA GALLERY SECTION — replaces analytics cards
       ═══════════════════════════════════════════ */}
            <AboutDemo />
        </div>
    );
}

export default LandingPage;
