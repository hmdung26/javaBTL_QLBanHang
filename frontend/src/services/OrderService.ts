import api from './api';
import type { OrderRequest, OrderResponse, OrderStatus } from '../types';

export async function createOrder(order: OrderRequest): Promise<OrderResponse> {
  const response = await api.post<OrderResponse>('/orders', order);
  return response.data;
}

export async function fetchOrders(): Promise<OrderResponse[]> {
  const response = await api.get<OrderResponse[]>('/orders');
  return response.data;
}

export async function fetchMyOrders(): Promise<OrderResponse[]> {
  const response = await api.get<OrderResponse[]>('/orders/my');
  return response.data;
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<OrderResponse> {
  const response = await api.patch<OrderResponse>(`/orders/${id}/status`, { status });
  return response.data;
}
