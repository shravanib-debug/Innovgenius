const CostTrackerWidget = () => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Cost Tracker</h3>
            {/* TODO: Stacked area chart (cost by agent) + daily budget gauge + metric cards */}
            <p className="text-[#a89888] text-sm">Today's cost, this week, cost/request avg. Budget line overlay.</p>
            <div className="mt-4 text-4xl font-bold text-[#e8722a]">—</div>
        </div>
    );
};

export default CostTrackerWidget;
