"use client";

/**
 * Capa de AdministraciÃ³n: Alta de Nuevos Productos (Create Product)
 * --------------------------------------------------------------------------
 * Orquesta la creaciÃ³n e integraciÃ³n de nuevas entidades al catÃ¡logo maestro.
 * Implementa esquemas de validaciÃ³n rigurosos (Zod) para asegurar la integridad 
 * de la taxonomÃ­a del sistema desde la ingesta. (MVC / View-Admin)
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ProductApiService } from "@/lib/services/ProductApiService";
import { TaxonomyApiService } from "@/lib/services/TaxonomyApiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, PlusCircle, Package, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { adminProductBaseSchema, type AdminProductBaseValues } from "@/lib/schemas";
import { DEVELOPERS, SPEC_PRESETS } from "@/lib/constants";
import { useImageUpload } from "@/hooks/use-image-upload";

export default function NewProductPage() {
  const router = useRouter();
  useAuth();
  const { toast } = useToast();
  const [isCustomDev, setIsCustomDev] = useState(false);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);

  /**
   * RN - HidrataciÃ³n TaxonÃ³mica: Recupera los clasificadores necesarios para el alta.
   */
  useEffect(() => {
    Promise.all([TaxonomyApiService.getPlatforms(), TaxonomyApiService.getGenres()])
      .then(([pData, gData]) => {
        setPlatforms(Array.isArray(pData) ? pData : (pData?.data || []));
        setGenres(Array.isArray(gData) ? gData : (gData?.data || []));
      })
      .catch(err => {
        console.error("[NewProduct] Error loading taxonomy:", err);
        toast({ variant: "destructive", title: "Error de Red", description: "Fallo al sincronizar taxonomÃ­as de red." });
      });
  }, [toast]);

  const form = useForm<AdminProductBaseValues>({
    resolver: zodResolver(adminProductBaseSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      platformId: "",
      genreId: "",
      type: "Digital",
      developer: "Nintendo",
      specPreset: "Mid",
      imageId: "",
    },
  });

  /**
   * RN - GestiÃ³n de Multimedia: Orquesta la carga del asset de portada.
   */
  const { isUploading, handleImageUpload } = useImageUpload({
    onSuccess: (url) => form.setValue("imageId", url),
    successMessage: "Activo visual pre-procesado correctamente."
  });

  /**
   * RN - Ingesta de Datos: Procesa el alta transaccional en el servidor.
   */
  const onSubmit = async (data: AdminProductBaseValues) => {
    try {
      await ProductApiService.create({ ...data, developer: data.developer || '' });
      toast({ title: "Alta Exitosa", description: "El producto ha sido integrado al catÃ¡logo maestro con Ã©xito." });
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error en CreaciÃ³n", description: error.message || "Fallo persistente al registrar el Ã­tem." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 lg:py-12 px-4 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary font-bold text-xs uppercase tracking-widest">
          <Link href="/admin/products"><ArrowLeft className="mr-2 h-4 w-4" /> Cancelar OperaciÃ³n</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl">
            <CardHeader className="border-b border-white/5 bg-muted/20 pb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl"><PlusCircle className="h-6 w-6 text-primary" /></div>
                <div>
                  <CardTitle className="text-2xl font-headline font-bold text-white uppercase tracking-tight">Publicar Nuevo Activo</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Carga de datos para un nuevo producto</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  <div className="grid grid-cols-1 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Nombre Comercial</FormLabel>
                        <FormControl><Input placeholder="Elden Ring" className="h-12 bg-background/50 border-white/10 font-bold text-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">DescripciÃ³n Detallada</FormLabel>
                        <FormControl><Textarea placeholder="Especificaciones, sinopsis y detalles tÃ©cnicos..." className="min-h-[140px] bg-background/50 border-white/10 leading-relaxed" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Precio Unitario (ARS)</FormLabel>
                        <FormControl><Input type="number" step="0.01" className="h-12 bg-background/50 border-white/10 font-black text-primary" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="stock" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Stock Inicial</FormLabel>
                        <FormControl><Input type="number" className="h-12 bg-background/50 border-white/10 font-black text-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="platformId" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Plataforma</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="h-12 bg-background/50 border-white/10"><SelectValue placeholder="Seleccionar Entidad" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-card/95 backdrop-blur-xl">{platforms.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="genreId" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Género</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="h-12 bg-background/50 border-white/10"><SelectValue placeholder="Seleccionar Entidad" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-card/95 backdrop-blur-xl">{genres.map((g) => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="developer" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Sello Editorial</FormLabel>
                      {isCustomDev ? (
                        <div className="flex gap-2">
                          <FormControl><Input className="h-12 bg-background/50 border-white/10" placeholder="FromSoftware" value={field.value} onChange={field.onChange} autoFocus /></FormControl>
                          <Button type="button" variant="outline" className="border-white/10 h-12" onClick={() => { setIsCustomDev(false); field.onChange(DEVELOPERS[0]); }}>CANCELAR</Button>
                        </div>
                      ) : (
                        <Select onValueChange={(val) => { if (val === '__custom__') { setIsCustomDev(true); field.onChange(''); } else { field.onChange(val); } }} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="h-12 bg-background/50 border-white/10"><SelectValue placeholder="Seleccionar Empresa" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-card/95 backdrop-blur-xl">
                            {DEVELOPERS.map((dev) => (<SelectItem key={dev} value={dev}>{dev}</SelectItem>))}
                            <SelectItem value="__custom__" className="text-primary font-bold">+ REGISTRAR OTRO</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="specPreset" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Requisitos TÃ©cnicos (PC)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-12 bg-background/50 border-white/10"><SelectValue placeholder="Nivel de Carga" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-card/95 backdrop-blur-xl">{SPEC_PRESETS.map((preset) => (<SelectItem key={preset} value={preset}>{preset}</SelectItem>))}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" className="w-full h-14 font-black text-lg tracking-widest shadow-2xl transition-all hover:-translate-y-1" disabled={form.formState.isSubmitting || isUploading}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <><Package className="mr-2 h-6 w-6" /> PERSISTIR EN CATÃLOGO</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden">
             <CardHeader className="bg-muted/20 pb-4 border-b border-white/5">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                   <ImageIcon className="h-4 w-4 text-primary" /> Portada del Activo
                </CardTitle>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
               <div className="relative group">
                 <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-inner">
                   {form.watch("imageId") ? (
                      <Image src={form.watch("imageId") || ""} alt="Preview" fill className="object-cover animate-in zoom-in-95 duration-500" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 opacity-20">
                         <ImageIcon className="h-12 w-12" />
                         <p className="text-[10px] font-bold uppercase tracking-tighter">Sin Asset Cargado</p>
                      </div>
                    )}
                    {form.watch("imageId") && (
                      <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg" onClick={() => form.setValue("imageId", "")}><X className="h-4 w-4" /></Button>
                    )}
                 </div>
                 <div className="mt-4">
                    <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="text-xs bg-background/50 border-white/10" />
                    <FormDescription className="text-[9px] uppercase font-bold tracking-widest mt-2">Dimensiones recomendadas: Aspecto 3:4</FormDescription>
                 </div>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
