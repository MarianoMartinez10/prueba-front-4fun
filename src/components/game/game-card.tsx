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

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  /**
   * POO - Encapsulamiento: La lógica de negocio visual reside en el ViewModel.
   * Esto asegura que el componente sea puramente declarativo y altamente mantenible.
   */
  const vm = new ProductViewModel(game as any);
  
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isFavorite = isInWishlist(vm.getDisplayId());

  return (
    <Card className="group relative overflow-hidden border-none bg-card/40 backdrop-blur-md transition-all duration-500 hover:bg-card/60 hover:shadow-3xl hover:-translate-y-2 rounded-3xl ring-1 ring-white/5">
      
      {/* RN - Gestión Promocional: Badge dinámico de bonificación. */}
      {vm.isOnSale() && (
        <div className="absolute left-4 top-4 z-20">
          <Badge className="bg-destructive text-white font-black px-3 py-1 text-[10px] animate-pulse shadow-xl border-none">
            {vm.getDiscountBadge()} BONIFICADO
          </Badge>
        </div>
      )}

      {/* RN - Persistencia de Intenciones: Gestión de Lista de Deseos. */}
      <button
        onClick={() => toggleWishlist(game)}
        className={cn(
          "absolute right-4 top-4 z-20 h-10 w-10 rounded-full bg-black/40 backdrop-blur-2xl transition-all flex items-center justify-center hover:scale-110 border border-white/10 group/heart",
          isFavorite ? "text-destructive fill-current" : "text-white/70"
        )}
        aria-label="Alternar Favorito"
      >
        <Heart className={cn("h-5 w-5 transition-transform", isFavorite && "fill-current group-hover:scale-125")} />
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

        <CardContent className="p-6 relative">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5 px-2">
              {vm.getPlatformName()}
            </Badge>
            {!vm.hasStock() && <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-destructive/10 text-destructive border-none">Agotado</Badge>}
          </div>

          <h3 className="line-clamp-1 font-headline text-xl font-bold text-white group-hover:text-primary transition-colors mb-1 tracking-tight">
            {game.name}
          </h3>
          <p className="text-[10px] text-muted-foreground mb-4 font-black uppercase tracking-[0.2em] opacity-60">
            {vm.getGenreName()}
          </p>
          
          <div className="flex items-end gap-3">
            {/**
              * RN - Localización Monetaria: El ViewModel garantiza el formato ARS (Pesos Argentinos)
              * operando bajo los estándares transaccionales del TFI.
              */}
            <span className="text-3xl font-black text-white tracking-tighter">{vm.toDisplayPrice()}</span>
            
            {vm.isOnSale() && (
              <span className="text-sm text-muted-foreground line-through opacity-40 font-bold mb-1">
                {vm.getOriginalPrice()}
              </span>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-6 pt-0">
        <Button
          onClick={() => addToCart(game)}
          className="w-full h-12 rounded-xl bg-white/5 text-white hover:bg-primary hover:text-black border border-white/10 hover:border-primary transition-all font-black uppercase text-[10px] tracking-[0.2em] group/btn shadow-xl disabled:opacity-20"
          disabled={!vm.hasStock()}
        >
          {vm.hasStock() ? (
            <>
              <ShoppingCart className="h-4 w-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
              Adquirir Licencia
            </>
          ) : (
            "Sin Existencias"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
