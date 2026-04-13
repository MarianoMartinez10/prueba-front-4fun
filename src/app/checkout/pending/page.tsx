"use client";

/**
 * Capa de Interfaz: Estado de Liquidación Diferida (Checkout Pending)
 * --------------------------------------------------------------------------
 * Orquesta la respuesta visual ante pagos asíncronos o pendientes de acreditación.
 * Responsabilidades:
 * 1. Purga Registral: Limpia el carrito local para evitar duplicación de intentos.
 * 2. Comunicación Informativa: Explica los plazos legales de acreditación del sistema.
 * 3. Trazabilidad: Provee acceso directo al seguimiento de la orden generada.
 * (MVC / Page)
 */

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Receipt, ArrowRight, HelpCircle } from "lucide-react";

export default function PendingPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    /**
     * RN - Consistencia Operativa: La orden ya reside en base de datos en estado 
     * 'Pending'. Limpiamos la persistencia local para mantener la integridad.
     */
    clearCart();
  }, [clearCart]);

  return (
    <div className="container flex items-center justify-center min-h-[85vh] px-4 animate-in fade-in zoom-in-95 duration-700">
      <Card className="w-full max-w-lg border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2rem] overflow-hidden ring-1 ring-white/10">
        <CardHeader className="pt-12 pb-6 text-center">
          <div className="mx-auto bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-full mb-6 w-fit relative group">
            <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full opacity-50 animate-pulse" />
            <Clock className="h-14 w-14 text-yellow-400 relative z-10" />
          </div>
          <CardTitle className="text-4xl font-headline font-bold text-white tracking-tighter">
            Pago en Proceso
          </CardTitle>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400/80 mt-2">Acreditación Asíncrona Pendiente</p>
        </CardHeader>
        <CardContent className="space-y-8 px-10 pb-12 text-center">
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Su orden ha sido registrada correctamente. Estamos aguardando la confirmación de la pasarela para liberar sus activos digitales.
            </p>
            <div className="bg-yellow-500/5 border border-yellow-500/10 p-5 rounded-2xl flex items-start gap-4 text-left">
                <HelpCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-100/70 font-medium leading-relaxed">
                    Si utilizó medios de pago en efectivo (ej: Rapipago/Pagofácil), la acreditación puede demorar de 24 a 48 horas hábiles según normativas bancarias.
                </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button asChild size="lg" className="h-14 bg-yellow-600 text-white hover:bg-yellow-700 font-black uppercase text-[10px] tracking-widest transition-all rounded-xl shadow-xl shadow-yellow-600/20">
              <Link href="/account">
                <Receipt className="mr-2 h-4 w-4" />
                Monitorear Estado del Pedido
              </Link>
            </Button>
            <Link href="/productos" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 group">
                Explorar otros Activos <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}