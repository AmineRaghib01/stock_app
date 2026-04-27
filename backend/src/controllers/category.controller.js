import { asyncHandler } from '../utils/asyncHandler.js';
import * as categoryService from '../services/category.service.js';
import { logActivity } from '../services/activityLog.service.js';

export const list = asyncHandler(async (_req, res) => {
  const data = await categoryService.listCategories();
  res.json({ success: true, data });
});

export const getOne = asyncHandler(async (req, res) => {
  const data = await categoryService.getCategoryById(req.params.id);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const data = await categoryService.createCategory(req.body);
  await logActivity({
    userId: req.user.id,
    action: 'CATEGORY_CREATE',
    entity: 'Category',
    entityId: data.id,
    details: { name: data.name },
  });
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await categoryService.updateCategory(req.params.id, req.body);
  await logActivity({
    userId: req.user.id,
    action: 'CATEGORY_UPDATE',
    entity: 'Category',
    entityId: data.id,
  });
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  await logActivity({
    userId: req.user.id,
    action: 'CATEGORY_DELETE',
    entity: 'Category',
    entityId: req.params.id,
  });
  res.json({ success: true, message: 'Categorie supprimee' });
});
