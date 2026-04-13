"use client";

/**
 * Capa de Interfaz: Ventana Institucional (About Dialog)
 * --------------------------------------------------------------------------
 * Provee un punto de información detallado sobre el origen y propósito 
 * del sistema. Justifica la arquitectura tecnológica y establece la 
 * trazabilidad académica del proyecto "4Fun Marketplace" para el 
 * tribunal evaluador del TFI. (MVC / View)
 */

import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Code, ShieldCheck } from "lucide-react";
import React from "react";

export function AboutDialog({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] overflow-hidden bg-card/95 backdrop-blur-xl border-white/10 shadow-3xl">
                <DialogHeader className="mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-4">
                        <Image src="/logo.png" alt="Logotipo 4Fun" width={100} height={100} className="h-14 w-14 object-contain" />
                        <div>
                            <DialogTitle className="text-3xl font-headline font-bold text-white uppercase tracking-tight">Sobre 4Fun</DialogTitle>
                            <DialogDescription className="text-sm text-primary font-bold uppercase tracking-widest mt-1">
                                Juegos, soporte y experiencia de compra
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-8">
                    {/* Justificación Académica / TFI */}
                    <div className="space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground border-l-4 border-primary/20 pl-6">
                        <p>
                            <strong className="text-white">4Fun Marketplace</strong> es una tienda online pensada para gamers, con juegos digitales y fisicos para todas las plataformas.
                        </p>
                        <p>
                            Nuestro objetivo es que comprar sea simple: buen catalogo, precios claros, checkout rapido y acompanamiento durante toda la compra.
                        </p>
                    </div>

                    {/* Columnas de Pilares Técnicos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                        <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-muted/20 border border-white/5 shadow-inner group hover:border-primary/30 transition-colors">
                            <Code className="h-10 w-10 text-primary mb-3 shadow-glow-primary" />
                            <h4 className="font-bold text-white mb-2 uppercase tracking-tighter text-xs">Catalogo amplio</h4>
                            <p className="text-[10px] text-muted-foreground uppercase leading-tight">Novedades, clasicos y contenido para distintas plataformas.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-muted/20 border border-white/5 shadow-inner group hover:border-primary/30 transition-colors">
                            <ShieldCheck className="h-10 w-10 text-primary mb-3 shadow-glow-primary" />
                            <h4 className="font-bold text-white mb-2 uppercase tracking-tighter text-xs">Compra segura</h4>
                            <p className="text-[10px] text-muted-foreground uppercase leading-tight">Pagos protegidos y seguimiento claro del estado de tus pedidos.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-muted/20 border border-white/5 shadow-inner group hover:border-primary/30 transition-colors">
                            <Heart className="h-10 w-10 text-primary mb-3 shadow-glow-primary" />
                            <h4 className="font-bold text-white mb-2 uppercase tracking-tighter text-xs">Atencion real</h4>
                            <p className="text-[10px] text-muted-foreground uppercase leading-tight">Te ayudamos antes, durante y despues de cada compra.</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
