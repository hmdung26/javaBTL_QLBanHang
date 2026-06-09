export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_STAFF';

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
  imageUrls: string[];
  warrantyPeriod: string | null;
  createdAt: string;
  categoryId: number | null;
  categoryName: string | null;
  brandId: number | null;
  brandName: string | null;
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
  imageUrls: string[];
  warrantyPeriod: string;
  categoryId: number | null;
  brandId: number | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  parentId: number | null;
  parentName: string | null;
}

export interface CategoryRequest {
  name: string;
  description: string;
  parentId: number | null;
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
  promotionCode: string;
  paymentMethod: PaymentMethod;
  transactionCode: string;
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
  subTotal: number;
  discountAmount: number;
  promotionCode: string | null;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus | null;
  transactionCode: string | null;
  invoiceNumber: string | null;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  items: OrderItemResponse[];
}

export type OrderStatus = OrderResponse['status'];
export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'E_WALLET';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

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

export interface Brand {
  id: number;
  name: string;
  logoUrl: string | null;
  description: string | null;
  createdAt: string;
}

export interface BrandRequest {
  name: string;
  logoUrl: string;
  description: string;
}

export type DiscountType = 'PERCENT' | 'FIXED';

export interface Promotion {
  id: number;
  code: string;
  name: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  startAt: string;
  endAt: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

export type PromotionRequest = Omit<Promotion, 'id' | 'usedCount'>;

export type WarehouseStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'DAMAGED' | 'WARRANTY';

export interface WarehouseItem {
  id: number;
  productId: number;
  productName: string;
  barcode: string;
  serialNumber: string;
  shelfLocation: string;
  status: WarehouseStatus;
  reservedOrderId: number | null;
  lastUpdated: string;
}

export interface WarehouseItemRequest {
  productId: number;
  barcode: string;
  serialNumber: string;
  shelfLocation: string;
  status: WarehouseStatus;
}

export type WarrantyStatus =
  | 'ACTIVE'
  | 'REQUESTED'
  | 'INSPECTING'
  | 'REPAIRING'
  | 'REPLACED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'EXPIRED';

export interface WarrantyHistory {
  status: WarrantyStatus;
  note: string | null;
  createdAt: string;
}

export interface Warranty {
  id: number;
  serialNumber: string;
  productName: string | null;
  username: string | null;
  startDate: string;
  endDate: string;
  status: WarrantyStatus;
  note: string | null;
  history: WarrantyHistory[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminUserRequest {
  username: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  role: UserRole;
}

export interface AdminUserUpdateRequest {
  password: string;
  fullName: string;
  phone: string;
  address: string;
  role: UserRole;
}
