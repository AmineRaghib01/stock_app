import { Router } from 'express';
import * as userController from '../../controllers/user.controller.js';
import { authenticate, requireRoles } from '../../middlewares/auth.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate.js';
import { uuidParam } from '../../validations/common.validation.js';
import { createUserBody, updateUserBody, listUsersQuery } from '../../validations/user.validation.js';

const router = Router();

router.use(authenticate, requireRoles('ADMIN'));

router.get('/', validateQuery(listUsersQuery), userController.list);
router.get('/:id', validateParams(uuidParam), userController.getOne);
router.post('/', validateBody(createUserBody), userController.create);
router.patch('/:id', validateParams(uuidParam), validateBody(updateUserBody), userController.update);

export default router;
