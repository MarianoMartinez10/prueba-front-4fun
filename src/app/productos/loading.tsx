import { Skeleton } from "@/components/ui/skeleton"

/**
 * Capa de Infraestructura: Esqueletos de Carga del Catálogo (Catalog Loading)
 * --------------------------------------------------------------------------
 * Orquesta la visualización predictiva durante los procesos de hidratación 
 * asíncrona. Mitiga elLayout Shift (CLS) y optimiza los Core Web Vitals (LCP) 
 * proporcionando un feedback visual inmediato.
 * (MVC / View-Infrastructure)
 */

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16 animate-pulse">
      <div className="space-y-10 mb-16">
        
        {/* RN - Jerarquía de Títulos: Estructura base para el encabezado del catálogo. */}
        <div className="space-y-2">
            <Skeleton className="h-12 w-64 md:w-96 bg-white/5 rounded-2xl" />
            <Skeleton className="h-4 w-48 bg-white/5 rounded-full opacity-50" />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* RN - Sidebar Suspendida: Estructura del panel de control lateral. */}
          <aside className="hidden lg:block w-[300px] shrink-0 space-y-8">
            <Skeleton className="h-14 w-full bg-white/5 rounded-2xl" />
            <div className="bg-card/20 p-6 rounded-[2rem] border border-white/5 space-y-6">
                <Skeleton className="h-8 w-1/2 bg-white/5 rounded-lg" />
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-6 w-full bg-white/5 rounded-md" />
                    ))}
                </div>
            </div>
          </aside>

          {/* RN - Rejilla de Activos Suspendidos (Grid Layout Skeleton) */}
          <div className="flex-1 min-h-[600px] w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-5 p-4 rounded-3xl bg-card/20 border border-white/5">
                  <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-white/5" />
                  <div className="space-y-3 px-2 pb-2">
                    <Skeleton className="h-6 w-3/4 bg-white/5 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 bg-white/5 rounded-full opacity-50" />
                    <div className="flex justify-between items-center pt-4">
                        <Skeleton className="h-8 w-24 bg-primary/10 rounded-xl" />
                        <Skeleton className="h-10 w-10 bg-white/5 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}