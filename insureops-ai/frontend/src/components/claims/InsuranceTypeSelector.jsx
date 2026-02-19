import { motion } from 'framer-motion';

const INSURANCE_TYPES = [
    {
        key: 'health',
        name: 'Health Insurance',
        description: 'Hospital bills, medical procedures, prescriptions',
        icon: '🏥',
        color: '#22c55e',
    },
    {
        key: 'vehicle',
        name: 'Vehicle Insurance',
        description: 'Accident damage, collision, theft claims',
        icon: '🚗',
        color: '#3b82f6',
    },
    {
        key: 'travel',
        name: 'Travel Insurance',
        description: 'Flight delays, cancellations, lost baggage',
        icon: '✈️',
        color: '#a855f7',
    },
    {
        key: 'property',
        name: 'Property Insurance',
        description: 'Fire, flood, structural damage, burglary',
        icon: '🏠',
        color: '#f59e0b',
    },
    {
        key: 'life',
        name: 'Life Insurance',
        description: 'Death benefits, nominee claims, maturity',
        icon: '❤️',
        color: '#ef4444',
    },
];

const InsuranceTypeSelector = ({ selected, onSelect }) => {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-[#f1ebe4] mb-1">Select Insurance Type</h3>
                <p className="text-xs text-[#7a6550]">Choose the type of insurance claim you want to submit.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INSURANCE_TYPES.map((type, idx) => {
                    const isSelected = selected === type.key;
                    return (
                        <motion.button
                            key={type.key}
                            type="button"
                            onClick={() => onSelect(type.key)}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`relative text-left p-4 rounded-xl border transition-all duration-200 group ${isSelected
                                    ? 'bg-[#1c1815] border-[#e8722a]/50 shadow-[0_0_20px_rgba(232,114,42,0.12)]'
                                    : 'bg-[#0f0d0b] border-[#2a201a] hover:border-[#3a2e24] hover:bg-[#1c1815]'
                                }`}
                        >
                            {isSelected && (
                                <motion.div
                                    layoutId="type-selected"
                                    className="absolute inset-0 rounded-xl border-2 border-[#e8722a]/40 pointer-events-none"
                                />
                            )}
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                                    style={{ backgroundColor: `${type.color}15` }}
                                >
                                    {type.icon}
                                </div>
                                <div className="min-w-0">
                                    <h4 className={`text-sm font-semibold ${isSelected ? 'text-[#e8722a]' : 'text-[#f1ebe4]'}`}>
                                        {type.name}
                                    </h4>
                                    <p className="text-xs text-[#7a6550] mt-0.5 leading-relaxed">{type.description}</p>
                                </div>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-5 h-5 rounded-full bg-[#e8722a] flex items-center justify-center shrink-0 mt-0.5"
                                    >
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export { INSURANCE_TYPES };
export default InsuranceTypeSelector;
