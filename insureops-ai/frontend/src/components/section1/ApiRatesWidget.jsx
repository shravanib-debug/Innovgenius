const ApiRatesWidget = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">API Success / Failure Rates</h3>
            {/* TODO: Donut chart (success vs failure %) + stacked bar chart (error categories) */}
            <p className="text-[#a89888] text-sm">Error breakdown: timeout, 4xx, 5xx, rate_limit.</p>
            <div className="mt-4 text-4xl font-bold text-[#e8722a]">—</div>
        </div>
    );
};

export default ApiRatesWidget;
