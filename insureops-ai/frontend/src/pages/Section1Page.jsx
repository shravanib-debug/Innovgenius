import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import TimeRangeSelector from '../components/shared/TimeRangeSelector';
import PromptQualityWidget from '../components/section1/PromptQualityWidget';
import ResponseAccuracyWidget from '../components/section1/ResponseAccuracyWidget';
import LatencyWidget from '../components/section1/LatencyWidget';
import ApiRatesWidget from '../components/section1/ApiRatesWidget';
import CostTrackerWidget from '../components/section1/CostTrackerWidget';
import DriftWidget from '../components/section1/DriftWidget';
import InsuranceTypeDistribution from '../components/section1/InsuranceTypeDistribution';
import VerificationLatencyWidget from '../components/section1/VerificationLatencyWidget';
import EvidenceCompletenessWidget from '../components/section1/EvidenceCompletenessWidget';
import { getSection1Metrics, getInsuranceTypeMetrics } from '../services/api';
import { useApiData } from '../hooks/useApiData';

const Section1Page = () => {
    const [timeRange, setTimeRange] = useState('24h');

    const fetchFn = useCallback(() => getSection1Metrics(timeRange), [timeRange]);
    const { data, loading, isLive } = useApiData(fetchFn, null, [timeRange]);

    const fetchInsurance = useCallback(() => getInsuranceTypeMetrics(timeRange), [timeRange]);
    const { data: insuranceData, loading: insuranceLoading } = useApiData(fetchInsurance, null, [timeRange]);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">AI Application Monitoring</h1>
                    <p className="text-[#a89888]">LLM performance metrics — prompt quality, accuracy, latency, costs, and model drift.</p>
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
                <PromptQualityWidget data={data?.promptQuality} loading={loading} />
                <ResponseAccuracyWidget data={data?.responseAccuracy} loading={loading} />
                <LatencyWidget data={data?.latency} loading={loading} />
                <ApiRatesWidget data={data?.apiRates} loading={loading} />
                <CostTrackerWidget data={data?.cost} loading={loading} />
                <DriftWidget data={data?.drift} loading={loading} />
            </div>

            {/* Insurance Domain Analytics (v2) */}
            <div>
                <h2 className="text-xl font-bold text-[#f1ebe4] mb-1">Insurance Analytics</h2>
                <p className="text-sm text-[#7a6550] mb-4">Domain-specific metrics across all 5 insurance types</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InsuranceTypeDistribution data={insuranceData} loading={insuranceLoading} />
                <VerificationLatencyWidget data={insuranceData} loading={insuranceLoading} />
                <EvidenceCompletenessWidget data={insuranceData} loading={insuranceLoading} />
            </div>
        </div>
    );
};

export default Section1Page;
