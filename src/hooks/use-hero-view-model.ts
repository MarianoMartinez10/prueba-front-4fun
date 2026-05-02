import { useState, useEffect, useCallback } from 'react';
import { ProductApiService } from '@/lib/services/ProductApiService';
import type { Product } from '@/lib/schemas';

// Constante de imagen genérica si falta la del servidor
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export function useHeroViewModel() {
  const [games, setGames] = useState<Product[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  // Carga de la lista de promociones
  useEffect(() => {
    const fetchDiscounted = async () => {
      try {
        const { products } = await ProductApiService.getAll({ discounted: true, page: 1, limit: 200, sort: 'order' });
        // Validación rigurosa de márgenes y descuentos
        const withRealDiscount = products
          .map(p => p.getRawData())
          .filter(
            (p: any) => (p.discountPercentage ?? 0) > 0 && (p.finalPrice ?? 0) < p.price
          );
        if (withRealDiscount.length > 0) {
          setGames(withRealDiscount as Product[]);
        }
      } catch (e) {
        console.error("[useHeroViewModel] Error al recuperar promociones:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounted();
  }, []);

  // Funciones de navegación (encapsuladas)
  const navigate = useCallback((direction: number) => {
    if (games.length === 0 || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + direction + games.length) % games.length);
      setTransitioning(false);
    }, 400); // Llevando a 400ms para match visual con CSS Fade
  }, [games.length, transitioning]);

  const selectDot = useCallback((index: number) => {
      if (index !== current && !transitioning) {
        setTransitioning(true);
        setTimeout(() => { 
            setCurrent(index); 
            setTransitioning(false); 
        }, 400);
      }
  }, [current, transitioning]);

  // Autoplay
  useEffect(() => {
    if (games.length <= 1) return;
    const interval = setInterval(() => navigate(1), 6000); // 6 segundos intacto a pedido del usuario
    return () => clearInterval(interval);
  }, [games.length, navigate]);

  // Variables derivadas calculadas en el ViewModel (evitando ensuciar la Vista)
  const currentGame = games[current];
  const hasMultipleGames = games.length > 1;
  const isDataEmpty = games.length === 0;

  // Calculos puros listos para la ui
  const currentImageUrl = currentGame 
    ? ((currentGame.imageId && (currentGame.imageId.startsWith('http') || currentGame.imageId.startsWith('/'))) 
        ? currentGame.imageId 
        : DEFAULT_IMAGE)
    : "";
    
  const hasDiscount = currentGame 
    ? ((currentGame.discountPercentage ?? 0) > 0 && (currentGame.finalPrice ?? 0) < currentGame.price) 
    : false;

  return {
    games,
    currentGame,
    loading,
    transitioning,
    current,
    navigate,
    selectDot,
    isDataEmpty,
    hasMultipleGames,
    currentImageUrl,
    hasDiscount,
    DEFAULT_IMAGE
  };
}
