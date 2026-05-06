import api from './api';
import type { ProductReview, ProductReviewRequest } from '../types';

export async function fetchProductReviews(productId: number): Promise<ProductReview[]> {
  const response = await api.get<ProductReview[]>(`/products/${productId}/reviews`);
  return response.data;
}

export async function createProductReview(
  productId: number,
  review: ProductReviewRequest,
): Promise<ProductReview> {
  const response = await api.post<ProductReview>(`/products/${productId}/reviews`, review);
  return response.data;
}

export async function deleteProductReview(productId: number, reviewId: number): Promise<void> {
  await api.delete(`/products/${productId}/reviews/${reviewId}`);
}
