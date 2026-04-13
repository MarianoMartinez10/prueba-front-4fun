"use client";

/**
 * Provee un punto de acceso global para la búsqueda de productos.
 * Implementa debouncing y gestión de concurrencia para una previsualización 
 * de resultados en tiempo real. (MVC / View)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiClient } from "@/lib/api";
import type { Product } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils";

// RN - Constantes de Optimización
const DEBOUNCE_MS = 300; // Ventana de espera para estabilizar la entrada del usuario.
const MAX_PREVIEW = 5;  // Límite de resultados en previsualización rápida.

export function SearchDialog({
    trigger,
    open: controlledOpen,
    onOpenChange
}: {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // RN - Gestión de Concurrencia: Utiliza referencias para cancelar peticiones obsoletas.
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const router = useRouter();

    const isControlled = controlledOpen !== undefined;
    const showOpen = isControlled ? controlledOpen : open;
    const setShowOpen = isControlled ? onOpenChange! : setOpen;

    /**
     * RN - Motor de Búsqueda: Ejecuta la consulta asíncrona al API.
     * Justificación TFI: Implementa AbortSignal para prevenir colisiones de datos (Race Conditions).
     */
    const fetchResults = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            setResults([]);
            setTotalResults(0);
            setLoading(false);
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const res = await ApiClient.getProducts(
                { search: q, limit: MAX_PREVIEW, page: 1 },
                { signal: controller.signal }
            );
            if (!controller.signal.aborted) {
                setResults(res.products);
                setTotalResults(res.meta.total);
                setLoading(false);
            }
        } catch {
            if (!controller.signal.aborted) {
                setResults([]);
                setTotalResults(0);
                setLoading(false);
            }
        }
    }, []);

    /**
     * RN - Estabilización: Controla la frecuencia de peticiones mediante Debounce.
     */
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.trim().length < 2) {
            setResults([]);
            setTotalResults(0);
            setLoading(false);
            return;
        }
        setLoading(true);
        debounceRef.current = setTimeout(() => fetchResults(query), DEBOUNCE_MS);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, fetchResults]);

    /**
     * Ciclo de Vida: Reseteo de estado al cierre del diálogo.
     */
    useEffect(() => {
        if (!showOpen) {
            setQuery("");
            setResults([]);
            setTotalResults(0);
            setLoading(false);
            abortRef.current?.abort();
        }
    }, [showOpen]);

    /**
     * RN - Accesibilidad (A11y): Implementa el atajo universal Cmd+K / Ctrl+K.
     */
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const navigateTo = (path: string) => {
        setShowOpen(false);
        router.push(path);
    };

    /**
     * RN - Redirección: Navega a la página de resultados completa.
     */
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigateTo(`/productos?search=${encodeURIComponent(query)}`);
        }
    };

    return (
        <>
            {!isControlled && trigger && (
                <div onClick={() => setOpen(true)} className="w-full h-full cursor-pointer">{trigger}</div>
            )}

            <Dialog open={showOpen} onOpenChange={setShowOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0 bg-card/95 backdrop-blur-xl border-white/10 shadow-3xl">
                    <DialogHeader className="px-5 py-4 border-b border-white/5 bg-muted/20">
                        <DialogTitle className="sr-only">Buscador</DialogTitle>
                        <DialogDescription className="sr-only">
                            Utilice este diálogo para buscar productos por nombre, género o plataforma en tiempo real.
                        </DialogDescription>
                        <form onSubmit={handleSearch} className="flex items-center gap-3">
                            <Search className="h-5 w-5 shrink-0 text-primary opacity-80" />
                            <input
                                className="flex h-12 w-full rounded-md bg-transparent py-4 text-base font-medium text-white outline-none placeholder:text-muted-foreground placeholder:italic"
                                placeholder="Título, género o plataforma..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                            {loading && <Loader2 className="h-5 w-5 animate-spin shrink-0 text-primary opacity-50" />}
                        </form>
                    </DialogHeader>

                    <div className="max-h-[450px] overflow-y-auto p-3 custom-scrollbar">
                        {query.trim().length === 0 ? (
                            <div className="py-12 text-center">
                                <Search className="h-10 w-10 mx-auto text-muted-foreground opacity-20" />
                            </div>
                        ) : query.trim().length < 2 ? (
                            <div className="py-12 text-center text-xs text-muted-foreground italic">
                                Se requieren al menos 2 caracteres para procesar la consulta...
                            </div>
                        ) : loading && results.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest">Buscando...</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="py-12 text-center space-y-2">
                                <p className="text-sm text-white font-semibold uppercase tracking-tight">Sin resultados</p>
                                <p className="text-xs text-muted-foreground">No hay resultados registrados para: &quot;{query}&quot;</p>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary bg-primary/5 rounded border border-primary/10">
                                    Resultados: {totalResults} productos encontrados
                                </p>
                                {results.map((product) => (
                                    <button
                                        key={product.id}
                                        className="flex items-center gap-4 w-full rounded-xl px-4 py-3 text-left hover:bg-white/5 transition-all duration-200 group border border-transparent hover:border-white/5"
                                        onClick={() => navigateTo(`/productos/${product.id}`)}
                                    >
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted/20 border border-white/10 shadow-inner">
                                            <Image
                                                src={product.imageId || ''}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                sizes="48px"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate uppercase tracking-tight">{product.name}</p>
                                            <p className="text-[10px] text-muted-foreground truncate uppercase font-mono tracking-tighter opacity-80">
                                                {typeof product.platform === 'object' ? product.platform.name : product.platform}
                                                {product.developer && ` · ${product.developer}`}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            {(product.discountPercentage ?? 0) > 0 ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] line-through text-destructive/60 font-mono">{formatCurrency(product.price)}</span>
                                                    <p className="text-sm font-bold text-primary">{formatCurrency(product.finalPrice ?? product.price)}</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm font-bold text-white">{formatCurrency(product.price)}</p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                                {totalResults > MAX_PREVIEW && (
                                    <Button
                                        variant="ghost"
                                        className="justify-between h-10 px-4 text-xs font-medium uppercase tracking-widest mt-2 hover:bg-primary/10 hover:text-primary border border-white/5"
                                        onClick={handleSearch}
                                    >
                                        <span>Ver todos los resultados</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Barra de Atajos y Estado Operativo */}
                    <div className="py-2.5 px-5 bg-muted/40 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between border-t border-white/5">
                        <span className="flex items-center gap-2">
                            <kbd className="h-5 min-w-8 flex items-center justify-center rounded border border-white/10 bg-black/40 px-1.5 font-mono text-white opacity-100 shadow-sm">
                                Enter
                            </kbd>{" "}
                            Ver resultados
                        </span>
                        <span className="flex items-center gap-2">
                            <kbd className="h-5 min-w-8 flex items-center justify-center rounded border border-white/10 bg-black/40 px-1.5 font-mono text-white opacity-100 shadow-sm">
                                Esc
                            </kbd>{" "}
                            Cerrar
                        </span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
