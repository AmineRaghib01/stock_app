import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

function lineTotal(qty, cost) {
  return Math.round(qty * cost * 100) / 100;
}

async function applyPurchaseReceipt(tx, purchaseId, userId) {
  const purchase = await tx.purchase.findUnique({
    where: { id: purchaseId },
    include: { items: true },
  });
  if (!purchase) throw new AppError('Achat introuvable', 404);

  for (const item of purchase.items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product) continue;
    const newQty = product.quantity + item.quantity;
    await tx.product.update({
      where: { id: item.productId },
      data: { quantity: newQty },
    });
    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        type: 'IN',
        quantity: item.quantity,
        reason: "Reception d'achat",
        reference: purchase.reference || purchase.id,
        performedById: userId,
      },
    });
  }
}

export async function createPurchase(data, userId) {
  const { supplierId, orderDate, status, notes, reference, items } = data;
  const totalAmount = items.reduce((s, i) => s + lineTotal(i.quantity, i.unitCost), 0);

  const purchase = await prisma.$transaction(async (tx) => {
    const p = await tx.purchase.create({
      data: {
        supplierId,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        status,
        totalAmount,
        notes: notes ?? null,
        reference: reference ?? null,
        createdById: userId,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitCost: i.unitCost,
            lineTotal: lineTotal(i.quantity, i.unitCost),
          })),
        },
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (status === 'RECEIVED') {
      await applyPurchaseReceipt(tx, p.id, userId);
    }

    return p;
  });

  return serializePurchase(purchase);
}

export async function updatePurchase(id, data, userId) {
  const existing = await prisma.purchase.findUnique({ where: { id } });
  if (!existing) throw new AppError('Achat introuvable', 404);

  const { items, ...rest } = data;
  const newStatus = data.status ?? existing.status;

  if (items && existing.status === 'RECEIVED') {
    throw new AppError('Impossible de modifier les lignes d un achat deja recu', 400);
  }

  const purchase = await prisma.$transaction(async (tx) => {
    let totalAmount = Number(existing.totalAmount);

    if (items) {
      await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });
      totalAmount = items.reduce((s, i) => s + lineTotal(i.quantity, i.unitCost), 0);
      await tx.purchaseItem.createMany({
        data: items.map((i) => ({
          purchaseId: id,
          productId: i.productId,
          quantity: i.quantity,
          unitCost: i.unitCost,
          lineTotal: lineTotal(i.quantity, i.unitCost),
        })),
      });
    }

    const updated = await tx.purchase.update({
      where: { id },
      data: {
        ...rest,
        orderDate: rest.orderDate ? new Date(rest.orderDate) : undefined,
        totalAmount: items ? totalAmount : undefined,
        status: newStatus,
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    const becameReceived = newStatus === 'RECEIVED' && existing.status !== 'RECEIVED';
    if (becameReceived) {
      await applyPurchaseReceipt(tx, id, userId);
    }

    return updated;
  });

  return serializePurchase(purchase);
}

export async function getPurchaseById(id) {
  const p = await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: { include: { product: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
  if (!p) throw new AppError('Achat introuvable', 404);
  return serializePurchase(p);
}

export async function listPurchases(query) {
  const { page, limit, skip } = parsePagination(query);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.supplierId) where.supplierId = query.supplierId;
  if (query.from || query.to) {
    where.orderDate = {};
    if (query.from) where.orderDate.gte = new Date(query.from);
    if (query.to) where.orderDate.lte = new Date(query.to);
  }

  const [total, rows] = await Promise.all([
    prisma.purchase.count({ where }),
    prisma.purchase.findMany({
      where,
      skip,
      take: limit,
      orderBy: { orderDate: 'desc' },
      include: {
        supplier: { select: { id: true, name: true, companyName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        items: { select: { id: true, quantity: true, lineTotal: true } },
      },
    }),
  ]);

  return { data: rows.map(serializePurchase), meta: buildMeta(total, page, limit) };
}

function serializePurchase(p) {
  return {
    ...p,
    totalAmount: Number(p.totalAmount),
    items: p.items?.map((i) => ({
      ...i,
      unitCost: Number(i.unitCost),
      lineTotal: Number(i.lineTotal),
      product: i.product
        ? { ...i.product, costPrice: Number(i.product.costPrice), sellingPrice: Number(i.product.sellingPrice) }
        : undefined,
    })),
  };
}
