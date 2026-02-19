import { motion } from 'framer-motion';

// Verification pipeline steps per insurance type
const VERIFICATION_PIPELINES = {
    health: [
        { name: 'Medical Document Parsing', description: 'OCR extraction of procedure codes, amounts, dates from bills' },
        { name: 'Coverage Eligibility Check', description: 'Cross-reference procedures with policy coverage' },
        { name: 'Fraud Pattern Detection', description: 'Amount mismatch, duplicate billing flags' },
        { name: 'Decision', description: 'Final approval/rejection based on all checks' },
    ],
    vehicle: [
        { name: 'Damage Photo Analysis', description: 'AI Vision damage severity scoring (0-1)' },
        { name: 'FIR OCR Parsing', description: 'Extract details from police report' },
        { name: 'Damage vs Estimate Validation', description: 'Cross-reference damage severity with repair cost' },
        { name: 'Policy Clause Matching', description: 'Match claim to applicable coverage clauses' },
        { name: 'Decision', description: 'Final approval/rejection based on all checks' },
    ],
    travel: [
        { name: 'Boarding Pass / Ticket OCR', description: 'Extract flight numbers, dates, routes' },
        { name: 'Incident Proof Verification', description: 'Validate delay/cancellation certificates' },
        { name: 'Date Cross-Validation', description: 'Verify ticket dates match claimed incident' },
        { name: 'Coverage Matching', description: 'Map incident to policy coverage terms' },
        { name: 'Decision', description: 'Final approval/rejection based on all checks' },
    ],
    property: [
        { name: 'Ownership Document OCR', description: 'Extract owner name, property details' },
        { name: 'Damage Photo Analysis', description: 'AI Vision damage severity scoring (0-1)' },
        { name: 'Surveyor Report Parsing', description: 'Parse assessment details from surveyor report' },
        { name: 'Cost Estimation Validation', description: 'AI estimate vs repair quote comparison' },
        { name: 'Coverage Limit Check', description: 'Verify claim within policy limits' },
        { name: 'Decision', description: 'Final approval/rejection based on all checks' },
    ],
    life: [
        { name: 'Death Certificate Analysis', description: 'Vision AI authenticity + field extraction' },
        { name: 'Document Authenticity Check', description: 'Format, font, seal detection scoring' },
        { name: 'Key Field Extraction', description: 'Name, date, cause, hospital details' },
        { name: 'Policy Tenure Analysis', description: 'Cross-reference dates with policy records' },
        { name: 'Risk Clause Evaluation', description: 'Evaluate exclusions and risk flags' },
        { name: 'Decision', description: 'Final approval/rejection or escalation' },
    ],
};

const statusConfig = {
    pending: { color: '#5a4a3a', bg: '#1c1815', icon: '○', label: 'Pending' },
    in_progress: { color: '#e8722a', bg: 'rgba(232,114,42,0.1)', icon: '◎', label: 'Running' },
    passed: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: '✓', label: 'Passed' },
    failed: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '✕', label: 'Failed' },
};

const VerificationChecklist = ({ insuranceType, stepStatuses = {} }) => {
    const steps = VERIFICATION_PIPELINES[insuranceType] || [];

    if (steps.length === 0) return null;

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#f1ebe4]">Verification Pipeline</h4>
            <div className="space-y-0">
                {steps.map((step, idx) => {
                    const status = stepStatuses[step.name] || 'pending';
                    const config = statusConfig[status];
                    const isLast = idx === steps.length - 1;

                    return (
                        <motion.div
                            key={step.name}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-3 relative"
                        >
                            {/* Vertical connector line */}
                            {!isLast && (
                                <div className="absolute left-[11px] top-[24px] w-[2px] h-[calc(100%-8px)] bg-[#2a201a]" />
                            )}

                            {/* Status icon */}
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border z-10 mt-0.5"
                                style={{
                                    color: config.color,
                                    backgroundColor: config.bg,
                                    borderColor: `${config.color}30`,
                                }}
                            >
                                {config.icon}
                            </div>

                            {/* Step content */}
                            <div className="pb-4 min-w-0">
                                <p className="text-sm font-medium text-[#f1ebe4]">{step.name}</p>
                                <p className="text-xs text-[#5a4a3a] mt-0.5">{step.description}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export { VERIFICATION_PIPELINES };
export default VerificationChecklist;
