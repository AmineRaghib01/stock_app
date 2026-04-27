import { asyncHandler } from '../utils/asyncHandler.js';
import * as dashboardService from '../services/dashboard.service.js';

export const summary = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getDashboardSummary();
  res.json({ success: true, data });
});
