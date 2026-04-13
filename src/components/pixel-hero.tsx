"use client";

/**
 * Capa de Interfaz: Hero Interactivo de Promociones (Pixel Hero)
 * --------------------------------------------------------------------------
 * Actúa como el punto de anclaje visual (Hero Section) para destacar ofertas.
 * Orquesta un carrusel asíncrono que consume el motor de promociones del API.
 * Provee una experiencia inmersiva mediante fondos desenfocados dinámicos
 * y micro-animaciones de transición. (MVC / View)
 */

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Zap, ArrowRight, ChevronLeft, ChevronRight, Percent } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/schemas';
import { ApiClient } from '@/lib/api';
import Link from 'next/link';

// RN - Imagen por Defecto: Fallback para asegurar estabilidad visual ante fallos de assets.
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export const PixelHero = () => {
  const { addToCart } = useCart();
  const [games, setGames] = useState<Product[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  /**
   * RN - Tracción de Ofertas: Hidrata el Hero con productos que poseen 
   * descuentos activos verificados por el servidor.
   */
  useEffect(() => {
    const fetchDiscounted = async () => {
      try {
        const res = await ApiClient.getProducts({ discounted: true });
        // Validación de Margen: Filtra únicamente productos con descuento efectivo > 0.
        const withRealDiscount = res.products.filter(
          (p) => (p.discountPercentage ?? 0) > 0 && (p.finalPrice ?? 0) < p.price
        );
        if (withRealDiscount.length > 0) {
          setGames(withRealDiscount);
        }
      } catch (e) {
        console.error("[PixelHero] Error al recuperar promociones:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounted();
  }, []);

  /**
   * RN - Orquestación de Navegación: Gestiona la transición entre diapositivas (Slides).
   * Implementa un debounce manual mediante estado de transicionamiento.
   */
  const navigate = useCallback((direction: number) => {
    if (games.length === 0 || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(prev => (prev + direction + games.length) % games.length);
      setTransitioning(false);
    }, 300);
  }, [games.length, transitioning]);

  /**
   * Autoplay: Implementa rotación automática de contenido cada 6 segundos.
   */
  useEffect(() => {
    if (games.length <= 1) return;
    const interval = setInterval(() => navigate(1), 6000);
    return () => clearInterval(interval);
  }, [games.length, navigate]);

  // Estado de Carga (Skeleton)
  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-background py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[300px]">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <Percent className="h-12 w-12 text-primary/40 animate-spin" />
            <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs">Cargando ofertas...</p>
          </div>
        </div>
      </section>
    );
  }

  // Estado Vacío: Fallback arquitectónico si no hay campañas activas.
  if (games.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-background py-12 md:py-24 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background z-0" />
        <div className="container relative z-10 mx-auto px-4 text-center space-y-4">
          <h2 className="font-headline text-3xl md:text-4xl font-semibold text-primary uppercase">Sin Campañas Activas</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">Vuelva en breve para acceder a los beneficios técnicos exclusivos.</p>
          <Button variant="outline" size="lg" asChild className="border-primary/20 text-primary hover:bg-primary/10">
            <Link href="/productos">Explorar Catálogo General <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    );
  }

  const game = games[current];
  const imageUrl = (game.imageId && (game.imageId.startsWith('http') || game.imageId.startsWith('/')))
    ? game.imageId : DEFAULT_IMAGE;

  const hasDiscount = (game.discountPercentage ?? 0) > 0 && (game.finalPrice ?? 0) < game.price;

  return (
    <section className="relative w-full overflow-hidden bg-background py-8 md:py-12 lg:py-16">
      
      {/* Layer - Fondo Estructural: Grid decorativo de baja fidelidad. */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background z-0" />

      <div className="container relative z-10 mx-auto px-4">
        
        {/* Cabecera de Sección (Branding de Ofertas) */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
            <Zap className="h-4 w-4 text-primary fill-current" />
            <span className="text-sm font-semibold text-primary tracking-widest uppercase font-mono">Ofertas Especiales</span>
          </div>
          {games.length > 1 && (
            <span className="text-xs text-muted-foreground font-mono px-3 py-1 bg-white/5 rounded-full border border-white/5">{current + 1} / {games.length}</span>
          )}
        </div>

        <div className={cn(
          "grid gap-6 lg:grid-cols-2 lg:gap-10 items-center transition-all duration-300 min-h-[540px] lg:min-h-[620px]",
          transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        )}>

          {/* Columna: Atributos y Contingencia Publicitaria */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {hasDiscount && (
                <Badge className="bg-destructive text-white font-bold text-sm px-3 py-1 animate-pulse shadow-lg">
                  -{game.discountPercentage}% OFF
                </Badge>
              )}
              <Badge variant="secondary" className="text-primary font-mono uppercase tracking-widest border-primary/20 bg-primary/5">
                {game.platform?.name || 'Multiplataforma'}
              </Badge>
              <Badge variant="secondary" className="text-primary font-mono uppercase tracking-widest border-primary/20 bg-primary/5">
                {game.genre?.name || 'General'}
              </Badge>
            </div>

            <div className="space-y-3">
              <h1 className="font-headline text-4xl font-semibold tracking-tighter sm:text-5xl md:text-6xl text-white drop-shadow-xl leading-tight uppercase min-h-[2.4em] max-h-[2.4em] overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                {game.name}
              </h1>
              <p className="max-w-[600px] text-muted-foreground text-sm md:text-lg font-body leading-relaxed min-h-[4.8em] max-h-[4.8em] overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]">
                {game.description}
              </p>
            </div>

            {/* RN - Desglose de Costes: Visualización clara del beneficio económico. */}
            <div className="flex items-end gap-3 py-2">
              {hasDiscount && (
                <span className="text-xl md:text-2xl text-muted-foreground line-through decoration-destructive/60 opacity-50 font-medium">
                  {formatCurrency(game.price)}
                </span>
              )}
              <span className={cn(
                "text-4xl md:text-5xl font-bold tracking-tight",
                hasDiscount ? "text-primary" : "text-white"
              )}>
                {formatCurrency(game.finalPrice ?? game.price)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-black font-bold text-lg h-14 px-8 shadow-2xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => addToCart(game)}
                disabled={game.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-6 w-6" />
                {game.stock > 0 ? "COMPRAR AHORA" : "AGOTADO"}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 border-white/10 hover:bg-white/5 text-white font-semibold transition-all"
                asChild
              >
                <Link href={`/productos/${game.id}`}>
                  VER DETALLES <ArrowRight className="ml-2 h-5 w-5 opacity-50" />
                </Link>
              </Button>
            </div>

            {/* Navegación del Carrusel (UX: Control Manual) */}
            {games.length > 1 && (
              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-3 rounded-full border border-white/5 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all group"
                  aria-label="Anterior diapositiva"
                >
                  <ChevronLeft className="h-4 w-4 text-white group-hover:text-primary" />
                </button>

                <div className="flex gap-2">
                  {games.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (i !== current) {
                          setTransitioning(true);
                          setTimeout(() => { setCurrent(i); setTransitioning(false); }, 300);
                        }
                      }}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        i === current ? "w-10 bg-primary" : "w-1.5 bg-white/20 hover:bg-white/40"
                      )}
                      aria-label={`Navegar a oferta ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => navigate(1)}
                  className="p-3 rounded-full border border-white/5 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all group"
                  aria-label="Siguiente diapositiva"
                >
                  <ChevronRight className="h-4 w-4 text-white group-hover:text-primary" />
                </button>
              </div>
            )}
          </div>

          {/* Columna: Composición Visual (Box Art Inmersivo) */}
          <div className="relative group animate-in zoom-in-95 duration-1000 fade-in delay-200 lg:block hidden">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-[2rem] blur-3xl opacity-30 group-hover:opacity-60 transition duration-1000" />

            <Link href={`/productos/${game.id}`}>
              <Card className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 shadow-3xl transition-all duration-700 group-hover:scale-[1.02] cursor-pointer">
                <div className="relative aspect-[16/10] overflow-hidden">
                  
                  {/* Layer - Fondo Atmosférico (Ambience Blur) */}
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    className="object-cover scale-125 blur-3xl opacity-30 group-hover:scale-150 transition-transform duration-1000"
                    aria-hidden="true"
                  />

                  {/* Asset Principal (Vertical Center) */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="relative h-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20 transform rotate-1 group-hover:rotate-0 transition-transform duration-700">
                      <Image
                        src={imageUrl}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        priority
                        sizes="(max-width: 1200px) 400px, 600px"
                      />
                    </div>
                  </div>

                  {/* Overlay Informativo de Interacción */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <div className="flex items-center gap-3 text-white font-mono bg-primary/20 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30">
                      <Zap className="h-4 w-4 text-primary fill-current" />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase">Oferta Vigente</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
