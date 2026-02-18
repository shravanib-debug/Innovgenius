const AgentPerformanceWidget = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Agent Performance</h3>
            {/* TODO: Scorecard tiles per agent: completion rate, success rate, SLA adherence */}
            <p className="text-[#a89888] text-sm">Sparkline trend on each. Color-coded status.</p>
            <div className="mt-4 text-4xl font-bold text-[#e8722a]">—</div>
        </div>
    );
};

export default AgentPerformanceWidget;
