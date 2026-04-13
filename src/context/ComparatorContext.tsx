"use client";

/**
 * Capa de Estado: Orquestador de Comparativa (Comparator Context)
 * --------------------------------------------------------------------------
 * Gestiona la lógica de análisis comparativo entre productos.
 * Permite al usuario contrastar especificaciones técnicas de hasta 4 ítems.
 * Utiliza LocalStorage para la persistencia de la sesión de análisis. (Context)
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Game } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ComparatorContextType {
    compareList: Game[];
    addToCompare: (game: Game) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
    isInCompare: (id: string) => boolean;
}

const ComparatorContext = createContext<ComparatorContextType | undefined>(undefined);

export function ComparatorProvider({ children }: { children: React.ReactNode }) {
    const [compareList, setCompareList] = useState<Game[]>([]);
    const { toast } = useToast();

    /**
     * RN - Persistencia de Interés: Hidratación del estado desde LocalStorage.
     * Garantiza que el usuario no pierda su selección al recargar la página.
     */
    useEffect(() => {
        const saved = localStorage.getItem("compareList");
        if (saved) {
            try {
                setCompareList(JSON.parse(saved));
            } catch (e) {
                console.error("[ComparatorContext] Error en hidratación:", e);
            }
        }
    }, []);

    /**
     * RN - Sincronización: Persiste cada mutación del comparador en el almacenamiento local.
     */
    useEffect(() => {
        localStorage.setItem("compareList", JSON.stringify(compareList));
    }, [compareList]);

    /**
     * RN - Control de Selección: Añade un producto a la lista de análisis.
     * Implementa validaciones de redundancia y límites de hardware visual.
     * 
     * @param {Game} game - Entidad a comparar.
     */
    const addToCompare = (game: Game) => {
        // Valida duplicidad en la lista.
        if (compareList.find((i) => i.id === game.id)) {
            toast({ title: "Acción Redundante", description: "El producto ya se encuentra en el comparador." });
            return;
        }

        // RN - Capacidad Máxima: Limita a 4 el número de columnas comparables (UX Best Practice).
        if (compareList.length >= 4) {
            toast({ variant: "destructive", title: "Límite Técnico", description: "El sistema permite comparar un máximo de 4 productos simultáneamente." });
            return;
        }

        setCompareList((prev) => [...prev, game]);
        toast({ title: "Producto Añadido", description: `${game.name} listo para comparar.` });
    };

    /**
     * Remueve un elemento específico del análisis.
     */
    const removeFromCompare = (id: string) => {
        setCompareList((prev) => prev.filter((i) => i.id !== id));
    };

    /**
     * Limpieza total del estado comparativo.
     */
    const clearCompare = () => {
        setCompareList([]);
    };

    /**
     * Utilidad de consulta de estado.
     */
    const isInCompare = (id: string) => {
        return compareList.some((i) => i.id === id);
    };

    return (
        <ComparatorContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
            {children}
        </ComparatorContext.Provider>
    );
}

/**
 * Hook de consumidor del Comparador.
 */
export function useComparator() {
    const context = useContext(ComparatorContext);
    if (context === undefined) {
        throw new Error("useComparator debe invocarse dentro de un ComparatorProvider");
    }
    return context;
}
