"use client";

/**
 * Capa de Interfaz: Confirmación de Transacción Exitosa (Checkout Success)
 * --------------------------------------------------------------------------
 * Orquesta la respuesta visual ante una liquidación exitosa en la pasarela.
 * Responsabilidades:
 * 1. Sincronización de Estado: Ejecuta la purga del carrito local (Persistence).
 * 2. Visualización Registral: Expone el ID de transacción para auditoría del cliente.
 * 3. Navegación Post-Venta: Redirige hacia el panel de órdenes o catálogo.
 * (MVC / Page)
 */

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShoppingBag, ReceiptText, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  
  /**
   * RN - Auditoría Externa: Captura del identificador único de Mercado Pago.
   * Este valor es crítico para el seguimiento en el panel administrativo.
   */
  const paymentId = searchParams.get("payment_id");

  useEffect(() => {
    /**
     * RN - Integración de Estado: La purga del carrito asegura que no existan 
     * colisiones de stock en futuras sesiones post-pago exitoso.
     */
    clearCart();
  }, [clearCart]);

  return (
    <div className="container flex items-center justify-center min-h-[85vh] px-4 animate-in fade-in zoom-in-95 duration-700">
      <Card className="w-full max-w-lg border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2rem] overflow-hidden ring-1 ring-white/10">
        <CardHeader className="pt-12 pb-6 text-center">
          <div className="mx-auto bg-green-500/10 border border-green-500/20 p-6 rounded-full mb-6 w-fit relative group">
            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full opacity-50 animate-pulse" />
            <CheckCircle className="h-14 w-14 text-green-400 relative z-10" />
          </div>
          <CardTitle className="text-4xl font-headline font-bold text-white tracking-tighter">
            Liquidación Confirmada
          </CardTitle>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400/80 mt-2">Transacción Verificada con Éxito</p>
        </CardHeader>
        <CardContent className="space-y-8 px-10 pb-12">
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground leading-relaxed">
              La operación financiera ha sido procesada íntegramente. Su pedido se encuentra en fase de validación técnica y asignación de activos.
            </p>

            {paymentId && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Comprobante de Pasarela</span>
                <span className="text-sm font-mono font-bold text-primary break-all">{paymentId}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild size="lg" className="h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase text-[10px] tracking-widest transition-all rounded-xl">
              <Link href="/account">
                <ReceiptText className="mr-2 h-4 w-4" />
                Mis Pedidos
              </Link>
            </Button>
            <Button asChild size="lg" className="h-14 bg-primary text-black hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest transition-all rounded-xl shadow-xl shadow-primary/20">
              <Link href="/productos">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Nueva Compra
              </Link>
            </Button>
          </div>
          
          <div className="text-center">
            <Link href="/" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
                Regresar al Inicio <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}