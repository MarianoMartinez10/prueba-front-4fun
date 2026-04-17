"use client";

/**
 * Capa de Interfaz: Bóveda de Intenciones y Favoritos (Wishlist Page)
 * --------------------------------------------------------------------------
 * Orquesta la visualización persistente de los activos marcados por el usuario
 * para adquisición diferida. 
 * Responsabilidades:
 * 1. Persistencia de Deseos: Sincroniza el estado local del WishlistContext.
 * 2. Visualización Dinámica: Renderiza la rejilla de activos con soporte responsivo.
 * 3. Gestión de Vacuidad: Implementa flujos de navegación para incentivar el retorno al catálogo.
 * (MVC / View)
 */

import { useWishlist } from "@/context/WishlistContext";
import { GameCard } from "@/components/game/game-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16 md:py-24 animate-in fade-in duration-1000">
      
      {/* Cabecera Técnica de Bóveda */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-white/5 pb-8">
        <div className="space-y-1">
            <h1 className="font-headline text-4xl font-bold text-white flex items-center gap-4 tracking-tighter">
                <Heart className="h-10 w-10 text-destructive animate-pulse fill-destructive/20" />
              Mis favoritos
            </h1>

        </div>
        {wishlist.length > 0 && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Lista sincronizada</span>
            </div>
        )}
      </div>
      
      {/* RN - Gestión de Resultados: Matriz de Activos Deseados */}
      {wishlist.length === 0 ? (
        <div className="text-center py-24 bg-card/10 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-white/5 animate-in zoom-in-95 duration-700">
          <div className="h-24 w-24 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-muted-foreground opacity-20" />
          </div>
          <h2 className="font-headline text-3xl font-bold text-white tracking-tight">Tu lista esta vacia</h2>
          <p className="mt-4 text-muted-foreground max-w-sm mx-auto leading-relaxed text-sm font-medium">
            Guarda tus juegos favoritos para encontrarlos rapido. Explora el catalogo y agregalos con un clic.
          </p>
          <Button asChild variant="outline" className="mt-10 h-14 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] bg-white/5 text-white hover:bg-primary hover:text-black border border-white/10 hover:border-primary transition-all duration-500 shadow-xl hover:shadow-primary/20">
            <Link href="/productos">Explorar el Catálogo <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      ) : (
        <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
        >
          {wishlist.map((game) => (
            <motion.div 
                key={game.id}
                variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
                }}
            >
                <GameCard game={game} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Footer Galería */}
      {wishlist.length > 0 && (
        <div className="mt-16 text-center">
            <Link href="/productos" className="inline-flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] hover:text-white transition-all group">
                <ShoppingBag className="h-4 w-4 group-hover:-translate-y-1 transition-transform" /> Seguir explorando juegos
            </Link>
        </div>
      )}
    </div>
  );
}