"use client";

/**
 * Capa de Presentación: Cabecera Global de Navegación Profesional
 * --------------------------------------------------------------------------
 * Componente Presentacional Puro con Arquitectura MVVM.
 * Diseño limpio, moderno y enfocado en conversión.
 * (MVC - View)
 */

import Link from "next/link";
import Image from "next/image";
import { Heart, Search, ShoppingCart, User, LogOut, Settings, Store, Menu, X, ChevronDown } from "lucide-react";
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
import { useState } from "react";

/**
 * ATÓMICO: NavLink Mejorado con Indicador de Estado
 */
function NavLink({
  href,
  label,
  show = true,
  icon: Icon,
  isActive = false,
}: {
  href: string;
  label: string;
  show?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}) {
  if (!show) return null;

  return (
    <Link
      href={href}
      className={`relative px-1 py-2 text-base font-semibold transition-all duration-300 flex items-center gap-2 group ${
        isActive
          ? "text-primary"
          : "text-gray-400 hover:text-white"
      }`}
    >
      {Icon && (
        <Icon className={`h-5 w-5 transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
      )}
      <span className="relative">
        {label}
        <span
          className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-transparent rounded-full transition-all duration-300 ${
            isActive ? "w-full" : "w-0 group-hover:w-full"
          }`}
        />
      </span>
    </Link>
  );
}

/**
 * ATÓMICO: Avatar con Badge de Estado
 */
function UserAvatar({
  userAvatar,
  userName,
  userInitials,
  isAdmin = false,
}: {
  userAvatar: string | null | undefined;
  userName: string;
  userInitials: string;
  isAdmin?: boolean;
}) {
  return (
    <div className="relative">
      {userAvatar ? (
        <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
          <Image
            src={userAvatar}
            alt={userName}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-lg ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
          {userInitials}
        </div>
      )}
      {isAdmin && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full ring-2 ring-background animate-pulse" />
      )}
    </div>
  );
}

/**
 * ATÓMICO: Dropdown de Perfil Mejorado
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
  userAvatar: string | null | undefined;
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
          className="relative h-14 w-14 p-0 rounded-full hover:bg-white/5 transition-all duration-300"
        >
          <UserAvatar
            userAvatar={userAvatar}
            userName={userName}
            userInitials={userInitials}
            isAdmin={isAdmin}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-0 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-white/5">
          <DropdownMenuLabel className="p-0 font-semibold">
            <p className="text-white text-sm font-bold truncate">{userName}</p>
            <span className="block text-xs text-primary font-semibold uppercase tracking-wider mt-1 opacity-90">
              {userRoleDisplay}
            </span>
          </DropdownMenuLabel>
        </div>

        <div className="p-2 space-y-1">
          <DropdownMenuItem asChild>
            <Link
              href={profileHref}
              className="cursor-pointer hover:bg-white/5 text-gray-300 hover:text-white focus:bg-white/5 text-sm font-medium rounded-lg transition-colors py-2 px-3 flex items-center gap-2"
            >
              <User className="h-5 w-5 text-primary/60" />
              Mi Perfil
            </Link>
          </DropdownMenuItem>

          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link
                href={adminLink}
                className="cursor-pointer hover:bg-primary/10 text-primary/70 hover:text-primary focus:bg-primary/10 font-medium text-sm rounded-lg transition-colors py-2 px-3 flex items-center gap-2 border border-primary/20"
              >
                <Settings className="h-5 w-5" />
                Panel de Admin
              </Link>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator className="bg-white/5 my-0" />

        <div className="p-2">
          <DropdownMenuItem
            onClick={onLogout}
            className="cursor-pointer hover:bg-red-500/10 text-red-400/70 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400 font-medium text-sm rounded-lg transition-colors py-2 px-3 flex items-center gap-2"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * ATÓMICO: Icono con Badge (Carrito/Favoritos)
 */
function IconWithBadge({
  icon: Icon,
  badge,
  href,
  label,
  onClick,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | boolean;
  href?: string;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <div className="relative group">
      <Icon className="h-8 w-8 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
      {badge && typeof badge === "number" && badge > 0 && (
        <span className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white text-[10px] font-bold flex items-center justify-center shadow-lg ring-2 ring-background animate-pulse">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </div>
  );

  return href ? (
    <Link href={href} aria-label={label}>
      <Button
        variant="ghost"
        size="icon"
        className={`h-14 w-14 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 ${className}`}
      >
        {content}
      </Button>
    </Link>
  ) : (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`h-14 w-14 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 ${className}`}
      aria-label={label}
    >
      {content}
    </Button>
  );
}

/**
 * MAIN COMPONENT: Header Profesional
 */
export function Header() {
  const vm = useHeaderViewModel();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60 transition-all duration-300">
      {/* Línea de gradiente decorativa */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between">
          {/* LOGO */}
          <Link href={vm.logo.href} className="group flex items-center flex-shrink-0">
            <div className="relative h-14 w-14 transition-all duration-300 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="4Fun Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* NAVEGACIÓN DESKTOP */}
          <nav className="hidden md:flex md:items-center md:gap-4 flex-1 ml-10">
            <NavLink href="/productos" label="Productos" />
            <NavLink href="/contacto" label="Ayuda" />
            <NavLink
              href={vm.navigation.adminHref}
              label="Panel Admin"
              show={vm.navigation.showAdmin}
              icon={Settings}
            />
            <NavLink
              href={vm.navigation.sellerHref}
              label="Ventas"
              show={vm.navigation.showSeller}
              icon={Store}
            />
          </nav>

          {/* CONTROLES DE ACCIÓN */}
          <div className="flex items-center gap-2 ml-auto">
            {/* BÚSQUEDA DESKTOP */}
            <div className="hidden lg:block">
              <SearchDialog
                trigger={
                  <Button
                    variant="outline"
                    className="w-80 justify-start text-gray-400 relative h-12 px-5 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 shadow-none transition-all rounded-xl group"
                  >
                    <Search className="mr-3 h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                    <span className="text-base">{vm.search.placeholder}</span>
                    <kbd className="pointer-events-none ml-auto inline-flex h-6 select-none items-center gap-1 rounded bg-white/5 px-1.5 font-mono text-xs font-medium text-white/50">
                      {vm.search.shortcut}
                    </kbd>
                  </Button>
                }
              />
            </div>

            {/* BÚSQUEDA MÓVIL */}
            <div className="lg:hidden">
              <SearchDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                }
              />
            </div>

            {/* FAVORITOS */}
            {vm.wishlist.show && (
              <IconWithBadge
                icon={Heart}
                href={vm.wishlist.href}
                label="Favoritos"
              />
            )}

            {/* CARRITO */}
            <IconWithBadge
              icon={ShoppingCart}
              href={vm.cart.href}
              label="Carrito"
              badge={vm.cart.showBadge ? vm.cart.count : undefined}
            />

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
                asChild
                className="ml-2 h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-black font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/20 hidden sm:inline-flex"
              >
                <Link href={vm.auth.loginHref} aria-label="Ingresar">
                  <User className="mr-2 h-5 w-5" />
                  Ingresar
                </Link>
              </Button>
            )}

            {/* MENÚ MÓVIL */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-12 w-12 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* MENÚ MÓVIL EXPANDIDO */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-white/5 py-4 space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <NavLink href="/productos" label="Productos" />
            <NavLink href="/contacto" label="Ayuda" />
            <NavLink
              href={vm.navigation.adminHref}
              label="Panel Admin"
              show={vm.navigation.showAdmin}
              icon={Settings}
            />
            <NavLink
              href={vm.navigation.sellerHref}
              label="Ventas"
              show={vm.navigation.showSeller}
              icon={Store}
            />
            {!vm.auth.isLoggedIn && (
              <Button
                asChild
                className="w-full h-10 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-black font-semibold text-sm mt-4"
              >
                <Link href={vm.auth.loginHref}>
                  <User className="mr-2 h-4 w-4" />
                  Ingresar
                </Link>
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}