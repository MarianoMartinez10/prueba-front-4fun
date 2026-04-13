"use client";

/**
 * Capa de Administración: Formulario de Control de Productos (Edit Product)
 * --------------------------------------------------------------------------
 * Orquesta la edición exhaustiva de los atributos de producto. 
 * Implementa esquemas de validación rigurosos (Zod), integración con servicios 
 * de activos (Cloudinary) y gestión de existencias digitales (Keys). 
 * (MVC / View-Admin)
 */

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, X, Package, ShieldCheck, Gamepad2, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { KeyManager } from "@/components/admin/key-manager";
import { adminProductBaseSchema } from "@/lib/schemas";
import { DEVELOPERS, SPEC_PRESETS } from "@/lib/constants";
import { useImageUpload } from "@/hooks/use-image-upload";
import { cn } from "@/lib/utils";

/**
 * RN - Esquema de Moderación: Extiende el esquema base para incluir control 
 * de campañas promocionales y multimedia avanzada.
 */
const productSchema = adminProductBaseSchema.extend({
  trailerUrl: z.string().optional(),
  isDiscounted: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  discountEndDate: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [isCustomDev, setIsCustomDev] = useState(false);
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: 0, stock: 0, platformId: "", genreId: "", type: "Digital", developer: "Nintendo", specPreset: "Mid", imageUrl: "", trailerUrl: "",
      isDiscounted: false, discountPercentage: 0, discountEndDate: "",
    },
  });

  /**
   * RN - Gestión de Activos: Orquesta la carga asíncrona a Cloudinary.
   */
  const { isUploading, handleImageUpload } = useImageUpload({
    onSuccess: (url) => form.setValue("imageUrl", url),
    successMessage: "Activo visual sincronizado correctamente."
  });

  /**
   * RN - Hidratación de Datos: Recupera el estado maestro del producto y taxonomías.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pData, gData] = await Promise.all([ApiClient.getPlatforms(), ApiClient.getGenres()]);
        setPlatforms(Array.isArray(pData) ? pData : (pData?.data || []));
        setGenres(Array.isArray(gData) ? gData : (gData?.data || []));

        if (id !== 'new') {
          const p = await ApiClient.getProductByIdAdmin(id);
          if (p) {
            // RN - Normalización: Verifica si el desarrollador está en la lista preconfigurada o es personalizado.
            const devInList = DEVELOPERS.includes(p.developer as any);
            if (!devInList && p.developer) setIsCustomDev(true);

            form.reset({
              name: p.name,
              description: p.description,
              stock: p.stock,
              platformId: p.platform?.id || "",
              genreId: p.genre?.id || "",
              type: p.type as "Digital" | "Physical",
              developer: p.developer || "",
              specPreset: (p.specPreset || "Mid") as any,
              imageUrl: p.imageId || "",
              trailerUrl: p.trailerUrl || "",
              isDiscounted: (p.discountPercentage ?? 0) > 0,
              discountPercentage: p.discountPercentage || 0,
              discountEndDate: p.discountEndDate ? new Date(p.discountEndDate).toISOString().split('T')[0] : "",
              price: p.price
            });
          }
        }
      } catch (error) {
        console.error("[EditProduct] Error hydration:", error);
        toast({ variant: "destructive", title: "Fallo en Hidratación", description: "No se pudieron recuperar los registros maestros." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, form, toast]);

  /**
   * RN - Sincronización de Persistencia: Procesa la actualización transaccional.
   */
  const onSubmit = async (data: ProductFormValues) => {
    try {
      const payload: any = { ...data };
      if (!data.isDiscounted) {
        payload.discountPercentage = 0;
        payload.discountEndDate = "";
      }
      await ApiClient.updateProduct(id, payload);
      toast({ title: 'Producto actualizado', description: 'Los cambios se guardaron correctamente.' });
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error en Persistencia", description: error.message || "Fallo al salvar cambios." });
    }
  };

  if (id === 'new') return null;
  if (loading) return <div className="p-20 flex flex-col items-center justify-center gap-4 text-primary"><Loader2 className="animate-spin h-10 w-10" /><p className="text-xs font-black uppercase tracking-widest">Recuperando Registro...</p></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 lg:py-12 px-4 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary font-bold text-xs uppercase tracking-widest"><Link href="/admin/products"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al Listado</Link></Button>
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] uppercase font-bold tracking-widest">Audit Mode: Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-muted/20 pb-8">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary/10 rounded-xl"><Package className="h-6 w-6 text-primary" /></div>
                 <div>
                    <CardTitle className="text-2xl font-headline font-bold text-white uppercase tracking-tight">Ficha Técnica del Producto</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Edición de Atributos Críticos y Reglas de Negocio</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  <div className="grid grid-cols-1 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Nombre / Título Comercial</FormLabel>
                        <FormControl><Input className="h-12 bg-background/50 border-white/10 font-bold text-white" {...field} /></FormControl>
                        <FormMessage className="text-[10px] font-bold uppercase" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Descripción Técnica</FormLabel>
                        <FormControl><Textarea className="min-h-[140px] bg-background/50 border-white/10 leading-relaxed" {...field} /></FormControl>
                        <FormMessage className="text-[10px] font-bold uppercase" />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Precio Unitario (ARS)</FormLabel>
                        <FormControl><Input type="number" step="0.01" className="h-12 bg-background/50 border-white/10 font-black text-primary" {...field} /></FormControl>
                        <FormMessage className="text-[10px] font-bold uppercase" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="stock" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Existencias (Stock)</FormLabel>
                        <FormControl><Input type="number" className="h-12 bg-background/50 border-white/10 font-black text-white" {...field} /></FormControl>
                        <FormMessage className="text-[10px] font-bold uppercase" />
                      </FormItem>
                    )} />
                  </div>

                  {/* Subsistema de Campañas */}
                  <FormField control={form.control} name="isDiscounted" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-2xl border border-white/10 p-5 bg-primary/5 transition-all hover:border-primary/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-6 w-6 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-black" />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-black text-white uppercase tracking-tighter">Activar Campaña de Descuento</FormLabel>
                        <FormDescription className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Habilita la lógica de precio promocional para este ítem.</FormDescription>
                      </div>
                    </FormItem>
                  )} />

                  {form.watch('isDiscounted') && (
                    <div className="border border-primary/20 rounded-2xl p-6 space-y-6 bg-primary/5 animate-in slide-in-from-top-2 duration-500">
                      <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                         <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                         <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">Parámetros de Promoción</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="discountPercentage" render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Porcentaje (%)</FormLabel>
                            <FormControl><Input type="number" min="0" max="100" className="bg-background/50 border-white/10" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="discountEndDate" render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cierre de Campaña</FormLabel>
                            <FormControl><Input type="date" className="bg-background/50 border-white/10" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      {(() => {
                        const pct = form.watch('discountPercentage') || 0;
                        const base = form.watch('price') || 0;
                        if (pct > 0 && base > 0) {
                          const final = (base * (1 - pct / 100)).toFixed(2);
                          return (
                            <div className="bg-black/40 p-3 rounded-lg border border-primary/10 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Proyección de Venta:</span>
                                <p className="text-sm font-black text-primary">ARS {final}</p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="platformId" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Ecosistema / Plataforma</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-12 bg-background/50 border-white/10"><SelectValue placeholder="Seleccionar Entidad" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-card/95 backdrop-blur-xl">{platforms.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="genreId" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Taxonomía / Género</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-12 bg-background/50 border-white/10"><SelectValue placeholder="Seleccionar Entidad" /></SelectTrigger></FormControl>
                          <SelectContent className="bg-card/95 backdrop-blur-xl">{genres.map((g) => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="developer" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Sello Editorial / Desarrollador</FormLabel>
                      {isCustomDev ? (
                        <div className="flex gap-2">
                          <FormControl><Input className="h-12 bg-background/50 border-white/10" placeholder="PlatinumGames Inc." value={field.value} onChange={field.onChange} autoFocus /></FormControl>
                          <Button type="button" variant="outline" className="border-white/10 h-12" onClick={() => { setIsCustomDev(false); field.onChange(DEVELOPERS[0]); }}>CANCELAR</Button>
                        </div>
                      ) : (
                        <Select onValueChange={(val) => { if (val === '__custom__') { setIsCustomDev(true); field.onChange(''); } else { field.onChange(val); } }} value={DEVELOPERS.includes(field.value as any) ? field.value : '__show_current__'}>
                          <FormControl><SelectTrigger className="h-12 bg-background/50 border-white/10"><SelectValue>{DEVELOPERS.includes(field.value as any) ? field.value : field.value || 'Seleccionar Sello'}</SelectValue></SelectTrigger></FormControl>
                          <SelectContent className="bg-card/95 backdrop-blur-xl">
                            {DEVELOPERS.map((dev) => (<SelectItem key={dev} value={dev}>{dev}</SelectItem>))}
                            <SelectItem value="__custom__" className="text-primary font-bold">+ REGISTRAR NUEVO DESARROLLADOR</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="specPreset" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Perfil Técnico de Hardware</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-12 bg-background/50 border-white/10"><SelectValue placeholder="Definir perfil de requisitos" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-card/95 backdrop-blur-xl">{SPEC_PRESETS.map((preset) => (<SelectItem key={preset} value={preset}>{preset}</SelectItem>))}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="trailerUrl" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">URL Multimedia (Trailer)</FormLabel>
                      <FormControl><Input placeholder="https://www.youtube.com/watch?v=..." className="h-12 bg-background/50 border-white/10" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" className="w-full h-14 font-black text-lg tracking-widest shadow-2xl transition-all hover:-translate-y-1" disabled={form.formState.isSubmitting || isUploading}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <><Save className="mr-2 h-6 w-6" /> ACTUALIZAR REGISTRO MAESTRO</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Barra Lateral: Assets e Inventario Dinámico */}
        <div className="space-y-8">
          <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden">
             <CardHeader className="bg-muted/20 pb-4 border-b border-white/5">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                   <Gamepad2 className="h-4 w-4 text-primary" /> Visualización de Activo
                </CardTitle>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
                <div className="relative group">
                   <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-inner">
                      {form.watch("imageUrl") ? (
                        <Image src={form.watch("imageUrl") || ""} alt="Preview" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                           <Info className="h-8 w-8 opacity-20" />
                           <p className="text-[10px] font-bold uppercase">Sin Imagen Principal</p>
                        </div>
                      )}
                      {form.watch("imageUrl") && (
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg" onClick={() => form.setValue("imageUrl", "")}><X className="h-4 w-4" /></Button>
                      )}
                   </div>
                   <div className="mt-4">
                      <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="text-xs bg-background/50 border-white/10 cursor-pointer" />
                      {isUploading && <div className="mt-2 flex items-center gap-2 text-primary"><Loader2 className="animate-spin h-3 w-3" /><span className="text-[9px] font-bold uppercase">Subiendo a Cloudinary...</span></div>}
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* RN - Despacho Digital: Orquesta las keys para venta inmediata. */}
          {id !== 'new' && form.watch('type') === 'Digital' && (
            <div className="animate-in slide-in-from-right duration-1000">
               <KeyManager productId={id} productName={form.getValues('name')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
