import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

/**
 * ViewModel para el Layout de Administración
 * --------------------------------------------------------------------------
 * Maneja la seguridad de la ruta y el estado de carga.
 *
 * Refactorización POO (Meyer OOSC2 §7.8):
 *   La guard de ruta delega en userEntity.canAccessAdminPanel(), que
 *   encapsula la lógica de autorización. La UI no compara strings de roles.
 */
export function useAdminLayoutViewModel() {
  const { userEntity, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!userEntity) {
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else if (!userEntity.canAccessAdminPanel()) {
        // ✅ POO: Delega en el método del objeto — no compara strings
        router.push("/");
      }
    }
  }, [userEntity, loading, router]);

  // ✅ POO: isAuthorized se determina por el método de la entidad
  const isAuthorized = !loading && !!userEntity && userEntity.canAccessAdminPanel();

  return {
    loading,
    isAuthorized,
    user: userEntity?.getRawData() ?? null,
    userEntity,
  };
}
