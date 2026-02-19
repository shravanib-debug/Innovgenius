import { useRef } from 'react';
import EvidencePreviewPanel from './EvidencePreviewPanel';

// Required evidence per insurance type
const EVIDENCE_REQUIREMENTS = {
    health: [
        { key: 'hospital_bills', label: 'Hospital Bills', required: true, category: 'financial' },
        { key: 'medical_reports', label: 'Medical Reports', required: true, category: 'medical' },
        { key: 'discharge_summary', label: 'Discharge Summary', required: true, category: 'medical' },
        { key: 'prescription', label: 'Doctor Prescription', required: false, category: 'medical' },
    ],
    vehicle: [
        { key: 'accident_images', label: 'Accident Images', required: true, category: 'visual' },
        { key: 'police_fir', label: 'Police FIR / Report', required: true, category: 'legal' },
        { key: 'repair_estimates', label: 'Repair Estimates', required: true, category: 'financial' },
        { key: 'driver_details', label: 'Driver Details', required: true, category: 'identity' },
    ],
    travel: [
        { key: 'boarding_pass', label: 'Flight Tickets / Boarding Pass', required: true, category: 'travel' },
        { key: 'delay_proof', label: 'Delay/Cancellation Proof', required: true, category: 'proof' },
        { key: 'itinerary', label: 'Travel Itinerary', required: false, category: 'travel' },
        { key: 'emergency_docs', label: 'Emergency Documents', required: false, category: 'emergency' },
    ],
    property: [
        { key: 'ownership_proof', label: 'Ownership Proof', required: true, category: 'legal' },
        { key: 'damage_photos', label: 'Damage Photos/Videos', required: true, category: 'visual' },
        { key: 'surveyor_report', label: 'Surveyor Report', required: true, category: 'assessment' },
        { key: 'repair_costs', label: 'Repair Cost Estimates', required: true, category: 'financial' },
    ],
    life: [
        { key: 'death_certificate', label: 'Death Certificate', required: true, category: 'legal' },
        { key: 'medical_history', label: 'Medical History', required: true, category: 'medical' },
        { key: 'nominee_details', label: 'Nominee Details', required: true, category: 'identity' },
        { key: 'policy_tenure', label: 'Policy Tenure Records', required: true, category: 'policy' },
    ],
};

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const EvidenceUploader = ({ insuranceType, files, onFilesChange }) => {
    const fileInputRef = useRef(null);
    const requirements = EVIDENCE_REQUIREMENTS[insuranceType] || [];
    const requiredCount = requirements.filter(r => r.required).length;
    // Calculate completeness based on satisfied requirements, not just file count
    const satisfiedReqs = requirements.filter(r => files.some(f => f._requirementKey === r.key)).length;
    const completenessScore = requiredCount > 0 ? satisfiedReqs / requiredCount : 0;

    const handleFileForRequirement = (newFiles, req) => {
        const file = newFiles[0];
        if (!file) return;

        if (!ACCEPTED_TYPES.includes(file.type)) {
            alert(`${file.name}: Only PDF, JPG, and PNG files are accepted`);
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert(`${file.name}: File exceeds 10MB limit`);
            return;
        }

        const enriched = file;
        if (file.type.startsWith('image/')) {
            enriched._preview = URL.createObjectURL(file);
        }
        enriched._category = req.category;
        enriched._requirementKey = req.key;
        enriched._label = req.label;

        // Remove existing file for this requirement if any, then add new one
        const others = files.filter(f => f._requirementKey !== req.key);
        onFilesChange([...others, enriched]);
    };

    const handleRemove = (key) => {
        const fileToRemove = files.find(f => f._requirementKey === key);
        if (fileToRemove?._preview) {
            URL.revokeObjectURL(fileToRemove._preview);
        }
        onFilesChange(files.filter(f => f._requirementKey !== key));
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-[#f1ebe4] mb-1">Upload Evidence</h3>
                <p className="text-xs text-[#7a6550]">Please upload the specific documents required for your {insuranceType} claim.</p>
            </div>

            {/* Completeness score */}
            <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 bg-[#1c1815] rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${Math.min(completenessScore * 100, 100)}%`,
                            backgroundColor: completenessScore >= 1 ? '#22c55e' : completenessScore >= 0.5 ? '#eab308' : '#ef4444',
                        }}
                    />
                </div>
                <span className="text-xs font-medium text-[#a89888] w-12 text-right">
                    {Math.round(completenessScore * 100)}%
                </span>
            </div>

            {/* Requirement Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements.map((req) => {
                    const file = files.find(f => f._requirementKey === req.key);

                    return (
                        <div key={req.key} className={`border rounded-xl p-4 transition-all ${file
                                ? 'bg-[#0f0d0b] border-[#22c55e]/30'
                                : 'bg-[#1c1815] border-[#2a201a] hover:border-[#e8722a]/30'
                            }`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className={`text-sm font-medium ${file ? 'text-[#22c55e]' : 'text-[#f1ebe4]'}`}>
                                            {req.label}
                                        </h4>
                                        {req.required && !file && (
                                            <span className="text-[10px] text-[#ef4444] font-bold px-1.5 py-0.5 bg-[#ef4444]/10 rounded border border-[#ef4444]/20">REQUIRED</span>
                                        )}
                                        {file && (
                                            <span className="text-[10px] text-[#22c55e] font-bold px-1.5 py-0.5 bg-[#22c55e]/10 rounded border border-[#22c55e]/20">UPLOADED</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-[#7a6550] mt-0.5">{req.category} evidence</p>
                                </div>
                            </div>

                            {file ? (
                                <div className="flex items-center gap-3 bg-[#1c1815] rounded-lg p-2 border border-[#2a201a]">
                                    {file._preview ? (
                                        <img src={file._preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                                    ) : (
                                        <div className="w-10 h-10 bg-[#2a201a] rounded flex items-center justify-center text-lg">📄</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-[#f1ebe4] truncate">{file.name}</p>
                                        <p className="text-[10px] text-[#5a4a3a]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(req.key)}
                                        className="text-[#a89888] hover:text-[#ef4444] p-1.5 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-[#2a201a] rounded-lg cursor-pointer hover:bg-[#2a201a]/30 hover:border-[#e8722a]/30 group transition-all">
                                    <span className="text-xl group-hover:scale-110 transition-transform mb-1">☁️</span>
                                    <span className="text-[10px] text-[#7a6550] group-hover:text-[#e8722a]">Click to Upload</span>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={(e) => handleFileForRequirement(e.target.files, req)}
                                    />
                                </label>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Note */}
            <p className="text-[10px] text-[#5a4a3a] text-center mt-4">
                Supported formats: PDF, JPG, PNG • Max size: 10MB per file
            </p>
        </div>
    );
};

export { EVIDENCE_REQUIREMENTS };
export default EvidenceUploader;
