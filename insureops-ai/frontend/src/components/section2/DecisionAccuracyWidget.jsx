const DecisionAccuracyWidget = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Decision Accuracy</h3>
            {/* TODO: Line chart (accuracy trend) + confusion matrix table */}
            <p className="text-[#a89888] text-sm">Correct approvals, correct rejections, false positives/negatives.</p>
            <div className="mt-4 text-4xl font-bold text-[#e8722a]">—</div>
        </div>
    );
};

export default DecisionAccuracyWidget;
