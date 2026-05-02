import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/use-auth";

/**
 * ViewModel: Orquestador de Cabecera Global
 * --------------------------------------------------------------------------
 * Centraliza TODA la lógica de estado, contexto y acciones.
 * Retorna props limpias y estructuradas para componentes presentacionales.
 *
 * Refactorización POO (Meyer OOSC2 §7.8):
 *   Las comprobaciones de rol ahora delegan en UserEntity.isAdmin() /
 *   isSeller(), eliminando comparaciones de string directas.
 * (MVC - Model/ViewModel)
 */
export function useHeaderViewModel() {
  const { cartCount } = useCart();
  const { userEntity, user, logout } = useAuth();

  // ═══════════════════════════════════════════════════════════════════════════
  // DERIVACIONES — Computadas a partir de la Entidad de Dominio
  // La UI ya no compara strings de roles. Delega en el objeto UserEntity.
  // ═══════════════════════════════════════════════════════════════════════════

  const isLoggedIn = !!userEntity;
  // ✅ POO: Llama a método del objeto — no compara strings
  const isAdmin = userEntity?.isAdmin() ?? false;
  const isSeller = userEntity?.isSeller() ?? false;
  const userName = userEntity?.getDisplayName() ?? user?.name ?? user?.email ?? "";
  const userInitials = userEntity?.getInitials() ?? (userName || 'U')[0].toUpperCase();
  const userAvatar = userEntity?.avatar ?? user?.avatar;
  const userRoleDisplay = userEntity ? `Cuenta ${userEntity.getDisplayRole()}` : "";
  const hasItemsInCart = cartCount > 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCIONES - Encapsuladas y composables
  // ═══════════════════════════════════════════════════════════════════════════

  const handleLogout = () => {
    logout();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RETORNO ESTRUCTURADO - Props organizadas por sección
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // LOGO
    logo: {
      href: "/",
    },

    // NAVEGACIÓN
    navigation: {
      showAdmin: isAdmin,
      adminHref: "/admin",
      showSeller: isSeller,
      sellerHref: "/seller/products",
    },

    // BÚSQUEDA (mantenida igual)
    search: {
      placeholder: "Buscar...",
      shortcut: "⌘ K",
    },

    // CARRITO
    cart: {
      href: "/cart",
      count: cartCount,
      showBadge: hasItemsInCart,
    },

    // FAVORITOS
    wishlist: {
      href: "/wishlist",
      show: isLoggedIn,
    },

    // PERFIL / DROPDOWN
    profile: {
      isLoggedIn,
      userName,
      userInitials,
      userAvatar,
      userRoleDisplay,
      profileHref: "/account",
      adminLink: "/admin/products",
      show: isLoggedIn,
    },

    // AUTENTICACIÓN (Login/Logout)
    auth: {
      isLoggedIn,
      loginHref: "/login",
      onLogout: handleLogout,
    },
  };
}
