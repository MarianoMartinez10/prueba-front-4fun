import { Logger } from './logger';
import { type LoginValues, type RegisterPayload } from './schemas';

/**
 * Capa de Infraestructura: Transporte HTTP (Meyer §3 — Autonomía)
 * --------------------------------------------------------------------------
 * Esta clase es el ÚNICO punto de contacto con el protocolo HTTP.
 * No contiene lógica de negocio ni conocimiento de entidades.
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

export class HttpTransport {
  public static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let baseUrl = getBaseUrl();
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    const apiPath = baseUrl.endsWith('/api') ? '' : '/api';
    const url = `${baseUrl}${apiPath}${endpoint}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers as any
    };

    const response = await fetch(url, { ...options, credentials: 'include', headers });
    if (response.status === 204) return {} as T;
    
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      throw new ApiError('Error de Conexión', response.status, { message: 'El servidor no respondió correctamente.' });
    }

    if (!response.ok) {
      const errorTitle = data.error || 'Error del Sistema';
      const errorMessage = data.message || 'Ocurrió un error inesperado.';
      
      if (response.status !== 401) {
        Logger.error(`[API Error] ${endpoint} (${response.status}):`, errorMessage);
      }
      
      throw new ApiError(errorMessage, response.status, { title: errorTitle, ...data });
    }
    return data;
  }

  public static buildQuery(params?: Record<string, any>): string {
    if (!params) return "";
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && value !== "all") query.append(key, value.toString());
    });
    const qs = query.toString();
    return qs ? `?${qs}` : "";
  }

  public static async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    
    const res = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.secure_url;
  }

  public static async login(data: LoginValues): Promise<any> {
    const res = await this.request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
    if (res.success && res.token) localStorage.setItem('token', res.token);
    return res;
  }
  public static async register(data: RegisterPayload): Promise<any> {
    const res = await this.request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    if (res.success && res.token) localStorage.setItem('token', res.token);
    return res;
  }
  public static async getProfile(): Promise<any> { return this.request('/auth/profile'); }
  public static async logout(): Promise<any> {
    localStorage.removeItem('token');
    return { success: true, data: null };
  }
  public static async updateProfile(data: any): Promise<any> { return this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }); }
}
