"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { ShoppingCart, Store, ShieldCheck, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Game } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function ProductOffersList({ game }: { game: Game }) {
    const { addToCart } = useCart();
    const offers = game.offers || [];

    if (offers.length === 0) {
        return (
            <Card className="bg-card/30 backdrop-blur-xl border-white/5 overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-white/5">
                    <CardTitle className="text-lg font-headline font-semibold flex items-center gap-3 text-white">
                        <Tag className="h-5 w-5 text-primary" />
                        Ofertas Disponibles
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    No hay ofertas disponibles para este producto en este momento.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/30 backdrop-blur-xl border-white/5 overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-white/5">
                <CardTitle className="text-lg font-headline font-semibold flex items-center gap-3 text-white">
                    <Tag className="h-5 w-5 text-primary" />
                    Ofertas Disponibles ({offers.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                {offers.map((offer) => (
                    <div key={offer.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-xl border border-white/10 bg-black/20 hover:bg-black/40 transition-colors">
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Store className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-white text-lg">{offer.storeName}</h4>
                                    <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">
                                        <ShieldCheck className="w-3 h-3 mr-1" />
                                        Verificado
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">Vendido por {offer.sellerName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">{formatCurrency(offer.price)}</div>
                                <div className="text-xs text-muted-foreground">Stock: {offer.stock > 0 ? offer.stock : 'Agotado'}</div>
                            </div>
                            
                            <Button 
                                onClick={() => addToCart({
                                    offerId: offer.id,
                                    name: game.name,
                                    price: offer.price,
                                    stock: offer.stock,
                                    image: getImageUrl(game.imageId),
                                    platform: game.platform
                                })}
                                disabled={offer.stock <= 0}
                                className="bg-primary hover:bg-primary/90 text-black font-bold whitespace-nowrap"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Añadir al Carrito
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
