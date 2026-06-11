import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import * as documentsController from '../controllers/documents.controller.js';

const router = Router({ mergeParams: true });
router.use(verifyJWT);

router.post('/', documentsController.uploadMiddleware, documentsController.uploadDocument);
router.get('/', documentsController.getDocuments);
router.get('/:docId', documentsController.getDocument);

export default router;