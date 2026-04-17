"use client";

/**
 * Capa de Interfaz: Catálogo de Productos
 * --------------------------------------------------------------------------
 * Orquesta la experiencia de exploración principal de la tienda. 
 * Gestiona la sincronización asíncrona de filtros dinámicos, la disposición 
 * adaptativa de la rejilla de productos (Grid) y el motor de paginación. 
 * Implementa micro-interacciones mediante Framer Motion para optimizar el 
 * Perceive Performance. (MVC / View)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { GameCard } from './game-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronLeft, ChevronRight, SlidersHorizontal, Search } from 'lucide-react';
import type { Game } from '@/lib/types';
import { CatalogSidebar } from './catalog-sidebar';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useGameCatalog } from '@/hooks/use-game-catalog';
import { cn } from '@/lib/utils';

interface GameCatalogProps {
  initialGames: Game[];
  initialTotalPages?: number;
}

export function GameCatalog({ initialGames, initialTotalPages = 1 }: GameCatalogProps) {
  /**
   * RN - Orquestación de Estado: Delegación de la lógica de red y filtrado 
   * en el hook especializado `useGameCatalog` (MVVM).
   */
  const {
    games, loading, page, setPage, totalPages,
    searchQuery, setSearchQuery, selectedPlatforms,
    setSelectedPlatforms, selectedGenres, setSelectedGenres,
    priceRange, setPriceRange, platforms, genres, maxPriceCap, resetFilters
  } = useGameCatalog(initialGames, initialTotalPages);

  return (
    <section className="py-12 md:py-16 animate-in fade-in duration-700">
      <div className="flex flex-col gap-10">
        
        {/* Arquitectura de Layout: Control Lateral e Ingesta de Datos */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* RN - UX Adaptativa: Implementación de Drawer para filtros en dispositivos móviles. */}
          <div className="lg:hidden w-full flex flex-col gap-4">
            <div className="relative group flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Buscá tu próximo juego..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 bg-card/40 border-white/10 rounded-xl pl-12 text-white placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-12 border-primary/30 text-primary hover:bg-primary/10 transition-all font-bold uppercase tracking-widest text-[10px]">
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Configurar Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[500px] overflow-y-auto bg-card/95 backdrop-blur-2xl border-white/5 custom-scrollbar">
                <SheetHeader className="mb-8">
                  <SheetTitle className="font-headline text-3xl font-bold text-white uppercase tracking-tighter">Filtros Avanzados</SheetTitle>
                  <SheetDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Personalización de la Búsqueda</SheetDescription>
                </SheetHeader>
                <CatalogSidebar
                  platforms={platforms}
                  genres={genres}
                  selectedPlatforms={selectedPlatforms}
                  setSelectedPlatforms={setSelectedPlatforms}
                  selectedGenres={selectedGenres}
                  setSelectedGenres={setSelectedGenres}
                  priceRange={priceRange}
                  maxPriceCap={maxPriceCap}
                  setPriceRange={setPriceRange}
                  onClear={resetFilters}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Layer - Sidebar Estacionaria (Desktop): Control persistente. */}
          <aside className="hidden lg:block w-[300px] shrink-0 sticky top-28 space-y-8">
            <div className="relative group">
              <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Filtrar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 bg-card/40 border-white/10 rounded-2xl pl-12 shadow-xl focus:ring-2 focus:ring-primary/40 transition-all text-white font-medium"
              />
            </div>
            <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-3xl">
                <CatalogSidebar
                  platforms={platforms}
                  genres={genres}
                  selectedPlatforms={selectedPlatforms}
                  setSelectedPlatforms={setSelectedPlatforms}
                  selectedGenres={selectedGenres}
                  setSelectedGenres={setSelectedGenres}
                  priceRange={priceRange}
                  maxPriceCap={maxPriceCap}
                  setPriceRange={setPriceRange}
                  onClear={resetFilters}
                />
            </div>
          </aside>

          {/* Layer - Grid de Productos (Sincronización Dinámica) */}
          <div className="flex-1 min-h-[600px] w-full">
            {loading ? (
              <div className="h-[500px] flex flex-col items-center justify-center opacity-50 bg-card/5 rounded-3xl border-2 border-dashed border-white/5">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Cargando catálogo...</p>
              </div>
            ) : games.length > 0 ? (
              <div className="space-y-16">
                {/* RN - Animación de Entrada: Implementación de Stagger Effect para suavidad visual. */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
                  }}
                >
                  {games.map((game, idx) => (
                    <motion.div
                      key={game.id}
                      variants={{
                        hidden: { opacity: 0, scale: 0.92, y: 40 },
                        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: idx * 0.05 } }
                      }}
                    >
                      <GameCard game={game} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* RN - Control de Navegación (Paginación Operativa) */}
                <div className="flex justify-center items-center gap-6 pt-12 border-t border-white/10">
                  <Button
                    variant="outline"
                    className="h-11 w-11 rounded-lg border-white/15 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex flex-col items-center gap-1 px-6 py-2 bg-white/5 border border-white/10 rounded-lg">
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest">Página</span>
                      <span className="text-xl font-bold text-primary tracking-tighter">{page}/{totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    className="h-11 w-11 rounded-lg border-white/15 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    aria-label="Página siguiente"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 bg-card/10 rounded-2xl border-2 border-dashed border-white/10 animate-in zoom-in-95 duration-500">
                {/* RN - Gestión de Búsqueda Fallida: Estado vacío para ausencia de coincidencias. */}
                <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <Search className="h-10 w-10 text-muted-foreground opacity-40" />
                </div>
                <h3 className="font-headline text-2xl font-bold text-white uppercase tracking-tight">No encontramos nada</h3>
                <p className="text-muted-foreground mt-3 max-w-sm leading-relaxed text-xs font-medium opacity-80">No encontramos juegos con esos filtros. ¡Probá con otros!</p>
                <Button onClick={resetFilters} variant="outline" className="mt-8 border-primary/30 text-primary font-bold uppercase tracking-widest text-[9px] h-11 px-6 rounded-lg hover:bg-primary hover:text-black hover:border-primary transition-all duration-300">
                  Restablecer Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
