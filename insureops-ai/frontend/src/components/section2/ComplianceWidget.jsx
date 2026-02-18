const ComplianceWidget = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Safety &amp; Compliance</h3>
            {/* TODO: Scorecard: PII checks, Bias flags, Safety violations + scrollable log */}
            <p className="text-[#a89888] text-sm">Traffic light status per category. Violation log table.</p>
            <div className="mt-4 text-4xl font-bold text-[#e8722a]">—</div>
        </div>
    );
};

export default ComplianceWidget;
