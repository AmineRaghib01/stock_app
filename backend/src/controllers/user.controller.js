import { asyncHandler } from '../utils/asyncHandler.js';
import * as userService from '../services/user.service.js';
import { logActivity } from '../services/activityLog.service.js';

export const list = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.json({ success: true, ...result });
});

export const getOne = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({ success: true, data: user });
});

export const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  await logActivity({
    userId: req.user.id,
    action: 'USER_CREATE',
    entity: 'User',
    entityId: user.id,
    details: { email: user.email },
  });
  res.status(201).json({ success: true, data: user });
});

export const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  await logActivity({
    userId: req.user.id,
    action: 'USER_UPDATE',
    entity: 'User',
    entityId: user.id,
  });
  res.json({ success: true, data: user });
});
