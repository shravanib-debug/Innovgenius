import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import TimeRangeSelector from '../components/shared/TimeRangeSelector';
import ApprovalRatesWidget from '../components/section2/ApprovalRatesWidget';
import AgentPerformanceWidget from '../components/section2/AgentPerformanceWidget';
import DecisionAccuracyWidget from '../components/section2/DecisionAccuracyWidget';
import ToolUsageWidget from '../components/section2/ToolUsageWidget';
import EscalationWidget from '../components/section2/EscalationWidget';
import ComplianceWidget from '../components/section2/ComplianceWidget';
import { getSection2Metrics } from '../services/api';
import { useApiData } from '../hooks/useApiData';

const Section2Page = () => {
    const [timeRange, setTimeRange] = useState('24h');

    const fetchFn = useCallback(() => getSection2Metrics(timeRange), [timeRange]);
    const { data, loading, isLive } = useApiData(fetchFn, null, [timeRange]);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">LLM Agent Monitoring</h1>
                    <p className="text-[#a89888]">Agent behavior tracking — approvals, performance, decision accuracy, tool usage, and compliance.</p>
                    {isLive && (
                        <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            LIVE DATA
                        </span>
                    )}
                </div>
                <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ApprovalRatesWidget data={data} loading={loading} />
                <AgentPerformanceWidget data={data?.agentPerformance} loading={loading} />
                <DecisionAccuracyWidget data={data?.decisions} loading={loading} />
                <ToolUsageWidget data={data?.toolUsage} loading={loading} />
                <EscalationWidget data={data} loading={loading} />
                <ComplianceWidget data={data?.compliance} loading={loading} />
            </div>
        </div>
    );
};

export default Section2Page;
