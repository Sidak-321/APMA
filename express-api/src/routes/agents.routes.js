import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import * as agentsController from '../controllers/agents.controller.js';

const router = Router({ mergeParams: true });
router.use(verifyJWT);

router.post('/', agentsController.createRun);
router.get('/', agentsController.getRuns);
router.get('/:runId', agentsController.getRun);

export default router;