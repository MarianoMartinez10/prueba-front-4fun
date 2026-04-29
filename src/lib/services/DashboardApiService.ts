import { HttpTransport } from '../transport';
import { Logger } from '../logger';

/**
 * Capa de Servicio: Dashboard y Estadísticas (Domain Service)
 * --------------------------------------------------------------------------
 */
export class DashboardApiService {
  private static readonly logger = new Logger('DashboardApiService');

  static async getStats(): Promise<any> {
    this.logger.debug('Recuperando estadísticas de dashboard');
    return HttpTransport.request('/dashboard/stats');
  }

  static async getSalesChart(): Promise<any> {
    this.logger.debug('Recuperando datos de ventas para gráfico');
    return HttpTransport.request('/dashboard/sales-chart');
  }

  static async getTopProducts(): Promise<any> {
    this.logger.debug('Recuperando productos más vendidos');
    return HttpTransport.request('/dashboard/top-products');
  }
}
