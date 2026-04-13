"use client";

/**
 * Capa de Infraestructura: Orquestador de Proveedores (App Providers)
 * --------------------------------------------------------------------------
 * Encapsula la jerarquía de contextos globales de la aplicación.
 * Implementa el patrón de Inyección de Dependencias para proveer estado y 
 * lógica reutilizable a través de todo el árbol de componentes. (Infrastructure)
 */

import { ComparatorProvider } from "@/context/ComparatorContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/hooks/use-auth";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    /**
     * RN - Jerarquía de Contexto:
     * 1. AuthProvider: Provee la identidad (Requerido por Wishlist/Cart).
     * 2. CartProvider: Gestión transaccional de la cesta.
     * 3. WishlistProvider: Gestión de intereses del usuario.
     * 4. ComparatorProvider: Lógica de análisis de productos.
     */
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ComparatorProvider>
            {children}
          </ComparatorProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}