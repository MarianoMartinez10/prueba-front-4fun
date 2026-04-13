"use client";

/**
 * Orquesta la visualización, edición y normalización de los productos 
 * seleccionados antes de la fase de pago (Checkout). 
 * Responsabilidades:
 * 1. Validación de Sesión: Asegura que el flujo de compra 
 *    sea ejecutado por usuarios registrados.
 * 2. Gestión de Cantidades: Permite modificar la cantidad de productos con 
 *    validación de stock.
 * 3. Resumen de Compra: Provee el total de la inversión pre-checkout.
 * (MVC / View)
 */

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { Trash2, ShoppingBag, LogIn, UserPlus, ArrowRight, ShieldCheck, BadgeCheck } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { user } = useAuth();

  const asCurrencySafe = (value: number | undefined) => {
    const parsed = Number(value);
    return formatCurrency(Number.isFinite(parsed) ? parsed : 0);
  };

  /**
   * RN - Protocolo de Seguridad (Guest Gate):
   * Restringe el acceso a la gestión operativa de la cesta para usuarios sin 
   * credenciales activas. Promueve la registración institucional.
   */
  if (!user) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 py-32 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="h-24 w-24 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <ShoppingBag className="h-12 w-12 text-primary relative z-10" />
        </div>
        <h2 className="text-3xl font-headline font-bold text-white mb-2 italic">
          Inicia Sesión
        </h2>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold opacity-60 mb-8 max-w-sm mx-auto">
          Debes estar identificado para gestionar tu carrito y finalizar compras.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="h-12 px-6 bg-primary text-black font-semibold uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary/90 transition-all shadow-lg">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 px-6 border-white/10 bg-white/5 text-white font-semibold uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/10 transition-all">
            <Link href="/register">
              <UserPlus className="mr-2 h-4 w-4" /> Registrarse
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-20 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-5xl font-semibold font-headline text-white tracking-tighter italic uppercase">Tu Carrito</h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground opacity-60">Resumen de selección de productos</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-full hidden md:flex items-center gap-2">
             <BadgeCheck className="h-4 w-4 text-primary" />
             <span className="text-[9px] font-medium uppercase tracking-widest text-primary">Sesión Validada: {user.name}</span>
          </div>
      </div>

      {/* RN - Gestión de Inventario: Visualización de la Cesta */}
      {cart.length === 0 ? (
        <div className="text-center py-24 bg-card/10 backdrop-blur-3xl border-2 border-dashed border-white/5 rounded-[2.5rem] animate-in zoom-in-95 duration-700">
          <ShoppingBag className="mx-auto h-20 w-20 text-muted-foreground opacity-10 mb-6" />
          <h2 className="font-headline text-3xl font-bold text-white">Carrito Vacío</h2>
          <p className="mt-4 text-muted-foreground max-w-sm mx-auto text-sm">
            Aún no has agregado productos a tu carrito. Explora nuestro catálogo para encontrar tus juegos favoritos.
          </p>
          <Button asChild className="mt-10 h-14 px-10 rounded-xl font-medium uppercase tracking-widest text-[10px] bg-white text-black hover:bg-white/90 shadow-xl transition-all">
            <Link href="/productos">Ir al Catálogo</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const imageUrl = getImageUrl(item.image, "https://placehold.co/600x400/222/FFF?text=Sin+Imagen");
              const itemName = item.name?.trim() || "Producto";
              const itemPrice = Number(item.price);
              const safePrice = Number.isFinite(itemPrice) ? itemPrice : 0;
              const safeQuantity = Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0
                ? Math.trunc(Number(item.quantity))
                : 1;
              return (
                <Card key={item.id} className="group relative flex items-center p-6 border-none bg-card/40 backdrop-blur-3xl rounded-3xl overflow-hidden hover:bg-card/60 transition-all duration-500 shadow-xl ring-1 ring-white/5">
                  <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-black/40">
                    <Image
                      src={imageUrl}
                      alt={itemName}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="ml-6 flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-primary opacity-60">
                            {item.platform?.name || "Distribuido"}
                        </span>
                    </div>
                    <h3 className="font-headline text-xl font-semibold text-white group-hover:text-primary transition-colors">{itemName}</h3>
                    <p className="text-lg font-medium mt-2 text-white/90 tabular-nums tracking-tighter">{asCurrencySafe(safePrice)}</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground opacity-40">UDS</span>
                        <Input
                          type="number"
                          min="1"
                          value={safeQuantity}
                          onChange={(e) => {
                            const parsed = Number(e.target.value);
                            updateQuantity(item.id, Number.isFinite(parsed) ? parsed : 1);
                          }}
                          className="h-10 w-16 text-center bg-black/40 border-white/10 rounded-lg text-white font-medium"
                          aria-label="Cantidad de productos"
                        />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="h-12 w-12 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                      aria-label="Quitar del carrito"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Resumen de Operación Financiera (Sidebar Ticket) */}
          <div className="lg:col-span-4 sticky top-24">
            <Card className="border-none bg-primary/5 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden ring-1 ring-primary/20">
              <CardHeader className="bg-primary/10 py-10 px-10 text-center border-b border-primary/10">
                <CardTitle className="font-headline text-2xl font-semibold text-white tracking-widest uppercase">Resumen de Compra</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        <span>Posiciones ({cartCount})</span>
                        <span className="text-white">{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground opacity-60">
                        <span>Protocolo de Envío</span>
                        <span className="text-green-400">Normalizado</span>
                    </div>
                </div>
                
                <Separator className="bg-primary/20" />
                
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground">Total Final</span>
                    <span className="text-4xl font-medium text-white tracking-tighter tabular-nums">{formatCurrency(cartTotal)}</span>
                </div>
              </CardContent>
              <CardFooter className="px-10 pb-10">
                <Button className="w-full h-16 font-medium uppercase tracking-[0.2em] text-[10px] bg-primary text-black hover:bg-primary/90 shadow-2xl shadow-primary/30 rounded-2xl transition-all group" size="lg" asChild>
                  <Link href="/checkout">
                    Continuar al Pago <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <div className="mt-8 flex items-center justify-center gap-3 opacity-30 select-none">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Transacción Segura AES-256</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}