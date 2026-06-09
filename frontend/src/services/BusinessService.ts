import api from './api';
import type {
  Brand,
  BrandRequest,
  Notification,
  PaymentStatus,
  Promotion,
  PromotionRequest,
  WarehouseItem,
  WarehouseItemRequest,
  Warranty,
  WarrantyStatus,
} from '../types';

export async function fetchBrands(): Promise<Brand[]> {
  return (await api.get<Brand[]>('/brands')).data;
}

export async function createBrand(request: BrandRequest): Promise<Brand> {
  return (await api.post<Brand>('/brands', request)).data;
}

export async function updateBrand(id: number, request: BrandRequest): Promise<Brand> {
  return (await api.put<Brand>(`/brands/${id}`, request)).data;
}

export async function deleteBrand(id: number): Promise<void> {
  await api.delete(`/brands/${id}`);
}

export async function fetchPromotions(): Promise<Promotion[]> {
  return (await api.get<Promotion[]>('/promotions')).data;
}

export async function createPromotion(request: PromotionRequest): Promise<Promotion> {
  return (await api.post<Promotion>('/promotions', request)).data;
}

export async function updatePromotion(id: number, request: PromotionRequest): Promise<Promotion> {
  return (await api.put<Promotion>(`/promotions/${id}`, request)).data;
}

export async function deletePromotion(id: number): Promise<void> {
  await api.delete(`/promotions/${id}`);
}

export async function fetchWarehouseItems(): Promise<WarehouseItem[]> {
  return (await api.get<WarehouseItem[]>('/warehouse')).data;
}

export async function createWarehouseItem(request: WarehouseItemRequest): Promise<WarehouseItem> {
  return (await api.post<WarehouseItem>('/warehouse', request)).data;
}

export async function updateWarehouseItem(
  id: number,
  request: WarehouseItemRequest,
): Promise<WarehouseItem> {
  return (await api.put<WarehouseItem>(`/warehouse/${id}`, request)).data;
}

export async function deleteWarehouseItem(id: number): Promise<void> {
  await api.delete(`/warehouse/${id}`);
}

export async function updatePayment(
  orderId: number,
  status: PaymentStatus,
  transactionCode: string,
): Promise<void> {
  await api.patch(`/payments/orders/${orderId}`, { status, transactionCode });
}

export async function fetchWarranties(): Promise<Warranty[]> {
  return (await api.get<Warranty[]>('/warranties')).data;
}

export async function lookupWarranty(serialNumber: string): Promise<Warranty> {
  return (await api.get<Warranty>('/warranties/lookup', { params: { serialNumber } })).data;
}

export async function requestWarranty(serialNumber: string, note: string): Promise<Warranty> {
  return (await api.post<Warranty>('/warranties/requests', { serialNumber, note })).data;
}

export async function updateWarranty(
  id: number,
  status: WarrantyStatus,
  note: string,
  replacementSerialNumber = '',
): Promise<Warranty> {
  return (await api.patch<Warranty>(`/warranties/${id}`, {
    status,
    note,
    replacementSerialNumber,
  })).data;
}

export async function fetchNotifications(): Promise<Notification[]> {
  return (await api.get<Notification[]>('/notifications')).data;
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}
