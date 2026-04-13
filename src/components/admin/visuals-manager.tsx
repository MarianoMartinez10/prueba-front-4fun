"use client";

/**
 * Capa de Administración: Gestor de Visuales y Taxonomías (Visuals Manager)
 * --------------------------------------------------------------------------
 * Orquesta la administración centralizada de Plataformas y Géneros.
 * Implementa flujos de CRUD, carga de activos optimizada (Cloudinary) y 
 * operaciones masivas. Garantiza la consistencia de la taxonomía del catálogo.
 * (MVC / View-Admin)
 */

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Loader2, Trash2, Plus, Search } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { getImageUrl } from "@/lib/utils";
import type { Platform, Genre } from "@/lib/types";
import { TableSkeleton } from "@/components/ui/skeletons";

// RN - Definiciones de Dominio: Tipificación para la gestión de entidades visuales.
type VisualType = 'platform' | 'genre';
type VisualItem = Platform | Genre;

export function VisualsManager() {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<VisualType>("platform");
    const { toast } = useToast();

    /**
     * RN - Sincronización de Datos: Recupera la taxonomía completa del API.
     */
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pData, gData] = await Promise.all([
                ApiClient.getPlatforms(),
                ApiClient.getGenres()
            ]);

            // Normalización DTO: Asegura la integridad del estado local previo al renderizado.
            setPlatforms(Array.isArray(pData) ? pData : (pData?.data || []));
            setGenres(Array.isArray(gData) ? gData : (gData?.data || []));

        } catch (error) {
            console.error("[VisualsManager] Fallo en la persistencia:", error);
            toast({ variant: "destructive", title: "Error de Red", description: "No se pudieron sincronizar las taxonomías." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [searchTerm, setSearchTerm] = useState("");

    /**
     * RN - Resiliencia Visual: Renderiza un estado de carga (Skeleton) para evitar Layout Shift.
     */
    if (loading) return (
        <div className="w-full mt-8">
            <div className="flex justify-between items-center mb-4">
                <div className="h-8 w-48 bg-muted/20 rounded-md animate-pulse" />
                <div className="h-10 w-32 bg-muted/20 rounded-md animate-pulse" />
            </div>
            <TableSkeleton rows={5} columns={4} />
        </div>
    );

    const getItems = () => {
        switch (activeTab) {
            case 'platform': return platforms;
            case 'genre': return genres;
            default: return [];
        }
    };

    const getLabel = () => {
        switch (activeTab) {
            case 'platform': return "Registrar Plataforma";
            case 'genre': return "Registrar Género";
        }
    };

    /**
     * RN - Motor de Búsqueda: Filtrado en caliente sobre el estado local.
     */
    const filteredItems = getItems().filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as VisualType); setSearchTerm(""); }} className="w-full">
            <Card className="mt-8 border-none bg-card/40 backdrop-blur-md shadow-2xl">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-headline font-bold text-white">Consola de Visuales</CardTitle>
                        <TabsList className="grid w-[400px] grid-cols-2 bg-muted/20 border border-white/5">
                            <TabsTrigger value="platform" className="data-[state=active]:bg-primary">Plataformas</TabsTrigger>
                            <TabsTrigger value="genre" className="data-[state=active]:bg-primary">Géneros</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">Gestion de imagenes y nombres para plataformas y generos.</p>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por ID o Nombre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 bg-background/50 border-white/10"
                                />
                            </div>
                            <CreateDialog type={activeTab} onUpdate={fetchData} label={getLabel()} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <TabsContent value="platform" className="mt-0">
                        <VisualTable items={filteredItems} type="platform" onUpdate={fetchData} />
                    </TabsContent>
                    <TabsContent value="genre" className="mt-0">
                        <VisualTable items={filteredItems} type="genre" onUpdate={fetchData} />
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    );
}

/**
 * Componente Interno: Tabla de Datos Dinámica
 */
