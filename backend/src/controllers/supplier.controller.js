import { asyncHandler } from '../utils/asyncHandler.js';
import * as supplierService from '../services/supplier.service.js';
import { logActivity } from '../services/activityLog.service.js';

export const list = asyncHandler(async (req, res) => {
  const result = await supplierService.listSuppliers(req.query);
  res.json({ success: true, ...result });
});

export const getOne = asyncHandler(async (req, res) => {
  const data = await supplierService.getSupplierById(req.params.id);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const data = await supplierService.createSupplier(req.body);
  await logActivity({
    userId: req.user.id,
    action: 'SUPPLIER_CREATE',
    entity: 'Supplier',
    entityId: data.id,
  });
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const data = await supplierService.updateSupplier(req.params.id, req.body);
  await logActivity({
    userId: req.user.id,
    action: 'SUPPLIER_UPDATE',
    entity: 'Supplier',
    entityId: data.id,
  });
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  await supplierService.deleteSupplier(req.params.id);
  await logActivity({
    userId: req.user.id,
    action: 'SUPPLIER_DELETE',
    entity: 'Supplier',
    entityId: req.params.id,
  });
  res.json({ success: true, message: 'Fournisseur supprime' });
});
