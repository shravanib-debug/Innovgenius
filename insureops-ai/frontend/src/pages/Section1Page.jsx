import React from 'react';
import ApiRatesWidget from '../components/section1/ApiRatesWidget';
import CostTrackerWidget from '../components/section1/CostTrackerWidget';
import DriftWidget from '../components/section1/DriftWidget';
import LatencyWidget from '../components/section1/LatencyWidget';
import PromptQualityWidget from '../components/section1/PromptQualityWidget';
import ResponseAccuracyWidget from '../components/section1/ResponseAccuracyWidget';

const Section1Page = () => {
    // Example props, replace with real data as needed
    const apiRates = { success: 1200, failure: 45, successRate: 96.4 };
    const costData = { total: 32.45, byAgent: { claims: 12.3, underwriting: 8.1, fraud: 7.2, support: 4.85 }, trend: [], avgPerRequest: 0.027 };
    const drift = { score: 0.08, status: 'normal' };
    const latency = { p50: 120, p95: 350, p99: 800, trend: [], slaBreach: false };
    const promptQuality = { score: 87, trend: [ { value: 80 }, { value: 87 } ] };
    const responseAccuracy = { byAgent: { claims: 92, underwriting: 88, fraud: 85, support: 90 }, overall: 89 };

    return (
        <div className="p-6 md:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ApiRatesWidget {...apiRates} />
            <CostTrackerWidget {...costData} />
            <DriftWidget {...drift} />
            <LatencyWidget {...latency} />
            <PromptQualityWidget {...promptQuality} />
            <ResponseAccuracyWidget {...responseAccuracy} />
        </div>
    );
};

export default Section1Page;