function VisualTable({ items, type, onUpdate }: { items: VisualItem[], type: VisualType, onUpdate: () => void }) {
    const { toast } = useToast();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        setSelectedIds(new Set());
    }, [type, items]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(new Set(items.map(i => i.id)));
        else setSelectedIds(new Set());
    };

    const handleSelect = (id: string, checked: boolean) => {
        const newSet = new Set(selectedIds);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedIds(newSet);
    };

    /**
     * RN - Auditoría de Eliminación: Procesa la baja de entidades tras confirmación.
     */
    const handleDelete = async (ids: string[]) => {
        if (!confirm(`¿Confirma la eliminación definitiva de ${ids.length} elemento(s)?`)) return;

        try {
            if (type === 'platform') {
                if (ids.length === 1) await ApiClient.deletePlatform(ids[0]);
                else await ApiClient.deletePlatformsBulk(ids);
            } else if (type === 'genre') {
                if (ids.length === 1) await ApiClient.deleteGenre(ids[0]);
                else await ApiClient.deleteGenresBulk(ids);
            }
            toast({ title: "Baja Procesada", description: "Taxonomía actualizada correctamente." });
            onUpdate();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Fallo en Operación", description: error.message || "Error al procesar la baja." });
        }
    };

    return (
        <div className="space-y-4">
            {selectedIds.size > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-bold text-destructive">{selectedIds.size} seleccionados para eliminar</span>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(Array.from(selectedIds))}>
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar Selección
                    </Button>
                </div>
            )}
            <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={items.length > 0 && selectedIds.size === items.length}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[120px]">Activo</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id} className="hover:bg-white/5 transition-colors border-white/5">
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.has(item.id)}
                                        onCheckedChange={(c) => handleSelect(item.id, !!c)}
                                    />
                                </TableCell>
                                <TableCell className="py-3">
                                    <div className="relative h-16 w-full rounded-md overflow-hidden bg-muted/20 border border-white/5">
                                        <Image
                                            src={getImageUrl(item.imageId, "https://placehold.co/200x120/222/FFF?text=Sin+Imagen")}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="120px"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-bold text-white">{item.name}</div>
                                    <div className="text-[10px] font-mono text-muted-foreground uppercase opacity-70 tracking-tighter">{item.id}</div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <EditDialog itemId={item.id} type={type} onUpdate={onUpdate} />
                                        <Button variant="ghost" size="icon" className="hover:bg-destructive/20 hover:text-destructive" onClick={() => handleDelete([item.id])}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">No se hallaron coincidencias.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

/**
 * Componente: Diálogo de Creación de Visuales
 */
