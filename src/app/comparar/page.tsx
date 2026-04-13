"use client";

/**
 * Capa de Interfaz: Comparador de Especificaciones Técnicas (Comparison Page)
 * --------------------------------------------------------------------------
 * Provee una matriz de contraste para facilitar la toma de decisiones basada 
 * en parámetros objetivos. Permite la visualización simultánea de atributos 
 * críticos (Precio, Plataforma, Género, Desarrollador) de múltiples activos. 
 * Implementa el patrón MVVM al interactuar con el ComparatorContext. 
 * (MVC / Page)
 */

import { useComparator } from "@/context/ComparatorContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GameCard } from "@/components/game/game-card";
import Link from "next/link";
import { X, ArrowRight, Scale, Trash2, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ComparisonPage() {
    const { compareList, removeFromCompare, clearCompare } = useComparator();

    /**
     * RN - Estado de Vacuidad: Gestión de la experiencia ante lista vacía.
     */
    if (compareList.length === 0) {
        return (
            <div className="container mx-auto py-32 text-center animate-in fade-in zoom-in-95 duration-700 px-4">
                <div className="h-24 w-24 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-6">
                    <Scale className="h-12 w-12 text-muted-foreground opacity-20" />
                </div>
                <h1 className="text-4xl font-headline font-bold mb-4 text-white tracking-tight">Matriz de Comparación</h1>
                <p className="text-muted-foreground mb-8 text-sm uppercase tracking-widest font-black opacity-60">No se han detectado activos en la lista de contraste.</p>
                <Button asChild className="h-12 px-8 rounded-full font-black uppercase tracking-widest text-[10px] bg-primary text-black hover:bg-primary/90 shadow-xl transition-all">
                    <Link href="/productos">Regresar al Catálogo Maestro</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-screen-2xl px-4 py-16 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-white/5 pb-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-headline font-bold text-white flex items-center gap-4 tracking-tighter">
                        <Scale className="h-10 w-10 text-primary" />
                        Análisis Comparativo
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-70">Contraste de {compareList.length} Activos Digitales en Paralelo</p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={clearCompare} 
                    className="h-12 border-destructive/20 text-destructive hover:bg-destructive/10 font-black uppercase tracking-widest text-[10px] px-6 rounded-xl transition-all"
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Purgar Matriz
                </Button>
            </div>

            {/* Matriz de Especificaciones */}
            <div className="overflow-x-auto custom-scrollbar rounded-3xl border border-white/5 bg-card/20 backdrop-blur-xl shadow-2xl">
                <Table className="min-w-[900px]">
                    <TableHeader className="bg-muted/30">
                        <TableRow className="border-white/5">
                            <TableHead className="w-[250px] font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground pl-10 h-20">Ficha Técnica</TableHead>
                            {compareList.map((game) => (
                                <TableHead key={game.id} className="min-w-[280px] relative h-20">
                                    <div className="flex items-center justify-between gap-4 pr-4">
                                        <Link href={`/productos/${game.id}`} className="flex-1">
                                            <span className="font-bold text-white text-sm hover:text-primary transition-colors block truncate">{game.name}</span>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-destructive hover:text-white transition-all"
                                            onClick={() => removeFromCompare(game.id)}
                                            title="Remover de Matriz"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* RN - Atributo: Valorización Financiera */}
                        <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="font-black uppercase tracking-widest text-[10px] text-muted-foreground pl-10 py-6">Inversión (ARS)</TableCell>
                            {compareList.map((game) => (
                                <TableCell key={game.id} className="text-center">
                                    <span className="text-2xl font-black text-white tracking-tighter">
                                        {formatCurrency(game.finalPrice || game.price)}
                                    </span>
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* RN - Atributo: Hardware Compatible */}
                        <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="font-black uppercase tracking-widest text-[10px] text-muted-foreground pl-10 py-6">Ecosistema</TableCell>
                            {compareList.map((game) => (
                                <TableCell key={game.id} className="text-center">
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">
                                        {game.platform?.name}
                                    </span>
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* RN - Atributo: Categorización Lúdica */}
                        <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="font-black uppercase tracking-widest text-[10px] text-muted-foreground pl-10 py-6">Propuesta de Valor</TableCell>
                            {compareList.map((game) => (
                                <TableCell key={game.id} className="text-center text-sm font-medium text-white/80">
                                    {game.genre?.name}
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* RN - Atributo: Autoría y Desarrollo */}
                        <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="font-black uppercase tracking-widest text-[10px] text-muted-foreground pl-10 py-6">Estudio / Editor</TableCell>
                            {compareList.map((game) => (
                                <TableCell key={game.id} className="text-center text-sm font-medium text-white/80 opacity-60">
                                    {game.developer || "Sello No Identificado"}
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* RN - Accionabilidad: Redirección a Detalle */}
                        <TableRow className="border-transparent hover:bg-white/5 transition-colors h-24">
                            <TableCell className="font-semibold pl-10"></TableCell>
                            {compareList.map((game) => (
                                <TableCell key={game.id} className="text-center">
                                    <Button asChild className="w-[80%] h-11 bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary transition-all font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl">
                                        <Link href={`/productos/${game.id}`}>
                                            Explorar Activo <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <div className="mt-8 flex justify-center">
                <Link href="/productos" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-xs font-black uppercase tracking-[0.2em]">
                    <ShoppingBag className="h-4 w-4" /> Seguir Seleccionando Activos
                </Link>
            </div>
        </div>
    );
}
