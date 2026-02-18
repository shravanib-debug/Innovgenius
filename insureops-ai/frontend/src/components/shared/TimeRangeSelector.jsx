import { useState } from 'react';

const ranges = [
    { label: '1H', value: '1h' },
    { label: '6H', value: '6h' },
    { label: '24H', value: '24h' },
    { label: '7D', value: '7d' },
];

const TimeRangeSelector = ({ value = '24h', onChange }) => {
    const [selected, setSelected] = useState(value);

    const handleSelect = (val) => {
        setSelected(val);
        onChange?.(val);
    };

    return (
        <div className="flex items-center gap-1 bg-[#0f0d0b] border border-[#2a201a] rounded-lg p-1">
            {ranges.map((r) => (
                <button
                    key={r.value}
                    onClick={() => handleSelect(r.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${selected === r.value
                            ? 'bg-[#e8722a] text-white shadow-md'
                            : 'text-[#a89888] hover:text-[#f1ebe4] hover:bg-[#1c1815]'
                        }`}
                >
                    {r.label}
                </button>
            ))}
        </div>
    );
};

export default TimeRangeSelector;
