import { GameCatalog } from '@/components/game/game-catalog';
import { ApiClient } from '@/lib/api';

/**
 * Capa de Presentación: Catálogo Global de Productos (Products Page)
 * --------------------------------------------------------------------------
 * Orquesta la visualización maestra del inventario.
 * Implementa 'Server Side Rendering' (SSR) para la carga inicial hidratada,
 * permitiendo una indexación SEO óptima y una experiencia de carga rápida.
 * (MVC / View-Controller)
 */

export default async function ProductosPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // RN - Navegación: Recupera los criterios de filtrado desde los parámetros de la URL.
  const { genre, platform, search } = await searchParams;

  /**
   * RN - Hidratación Inicial: Solicita la primera página de productos al Backend.
   * Mantenibilidad: Se utiliza el motor de caché de Next.js (ISR) con revalidación 
   * cada 60 segundos para optimizar el rendimiento de la infraestructura.
   */
  const response = await ApiClient.getProducts({
    page: 1,
    limit: 12,
    sort: 'order', // RN - Merchandising: Orden manual definido en el panel administrativo.
    genre: genre as string,
    platform: platform as string,
    search: search as string
  }, { next: { revalidate: 60 } });

  // Normalización DTO de respuesta para asegurar compatibilidad de contratos.
  const games = (Array.isArray(response) ? response : response.products) as any as import('@/lib/types').Game[];
  const totalPages = Array.isArray(response) ? 1 : (response.meta?.totalPages || 1);

  return (
    <div className="container mx-auto px-4">
      {/* 
          RN - Arquitectura Componentizada: Delega la interactividad del catálogo 
          al Client Component 'GameCatalog', pasando los datos pre-hidratados.
      */}
      <GameCatalog initialGames={games} initialTotalPages={totalPages} />
    </div>
  );
}