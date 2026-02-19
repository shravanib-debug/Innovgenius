import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InsuranceTypeSelector from './InsuranceTypeSelector';
import EvidenceUploader, { EVIDENCE_REQUIREMENTS } from './EvidenceUploader';
import VerificationChecklist from './VerificationChecklist';

// ─── Type-Specific Field Definitions ──────────────────
const TYPE_SPECIFIC_FIELDS = {
    health: [
        { key: 'hospital_name', label: 'Hospital Name', type: 'text', placeholder: 'e.g. Apollo Hospital' },
        { key: 'admission_date', label: 'Admission Date', type: 'date' },
        { key: 'discharge_date', label: 'Discharge Date', type: 'date' },
        { key: 'treatment_type', label: 'Treatment Type', type: 'select', options: ['Surgical', 'Non-Surgical', 'Day Care', 'ICU', 'OPD'] },
        { key: 'doctor_name', label: 'Doctor Name', type: 'text', placeholder: 'e.g. Dr. Sharma' },
    ],
    vehicle: [
        { key: 'vehicle_reg', label: 'Vehicle Registration No.', type: 'text', placeholder: 'e.g. MH12AB1234' },
        { key: 'accident_type', label: 'Accident Type', type: 'select', options: ['Collision', 'Theft', 'Natural Disaster', 'Hit & Run', 'Fire'] },
        { key: 'driver_name', label: 'Driver Name', type: 'text', placeholder: 'Full name of driver' },
        { key: 'fir_number', label: 'FIR Number', type: 'text', placeholder: 'e.g. FIR-2026-1234' },
        { key: 'repair_shop', label: 'Repair Shop / Garage', type: 'text', placeholder: 'e.g. Authorized Service Center' },
    ],
    travel: [
        { key: 'booking_ref', label: 'Flight / Booking Reference', type: 'text', placeholder: 'e.g. PNR-ABC123' },
        { key: 'travel_start_date', label: 'Travel Start Date', type: 'date' },
        { key: 'travel_end_date', label: 'Travel End Date', type: 'date' },
        { key: 'destination', label: 'Destination', type: 'text', placeholder: 'e.g. Bangkok, Thailand' },
        { key: 'incident_type', label: 'Incident Type', type: 'select', options: ['Flight Delay', 'Flight Cancellation', 'Lost Baggage', 'Medical Emergency', 'Trip Cancellation'] },
    ],
    property: [
        { key: 'property_type', label: 'Property Type', type: 'select', options: ['Residential', 'Commercial', 'Industrial', 'Agricultural'] },
        { key: 'ownership_type', label: 'Ownership Type', type: 'select', options: ['Owned', 'Rented', 'Leased', 'Joint Ownership'] },
        { key: 'damage_cause', label: 'Damage Cause', type: 'select', options: ['Fire', 'Flood', 'Earthquake', 'Burglary', 'Storm', 'Structural Collapse'] },
        { key: 'area_affected', label: 'Area Affected (sq ft)', type: 'number', placeholder: 'e.g. 500' },
        { key: 'property_address', label: 'Property Address', type: 'text', placeholder: 'Full property address' },
    ],
    life: [
        { key: 'relationship', label: 'Relationship to Policyholder', type: 'select', options: ['Spouse', 'Child', 'Parent', 'Sibling', 'Nominee', 'Other'] },
        { key: 'nominee_name', label: 'Nominee / Claimant Name', type: 'text', placeholder: 'Full legal name' },
        { key: 'cause', label: 'Cause', type: 'select', options: ['Natural Death', 'Accidental Death', 'Critical Illness', 'Maturity', 'Other'] },
        { key: 'policy_start_date', label: 'Policy Start Date', type: 'date' },
        { key: 'sum_assured', label: 'Sum Assured (₹)', type: 'number', placeholder: 'e.g. 5000000' },
    ],
};

const STEPS = [
    { key: 'type', label: 'Insurance Type' },
    { key: 'details', label: 'Incident Details' },
    { key: 'evidence', label: 'Evidence Upload' },
    { key: 'review', label: 'Review & Submit' },
];

