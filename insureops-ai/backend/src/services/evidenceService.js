/**
 * Evidence Service
 * Manages file storage, validation, and retrieval for claim evidence.
 * Uses local `uploads/` directory (upgradeable to S3/Cloudinary).
 */

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// ─── Config ──────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const ACCEPTED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log('📁 Created uploads directory:', UPLOAD_DIR);
}

// ─── Multer Storage Config ───────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Group by claim ID if available
        const claimDir = req.params.id
            ? path.join(UPLOAD_DIR, req.params.id)
            : UPLOAD_DIR;

        if (!fs.existsSync(claimDir)) {
            fs.mkdirSync(claimDir, { recursive: true });
        }
        cb(null, claimDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${uuidv4()}${ext}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    if (ACCEPTED_MIMES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Accepted: PDF, JPG, PNG`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
});

// ─── Service Functions ───────────────────────────────

/**
 * Get the file URL relative to the server
 */
function getFileUrl(claimId, filename) {
    return `/uploads/${claimId}/${filename}`;
}

/**
 * Extract file type from mimetype
 */
function getFileType(mimetype) {
    const map = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/png': 'png',
    };
    return map[mimetype] || 'unknown';
}

/**
 * Delete a file from disk
 */
async function deleteFile(fileUrl) {
    const filePath = path.join(__dirname, '..', '..', fileUrl);
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
    } catch (err) {
        console.error('Failed to delete file:', filePath, err.message);
    }
    return false;
}

/**
 * Delete all evidence files for a claim
 */
async function deleteClaimFiles(claimId) {
    const claimDir = path.join(UPLOAD_DIR, claimId);
    try {
        if (fs.existsSync(claimDir)) {
            fs.rmSync(claimDir, { recursive: true, force: true });
            return true;
        }
    } catch (err) {
        console.error('Failed to delete claim directory:', claimDir, err.message);
    }
    return false;
}

module.exports = {
    upload,
    getFileUrl,
    getFileType,
    deleteFile,
    deleteClaimFiles,
    UPLOAD_DIR,
    ACCEPTED_MIMES,
    MAX_FILE_SIZE,
};
