import { Router } from 'express';
import * as activityController from '../../controllers/activity.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validateQuery } from '../../middlewares/validate.js';
import { activityListQuery } from '../../validations/report.validation.js';

const router = Router();

router.use(authenticate);
router.get('/', validateQuery(activityListQuery), activityController.list);

export default router;
