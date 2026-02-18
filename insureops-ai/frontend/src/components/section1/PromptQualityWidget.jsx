const PromptQualityWidget = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Prompt Quality</h3>
            {/* TODO: Gauge chart (0-100 score) + line chart (score trend over time) */}
            <p className="text-[#a89888] text-sm">Gauge chart — score based on structure, token count, and template adherence.</p>
            <div className="mt-4 text-4xl font-bold text-[#e8722a]">—</div>
        </div>
    );
};

export default PromptQualityWidget;
