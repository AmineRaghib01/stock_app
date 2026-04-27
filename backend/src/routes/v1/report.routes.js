import { Router } from 'express';
import * as reportController from '../../controllers/report.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validateQuery } from '../../middlewares/validate.js';
import { reportQuery } from '../../validations/report.validation.js';

const router = Router();

router.use(authenticate);

router.get('/inventory-valuation', reportController.inventoryValuation);
router.get('/low-stock', reportController.lowStock);
router.get('/stock-movements', validateQuery(reportQuery), reportController.stockMovement);
router.get('/purchases', validateQuery(reportQuery), reportController.purchases);
router.get('/sales', validateQuery(reportQuery), reportController.sales);

export default router;
