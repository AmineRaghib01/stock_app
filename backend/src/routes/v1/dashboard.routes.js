import { Router } from 'express';
import * as dashboardController from '../../controllers/dashboard.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

router.use(authenticate);
router.get('/summary', dashboardController.summary);

export default router;
