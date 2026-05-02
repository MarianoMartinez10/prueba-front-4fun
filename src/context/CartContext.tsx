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
import { CartApiService } from '@/lib/services/CartApiService';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { CartItem } from '@/lib/types';

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolvePlatform = (item: any, product: any): CartItem['platform'] => {
  if (item?.platform && typeof item.platform === 'object') {
    return { name: item.platform.name || 'Distribuido' };
  }
  if (product?.platform && typeof product.platform === 'object') {
    return { name: product.platform.name || 'Distribuido' };
  }
  if (typeof item?.platformName === 'string' && item.platformName.trim()) {
    return { name: item.platformName };
  }
  return { name: 'Distribuido' };
};

const normalizeCartItem = (item: any): CartItem => {
  const product = item?.product ?? null;
  const quantity = Math.max(1, Math.trunc(toFiniteNumber(item?.quantity, 1)));
  const offerId = String(item?.offerId || item?.id || 'unknown-offer');
  const stock = toFiniteNumber(item?.stock ?? product?.stock, 999);
  const id = String(item?.id || `loc-${offerId}`);
  const price = toFiniteNumber(item?.price ?? product?.finalPrice ?? product?.price, 0);
  
  return {
    id,
    offerId,
    name: item?.name || product?.name || 'Producto',
    price,
    quantity,
    stock,
    image: item?.image || product?.imageId || product?.image,
    platform: resolvePlatform(item, product),
    platformName: item?.platformName || product?.platform?.name,
  };
};

const normalizeCartItems = (items: any[]): CartItem[] => items.map(normalizeCartItem);

interface CartContextType {
  cart: CartItem[];
  addToCart: (offerData: any, quantity?: number) => Promise<void>;
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
  const cartTotal = cart.reduce((sum, item) => {
    const price = toFiniteNumber(item.price, 0);
    const quantity = Math.max(1, Math.trunc(toFiniteNumber(item.quantity, 1)));
    return sum + (price * quantity);
  }, 0);
  const cartCount = cart.reduce((sum, item) => {
    const quantity = Math.max(1, Math.trunc(toFiniteNumber(item.quantity, 1)));
    return sum + quantity;
  }, 0);

  /**
   * Sincronizador de la "Fuente de la Verdad" (SSOT).
   * Recupera el estado guardado del carrito desde el servidor.
   */
  const fetchCart = async () => {
    try {
      const cartRes = await CartApiService.getCart();
      // El backend devuelve { success: true, cart: { items: [...] } }
      const items = cartRes?.cart?.items || cartRes?.items || [];
      setCart(normalizeCartItems(items));
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
        try {
          const parsed = JSON.parse(local);
          setCart(normalizeCartItems(Array.isArray(parsed) ? parsed : []));
        } catch {
          setCart([]);
        }
      }
      setIsLoading(false);
    }
  }, [user]);

  /**
   * RN - Adición de Ítems: Maneja la lógica de "Merge" o "Create".
   * 
   * @param {Object} offerData - Contiene offerId, name, price, stock, image, platform.
   * @param {number} quantity - Cantidad deseada.
   */
  const addToCart = useCallback(async (offerData: any, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.trunc(toFiniteNumber(quantity, 1)));

    if (user) {
      try {
        // Ejecución Remota: Registra la intención en la BDD.
        await CartApiService.addToCart(offerData.offerId, safeQuantity);
        await fetchCart(); // Re-sincronización tras mutación
        toast({ title: "Producto Añadido", description: `${offerData.name} sumado a tu pedido.` });
      } catch (e: any) {
        toast({ variant: "destructive", title: "Error", description: e.message || "Fallo de conexión." });
      }
    } else {
      // ✅ VALIDACIÓN ESTRICTA (Arquitectura Senior):
      // Verificamos stock acumulado para evitar sobreventa local.
      const existingItem = cart.find(i => i.offerId === offerData.offerId);
      const totalRequested = (existingItem?.quantity || 0) + safeQuantity;
      const availableStock = toFiniteNumber(offerData.stock, 0);

      if (totalRequested > availableStock) {
        toast({ 
          variant: "destructive", 
          title: "Límite de Stock", 
          description: `No puedes agregar más. Stock total: ${availableStock} unidades.` 
        });
        return;
      }

      // Ejecución Local: Almacena en el navegador para persistir entre recargas.
      setCart(prev => {
        const exist = prev.find(p => p.offerId === offerData.offerId);
        let newCart;
        if (exist) {
          newCart = prev.map(p => p.offerId === offerData.offerId ? { ...p, quantity: p.quantity + safeQuantity } : p);
        } else {
          const newItem = normalizeCartItem({
            id: `loc-${Date.now()}`,
            offerId: offerData.offerId,
            name: offerData.name,
            price: offerData.price,
            quantity: safeQuantity,
            stock: availableStock,
            image: offerData.image || offerData.imageId,
            platform: offerData.platform
          });
          newCart = [...prev, newItem];
        }
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
      toast({ title: "Carrito Actualizado", description: "Ítem guardado localmente." });
    }
  }, [user, toast, cart]);

  /**
   * RN - Gestión de Cantidades (Optimistic UI): Actualiza el estado visual antes
   * de confirmar con el servidor para mejorar la percepción de velocidad.
   */
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    let safeQuantity = Math.max(1, Math.trunc(toFiniteNumber(quantity, 1)));
    
    // ✅ CLÁUSULA DE SALVAGUARDA (Arquitectura Senior):
    // Impide el desborde de unidades basándose en el stock contractual del ítem.
    if (safeQuantity > item.stock) {
      toast({ 
        title: "Stock Insuficiente", 
        description: `Solo disponemos de ${item.stock} unidades de este producto.`,
        variant: "destructive"
      });
      safeQuantity = item.stock;
    }

    const oldCart = [...cart];
    
    // UI Optimista: Aplicamos el cambio inmediato en la interfaz
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: safeQuantity } : i));

    if (user) {
      try {
        await CartApiService.updateItem(itemId, safeQuantity);
      } catch {
        // Rollback: Si falla el servidor, revertimos al estado anterior (Seguridad).
        setCart(oldCart);
      }
    } else {
      setCart(prev => {
        const newCart = prev.map(i => i.id === itemId ? { ...i, quantity: safeQuantity } : i);
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  }, [user, cart, toast]);

  /**
   * Expulsa un ítem del proceso de checkout.
   */
  const removeFromCart = useCallback(async (itemId: string) => {
    const oldCart = [...cart];
    setCart(prev => prev.filter(i => i.id !== itemId));

    if (user) {
      try {
        await CartApiService.removeItem(itemId);
      } catch {
        setCart(oldCart);
      }
    } else {
      setCart(prev => {
        const newCart = prev.filter(i => i.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  }, [user, cart]);

  /**
   * RN - Transaccionalidad: Limpia la sesión de compra tras éxito o cancelación masiva.
   */
  const clearCart = useCallback(async () => {
    setCart([]);
    if (user) {
      try { await CartApiService.clear(); } catch (e) { console.error(e); }
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