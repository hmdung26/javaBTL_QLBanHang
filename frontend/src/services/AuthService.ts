import api from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile, UserProfileUpdateRequest } from '../types';

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
}

export async function register(credentials: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', credentials);
  return response.data;
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const response = await api.get<UserProfile>('/auth/me');
  return response.data;
}

export async function updateCurrentUser(profile: UserProfileUpdateRequest): Promise<UserProfile> {
  const response = await api.put<UserProfile>('/auth/me', profile);
  return response.data;
}

export function saveAuth(auth: AuthResponse) {
  const guestCart = localStorage.getItem('sales-cart:guest');
  const userCartKey = `sales-cart:${auth.username}`;
  if (guestCart && !localStorage.getItem(userCartKey)) {
    localStorage.setItem(userCartKey, guestCart);
  }
  localStorage.setItem('authToken', auth.token);
  localStorage.setItem('authUser', JSON.stringify(auth));
}

export function getAuth(): AuthResponse | null {
  const rawAuth = localStorage.getItem('authUser');
  return rawAuth ? (JSON.parse(rawAuth) as AuthResponse) : null;
}

export function isAdmin() {
  return getAuth()?.role === 'ROLE_ADMIN';
}

export function isStaff() {
  return getAuth()?.role === 'ROLE_STAFF';
}

export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
}
