import { Router } from 'express';
import * as stockMovementController from '../../controllers/stockMovement.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validateBody, validateQuery } from '../../middlewares/validate.js';
import { createStockMovementBody, listStockMovementsQuery } from '../../validations/stockMovement.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(listStockMovementsQuery), stockMovementController.list);
router.post('/', validateBody(createStockMovementBody), stockMovementController.create);

export default router;
