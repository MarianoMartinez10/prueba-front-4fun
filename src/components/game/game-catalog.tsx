"use client";

/**
 * Capa de Interfaz: Catálogo Maestros de Activos (Game Catalog)
 * --------------------------------------------------------------------------
 * Orquesta la experiencia de exploración principal del ecosistema. 
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
    priceRange, setPriceRange, platforms, genres, resetFilters
  } = useGameCatalog(initialGames, initialTotalPages);

  return (
    <section className="py-12 md:py-16 animate-in fade-in duration-700">
      <div className="flex flex-col gap-10">
        
        {/* Cabecera del Módulo */}
        <div className="space-y-2">
            <h2 className="font-headline text-4xl font-bold md:text-5xl text-white tracking-tight">Catálogo de Activos</h2>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-black opacity-80 pl-1 border-l-4 border-primary/40">Exploración de Ecosistemas y Licencias Digitales</p>
        </div>

        {/* Arquitectura de Layout: Control Lateral e Ingesta de Datos */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* RN - UX Adaptativa: Implementación de Drawer para filtros en dispositivos móviles. */}
          <div className="lg:hidden w-full flex flex-col gap-4">
            <div className="relative group flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Localizar título comercial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 bg-card/40 border-white/10 rounded-xl pl-12 text-white placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-12 border-primary/30 text-primary hover:bg-primary/10 transition-all font-black uppercase tracking-widest text-[10px]">
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Configuración de Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[500px] overflow-y-auto bg-card/95 backdrop-blur-2xl border-white/5 custom-scrollbar">
                <SheetHeader className="mb-8">
                  <SheetTitle className="font-headline text-3xl font-bold text-white uppercase tracking-tighter">Parámetros Técnicos</SheetTitle>
                  <SheetDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Personalización del Entorno de Búsqueda</SheetDescription>
                </SheetHeader>
                <CatalogSidebar
                  platforms={platforms}
                  genres={genres}
                  selectedPlatforms={selectedPlatforms}
                  setSelectedPlatforms={setSelectedPlatforms}
                  selectedGenres={selectedGenres}
                  setSelectedGenres={setSelectedGenres}
                  priceRange={priceRange}
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
                  setPriceRange={setPriceRange}
                  onClear={resetFilters}
                />
            </div>
          </aside>

          {/* Layer - Grid de Activos (Sincronización Dinámica) */}
          <div className="flex-1 min-h-[600px] w-full">
            {loading ? (
              <div className="h-[500px] flex flex-col items-center justify-center opacity-50 bg-card/5 rounded-3xl border-2 border-dashed border-white/5">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Recuperando registros del catálogo...</p>
              </div>
            ) : games.length > 0 ? (
              <div className="space-y-16">
                {/* RN - Animación de Entrada: Implementación de Stagger Effect para suavidad visual. */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                  }}
                >
                  {games.map((game) => (
                    <motion.div
                      key={game.id}
                      variants={{
                        hidden: { opacity: 0, scale: 0.95, y: 30 },
                        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
                      }}
                    >
                      <GameCard game={game} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* RN - Control de Navegación (Paginación Operativa) */}
                <div className="flex justify-center items-center gap-6 pt-12 border-t border-white/5">
                  <Button
                    variant="outline"
                    className="h-12 w-12 rounded-2xl border-white/10 hover:bg-primary hover:text-black hover:border-primary transition-all shadow-xl disabled:opacity-20"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-1">Página</span>
                      <span className="text-2xl font-black text-primary tracking-tighter">{page} / {totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    className="h-12 w-12 rounded-2xl border-white/10 hover:bg-primary hover:text-black hover:border-primary transition-all shadow-xl disabled:opacity-20"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              {/* RN - Gestión de Búsqueda Fallida: Estado para ausencia de coincidencias. */}
              <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 bg-card/20 rounded-3xl border-2 border-dashed border-white/5 animate-in zoom-in-95 duration-500">
                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Search className="h-10 w-10 text-muted-foreground opacity-20" />
                </div>
                <h3 className="font-headline text-3xl font-bold text-white uppercase tracking-tight">Sin Coincidencias</h3>
                <p className="text-muted-foreground mt-3 max-w-sm leading-relaxed text-sm font-medium">No se hallaron registros que operen bajo los criterios técnicos y financieros aplicados al filtro.</p>
                <Button onClick={resetFilters} variant="outline" className="mt-8 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-full hover:bg-primary hover:text-black transition-all">
                  Restablecer Parámetros Maestros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
