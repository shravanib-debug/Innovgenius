import { useState } from 'react';

const FraudAgentForm = () => {
    const [formData, setFormData] = useState({
        claimId: '',
        claimantId: '',
        claimDescription: '',
        amount: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Call POST /api/agents/fraud/run
        console.log('Submitting fraud check:', formData);
    };

    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-4">Fraud Detection Agent</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Claim ID"
                    className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm"
                    value={formData.claimId}
                    onChange={(e) => setFormData({ ...formData, claimId: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Claimant ID"
                    className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm"
                    value={formData.claimantId}
                    onChange={(e) => setFormData({ ...formData, claimantId: e.target.value })}
                />
                <textarea
                    placeholder="Claim description..."
                    className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm min-h-[80px]"
                    value={formData.claimDescription}
                    onChange={(e) => setFormData({ ...formData, claimDescription: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Amount ($)"
                    className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
                <button type="submit" className="w-full bg-[#e8722a] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#d4651f] transition-colors">
                    Run Fraud Agent
                </button>
            </form>
        </div>
    );
};

export default FraudAgentForm;
