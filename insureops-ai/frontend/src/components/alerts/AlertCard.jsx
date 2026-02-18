const AlertCard = ({ alert }) => {
    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            {/* TODO: Severity badge, alert name, current value vs threshold, acknowledge button */}
            <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <h4 className="text-[#f1ebe4] font-medium">{alert?.name || 'Sample Alert'}</h4>
            </div>
            <p className="text-[#a89888] text-sm">{alert?.description || 'Alert description — connect to /api/alerts.'}</p>
            <button className="mt-4 bg-[#2a201a] text-[#e8722a] rounded-lg px-4 py-2 text-sm hover:bg-[#3a2f25] transition-colors">
                Acknowledge
            </button>
        </div>
    );
};

export default AlertCard;
