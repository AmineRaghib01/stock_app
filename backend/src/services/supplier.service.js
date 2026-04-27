import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

export async function listSuppliers(query) {
  const { page, limit, skip } = parsePagination(query);
  const where = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { companyName: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.supplier.count({ where }),
    prisma.supplier.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true, purchases: true } } },
    }),
  ]);

  return {
    data: rows.map((s) => ({
      ...s,
      productCount: s._count.products,
      purchaseCount: s._count.purchases,
      _count: undefined,
    })),
    meta: buildMeta(total, page, limit),
  };
}

export async function getSupplierById(id) {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!supplier) throw new AppError('Fournisseur introuvable', 404);
  return {
    ...supplier,
    productCount: supplier._count.products,
    _count: undefined,
  };
}

export async function createSupplier(data) {
  const clean = {
    ...data,
    email: data.email === '' ? null : data.email,
  };
  return prisma.supplier.create({ data: clean });
}

export async function updateSupplier(id, data) {
  const clean = {
    ...data,
    email: data.email === '' ? null : data.email,
  };
  try {
    return await prisma.supplier.update({ where: { id }, data: clean });
  } catch (e) {
    if (e.code === 'P2025') throw new AppError('Fournisseur introuvable', 404);
    throw e;
  }
}

export async function deleteSupplier(id) {
  const products = await prisma.product.count({ where: { supplierId: id } });
  if (products > 0) {
    throw new AppError('Impossible de supprimer un fournisseur lie a des produits. Dissociez d abord les produits.', 400);
  }
  try {
    await prisma.supplier.delete({ where: { id } });
  } catch (e) {
    if (e.code === 'P2025') throw new AppError('Fournisseur introuvable', 404);
    throw e;
  }
}
