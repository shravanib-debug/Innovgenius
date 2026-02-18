const ApprovalRatesWidget = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Human Approval Rates</h3>
            {/* TODO: Funnel chart: Total → Auto-approved → Human Reviewed → Approved → Rejected */}
            <p className="text-[#a89888] text-sm">Override rate metric card. Per-agent toggle.</p>
            <div className="mt-4 text-4xl font-bold text-[#e8722a]">—</div>
        </div>
    );
};

export default ApprovalRatesWidget;
