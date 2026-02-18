const TraceFilters = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-4 flex flex-wrap gap-4 items-center">
            {/* TODO: Agent type multi-select, decision checkboxes, date range, latency slider */}
            <select className="bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm">
                <option value="">All Agents</option>
                <option value="claims">Claims Agent</option>
                <option value="underwriting">Underwriting Agent</option>
                <option value="fraud">Fraud Agent</option>
            </select>
            <select className="bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm">
                <option value="">All Decisions</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="escalated">Escalated</option>
            </select>
            <button className="bg-[#e8722a] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#d4651f] transition-colors">
                Apply Filters
            </button>
        </div>
    );
};

export default TraceFilters;
