import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Shield, BarChart3, Brain, Upload, Bot, Zap } from 'lucide-react';
import { ContainerScroll } from '../components/ui/container-scroll-animation';

/* ─── 4-pointed pinwheel / origami star ─── */
const PinwheelStar = ({ size = 48, style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={style}>
        <polygon points="32,4 38,28 26,28" fill="#f97316" />
        <polygon points="60,32 36,26 36,38" fill="#ef4444" />
        <polygon points="32,60 26,36 38,36" fill="#dc2626" />
        <polygon points="4,32 28,38 28,26" fill="#fbbf24" />
    </svg>
);

/* ─── Asterisk logo SVG ─── */
const LogoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="1" x2="12" y2="23" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <line x1="1" y1="12" x2="23" y2="12" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <line x1="4.2" y1="4.2" x2="19.8" y2="19.8" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <line x1="19.8" y1="4.2" x2="4.2" y2="19.8" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2.5" fill="#f97316" />
    </svg>
);

/* ─── Sparkle star beside the script word ─── */
const SparkleIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block ml-1">
        <path
            d="M12 2L14 9L21 9L15.5 13.5L17.5 21L12 16.5L6.5 21L8.5 13.5L3 9L10 9L12 2Z"
            fill="url(#sparkleGrad)"
        />
        <defs>
            <linearGradient id="sparkleGrad" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
        </defs>
    </svg>
);

