'use client'

/**
 * Capa de Infraestructura: Manejador de Excepciones Críticas (Runtime Error)
 * --------------------------------------------------------------------------
 * Orquesta la captura y recuperación de errores no controlados durante el
 * ciclo de renderizado de componentes. 
 * Responsabilidades:
 * 1. Auditoría de Fallos: Registra la traza del error para monitoreo técnico.
 * 2. Gestión de Recuperación: Provee el mecanismo 'reset' para reintentar la 
 *    montura del subárbol de componentes damnificado.
 * 3. Fallback UX: Normaliza la visualización de fallos para el usuario final.
 * (Infrastructure / Error Boundary)
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        /**
         * RN - Trazabilidad: Despacho de la traza de error al motor de logs.
         * En entornos productivos, esto se sincronizaría con Sentry o similares.
         */
        console.error("[RuntimeErrorEngine]:", error);
    }, [error]);

    return (
        <div className="flex min-h-[85vh] flex-col items-center justify-center gap-8 text-center px-4 animate-in fade-in zoom-in-95 duration-700">
            
            {/* Componente Visual de Excepción Técnica */}
            <div className="relative group">
                <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full opacity-50" />
                <div className="relative bg-card/40 backdrop-blur-2xl border border-destructive/20 p-12 rounded-[3.5rem] shadow-3xl">
                    <ShieldAlert className="h-20 w-20 text-destructive relative z-10 mx-auto animate-pulse" />
                    <div className="mt-8 space-y-2">
                        <h2 className="text-3xl font-black text-white tracking-tighter italic">Anomalía del Sistema</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-destructive/80">Excepción en Ciclo de Renderizado</p>
                    </div>
                </div>
            </div>

            <div className="max-w-md space-y-8">
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Se ha detectado una interrupción inesperada en la ejecución del hilo principal. El sistema ha aislado la excepción para prevenir la degradación total de la aplicación.
                </p>

                {error.digest && (
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <p className="text-[9px] font-mono text-muted-foreground uppercase opacity-40">Identificador Digest: {error.digest}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button 
                        onClick={() => reset()} 
                        className="h-14 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] bg-white text-black hover:bg-white/90 shadow-xl transition-all"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" /> Reintentar Operación
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => window.location.href = '/'} 
                        className="h-14 px-8 rounded-xl border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                    >
                        <Home className="mr-2 h-4 w-4" /> Finalizar Sesión
                    </Button>
                </div>
            </div>

            {/* Footer de Capa de Error */}
            <div className="fixed bottom-10 opacity-20 select-none">
                <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white">Critical Error Boundary Protocol v3.0</span>
            </div>
        </div>
    );
}
