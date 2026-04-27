import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

function lineTotal(qty, price) {
  return Math.round(qty * price * 100) / 100;
}

export async function createSale(data, userId) {
  const { customerName, saleDate, notes, reference, items } = data;
  const total = items.reduce((s, i) => s + lineTotal(i.quantity, i.unitPrice), 0);

  const sale = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new AppError(`Produit introuvable : ${item.productId}`, 404);
      if (product.status !== 'ACTIVE') throw new AppError(`Produit inactif : ${product.name}`, 400);
      if (product.quantity < item.quantity) {
        throw new AppError(`Stock insuffisant pour ${product.name}`, 400);
      }
    }

    const s = await tx.sale.create({
      data: {
        customerName: customerName ?? null,
        saleDate: saleDate ? new Date(saleDate) : new Date(),
        total,
        notes: notes ?? null,
        reference: reference ?? null,
        createdById: userId,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            lineTotal: lineTotal(i.quantity, i.unitPrice),
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'OUT',
          quantity: item.quantity,
          reason: customerName ? `Vente - ${customerName}` : 'Vente / sortie de stock',
          reference: reference ?? s.id,
          performedById: userId,
        },
      });
    }

    return s;
  });

  return serializeSale(sale);
}

export async function getSaleById(id) {
  const s = await prisma.sale.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
  if (!s) throw new AppError('Vente introuvable', 404);
  return serializeSale(s);
}

export async function listSales(query) {
  const { page, limit, skip } = parsePagination(query);
  const where = {};
  if (query.from || query.to) {
    where.saleDate = {};
    if (query.from) where.saleDate.gte = new Date(query.from);
    if (query.to) where.saleDate.lte = new Date(query.to);
  }
  if (query.search) {
    where.OR = [
      { customerName: { contains: query.search, mode: 'insensitive' } },
      { reference: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { saleDate: 'desc' },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        items: { select: { id: true, quantity: true, lineTotal: true } },
      },
    }),
  ]);

  return { data: rows.map(serializeSale), meta: buildMeta(total, page, limit) };
}

function serializeSale(s) {
  return {
    ...s,
    total: Number(s.total),
    items: s.items?.map((i) => ({
      ...i,
      unitPrice: i.unitPrice != null ? Number(i.unitPrice) : undefined,
      lineTotal: Number(i.lineTotal),
      product: i.product
        ? { ...i.product, costPrice: Number(i.product.costPrice), sellingPrice: Number(i.product.sellingPrice) }
        : undefined,
    })),
  };
}
