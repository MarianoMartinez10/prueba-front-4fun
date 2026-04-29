"use client";

/**
 * Capa de Lógica Reutilizable: Orquestador de Catálogo (Game Catalog Hook)
 * --------------------------------------------------------------------------
 * Gestiona el estado reactivo de la búsqueda, filtrado y paginación de juegos.
 * Implementa la sincronización bidireccional entre el estado local y los 
 * parámetros de la URL (Query Params) para mejorar el SEO y la navegabilidad.
 * (MVC / Hook)
 */

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductApiService } from "@/lib/services/ProductApiService";
import { TaxonomyApiService } from "@/lib/services/TaxonomyApiService";
import type { Game } from "@/lib/types";

const FALLBACK_MAX_PRICE_ARS = 250000;

const normalizeMaxPrice = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return FALLBACK_MAX_PRICE_ARS;
    return Math.max(100, Math.ceil(value / 100) * 100);
};

export function useGameCatalog(initialGames: Game[], initialTotalPages = 1) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Hidratación inicial desde URL para soportar compartir enlaces y "Atrás" del navegador.
    const initialSearch = searchParams.get("search") || "";
    const initialPlatform = searchParams.get("platform");
    const initialGenre = searchParams.get("genre");
    const initialMaxPrice = normalizeMaxPrice(
        Math.max(0, ...(initialGames || []).map((game) => Number(game.price) || 0))
    );

    const [games, setGames] = useState<Game[]>(initialGames || []);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [page, setPage] = useState(1);

    // Estados de filtrado multidimensional
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
        initialPlatform ? initialPlatform.split(",").filter(Boolean) : []
    );
    const [selectedGenres, setSelectedGenres] = useState<string[]>(
        initialGenre ? initialGenre.split(",").filter(Boolean) : []
    );
    const [maxPriceCap, setMaxPriceCap] = useState(initialMaxPrice);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, initialMaxPrice]);

    // Estados de metadatos (Taxonomías)
    const [platforms, setPlatforms] = useState<any[]>([]);
    const [genres, setGenres] = useState<any[]>([]);
    const isFirstRender = useRef(true);

    /**
     * Carga de catálogos auxiliares (Filtros).
     * Mantenibilidad: Recupera plataformas y géneros dinámicamente desde el motor de metadatos.
     */
    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [pData, gData, maxPriceResponse] = await Promise.all([
                    TaxonomyApiService.getPlatforms(),
                    TaxonomyApiService.getGenres(),
                    ProductApiService.getAll({ page: 1, limit: 1, sort: "-price" }),
                ]);

                const highestPrice = Number(maxPriceResponse.products?.[0]?.getRawData().price) || 0;
                const normalizedMaxPrice = normalizeMaxPrice(highestPrice);

                setPlatforms(Array.isArray(pData) ? pData : pData?.data || []);
                setGenres(Array.isArray(gData) ? gData : gData?.data || []);
                setMaxPriceCap(normalizedMaxPrice);
                setPriceRange([0, normalizedMaxPrice]);
            } catch (e) {
                console.error("[useGameCatalog] Error al cargar glosarios:", e);
            }
        };
        loadFilters();
    }, []);

    /**
     * RN - Motor de Búsqueda Reactivo: Ejecuta peticiones al backend con Debounce.
     * Evita la saturación del servidor (API Flooding) mediante un retraso de 300ms.
     */
    useEffect(() => {
        const fetchFilteredGames = async () => {
            setLoading(true);
            try {
                const { products, meta } = await ProductApiService.getAll({
                    page,
                    limit: 12,
                    search: searchQuery,
                    platform: selectedPlatforms.length > 0 ? selectedPlatforms.join(",") : undefined,
                    genre: selectedGenres.length > 0 ? selectedGenres.join(",") : undefined,
                    sort: "order",
                    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
                    maxPrice: priceRange[1] < maxPriceCap ? priceRange[1] : undefined,
                });

                setGames(products.map(p => p.getRawData()) as any as Game[]);
                setTotalPages(meta?.totalPages || 1);
            } catch (error) {
                console.error("[useGameCatalog] Error en consulta filtrada:", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            // Saltamos la ejecución en el primer render para usar los datos del Server Side (Next.js Optimization).
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            fetchFilteredGames();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, page, selectedPlatforms, selectedGenres, priceRange, maxPriceCap]);

    /**
     * RN - UX (URL Sync): Sincroniza el estado visual con la barra de direcciones.
     * Permite que el usuario refresque la página sin perder sus filtros aplicados.
     */
    useEffect(() => {
        if (isFirstRender.current) return;
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (selectedPlatforms.length > 0) params.set("platform", selectedPlatforms.join(","));
        if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));

        const query = params.toString();
        router.push(query ? `/productos?${query}` : "/productos", { scroll: false });
    }, [searchQuery, selectedPlatforms, selectedGenres, router]);

    return {
        games, loading, page, setPage, totalPages,
        searchQuery, setSearchQuery, selectedPlatforms, setSelectedPlatforms,
        selectedGenres, setSelectedGenres, priceRange, setPriceRange,
        platforms, genres, maxPriceCap,
        resetFilters: () => {
            setSearchQuery("");
            setSelectedPlatforms([]);
            setSelectedGenres([]);
            setPriceRange([0, maxPriceCap]);
            setPage(1);
        }
    };
}
