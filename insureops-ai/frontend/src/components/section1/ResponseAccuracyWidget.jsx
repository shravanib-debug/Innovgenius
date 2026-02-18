const ResponseAccuracyWidget = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Response Accuracy</h3>
            {/* TODO: Multi-line chart (one line per agent, accuracy % over time) */}
            <p className="text-[#a89888] text-sm">Accuracy trend per agent. Threshold line at 80%.</p>
            <div className="mt-4 text-4xl font-bold text-[#e8722a]">—</div>
        </div>
    );
};

export default ResponseAccuracyWidget;
