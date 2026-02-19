import { useState } from 'react';

const EvidencePreviewPanel = ({ files, onRemove }) => {
    const [lightboxIdx, setLightboxIdx] = useState(null);

    if (!files || files.length === 0) {
        return (
            <div className="border border-dashed border-[#2a201a] rounded-xl p-6 text-center">
                <p className="text-[#5a4a3a] text-sm">No evidence files uploaded yet.</p>
            </div>
        );
    }

    const getFileIcon = (file) => {
        if (file.type?.startsWith('image/')) return null; // will show thumbnail
        if (file.type === 'application/pdf') return '📄';
        return '📎';
    };

    const getFileSizeStr = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {files.map((file, idx) => {
                    const isImage = file.type?.startsWith('image/');
                    const icon = getFileIcon(file);

                    return (
                        <div
                            key={idx}
                            className="relative bg-[#0f0d0b] border border-[#2a201a] rounded-xl overflow-hidden group hover:border-[#3a2e24] transition-colors"
                        >
                            {/* Preview area */}
                            <div
                                className="h-24 flex items-center justify-center bg-[#0a0908] cursor-pointer"
                                onClick={() => isImage && setLightboxIdx(idx)}
                            >
                                {isImage && file._preview ? (
                                    <img
                                        src={file._preview}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl">{icon}</span>
                                )}
                            </div>

                            {/* File info */}
                            <div className="p-2">
                                <p className="text-xs text-[#f1ebe4] truncate font-medium">{file.name}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[10px] text-[#5a4a3a]">{getFileSizeStr(file.size)}</span>
                                    {file._category && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1c1815] text-[#a89888] border border-[#2a201a]">
                                            {file._category}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Delete button */}
                            <button
                                onClick={() => onRemove?.(idx)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#0f0d0b]/80 border border-[#2a201a] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:border-red-500/40"
                            >
                                <svg className="w-3 h-3 text-[#a89888] hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Lightbox */}
            {lightboxIdx !== null && files[lightboxIdx]?._preview && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
                    onClick={() => setLightboxIdx(null)}
                >
                    <img
                        src={files[lightboxIdx]._preview}
                        alt={files[lightboxIdx].name}
                        className="max-w-full max-h-full rounded-xl shadow-2xl"
                    />
                </div>
            )}
        </>
    );
};

export default EvidencePreviewPanel;