function LandingPage() {
    const [hoveredLink, setHoveredLink] = useState(null);

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-[#060504]">

            {/* ═══════════════════════════════════════════
          BACKGROUND — Warm golden curtain glow
       ═══════════════════════════════════════════ */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
                <div className="absolute left-1/2 -translate-x-1/2 top-20 w-[900px] h-[500px] bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(200,80,0,0.7)_0%,rgba(160,60,0,0.35)_30%,rgba(120,40,0,0.12)_55%,transparent_75%)]" />
                <div className="absolute left-1/2 -translate-x-1/2 top-[110px] w-[500px] h-[350px] bg-[radial-gradient(ellipse_70%_50%_at_50%_35%,rgba(240,130,30,0.45)_0%,rgba(200,80,0,0.15)_50%,transparent_75%)]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[350px] rounded-full opacity-15 blur-[100px] bg-[radial-gradient(circle,#c06818_0%,#7a3a10_40%,transparent_70%)]" />
            </div>

            {/* ═══════════════════════════════════════════
          NAVBAR — Fixed, transparent
       ═══════════════════════════════════════════ */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 xl:px-24 py-6 backdrop-blur-xl bg-black/40"
            >
                <Link to="/" className="flex items-center gap-2.5 no-underline">
                    <LogoIcon />
                    <span className="text-base font-medium tracking-tight text-white">Savio</span>
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    {['Home', 'Pricing', 'Features', 'Resources', 'About'].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className="text-sm font-light text-white/60 hover:text-white transition-opacity duration-200"
                        >
                            {item}
                        </a>
                    ))}
                </div>
                <Link
                    to="/dashboard"
                    className="hidden md:flex items-center justify-center rounded-full text-sm font-medium text-white px-6 py-2.5 bg-transparent border border-white/25 hover:opacity-90 transition-all"
                >
                    Get Started
                </Link>
            </motion.nav>


            {/* ═══════════════════════════════════════════
          SCROLL CONTAINER HERO
       ═══════════════════════════════════════════ */}
            <div className="flex flex-col items-center relative z-20">
                <ContainerScroll
                    titleComponent={
                        <div className="flex flex-col items-center justify-center text-center px-4 w-full space-y-2 mt-20">


                            {/* Announcement badge */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="flex items-center gap-2 px-5 py-2 rounded-full mb-8 text-[13px] font-normal tracking-wide bg-[rgba(200,120,40,0.06)] border border-[rgba(200,120,40,0.2)] text-[rgba(220,160,80,0.85)]"
                            >
                                <span style={{ fontSize: '12px' }}>✦</span>
                                New plans available. Learn More
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="text-[3.5rem] sm:text-[4.5rem] lg:text-[6rem] font-semibold leading-[1.1] tracking-[-0.02em] max-w-5xl mb-6 text-[#f1ebe4]"
                            >
                                Take Control Of Your <br />
                                <span className="italic font-normal font-serif bg-gradient-to-br from-orange-500 to-amber-300 bg-clip-text text-transparent">
                                    Financial Growth
                                </span>
                                <SparkleIcon size={40} />
                            </motion.h1>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="text-lg text-[rgba(168,152,136,0.8)] max-w-2xl mb-16 leading-relaxed"
                            >
                                AI-powered money management that helps you grow savings without changing your lifestyle.
                            </motion.p>

                            {/* CTA Buttons — BIGGER */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="flex items-center justify-center gap-6 mb-28"
                            >
                                <Link
                                    to="/dashboard"
                                    className="flex items-center justify-center gap-2 px-10 py-5 rounded-full text-xl font-bold text-white bg-gradient-to-br from-orange-500 to-orange-700 hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:-translate-y-1 transition-all duration-300 min-w-[240px]"
                                >
                                    Start Saving Today
                                </Link>

                                <a
                                    href="#demo"
                                    className="flex items-center justify-center gap-2 px-10 py-5 rounded-full text-xl font-medium text-[#f1ebe4] bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-300 min-w-[220px]"
                                >
                                    <Play size={20} fill="currentColor" className="opacity-80" />
                                    Watch Demo
                                </a>
                            </motion.div>
                        </div>
                    }
                >
                    {/* ─── DASHBOARD MOCKUP (Children of Scroll Card) ─── */}
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#191512] to-[#110f0c] relative">
                        {/* Mockup Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#a89070]/10">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#e8722a] to-[#f2923c]">
                                        <span className="text-xs text-white font-bold">✦</span>
                                    </div>
                                    <span className="text-sm font-bold text-[#a89888]">Savio</span>
                                </div>
                                <div className="hidden sm:flex items-center gap-3 ml-4 text-xs text-[#5a4a3a]">
                                    <span className="font-medium text-[#7a6550]">Dashboards</span>
                                    <span>/</span>
                                    <span>Default</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-48 h-8 rounded-lg bg-[#a89070]/5 border border-[#a89070]/10 flex items-center px-3 text-xs text-[#5a4a3a]">
                                    Search...
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-[#a89070]/5" />)}
                                </div>
                            </div>
                        </div>

                        {/* Mockup Body */}
                        <div className="flex h-full p-6 gap-6">
                            {/* Sidebar Mock */}
                            <div className="w-56 hidden lg:block space-y-6">
                                {[
                                    { t: 'Favorites', i: ['Overview', 'Projects'] },
                                    { t: 'Dashboards', i: ['Overview', 'eCommerce', 'Projects'], active: 0 },
                                ].map((s, idx) => (
                                    <div key={idx}>
                                        <div className="text-[10px] uppercase tracking-widest text-[#4a3e34] font-bold mb-3 pl-2">{s.t}</div>
                                        {s.i.map((item, ii) => (
                                            <div key={item} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium ${s.active === ii ? 'bg-[#e8722a]/10 text-[#d4944a]' : 'text-[#5a4a3a]'}`}>
                                                <div className={`w-2 h-2 rounded-sm ${s.active === ii ? 'bg-[#e8722a]' : 'bg-[#a89070]/20'}`} />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Main Content Mock */}
                            <div className="flex-1 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-[#d5c4a1]">Overview</h2>
                                    <div className="text-xs text-[#7a6550]">Today ▾</div>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { l: 'Views', v: '7,265', c: '+11%', up: true },
                                        { l: 'Visits', v: '3,671', c: '-0.03%', up: false },
                                        { l: 'New Users', v: '256', c: '+15%', up: true },
                                        { l: 'Active', v: '2,318', c: '+6%', up: true },
                                    ].map(card => (
                                        <div key={card.l} className="p-4 rounded-xl bg-[#a89070]/5 border border-[#a89070]/10">
                                            <div className="text-[10px] uppercase tracking-wider text-[#5a4a3a] mb-2">{card.l}</div>
                                            <div className="flex justify-between items-baseline">
                                                <div className="text-2xl font-bold text-[#e8ddd0]">{card.v}</div>
                                                <div className={`text-[10px] ${card.up ? 'text-green-500' : 'text-red-500'}`}>{card.c}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-6 h-64">
                                    <div className="col-span-2 rounded-xl bg-[#a89070]/5 border border-[#a89070]/10 p-4 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-end">
                                            <svg viewBox="0 0 400 100" className="w-full h-3/4 opacity-50" preserveAspectRatio="none">
                                                <path d="M0,80 C100,60 200,90 400,20 L400,100 L0,100 Z" fill="url(#grad)" />
                                                <path d="M0,80 C100,60 200,90 400,20" fill="none" stroke="#e8722a" strokeWidth="2" />
                                                <defs>
                                                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#e8722a" stopOpacity="0.4" />
                                                        <stop offset="100%" stopColor="#e8722a" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-[#a89070]/5 border border-[#a89070]/10 p-4">
                                        <div className="text-xs font-bold text-[#a89888] mb-4">Traffic Channel</div>
                                        {['Google', 'YouTube', 'Instagram'].map((ch, i) => (
                                            <div key={ch} className="mb-3">
                                                <div className="flex justify-between text-[10px] text-[#5a4a3a] mb-1"><span>{ch}</span><span>{80 - i * 20}%</span></div>
                                                <div className="h-1.5 bg-[#a89070]/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-[#d97218] to-[#e8923c]" style={{ width: `${80 - i * 20}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Rightbar Mock */}
                            <div className="w-48 hidden xl:block space-y-4 border-l border-[#a89070]/5 pl-4">
                                <div className="text-[10px] uppercase font-bold text-[#a89888] mb-2">Notifications</div>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-2 items-start py-2 border-b border-[#a89070]/5">
                                        <div className="w-6 h-6 rounded-full bg-[#e8722a]/10 flex items-center justify-center text-[10px]">🔔</div>
                                        <div>
                                            <div className="text-[10px] text-[#b8a890] font-medium leading-tight">New update available</div>
                                            <div className="text-[8px] text-[#4a3e34]">2m ago</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ContainerScroll>
            </div>

            {/* Gradient bleed zone: hero → section 1 */}
            <div className="relative z-20 h-32 -mt-8 bg-gradient-to-b from-transparent to-[#060504] pointer-events-none" />

            {/* ═══════════════════════════════════════════
           SECTION 1 — Why InsureOps AI?
       ═══════════════════════════════════════════ */}
            <section className="relative z-20 pt-16 pb-28 px-8 lg:px-16 xl:px-24">
                {/* Subtle ambient glow behind section */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(232,114,42,0.06)_0%,transparent_70%)] pointer-events-none" />

                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide mb-6 bg-[rgba(232,114,42,0.08)] border border-[rgba(232,114,42,0.2)] text-[#e8a050]">
                        Platform Capabilities
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#f1ebe4] mb-4">
                        Why{' '}
                        <span className="italic font-normal font-serif bg-gradient-to-br from-orange-500 to-amber-300 bg-clip-text text-transparent">
                            InsureOps AI
                        </span>
                        ?
                    </h2>
                    <p className="text-lg text-[#a89888] max-w-2xl mx-auto leading-relaxed">
                        A next-generation platform that brings autonomous intelligence to every layer of insurance operations.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        {
                            icon: <Brain size={28} className="text-orange-400" />,
                            title: 'AI-Powered Agents',
                            desc: 'Autonomous claims processing, underwriting, and fraud detection — all driven by LLM-based agents with full traceability.',
                        },
                        {
                            icon: <BarChart3 size={28} className="text-orange-400" />,
                            title: 'Real-Time Observability',
                            desc: 'Full-stack monitoring dashboard with traces, latency metrics, cost analytics, and agent decision logs.',
                        },
                        {
                            icon: <Shield size={28} className="text-orange-400" />,
                            title: 'Smart Risk Management',
                            desc: 'Intelligent policy analysis with RAG-based document retrieval and automated compliance checks.',
                        },
                    ].map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6, delay: i * 0.15 }}
                            className="group p-8 rounded-2xl border border-[#a89070]/10 bg-[#13110e] hover:border-[#e8722a]/30 hover:bg-[#181410] transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br from-[#e8722a]/15 to-[#e8722a]/5 border border-[#e8722a]/20 group-hover:border-[#e8722a]/40 transition-colors">
                                {card.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-[#f1ebe4] mb-3">{card.title}</h3>
                            <p className="text-sm leading-relaxed text-[#a89888]">{card.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════
           SECTION 2 — How It Works
       ═══════════════════════════════════════════ */}
            <section className="relative z-20 py-28 px-8 lg:px-16 xl:px-24">
                {/* Subtle ambient glow behind section */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(232,114,42,0.04)_0%,transparent_70%)] pointer-events-none" />

                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-20"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide mb-6 bg-[rgba(232,114,42,0.08)] border border-[rgba(232,114,42,0.2)] text-[#e8a050]">
                        Workflow
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#f1ebe4] mb-4">
                        How It{' '}
                        <span className="italic font-normal font-serif bg-gradient-to-br from-orange-500 to-amber-300 bg-clip-text text-transparent">
                            Works
                        </span>
                    </h2>
                    <p className="text-lg text-[#a89888] max-w-2xl mx-auto leading-relaxed">
                        From claim submission to stakeholder insight — three seamless steps powered by intelligent agents.
                    </p>
                </motion.div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Connecting line (desktop only) */}
                    <div className="hidden md:block absolute top-[60px] left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-[#e8722a]/40 via-[#e8722a]/20 to-[#e8722a]/40" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                        {[
                            {
                                icon: <Upload size={24} className="text-orange-400" />,
                                step: '01',
                                title: 'Submit a Claim',
                                desc: 'Policyholders submit claims through the platform. AI agents ingest, classify, and route them automatically.',
                            },
                            {
                                icon: <Bot size={24} className="text-orange-400" />,
                                step: '02',
                                title: 'AI Agents Analyze',
                                desc: 'Specialized agents — Claims, Underwriting, Fraud — work autonomously with complete traceability and observability.',
                            },
                            {
                                icon: <Zap size={24} className="text-orange-400" />,
                                step: '03',
                                title: 'Instant Insights',
                                desc: 'Stakeholders see real-time decisions, risk scores, and compliance status on the live observability dashboard.',
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                                className="flex flex-col items-center text-center"
                            >
                                {/* Step circle */}
                                <div className="relative w-[120px] h-[120px] rounded-full flex items-center justify-center mb-8 bg-[#13110e] border-2 border-[#e8722a]/20">
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#e8722a] to-[#f2923c] flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-[#e8722a]/30">
                                        {item.step}
                                    </div>
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-[#f1ebe4] mb-2">{item.title}</h3>
                                <p className="text-sm leading-relaxed text-[#a89888] max-w-xs">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
           FOOTER
       ═══════════════════════════════════════════ */}
            <footer className="relative z-20 py-14 px-8 lg:px-16 xl:px-24">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2.5">
                        <LogoIcon />
                        <span className="text-base font-medium tracking-tight text-white">Savio</span>
                    </div>
                    <p className="text-sm text-[#5a4a3a]">
                        © {new Date().getFullYear()} InsureOps AI. All rights reserved.
                    </p>
                    <Link
                        to="/dashboard"
                        className="flex items-center justify-center rounded-full text-sm font-medium text-white px-6 py-2.5 bg-gradient-to-br from-orange-500 to-orange-700 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300"
                    >
                        Get Started →
                    </Link>
                </div>
            </footer>

            {/* ═══════════════════════════════════════════
           DECORATIVE STARS (Floating — hero only)
       ═══════════════════════════════════════════ */}
            <motion.div
                className="absolute z-10 top-[20%] left-[5%]"
                animate={{ y: [-10, 10, -10], rotate: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            >
                <PinwheelStar size={64} />
            </motion.div>
            <motion.div
                className="absolute z-10 bottom-[20%] right-[8%]"
                animate={{ y: [10, -10, 10], rotate: [0, -15, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
                <PinwheelStar size={80} style={{ transform: 'rotate(20deg)' }} />
            </motion.div>

        </div>
    );
}

export default LandingPage;
