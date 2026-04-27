import { prisma } from '../config/database.js';

function inRange(dateField, from, to) {
  const f = {};
  if (from) f.gte = new Date(from);
  if (to) f.lte = new Date(to);
  return Object.keys(f).length ? { [dateField]: f } : {};
}

export async function inventoryValuationReport() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: { category: true, supplier: true },
  });
  const rows = products.map((p) => {
    const qty = p.quantity;
    const cost = Number(p.costPrice);
    const sell = Number(p.sellingPrice);
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category.name,
      supplier: p.supplier?.name ?? '',
      quantity: qty,
      costPrice: cost,
      sellingPrice: sell,
      valueAtCost: Math.round(qty * cost * 100) / 100,
      valueAtRetail: Math.round(qty * sell * 100) / 100,
    };
  });
  const totalCost = rows.reduce((s, r) => s + r.valueAtCost, 0);
  const totalRetail = rows.reduce((s, r) => s + r.valueAtRetail, 0);
  return { rows, totals: { atCost: totalCost, atRetail: totalRetail } };
}

export async function lowStockReport() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: { category: true },
    orderBy: { quantity: 'asc' },
  });
  const rows = products
    .filter((p) => p.quantity <= p.minStockLevel)
    .map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category.name,
      quantity: p.quantity,
      minStockLevel: p.minStockLevel,
      unit: p.unit,
      gap: p.minStockLevel - p.quantity,
    }));
  return { rows, count: rows.length };
}

export async function stockMovementReport({ from, to }) {
  const where = inRange('createdAt', from, to);
  const movements = await prisma.stockMovement.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { name: true, sku: true } },
      performedBy: { select: { firstName: true, lastName: true, email: true } },
    },
  });
  return {
    rows: movements.map((m) => ({
      id: m.id,
      date: m.createdAt,
      type: m.type,
      quantity: m.quantity,
      reason: m.reason,
      reference: m.reference,
      product: m.product.name,
      sku: m.product.sku,
      performedBy: `${m.performedBy.firstName} ${m.performedBy.lastName}`,
    })),
    count: movements.length,
  };
}

export async function purchasesReport({ from, to }) {
  const where = inRange('orderDate', from, to);
  const purchases = await prisma.purchase.findMany({
    where,
    orderBy: { orderDate: 'desc' },
    include: { supplier: true, items: true },
  });
  const rows = purchases.map((p) => ({
    id: p.id,
    reference: p.reference,
    date: p.orderDate,
    status: p.status,
    supplier: p.supplier.name,
    lines: p.items.length,
    total: Number(p.totalAmount),
  }));
  const totalAmount = rows.reduce((s, r) => s + r.total, 0);
  return { rows, count: rows.length, totalAmount };
}

export async function salesReport({ from, to }) {
  const where = inRange('saleDate', from, to);
  const sales = await prisma.sale.findMany({
    where,
    orderBy: { saleDate: 'desc' },
    include: { items: true },
  });
  const rows = sales.map((s) => ({
    id: s.id,
    reference: s.reference,
    date: s.saleDate,
    customer: s.customerName,
    lines: s.items.length,
    total: Number(s.total),
  }));
  const totalRevenue = rows.reduce((s, r) => s + r.total, 0);
  return { rows, count: rows.length, totalRevenue };
}
