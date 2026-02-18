import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronRight, Activity, BarChart3, Lock, Sparkles } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[--color-bg-primary] text-[--color-text-primary] font-sans overflow-x-hidden selection:bg-[--color-accent]/30 selection:text-white">

            {/* ════════ NAVBAR ════════ */}
            <nav className="fixed w-full z-50 top-0 bg-transparent">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 lg:px-20 py-5">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-[--color-accent] to-amber-700 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[--color-accent]/20 transition-shadow">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-semibold tracking-tight">
                            InsureOps <span className="text-[--color-accent]">AI</span>
                        </span>
                    </Link>

                    {/* Center Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#" className="nav-link">Home</a>
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#" className="nav-link">Pricing</a>
                        <a href="#" className="nav-link">Resources</a>
                        <a href="#" className="nav-link">About</a>
                    </div>

                    {/* CTA */}
                    <Link
                        to="/dashboard"
                        className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium border border-white/20 rounded-full text-[--color-text-secondary] hover:text-white hover:border-white/40 transition-all"
                    >
                        Get Started <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </nav>

            {/* ════════ HERO SECTION ════════ */}
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

                {/* ── Background layers ── */}
                {/* Warm amber streaks (stage curtain feel) */}
                <div className="absolute inset-0 hero-ambient-streaks"></div>

                {/* Bottom-center radial glow */}
                <div className="absolute inset-0 hero-glow"></div>

                {/* Decorative blobs */}
                <div className="deco-blob-1" style={{ left: '-5%', top: '35%' }}></div>
                <div className="deco-blob-2" style={{ right: '-3%', bottom: '10%' }}></div>

                {/* ── Content ── */}
                <div className="relative z-10 text-center px-6 md:px-12 lg:px-20 max-w-[900px] mx-auto pt-24 pb-8">

                    {/* Announcement badge */}
                    <div className="animate-fade-in-up">
                        <span className="badge-pill">
                            <Sparkles className="w-3.5 h-3.5 text-[--color-accent]" />
                            Now in Public Beta — v1.0
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] animate-fade-in-up delay-100">
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60">
                            AI Observability for
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[--color-accent] via-amber-400 to-[--color-accent]">
                            Smart{' '}
                        </span>
                        <span className="font-display italic bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-[--color-accent]">
                            Insurance
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-6 text-base md:text-lg text-[--color-text-secondary] max-w-xl mx-auto leading-relaxed animate-fade-in-up delay-200" style={{ opacity: 0.65 }}>
                        Monitor, audit, and trust your AI agents. From claims processing to underwriting, gain complete visibility into every decision.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                        <Link to="/dashboard" className="btn-primary">
                            Launch Dashboard <ChevronRight className="w-4 h-4" />
                        </Link>
                        <a href="#features" className="btn-secondary">
                            Learn More
                        </a>
                    </div>
                </div>

                {/* ── Floating Dashboard Preview ── */}
                <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 mt-4 mb-[-40px] animate-fade-in-up delay-400">
                    <div className="dashboard-preview">
                        {/* Mock Dashboard UI */}
                        <div className="bg-[#0e0e0e] p-4 md:p-6">
                            {/* Top bar */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                                </div>
                                <div className="h-6 w-48 bg-white/5 rounded-md"></div>
                                <div className="flex gap-2">
                                    <div className="h-6 w-16 bg-white/5 rounded-md"></div>
                                    <div className="h-6 w-16 bg-[--color-accent]/20 rounded-md"></div>
                                </div>
                            </div>
                            {/* Dashboard content grid */}
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                                    <div className="h-2 w-16 bg-white/10 rounded mb-2"></div>
                                    <div className="h-5 w-12 bg-[--color-accent]/30 rounded"></div>
                                </div>
                                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                                    <div className="h-2 w-20 bg-white/10 rounded mb-2"></div>
                                    <div className="h-5 w-10 bg-emerald-500/30 rounded"></div>
                                </div>
                                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                                    <div className="h-2 w-14 bg-white/10 rounded mb-2"></div>
                                    <div className="h-5 w-14 bg-blue-500/30 rounded"></div>
                                </div>
                                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                                    <div className="h-2 w-18 bg-white/10 rounded mb-2"></div>
                                    <div className="h-5 w-8 bg-amber-500/30 rounded"></div>
                                </div>
                            </div>
                            {/* Chart area */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 bg-white/[0.03] rounded-lg p-4 border border-white/5 h-32">
                                    {/* Fake chart lines */}
                                    <div className="h-full flex items-end gap-1.5">
                                        {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                                            <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: `linear-gradient(to top, rgba(224,112,32,0.4), rgba(224,112,32,0.1))` }}></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white/[0.03] rounded-lg p-4 border border-white/5 h-32 flex items-center justify-center">
                                    {/* Fake donut */}
                                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/40 border-t-[--color-accent]/60"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════ FEATURES ════════ */}
            <section id="features" className="relative py-24 md:py-32 bg-[--color-bg-secondary]/20">
                <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
                    {/* Section header */}
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            Complete Agent{' '}
                            <span className="font-display italic text-[--color-accent]">Visibility</span>
                        </h2>
                        <p className="text-[--color-text-secondary] leading-relaxed">
                            Track performance, cost, and compliance across your entire AI fleet — all in one unified dashboard.
                        </p>
                    </div>

                    {/* Feature cards */}
                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {/* Card 1 */}
                        <div className="glass-card p-8 rounded-2xl group cursor-default">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                                <Activity className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">Real-time Metrics</h3>
                            <p className="text-[--color-text-muted] text-sm leading-relaxed">
                                Live monitoring of latency, token usage, and accuracy. Detect drift before it impacts customers.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="glass-card p-8 rounded-2xl group cursor-default">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                                <BarChart3 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">Cost Analysis</h3>
                            <p className="text-[--color-text-muted] text-sm leading-relaxed">
                                Break down LLM costs by agent and model. Optimize spend with granular usage tracking.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="glass-card p-8 rounded-2xl group cursor-default">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                                <Lock className="w-6 h-6 text-orange-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-orange-400 transition-colors">Audit & Compliance</h3>
                            <p className="text-[--color-text-muted] text-sm leading-relaxed">
                                Full trace logs for every decision. Automatic PII detection and bias checks built in.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════ FOOTER ════════ */}
            <footer className="border-t border-white/5 py-12 bg-[--color-bg-primary]">
                <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-[--color-text-muted]">&copy; 2026 InsureOps AI. Built for the future of insurance.</p>
                    <div className="flex gap-6 text-sm text-[--color-text-muted]">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
