import { asyncHandler } from '../utils/asyncHandler.js';
import * as productService from '../services/product.service.js';
import { logActivity } from '../services/activityLog.service.js';

export const list = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);
  res.json({ success: true, ...result });
});

export const getOne = asyncHandler(async (req, res) => {
  const data = await productService.getProductById(req.params.id);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const data = await productService.createProduct(req.body);
  await logActivity({
    userId: req.user.id,
    action: 'PRODUCT_CREATE',
    entity: 'Product',
    entityId: data.id,
    details: { sku: data.sku, name: data.name },
  });
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await productService.updateProduct(req.params.id, req.body);
  await logActivity({
    userId: req.user.id,
    action: 'PRODUCT_UPDATE',
    entity: 'Product',
    entityId: data.id,
  });
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  await logActivity({
    userId: req.user.id,
    action: 'PRODUCT_DELETE',
    entity: 'Product',
    entityId: req.params.id,
  });
  res.json({ success: true, message: 'Produit supprime' });
});

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Aucun fichier televerse' });
  }
  const publicPath = `/uploads/${req.file.filename}`;
  const imageUrl = `${req.protocol}://${req.get('host')}${publicPath}`;
  const data = await productService.updateProduct(req.params.id, { imageUrl });
  await logActivity({
    userId: req.user.id,
    action: 'PRODUCT_IMAGE_UPLOAD',
    entity: 'Product',
    entityId: req.params.id,
  });
  res.json({ success: true, data });
});
