import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import ClaimsAgentForm from '../components/agents/ClaimsAgentForm';
import UnderwritingAgentForm from '../components/agents/UnderwritingAgentForm';
import FraudAgentForm from '../components/agents/FraudAgentForm';
import AgentResultCard from '../components/agents/AgentResultCard';
import { triggerClaimsAgent, triggerUnderwritingAgent, triggerFraudAgent } from '../services/api';

const agentMeta = [
    {
        key: 'claims',
        name: 'Claims Agent',
        description: 'Process and evaluate insurance claims using policy data and RAG.',
        icon: '📋',
    },
    {
        key: 'underwriting',
        name: 'Underwriting Agent',
        description: 'Assess risk and determine policy terms for new applications.',
        icon: '📊',
    },
    {
        key: 'fraud',
        name: 'Fraud Detection Agent',
        description: 'Analyze claims for suspicious patterns and fraud indicators.',
        icon: '🔍',
    },
];

const AgentConsolePage = () => {
    const [activeAgent, setActiveAgent] = useState('claims');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTrigger = async (agentKey, formData) => {
        setResult(null);
        setError(null);
        setLoading(true);

        try {
            let response;
            switch (agentKey) {
                case 'claims':
                    response = await triggerClaimsAgent(formData);
                    break;
                case 'underwriting':
                    response = await triggerUnderwritingAgent(formData);
                    break;
                case 'fraud':
                    response = await triggerFraudAgent(formData);
                    break;
                default:
                    throw new Error(`Unknown agent: ${agentKey}`);
            }

            // Map backend response to AgentResultCard format
            setResult({
                decision: capitalize(response.decision),
                reasoning: response.reasoning,
                confidence: response.confidence,
                latency: response.latency,
                cost: response.cost,
                toolsUsed: response.toolsUsed || [],
                traceId: response.traceId,
                totalTokens: response.totalTokens,
                verification: response.details?.verification,
                evidenceAnalysis: response.details?.evidence_analysis,
            });
        } catch (err) {
            console.error('Agent error:', err);
            setError(err?.response?.data?.details || err?.response?.data?.error || err.message || 'Agent execution failed');
        } finally {
            setLoading(false);
        }
    };

    const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">Agent Console</h1>
                <p className="text-[#a89888]">Trigger AI agents manually and inspect their execution results.</p>
            </div>

            {/* Agent selector tabs */}
            <div className="flex gap-3">
                {agentMeta.map((agent) => (
                    <button
                        key={agent.key}
                        onClick={() => { setActiveAgent(agent.key); setResult(null); setError(null); }}
                        className={`flex-1 p-4 rounded-xl border transition-all duration-200 text-left ${activeAgent === agent.key
                            ? 'bg-[#1c1815] border-[#e8722a]/40 shadow-lg'
                            : 'bg-[#1c1815] border-[#2a201a] hover:border-[#2a201a]/80'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-lg">{agent.icon}</span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                                <span className="text-[10px] text-[#22c55e] uppercase font-medium">online</span>
                            </span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#f1ebe4]">{agent.name}</h3>
                        <p className="text-xs text-[#7a6550] mt-1">{agent.description}</p>
                    </button>
                ))}
            </div>

            {/* Agent form + result */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeAgent}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                        >
                            {activeAgent === 'claims' && (
                                <ClaimsAgentForm onSubmit={(formData) => handleTrigger('claims', formData)} />
                            )}
                            {activeAgent === 'underwriting' && (
                                <UnderwritingAgentForm onSubmit={(formData) => handleTrigger('underwriting', formData)} />
                            )}
                            {activeAgent === 'fraud' && (
                                <FraudAgentForm onSubmit={(formData) => handleTrigger('fraud', formData)} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-[#1c1815] border border-[#2a201a] rounded-xl p-8 flex flex-col items-center justify-center gap-4"
                        >
                            <Loader2 size={32} className="text-[#e8722a] animate-spin" />
                            <p className="text-[#a89888] text-sm">Running agent... calling OpenRouter LLM</p>
                            <p className="text-[#5a4a3a] text-xs">This may take 3-8 seconds</p>
                        </motion.div>
                    )}

                    {error && !loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#1c1815] border border-red-500/30 rounded-xl p-6"
                        >
                            <h3 className="text-red-400 font-semibold mb-2">Agent Error</h3>
                            <p className="text-[#a89888] text-sm">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="mt-4 px-4 py-2 bg-[#2a201a] text-[#f1ebe4] rounded-lg text-sm hover:bg-[#3a2e24] transition-colors"
                            >
                                Dismiss
                            </button>
                        </motion.div>
                    )}

                    {!loading && !error && <AgentResultCard result={result} />}
                </div>
            </div>
        </div>
    );
};

export default AgentConsolePage;
