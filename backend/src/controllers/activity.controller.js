import { asyncHandler } from '../utils/asyncHandler.js';
import * as activityLogService from '../services/activityLog.service.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { total, rows } = await activityLogService.listActivityLogs({
    page,
    limit,
    skip,
    action: req.query.action,
    userId: req.query.userId,
    from: req.query.from,
    to: req.query.to,
  });
  res.json({
    success: true,
    data: rows,
    meta: buildMeta(total, page, limit),
  });
});
