import api from './api';
import type { Banner, BannerRequest } from '../types';

export async function fetchBanners(activeOnly = true): Promise<Banner[]> {
  const response = await api.get<Banner[]>('/banners', { params: { activeOnly } });
  return response.data;
}

export async function createBanner(banner: BannerRequest): Promise<Banner> {
  const response = await api.post<Banner>('/banners', banner);
  return response.data;
}

export async function updateBanner(id: number, banner: BannerRequest): Promise<Banner> {
  const response = await api.put<Banner>(`/banners/${id}`, banner);
  return response.data;
}

export async function deleteBanner(id: number): Promise<void> {
  await api.delete(`/banners/${id}`);
}
