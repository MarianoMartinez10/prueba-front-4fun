"use client";

/**
 * Capa de Interfaz: Componente Atómico de Visualización (Game Card)
 * --------------------------------------------------------------------------
 * Renderiza la ficha técnica reducida de un producto para listados masivos.
 * Implementa el patrón MVVM al delegar íntegramente la lógica de presentación
 * (formateo monetario, visualización de stock, cálculos promocionales) a la
 * clase especializada `ProductViewModel`. Garantiza la independencia entre el
 * modelo de datos y la vista. (MVC / Component)
 */

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ShoppingCart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ProductViewModel } from "@/lib/viewmodels";
import type { Game } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const router = useRouter();
  /**
   * POO - Encapsulamiento: La lógica de negocio visual reside en el ViewModel.
   * Esto asegura que el componente sea puramente declarativo y altamente mantenible.
   */
  const vm = new ProductViewModel(game as any);
  
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isFavorite = isInWishlist(vm.getDisplayId());

  return (
    <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-md transition-all duration-300 hover:bg-card/60 hover:shadow-xl hover:-translate-y-1 rounded-2xl border border-white/5 hover:border-primary/30 shadow-md flex flex-col h-full">
      
      {/* RN - Gestión Promocional: Badge dinámico de bonificación. */}
      {vm.isOnSale() && (
        <div className="absolute left-4 top-4 z-20">
          <Badge className="bg-green-500/10 hover:bg-green-500/20 text-white/70 font-black text-xs px-4 py-1.5 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)] border-green-500/20 backdrop-blur-md uppercase tracking-wider rounded-md">
            DESCUENTO: {vm.getDiscountBadge()} OFF
          </Badge>
        </div>
      )}

      {/* RN - Persistencia de Intenciones: Gestión de Lista de Deseos. */}
      <button
        onClick={() => toggleWishlist(game)}
        className={cn(
          "absolute right-4 top-4 z-20 h-10 w-10 rounded-full transition-all duration-300 flex items-center justify-center hover:scale-110 hover:shadow-lg border backdrop-blur-md",
          isFavorite 
            ? "bg-red-500 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
            : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:border-white/40"
        )}
        aria-label="Alternar Favorito"
      >
        <Heart className={cn("h-5 w-5 transition-all", isFavorite ? "fill-current scale-110" : "group-hover:scale-125")} />
      </button>

      <Link href={`/productos/${vm.getDisplayId()}`}>
        <CardHeader className="p-0 overflow-hidden">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={vm.getImageUrl()}
              alt={`Portada de ${game.name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
              priority={false}
            />
            {/* Capa de Transición de Brillo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 transition-opacity duration-700 group-hover:opacity-40" />
          </div>
        </CardHeader>

        <CardContent className="p-5 relative flex-1 flex flex-col">
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-primary/30 text-primary bg-primary/5 px-2.5 py-1">
              {vm.getPlatformName()}
            </Badge>
            {!vm.hasStock() && <Badge variant="secondary" className="text-[8px] font-bold uppercase tracking-widest bg-destructive/10 text-destructive border-destructive/20">Agotado</Badge>}
          </div>

          <h3 className="line-clamp-2 font-headline text-lg font-semibold text-white group-hover:text-primary transition-colors mb-2 tracking-tight leading-tight">
            {game.name}
          </h3>
          
          <div className="border-t border-white/5 pt-4 mb-4" />
          
          <div className="flex items-baseline gap-2 mb-4">
            {/**
              * RN - Localización Monetaria: El ViewModel garantiza el formato ARS (Pesos Argentinos)
              * operando bajo los estándares transaccionales del TFI.
              */}
            <span className="text-2xl font-bold text-white tracking-tighter">{vm.toDisplayPrice()}</span>
            
            {vm.isOnSale() && (
              <span className="text-xs text-muted-foreground line-through decoration-red-500 opacity-50 font-medium">
                {vm.getOriginalPrice()}
              </span>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-5 pt-0 flex gap-2">
        <Button
          onClick={(e) => {
            e.preventDefault();
            addToCart(game);
            router.push('/checkout');
          }}
          className="flex-1 h-11 rounded-lg bg-primary text-black hover:bg-primary/90 transition-all font-bold uppercase text-[10px] tracking-widest shadow-xl disabled:opacity-20"
          disabled={!vm.hasStock()}
        >
          {vm.hasStock() ? "Comprar" : "Agotado"}
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            addToCart(game);
          }}
          className="h-11 w-11 shrink-0 rounded-lg bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all shadow-xl disabled:opacity-20 flex items-center justify-center p-0 group/btn"
          disabled={!vm.hasStock()}
          title="Añadir al Carrito"
        >
          <ShoppingCart className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}
