import { ProductSchema, type Product, LoginSchema, RegisterSchema, type LoginValues, type RegisterValues, type RegisterPayload } from './schemas';
import type { PaginatedResponse, User, Order, CartItem, OrderStatus, ApiResponse, Meta, Review, ReviewStats, ProductInput } from './types';
import { Logger } from './logger';

/**
 * Capa de Infraestructura: Cliente de Red (API Gateway)
 * --------------------------------------------------------------------------
 * Centraliza la comunicación con el Backend mediante el API de Fetch.
 * Implementa un marco de seguridad para el manejo de sesiones (JWT) y 
 * adaptadores para eludir restricciones de origen cruzado (CORS). (MVC / Lib)
 */

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9003';
  if (baseUrl && !baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
  return baseUrl;
};

export class ApiError extends Error {
  constructor(public message: string, public status: number, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let baseUrl = getBaseUrl();
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    const apiPath = baseUrl.endsWith('/api') ? '' : '/api';
    const url = `${baseUrl}${apiPath}${endpoint}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers as any
    };

    const response = await fetch(url, { ...options, credentials: 'include', headers });
    if (response.status === 204) return {} as T;
    const data = await response.json();

    if (!response.ok) {
      let errorMessage = data.error?.message || data.message || `Error API: ${response.statusText}`;
      if (response.status !== 401) {
        Logger.error(`[API Error] ${endpoint} (${response.status}):`, errorMessage);
      }
      throw new ApiError(errorMessage, response.status, data);
    }
    return data;
  }

  // ─── AUTH ───
  static async login(data: LoginValues) { return this.request<{ success: boolean; token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }); }
  static async register(data: RegisterPayload) { return this.request<{ success: boolean; token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }); }
  static async getProfile(options?: RequestInit) {
    try {
      return await this.request<{ success: boolean; user: User }>('/auth/profile', { cache: 'no-store', ...options });
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 401) return { success: false, user: null };
      throw error;
    }
  }
  static async logout() { return this.request('/auth/logout', { method: 'POST' }); }
  static async updateProfile(data: Partial<User>) { return this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }); }
  static async changePassword(data: any) { return this.request('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }); }

  /**
   * RN - Protocolo de Recuperación: Inicia el flujo de restauración de identidad.
   */
  static async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * RN - Protocolo de Mutación: Actualiza la credencial mediante un token de sesión.
   */
  static async resetPassword(token: string, password: string) {
    return this.request(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  // ─── PRODUCTS ───
  static async getProducts(params?: any, options?: RequestInit): Promise<PaginatedResponse<Product>> {
    const queryString = this.buildQuery(params);
    const response = await this.request<any>(`/products${queryString}`, options);
    const rawProducts = response.data || response.products || (Array.isArray(response) ? response : []);
    const parsedProducts = rawProducts.map((item: any) => {
      try { return ProductSchema.parse(item); } catch (e) { return null; }
    }).filter(Boolean) as Product[];
    return {
      products: parsedProducts,
      meta: response.pagination || response.meta || { total: parsedProducts.length, page: 1, limit: 20, totalPages: 1 }
    };
  }
  static async getProductById(id: string) { return this.request<Product>(`/products/${id}`); }
  static async createProduct(data: ProductInput) { return this.request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }); }
  static async updateProduct(id: string, data: Partial<ProductInput>) { return this.request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  static async deleteProduct(id: string) { return this.request(`/products/${id}`, { method: 'DELETE' }); }
  static async reorderProduct(id: string, newPosition: number) { return this.request(`/products/${id}/reorder`, { method: 'PATCH', body: JSON.stringify({ newPosition }) }); }

  // ─── TAXONOMIES ───
  static async getPlatforms() { return this.request<any>('/platforms'); }
  static async getGenres() { return this.request<any>('/genres'); }

  // ─── CART ───
  static async getCart() { return this.request<{ success: boolean; cart: { items: CartItem[] } }>('/cart'); }
  static async addToCart(productId: string, quantity: number) { return this.request('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }); }
  static async updateCartItem(itemId: string, quantity: number) { return this.request(`/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }); }
  static async removeFromCart(itemId: string) { return this.request(`/cart/items/${itemId}`, { method: 'DELETE' }); }
  static async clearCart() { return this.request('/cart', { method: 'DELETE' }); }

  // ─── WISHLIST ───
  static async getWishlist() { return this.request<any[]>('/wishlist'); }
  static async toggleWishlist(productId: string) { return this.request('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }); }

  // ─── ORDERS & CHECKOUT ───
  static async createOrder(orderData: Partial<Order>) { return this.request('/orders', { method: 'POST', body: JSON.stringify(orderData) }); }
  static async getMyOrders() { return this.request<Order[]>('/orders/my-orders'); }
  static async getOrderById(id: string) { return this.request<Order>(`/orders/${id}`); }
  static async getAllOrders(params?: any) { 
    const qs = this.buildQuery(params);
    return this.request<{ success: boolean; orders: Order[]; total: number; totalPages: number }>(`/orders${qs}`); 
  }
  static async updateOrderStatus(id: string, status: string) { return this.request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); }

  // ─── REVIEWS ───
  static async getProductReviews(productId: string) { return this.request<{ reviews: Review[]; stats: ReviewStats }>(`/reviews/product/${productId}`); }
  static async createReview(productId: string, data: { rating: number; comment: string }) { return this.request(`/reviews/product/${productId}`, { method: 'POST', body: JSON.stringify(data) }); }

  // ─── UTILS & ASSETS ───
  static async uploadImage(file: File): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxlbwdqop';
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '4fun_preset';
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Fallo en la nube de imágenes (Cloudinary)");
    const data = await res.json();
    return data.secure_url;
  }

  private static buildQuery(params?: Record<string, any>): string {
    if (!params) return "";
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && value !== "all") query.append(key, value.toString());
    });
    const qs = query.toString();
    return qs ? `?${qs}` : "";
  }
}
