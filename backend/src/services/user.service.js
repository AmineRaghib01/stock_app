import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword } from '../utils/password.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

export async function listUsers(query) {
  const { page, limit, skip } = parsePagination(query);
  const where = {};
  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: 'insensitive' } },
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.role) where.role = query.role;
  if (query.status) where.status = query.status;

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return { data: rows, meta: buildMeta(total, page, limit) };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw new AppError('Utilisateur introuvable', 404);
  return user;
}

export async function createUser(data) {
  const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (exists) throw new AppError('Email deja utilise', 409);

  const password = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone ?? null,
      role: data.role,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
  return user;
}

export async function updateUser(id, data) {
  const update = { ...data };
  if (update.password) {
    update.password = await hashPassword(update.password);
  } else {
    delete update.password;
  }
  try {
    const user = await prisma.user.update({
      where: { id },
      data: update,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  } catch {
    throw new AppError('Utilisateur introuvable', 404);
  }
}
