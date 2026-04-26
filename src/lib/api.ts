import { ProductSchema, type Product, LoginSchema, RegisterSchema, type LoginValues, type RegisterValues, type RegisterPayload } from './schemas';
import type { PaginatedResponse, User, Order, CartItem, OrderStatus, ApiResponse, Meta, Review, ReviewStats, ProductInput } from './types';
import { Logger } from './logger';

/**
 * Capa de Servicios: Cliente de API
 * --------------------------------------------------------------------------
 * Centraliza la comunicación con el Backend mediante Fetch.
 * Implementa el manejo de sesiones (JWT). (MVC / Lib)
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
  static async changePassword(data: any) { return this.request('/auth/password', { method: 'PUT', body: JSON.stringify(data) }); }
  static async becomeSeller(data: any) { return this.request<{ success: boolean; message: string; user: User }>('/auth/become-seller', { method: 'POST', body: JSON.stringify(data) }); }

  /**
   * RN - Recuperación: Inicia el flujo de recuperación de contraseña.
   */
  static async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * RN - Actualización: Cambia la contraseña mediante un token.
   */
  static async resetPassword(token: string, password: string) {
    return this.request(`/auth/reset-password/${token}`, {
      method: 'PUT',
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
  static async getProductsAdmin(params?: any, options?: RequestInit): Promise<PaginatedResponse<Product>> {
    const queryString = this.buildQuery(params);
    const response = await this.request<any>(`/products/admin${queryString}`, options);
    const rawProducts = response.data || response.products || (Array.isArray(response) ? response : []);
    const parsedProducts = rawProducts.map((item: any) => {
      try { return ProductSchema.parse(item); } catch (e) { return null; }
    }).filter(Boolean) as Product[];
    return {
      products: parsedProducts,
      meta: response.pagination || response.meta || { total: parsedProducts.length, page: 1, limit: 20, totalPages: 1 }
    };
  }
  static async getProductById(id: string): Promise<Product> {
    const response = await this.request<any>(`/products/${id}`);
    return this.extractProductFromEnvelope(response, `/products/${id}`);
  }
  static async getProductForManagement(id: string): Promise<Product> {
    const response = await this.request<any>(`/products/${id}/management`);
    return this.extractProductFromEnvelope(response, `/products/${id}/management`);
  }
  static async getProductByIdAdmin(id: string): Promise<Product> {
    const response = await this.request<any>(`/products/admin/${id}`);
    return this.extractProductFromEnvelope(response, `/products/admin/${id}`);
  }
  static async createProduct(data: ProductInput) { return this.request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }); }
  static async updateProduct(id: string, data: Partial<ProductInput>) { return this.request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  static async deleteProduct(id: string) { return this.request(`/products/${id}`, { method: 'DELETE' }); }
  static async reorderProduct(id: string, newPosition: number) { return this.request(`/products/${id}/reorder`, { method: 'PUT', body: JSON.stringify({ newPosition }) }); }
  
  static async getSellerProducts(params?: any): Promise<PaginatedResponse<Product>> {
    const queryString = this.buildQuery(params);
    const response = await this.request<any>(`/products/seller/me${queryString}`);
    const rawProducts = response.data || response.products || [];
    const parsedProducts = rawProducts.map((item: any) => {
      try { return ProductSchema.parse(item); } catch (e) { return null; }
    }).filter(Boolean) as Product[];
    return {
      products: parsedProducts,
      meta: response.pagination || response.meta || { total: parsedProducts.length, page: 1, limit: 20, totalPages: 1 }
    };
  }

  // ─── TAXONOMIES (CRUD Completo — Pilar 3 TFI) ───
  static async getPlatforms() { 
    const res = await this.request<any>('/platforms'); 
    return res.data || (Array.isArray(res) ? res : []);
  }
  static async getGenres() { 
    const res = await this.request<any>('/genres'); 
    return res.data || (Array.isArray(res) ? res : []);
  }
  static async getPlatformById(id: string) { return this.request<any>(`/platforms/${id}`); }
  static async getGenreById(id: string) { return this.request<any>(`/genres/${id}`); }
  static async createPlatform(data: any) { return this.request<any>('/platforms', { method: 'POST', body: JSON.stringify(data) }); }
  static async createGenre(data: any) { return this.request<any>('/genres', { method: 'POST', body: JSON.stringify(data) }); }
  static async updatePlatform(id: string, data: any) { return this.request<any>(`/platforms/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  static async updateGenre(id: string, data: any) { return this.request<any>(`/genres/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  static async deletePlatform(id: string) { return this.request(`/platforms/${id}`, { method: 'DELETE' }); }
  static async deleteGenre(id: string) { return this.request(`/genres/${id}`, { method: 'DELETE' }); }
  static async deletePlatformsBulk(ids: string[]) { return this.request('/platforms/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }); }
  static async deleteGenresBulk(ids: string[]) { return this.request('/genres/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }); }

  // ─── USERS (CRUD Completo — Pilar 3 y 4 TFI) ───
  static async getUsers(params?: any) {
    const qs = this.buildQuery(params);
    return this.request<{ success: boolean; data: User[]; totalPages: number; total: number }>(`/users${qs}`);
  }
  static async getUserById(id: string) { return this.request<{ success: boolean; data: User }>(`/users/${id}`); }
  static async updateUser(id: string, data: Partial<User>) { return this.request<{ success: boolean; data: User }>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  static async deleteUser(id: string) { return this.request(`/users/${id}`, { method: 'DELETE' }); }

  // ─── DASHBOARD (Pilar 5 — Reportes y BI) ───
  static async getDashboardStats() { 
    const res = await this.request<any>('/dashboard/stats');
    return res.data || res;
  }
  static async getSalesChart() { 
    const res = await this.request<any>('/dashboard/sales-chart');
    return res.data || res;
  }
  static async getTopProducts() { 
    const res = await this.request<any>('/dashboard/top-products');
    return res.data || res;
  }

  // ─── CODIGOS DIGITALES (Gestión de Licencias) ───
  static async getKeysByProduct(productId: string) { return this.request<any>(`/keys/product/${productId}`); }
  static async addKeys(productId: string, keys: string[]) { return this.request<any>('/keys/bulk', { method: 'POST', body: JSON.stringify({ productId, keys }) }); }
  static async deleteKey(keyId: string) { return this.request(`/keys/${keyId}`, { method: 'DELETE' }); }

  // ── CART ──
  static async getCart() { 
    const res = await this.request<any>('/cart'); 
    return res.data || res.cart || res;
  }
  static async addToCart(offerId: string, quantity: number) { return this.request('/cart', { method: 'POST', body: JSON.stringify({ offerId, quantity }) }); }
  static async updateCartItem(itemId: string, quantity: number) { return this.request('/cart', { method: 'PUT', body: JSON.stringify({ itemId, quantity }) }); }
  static async removeFromCart(itemId: string) { return this.request(`/cart/${itemId}`, { method: 'DELETE' }); }
  static async clearCart() { return this.request('/cart', { method: 'DELETE' }); }

  // ── WISHLIST ──
  static async getWishlist() { 
    const res = await this.request<any>('/wishlist'); 
    return res.data || res.wishlist || (Array.isArray(res) ? res : []); 
  }
  static async toggleWishlist(productId: string) { return this.request('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }); }

  // ─── ORDERS & CHECKOUT ───
  static async createOrder(orderData: Partial<Order>) { return this.request('/orders', { method: 'POST', body: JSON.stringify(orderData) }); }
  static async getMyOrders(params?: any) {
    const qs = this.buildQuery(params);
    return this.request<{ success: boolean; orders: Order[]; total: number; totalPages: number; page: number }>(`/orders/my-orders${qs}`);
  }
  static async getOrderById(id: string) { return this.request<Order>(`/orders/${id}`); }
  static async getAllOrders(params?: any) { 
    const qs = this.buildQuery(params);
    return this.request<{ success: boolean; orders: Order[]; total: number; totalPages: number }>(`/orders${qs}`); 
  }
  static async updateOrderStatus(id: string, status: string) { return this.request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
  static async updateOrderToPaid(id: string) { return this.request(`/orders/${id}/pay`, { method: 'PUT' }); }

  // ─── REVIEWS ───
  static async getProductReviews(productId: string, params?: any) {
    const qs = this.buildQuery(params);
    return this.request<{ reviews: Review[]; stats: ReviewStats; pagination?: any }>(`/reviews/product/${productId}${qs}`);
  }
  static async createReview(productId: string, data: { rating: number; comment?: string; title?: string; text?: string }) {
    return this.request(`/reviews/product/${productId}`, { method: 'POST', body: JSON.stringify(data) });
  }
  static async getProductRatingStats(productId: string) { return this.request<{ data: ReviewStats }>(`/reviews/product/${productId}/stats`); }
  static async voteReviewHelpful(reviewId: string) { return this.request<{ data: { helpfulCount: number } }>(`/reviews/${reviewId}/helpful`, { method: 'POST' }); }
  static async deleteReview(reviewId: string) { return this.request(`/reviews/${reviewId}`, { method: 'DELETE' }); }

  // ─── NOTIFICACIONES Y VERIFICACIÓN ───
  static async sendContactMessage(data: { name?: string; firstName?: string; lastName?: string; email: string; message: string }) {
    return this.request('/contact', { method: 'POST', body: JSON.stringify(data) });
  }
  static async verifyEmail(token: string) {
    return this.request<{ success: boolean; message: string }>(`/auth/verify?token=${encodeURIComponent(token)}`);
  }

  static async resendVerification(email: string) {
    return this.request<{ success: boolean; message: string }>('/auth/resend-verification', { 
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // ─── UTILIDADES E IMAGENES ───
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

  /**
   * Mantenibilidad: Unifica la lectura de envelopes heterogéneos (`data`, `product` o payload plano)
   * para blindar la hidratación del detalle frente a variaciones del backend.
   */
  private static extractProductFromEnvelope(response: any, endpoint: string): Product {
    const payload = response?.data ?? response?.product ?? response;
    const parsed = ProductSchema.safeParse(payload);

    if (!parsed.success) {
      Logger.warn(`[API Warning] Contrato ProductSchema no validado en ${endpoint}`, {
        issueCount: parsed.error.issues.length,
      });
      return payload as Product;
    }

    return parsed.data;
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
