const LoadingSkeleton = ({ rows = 3, className = '' }) => {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 rounded-lg bg-gradient-to-r from-[#1c1815] via-[#252018] to-[#1c1815] animate-shimmer"
                    style={{
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s ease-in-out infinite',
                        width: `${85 - i * 15}%`,
                    }}
                />
            ))}
        </div>
    );
};

export const WidgetSkeleton = ({ className = '' }) => (
    <div className={`bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6 ${className}`}>
        <div className="h-5 w-32 rounded bg-[#252018] mb-4" style={{ animation: 'shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #1c1815, #252018, #1c1815)' }} />
        <div className="space-y-3">
            <div className="h-32 rounded-lg bg-[#0f0d0b]" style={{ animation: 'shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #0f0d0b, #1c1815, #0f0d0b)' }} />
            <div className="flex gap-3">
                <div className="h-8 flex-1 rounded bg-[#252018]" style={{ animation: 'shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #1c1815, #252018, #1c1815)' }} />
                <div className="h-8 flex-1 rounded bg-[#252018]" style={{ animation: 'shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #1c1815, #252018, #1c1815)' }} />
            </div>
        </div>
    </div>
);

export default LoadingSkeleton;
