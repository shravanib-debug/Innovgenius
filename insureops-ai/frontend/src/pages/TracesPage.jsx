import TraceFilters from '../components/traces/TraceFilters';

const TracesPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">Trace Explorer</h1>
                <p className="text-[#a89888]">Inspect full execution flows — LLM calls, tool usage, decisions, guardrails.</p>
            </div>

            <TraceFilters />

            {/* TODO: Trace list table */}
            <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
                <p className="text-[#a89888] text-center py-12">Trace list will appear here. Connect to /api/traces.</p>
            </div>
        </div>
    );
};

export default TracesPage;