const DynamicClaimWizard = ({ onSubmit }) => {
    const [step, setStep] = useState(0);
    const [insuranceType, setInsuranceType] = useState('');
    const [commonFields, setCommonFields] = useState({
        policy_id: '',
        incident_date: '',
        claim_amount: '',
        description: '',
        location: '',
    });
    const [typeFields, setTypeFields] = useState({});
    const [evidenceFiles, setEvidenceFiles] = useState([]);

    const canGoNext = () => {
        if (step === 0) return !!insuranceType;
        if (step === 1) return commonFields.policy_id && commonFields.claim_amount && commonFields.description;

        // Step 2: Evidence - Enforce required documents
        if (step === 2) {
            const reqs = EVIDENCE_REQUIREMENTS[insuranceType] || [];
            const requiredKeys = reqs.filter(r => r.required).map(r => r.key);
            const uploadedKeys = evidenceFiles.map(f => f._requirementKey);
            const missing = requiredKeys.filter(k => !uploadedKeys.includes(k));
            return missing.length === 0;
        }

        return true;
    };

    const handleNext = () => {
        if (step < STEPS.length - 1 && canGoNext()) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleSubmit = () => {
        const formData = {
            insurance_type: insuranceType,
            ...commonFields,
            claim_amount: parseFloat(commonFields.claim_amount) || 0,
            type_specific_data: typeFields,
            evidence_files: evidenceFiles,
            policyId: commonFields.policy_id,
            amount: parseFloat(commonFields.claim_amount) || 0,
            claim_type: insuranceType,
        };
        onSubmit?.(formData);
    };

    const handleTypeFieldChange = (key, value) => {
        setTypeFields(prev => ({ ...prev, [key]: value }));
    };

    const renderField = (field) => {
        const value = typeFields[field.key] || '';
        const baseClasses = "w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors";

        if (field.type === 'select') {
            return (
                <select
                    value={value}
                    onChange={(e) => handleTypeFieldChange(field.key, e.target.value)}
                    className={baseClasses}
                >
                    <option value="">Select...</option>
                    {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        }

        return (
            <input
                type={field.type}
                value={value}
                placeholder={field.placeholder || ''}
                onChange={(e) => handleTypeFieldChange(field.key, e.target.value)}
                className={baseClasses}
            />
        );
    };

    return (
        <div className="bg-[#1c1815] border border-[#2a201a] rounded-2xl p-6">
            {/* Progress bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    {STEPS.map((s, idx) => (
                        <div key={s.key} className="flex items-center gap-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${idx < step ? 'bg-[#22c55e] text-white'
                                : idx === step ? 'bg-[#e8722a] text-white shadow-[0_0_12px_rgba(232,114,42,0.3)]'
                                    : 'bg-[#1c1815] text-[#5a4a3a] border border-[#2a201a]'
                                }`}>
                                {idx < step ? '✓' : idx + 1}
                            </div>
                            <span className={`text-xs hidden sm:inline ${idx === step ? 'text-[#f1ebe4] font-medium' : 'text-[#5a4a3a]'
                                }`}>
                                {s.label}
                            </span>
                            {idx < STEPS.length - 1 && (
                                <div className={`w-6 sm:w-12 h-[2px] mx-1 ${idx < step ? 'bg-[#22c55e]' : 'bg-[#2a201a]'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Step 1: Insurance Type */}
                    {step === 0 && (
                        <InsuranceTypeSelector
                            selected={insuranceType}
                            onSelect={(type) => {
                                setInsuranceType(type);
                                setTypeFields({});
                                setEvidenceFiles([]);
                            }}
                        />
                    )}

                    {/* Step 2: Incident Details */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-[#f1ebe4] mb-1">Incident Details</h3>
                                <p className="text-xs text-[#7a6550]">Provide details about the {insuranceType} insurance claim.</p>
                            </div>

                            {/* Common fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-[#a89888] font-medium mb-1 block">Policy ID *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. POL-H-1001"
                                        value={commonFields.policy_id}
                                        onChange={(e) => setCommonFields({ ...commonFields, policy_id: e.target.value })}
                                        className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-[#a89888] font-medium mb-1 block">Incident Date</label>
                                    <input
                                        type="date"
                                        value={commonFields.incident_date}
                                        onChange={(e) => setCommonFields({ ...commonFields, incident_date: e.target.value })}
                                        className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-[#a89888] font-medium mb-1 block">Claim Amount (₹) *</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 125000"
                                        value={commonFields.claim_amount}
                                        onChange={(e) => setCommonFields({ ...commonFields, claim_amount: e.target.value })}
                                        className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-[#a89888] font-medium mb-1 block">Location</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Mumbai, Maharashtra"
                                        value={commonFields.location}
                                        onChange={(e) => setCommonFields({ ...commonFields, location: e.target.value })}
                                        className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-[#a89888] font-medium mb-1 block">Description *</label>
                                <textarea
                                    placeholder="Describe the incident in detail..."
                                    value={commonFields.description}
                                    onChange={(e) => setCommonFields({ ...commonFields, description: e.target.value })}
                                    className="w-full bg-[#0f0d0b] border border-[#2a201a] text-[#f1ebe4] rounded-lg px-3 py-2 text-sm min-h-[80px] placeholder-[#5a4a3a] focus:border-[#e8722a]/50 focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Type-specific fields */}
                            {TYPE_SPECIFIC_FIELDS[insuranceType] && (
                                <>
                                    <div className="border-t border-[#2a201a] pt-4">
                                        <h4 className="text-sm font-semibold text-[#e8722a] mb-3 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#e8722a]" />
                                            {insuranceType.charAt(0).toUpperCase() + insuranceType.slice(1)}-Specific Details
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {TYPE_SPECIFIC_FIELDS[insuranceType].map(field => (
                                                <div key={field.key}>
                                                    <label className="text-xs text-[#a89888] font-medium mb-1 block">{field.label}</label>
                                                    {renderField(field)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 3: Evidence Upload */}
                    {step === 2 && (
                        <EvidenceUploader
                            insuranceType={insuranceType}
                            files={evidenceFiles}
                            onFilesChange={setEvidenceFiles}
                        />
                    )}

                    {/* Step 4: Review & Submit */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-[#f1ebe4] mb-1">Review & Submit</h3>
                                <p className="text-xs text-[#7a6550]">Review all details before submitting your claim.</p>
                            </div>

                            {/* Summary card */}
                            <div className="bg-[#0f0d0b] border border-[#2a201a] rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 pb-3 border-b border-[#2a201a]">
                                    <span className="text-xs font-semibold text-[#a89888] uppercase tracking-wider">Insurance Type</span>
                                    <span className="ml-auto px-2.5 py-1 rounded-lg bg-[#e8722a]/10 text-[#e8722a] text-xs font-semibold border border-[#e8722a]/20">
                                        {insuranceType.toUpperCase()}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-[#5a4a3a] text-xs">Policy ID</span>
                                        <p className="text-[#f1ebe4] font-medium">{commonFields.policy_id || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[#5a4a3a] text-xs">Amount</span>
                                        <p className="text-[#f1ebe4] font-medium">₹{Number(commonFields.claim_amount || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-[#5a4a3a] text-xs">Incident Date</span>
                                        <p className="text-[#f1ebe4] font-medium">{commonFields.incident_date || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[#5a4a3a] text-xs">Location</span>
                                        <p className="text-[#f1ebe4] font-medium">{commonFields.location || '—'}</p>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[#5a4a3a] text-xs">Description</span>
                                    <p className="text-[#f1ebe4] text-sm mt-0.5">{commonFields.description || '—'}</p>
                                </div>

                                {/* Type-specific review */}
                                {Object.keys(typeFields).length > 0 && (
                                    <div className="pt-2 border-t border-[#2a201a]">
                                        <span className="text-[#5a4a3a] text-xs block mb-2">{insuranceType.charAt(0).toUpperCase() + insuranceType.slice(1)} Details</span>
                                        <div className="grid grid-cols-2 gap-2">
                                            {TYPE_SPECIFIC_FIELDS[insuranceType]?.map(field => {
                                                const val = typeFields[field.key];
                                                if (!val) return null;
                                                return (
                                                    <div key={field.key}>
                                                        <span className="text-[#5a4a3a] text-xs">{field.label}</span>
                                                        <p className="text-[#f1ebe4] text-sm font-medium">{val}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Evidence summary */}
                                <div className="pt-2 border-t border-[#2a201a]">
                                    <span className="text-[#5a4a3a] text-xs">Evidence Files</span>
                                    <p className="text-[#f1ebe4] text-sm font-medium">
                                        {evidenceFiles.length > 0 ? `${evidenceFiles.length} file(s) uploaded` : 'No files uploaded'}
                                    </p>
                                </div>
                            </div>

                            {/* Verification pipeline preview */}
                            <VerificationChecklist insuranceType={insuranceType} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2a201a]">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={step === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === 0
                        ? 'text-[#3a2e24] cursor-not-allowed'
                        : 'text-[#a89888] hover:text-[#f1ebe4] hover:bg-[#2a201a]'
                        }`}
                >
                    ← Back
                </button>

                {step < STEPS.length - 1 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canGoNext()}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${canGoNext()
                            ? 'bg-[#e8722a] text-white hover:bg-[#c45a1a]'
                            : 'bg-[#2a201a] text-[#5a4a3a] cursor-not-allowed'
                            }`}
                    >
                        Next →
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#e8722a] text-white hover:bg-[#c45a1a] transition-colors flex items-center gap-2 shadow-[0_0_16px_rgba(232,114,42,0.2)]"
                    >
                        🚀 Submit Claim
                    </button>
                )}
            </div>
        </div>
    );
};

export default DynamicClaimWizard;
