'use client';

/**
 * Capa de Lógica de Negocio: ViewModel de Edición de Productos
 * --------------------------------------------------------------------------
 * Orquesta la actualización de publicaciones existentes. Gestiona la carga inicial
 * de datos, sincronización de taxonomías, validación de descuentos y 
 * persistencia de cambios. Implementa patrón MVVM para desacoplar la orquestación.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProductApiService } from "@/lib/services/ProductApiService";
import { TaxonomyApiService } from "@/lib/services/TaxonomyApiService";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { adminProductBaseSchema } from "@/lib/schemas";
import { DEVELOPERS } from "@/lib/constants";
import type { Platform, Genre } from "@/lib/types";

// Extensión del esquema para lógica comercial de ofertas
const productEditSchema = adminProductBaseSchema.extend({
  isDiscounted: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
});

export type ProductEditValues = z.infer<typeof productEditSchema>;

export function useSellerProductEditViewModel(productId: string) {
  const router = useRouter();
  const { toast } = useToast();
  
  // -- ESTADOS DE UI & TAXONOMÍAS --
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomDev, setIsCustomDev] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  // -- INICIALIZACIÓN DEL FORMULARIO --
  const form = useForm<ProductEditValues>({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      platformId: "",
      genreId: "",
      type: "Digital",
      developer: "",
      specPreset: "Mid",
      imageId: "",
      isDiscounted: false,
      discountPercentage: 0,
    },
  });

  // -- LOGICA DE IMÁGENES --
  const { isUploading, handleImageUpload } = useImageUpload({
    onSuccess: (url) => form.setValue("imageId", url),
    successMessage: "Imagen de portada actualizada."
  });

  /**
   * RN - Hidratación Cohesiva: Carga el producto y las taxonomías en paralelo.
   */
  useEffect(() => {
    const hydrate = async () => {
      try {
        setIsLoading(true);
        const [pData, gData, product] = await Promise.all([
          TaxonomyApiService.getPlatforms(),
          TaxonomyApiService.getGenres(),
          ProductApiService.getForManagement(productId)
        ]);

        setPlatforms(Array.isArray(pData) ? pData : (pData?.data || []));
        setGenres(Array.isArray(gData) ? gData : (gData?.data || []));

        if (product) {
          const rawProduct = product.getRawData();
          // Detectamos si el desarrollador es un preset o personalizado
          const devIsPreset = (DEVELOPERS as readonly string[]).includes(rawProduct.developer as string);
          setIsCustomDev(!devIsPreset);

          form.reset({
            name: rawProduct.name,
            description: rawProduct.description,
            price: rawProduct.price,
            stock: rawProduct.stock,
            platformId: rawProduct.platform?.id || "",
            genreId: rawProduct.genre?.id || "",
            type: (rawProduct.type as "Physical" | "Digital") || "Digital",
            developer: rawProduct.developer || "",
            specPreset: (rawProduct.specPreset as string) || "Mid",
            imageId: rawProduct.imageId || "",
            trailerUrl: rawProduct.trailerUrl || "",
            isDiscounted: (rawProduct.discountPercentage ?? 0) > 0,
            discountPercentage: rawProduct.discountPercentage || 0,
          });
        }
      } catch (error) {
        toast({ 
          variant: "destructive", 
          title: "Fallo de Carga", 
          description: "No se pudo recuperar la información del producto." 
        });
        router.push("/seller/products");
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, [productId, toast, router, form]);

  /**
   * RN - Persistencia Transaccional: Actualiza los cambios.
   */
  const onSubmit = async (data: ProductEditValues) => {
    try {
      const payload = { ...data };
      
      // Regla de Negocio: Si no hay oferta activa, el porcentaje es 0.
      if (!data.isDiscounted) payload.discountPercentage = 0;
      
      await ProductApiService.update(productId, payload);
      
      toast({ 
        title: "Actualización Exitosa", 
        description: "Los cambios se han propagado correctamente al catálogo." 
      });

      router.push("/seller/products");
      router.refresh();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error desconocido al actualizar.";
      toast({ 
        variant: "destructive", 
        title: "Error en Guardado", 
        description: msg 
      });
    }
  };

  /**
   * Sincronización de Stock para KeyManager.
   */
  const syncStockFromKeys = (nextStock: number) => {
    form.setValue('stock', nextStock);
  };

  return {
    form,
    isLoading,
    isUploading,
    isCustomDev,
    platforms,
    genres,
    handleImageUpload,
    syncStockFromKeys,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting
  };
}
