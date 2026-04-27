import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { validateBody } from '../../middlewares/validate.js';
import { loginBody, updateProfileBody } from '../../validations/auth.validation.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

router.post('/login', validateBody(loginBody), authController.login);
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, validateBody(updateProfileBody), authController.updateProfile);
router.post('/logout', authenticate, authController.logout);

export default router;
