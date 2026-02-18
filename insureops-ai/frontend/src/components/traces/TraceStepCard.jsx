const TraceStepCard = ({ step }) => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-4">
            {/* TODO: Expandable card — step type, name, duration, input/output JSON */}
            <div className="flex items-center justify-between">
                <span className="text-[#f1ebe4] text-sm font-medium">{step?.name || 'Step'}</span>
                <span className="text-[#a89888] text-xs">{step?.duration || '—'}ms</span>
            </div>
        </div>
    );
};

export default TraceStepCard;
