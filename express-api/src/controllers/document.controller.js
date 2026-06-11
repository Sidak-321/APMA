import path from 'path';
import multer from 'multer';
import * as documentsService from '../services/documents.service.js';

const storage = multer.diskStorage({
  destination: '/tmp/uploads',
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Only PDF, DOCX, CSV allowed'));
  },
});

export const uploadMiddleware = upload.single('file');

export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const doc = await documentsService.uploadDocument(req.user.id, req.params.projectId, req.file);
    res.status(201).json(doc);
  } catch (err) { next(err); }
}

export async function getDocuments(req, res, next) {
  try {
    const docs = await documentsService.getDocuments(req.user.id, req.params.projectId);
    res.json(docs);
  } catch (err) { next(err); }
}

export async function getDocument(req, res, next) {
  try {
    const doc = await documentsService.getDocument(req.user.id, req.params.docId);
    res.json(doc);
  } catch (err) { next(err); }
}