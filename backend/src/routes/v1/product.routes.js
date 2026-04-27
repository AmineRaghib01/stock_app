import { Router } from 'express';
import * as productController from '../../controllers/product.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate.js';
import { uuidParam } from '../../validations/common.validation.js';
import { createProductBody, updateProductBody, listProductsQuery } from '../../validations/product.validation.js';
import { uploadProductImage } from '../../middlewares/upload.js';
import { AppError } from '../../utils/AppError.js';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(listProductsQuery), productController.list);
router.get('/:id', validateParams(uuidParam), productController.getOne);
router.post('/', validateBody(createProductBody), productController.create);
router.patch('/:id', validateParams(uuidParam), validateBody(updateProductBody), productController.update);
router.delete('/:id', validateParams(uuidParam), productController.remove);

router.post(
  '/:id/image',
  validateParams(uuidParam),
  (req, res, next) => {
    uploadProductImage(req, res, (err) => {
      if (err) return next(new AppError(err.message || 'Echec du televersement', 400));
      next();
    });
  },
  productController.uploadImage
);

export default router;
