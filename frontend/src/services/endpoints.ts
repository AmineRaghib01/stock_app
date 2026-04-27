import { api } from './api';
import type {
  ActivityLog,
  ApiEnvelope,
  Category,
  Paginated,
  Product,
  Purchase,
  Sale,
  StockMovement,
  Supplier,
  User,
} from '@/types';

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api.post<ApiEnvelope<{ token: string; user: User }>>('/auth/login', body),
  me: () => api.get<ApiEnvelope<User>>('/auth/me'),
  profile: (body: Partial<{ firstName: string; lastName: string; phone: string | null; password: string }>) =>
    api.patch<ApiEnvelope<User>>('/auth/profile', body),
  logout: () => api.post<ApiEnvelope<{ message: string }>>('/auth/logout'),
};

export const usersApi = {
  list: (params?: Record<string, unknown>) => api.get<Paginated<User>>('/users', { params }),
  get: (id: string) => api.get<ApiEnvelope<User>>(`/users/${id}`),
  create: (body: Record<string, unknown>) => api.post<ApiEnvelope<User>>('/users', body),
  update: (id: string, body: Record<string, unknown>) => api.patch<ApiEnvelope<User>>(`/users/${id}`, body),
};

export const categoriesApi = {
  list: () => api.get<ApiEnvelope<Category[]>>('/categories'),
  get: (id: string) => api.get<ApiEnvelope<Category>>(`/categories/${id}`),
  create: (body: Record<string, unknown>) => api.post<ApiEnvelope<Category>>('/categories', body),
  update: (id: string, body: Record<string, unknown>) => api.patch<ApiEnvelope<Category>>(`/categories/${id}`, body),
  remove: (id: string) => api.delete(`/categories/${id}`),
};

export const suppliersApi = {
  list: (params?: Record<string, unknown>) => api.get<Paginated<Supplier>>('/suppliers', { params }),
  get: (id: string) => api.get<ApiEnvelope<Supplier>>(`/suppliers/${id}`),
  create: (body: Record<string, unknown>) => api.post<ApiEnvelope<Supplier>>('/suppliers', body),
  update: (id: string, body: Record<string, unknown>) => api.patch<ApiEnvelope<Supplier>>(`/suppliers/${id}`, body),
  remove: (id: string) => api.delete(`/suppliers/${id}`),
};

export const productsApi = {
  list: (params?: Record<string, unknown>) => api.get<Paginated<Product>>('/products', { params }),
  get: (id: string) => api.get<ApiEnvelope<Product>>(`/products/${id}`),
  create: (body: Record<string, unknown>) => api.post<ApiEnvelope<Product>>('/products', body),
  update: (id: string, body: Record<string, unknown>) => api.patch<ApiEnvelope<Product>>(`/products/${id}`, body),
  remove: (id: string) => api.delete(`/products/${id}`),
  uploadImage: (id: string, file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post<ApiEnvelope<Product>>(`/products/${id}/image`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const stockApi = {
  list: (params?: Record<string, unknown>) => api.get<Paginated<StockMovement>>('/stock-movements', { params }),
  create: (body: Record<string, unknown>) => api.post<ApiEnvelope<StockMovement>>('/stock-movements', body),
};

export const purchasesApi = {
  list: (params?: Record<string, unknown>) => api.get<Paginated<Purchase>>('/purchases', { params }),
  get: (id: string) => api.get<ApiEnvelope<Purchase>>(`/purchases/${id}`),
  create: (body: Record<string, unknown>) => api.post<ApiEnvelope<Purchase>>('/purchases', body),
  update: (id: string, body: Record<string, unknown>) => api.patch<ApiEnvelope<Purchase>>(`/purchases/${id}`, body),
};

export const salesApi = {
  list: (params?: Record<string, unknown>) => api.get<Paginated<Sale>>('/sales', { params }),
  get: (id: string) => api.get<ApiEnvelope<Sale>>(`/sales/${id}`),
  create: (body: Record<string, unknown>) => api.post<ApiEnvelope<Sale>>('/sales', body),
};

export const dashboardApi = {
  summary: () => api.get<ApiEnvelope<Record<string, unknown>>>('/dashboard/summary'),
};

export const reportsApi = {
  inventoryValuation: () => api.get<ApiEnvelope<Record<string, unknown>>>('/reports/inventory-valuation'),
  lowStock: () => api.get<ApiEnvelope<Record<string, unknown>>>('/reports/low-stock'),
  stockMovements: (params?: Record<string, unknown>) =>
    api.get<ApiEnvelope<Record<string, unknown>>>('/reports/stock-movements', { params }),
  purchases: (params?: Record<string, unknown>) =>
    api.get<ApiEnvelope<Record<string, unknown>>>('/reports/purchases', { params }),
  sales: (params?: Record<string, unknown>) =>
    api.get<ApiEnvelope<Record<string, unknown>>>('/reports/sales', { params }),
};

export const activityApi = {
  list: (params?: Record<string, unknown>) => api.get<Paginated<ActivityLog>>('/activity', { params }),
};
