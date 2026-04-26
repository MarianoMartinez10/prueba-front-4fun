"use client";

/**
 * Capa de Interfaz: Vista Previa Operativa (Quick View Modal)
 * --------------------------------------------------------------------------
 * Provee un acceso acelerado a las especificaciones y acciones de conversión
 * de un producto sin abandonar el contexto del catálogo. Gestiona la 
 * orquestación de carritos, listas de deseos y el motor de comparativa técnica. 
 * (UI / View)
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useComparator } from "@/context/ComparatorContext";
import { ShoppingCart, Heart, Scale, ExternalLink, Info } from "lucide-react";
import Image from "next/image";
import { formatCurrency, cn, getImageUrl } from "@/lib/utils";
import type { Game } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";

interface QuickViewModalProps {
    game: Game;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ game, open, onOpenChange }: QuickViewModalProps) {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCompare, isInCompare, removeFromCompare } = useComparator();
    const isWishlisted = isInWishlist(game.id);
    const isCompared = isInCompare(game.id);
    const hasStock = game.stock !== undefined && game.stock > 0;

    const imageUrl = getImageUrl(game.imageId, "https://placehold.co/600x800/222/FFF?text=Sin+Imagen");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border-none bg-card/60 backdrop-blur-3xl shadow-3xl ring-1 ring-white/10 animate-in zoom-in-95 duration-500">
                <div className="grid md:grid-cols-2">
                    
                    {/* Columna Multimedia: Visualización de Activo Master */}
                    <div className="relative h-[350px] md:h-full bg-black/40 overflow-hidden group">
                        <Image
                            src={imageUrl}
                            alt={`Imagen de ${game.name}`}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 400px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>

                    {/* Columna de Inteligencia y Conversión */}
                    <div className="p-8 flex flex-col justify-between">
                        <DialogHeader className="mb-6 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px]">
                                    {game.platform?.name || 'Sistema'}
                                </Badge>
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-white/10 text-muted-foreground">
                                    {game.genre?.name || 'Categoría'}
                                </Badge>
                            </div>
                            <DialogTitle className="text-3xl font-bold font-headline leading-none text-white tracking-tighter">
                                {game.name}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                                {game.description || "No se dispone de una reseña técnica abreviada para este activo."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* RN - Visualización de Valorización Financiera */}
                            <div className="flex items-end justify-between border-t border-white/5 pt-6">
                                <div className="flex flex-col">
                                    {(game.discountPercentage ?? 0) > 0 && (game.finalPrice ?? 0) < game.price && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm text-muted-foreground line-through decoration-red-500 opacity-40 font-bold">
                                                {formatCurrency(game.price)}
                                            </span>
                                            <Badge className="bg-green-500/10 hover:bg-green-500/20 text-white/70 font-black text-[9px] px-2 py-0 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)] border-green-500/20 backdrop-blur-md uppercase tracking-wider rounded-md">
                                                -{game.discountPercentage}% OFF
                                            </Badge>
                                        </div>
                                    )}
                                    <span className="text-4xl font-black text-white tracking-tighter drop-shadow-md">
                                        {formatCurrency(game.finalPrice ?? game.price)}
                                    </span>
                                </div>
                                {!hasStock && (
                                    <Badge variant="destructive" className="font-black uppercase tracking-widest text-[9px] px-3 animate-pulse">
                                        Stock Agotado
                                    </Badge>
                                )}
                            </div>

                            {/* Acciones de Orquestación y Checkout */}
                            <div className="flex gap-3">
                                <Button
                                    className="flex-1"
                                    disabled={!hasStock}
                                    onClick={() => {
                                        addToCart(game);
                                        onOpenChange(false);
                                    }}
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Comprar
                                </Button>
                                
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={cn("transition-all duration-300", isWishlisted && "bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)]")}
                                    onClick={() => toggleWishlist(game)}
                                >
                                    <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => isCompared ? removeFromCompare(game.id) : addToCompare(game)}
                                    title="Comparativa Técnica"
                                >
                                    <Scale className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="text-center pt-2">
                                <Link
                                    href={`/productos/${game.id}`}
                                    className="group flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all underline decoration-primary/20 underline-offset-4"
                                    onClick={() => onOpenChange(false)}
                                >
                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    Ver Detalles
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
