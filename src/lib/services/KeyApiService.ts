import { HttpTransport } from '@/lib/transport';

/**
 * Capa de Dominio: Servicio de Gestión de Licencias (Digital Keys)
 * --------------------------------------------------------------------------
 * Orquesta la auditoría y provisión de claves de activación.
 * Sigue el Principio de Ocultamiento de Meyer al encapsular los endpoints
 * específicos del inventario digital.
 */
export class KeyApiService {
  private static readonly BASE_PATH = '/keys';

  /**
   * RN - Auditoría: Recupera el listado de claves vinculadas a un producto.
   */
  static async getByProduct(productId: string): Promise<{ success: boolean; data: any[] }> {
    const res = await HttpTransport.request<any>(`${this.BASE_PATH}/product/${productId}`);
    return {
      success: true,
      data: res.data || (Array.isArray(res) ? res : [])
    };
  }

  /**
   * RN - Ingesta Masiva: Registra un bloque de licencias en el sistema.
   */
  static async addBulk(productId: string, keys: string[]): Promise<any> {
    return HttpTransport.request<any>(`${this.BASE_PATH}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ productId, keys })
    });
  }

  /**
   * RN - Revocación: Elimina una licencia individual del inventario.
   */
  static async delete(id: string): Promise<any> {
    return HttpTransport.request<any>(`${this.BASE_PATH}/${id}`, {
      method: 'DELETE'
    });
  }
}
