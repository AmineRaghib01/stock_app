import { prisma } from '../config/database.js';

export async function getDashboardSummary() {
  const [
    totalProducts,
    totalCategories,
    totalSuppliers,
    products,
    lowStockList,
    recentMovements,
    movementByMonth,
    stockByCategory,
  ] = await Promise.all([
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.category.count(),
    prisma.supplier.count(),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { quantity: true, costPrice: true, sellingPrice: true, minStockLevel: true },
    }),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        minStockLevel: true,
        unit: true,
        category: { select: { name: true, color: true } },
      },
      orderBy: { quantity: 'asc' },
      take: 80,
    }),
    prisma.stockMovement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        performedBy: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.$queryRaw`
      SELECT date_trunc('month', "createdAt") AS month, "type", SUM("quantity")::int AS qty
      FROM "StockMovement"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY 1, 2
      ORDER BY 1 ASC
    `.catch(() => []),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        _count: { select: { products: true } },
        products: { select: { quantity: true, costPrice: true } },
      },
    }),
  ]);

  const lowStockProducts = lowStockList.filter((p) => p.quantity <= p.minStockLevel);
  const outOfStock = lowStockProducts.filter((p) => p.quantity === 0);

  const totalStockValue = products.reduce(
    (s, p) => s + Number(p.quantity) * Number(p.costPrice),
    0
  );

  const categoryChart = stockByCategory.map((c) => {
    const units = c.products.reduce((s, p) => s + p.quantity, 0);
    const value = c.products.reduce((s, p) => s + p.quantity * Number(p.costPrice), 0);
    return {
      categoryId: c.id,
      name: c.name,
      color: c.color,
      productCount: c._count.products,
      units,
      value: Math.round(value * 100) / 100,
    };
  });

  const alerts = [
    ...outOfStock.slice(0, 5).map((p) => ({
      severity: 'critical',
      type: 'OUT_OF_STOCK',
      productId: p.id,
      message: `${p.name} is out of stock`,
      sku: p.sku,
    })),
    ...lowStockProducts
      .filter((p) => p.quantity > 0)
      .slice(0, 5)
      .map((p) => ({
        severity: 'warning',
        type: 'LOW_STOCK',
        productId: p.id,
        message: `${p.name} below minimum (${p.quantity} / ${p.minStockLevel})`,
        sku: p.sku,
      })),
  ];

  return {
    summary: {
      totalProducts,
      totalCategories,
      totalSuppliers,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStock.length,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
    },
    alerts,
    recentMovements,
    charts: {
      stockByCategory: categoryChart,
      monthlyMovements: normalizeMonthly(movementByMonth),
    },
  };
}

function normalizeMonthly(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    month: r.month,
    type: r.type,
    qty: Number(r.qty),
  }));
}
