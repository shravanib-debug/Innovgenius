import { useState } from 'react';

const UnderwritingAgentForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        healthConditions: '',
        occupation: '',
        coverageAmount: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.({
            ...formData,
            age: parseInt(formData.age) || 0,
            coverageAmount: parseFloat(formData.coverageAmount) || 0,
        });
    };

    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-1">Underwriting Agent</h3>
            <p className="text-xs text-[#7a6550] mb-4">Evaluate risk for a new insurance application.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs text-[#a89888] font-medium mb-1 block">Applicant Name</label>
                    <input
                        type="text"
                        placeholder="e.g. John Smith"
                        className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-[#a89888] font-medium mb-1 block">Age</label>
                        <input
                            type="number"
                            placeholder="e.g. 34"
                            className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[#a89888] font-medium mb-1 block">Occupation</label>
                        <input
                            type="text"
                            placeholder="e.g. Engineer"
                            className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                            value={formData.occupation}
                            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-[#a89888] font-medium mb-1 block">Health Conditions</label>
                    <input
                        type="text"
                        placeholder="e.g. diabetes, hypertension (comma-separated)"
                        className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                        value={formData.healthConditions}
                        onChange={(e) => setFormData({ ...formData, healthConditions: e.target.value })}
                    />
                </div>
                <div>
                    <label className="text-xs text-[#a89888] font-medium mb-1 block">Coverage Amount ($)</label>
                    <input
                        type="number"
                        placeholder="e.g. 500000"
                        className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                        value={formData.coverageAmount}
                        onChange={(e) => setFormData({ ...formData, coverageAmount: e.target.value })}
                    />
                </div>
                <button type="submit" className="w-full bg-[#e8722a] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#c45a1a] transition-colors">
                    Run Underwriting Agent
                </button>
            </form>
        </div>
    );
};

export default UnderwritingAgentForm;
