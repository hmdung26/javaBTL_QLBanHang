export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  role: UserRole;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  specifications: string | null;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  warrantyPeriod: string | null;
  createdAt: string;
  categoryId: number | null;
  categoryName: string | null;
  averageRating: number;
  reviewCount: number;
  purchaseCount: number;
}

export interface ProductRequest {
  name: string;
  description: string;
  specifications: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  warrantyPeriod: string;
  categoryId: number | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subTotal: number;
}

export interface OrderResponse {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  items: OrderItemResponse[];
}

export type OrderStatus = OrderResponse['status'];

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface UserProfile {
  id: number;
  username: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  role: UserRole;
}

export interface UserProfileUpdateRequest {
  fullName: string;
  phone: string;
  address: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  totalRevenue: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface BannerRequest {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
  sortOrder: number;
}

export interface AiResponse {
  answer: string;
}

export interface ProductReview {
  id: number;
  rating: number;
  comment: string | null;
  username: string;
  createdAt: string;
}

export interface ProductReviewRequest {
  rating: number;
  comment: string;
}

export interface AdminUserReview {
  id: number;
  productId: number | null;
  productName: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  username: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  role: UserRole;
  orderCount: number;
  reviewCount: number;
  orders: OrderResponse[];
  reviews: AdminUserReview[];
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
  orderCount: number;
}
