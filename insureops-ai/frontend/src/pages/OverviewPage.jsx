import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

const OverviewPage = () => {
    return (
        <div className="p-6 md:p-8 lg:p-10 space-y-8">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[--color-text-primary]">Dashboard Overview</h1>
                <p className="text-sm text-[--color-text-muted] mt-1">Welcome to the InsureOps AI Dashboard.</p>
            </div>

            {/* Metric Cards — clean 3-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card: Claims Processed */}
                <div className="glass-card rounded-2xl p-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-[--color-text-muted]">Total Claims Processed</span>
                        <div className="w-8 h-8 rounded-lg bg-[--color-accent]/10 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-[--color-accent]" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-[--color-text-primary] tracking-tight">1,245</span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" /> +12%
                        </span>
                    </div>
                    <p className="text-xs text-[--color-text-muted]">vs. previous period</p>
                </div>

                {/* Card: Active Alerts */}
                <div className="glass-card rounded-2xl p-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-[--color-text-muted]">Active Alerts</span>
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-[--color-text-primary] tracking-tight">3</span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                            2 critical
                        </span>
                    </div>
                    <p className="text-xs text-[--color-text-muted]">Requires attention</p>
                </div>

                {/* Card: System Health */}
                <div className="glass-card rounded-2xl p-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-[--color-text-muted]">System Health</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-[--color-text-primary] tracking-tight">98.5%</span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                            Healthy
                        </span>
                    </div>
                    <p className="text-xs text-[--color-text-muted]">All agents operational</p>
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
