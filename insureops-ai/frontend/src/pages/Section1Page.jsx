import PromptQualityWidget from '../components/section1/PromptQualityWidget';
import ResponseAccuracyWidget from '../components/section1/ResponseAccuracyWidget';
import LatencyWidget from '../components/section1/LatencyWidget';
import ApiRatesWidget from '../components/section1/ApiRatesWidget';
import CostTrackerWidget from '../components/section1/CostTrackerWidget';
import DriftWidget from '../components/section1/DriftWidget';

const Section1Page = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">AI Application Monitoring</h1>
                <p className="text-[#a89888]">Infrastructure metrics for prompt quality, latency, cost, and drift.</p>
            </div>

            {/* TODO: Add TimeRangeSelector */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PromptQualityWidget />
                <ResponseAccuracyWidget />
                <LatencyWidget />
                <ApiRatesWidget />
                <CostTrackerWidget />
                <DriftWidget />
            </div>
        </div>
    );
};

export default Section1Page;
