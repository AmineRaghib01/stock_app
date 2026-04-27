export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string | null;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  productCount?: number;
}

export interface Supplier {
  id: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  productCount?: number;
  purchaseCount?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  minStockLevel: number;
  unit: string;
  status: 'ACTIVE' | 'INACTIVE';
  imageUrl?: string | null;
  categoryId: string;
  supplierId?: string | null;
  category?: Category;
  supplier?: Supplier | null;
  createdAt?: string;
  updatedAt?: string;
}

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string | null;
  reference?: string | null;
  createdAt: string;
  product?: Pick<Product, 'id' | 'name' | 'sku'>;
  performedBy?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export type PurchaseStatus = 'DRAFT' | 'PENDING' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseItem {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  product?: Product;
}

export interface Purchase {
  id: string;
  supplierId: string;
  orderDate: string;
  status: PurchaseStatus;
  totalAmount: number;
  notes?: string | null;
  reference?: string | null;
  supplier?: Supplier;
  items?: PurchaseItem[];
  createdBy?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: Product;
}

export interface Sale {
  id: string;
  customerName?: string | null;
  saleDate: string;
  total: number;
  notes?: string | null;
  reference?: string | null;
  items?: SaleItem[];
  createdBy?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  details?: unknown;
  ipAddress?: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}
