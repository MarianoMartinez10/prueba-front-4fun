"use client";

/**
 * Capa de Interfaz: Detalles del Producto (Refactorizada con ViewModel)
 */

import Link from "next/link";
import Image from "next/image";
import type { Game } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Heart, Monitor, Gamepad2, Disc, Globe, Layers, Info, Star } from "lucide-react";
import { ProductReviews } from "@/components/game/product-reviews";

// ✅ INYECCIÓN ARQUITECTÓNICA (QA MVC)
import { useProductDetailViewModel } from "@/hooks/use-product-detail-view-model";

interface ProductDetailViewProps {
    game: Game;
}

export function ProductDetailView({ game }: ProductDetailViewProps) {
    // 🧠 Consumo 100% Pasivo desde el ViewModel
    const vm = useProductDetailViewModel(game);
    const {
        user,
        media,
        isWishlisted,
        imageUrl,
        breadcrumbLabel,
        hasDiscount,
        isFree,
        isOutOfStock,
        finalPriceVal,
        handleAddToCart,
        handleToggleWishlist,
        canEdit,
        editUrl
    } = vm;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 relative overflow-x-hidden">
            
            {/* Capa Visual: Hero Background (Efecto Inmersivo) */}
            <div className="absolute inset-x-0 top-0 h-[600px] overflow-hidden -z-10 opacity-30 pointer-events-none select-none">
                <Image
                    src={imageUrl}
                    alt="Fondo Decorativo"
                    fill
                    className="object-cover blur-3xl scale-125"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
            </div>

            <main className="container mx-auto px-4 pt-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Navegación (Breadcrumbs) */}
                <nav className="mb-8 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
                    <Link href="/productos" className="hover:text-primary transition-colors">Productos</Link>
                    <span className="opacity-30">/</span>
                    <span className="text-primary/80 truncate max-w-[240px] md:max-w-[420px]">{breadcrumbLabel}</span>
                </nav>

                <div className="mb-10">
                    <h1 className="text-5xl md:text-7xl font-headline font-semibold mb-4 tracking-tighter text-white drop-shadow-2xl">
                        {game.name}
                    </h1>
                    <div className="flex items-center gap-4">
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold uppercase tracking-widest text-[10px]">Vendedor Verificado</Badge>
                        <div className="flex items-center gap-1 text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 xl:gap-16">
                    
                    {/* Columna de Contenidos: Multimedia y Detalles */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Motor Multimedia */}
                        <div className="aspect-video w-full relative overflow-hidden rounded-2xl shadow-3xl bg-black/50 ring-1 ring-white/10 group">
                            {media?.type === 'youtube' ? (
                                <iframe
                                    src={media.src}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="relative w-full h-full">
                                    <Image src={imageUrl} alt={game.name} fill className="object-cover" priority />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                            )}
                        </div>

                        {/* Descripción y Reglas de Dominio */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold font-headline text-white flex items-center gap-3">
                                <div className="h-8 w-1 bg-primary rounded-full shadow-glow-primary" />
                                Descripción
                            </h2>
                            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg">
                                <p className="whitespace-pre-line opacity-90">{game.description || 'Este producto no tiene descripcion disponible por el momento.'}</p>
                            </div>
                        </div>

                        {/* RN - Requisitos de Sistema */}
                        {game.requirements && (
                            <Card className="bg-card/30 backdrop-blur-xl border-white/5 overflow-hidden">
                                <CardHeader className="bg-muted/20 border-b border-white/5">
                                    <CardTitle className="text-lg font-headline font-semibold flex items-center gap-3 text-white">
                                        <Monitor className="h-5 w-5 text-primary" />
                                        Requisitos del Sistema
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                        <SpecItem label="Sistema Operativo" value={game.requirements.os} />
                                        <SpecItem label="Procesador" value={game.requirements.processor} />
                                        <SpecItem label="Memoria RAM" value={game.requirements.memory} />
                                        <SpecItem label="Gráficos" value={game.requirements.graphics} />
                                        <SpecItem label="Espacio en Disco" value={game.requirements.storage} />
                                        <SpecItem label="Perfil de Hardware" value={game.specPreset ?? undefined} highlight />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Opiniones y Valoraciones. */}
                        <div className="pt-8">
                             <ProductReviews productId={game.id} productName={game.name} />
                        </div>
                    </div>

                    {/* Columna de Conversión: Control Transaccional y Checkout */}
                    <div className="lg:col-span-1" style={{ perspective: "1000px" }}>
                        <div className="sticky top-28 space-y-8 bg-card/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-3xl ring-1 ring-white/5">

                            {/* 🎨 UI/UX Premium Aidesigner: Poster Elevado y Rotación 3D en Hover */}
                            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 hidden lg:block group hover:[transform:rotateX(5deg)_rotateY(-5deg)_scale(1.02)] transition-all duration-700 ease-out origin-center bg-black">
                                <Image src={imageUrl} alt="Identificador de Portada" fill className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-transparent via-white/5 to-transparent transition-opacity duration-1000" />
                            </div>

                            {/* Valorización y Promociones Transaccionales */}
                            <div className="space-y-6">
                                {!isFree ? (
                                    <div className="space-y-1">
                                        {hasDiscount && (
                                             <div className="flex items-center gap-3">
                                                 <span className="text-xl text-muted-foreground line-through decoration-red-500 opacity-50 font-semibold">
                                                     {formatCurrency(game.price)}
                                                 </span>
                                                 <Badge className="bg-green-500/10 hover:bg-green-500/20 text-white/70 font-black text-[10px] px-3 py-1 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)] border-green-500/20 backdrop-blur-md uppercase tracking-widest rounded-md">
                                                     DESCUENTO: -{game.discountPercentage}% OFF
                                                 </Badge>
                                             </div>
                                         )}
                                        <div className="text-5xl font-black text-white tracking-tighter drop-shadow-md">
                                            {formatCurrency(finalPriceVal)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-5xl font-bold text-primary animate-pulse tracking-tighter">FREE ACCESS</div>
                                )}

                                {/* Acciones de Conversión Primaria */}
                                <div className="flex flex-col gap-4">
                                    <Button
                                        size="lg"
                                        className="w-full"
                                        onClick={handleAddToCart}
                                    >
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        {isOutOfStock ? "STOCK AGOTADO" : "AGREGAR AL CARRITO"}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className={cn("w-full transition-all duration-300", isWishlisted && "bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)]")}
                                        onClick={handleToggleWishlist}
                                    >
                                        <Heart className={cn("mr-2 h-4 w-4", isWishlisted && "fill-current")} />
                                        {isWishlisted ? "En favoritos" : "Agregar a favoritos"}
                                    </Button>

                                    {/* RN: Protocolo de Acceso Administrativo/Autoría */}
                                    {vm.canEdit && (
                                        <Button asChild variant="ghost" size="lg" className="w-full mt-4 hover:bg-primary/10 hover:text-primary font-bold transition-all duration-300">
                                            <Link href={vm.editUrl}>
                                                EDITAR PRODUCTO
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Información General */}
                            <div className="space-y-4">
                                <MetaRow icon={<Globe className="w-4 h-4 text-primary/60" />} label="Desarrollador" value={game.developer ?? undefined} />
                                <MetaRow icon={<Layers className="w-4 h-4 text-primary/60" />} label="Plataforma" value={game.platform?.name} />
                                <MetaRow icon={<Gamepad2 className="w-4 h-4 text-primary/60" />} label="Categoría" value={game.genre?.name} />
                                <MetaRow icon={<Disc className="w-4 h-4 text-primary/60" />} label="Distribución" value={game.type === 'Physical' ? 'Medio Físico' : 'Licencia Digital'} />
                                <MetaRow icon={<Info className="w-4 h-4 text-primary/60" />} label="Lanzamiento" value={game.releaseDate ? new Date(game.releaseDate).toLocaleDateString("es-AR") : undefined} />
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}

/**
 * Componente Atómico: Fila de Atributo Registral.
 */
function MetaRow({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center py-2 border-b border-transparent hover:border-white/5 transition-all">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                {icon} {label}
            </span>
            <span className="text-white text-xs font-semibold text-right">{value}</span>
        </div>
    );
}

/**
 * Componente Atómico: Ítem de Especificación Técnica.
 */
function SpecItem({ label, value, highlight }: { label: string, value?: string, highlight?: boolean }) {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-1 pb-2 md:pb-0">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">{label}</span>
            <span className={cn("text-xs font-semibold leading-tight", highlight ? "text-primary uppercase" : "text-white")}>{value}</span>
        </div>
    );
}
