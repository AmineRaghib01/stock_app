import { Router } from 'express';
import * as saleController from '../../controllers/sale.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate.js';
import { uuidParam } from '../../validations/common.validation.js';
import { createSaleBody, listSalesQuery } from '../../validations/sale.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(listSalesQuery), saleController.list);
router.get('/:id', validateParams(uuidParam), saleController.getOne);
router.post('/', validateBody(createSaleBody), saleController.create);

export default router;
