import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return categories.map((c) => ({
    ...c,
    productCount: c._count.products,
    _count: undefined,
  }));
}

export async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new AppError('Categorie introuvable', 404);
  return {
    ...category,
    productCount: category._count.products,
    _count: undefined,
  };
}

export async function createCategory(data) {
  try {
    return await prisma.category.create({ data });
  } catch (e) {
    if (e.code === 'P2002') throw new AppError('Le nom de categorie existe deja', 409);
    throw e;
  }
}

export async function updateCategory(id, data) {
  try {
    return await prisma.category.update({ where: { id }, data });
  } catch (e) {
    if (e.code === 'P2025') throw new AppError('Categorie introuvable', 404);
    if (e.code === 'P2002') throw new AppError('Le nom de categorie existe deja', 409);
    throw e;
  }
}

export async function deleteCategory(id) {
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new AppError('Impossible de supprimer une categorie contenant des produits', 400);
  }
  try {
    await prisma.category.delete({ where: { id } });
  } catch (e) {
    if (e.code === 'P2025') throw new AppError('Categorie introuvable', 404);
    throw e;
  }
}
