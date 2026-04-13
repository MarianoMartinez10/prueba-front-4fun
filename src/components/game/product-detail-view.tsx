"use client";

/**
 * Capa de Interfaz: Ficha Técnica Detallada (Product Detail View)
 * --------------------------------------------------------------------------
 * Orquesta la visualización pormenorizada de un producto del catálogo.
 * Gestiona la integración multimedia (Trailers de YouTube, Galerías),
 * especificaciones de hardware y el acceso principal al flujo de compra. 
 * Implementa una arquitectura inmersiva para maximizar la conversión. (MVC / View)
 */

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import type { Game } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatCurrency, cn, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Heart, Monitor, Gamepad2, Disc, Globe, Layers, Info, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductReviews } from "@/components/game/product-reviews";

interface ProductDetailViewProps {
    game: Game;
}

export function ProductDetailView({ game }: ProductDetailViewProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { toast } = useToast();

    /**
     * RN - Integración Multimedia: Orquesta la normalización de activos visuales.
     * Transforma enlaces de YouTube en reproductores embebidos con parámetros optimizados.
     */
    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(youtubeRegex);
        if (match && match[1]) {
            return { type: 'youtube', src: `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}` };
        }
        return { type: 'video', src: url };
    };

    const isWishlisted = isInWishlist(game.id);
    const imageUrl = getImageUrl(game.imageId, "https://placehold.co/600x800/222/FFF?text=Sin+Imagen");

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

            <main className="container mx-auto px-4 pt-28 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Jerarquía de Navegación (Breadcrumbs) */}
                <nav className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    <Link href="/productos" className="hover:text-primary transition-colors">Catálogo Maestro</Link>
                    <span className="opacity-30">/</span>
                    <span className="text-primary/80">{game.genre?.name || "Activo General"}</span>
                </nav>

                <div className="mb-10">
                    <h1 className="text-5xl md:text-7xl font-headline font-bold mb-4 tracking-tighter text-white drop-shadow-2xl">
                        {game.name}
                    </h1>
                    <div className="flex items-center gap-4">
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px]">OFICIAL STORE</Badge>
                        <div className="flex items-center gap-1 text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 xl:gap-16">
                    
                    {/* Columna de Contenidos: Multimedia y Auditoría Técnica */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Motor Multimedia: Despliegue de Trailer / Imagen Master */}
                        <div className="aspect-video w-full relative overflow-hidden rounded-2xl shadow-3xl bg-black/50 ring-1 ring-white/10 group">
                            {(() => {
                                const media = getEmbedUrl(game.trailerUrl || "");
                                if (media?.type === 'youtube') {
                                    return (
                                        <iframe
                                            src={media.src}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    );
                                } else {
                                    return (
                                        <div className="relative w-full h-full">
                                            <Image src={imageUrl} alt={game.name} fill className="object-cover" priority />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        {/* Descripción y Reglas de Dominio */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold font-headline text-white flex items-center gap-3">
                                <div className="h-8 w-1 bg-primary rounded-full shadow-glow-primary" />
                                Sinopsis Técnica
                            </h2>
                            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg">
                                <p className="whitespace-pre-line opacity-90">{game.description || "No se dispone de una descripción detallada para este registro del catálogo."}</p>
                            </div>
                        </div>

                        {/* RN - Requisitos de Sistema: Parámetros de compatibilidad. */}
                        {game.requirements && (
                            <Card className="bg-card/30 backdrop-blur-xl border-white/5 overflow-hidden">
                                <CardHeader className="bg-muted/20 border-b border-white/5">
                                    <CardTitle className="text-lg font-headline font-bold flex items-center gap-3 text-white">
                                        <Monitor className="h-5 w-5 text-primary" />
                                        Entorno Tecnológico Recomendado
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                        <SpecItem label="Sistema Operativo" value={game.requirements.os} />
                                        <SpecItem label="Procesamiento Central" value={game.requirements.processor} />
                                        <SpecItem label="Memoria Operativa" value={game.requirements.memory} />
                                        <SpecItem label="Aceleración Gráfica" value={game.requirements.graphics} />
                                        <SpecItem label="Almacenamiento" value={game.requirements.storage} />
                                        <SpecItem label="Perfil de Hardware" value={game.specPreset} highlight />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Capa de Auditoría: Opiniones y Feedback del Ecosistema. */}
                        <div className="pt-8">
                             <ProductReviews productId={game.id} productName={game.name} />
                        </div>
                    </div>

                    {/* Columna de Conversión: Control Transaccional y Checkout */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-8 bg-card/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-3xl ring-1 ring-white/5">

                            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 hidden lg:block group">
                                <Image src={imageUrl} alt="Identificador de Portada" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            </div>

                            {/* Valorización y Promociones Transaccionales */}
                            <div className="space-y-6">
                                {game.finalPrice > 0 ? (
                                    <div className="space-y-1">
                                        {(game.discountPercentage ?? 0) > 0 && (
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl text-muted-foreground line-through opacity-50 font-bold">
                                                    {formatCurrency(game.price)}
                                                </span>
                                                <Badge className="bg-destructive text-white font-black text-[10px] px-2 py-0 border-none">
                                                    -{game.discountPercentage}% BONIFICADO
                                                </Badge>
                                            </div>
                                        )}
                                        <div className="text-5xl font-black text-white tracking-tighter drop-shadow-md">
                                            {formatCurrency(game.finalPrice)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-5xl font-black text-primary animate-pulse tracking-tighter">FREE ACCESS</div>
                                )}

                                {/* Acciones de Conversión Primaria */}
                                <div className="flex flex-col gap-4">
                                    <Button
                                        size="lg"
                                        className="w-full text-lg font-black h-16 bg-primary hover:bg-primary/90 text-black shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 group"
                                        onClick={() => {
                                            addToCart(game);
                                            toast({ title: "Cesta Actualizada", description: `${game.name} ha sido reservado.` });
                                        }}
                                        disabled={game.stock === 0}
                                    >
                                        <ShoppingCart className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                                        {game.stock === 0 ? "STOCK AGOTADO" : "AÑADIR AL CARRITO"}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className={cn(
                                            "w-full h-14 border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]", 
                                            isWishlisted && "border-destructive/30 text-destructive bg-destructive/5"
                                        )}
                                        onClick={() => toggleWishlist(game)}
                                    >
                                        <Heart className={cn("mr-2 h-4 w-4", isWishlisted && "fill-current")} />
                                        {isWishlisted ? "Deseado" : "Añadir a Deseos"}
                                    </Button>

                                    {/* RN - Acceso Administrativo (RBAC) */}
                                    {user?.role === 'admin' && (
                                        <Button asChild variant="ghost" size="lg" className="w-full h-10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-white mt-4 border border-dashed border-white/5">
                                            <Link href={`/admin/products/${game.id}`}>
                                                ADMNISTRAR REGISTRO
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Tabla Registral de Metadatos Industriales */}
                            <div className="space-y-4">
                                <MetaRow icon={<Globe className="w-4 h-4 text-primary/60" />} label="Desarrollador" value={game.developer} />
                                <MetaRow icon={<Layers className="w-4 h-4 text-primary/60" />} label="Plataforma" value={game.platform?.name} />
                                <MetaRow icon={<Gamepad2 className="w-4 h-4 text-primary/60" />} label="Categoría" value={game.genre?.name} />
                                <MetaRow icon={<Disc className="w-4 h-4 text-primary/60" />} label="Distribución" value={game.type === 'Physical' ? 'Medio Físico' : 'Licencia Digital'} />
                                <MetaRow icon={<Info className="w-4 h-4 text-primary/60" />} label="Lanzamiento" value={new Date(game.releaseDate).toLocaleDateString("es-AR")} />
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
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                {icon} {label}
            </span>
            <span className="text-white text-xs font-bold text-right">{value}</span>
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
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</span>
            <span className={cn("text-xs font-bold leading-tight", highlight ? "text-primary uppercase" : "text-white")}>{value}</span>
        </div>
    );
}
