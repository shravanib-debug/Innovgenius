const EscalationWidget = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Escalation Frequency</h3>
            {/* TODO: Line chart (escalation count per agent) + pie chart (reasons) */}
            <p className="text-[#a89888] text-sm">Reasons: high value, low confidence, policy flag, fraud suspicion.</p>
            <div className="mt-4 text-4xl font-bold text-[#e8722a]">—</div>
        </div>
    );
};

export default EscalationWidget;
