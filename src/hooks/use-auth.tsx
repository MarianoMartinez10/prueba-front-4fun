'use client';

/**
 * Capa de Lógica Reutilizable: Gestión de Identidad (Auth Hook)
 * --------------------------------------------------------------------------
 * Encapsula la lógica de seguridad y sesión del lado del cliente.
 * Gestiona la persistencia del Token JWT y la biometría del usuario activo.
 *
 * Refactorización POO (Incremental):
 *   Ahora expone `userEntity: UserEntity | null` junto con el POJO `user`
 *   para compatibilidad con código legado. Los nuevos componentes deben
 *   consumir `userEntity` y sus métodos (isAdmin(), isSeller(), etc.).
 *
 * Principio de Ocultamiento (Meyer §7.8):
 *   La lógica RBAC vive en UserEntity, no aquí ni en la UI.
 * (MVC / Hook)
 */

import { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { AuthApiService } from '@/lib/services/AuthApiService';
import { EntityFactory } from '@/domain/factories/EntityFactory';
import { Logger } from '@/lib/logger';
import type { User } from '@/lib/types';
import type { UserEntity } from '@/domain/entities/UserEntity';

interface AuthContextType {
  user: User | null;
  /** Entidad de dominio con comportamiento RBAC encapsulado. Usar para nuevos componentes. */
  userEntity: UserEntity | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userEntity, setUserEntity] = useState<UserEntity | null>(null);
  const [loading, setLoading] = useState(true);

  /** Hidrata tanto el POJO (compatibilidad) como la entidad de dominio (nuevos componentes). */
  const hydrateUser = (rawUser: User | null) => {
    if (!rawUser) {
      setUser(null);
      setUserEntity(null);
      return;
    }
    setUser(rawUser);
    try {
      setUserEntity(EntityFactory.createUser(rawUser as any));
    } catch (e: any) {
      Logger.warn('[Auth] EntityFactory.createUser failed, userEntity set to null', { error: e.message });
      setUserEntity(null);
    }
  };

  /**
   * RN - Verificación de Estado (Hydration): Efecto de arranque.
   * Valida la vigencia de la sesión contra el servidor al cargar la aplicación.
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        Logger.debug("[Auth] Verificando integridad de sesión contra el servidor...");
        const response = await AuthApiService.getProfile();

        if (response.success && response.user) {
          hydrateUser(response.user);
        } else {
          // RN - Limpieza: Si el servidor deniega la sesión, purgamos el almacén local.
          localStorage.removeItem('token');
          hydrateUser(null);
        }
      } catch (error: any) {
        // Manejo de Excepciones: 401 indica token caduco o corrupto.
        if (error?.status === 401) localStorage.removeItem('token');
        hydrateUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  /**
   * Proceso de autenticación.
   * @param {string} email - Identificador.
   * @param {string} password - Credencial.
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await AuthApiService.login({ email, password });
      if (response.success) {
        hydrateUser(response.user);
        // RN - Persistencia Segura: El token se guarda en LocalStorage para
        // inyectarse en los headers de ApiClient automáticamente.
        if (response.token) localStorage.setItem('token', response.token);
        return { success: true };
      }
      return { success: false, message: 'Credenciales inválidas' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  /**
   * Alta de nueva identidad.
   */
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await AuthApiService.register({ name, email, password });
      if (response.success) {
        hydrateUser(response.user);
        if (response.token) localStorage.setItem('token', response.token);
        return { success: true };
      }
      return { success: false, message: 'Fallo en la creación de cuenta.' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  /**
   * RN - Baja de Sesión: Destrucción de identificadores y limpieza de caché.
   */
  const logout = async () => {
    try {
      // Notificamos al servidor para invalidación de Cookies/Backend-Session.
      await AuthApiService.logout();
    } catch (error) {
      console.error("[Auth] Error en cierre remoto:", error);
    } finally {
      // Purga radical del estado local (Seguridad post-logout).
      hydrateUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('cart');
      window.location.href = '/'; // Redirección forzada tras destrucción de estado.
    }
  };

  /**
   * Operación forzada de refresco de datos (Sync).
   */
  const refreshUser = async () => {
    try {
      const response = await AuthApiService.getProfile();
      if (response.success && response.user) hydrateUser(response.user);
      else {
        localStorage.removeItem('token');
        hydrateUser(null);
      }
    } catch (error: any) {
      console.error('[Auth] Error de sincronización de perfil:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userEntity, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook de consumidor de Identidad.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth debe ser invocado dentro de AuthProvider');
  return context;
}