function CreateDialog({ type, onUpdate, label }: { type: VisualType, onUpdate: () => void, label: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const { toast } = useToast();

    const { isUploading, handleImageUpload } = useImageUpload({
        onSuccess: (url) => setImageUrl(url),
        successMessage: "Activo cargado en Cloudinary"
    });

    useEffect(() => {
        if (open) { setId(""); setName(""); setImageUrl(""); }
    }, [open]);

    /**
     * RN - Normalización de ID: Genera slugs técnicos aptos para URL.
     */
    const handleCreate = async () => {
        if (!id || !name) {
            toast({ variant: "destructive", title: "Datos Faltantes", description: "ID y Nombre son campos requeridos." });
            return;
        }

        setLoading(true);
        const finalId = id.trim().replace(/\s+/g, '-').toLowerCase();

        try {
            const payload = { id: finalId, name, imageId: imageUrl };
            if (type === 'platform') await ApiClient.createPlatform(payload);
            else if (type === 'genre') await ApiClient.createGenre(payload);

            toast({ title: "Alta Exitosa", description: "Entidad integrada a la taxonomía." });
            setOpen(false);
            onUpdate();
        } catch (error) {
            toast({ variant: "destructive", title: "Error en Alta", description: "No se pudo crear el elemento." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-bold shadow-lg"><Plus className="mr-2 h-4 w-4" /> {label}</Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-headline text-white">{label}</DialogTitle>
                    <DialogDescription className="sr-only">Formulario de registro</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-id" className="text-right text-xs uppercase font-bold tracking-widest">ID</Label>
                        <Input id="new-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="shooter-tactico" className="col-span-3 bg-background/50 border-white/10" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-name" className="text-right text-xs uppercase font-bold tracking-widest">Nombre</Label>
                        <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shooter tactico" className="col-span-3 bg-background/50 border-white/10" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-xs uppercase font-bold tracking-widest">Imagen</Label>
                        <div className="col-span-3 space-y-3">
                            <div className="relative h-24 w-full rounded-lg border border-dashed border-white/10 bg-muted/20 flex items-center justify-center overflow-hidden">
                                {imageUrl ? <Image src={imageUrl} alt="Vista Previa" fill className="object-cover" /> : <span className="text-[10px] text-muted-foreground">SIN ACTIVO ASIGNADO</span>}
                            </div>
                            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="text-xs bg-background/50" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreate} disabled={loading || isUploading} className="w-full font-bold">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} REGISTRAR ENTIDAD
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Componente: Diálogo de Edición Técnica
 */
function EditDialog({ itemId, type, onUpdate }: { itemId: string, type: VisualType, onUpdate: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [newId, setNewId] = useState("");
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const { toast } = useToast();

    const { isUploading, handleImageUpload } = useImageUpload({
        onSuccess: (url) => setImageUrl(url),
        successMessage: "Activo actualizado en Cloudinary"
    });

    useEffect(() => {
        if (open && itemId) {
            setFetching(true);
            const loadDetails = async () => {
                try {
                    let data;
                    if (type === 'platform') data = await ApiClient.getPlatformById(itemId);
                    else if (type === 'genre') data = await ApiClient.getGenreById(itemId);

                    const item = data.data || data;
                    setName(item.name || "");
                    setNewId(item.id || itemId);
                    setImageUrl(item.imageId || item.image || "");
                } catch (error) {
                    toast({ variant: "destructive", title: "Error", description: "Fallo en hidratación de detalles." });
                    setOpen(false);
                } finally { setFetching(false); }
            };
            loadDetails();
        }
    }, [open, itemId, type, toast]);

    const handleSave = async () => {
        if (!newId || !name) { toast({ variant: "destructive", title: "Error", description: "ID y Nombre obligatorios." }); return; }
        setLoading(true);
        try {
            const finalId = newId.trim().replace(/\s+/g, '-').toLowerCase();
            const payload = { name, imageId: imageUrl, newId: finalId };
            if (type === 'platform') await ApiClient.updatePlatform(itemId, payload);
            else if (type === 'genre') await ApiClient.updateGenre(itemId, payload);
            toast({ title: "Sincronización Exitosa", description: "Entidad actualizada correctamente." });
            setOpen(false);
            onUpdate();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Fallo en Persistencia", description: error.message || "No se pudo salvar." });
        } finally { setLoading(false); }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary"><Pencil className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-headline text-white">Refactorear {type === 'platform' ? 'Plataforma' : 'Género'}</DialogTitle>
                </DialogHeader>
                {fetching ? (
                    <div className="flex justify-center p-12 text-primary"><Loader2 className="animate-spin h-8 w-8" /></div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-xs uppercase font-bold tracking-widest text-muted-foreground">ID Técnico</Label>
                            <Input value={newId} onChange={(e) => setNewId(e.target.value)} className="col-span-3 bg-background/50 border-white/10 text-white" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right text-xs uppercase font-bold tracking-widest text-muted-foreground">Nombre</Label>
                            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3 bg-background/50 border-white/10 text-white" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-xs uppercase font-bold tracking-widest text-muted-foreground">Activo</Label>
                            <div className="col-span-3 space-y-3">
                                <div className="relative h-32 w-full rounded-lg border border-white/10 bg-muted/20 flex items-center justify-center overflow-hidden shadow-inner">
                                    {imageUrl ? <Image src={imageUrl} alt="Vista Previa" fill className="object-cover" /> : <span className="text-[10px] text-muted-foreground">SIN IMAGEN</span>}
                                </div>
                                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="text-xs bg-background/50" />
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading || isUploading || fetching} className="w-full font-bold">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} GUARDAR CAMBIOS TÉCNICOS
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
