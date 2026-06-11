import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import * as projectsController from '../controllers/projects.controller.js';

const router = Router();
router.use(verifyJWT);

router.post('/', projectsController.createProject);
router.get('/', projectsController.getProjects);
router.get('/:id', projectsController.getProject);
router.delete('/:id', projectsController.deleteProject);

export default router;