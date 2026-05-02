'use client';

/**
 * Capa de Seguridad (RBAC): Layout de Vendedor
 * --------------------------------------------------------------------------
 * Garantiza que solo los usuarios autorizados (Rol: Seller o Admin) puedan
 * acceder a las herramientas de gestión comercial.
 */

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
        // RN: Si un Comprador intenta entrar por URL, lo redirigimos a su cuenta.
        router.push('/account');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          Verificando credenciales de comercio...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
