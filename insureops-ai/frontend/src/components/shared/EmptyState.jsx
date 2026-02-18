import { Cpu } from 'lucide-react';

const EmptyState = ({ message = 'No data yet', description = 'Trigger an agent to start generating data.', actionLabel, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1c1815] border border-[#2a201a] flex items-center justify-center mb-4">
                <Cpu size={28} className="text-[#7a6550]" />
            </div>
            <h3 className="text-[#f1ebe4] font-semibold mb-1">{message}</h3>
            <p className="text-[#a89888] text-sm max-w-xs mb-4">{description}</p>
            {actionLabel && (
                <button
                    onClick={onAction}
                    className="bg-[#e8722a] text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-[#c45a1a] transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
