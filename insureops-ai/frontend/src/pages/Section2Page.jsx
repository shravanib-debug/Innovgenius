import ApprovalRatesWidget from '../components/section2/ApprovalRatesWidget';
import AgentPerformanceWidget from '../components/section2/AgentPerformanceWidget';
import DecisionAccuracyWidget from '../components/section2/DecisionAccuracyWidget';
import ToolUsageWidget from '../components/section2/ToolUsageWidget';
import EscalationWidget from '../components/section2/EscalationWidget';
import ComplianceWidget from '../components/section2/ComplianceWidget';

const Section2Page = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">LLM Agent Monitoring</h1>
                <p className="text-[#a89888]">Agent behavior metrics — approvals, decisions, tool usage, escalations, compliance.</p>
            </div>

            {/* TODO: Add TimeRangeSelector + Agent filter dropdown */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ApprovalRatesWidget />
                <AgentPerformanceWidget />
                <DecisionAccuracyWidget />
                <ToolUsageWidget />
                <EscalationWidget />
                <ComplianceWidget />
            </div>
        </div>
    );
};

export default Section2Page;
