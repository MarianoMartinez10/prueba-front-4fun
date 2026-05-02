import { HttpTransport } from '@/lib/transport';
import { EntityFactory } from '@/domain/factories/EntityFactory';
import type { OrderEntity } from '@/domain/entities/OrderEntity';

/**
 * Servicio de API: Dominio de Órdenes
 * --------------------------------------------------------------------------
 * Especialización del ApiClient para el dominio transaccional.
 * Retorna instancias de OrderEntity con comportamiento de ciclo de vida encapsulado.
 *
 * Principio de Responsabilidad Única (SRP):
 *   Solo conoce cómo comunicarse con /api/orders y /api/transactions.
 *   No sabe nada de estado de UI ni de autenticación.
 *
 * Absorbe la responsabilidad de fetch de TransactionViewModel.ts (Capa de Purga).
 */
export class OrderApiService {
  /**
   * Obtiene las órdenes del usuario autenticado como entidades de dominio.
   */
  static async getMyOrders(
    params?: Record<string, any>
  ): Promise<{ orders: OrderEntity[]; total: number; totalPages: number }> {
    const qs = HttpTransport.buildQuery(params);
    const response = await HttpTransport.request<{ success: boolean; orders: any[]; total: number; totalPages: number }>(`/orders/my-orders${qs}`);
    return {
      orders: EntityFactory.createOrders((response.orders ?? []) as any[]),
      total: response.total ?? 0,
      totalPages: response.totalPages ?? 1,
    };
  }

  /**
   * Obtiene TODAS las órdenes del sistema (solo ADMIN).
   */
  static async getAllOrders(
    params?: Record<string, any>
  ): Promise<{ orders: OrderEntity[]; total: number; totalPages: number }> {
    const qs = HttpTransport.buildQuery(params);
    const response = await HttpTransport.request<{ success: boolean; orders: any[]; total: number; totalPages: number }>(`/orders${qs}`);
    return {
      orders: EntityFactory.createOrders((response.orders ?? []) as any[]),
      total: response.total ?? 0,
      totalPages: response.totalPages ?? 1,
    };
  }

  /**
   * Obtiene una orden por ID como entidad de dominio.
   */
  static async getById(id: string): Promise<OrderEntity | null> {
    try {
      const raw = await HttpTransport.request<any>(`/orders/${id}`);
      return EntityFactory.createOrder(raw as any);
    } catch {
      return null;
    }
  }

  // ─── Mutaciones ───

  static async create(orderData: any) {
    return HttpTransport.request('/orders', { method: 'POST', body: JSON.stringify(orderData) });
  }

  static async updateStatus(id: string, status: string): Promise<void> {
    await HttpTransport.request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: status.toUpperCase() }) });
  }

  static async markAsPaid(id: string): Promise<void> {
    await HttpTransport.request(`/orders/${id}/pay`, { method: 'PUT' });
  }
}
