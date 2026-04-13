"use client";

/**
 * Capa de Interfaz: Cabecera Global de Navegación (Header)
 * --------------------------------------------------------------------------
 * Orquesta la navegación principal y el acceso a funciones críticas del sistema.
 * Implementa el control de acceso basado en roles (RBAC) para el panel 
 * de administración, integra el buscador avanzado y sincroniza los contadores. (MVC / View-Global)
 */

import Link from "next/link";
import Image from "next/image";
import { Heart, Search, ShoppingCart, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchDialog } from "@/components/search-dialog";

export function Header() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 md:h-20 max-w-screen-2xl items-center px-4">
        
        {/* Logo: Ancla a la página de inicio. */}
        <Link href="/" className="flex items-center mr-6 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="4Fun Logo" width={80} height={80} className="h-14 w-14 md:h-20 md:w-20 object-contain" priority />
        </Link>

        {/* Navegación Estratégica: Enlaces de primer nivel. */}
        <nav className="hidden md:flex items-center space-x-8 text-sm uppercase tracking-widest flex-1">
          <Link href="/productos" className="transition-colors hover:text-primary text-white">
            Productos
          </Link>
          <Link href="/contacto" className="transition-colors hover:text-primary text-white">
            Ayuda
          </Link>

          {/* RN - Control de Acceso: Acceso a gestión reservado para administradores. */}
          {user && user.role === 'admin' && (
            <Link href="/admin" className="transition-colors text-primary font-semibold flex items-center gap-1.5 animate-pulse">
              <Settings className="h-4 w-4" />
              PANEL ADMIN
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-5 ml-auto">
          
          {/* RN - Búsqueda Avanzada: Gatillo de motor de búsqueda indexada. */}
          <SearchDialog
            trigger={
              <Button variant="outline" className="hidden lg:flex w-[240px] xl:w-[320px] justify-between text-muted-foreground relative h-10 px-4 bg-muted/20 border-white/10 hover:bg-white/5">
                <span className="inline-flex items-center text-xs uppercase tracking-tighter">
                  <Search className="mr-3 h-4 w-4 text-primary" />
                  Buscar productos...
                </span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-black/40 px-2 font-mono text-[10px] text-white">
                  ⌘ K
                </kbd>
              </Button>
            }
          />
          {/* Trigger Móvil */}
          <SearchDialog
            trigger={
              <Button variant="ghost" size="icon" className="lg:hidden text-white">
                <Search className="h-5 w-5" />
              </Button>
            }
          />

          {/* RN - Persistencia de Interés: Lista de Deseos (Solo Autenticados). */}
          {user && (
            <Button variant="ghost" size="icon" asChild className="text-white hover:text-destructive hover:bg-destructive/10">
              <Link href="/wishlist" aria-label="Favoritos">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {/* RN - Logística Transaccional: Acceso permanente al resumen de cesta. */}
          <Button variant="ghost" size="icon" asChild className="relative text-white hover:text-primary hover:bg-primary/10">
            <Link href="/cart" aria-label="Carrito de Compras">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-black text-[10px] font-semibold flex items-center justify-center shadow-lg animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Layer - Gestión de Identidad (Perfil de Usuario) */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  {user.avatar ? (
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs font-semibold bg-primary text-black">{(user.name || 'U')[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-white/10">
                <DropdownMenuLabel className="font-semibold text-white">
                  <p className="truncate">{user.name || user.email}</p>
                  <span className="block text-[10px] text-primary uppercase font-semibold tracking-widest mt-0.5">
                    Cuenta {user.role}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 hover:text-primary font-medium text-xs uppercase">
                  <Link href="/account">Mi Perfil</Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 hover:text-primary font-medium text-xs uppercase">
                    <Link href="/admin/products">Gestionar Productos</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={logout} className="cursor-pointer hover:bg-destructive/10 text-destructive font-medium text-xs uppercase">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild className="text-white hover:text-primary hover:bg-primary/10">
              <Link href="/login" aria-label="Ingreso de Usuario">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}