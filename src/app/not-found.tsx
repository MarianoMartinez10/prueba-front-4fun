import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ghost, ArrowRight, Home } from 'lucide-react';

/**
 * Capa de Interfaz: Manejador de Excepciones de Enrutamiento (Not Found)
 * --------------------------------------------------------------------------
 * Resuelve las colisiones de navegación cuando el segmento de la URI no 
 * coincide con ninguna ruta física o dinámica del sistema. 
 * Implementa una experiencia de recuperación (Fallback UX) para evitar la
 * deserción del usuario en el flujo de consulta. (UI / View)
 */

export default function NotFound() {
    return (
        <div className="flex min-h-[85vh] flex-col items-center justify-center gap-6 text-center animate-in fade-in zoom-in-95 duration-700 px-4">
            
            {/* Componente Visual de Excepción */}
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity animate-pulse" />
                <div className="relative bg-card/40 backdrop-blur-2xl border border-white/10 p-12 rounded-[3rem] shadow-3xl">
                    <h1 className="text-[12rem] font-black leading-none text-white font-headline tracking-tighter opacity-10 absolute -top-20 left-1/2 -translate-x-1/2 select-none">404</h1>
                    <Ghost className="h-24 w-24 text-primary relative z-10 mx-auto animate-bounce duration-[3000ms]" />
                    <div className="mt-8 space-y-2">
                        <h2 className="text-4xl font-black text-white tracking-tighter">Segmento No Detectado</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Fallo en la Resolución de la URI Solicitada</p>
                    </div>
                </div>
            </div>

            <div className="max-w-md space-y-8">
                <p className="text-muted-foreground text-sm leading-relaxed">
                    El recurso digital solicitado no reside en el padrón de rutas actual o ha sido desestimado por el motor de contenidos.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="h-14 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-black hover:bg-primary/90 shadow-xl transition-all shadow-primary/20">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" /> Regresar al Inicio
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-xl border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all">
                        <Link href="/productos">
                            Explorar Catálogo <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Footer de Capa de Error */}
            <div className="fixed bottom-10 opacity-20 select-none">
                <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white">Error Handler: HTTP_NOT_FOUND_404</span>
            </div>
        </div>
    );
}
