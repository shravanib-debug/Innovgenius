const AlertRulesPanel = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Alert Rules</h3>
            {/* TODO: Table of rules + add new rule form (modal) */}
            <p className="text-[#a89888] text-sm mb-4">Manage alert rules and thresholds.</p>
            <button className="bg-[#e8722a] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#d4651f] transition-colors">
                + Add Rule
            </button>
        </div>
    );
};

export default AlertRulesPanel;
