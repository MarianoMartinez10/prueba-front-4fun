"use client";

import { useComparator } from "@/context/ComparatorContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GameCard } from "@/components/game/game-card";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ComparisonPage() {
    const { compareList, removeFromCompare, clearCompare } = useComparator();

    if (compareList.length === 0) {
        return (
            <div className="container mx-auto py-16 text-center">
                <h1 className="text-3xl font-bold mb-4 font-headline">Comparador de Productos</h1>
                <p className="text-muted-foreground mb-8">No has seleccionado ningún producto para comparar.</p>
                <Button asChild>
                    <Link href="/productos">Ir a la Tienda</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-screen-2xl px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-headline">Comparando {compareList.length} Productos</h1>
                <Button variant="destructive" onClick={clearCompare}>
                    <X className="mr-2 h-4 w-4" /> Limpiar Todo
                </Button>
            </div>

            <div className="overflow-x-auto">
                <Table className="min-w-[800px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Características</TableHead>
                            {compareList.map((game) => (
                                <TableHead key={game.id} className="min-w-[250px] relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-muted/50 hover:bg-destructive hover:text-white"
                                        onClick={() => removeFromCompare(game.id)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                    <div className="w-[150px] mx-auto mt-4">
                                        <Link href={`/productos/${game.id}`}>
                                            <span className="font-bold text-center block mb-2 hover:text-primary transition-colors">{game.name}</span>
                                        </Link>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Price */}
                        <TableRow>
                            <TableCell className="font-semibold">Precio</TableCell>
                            {compareList.map((game) => (
                                <TableCell key={game.id} className="text-center font-bold text-lg">
                                    {formatCurrency(game.price)}
                                </TableCell>
                            ))}
                        </TableRow>
                        {/* Platform */}
                        <TableRow>
                            <TableCell className="font-semibold">Plataforma</TableCell>
                            {compareList.map((game) => (
                                <TableCell key={game.id} className="text-center">
                                    {game.platform?.name}
                                </TableCell>
                            ))}
                        </TableRow>
                        {/* Genre */}
                        <TableRow>
                            <TableCell className="font-semibold">Género</TableCell>
                            {compareList.map((game) => (
                                <TableCell key={game.id} className="text-center">
                                    {game.genre?.name}
                                </TableCell>
                            ))}
                        </TableRow>
                        {/* Developer */}
                        <TableRow>
                            <TableCell className="font-semibold">Desarrollador</TableCell>
                            {compareList.map((game) => (
                                <TableCell key={game.id} className="text-center">
                                    {game.developer || "-"}
                                </TableCell>
                            ))}
                        </TableRow>
                        {/* Action */}
                        <TableRow>
                            <TableCell className="font-semibold"></TableCell>
                            {compareList.map((game) => (
                                <TableCell key={game.id} className="text-center">
                                    <Button asChild size="sm" className="w-full">
                                        <Link href={`/productos/${game.id}`}>Ver Producto <ArrowRight className="ml-2 h-3 w-3" /></Link>
                                    </Button>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
