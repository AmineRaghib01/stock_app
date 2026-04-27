import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { prisma } from '../config/database.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError("Authentification requise", 401);
    }
    const token = header.slice(7);
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        avatarUrl: true,
      },
    });
    if (!user || user.status !== 'ACTIVE') {
      throw new AppError("Utilisateur introuvable ou inactif", 401);
    }
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentification requise", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Permissions insuffisantes", 403));
    }
    next();
  };
}
