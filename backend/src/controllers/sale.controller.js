import { asyncHandler } from '../utils/asyncHandler.js';
import * as saleService from '../services/sale.service.js';
import { logActivity } from '../services/activityLog.service.js';

export const list = asyncHandler(async (req, res) => {
  const result = await saleService.listSales(req.query);
  res.json({ success: true, ...result });
});

export const getOne = asyncHandler(async (req, res) => {
  const data = await saleService.getSaleById(req.params.id);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const data = await saleService.createSale(req.body, req.user.id);
  await logActivity({
    userId: req.user.id,
    action: 'SALE_CREATE',
    entity: 'Sale',
    entityId: data.id,
    details: { total: data.total },
  });
  res.status(201).json({ success: true, data });
});
