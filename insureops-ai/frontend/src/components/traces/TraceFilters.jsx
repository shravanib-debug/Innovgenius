import { useState } from 'react';
import { SlidersHorizontal, Calendar } from 'lucide-react';

const TraceFilters = ({ onFilterChange }) => {
    const [agentType, setAgentType] = useState('all');
    const [decision, setDecision] = useState('all');
    const [latencyRange, setLatencyRange] = useState('all');

    const handleChange = (key, value) => {
        const filters = { agentType, decision, latencyRange, [key]: value };
        if (key === 'agentType') setAgentType(value);
        if (key === 'decision') setDecision(value);
        if (key === 'latencyRange') setLatencyRange(value);
        onFilterChange?.(filters);
    };

    const selectClasses = "bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-xs focus:border-[#e8722a]/50 focus:outline-none transition-colors cursor-pointer";

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-[#7a6550]">
                <SlidersHorizontal size={14} />
                <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
            </div>

            <select
                className={selectClasses}
                value={agentType}
                onChange={(e) => handleChange('agentType', e.target.value)}
            >
                <option value="all">All Agents</option>
                <option value="claims">Claims</option>
                <option value="underwriting">Underwriting</option>
                <option value="fraud">Fraud</option>
                <option value="support">Support</option>
            </select>

            <select
                className={selectClasses}
                value={decision}
                onChange={(e) => handleChange('decision', e.target.value)}
            >
                <option value="all">All Decisions</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="escalated">Escalated</option>
                <option value="flagged">Flagged</option>
            </select>

            <select
                className={selectClasses}
                value={latencyRange}
                onChange={(e) => handleChange('latencyRange', e.target.value)}
            >
                <option value="all">Any Latency</option>
                <option value="fast">&lt; 1s</option>
                <option value="normal">1s – 3s</option>
                <option value="slow">3s – 5s</option>
                <option value="critical">&gt; 5s</option>
            </select>

            <button className="flex items-center gap-1.5 bg-[#1c1815] border border-[#2a201a] text-[#a89888] rounded-lg px-3 py-2 text-xs hover:text-[#f1ebe4] hover:border-[#e8722a]/30 transition-colors">
                <Calendar size={12} />
                Last 24h
            </button>
        </div>
    );
};

export default TraceFilters;
