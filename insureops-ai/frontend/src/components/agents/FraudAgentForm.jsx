import { useState } from 'react';

const FraudAgentForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        claimId: '',
        claimantId: '',
        claimDescription: '',
        amount: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.({
            claimId: formData.claimId,
            claimantId: formData.claimantId,
            description: formData.claimDescription,
            amount: parseFloat(formData.amount) || 0,
        });
    };

    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#f1ebe4] mb-1">Fraud Detection Agent</h3>
            <p className="text-xs text-[#7a6550] mb-4">Analyze a claim for fraud indicators and suspicious patterns.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-[#a89888] font-medium mb-1 block">Claim ID</label>
                        <input
                            type="text"
                            placeholder="e.g. CLM-1024"
                            className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                            value={formData.claimId}
                            onChange={(e) => setFormData({ ...formData, claimId: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[#a89888] font-medium mb-1 block">Claimant ID</label>
                        <input
                            type="text"
                            placeholder="e.g. CL-4421"
                            className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                            value={formData.claimantId}
                            onChange={(e) => setFormData({ ...formData, claimantId: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-[#a89888] font-medium mb-1 block">Claim Description</label>
                    <textarea
                        placeholder="Describe the claim details..."
                        className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm min-h-[80px] placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                        value={formData.claimDescription}
                        onChange={(e) => setFormData({ ...formData, claimDescription: e.target.value })}
                    />
                </div>
                <div>
                    <label className="text-xs text-[#a89888] font-medium mb-1 block">Amount ($)</label>
                    <input
                        type="number"
                        placeholder="e.g. 12000"
                        className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>
                <button type="submit" className="w-full bg-[#e8722a] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#c45a1a] transition-colors">
                    Run Fraud Agent
                </button>
            </form>
        </div>
    );
};

export default FraudAgentForm;
