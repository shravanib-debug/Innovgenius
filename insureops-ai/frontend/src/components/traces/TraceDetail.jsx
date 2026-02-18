const TraceDetail = ({ traceId }) => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Trace Detail</h3>
            {/* TODO: Full trace view — header with trace_id, agent, latency, cost, decision badge */}
            {/* TODO: Execution timeline with TraceTimeline component */}
            <p className="text-[#a89888] text-sm">Trace ID: {traceId || 'N/A'}</p>
        </div>
    );
};

export default TraceDetail;
