import { Skeleton } from "@/components/ui/skeleton"

/**
 * Capa de Infraestructura: Esqueleto de Ficha Técnica (Product Detail Skeleton)
 * --------------------------------------------------------------------------
 * Orquesta la visualización predictiva de la página de detalle del producto. 
 * Estructura las áreas de multimedia, descripción técnica y control transaccional 
 * para garantizar una transición fluida (Smooth Hydration) sin saltos visuales. 
 * (MVC / View-Infrastructure)
 */

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-20 md:py-32 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 xl:gap-20">
        
        {/* RN - Área Multimedia: Reserva de espacio para el reproductor principal. */}
        <div className="lg:col-span-2 space-y-12">
          <Skeleton className="aspect-video w-full rounded-3xl bg-white/5 border border-white/5 shadow-2xl" />
          
          <div className="space-y-6">
            <Skeleton className="h-10 w-64 bg-white/5 rounded-xl" />
            <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-white/5 rounded-full opacity-60" />
                <Skeleton className="h-4 w-full bg-white/5 rounded-full opacity-60" />
                <Skeleton className="h-4 w-3/4 bg-white/5 rounded-full opacity-30" />
            </div>
          </div>

          <div className="pt-8 space-y-8">
              <Skeleton className="h-1 bg-white/5 w-full rounded-full" />
              <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-40 bg-white/5 rounded-lg" />
                  <Skeleton className="h-10 w-32 bg-white/5 rounded-xl" />
              </div>
          </div>
        </div>

        {/* RN - Control Transaccional: Estructura del panel de conversión lateral. */}
        <aside className="space-y-8">
          <div className="bg-card/20 p-8 rounded-[2.5rem] border border-white/5 space-y-8">
              <Skeleton className="aspect-[3/4] w-full bg-white/5 rounded-2xl shadow-inner" />
              
              <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/5 rounded-full opacity-40 text-[9px]" />
                    <Skeleton className="h-12 w-48 bg-primary/10 rounded-2xl" />
                </div>
                
                <div className="space-y-3 pt-4">
                    <Skeleton className="h-14 w-full bg-primary/20 rounded-2xl" />
                    <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
                </div>
              </div>

              <div className="pt-6 space-y-4 border-t border-white/5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-3 w-20 bg-white/5 rounded-full opacity-30" />
                        <Skeleton className="h-3 w-16 bg-white/5 rounded-full opacity-50" />
                   </div>
                ))}
              </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
