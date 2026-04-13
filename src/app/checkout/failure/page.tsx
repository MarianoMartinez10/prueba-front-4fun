"use client";

/**
 * Capa de Interfaz: Contingencia en Liquidación (Checkout Failure)
 * --------------------------------------------------------------------------
 * Orquesta la respuesta visual ante un rechazo o fallo en la pasarela de pagos.
 * Responsabilidades:
 * 1. Comunicación de Fallo: Informa al usuario sobre la integridad del cargo (No realizado).
 * 2. Gestión de Reintentos: Facilita el retorno seguro al flujo de checkout.
 * 3. Soporte Técnico: Provee canales directos de reporte ante errores críticos.
 * (MVC / Page)
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCw, MessageSquareWarning, ArrowLeft } from "lucide-react";

export default function FailurePage() {
  return (
    <div className="container flex items-center justify-center min-h-[85vh] px-4 animate-in fade-in zoom-in-95 duration-700">
      <Card className="w-full max-w-lg border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2rem] overflow-hidden ring-1 ring-white/10">
        <CardHeader className="pt-12 pb-6 text-center">
          <div className="mx-auto bg-destructive/10 border border-destructive/20 p-6 rounded-full mb-6 w-fit relative group">
            <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full opacity-50 animate-pulse" />
            <XCircle className="h-14 w-14 text-destructive relative z-10" />
          </div>
          <CardTitle className="text-4xl font-headline font-bold text-white tracking-tighter">
            Transacción Fallida
          </CardTitle>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive/80 mt-2">Error en Procesamiento de Pago</p>
        </CardHeader>
        <CardContent className="space-y-8 px-10 pb-12 text-center">
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              No se ha podido procesar la liquidación en la entidad financiera. No se han efectuado débitos ni cargos a su cuenta.
            </p>
            <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-xl">
                 <p className="text-[10px] font-bold text-destructive uppercase tracking-widest italic">Causa probable: Fondos insuficientes o fallo en validación 3DS.</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <Button asChild size="lg" className="h-14 bg-destructive text-white hover:bg-destructive/90 font-black uppercase text-[10px] tracking-widest transition-all rounded-xl shadow-xl shadow-destructive/20">
              <Link href="/checkout">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar Operación
              </Link>
            </Button>
            <Button variant="ghost" asChild className="h-12 font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:text-white transition-all">
              <Link href="/contacto">
                <MessageSquareWarning className="mr-2 h-4 w-4" />
                Reportar Incidencia Técnica
              </Link>
            </Button>
          </div>

          <div className="pt-4">
            <Link href="/productos" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="h-3 w-3" /> Regresar al Catálogo
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}