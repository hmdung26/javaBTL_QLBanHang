import api from './api';
import type {
  AdminUser,
  AdminUserRequest,
  AdminUserUpdateRequest,
  DashboardStats,
  MonthlyRevenue,
} from '../types';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>('/admin/dashboard');
  return response.data;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get<AdminUser[]>('/admin/users');
  return response.data;
}

export async function fetchMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const response = await api.get<MonthlyRevenue[]>('/admin/reports/monthly-revenue');
  return response.data;
}

export async function createAdminUser(request: AdminUserRequest): Promise<AdminUser> {
  return (await api.post<AdminUser>('/admin/users', request)).data;
}

export async function updateAdminUser(
  id: number,
  request: AdminUserUpdateRequest,
): Promise<AdminUser> {
  return (await api.put<AdminUser>(`/admin/users/${id}`, request)).data;
}

export async function deleteAdminUser(id: number): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}
