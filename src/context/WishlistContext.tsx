'use client';

/**
 * Capa de Estado: Lista de Favoritos (Wishlist Context)
 * --------------------------------------------------------------------------
 * Gestiona la intención de compra asíncrona de los usuarios.
 * Mantiene la persistencia de artículos destacados vinculados al perfil.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WishlistApiService } from '@/lib/services/WishlistApiService';
import { useAuth } from '@/hooks/use-auth';
import type { Game } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface WishlistContextType {
  wishlist: Game[];
  toggleWishlist: (game: Game) => Promise<void>;
  isInWishlist: (gameId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Sincronizador Maestro: Recupera los favoritos desde la base de datos remota.
   * RN - Auditoría: Requiere sesión activa para interactuar con la BDD.
   */
  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const items = await WishlistApiService.getAll();
      setWishlist(items.map(i => i.getRawData()));
    } catch (err) {
      console.error("[Wishlist] Error al recuperar favoritos:", err);
    }
  }, [user]);

  /**
   * Efecto de hidratación: Carga los datos cuando el usuario se autentica.
   */
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchWishlist().finally(() => setIsLoading(false));
    } else {
      setWishlist([]);
      setIsLoading(false);
    }
  }, [user, fetchWishlist]);

  /** 
   * RN - Utilidad: Verifica si un producto ya es marcante de interés.
   */
  const isInWishlist = useCallback((id: string) => {
    if (!Array.isArray(wishlist)) return false;
    return wishlist.some(g => g.id === id);
  }, [wishlist]);

  /**
   * RN - Idempotencia (Toggle): Alterna la presencia de un bien en la lista.
   * Implementa interfaz UI Optimista para respuesta inmediata al click.
   * 
   * @param {Game} game - Entidad del juego a procesar.
   */
  const toggleWishlist = useCallback(async (game: Game) => {
    // Protección de Acceso: Solo usuarios registrados pueden persistir favoritos.
    if (!user) {
      toast({ variant: "destructive", title: "Inicia Sesión", description: "Debes estar registrado para guardar favoritos." });
      return;
    }

    const exists = isInWishlist(game.id);

    // RN - Optimización UX: Cambio visual instantáneo antes de la confirmación API.
    setWishlist(prev => exists ? prev.filter(p => p.id !== game.id) : [...prev, game]);

    try {
      await WishlistApiService.toggle(game.id);
    } catch (err) {
      // Manejo de Excepciones: Si la red falla, revertimos al estado real del servidor.
      await fetchWishlist();
      toast({ variant: "destructive", title: "Error de Sincronía", description: "No pudimos actualizar tu lista de deseos." });
    }
  }, [user, toast, isInWishlist, fetchWishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const c = useContext(WishlistContext);
  if (!c) throw new Error('useWishlist debe ser invocado dentro de WishlistProvider');
  return c;
}
