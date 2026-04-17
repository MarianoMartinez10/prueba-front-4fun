"use client";

/**
 * Capa de Presentación: Cabecera Global de Navegación (Header)
 * --------------------------------------------------------------------------
 * Componente Presentacional Puro. Toda lógica delegada a ViewModel.
 * Responsabilidades: Rendering exclusivamente. Sin efectos, sin contextos.
 * (MVC - View)
 */

import Link from "next/link";
import Image from "next/image";
import { Heart, Search, ShoppingCart, User, LogOut, Settings, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchDialog } from "@/components/search-dialog";
import { useHeaderViewModel } from "@/hooks/use-header-view-model";

/**
 * ATÓMICO: NavLink con micro-interacción
 */
function NavLink({
  href,
  label,
  show = true,
}: {
  href: string;
  label: string;
  show?: boolean;
}) {
  if (!show) return null;

  return (
    <Link
      href={href}
      className={`relative text-sm font-bold uppercase tracking-widest py-2 group flex items-center gap-2 transition-colors ${
        (label === "PANEL ADMIN" || label === "VENTAS")
          ? "text-primary"
          : "text-white/70 hover:text-white"
      }`}
    >
      {label === "PANEL ADMIN" && (
        <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-700" />
      )}
      {label === "VENTAS" && (
        <Store className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
      )}
      {label}
      <span
        className={`absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300 ${
          (label === "PANEL ADMIN" || label === "VENTAS")
            ? "w-full bg-primary/30 group-hover:bg-primary shadow-glow-primary"
            : "w-0 bg-primary group-hover:w-full"
        }`}
      />
    </Link>
  );
}

/**
 * ATÓMICO: Perfil Dropdown con Avatar
 */
