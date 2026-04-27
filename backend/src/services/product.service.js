import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

function serializeProduct(p) {
  return {
    ...p,
    costPrice: Number(p.costPrice),
    sellingPrice: Number(p.sellingPrice),
  };
}

function buildWhere(query) {
  const where = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { sku: { contains: query.search, mode: 'insensitive' } },
      { barcode: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.supplierId) where.supplierId = query.supplierId;
  if (query.status) where.status = query.status;
  return where;
}

export async function listProducts(query) {
  const { page, limit, skip } = parsePagination(query);
  const where = buildWhere(query);
  const orderBy = { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' };
  const include = {
    category: { select: { id: true, name: true, color: true } },
    supplier: { select: { id: true, name: true, companyName: true } },
  };

  if (query.lowStock) {
    const rows = await prisma.product.findMany({ where, orderBy, include });
    const filtered = rows.filter((p) => p.quantity <= p.minStockLevel);
    const total = filtered.length;
    const paged = filtered.slice(skip, skip + limit);
    return { data: paged.map(serializeProduct), meta: buildMeta(total, page, limit) };
  }

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, skip, take: limit, orderBy, include }),
  ]);

  return { data: rows.map(serializeProduct), meta: buildMeta(total, page, limit) };
}

export async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, supplier: true },
  });
  if (!product) throw new AppError('Produit introuvable', 404);
  return serializeProduct(product);
}

export async function createProduct(data) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        barcode: data.barcode || null,
        description: data.description ?? null,
        quantity: data.quantity ?? 0,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        minStockLevel: data.minStockLevel ?? 0,
        unit: data.unit ?? 'pcs',
        status: data.status ?? 'ACTIVE',
        categoryId: data.categoryId,
        supplierId: data.supplierId || null,
      },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
    return serializeProduct(product);
  } catch (e) {
    if (e.code === 'P2002') throw new AppError('Le SKU doit etre unique', 409);
    if (e.code === 'P2003') throw new AppError('Categorie ou fournisseur invalide', 400);
    throw e;
  }
}

export async function updateProduct(id, data) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
    return serializeProduct(product);
  } catch (e) {
    if (e.code === 'P2025') throw new AppError('Produit introuvable', 404);
    if (e.code === 'P2002') throw new AppError('Le SKU doit etre unique', 409);
    throw e;
  }
}

export async function deleteProduct(id) {
  try {
    await prisma.product.delete({ where: { id } });
  } catch (e) {
    if (e.code === 'P2025') throw new AppError('Produit introuvable', 404);
    throw e;
  }
}
