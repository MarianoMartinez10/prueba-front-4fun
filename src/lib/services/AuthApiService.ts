import { HttpTransport } from '../transport';
import { Logger } from '../logger';

/**
 * Capa de Servicio: Autenticación e Identidad (Domain Service)
 * --------------------------------------------------------------------------
 * Meyer OOSC2 §22 — Servicios de Dominio:
 *   Encapsula la lógica de comunicación con el subsistema de seguridad.
 *   Centraliza el registro, login y gestión de perfil.
 */
export class AuthApiService {
  private static readonly logger = new Logger('AuthApiService');

  static async getProfile(): Promise<any> {
    this.logger.debug('Recuperando perfil de usuario');
    return HttpTransport.request('/auth/profile');
  }

  static async login(credentials: any): Promise<any> {
    this.logger.debug(`Iniciando sesión para: ${credentials.email}`);
    return HttpTransport.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  static async register(data: any): Promise<any> {
    this.logger.debug(`Registrando nuevo usuario: ${data.email}`);
    return HttpTransport.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async logout(): Promise<any> {
    this.logger.debug('Cerrando sesión en el servidor');
    return HttpTransport.request('/auth/logout', {
      method: 'POST'
    });
  }

  static async verifyEmail(token: string): Promise<any> {
    this.logger.debug('Verificando correo electrónico');
    return HttpTransport.request(`/auth/verify-email?token=${token}`);
  }

  static async resendVerification(email: string): Promise<any> {
    this.logger.debug(`Reenviando verificación a: ${email}`);
    return HttpTransport.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  static async forgotPassword(email: string): Promise<any> {
    this.logger.debug(`Solicitando recuperación de contraseña para: ${email}`);
    return HttpTransport.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  static async changePassword(data: any): Promise<any> {
    this.logger.debug('Cambiando contraseña de usuario');
    return HttpTransport.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async becomeSeller(data: any): Promise<any> {
    this.logger.debug('Solicitando perfil de vendedor');
    return HttpTransport.request('/auth/become-seller', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async uploadImage(file: File): Promise<string> {
    this.logger.debug('Subiendo imagen de perfil');
    const formData = new FormData();
    formData.append('file', file);
    const res = await HttpTransport.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Dejar que el navegador ponga el Content-Type para FormData
    });
    return res.url;
  }
}
