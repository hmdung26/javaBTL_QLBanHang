import api from './api';
import type { Product, ProductRequest } from '../types';

interface ProductQuery {
  keyword?: string;
  categoryId?: number;
  brandId?: number;
  inStock?: boolean;
}

export async function fetchProducts(query: ProductQuery = {}): Promise<Product[]> {
  const response = await api.get<Product[]>('/products', { params: query });
  return response.data;
}

export async function fetchProductById(id: number): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
}

export async function fetchTopRatedProducts(limit = 10): Promise<Product[]> {
  const response = await api.get<Product[]>('/products/top-rated', { params: { limit } });
  return response.data;
}

export async function fetchBestSellingProducts(limit = 10): Promise<Product[]> {
  const response = await api.get<Product[]>('/products/best-selling', { params: { limit } });
  return response.data;
}

export async function createProduct(product: ProductRequest): Promise<Product> {
  const response = await api.post<Product>('/products', product);
  return response.data;
}

export async function updateProduct(id: number, product: ProductRequest): Promise<Product> {
  const response = await api.put<Product>(`/products/${id}`, product);
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}
