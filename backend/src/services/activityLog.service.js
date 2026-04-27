import { prisma } from '../config/database.js';

export async function logActivity({ userId, action, entity, entityId, details, ipAddress }) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity: entity ?? null,
        entityId: entityId ?? null,
        details: details ?? undefined,
        ipAddress: ipAddress ?? null,
      },
    });
  } catch (e) {
    console.error("Echec de l'enregistrement du journal d'activite", e);
  }
}

export async function listActivityLogs({ page, limit, skip, action, userId, from, to }) {
  const where = {};
  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [total, rows] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
      },
    }),
  ]);

  return { total, rows };
}
