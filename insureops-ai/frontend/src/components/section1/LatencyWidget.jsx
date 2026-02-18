const LatencyWidget = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Latency</h3>
            {/* TODO: Histogram + P50/P95/P99 metric cards + real-time line chart */}
            <p className="text-[#a89888] text-sm">Response time distribution. SLA breach when P95 &gt; 5s.</p>
            <div className="mt-4 text-4xl font-bold text-[#e8722a]">—</div>
        </div>
    );
};

export default LatencyWidget;
