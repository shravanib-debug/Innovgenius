import React, { useState } from 'react';
import TimeRangeSelector from '../components/shared/TimeRangeSelector';
import MetricCard from '../components/shared/MetricCard';
import PromptQualityWidget from '../components/section1/PromptQualityWidget';
import ResponseAccuracyWidget from '../components/section1/ResponseAccuracyWidget';
import LatencyWidget from '../components/section1/LatencyWidget';
import ApiRatesWidget from '../components/section1/ApiRatesWidget';
import CostTrackerWidget from '../components/section1/CostTrackerWidget';
import DriftWidget from '../components/section1/DriftWidget';
import { useMetrics } from '../hooks/useMetrics';
import { Activity, Zap, DollarSign, AlertTriangle } from 'lucide-react';

const Section1Page = () => {
    const [timeRange, setTimeRange] = useState('24h');
    const { data, loading, error } = useMetrics('section1', timeRange);

    // Derive summary metrics from API data (with sensible defaults)
    const summaryMetrics = [
        {
            title: 'Total Traces',
            value: data ? data.traceCount.toLocaleString() : '—',
            trend: 0,
            icon: Activity
        },
        {
            title: 'Avg Latency',
            value: data ? `${(data.latency.avg / 1000).toFixed(1)}s` : '—',
            trend: 0,
            trendLabel: data?.latency?.slaBreach ? 'SLA breach' : 'healthy',
            variant: data?.latency?.slaBreach ? 'critical' : 'success',
            icon: Zap
        },
        {
            title: 'Total Cost',
            value: data ? `$${data.cost.total.toFixed(2)}` : '—',
            trend: 0,
            variant: 'warning',
            icon: DollarSign
        },
        {
            title: 'Drift Status',
            value: data ? data.drift.score.toFixed(2) : '—',
            trend: 0,
            variant: data?.drift?.status === 'normal' ? 'success' : 'critical',
            icon: AlertTriangle
        },
    ];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AI Application Monitoring</h1>
                    <p className="text-[--color-text-secondary] mt-1">Infrastructure health, costs, and quality metrics.</p>
                </div>
                <TimeRangeSelector selectedRange={timeRange} onRangeChange={setTimeRange} />
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                    ⚠ Failed to load metrics: {error} — showing fallback data.
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryMetrics.map((metric, index) => (
                    <MetricCard
                        key={index}
                        {...metric}
                        className={`delay-${index * 100}`}
                    />
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Row 1 */}
                <div className="lg:col-span-1">
                    <PromptQualityWidget
                        score={data?.promptQuality?.score ?? 85}
                        trend={data?.promptQuality?.trend ?? []}
                    />
                </div>
                <div className="lg:col-span-2">
                    <ResponseAccuracyWidget
                        byAgent={data?.responseAccuracy?.byAgent ?? {}}
                        overall={data?.responseAccuracy?.overall ?? 0}
                    />
                </div>

                {/* Row 2 */}
                <div className="lg:col-span-1">
                    <LatencyWidget
                        p50={data?.latency?.p50 ?? 0}
                        p95={data?.latency?.p95 ?? 0}
                        p99={data?.latency?.p99 ?? 0}
                        trend={data?.latency?.trend ?? []}
                        slaBreach={data?.latency?.slaBreach ?? false}
                    />
                </div>
                <div className="lg:col-span-1">
                    <ApiRatesWidget
                        success={data?.apiRates?.success ?? 0}
                        failure={data?.apiRates?.failure ?? 0}
                        successRate={data?.apiRates?.successRate ?? 100}
                    />
                </div>
                <div className="lg:col-span-1">
                    <CostTrackerWidget
                        total={data?.cost?.total ?? 0}
                        byAgent={data?.cost?.byAgent ?? {}}
                        trend={data?.cost?.trend ?? []}
                        avgPerRequest={data?.cost?.avgPerRequest ?? 0}
                    />
                </div>

                {/* Row 3 - Drift */}
                <div className="lg:col-span-1">
                    <DriftWidget
                        score={data?.drift?.score ?? 0.05}
                        status={data?.drift?.status ?? 'normal'}
                    />
                </div>
            </div>
        </div>
    );
};

export default Section1Page;
