const DriftWidget = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Model Drift</h3>
            {/* TODO: Drift score line chart + distribution comparison (baseline vs current) */}
            <p className="text-[#a89888] text-sm">Alert marker when drift &gt; 0.3.</p>
            <div className="mt-4 text-4xl font-bold text-[#e8722a]">—</div>
        </div>
    );
};

export default DriftWidget;
