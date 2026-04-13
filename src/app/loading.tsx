import { Skeleton } from "@/components/ui/skeleton"

/**
 * Capa de Interfaz: Orquestador de Hidratación Asíncrona (Loading)
 * --------------------------------------------------------------------------
 * Implementa el patrón 'Skeleton Screen' para mejorar el rendimiento percibido
 * durante la recuperación de datos en el servidor. 
 * Responsabilidades:
 * 1. Optimización LCP/FCP: Provee una estructura visual base mientras se resuelve
 *    el stream de datos de Next.js.
 * 2. Consistencia Estética: Mantiene el layout proporcional para evitar saltos
 *    de contenido (CLS).
 * (UI / View)
 */

export default function Loading() {
  return (
    <div className="flex flex-col gap-12 md:gap-16 animate-pulse">
      
      {/* Esqueleto del Hero (Impacto visual inicial) */}
      <div className="relative h-[65vh] w-full bg-card/20 backdrop-blur-3xl overflow-hidden border-b border-white/5">
        <div className="container mx-auto h-full flex items-center px-4">
            <div className="space-y-6 w-full max-w-2xl">
                <Skeleton className="h-4 w-24 bg-primary/10" />
                <Skeleton className="h-16 w-full md:w-[80%] bg-white/5" />
                <div className="flex gap-4">
                    <Skeleton className="h-12 w-40 bg-white/5 rounded-xl" />
                    <Skeleton className="h-12 w-40 bg-white/5 rounded-xl" />
                </div>
            </div>
        </div>
        {/* Gradiente decorativo animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 space-y-20 pb-20">
        
        {/* RN - Taxonomía de Hardware: Esqueleto de Segmentación */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-64 bg-white/5" />
              <Skeleton className="h-10 w-32 bg-white/5 rounded-xl hidden md:block" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                 <Skeleton className="h-56 w-full rounded-[2rem] bg-white/5" />
                 <Skeleton className="h-4 w-[60%] bg-white/5 mx-auto" />
              </div>
            ))}
          </div>
        </section>

        {/* RN - Clasificación Lúdica: Esqueleto de Géneros */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-56 bg-white/5" />
              <Skeleton className="h-10 w-32 bg-white/5 rounded-xl hidden md:block" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                 <Skeleton className="h-64 w-full rounded-[2rem] bg-white/5" />
                 <Skeleton className="h-4 w-[40%] bg-white/5" />
                 <Skeleton className="h-4 w-full bg-white/5 opacity-50" />
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {/* Footer de Capa de Carga */}
      <div className="fixed bottom-10 left-10 opacity-10 select-none flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
          <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white">Stream Loading Protocol Active</span>
      </div>
    </div>
  )
}