function ProfileDropdown({
  userName,
  userInitials,
  userAvatar,
  userRoleDisplay,
  profileHref,
  adminLink,
  isAdmin,
  onLogout,
}: {
  userName: string;
  userInitials: string;
  userAvatar: string | null;
  userRoleDisplay: string;
  profileHref: string;
  adminLink: string;
  isAdmin: boolean;
  onLogout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-14 w-14 flex-shrink-0 flex items-center justify-center p-0 rounded-full text-white/70 hover:text-white hover:bg-white/5 ring-1 ring-white/5 hover:ring-white/20 transition-all group overflow-hidden"
        >
          {userAvatar ? (
            <div className="relative h-14 w-14 rounded-full overflow-hidden">
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className="object-cover group-hover:scale-110 transition-transform"
              />
            </div>
          ) : (
            <User className="h-7 w-7 group-hover:scale-110 transition-transform" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-background backdrop-blur-2xl border-border rounded-2xl shadow-2xl p-2"
      >
        <DropdownMenuLabel className="font-semibold px-5 pt-6 pb-3">
          <p className="text-white text-lg truncate font-headline italic tracking-tighter">{userName}</p>
          <span className="block text-[9px] text-primary uppercase font-black tracking-[0.2em] mt-1 opacity-90">
            {userRoleDisplay}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5 my-2" />
        <DropdownMenuItem asChild>
          <Link
            href={profileHref}
            className="cursor-pointer hover:bg-white/5 hover:text-white text-muted-foreground focus:bg-white/5 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-colors py-3 px-5"
          >
            Mi Perfil
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link
              href={adminLink}
              className="cursor-pointer hover:bg-primary/10 hover:text-primary text-primary/70 focus:bg-primary/10 focus:text-primary font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-colors py-3 px-5 mt-1 border border-primary/10"
            >
              Administración
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-white/5 my-2" />
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer hover:bg-destructive/10 text-destructive/70 hover:text-destructive focus:bg-destructive/10 focus:text-destructive font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-colors py-3 px-5"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * MAIN COMPONENT: Header Presentacional Puro
 */
export function Header() {
  const vm = useHeaderViewModel();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

      <div className="container relative z-10 mx-auto flex h-20 md:h-24 max-w-screen-2xl items-center px-4 md:px-8">
        {/* LOGO */}
        <Link href={vm.logo.href} className="flex items-center mr-8 group">
          <div className="relative h-14 w-14 md:h-20 md:w-20 transition-transform duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">
            <Image
              src="/logo.png"
              alt="4Fun Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* NAVEGACIÓN */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold uppercase tracking-widest flex-1">
          <NavLink href="/productos" label="PRODUCTOS" />
          <NavLink href="/contacto" label="AYUDA" />
          <NavLink
            href={vm.navigation.adminHref}
            label="PANEL ADMIN"
            show={vm.navigation.showAdmin}
          />
          <NavLink
            href={vm.navigation.sellerHref}
            label="VENTAS"
            show={vm.navigation.showSeller}
          />
        </nav>

        {/* CONTROLES DE ACCIÓN */}
        <div className="flex items-center gap-8 lg:gap-10 ml-auto lg:mr-0 mr-12">
          {/* BÚSQUEDA DESKTOP */}
          <SearchDialog
            trigger={
              <Button
                variant="outline"
                className="hidden lg:flex w-[280px] xl:w-[320px] justify-between text-muted-foreground relative h-12 px-5 bg-black/20 border-white/5 hover:bg-white/5 shadow-inner transition-all hover:border-white/10 group rounded-full mr-2"
              >
                <span className="inline-flex items-center text-sm uppercase tracking-tighter text-white/60 group-hover:text-white transition-colors">
                  <Search className="mr-3 h-5 w-5 lg:h-6 lg:w-6 text-primary group-hover:scale-110 transition-transform" />
                  {vm.search.placeholder}
                </span>
                <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded bg-white/10 px-2 font-mono text-xs font-black text-white/80">
                  {vm.search.shortcut}
                </kbd>
              </Button>
            }
          />

          {/* BÚSQUEDA MÓVIL */}
          <SearchDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white/70 hover:text-primary hover:bg-primary/10 rounded-full transition-colors h-14 w-14 flex-shrink-0 flex items-center justify-center"
              >
                <Search className="h-7 w-7" />
              </Button>
            }
          />

          {/* FAVORITOS */}
          {vm.wishlist.show && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-14 w-14 flex-shrink-0 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-all group"
            >
              <Link href={vm.wishlist.href} aria-label="Favoritos">
                <Heart className="h-7 w-7 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Button>
          )}

          {/* CARRITO */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative h-14 w-14 flex-shrink-0 flex items-center justify-center text-white/70 hover:text-primary hover:bg-primary/5 rounded-full transition-all group"
          >
            <Link href={vm.cart.href} aria-label="Carrito de Compras">
              <ShoppingCart className="h-7 w-7 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform" />
              {vm.cart.showBadge && (
                <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary text-black text-xs font-black flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)] animate-in zoom-in duration-300">
                  {vm.cart.count}
                </span>
              )}
            </Link>
          </Button>

          {/* PERFIL / AUTH */}
          {vm.auth.isLoggedIn ? (
            <ProfileDropdown
              userName={vm.profile.userName}
              userInitials={vm.profile.userInitials}
              userAvatar={vm.profile.userAvatar}
              userRoleDisplay={vm.profile.userRoleDisplay}
              profileHref={vm.profile.profileHref}
              adminLink={vm.profile.adminLink}
              isAdmin={vm.auth.isLoggedIn && vm.navigation.showAdmin}
              onLogout={vm.auth.onLogout}
            />
          ) : (
            <Button
              variant="outline"
              asChild
              className="ml-2 h-10 px-6 rounded-full border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-black font-bold uppercase tracking-widest text-[9px] transition-all duration-300"
            >
              <Link href={vm.auth.loginHref} aria-label="Ingreso de Usuario">
                <User className="mr-2 h-3.5 w-3.5" />
                Ingresar
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}