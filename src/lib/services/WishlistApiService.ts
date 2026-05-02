import { HttpTransport } from '@/lib/transport';
import { EntityFactory } from '@/domain/factories/EntityFactory';
import type { ProductEntity } from '@/domain/entities/ProductEntity';

/**
 * Capa de Dominio: Servicio de Lista de Deseos (Wishlist)
 * --------------------------------------------------------------------------
 * Orquesta la persistencia y recuperación de los intereses del usuario.
 * Sigue el Principio de Autonomía de Meyer (OOSC2) encapsulando el transporte.
 */
export class WishlistApiService {
  private static readonly ENDPOINT = '/wishlist';

  /**
   * RN - Recuperación: Obtiene la colección de productos favoritos del usuario.
   */
  static async getAll(): Promise<ProductEntity[]> {
    const res = await HttpTransport.request<any>(this.ENDPOINT);
    const data = res.data || res.wishlist || res.products || (Array.isArray(res) ? res : []);
    return EntityFactory.createProducts(data as any[]);
  }

  /**
   * RN - Alternancia: Agrega o remueve un producto de la lista.
   */
  static async toggle(productId: string): Promise<any> {
    return HttpTransport.request<any>(`${this.ENDPOINT}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  }
}
