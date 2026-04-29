import { HttpTransport } from '@/lib/transport';
import { EntityFactory } from '@/domain/factories/EntityFactory';
import type { UserEntity } from '@/domain/entities/UserEntity';

/**
 * Capa de Servicio: Identidad y Seguridad (Domain Service)
 * --------------------------------------------------------------------------
 * Especialización para el dominio de identidad y RBAC.
 * Retorna instancias de UserEntity con comportamiento de autorización encapsulado.
 *
 * Principio de Responsabilidad Única (SRP):
 *   Solo conoce cómo comunicarse con /api/auth y /api/users.
 */
export class UserApiService {
  /**
   * Obtiene el perfil del usuario autenticado como entidad de dominio.
   *
   * @postcondition Si success === true, user es una instancia válida de UserEntity.
   * @postcondition Si success === false, user es null.
   */
  static async getProfile(): Promise<{ success: boolean; user: UserEntity | null }> {
    try {
      const response = await HttpTransport.getProfile();
      if (!response.success || !response.user) {
        return { success: false, user: null };
      }
      const entity = EntityFactory.createUser(response.user as any);
      return { success: true, user: entity };
    } catch {
      return { success: false, user: null };
    }
  }

  /**
   * Autentica un usuario y retorna su entidad de dominio.
   */
  static async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; user: UserEntity | null; token?: string }> {
    const response = await HttpTransport.login({ email, password });
    if (!response.success || !response.user) {
      return { success: false, user: null };
    }
    return {
      success: true,
      user: EntityFactory.createUser(response.user as any),
      token: response.token,
    };
  }

  /**
   * Registra un nuevo usuario y retorna su entidad de dominio.
   */
  static async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; user: UserEntity | null; token?: string }> {
    const response = await HttpTransport.register({ name, email, password });
    if (!response.success || !response.user) {
      return { success: false, user: null };
    }
    return {
      success: true,
      user: EntityFactory.createUser(response.user as any),
      token: response.token,
    };
  }

  static async logout() {
    return HttpTransport.logout();
  }

  static async updateProfile(data: any) {
    return HttpTransport.updateProfile(data);
  }

  static async getUsers(params?: any) {
    const qs = HttpTransport.buildQuery(params);
    return HttpTransport.request<any>(`/users${qs}`);
  }

  static async getUserById(id: string) {
    return HttpTransport.request<any>(`/users/${id}`);
  }

  static async updateUser(id: string, data: any) {
    return HttpTransport.request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  static async deleteUser(id: string) {
    return HttpTransport.request(`/users/${id}`, { method: 'DELETE' });
  }

  static async approveSeller(id: string) {
    return HttpTransport.request<any>(`/users/${id}/approve`, { method: 'PATCH' });
  }

  // ─── AUTH / IDENTITY ───

  static async resetPassword(data: { token: string; password: string }) {
    return HttpTransport.request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) });
  }
}
