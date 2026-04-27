import { asyncHandler } from '../utils/asyncHandler.js';
import * as reportService from '../services/report.service.js';

export const inventoryValuation = asyncHandler(async (_req, res) => {
  const data = await reportService.inventoryValuationReport();
  res.json({ success: true, data });
});

export const lowStock = asyncHandler(async (_req, res) => {
  const data = await reportService.lowStockReport();
  res.json({ success: true, data });
});

export const stockMovement = asyncHandler(async (req, res) => {
  const data = await reportService.stockMovementReport(req.query);
  res.json({ success: true, data });
});

export const purchases = asyncHandler(async (req, res) => {
  const data = await reportService.purchasesReport(req.query);
  res.json({ success: true, data });
});

export const sales = asyncHandler(async (req, res) => {
  const data = await reportService.salesReport(req.query);
  res.json({ success: true, data });
});
