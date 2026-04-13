"use client";

/**
 * Capa de Interfaz: Confirmación de Transacción Exitosa (Checkout Success)
 * --------------------------------------------------------------------------
 * Orquesta la respuesta visual ante una liquidación exitosa o registrada.
 * Responsabilidades:
 * 1. Sincronización de Estado: Ejecuta la purga del carrito local (Persistence).
 * 2. Visualización Registral: Expone el ID de orden y link de pago manual.
 * 3. Navegación Post-Venta: Redirige hacia el panel de órdenes o catálogo.
 * (MVC / Page)
 */

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShoppingBag, ArrowRight, ExternalLink, ShieldAlert, CreditCard, ReceiptText } from "lucide-react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  const paymentLink = searchParams.get("payment_link") || 'https://link.mercadopago.com.ar/4funstore';
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    setMounted(true);
    /**
     * RN - Integración de Estado: La purga del carrito asegura que no existan 
     * colisiones de stock en futuras sesiones post-pago exitoso.
     */
    clearCart();
  }, [clearCart]);

  if (!mounted) return null;

  return (
    <Card className="w-full max-w-2xl border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/10">
      <CardHeader className="pt-12 pb-6 text-center bg-blue-500/5 border-b border-white/5">
        <div className="mx-auto bg-blue-500/10 border border-blue-500/20 p-6 rounded-full mb-6 w-fit relative group">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-50 animate-pulse" />
          <CheckCircle className="h-14 w-14 text-blue-400 relative z-10" />
        </div>
        <CardTitle className="text-4xl font-headline font-bold text-white tracking-tighter">
          Orden Registrada
        </CardTitle>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/80 mt-2">Pendiente de Liquidación Manual</p>
      </CardHeader>
      
      <CardContent className="space-y-8 px-10 pb-12 pt-8">
        <div className="space-y-4 text-center">
          <p className="text-white text-lg font-medium leading-relaxed">
            Tu reserva ha sido guardada exitosamente bajo el código de orden <span className="text-primary font-bold">{orderId ? `#${orderId}` : ''}</span>. 
          </p>
          <p className="text-muted-foreground text-sm">
            Para finalizar la compra y que despachemos tus productos o claves digitales, necesitas completar el pago a través de nuestro enlace oficial de Mercado Pago.
          </p>
        </div>

        {/* Mercado Pago Call to Action */}
        <div className="bg-[#009EE3]/10 border border-[#009EE3]/20 rounded-3xl p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <CreditCard className="w-32 h-32 text-[#009EE3]" />
            </div>
            
            <div className="relative z-10 space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight">Paga ahora con Mercado Pago</h3>
                <p className="text-[#009EE3] text-xs font-bold uppercase tracking-widest">Plataforma Segura</p>
            </div>

            <Button 
                asChild 
                size="lg" 
                className="relative z-10 h-16 px-10 bg-[#009EE3] hover:bg-[#009EE3]/90 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-[#009EE3]/20 transition-all hover:scale-105 w-full sm:w-auto"
            >
                <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                    Ir a Pagar <ExternalLink className="ml-3 h-5 w-5" />
                </a>
            </Button>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Importante: Validación Manual</p>
                <p className="text-xs text-orange-200/70 leading-relaxed">Tras realizar el pago, nuestro personal administrativo validará el ingreso y marcará tu orden como &quot;Pagada&quot;. Puede tomar unos minutos en reflejarse en tu cuenta.</p>
            </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-center gap-4">
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
      </CardContent>
    </Card>
  );
}

export default function SuccessPage() {
  return (
    <div className="container flex items-center justify-center min-h-[85vh] px-4 py-12 animate-in fade-in zoom-in-95 duration-700">
      <Suspense fallback={<div className="h-40 w-40 animate-pulse bg-white/5 rounded-full" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}