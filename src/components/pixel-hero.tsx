"use client";

/**
 * Capa de Interfaz: Hero Interactivo de Promociones (Pixel Hero)
 * --------------------------------------------------------------------------
 * Orquesta un carrusel asíncrono consumiendo el motor de promociones.
 * VISTA PURA (View): Cero lógica de negocio. Depende enteramente de
 * useHeroViewModel para la inyección de estado y comandos de navegación.
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Zap, ArrowRight, ChevronLeft, ChevronRight, Percent } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency, cn } from '@/lib/utils';
// ✅ Inyección de Dependencia del ViewModel (Arquitectura MVC/OOP)
import { useHeroViewModel } from '@/hooks/use-hero-view-model';

export const PixelHero = () => {
  const { addToCart } = useCart();
  const {
    games,
    currentGame: game,
    loading,
    transitioning,
    current,
    navigate,
    selectDot,
    isDataEmpty,
    hasMultipleGames,
    currentImageUrl: imageUrl,
    hasDiscount
  } = useHeroViewModel();

  // Estado de Carga Abstracto (Skeleton)
  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-background py-16 md:py-24 lg:py-32 flex justify-center items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background z-0" />
        <div className="animate-pulse flex flex-col items-center gap-6 relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center animate-spin-slow shadow-[0_0_40px_-10px_var(--tw-shadow-color)] shadow-primary/30">
            <Percent className="h-8 w-8 text-primary/60" />
          </div>
          <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm font-semibold">Iniciando Motor de Promociones...</p>
        </div>
      </section>
    );
  }

  // Estado Fallback (Catálogo Vacío)
  if (isDataEmpty || !game) {
    return (
      <section className="relative w-full overflow-hidden bg-background py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }}
        />
        <div className="container relative z-10 mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
             <Zap className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">Esperando Próximas Campañas</h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">Actualizamos nuestro catálogo de ofertas regularmente. Vuelve pronto para descubrir beneficios tácticos o explora la armería completa.</p>
          <div className="pt-4">
              <Button variant="outline" size="lg" asChild className="px-8">
                <Link href="/productos">Ir al Inventario Global <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
          </div>
        </div>
      </section>
    );
  }

  // 🎨 Mejora Visual aidesigner: Viñeteado profundo, brillos y layout Premium
  return (
    <section className="relative w-full overflow-hidden bg-background py-12 md:py-16 lg:py-24 border-b border-white/5">
      
      {/* Background Ambiental: Mezcla de Grid Holográfico + Radial Gradient Focus */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-60" />
          <div className="absolute bg-gradient-to-t from-background via-transparent to-transparent bottom-0 left-0 right-0 h-40 z-10" />
      </div>

      <div className="container relative z-20 mx-auto px-4 md:px-6">
        


        {/* Layout Split: Metadatos vs Atmosférico */}
        <div className={cn(
          "grid lg:grid-cols-12 gap-8 lg:gap-16 items-center transition-all duration-500 min-h-[500px]",
          transitioning ? "opacity-0 translate-x-4 blur-sm" : "opacity-100 translate-x-0 blur-0"
        )}>

          {/* Col 1: Textos y Control Operativo (7 columnas) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex flex-wrap gap-3">
              {hasDiscount && (
                <Badge className="bg-green-500/10 hover:bg-green-500/20 text-white/70 border-green-500/20 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)] backdrop-blur-md font-black text-sm px-4 py-1.5 uppercase tracking-wider rounded-md">
                   DESCUENTO: -{game.discountPercentage}% OFF
                </Badge>
              )}
              <Badge variant="outline" className="text-white/70 border-white/20 bg-white/5 backdrop-blur-md font-mono uppercase tracking-widest py-1.5 rounded-md hover:bg-white/10 transition-colors">
                {game.platform?.name || 'Multi'}
              </Badge>
              <Badge variant="outline" className="text-white/70 border-white/20 bg-white/5 backdrop-blur-md font-mono uppercase tracking-widest py-1.5 rounded-md hover:bg-white/10 transition-colors">
                {game.genre?.name || 'General'}
              </Badge>
            </div>

            {/* Solución de Layout Arquitectónico: El contenedor grid mantiene la altura innegociable
                reservada mediante un elemento fantasma, mientras que el contenido real fluye orgánicamente
                con 'self-start', eliminando el hueco entre título y descripción de forma dinámica. */}
            <div className="grid">
              <div className="col-start-1 row-start-1 invisible pointer-events-none select-none flex flex-col gap-4" aria-hidden="true">
                <div className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] leading-[0.95] h-[1.9em]"></div>
                <div className="text-base md:text-lg lg:text-xl leading-relaxed h-[4.5em]"></div>
              </div>
              <div className="col-start-1 row-start-1 flex flex-col gap-4 self-start">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-black tracking-tight text-white uppercase leading-[0.95] max-h-[1.9em] overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] custom-text-shadow">
                  {game.name}
                </h1>
                <p className="max-w-[85%] text-white/60 text-base md:text-lg lg:text-xl font-medium leading-relaxed max-h-[4.5em] overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]">
                  {game.description}
                </p>
              </div>
            </div>

            {/* Display de Precio Impactante */}
            <div className="flex items-end gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm max-w-sm">
                <div className="flex flex-col">
                  {hasDiscount && (
                    <span className="text-lg md:text-xl text-white line-through decoration-red-500 decoration-2 font-mono opacity-60">
                      {formatCurrency(game.price)}
                    </span>
                  )}
                  <span className={cn(
                    "text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.95] custom-text-shadow",
                    hasDiscount ? "text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]" : "text-white"
                  )}>
                    {formatCurrency(game.finalPrice ?? game.price)}
                  </span>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Button
                size="lg"
                className="w-full sm:w-auto sm:w-64"
                onClick={() => addToCart(game)}
                disabled={game.stock <= 0}
              >
                {game.stock > 0 ? (
                    <>
                    <ShoppingCart className="mr-2 h-4 w-4" /> <span>AÑADIR AL CARRITO</span>
                    </>
                ) : (
                    "SIN STOCK"
                )}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto px-8"
                asChild
              >
                <Link href={`/productos/${game.id}`}>
                  VER DETALLES <ArrowRight className="ml-2 h-4 w-4 opacity-70" />
                </Link>
              </Button>
            </div>

            {/* Slider Controls Modernos */}
            {hasMultipleGames && (
              <div className="flex items-center gap-4 pt-6 mt-6 border-t border-white/10 inline-flex">
                <button
                  onClick={() => navigate(-1)}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-primary/20 hover:border-primary/50 text-white/70 hover:text-primary transition-all group"
                  aria-label="Atras"
                >
                  <ChevronLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="flex gap-2">
                  {games.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => selectDot(i)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-500",
                        i === current ? "w-12 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" : "w-2 bg-white/20 hover:bg-white/50 cursor-pointer"
                      )}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => navigate(1)}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-primary/20 hover:border-primary/50 text-white/70 hover:text-primary transition-all group"
                  aria-label="Adelante"
                >
                  <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* Col 2: Arte Inmersivo (5 columnas) - Renderizado Solo en Desktop/Tablet */}
          <div className="lg:col-span-5 relative hidden lg:block group perspective-[1000px]">
             {/* Glow Trasero Constante */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-1000" />
             
             {/* Marco 3D */}
             <div className="relative transform-gpu transition-all duration-700 hover:rotate-y-[-5deg] hover:rotate-x-[5deg] hover:scale-[1.02]">
                <Link href={`/productos/${game.id}`} className="block">
                    <Card className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl">
                        {/* Img Blur para textura de fondo interna */}
                        <Image src={imageUrl} alt="" fill className="object-cover opacity-30 blur-2xl scale-125" />
                        
                        {/* Img Principal Clean */}
                        <Image
                            src={imageUrl}
                            alt={game.name}
                            fill
                            className="object-cover z-10 transition-transform duration-1000 group-hover:scale-110"
                            priority
                            sizes="(max-width: 1200px) 50vw, 33vw"
                        />

                        {/* Overlay Gradiente Inferior para Branding */}
                        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                        
                        <div className="absolute bottom-0 left-0 w-full p-8 z-30 flex justify-between items-end transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                             <div>
                                <h3 className="text-2xl font-black text-white uppercase">{game.name}</h3>
                                <p className="text-primary font-mono text-sm tracking-widest uppercase">Conocé más</p>
                             </div>
                             <div className="bg-primary/20 w-12 h-12 rounded-full border border-primary/50 flex items-center justify-center backdrop-blur-md">
                                 <ArrowRight className="text-primary w-5 h-5 -rotate-45" />
                             </div>
                        </div>
                    </Card>
                </Link>
             </div>
          </div>
          
        </div>
      </div>
      
      {/* Definición extra de CSS en JSX para sombras personalizadas no-Tailwind nativas si aplica */}
      <style jsx>{`
        .custom-text-shadow {
          text-shadow: 0 4px 30px rgba(0, 0, 0, 0.8), 0 2px 5px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </section>
  );
};
