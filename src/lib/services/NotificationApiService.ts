import { HttpTransport } from '../transport';
import { Logger } from '../logger';

/**
 * Capa de Servicio: Notificaciones y Contacto (Domain Service)
 * --------------------------------------------------------------------------
 */
export class NotificationApiService {
  private static readonly logger = new Logger('NotificationApiService');

  static async sendContactMessage(data: any): Promise<any> {
    this.logger.debug('Enviando mensaje de contacto');
    return HttpTransport.request('/notifications/contact', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}
