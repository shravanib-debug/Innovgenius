import React from 'react';

const TimeRangeSelector = ({ selectedRange, onRangeChange }) => {
    const ranges = [
        { value: '1h', label: '1H' },
        { value: '6h', label: '6H' },
        { value: '24h', label: '24H' },
        { value: '7d', label: '7D' },
    ];

    return (
        <div className="inline-flex bg-[--color-bg-secondary] p-1 rounded-lg border border-white/5">
            {ranges.map((range) => (
                <button
                    key={range.value}
                    onClick={() => onRangeChange(range.value)}
                    className={`
            px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
            ${selectedRange === range.value
                            ? 'bg-[--color-accent] text-white shadow-lg shadow-[--color-accent]/20'
                            : 'text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/5'
                        }
          `}
                >
                    {range.label}
                </button>
            ))}
        </div>
    );
};

export default TimeRangeSelector;
