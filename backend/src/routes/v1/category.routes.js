import { Router } from 'express';
import * as categoryController from '../../controllers/category.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validateBody, validateParams } from '../../middlewares/validate.js';
import { uuidParam } from '../../validations/common.validation.js';
import { createCategoryBody, updateCategoryBody } from '../../validations/category.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', categoryController.list);
router.get('/:id', validateParams(uuidParam), categoryController.getOne);
router.post('/', validateBody(createCategoryBody), categoryController.create);
router.patch('/:id', validateParams(uuidParam), validateBody(updateCategoryBody), categoryController.update);
router.delete('/:id', validateParams(uuidParam), categoryController.remove);

export default router;
