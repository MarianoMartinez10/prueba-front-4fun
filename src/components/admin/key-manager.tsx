"use client";

/**
 * Capa de Administración: Gestor de Licencias de Inventario (Key Manager)
 * --------------------------------------------------------------------------
 * Orquesta la administración de licencias digitales para productos de tipo 'Digital'.
 * Implementa flujos de carga masiva, auditoría de estados (Disponible/Vendido)
 * y políticas de prevención de duplicidad en el inventario. (MVC / View-Admin)
 */

import { useState, useEffect, useCallback } from "react";
import { KeyApiService } from "@/lib/services/KeyApiService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Key, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KeyManagerProps {
    productId: string;
    productName: string;
    onStockSync?: (nextStock: number) => void;
}

export function KeyManager({ productId, productName, onStockSync }: KeyManagerProps) {
    const { toast } = useToast();
    const [keys, setKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputKeys, setInputKeys] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const getKeyId = (key: any) => key?.id || key?._id;

    /**
     * RN - Auditoría de Stock: Recupera el listado completo de licencias vinculadas al producto.
     */
    const loadKeys = useCallback(async () => {
        setLoading(true);
        try {
            const res = await KeyApiService.getByProduct(productId);
            if (res.success) {
                setKeys(res.data);
            }
        } catch (error) {
            console.error("[KeyManager] Error de sincronización:", error);
            toast({ variant: "destructive", title: "Error de Carga", description: "No se pudo recuperar el inventario de keys." });
        } finally {
            setLoading(false);
        }
    }, [productId, toast]);

    useEffect(() => {
        if (productId && productId !== 'new') {
            loadKeys();
        }
    }, [productId, loadKeys]);

    /**
     * RN - Ingesta de Datos: Procesa la carga masiva de licencias.
     * Implementa limpieza de caracteres y filtrado de redundancias. (Batch Processing)
     */
    const handleSave = async () => {
        if (!inputKeys.trim()) return;

        // RN - Normalización: Segmenta por saltos de línea o comas y elimina espacios superfluos.
        const keysArray = inputKeys.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);

        if (keysArray.length === 0) return;

        setIsSaving(true);
        try {
            const res = await KeyApiService.addBulk(productId, keysArray);
            if (res.success) {
                toast({
                    title: "Inventario Sincronizado",
                    description: `Integradas: ${res.addedCount} | Ignoradas (Duplicadas): ${res.ignoredCount}`
                });
                if (typeof res.currentStock === 'number') onStockSync?.(res.currentStock);
                setInputKeys("");
                loadKeys();
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Fallo en Persistencia", description: error.message || "No se pudo guardar el lote de keys." });
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * RN - Moderación: Eliminación unitaria de licencias no vendidas.
     */
    const handleDelete = async (id: string, keyVal: string) => {
        if (!confirm(`¿Confirma la eliminación de la licencia técnica: ${keyVal}?`)) return;

        try {
            const res = await KeyApiService.delete(id);
            toast({ title: "Licencia Eliminada" });
            if (typeof res?.currentStock === 'number') onStockSync?.(res.currentStock);
            setKeys(prev => prev.filter(k => getKeyId(k) !== id));
        } catch (error) {
            toast({ variant: "destructive", title: "Fallo en Operación", description: "No se pudo procesar la baja." });
        }
    };

    return (
        <Card className="mt-8 border-none bg-card/40 backdrop-blur-md shadow-2xl">
            <CardHeader className="border-b border-white/5">
                <CardTitle className="flex items-center gap-2 text-white font-headline">
                    <Key className="h-5 w-5 text-primary" />
                    Gestión de Keys
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

                {/* Área de Ingesta Masiva */}
                <div className="space-y-4 rounded-xl bg-muted/20 p-5 border border-white/5 shadow-inner">
                    <h4 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Carga por Lote (Batch Input)</h4>
                    <p className="text-[10px] text-muted-foreground italic">Ingrese una licencia por línea para su procesamiento asíncrono.</p>
                    <Textarea
                        placeholder="AAAA-BBBB-CCCC-DDDD\nEEEE-FFFF-GGGG-HHHH"
                        className="font-mono text-xs min-h-[140px] bg-background/50 border-white/10 text-primary"
                        value={inputKeys}
                        onChange={(e) => setInputKeys(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving || !inputKeys.trim()} className="font-bold shadow-md">
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            AÑADIR KEY
                        </Button>
                    </div>
                </div>

                {/* Visor de Existencias (Stock Auditor) */}
                <div className="rounded-xl border border-white/5 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="font-bold text-xs uppercase tracking-widest">Licencia Técnica</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-widest text-center">Estado</TableHead>
                                <TableHead className="text-right font-bold text-xs uppercase tracking-widest">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : keys.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">
                                        Sin licencias digitales registradas para este producto.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                keys.map((k) => {
                                    const keyId = getKeyId(k);
                                    return (
                                    <TableRow key={keyId} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <TableCell className="font-mono text-xs md:text-sm text-white">{k.key}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge 
                                                variant="outline"
                                                className={cn(
                                                    "text-[10px] font-bold uppercase py-0",
                                                    k.status === 'AVAILABLE' ? "border-green-500/30 text-green-400 bg-green-500/5" : 
                                                    k.status === 'SOLD' ? "border-destructive/30 text-destructive bg-destructive/5" : 
                                                    "border-muted-foreground/30 text-muted-foreground"
                                                )}
                                            >
                                                {k.status === 'AVAILABLE' ? 'Disponible' : k.status === 'SOLD' ? 'Vendida' : k.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => keyId && handleDelete(keyId, k.key)} 
                                                disabled={k.status === 'SOLD' || !keyId}
                                                className="hover:bg-destructive/20 hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )})
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
