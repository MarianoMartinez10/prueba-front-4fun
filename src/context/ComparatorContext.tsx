"use client";

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

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("compareList");
        if (saved) {
            try {
                setCompareList(JSON.parse(saved));
            } catch (e) {
                console.error("Error loading compare list", e);
            }
        }
    }, []);

    // Save to localStorage on update
    useEffect(() => {
        localStorage.setItem("compareList", JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (game: Game) => {
        if (compareList.find((i) => i.id === game.id)) {
            toast({ title: "Ya está en la lista", description: "El juego ya está en el comparador." });
            return;
        }
        if (compareList.length >= 4) {
            toast({ variant: "destructive", title: "Límite alcanzado", description: "Solo puedes comparar hasta 4 productos." });
            return;
        }
        setCompareList((prev) => [...prev, game]);
        toast({ title: "Agregado al comparador", description: `Has agregado ${game.name} a la lista.`, duration: 2000 });
    };

    const removeFromCompare = (id: string) => {
        setCompareList((prev) => prev.filter((i) => i.id !== id));
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    const isInCompare = (id: string) => {
        return compareList.some((i) => i.id === id);
    };

    return (
        <ComparatorContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
            {children}
        </ComparatorContext.Provider>
    );
}

export function useComparator() {
    const context = useContext(ComparatorContext);
    if (context === undefined) {
        throw new Error("useComparator must be used within a ComparatorProvider");
    }
    return context;
}
