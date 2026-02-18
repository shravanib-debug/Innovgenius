import { useState } from 'react';

const ClaimsAgentForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        claimDescription: '',
        policyId: '',
        amount: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.({
            description: formData.claimDescription,
            policyId: formData.policyId,
            amount: parseFloat(formData.amount) || 0,
            claim_type: 'general',
        });
    };

    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-1">Claims Agent</h3>
            <p className="text-xs text-[#7a6550] mb-4">Process an insurance claim through AI evaluation.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs text-[#a89888] font-medium mb-1 block">Claim Description</label>
                    <textarea
                        placeholder="Describe the claim incident..."
                        className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm min-h-[80px] placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                        value={formData.claimDescription}
                        onChange={(e) => setFormData({ ...formData, claimDescription: e.target.value })}
                    />
                </div>
                <div>
                    <label className="text-xs text-[#a89888] font-medium mb-1 block">Policy ID</label>
                    <input
                        type="text"
                        placeholder="e.g. POL-2024-8821"
                        className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                        value={formData.policyId}
                        onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
                    />
                </div>
                <div>
                    <label className="text-xs text-[#a89888] font-medium mb-1 block">Claim Amount ($)</label>
                    <input
                        type="number"
                        placeholder="e.g. 850"
                        className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>
                <button type="submit" className="w-full bg-[#e8722a] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#c45a1a] transition-colors flex items-center justify-center gap-2">
                    Run Claims Agent
                </button>
            </form>
        </div>
    );
};

export default ClaimsAgentForm;
