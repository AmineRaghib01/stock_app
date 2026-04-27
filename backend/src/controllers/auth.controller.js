import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import { logActivity } from '../services/activityLog.service.js';

export const login = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || null;
  const result = await authService.login(req.body, { ip });
  res.json({ success: true, data: result });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ success: true, data: user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  await logActivity({
    userId: req.user.id,
    action: 'PROFILE_UPDATE',
    entity: 'User',
    entityId: user.id,
  });
  res.json({ success: true, data: user });
});

export const logout = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || null;
  await logActivity({
    userId: req.user.id,
    action: 'LOGOUT',
    ipAddress: ip,
  });
  res.json({ success: true, message: 'Deconnexion reussie' });
});
