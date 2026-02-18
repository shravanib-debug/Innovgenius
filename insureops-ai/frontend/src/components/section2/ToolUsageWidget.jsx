const ToolUsageWidget = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Tool Usage</h3>
            {/* TODO: Horizontal bar chart (tool call frequency) + heatmap (tools × time) */}
            <p className="text-[#a89888] text-sm">Per-agent breakdown toggle. Success rate per tool.</p>
            <div className="mt-4 text-4xl font-bold text-[#e8722a]">—</div>
        </div>
    );
};

export default ToolUsageWidget;
