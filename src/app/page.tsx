import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PixelHero } from '@/components/pixel-hero';
import { CategoryCard } from '@/components/game/category-card';
import { TaxonomyApiService } from '@/lib/services/TaxonomyApiService';

/**
 * Capa de Presentación: Página de Inicio (Home Page)
 * --------------------------------------------------------------------------
 * Actúa como el punto de entrada principal (Landing Page) del sistema.
 * Implementa el patrón 'Server Side Fetching' de Next.js para optimizar
 * el SEO y la velocidad de carga inicial. (MVC / View-Controller)
 */

// RN - Infraestructura: Imagen de respaldo en caso de fallo de sincronización de assets.
const defaultImage = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600";

export default async function Home() {
  /**
   * RN - Hidratación de Datos: Recuperación de metadatos del catálogo.
   * Se utiliza Promise.all para ejecutar las peticiones en paralelo,
   * reduciendo el tiempo de bloqueo del renderizado en el servidor.
   */
  let platformsData: any[] = [];
  let genresData: any[] = [];

  try {
    const [pData, gData] = await Promise.all([
      TaxonomyApiService.getPlatforms().catch(() => []),
      TaxonomyApiService.getGenres().catch(() => [])
    ]);

    // RN - Resiliencia: Maneja la variabilidad en la estructura de respuesta del Backend.
    platformsData = Array.isArray(pData) ? pData : (pData?.data || []);
    genresData = Array.isArray(gData) ? gData : (gData?.data || []);
  } catch (error) {
    console.error("[Home] Error en carga de visuales:", error);
  }

  /**
   * RN - Transformación DTO: Normaliza las entidades del backend para la UI.
   * Desacopla la lógica visual de los nombres de campos específicos de la DB.
   */
  const platforms = platformsData.map((p: any) => ({
    id: p.id,
    name: p.name,
    image: (p.imageId && (p.imageId.startsWith('http') || p.imageId.startsWith('/'))) ? p.imageId : defaultImage
  }));

  const genres = genresData.map((g: any) => ({
    id: g.id,
    name: g.name,
    image: (g.imageId && (g.imageId.startsWith('http') || g.imageId.startsWith('/'))) ? g.imageId : defaultImage
  }));

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {/* Sección Hero: Impacto visual inicial y Call to Action (CTA). */}
      <PixelHero />

      {/* Sección: Explorar por Plataforma (RN - Taxonomía de Productos) */}
      <section className="relative w-full overflow-hidden bg-background py-12 md:py-16">
        {/* RN - Estética TFI: Fondo decorativo con grid geométrico. */}
        <div className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background z-0" />

        <div className="container relative z-10 mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-3xl font-semibold md:text-4xl text-center md:text-left">Explorar por Plataforma</h2>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/productos">Ver todo</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map(platform => (
              <CategoryCard
                key={platform.id}
                title={platform.name}
                image={platform.image}
                href={`/productos?platform=${platform.id}`}
              />
            ))}
          </div>

          {/* RN - UX Adaptativa: Botón de acción para dispositivos con factor de forma pequeño. */}
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/productos">Ver todo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sección: Explorar por Género (RN - Categorización de Mercado) */}
      <section className="relative w-full overflow-hidden bg-background py-12 md:py-16">
        <div className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background z-0" />

        <div className="container relative z-10 mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-3xl font-semibold md:text-4xl text-center md:text-left">Explorar por Género</h2>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/productos">Ver todo</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {genres.map(genre => (
              <CategoryCard
                key={genre.id}
                title={genre.name}
                image={genre.image}
                href={`/productos?genre=${genre.id}`}
              />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/productos">Ver todo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}