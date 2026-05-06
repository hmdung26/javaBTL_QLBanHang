import api from './api';
import type { AdminUser, DashboardStats, MonthlyRevenue } from '../types';

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
