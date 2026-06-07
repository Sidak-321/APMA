import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', verifyJWT, authController.me); // protected

export default router;