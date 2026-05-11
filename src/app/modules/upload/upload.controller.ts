import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

// Build a public URL from the uploaded file's filename.
// Uses PUBLIC_BASE_URL env var if set, else falls back to request's host.
const buildUrl = (req: Request, filename: string) => {
    const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
    return `${base.replace(/\/$/, '')}/uploads/${filename}`;
};

// POST /api/upload/image   — single image
// POST /api/upload/images  — multiple images (max 10)
// POST /api/upload/file    — single image or PDF (for attached files)

export const uploadController = {
    // ── Single image ──────────────────────────────────────────
    uploadSingle: catchAsync(async (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const url = buildUrl(req, req.file.filename);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Image uploaded successfully',
            data: { url },
        });
    }),

    // ── Multiple images (up to 10) ────────────────────────────
    uploadMultiple: catchAsync(async (req: Request, res: Response) => {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        const urls = files.map((f) => buildUrl(req, f.filename));
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: `${urls.length} image(s) uploaded successfully`,
            data: { urls },
        });
    }),

    // ── Single file (image or PDF) — for attached files ───────
    uploadFileSingle: catchAsync(async (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const url = buildUrl(req, req.file.filename);
        const isPdf = req.file.mimetype === 'application/pdf';
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'File uploaded successfully',
            data: { url, type: isPdf ? 'pdf' : 'image' },
        });
    }),
};
