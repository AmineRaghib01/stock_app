import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { logActivity } from './activityLog.service.js';

export async function login({ email, password }, meta = {}) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw new AppError('Identifiants invalides', 401);
  }
  if (user.status !== 'ACTIVE') {
    throw new AppError('Le compte est inactif', 403);
  }
  const ok = await comparePassword(password, user.password);
  if (!ok) {
    throw new AppError('Identifiants invalides', 401);
  }

  const token = signToken({ sub: user.id, role: user.role });

  await logActivity({
    userId: user.id,
    action: 'LOGIN',
    details: { email: user.email },
    ipAddress: meta.ip,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
    },
  };
}

export async function updateProfile(userId, data) {
  const update = { ...data };
  if (update.password) {
    update.password = await hashPassword(update.password);
  } else {
    delete update.password;
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: update,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      avatarUrl: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      avatarUrl: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw new AppError('Utilisateur introuvable', 404);
  return user;
}
