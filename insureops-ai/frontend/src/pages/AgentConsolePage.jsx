import ClaimsAgentForm from '../components/agents/ClaimsAgentForm';
import UnderwritingAgentForm from '../components/agents/UnderwritingAgentForm';
import FraudAgentForm from '../components/agents/FraudAgentForm';

const AgentConsolePage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">Agent Console</h1>
                <p className="text-[#a89888]">Manually trigger insurance AI agents and view results.</p>
            </div>

            {/* TODO: Tab switching between agents */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ClaimsAgentForm />
                <UnderwritingAgentForm />
                <FraudAgentForm />
            </div>
        </div>
    );
};

export default AgentConsolePage;
