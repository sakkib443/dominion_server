import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ── Upload directory (mounted via Coolify Persistent Volume) ──
// In Coolify, mount a volume to this path so images survive redeploys.
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── Multer disk storage ───────────────────────────────────────
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const unique = `product_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`;
        cb(null, unique);
    },
});

// ── Multer upload — up to 10 files, 10MB each ────────────────
export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpg, png, webp, gif, avif)'));
        }
    },
});
