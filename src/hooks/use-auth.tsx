'use client';

/**
 * Capa de Lógica Reutilizable: Gestión de Identidad (Auth Hook)
 * --------------------------------------------------------------------------
 * Encapsula la lógica de seguridad y sesión del lado del cliente.
 * Gestiona la persistencia del Token JWT y la biometría del usuario activo.
 * (MVC / Hook)
 */

import { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { ApiClient } from '@/lib/api';
import { Logger } from '@/lib/logger';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * RN - Verificación de Estado (Hydration): Efecto de arranque.
   * Valida la vigencia de la sesión contra el servidor al cargar la aplicación.
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        Logger.debug("[Auth] Verificando integridad de sesión contra el servidor...");
        const response = await ApiClient.getProfile();
        
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          // RN - Limpieza: Si el servidor deniega la sesión, purgamos el almacén local.
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error: any) {
        // Manejo de Excepciones: 401 indica token caduco o corrupto.
        if (error?.status === 401) localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  /**
   * Proceso de autenticación.
   * 
   * @param {string} email - Identificador.
   * @param {string} password - Credencial.
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await ApiClient.login({ email, password });
      if (response.success) {
        setUser(response.user);
        
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
      const response = await ApiClient.register({ name, email, password });
      if (response.success) {
        setUser(response.user);
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
      await ApiClient.logout();
    } catch (error) {
      console.error("[Auth] Error en cierre remoto:", error);
    } finally {
      // Purga radical del estado local (Seguridad post-logout).
      setUser(null);
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
      const response = await ApiClient.getProfile();
      if (response.success && response.user) setUser(response.user);
      else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error: any) {
      console.error('[Auth] Error de sincronización de perfil:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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