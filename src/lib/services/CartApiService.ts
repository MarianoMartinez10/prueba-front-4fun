import { HttpTransport } from '../transport';
import { Logger } from '../logger';

/**
 * Capa de Servicio: Carrito de Compras (Domain Service)
 * --------------------------------------------------------------------------
 * Meyer OOSC2 §22 — Servicios de Dominio:
 *   Encapsula la lógica de comunicación con el subsistema de persistencia 
 *   del carrito. Centraliza las mutaciones de la cesta.
 */
export class CartApiService {
  private static readonly logger = new Logger('CartApiService');

  static async getCart(): Promise<any> {
    this.logger.debug('Sincronizando carrito con el servidor');
    return HttpTransport.request('/cart');
  }

  static async addToCart(productId: string, quantity: number): Promise<any> {
    this.logger.debug(`Añadiendo producto ${productId} al carrito (Cant: ${quantity})`);
    return HttpTransport.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  }

  static async updateItem(itemId: string, quantity: number): Promise<any> {
    this.logger.debug(`Actualizando item ${itemId} (Cant: ${quantity})`);
    return HttpTransport.request(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  static async removeItem(itemId: string): Promise<any> {
    this.logger.debug(`Removiendo item ${itemId} del carrito`);
    return HttpTransport.request(`/cart/${itemId}`, {
      method: 'DELETE'
    });
  }

  static async clear(): Promise<any> {
    this.logger.debug('Vaciando carrito');
    return HttpTransport.request('/cart', {
      method: 'DELETE'
    });
  }
}
