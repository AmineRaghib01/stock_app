import { Router } from 'express';
import * as supplierController from '../../controllers/supplier.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate.js';
import { uuidParam } from '../../validations/common.validation.js';
import { createSupplierBody, updateSupplierBody, listSuppliersQuery } from '../../validations/supplier.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(listSuppliersQuery), supplierController.list);
router.get('/:id', validateParams(uuidParam), supplierController.getOne);
router.post('/', validateBody(createSupplierBody), supplierController.create);
router.patch('/:id', validateParams(uuidParam), validateBody(updateSupplierBody), supplierController.update);
router.delete('/:id', validateParams(uuidParam), supplierController.remove);

export default router;
