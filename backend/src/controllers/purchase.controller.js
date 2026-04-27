import { asyncHandler } from '../utils/asyncHandler.js';
import * as purchaseService from '../services/purchase.service.js';
import { logActivity } from '../services/activityLog.service.js';

export const list = asyncHandler(async (req, res) => {
  const result = await purchaseService.listPurchases(req.query);
  res.json({ success: true, ...result });
});

export const getOne = asyncHandler(async (req, res) => {
  const data = await purchaseService.getPurchaseById(req.params.id);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const data = await purchaseService.createPurchase(req.body, req.user.id);
  await logActivity({
    userId: req.user.id,
    action: 'PURCHASE_CREATE',
    entity: 'Purchase',
    entityId: data.id,
    details: { status: data.status, total: data.totalAmount },
  });
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await purchaseService.updatePurchase(req.params.id, req.body, req.user.id);
  await logActivity({
    userId: req.user.id,
    action: 'PURCHASE_UPDATE',
    entity: 'Purchase',
    entityId: data.id,
  });
  res.json({ success: true, data });
});
