import { asyncHandler } from '../utils/asyncHandler.js';
import * as stockMovementService from '../services/stockMovement.service.js';
import { logActivity } from '../services/activityLog.service.js';

export const list = asyncHandler(async (req, res) => {
  const result = await stockMovementService.listStockMovements(req.query);
  res.json({ success: true, ...result });
});

export const create = asyncHandler(async (req, res) => {
  const movement = await stockMovementService.createStockMovement(req.body, req.user.id);
  await logActivity({
    userId: req.user.id,
    action: 'STOCK_MOVEMENT',
    entity: 'StockMovement',
    entityId: movement.id,
    details: { type: movement.type, productId: movement.productId, quantity: movement.quantity },
  });
  res.status(201).json({ success: true, data: movement });
});
