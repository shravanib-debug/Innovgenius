import { useState } from 'react';

const UnderwritingAgentForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        healthConditions: '',
        occupation: '',
        coverageAmount: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Call POST /api/agents/underwriting/run
        console.log('Submitting underwriting:', formData);
    };

    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Underwriting Agent</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Applicant Name"
                    className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Age"
                    className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Health Conditions (comma-separated)"
                    className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm"
                    value={formData.healthConditions}
                    onChange={(e) => setFormData({ ...formData, healthConditions: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Occupation"
                    className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Coverage Amount ($)"
                    className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm"
                    value={formData.coverageAmount}
                    onChange={(e) => setFormData({ ...formData, coverageAmount: e.target.value })}
                />
                <button type="submit" className="w-full bg-[#e8722a] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#d4651f] transition-colors">
                    Run Underwriting Agent
                </button>
            </form>
        </div>
    );
};

export default UnderwritingAgentForm;
