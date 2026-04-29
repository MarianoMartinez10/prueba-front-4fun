'use client';

/**
 * Capa de Lógica de Negocio: ViewModel de Creación de Productos
 * --------------------------------------------------------------------------
 * Orquesta la lógica de publicación para vendedores. Gestiona la validación,
 * el estado del formulario, la carga de activos y la sincronización con la API.
 * Sigue el patrón MVVM eliminando la lógica de la vista (ProductForm).
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductApiService } from "@/lib/services/ProductApiService";
import { TaxonomyApiService } from "@/lib/services/TaxonomyApiService";
import { KeyApiService } from "@/lib/services/KeyApiService";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { adminProductBaseSchema, type AdminProductBaseValues } from "@/lib/schemas";
import { DEVELOPERS } from "@/lib/constants";
import type { Platform, Genre } from "@/lib/types";

export function useSellerProductCreationViewModel() {
  const router = useRouter();
  const { toast } = useToast();
  
  // -- ESTADOS DE UI & TAXONOMÍAS --
  const [isCustomDev, setIsCustomDev] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoadingTaxonomies, setIsLoadingTaxonomies] = useState(true);
  const [keysText, setKeysText] = useState("");

  // -- INICIALIZACIÓN DEL FORMULARIO --
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
      developer: DEVELOPERS[0] || "Nintendo",
      specPreset: "Mid",
      imageId: "",
      trailerUrl: "",
    },
  });

  /**
   * RN - Sincronización de Inventario:
   * El stock de productos digitales es DERIVADO. No puede ser manipulado
   * manualmente para evitar discrepancias con el KeyManager.
   */
  useEffect(() => {
    const keys = keysText.split("\n").map(k => k.trim()).filter(k => k !== "");
    form.setValue("stock", keys.length);
  }, [keysText, form]);

  // -- LOGICA DE IMÁGENES --
  const { isUploading, handleImageUpload } = useImageUpload({
    onSuccess: (url) => form.setValue("imageId", url),
    successMessage: "Portada cargada correctamente."
  });

  /**
   * RN - Hidratación: Recupera taxonomías para los selectores.
   * Centraliza la carga de datos necesarios para el formulario.
   */
  useEffect(() => {
    const fetchTaxonomies = async () => {
      try {
        setIsLoadingTaxonomies(true);
        const [pData, gData] = await Promise.all([
          TaxonomyApiService.getPlatforms(),
          TaxonomyApiService.getGenres()
        ]);
        
        // Normalización de datos para evitar 'any'
        setPlatforms(Array.isArray(pData) ? pData : (pData?.data || []));
        setGenres(Array.isArray(gData) ? gData : (gData?.data || []));
      } catch (err) {
        toast({ 
          variant: "destructive", 
          title: "Error de Sistema", 
          description: "No se pudieron cargar las categorías. Reintente." 
        });
      } finally {
        setIsLoadingTaxonomies(false);
      }
    };

    fetchTaxonomies();
  }, [toast]);

  /**
   * RN - Persistencia: Orquesta la creación del producto.
   * Maneja el estado de submit y la redirección post-éxito.
   */
  const onSubmit = async (data: AdminProductBaseValues) => {
    try {
      const keys = keysText.split("\n").map(k => k.trim()).filter(k => k !== "");
      
      if (keys.length === 0) {
        throw new Error("Debes agregar al menos una Clave Digital para publicar el producto.");
      }

      // 1. Crear el producto base
      // RN: Ya usamos imageId consistentemente con el backend
      const response = await ProductApiService.create({ 
        ...data, 
        stock: keys.length,
        developer: data.developer || '' 
      });

      // 2. Orquestar la carga de licencias (KeyManager Integration)
      // Ajuste: El backend devuelve un envelope { success: true, data: Product }
      const newProduct = (response as any).data || response;
      
      if (newProduct && newProduct.id) {
        await KeyApiService.addBulk(newProduct.id, keys);
      }

      toast({ 
        title: "Publicación Exitosa", 
        description: `Se han cargado ${keys.length} claves para "${data.name}".` 
      });

      router.push("/seller/products");
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error fatal en el alta.";
      toast({ 
        variant: "destructive", 
        title: "Fallo en Publicación", 
        description: errorMessage 
      });
    }
  };

  /**
   * RN - Flexibilidad: Maneja el cambio a desarrollador personalizado.
   */
  const toggleCustomDeveloper = (value: string) => {
    if (value === '__custom__') {
      setIsCustomDev(true);
      form.setValue('developer', '');
    } else {
      setIsCustomDev(false);
      form.setValue('developer', value);
    }
  };

  const cancelCustomDeveloper = () => {
    setIsCustomDev(false);
    form.setValue('developer', DEVELOPERS[0] || '');
  };

  return {
    form,
    platforms,
    genres,
    isLoadingTaxonomies,
    isUploading,
    isCustomDev,
    keysText,
    setKeysText,
    handleImageUpload,
    onSubmit: form.handleSubmit(onSubmit),
    toggleCustomDeveloper,
    cancelCustomDeveloper,
    isSubmitting: form.formState.isSubmitting
  };
}
