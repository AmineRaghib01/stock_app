import 'dotenv/config';
import { ensureDatabaseUrl } from '../src/config/ensureDatabaseUrl.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

ensureDatabaseUrl();

const prisma = new PrismaClient();

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Demo123!', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@stockflow.app',
      password: passwordHash,
      firstName: 'Alex',
      lastName: 'Admin',
      role: 'ADMIN',
      phone: '+1 555 0100',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@stockflow.app',
      password: passwordHash,
      firstName: 'Morgan',
      lastName: 'Manager',
      role: 'MANAGER',
      phone: '+1 555 0101',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@stockflow.app',
      password: passwordHash,
      firstName: 'Sam',
      lastName: 'Staff',
      role: 'STAFF',
      phone: '+1 555 0102',
    },
  });

  const catElectronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      description: 'Devices, accessories, and components',
      color: '#6366f1',
      icon: 'cpu',
    },
  });

  const catOffice = await prisma.category.create({
    data: {
      name: 'Office Supplies',
      description: 'Paper, pens, organizers',
      color: '#0ea5e9',
      icon: 'briefcase',
    },
  });

  const catWarehouse = await prisma.category.create({
    data: {
      name: 'Warehouse',
      description: 'Bulk storage and packaging',
      color: '#f59e0b',
      icon: 'package',
    },
  });

  const supAcme = await prisma.supplier.create({
    data: {
      name: 'Acme Components',
      companyName: 'Acme Components Ltd.',
      email: 'orders@acme.example.com',
      phone: '+1 555 2000',
      address: '1200 Industrial Pkwy, Austin, TX',
      notes: 'Preferred lead time: 5–7 business days',
    },
  });

  const supGlobex = await prisma.supplier.create({
    data: {
      name: 'Globex Trading',
      companyName: 'Globex Trading Inc.',
      email: 'sales@globex.example.com',
      phone: '+1 555 3000',
      address: '88 Harbor Blvd, Seattle, WA',
    },
  });

  const supInitech = await prisma.supplier.create({
    data: {
      name: 'Initech Wholesale',
      companyName: 'Initech Wholesale',
      email: 'wholesale@initech.example.com',
      phone: '+1 555 4000',
      address: '500 Corporate Dr, Chicago, IL',
    },
  });

  const kb = await prisma.product.create({
    data: {
      name: 'Wireless Keyboard',
      sku: 'KB-WL-001',
      barcode: '5901234123457',
      description: 'Low-profile keys, multi-device Bluetooth',
      quantity: 71,
      costPrice: 28.5,
      sellingPrice: 49.99,
      minStockLevel: 10,
      unit: 'pcs',
      status: 'ACTIVE',
      categoryId: catElectronics.id,
      supplierId: supAcme.id,
    },
  });

  const hub = await prisma.product.create({
    data: {
      name: 'USB-C Hub 7-in-1',
      sku: 'HUB-USBC-7',
      barcode: '5901234123458',
      description: 'HDMI, USB-A, SD, Ethernet',
      quantity: 6,
      costPrice: 34.0,
      sellingPrice: 59.0,
      minStockLevel: 15,
      unit: 'pcs',
      status: 'ACTIVE',
      categoryId: catElectronics.id,
      supplierId: supGlobex.id,
    },
  });

  const mouse = await prisma.product.create({
    data: {
      name: 'Ergonomic Mouse',
      sku: 'MS-ERG-02',
      quantity: 120,
      costPrice: 12.25,
      sellingPrice: 24.99,
      minStockLevel: 25,
      unit: 'pcs',
      categoryId: catElectronics.id,
      supplierId: supAcme.id,
    },
  });

  const paper = await prisma.product.create({
    data: {
      name: 'A4 Copy Paper (5 reams)',
      sku: 'PAP-A4-5',
      quantity: 200,
      costPrice: 18.0,
      sellingPrice: 29.99,
      minStockLevel: 40,
      unit: 'box',
      categoryId: catOffice.id,
      supplierId: supInitech.id,
    },
  });

  const pens = await prisma.product.create({
    data: {
      name: 'Ballpoint Pens (50-pack)',
      sku: 'PEN-BP-50',
      quantity: 3,
      costPrice: 6.5,
      sellingPrice: 12.99,
      minStockLevel: 20,
      unit: 'pack',
      status: 'ACTIVE',
      categoryId: catOffice.id,
      supplierId: supInitech.id,
    },
  });

  const box = await prisma.product.create({
    data: {
      name: 'Heavy Duty Shipping Box',
      sku: 'BOX-HD-L',
      quantity: 0,
      costPrice: 2.1,
      sellingPrice: 4.5,
      minStockLevel: 100,
      unit: 'pcs',
      categoryId: catWarehouse.id,
      supplierId: supGlobex.id,
    },
  });

  const lamp = await prisma.product.create({
    data: {
      name: 'LED Desk Lamp',
      sku: 'LAMP-LED-01',
      quantity: 22,
      costPrice: 19.75,
      sellingPrice: 39.0,
      minStockLevel: 8,
      unit: 'pcs',
      status: 'ACTIVE',
      categoryId: catElectronics.id,
      supplierId: supGlobex.id,
    },
  });

  const purchase = await prisma.purchase.create({
    data: {
      supplierId: supAcme.id,
      status: 'RECEIVED',
      totalAmount: 28.5 * 30,
      reference: 'PO-1001',
      notes: 'Keyboard restock',
      createdById: manager.id,
      items: {
        create: [
          {
            productId: kb.id,
            quantity: 30,
            unitCost: 28.5,
            lineTotal: 28.5 * 30,
          },
        ],
      },
    },
  });

  await prisma.product.update({
    where: { id: kb.id },
    data: { quantity: { increment: 30 } },
  });

  await prisma.stockMovement.create({
    data: {
      productId: kb.id,
      type: 'IN',
      quantity: 30,
      reason: 'Purchase receipt',
      reference: purchase.reference,
      performedById: manager.id,
    },
  });

  const sale = await prisma.sale.create({
    data: {
      customerName: 'Northwind Traders',
      total: 49.99 * 4 + 59.0 * 2,
      reference: 'SO-5001',
      createdById: staff.id,
      items: {
        create: [
          {
            productId: kb.id,
            quantity: 4,
            unitPrice: 49.99,
            lineTotal: 49.99 * 4,
          },
          {
            productId: hub.id,
            quantity: 2,
            unitPrice: 59.0,
            lineTotal: 59.0 * 2,
          },
        ],
      },
    },
  });

  await prisma.product.update({
    where: { id: kb.id },
    data: { quantity: { decrement: 4 } },
  });
  await prisma.product.update({
    where: { id: hub.id },
    data: { quantity: { decrement: 2 } },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: kb.id,
        type: 'OUT',
        quantity: 4,
        reason: 'Sale — Northwind Traders',
        reference: sale.reference,
        performedById: staff.id,
      },
      {
        productId: hub.id,
        type: 'OUT',
        quantity: 2,
        reason: 'Sale — Northwind Traders',
        reference: sale.reference,
        performedById: staff.id,
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      { userId: admin.id, action: 'LOGIN', details: { seed: true } },
      { userId: admin.id, action: 'PRODUCT_CREATE', entity: 'Product', entityId: kb.id },
      { userId: manager.id, action: 'PURCHASE_CREATE', entity: 'Purchase', entityId: purchase.id },
      { userId: staff.id, action: 'SALE_CREATE', entity: 'Sale', entityId: sale.id },
    ],
  });

  console.log('Seed completed.');
  console.log('Demo logins (password: Demo123!):');
  console.log('  admin@stockflow.app');
  console.log('  manager@stockflow.app');
  console.log('  staff@stockflow.app');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
