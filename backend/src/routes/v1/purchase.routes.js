import { Router } from 'express';
import * as purchaseController from '../../controllers/purchase.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate.js';
import { uuidParam } from '../../validations/common.validation.js';
import { createPurchaseBody, updatePurchaseBody, listPurchasesQuery } from '../../validations/purchase.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(listPurchasesQuery), purchaseController.list);
router.get('/:id', validateParams(uuidParam), purchaseController.getOne);
router.post('/', validateBody(createPurchaseBody), purchaseController.create);
router.patch('/:id', validateParams(uuidParam), validateBody(updatePurchaseBody), purchaseController.update);

export default router;
