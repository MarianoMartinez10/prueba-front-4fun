'use client';

/**
 * Capa de Estado: Gestión de Persistencia de Compra (Cart Context)
 * --------------------------------------------------------------------------
 * Orquesta la lógica de la cesta de compras. Implementa una estrategia de
 * persistencia bajo dos modalidades:
 * 1. Anónima: Utiliza LocalStorage para usuarios sin sesión.
 * 2. Autenticada: Sincroniza en tiempo real con la API del servidor.
 * (MVC / Context)
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { CartItem } from '@/lib/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * RN - Cálculos de Carrito: Derivación de estado para indicadores de UI.
   * Mantenibilidad: Evita la redundancia de datos calculando totales al vuelo.
   */
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  /**
   * Sincronizador de la "Fuente de la Verdad" (SSOT).
   * Recupera el estado guardado del carrito desde el servidor.
   */
  const fetchCart = async () => {
    try {
      const cartRes = await ApiClient.getCart();
      setCart(cartRes.cart?.items || []);
    } catch (err) {
      console.error("[CartContext] Falló la sincronización remota:", err);
    }
  };

  /**
   * RN - Persistencia Híbrida: Efecto de hidratación de estado.
   * Decide si la cesta se lee de la BDD o del almacenamiento local del cliente.
   */
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchCart().finally(() => setIsLoading(false));
    } else {
      const local = localStorage.getItem('cart');
      if (local) {
        try { setCart(JSON.parse(local)); } catch { setCart([]); }
      }
      setIsLoading(false);
    }
  }, [user]);

  /**
   * RN - Adición de Ítems: Maneja la lógica de "Merge" o "Create".
   * 
   * @param {Object} product - Entidad del producto.
   * @param {number} quantity - Cantidad deseada.
   */
  const addToCart = useCallback(async (product: any, quantity = 1) => {
    if (user) {
      try {
        // Ejecución Remota: Registra la intención en la BDD.
        await ApiClient.addToCart(product.id, quantity);
        await fetchCart(); // Re-sincronización tras mutación
        toast({ title: "Producto Añadido", description: `${product.name} sumado a tu pedido.` });
      } catch (e: any) {
        toast({ variant: "destructive", title: "Error", description: e.message || "Fallo de conexión." });
      }
    } else {
      // Ejecución Local: Almacena en el navegador para persistir entre recargas.
      setCart(prev => {
        const exist = prev.find(p => p.productId === product.id);
        let newCart;
        if (exist) {
          newCart = prev.map(p => p.productId === product.id ? { ...p, quantity: p.quantity + quantity } : p);
        } else {
          const newItem = {
            id: `loc-${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.imageId || product.image,
            platform: product.platform
          };
          newCart = [...prev, newItem];
        }
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
      toast({ title: "Carrito Actualizado", description: "Ítem guardado localmente." });
    }
  }, [user, toast]);

  /**
   * RN - Gestión de Cantidades (Optimistic UI): Actualiza el estado visual antes
   * de confirmar con el servidor para mejorar la percepción de velocidad.
   */
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const oldCart = [...cart];
    
    // UI Optimista: Aplicamos el cambio inmediato en la interfaz
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));

    if (user) {
      try {
        await ApiClient.updateCartItem(itemId, quantity);
      } catch {
        // Rollback: Si falla el servidor, revertimos al estado anterior (Seguridad).
        setCart(oldCart);
      }
    } else {
      const newCart = cart.map(i => i.id === itemId ? { ...i, quantity } : i);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  }, [user, cart]);

  /**
   * Expulsa un ítem del proceso de checkout.
   */
  const removeFromCart = useCallback(async (itemId: string) => {
    const oldCart = [...cart];
    setCart(prev => prev.filter(i => i.id !== itemId));

    if (user) {
      try {
        await ApiClient.removeFromCart(itemId);
      } catch {
        setCart(oldCart);
      }
    } else {
      const newCart = cart.filter(i => i.id !== itemId);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  }, [user, cart]);

  /**
   * RN - Transaccionalidad: Limpia la sesión de compra tras éxito o cancelación masiva.
   */
  const clearCart = useCallback(async () => {
    setCart([]);
    if (user) {
      try { await ApiClient.clearCart(); } catch (e) { console.error(e); }
    } else {
      localStorage.removeItem('cart');
    }
  }, [user]);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart debe ser invocado dentro de CartProvider');
  return c;
}