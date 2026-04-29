import { HttpTransport } from '../transport';
import { Logger } from '../logger';

/**
 * Capa de Servicio: Taxonomías (Domain Service)
 * --------------------------------------------------------------------------
 * Meyer OOSC2 §22 — Servicios de Dominio:
 *   Gestiona las categorías y plataformas del sistema.
 */
export class TaxonomyApiService {
  private static readonly logger = new Logger('TaxonomyApiService');

  static async getPlatforms(): Promise<any> {
    this.logger.debug('Obteniendo listado de plataformas');
    return HttpTransport.request('/platforms');
  }

  static async getGenres(): Promise<any> {
    this.logger.debug('Obteniendo listado de géneros');
    return HttpTransport.request('/genres');
  }

  static async getPlatformById(id: string): Promise<any> {
    return HttpTransport.request(`/platforms/${id}`);
  }

  static async getGenreById(id: string): Promise<any> {
    return HttpTransport.request(`/genres/${id}`);
  }

  static async createPlatform(data: any): Promise<any> {
    return HttpTransport.request('/platforms', { method: 'POST', body: JSON.stringify(data) });
  }

  static async createGenre(data: any): Promise<any> {
    return HttpTransport.request('/genres', { method: 'POST', body: JSON.stringify(data) });
  }

  static async updatePlatform(id: string, data: any): Promise<any> {
    return HttpTransport.request(`/platforms/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  static async updateGenre(id: string, data: any): Promise<any> {
    return HttpTransport.request(`/genres/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  static async deletePlatform(id: string): Promise<any> {
    return HttpTransport.request(`/platforms/${id}`, { method: 'DELETE' });
  }

  static async deleteGenre(id: string): Promise<any> {
    return HttpTransport.request(`/genres/${id}`, { method: 'DELETE' });
  }

  static async deletePlatformsBulk(ids: string[]): Promise<any> {
    return HttpTransport.request('/platforms/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) });
  }

  static async deleteGenresBulk(ids: string[]): Promise<any> {
    return HttpTransport.request('/genres/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) });
  }
}
