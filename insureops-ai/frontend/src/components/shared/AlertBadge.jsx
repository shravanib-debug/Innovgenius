import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

const AlertBadge = ({ count = 0, onClick }) => {
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (count > 0) {
            setPulse(true);
            const timer = setTimeout(() => setPulse(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [count]);

    return (
        <button
            onClick={onClick}
            className="relative p-2 rounded-lg hover:bg-[#1c1815] transition-colors group"
            aria-label={`${count} active alerts`}
        >
            <Bell size={20} className="text-[#a89888] group-hover:text-[#f1ebe4] transition-colors" />
            {count > 0 && (
                <span
                    className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#ef4444] text-white text-[10px] font-bold ${pulse ? 'animate-pulse' : ''
                        }`}
                >
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </button>
    );
};

export default AlertBadge;
