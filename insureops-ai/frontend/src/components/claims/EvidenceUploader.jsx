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
    const uploadedReqCount = Math.min(files.length, requiredCount);
    const completenessScore = requiredCount > 0 ? uploadedReqCount / requiredCount : 0;

    const handleFiles = (newFiles) => {
        const validFiles = [];
        const errors = [];

        Array.from(newFiles).forEach(file => {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                errors.push(`${file.name}: Only PDF, JPG, and PNG files are accepted`);
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name}: File exceeds 10MB limit`);
                return;
            }
            // Add preview URL for images
            const enriched = file;
            if (file.type.startsWith('image/')) {
                enriched._preview = URL.createObjectURL(file);
            }
            // Auto-assign category based on order of requirements
            const assignedReq = requirements[files.length + validFiles.length];
            enriched._category = assignedReq?.category || 'general';
            validFiles.push(enriched);
        });

        if (errors.length > 0) {
            alert(errors.join('\n'));
        }

        if (validFiles.length > 0) {
            onFilesChange([...files, ...validFiles]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleRemove = (idx) => {
        const updated = [...files];
        if (updated[idx]._preview) {
            URL.revokeObjectURL(updated[idx]._preview);
        }
        updated.splice(idx, 1);
        onFilesChange(updated);
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-[#f1ebe4] mb-1">Upload Evidence</h3>
                <p className="text-xs text-[#7a6550]">Upload supporting documents for your {insuranceType} insurance claim.</p>
            </div>

            {/* Evidence checklist */}
            <div className="bg-[#0f0d0b] border border-[#2a201a] rounded-xl p-4">
                <h4 className="text-xs font-semibold text-[#a89888] mb-3 uppercase tracking-wider">Required Documents</h4>
                <div className="space-y-2">
                    {requirements.map((req, idx) => {
                        const isUploaded = idx < files.length;
                        return (
                            <div key={req.key} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${isUploaded
                                        ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                                        : req.required
                                            ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'
                                            : 'bg-[#1c1815] text-[#5a4a3a] border border-[#2a201a]'
                                    }`}>
                                    {isUploaded ? '✓' : req.required ? '!' : '○'}
                                </div>
                                <span className={`text-sm ${isUploaded ? 'text-[#f1ebe4]' : 'text-[#7a6550]'}`}>
                                    {req.label}
                                </span>
                                {!req.required && (
                                    <span className="text-[10px] text-[#5a4a3a] px-1.5 py-0.5 rounded bg-[#1c1815] border border-[#2a201a]">Optional</span>
                                )}
                                <span className="text-[10px] text-[#5a4a3a] ml-auto">{req.category}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Completeness score */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[#1c1815] rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${Math.min(completenessScore * 100, 100)}%`,
                            backgroundColor: completenessScore >= 0.8 ? '#22c55e' : completenessScore >= 0.5 ? '#eab308' : '#ef4444',
                        }}
                    />
                </div>
                <span className="text-xs font-medium text-[#a89888] w-12 text-right">
                    {Math.round(completenessScore * 100)}%
                </span>
            </div>

            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#2a201a] rounded-xl p-6 text-center cursor-pointer hover:border-[#e8722a]/30 hover:bg-[#e8722a]/5 transition-all duration-200"
            >
                <div className="text-3xl mb-2">📁</div>
                <p className="text-sm text-[#a89888]">Drag & drop files here, or <span className="text-[#e8722a]">click to browse</span></p>
                <p className="text-xs text-[#5a4a3a] mt-1">PDF, JPG, PNG • Max 10MB per file</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {/* Preview panel */}
            <EvidencePreviewPanel files={files} onRemove={handleRemove} />
        </div>
    );
};

export { EVIDENCE_REQUIREMENTS };
export default EvidenceUploader;
