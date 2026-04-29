import { HttpTransport } from '@/lib/transport';
import { EntityFactory } from '@/domain/factories/EntityFactory';
import type { ProductEntity } from '@/domain/entities/ProductEntity';
import type { Meta, ProductInput } from '@/lib/types';

/**
 * Servicio de API: Dominio de Productos
 * Capa de Servicio: Catálogo de Productos (Domain Service)
 * --------------------------------------------------------------------------
 * Meyer OOSC2 §3 — Principio de Responsabilidad Única (SRP):
 *   Este servicio es la única clase que sabe cómo comunicarse con /api/products.
 *   No contiene lógica de UI, autenticación ni estado de aplicación.
 *
 * Principio de Ocultamiento (Meyer §7.8):
 *   El consumidor (Hook/ViewModel) recibe ProductEntity[], no POJOs.
 *   La deserialización y validación son detalles internos de este servicio.
 */
export class ProductApiService {
  /**
   * Obtiene el catálogo paginado como entidades de dominio.
   *
   * @postcondition Todos los elementos del array son instancias de ProductEntity.
   * @postcondition Ningún elemento es null (los inválidos son filtrados por EntityFactory).
   */
  static async getAll(
    params?: Record<string, any>,
    options?: RequestInit
  ): Promise<{ products: ProductEntity[]; meta: Meta }> {
    const qs = HttpTransport.buildQuery(params);
    const response = await HttpTransport.request<any>(`/products${qs}`, options);
    const products = response.data || response.products || (Array.isArray(response) ? response : []);
    
    return {
      products: EntityFactory.createProducts(products as any[]),
      meta: response.pagination || response.meta || { total: products.length, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * Obtiene los productos del panel de administración.
   */
  static async getAllAdmin(
    params?: Record<string, any>
  ): Promise<{ products: ProductEntity[]; meta: Meta }> {
    const qs = HttpTransport.buildQuery(params);
    const response = await HttpTransport.request<any>(`/products/admin${qs}`);
    const products = response.data || response.products || (Array.isArray(response) ? response : []);

    return {
      products: EntityFactory.createProducts(products as any[]),
      meta: response.pagination || response.meta || { total: products.length, page: 1, limit: 20, totalPages: 1 },
    };
  }

  /**
   * Obtiene un producto por ID como entidad de dominio.
   *
   * @returns ProductEntity si el producto existe, null si no se encontró o falló la validación.
   */
  static async getById(id: string): Promise<ProductEntity | null> {
    try {
      const response = await HttpTransport.request<any>(`/products/${id}`);
      const raw = response?.data ?? response?.product ?? response;
      return EntityFactory.createProduct(raw as any);
    } catch {
      return null;
    }
  }

  /**
   * Obtiene un producto para edición (endpoint de management).
   */
  static async getForManagement(id: string): Promise<ProductEntity | null> {
    try {
      const response = await HttpTransport.request<any>(`/products/${id}/management`);
      const raw = response?.data ?? response?.product ?? response;
      return EntityFactory.createProduct(raw as any);
    } catch {
      return null;
    }
  }

  /**
   * Obtiene los productos del vendedor autenticado.
   */
  static async getSellerProducts(
    params?: Record<string, any>
  ): Promise<{ products: ProductEntity[]; meta: Meta }> {
    const qs = HttpTransport.buildQuery(params);
    const response = await HttpTransport.request<any>(`/products/seller/me${qs}`);
    const products = response.data || response.products || [];

    return {
      products: EntityFactory.createProducts(products as any[]),
      meta: response.pagination || response.meta || { total: products.length, page: 1, limit: 20, totalPages: 1 },
    };
  }

  // ─── Mutaciones ───

  static async create(data: ProductInput) {
    // Normalización defensiva (Design by Contract): Enums en SCREAMING_CASE
    if (data.specPreset) data.specPreset = data.specPreset.toUpperCase();
    return HttpTransport.request<any>('/products', { method: 'POST', body: JSON.stringify(data) });
  }

  static async update(id: string, data: Partial<ProductInput>) {
    // Normalización defensiva (Design by Contract)
    if (data.specPreset) data.specPreset = data.specPreset.toUpperCase();
    return HttpTransport.request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  static async delete(id: string) {
    return HttpTransport.request(`/products/${id}`, { method: 'DELETE' });
  }

  static async uploadImage(file: File): Promise<string> {
    return HttpTransport.uploadImage(file);
  }
}
