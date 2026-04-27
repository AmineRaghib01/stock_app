import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

export async function createStockMovement(data, userId) {
  const { productId, type, quantity, reason, reference } = data;

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError('Produit introuvable', 404);
    if (product.status !== 'ACTIVE') throw new AppError('Le produit est inactif', 400);

    let delta = 0;
    if (type === 'IN') delta = quantity;
    else if (type === 'OUT') delta = -Math.abs(quantity);
    else if (type === 'ADJUSTMENT') delta = quantity;

    const nextQty = product.quantity + delta;
    if (nextQty < 0) throw new AppError('Stock insuffisant pour cette operation', 400);

    await tx.product.update({
      where: { id: productId },
      data: { quantity: nextQty },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        type,
        quantity,
        reason: reason ?? null,
        reference: reference ?? null,
        performedById: userId,
      },
      include: {
        product: { select: { id: true, name: true, sku: true, quantity: true } },
        performedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return movement;
  });
}

export async function listStockMovements(query) {
  const { page, limit, skip } = parsePagination(query);
  const where = {};
  if (query.productId) where.productId = query.productId;
  if (query.type) where.type = query.type;
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lte = new Date(query.to);
  }

  const [total, rows] = await Promise.all([
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        performedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return { data: rows, meta: buildMeta(total, page, limit) };
}
