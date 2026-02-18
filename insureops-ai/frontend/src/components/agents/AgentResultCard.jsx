const AgentResultCard = ({ result }) => {
    if (!result) return null;

    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-[#f1ebe4] font-semibold">Result</h4>
                {/* TODO: Decision badge (Approved/Rejected/Escalated/Flagged) */}
                <span className="bg-[#e8722a]/20 text-[#e8722a] text-xs font-medium px-3 py-1 rounded-full">
                    {result.decision || 'Pending'}
                </span>
            </div>
            {/* TODO: Confidence meter, key metrics (latency, cost, tools used), reasoning text */}
            <p className="text-[#a89888] text-sm">{result.reasoning || 'Awaiting agent response...'}</p>
            <button className="mt-4 text-[#e8722a] text-sm font-medium hover:underline">
                View Full Trace →
            </button>
        </div>
    );
};

export default AgentResultCard;
