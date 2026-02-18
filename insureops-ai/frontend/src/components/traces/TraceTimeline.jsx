const TraceTimeline = ({ steps = [] }) => {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#f1ebe4]">Execution Timeline</h4>
            {/* TODO: Vertical timeline of execution steps with connecting lines */}
            {steps.length === 0 ? (
                <p className="text-[#a89888] text-sm">No steps to display.</p>
            ) : (
                steps.map((step, i) => (
                    <div key={i} className="border-l-2 border-[#e8722a] pl-4 py-2">
                        <p className="text-[#f1ebe4] text-sm">{step.name || `Step ${i + 1}`}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default TraceTimeline;
