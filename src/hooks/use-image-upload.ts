import { useState, useCallback } from 'react';
import { ApiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

/**
 * Capa de Lógica Reutilizable: Gestor de Activos (Image Upload Hook)
 * --------------------------------------------------------------------------
 * Orquesta el proceso de subida de imágenes a la infraestructura de la nube.
 * Actúa como un puente entre la UI de selección de archivos y el servicio de 
 * Cloudinary (vía ApiClient).
 */

interface UseImageUploadOptions {
  onSuccess?: (url: string) => void;
  successMessage?: string;
}

export function useImageUpload({ onSuccess, successMessage = 'Imagen subida correctamente' }: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  /**
   * RN - Gestión de Multimedia: Manejador asíncrono de carga de archivos.
   * Delega el almacenamiento pesado a Cloudinary para optimizar el rendimiento
   * del servidor local (Asset Offloading).
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de input file.
   */
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // RN - Validaciones: Si no hay archivo, abortamos silenciosamente el proceso.
    if (!file) return;

    setIsUploading(true);
    try {
      // Invocación al servicio de infraestructura externa.
      const url = await ApiClient.uploadImage(file);
      
      // Callback de retorno: Inyecta la URL resultante en el estado del formulario padre.
      onSuccess?.(url);
      
      toast({ title: successMessage });
    } catch (err) {
      // Manejo de Excepciones: Captura fallos de red o de la API de Cloudinary.
      toast({ variant: 'destructive', title: 'Fallo Crítico', description: 'No se pudo alojar la imagen en la nube.' });
    } finally {
      setIsUploading(false);
    }
  }, [onSuccess, successMessage, toast]);

  return { isUploading, handleImageUpload };
}
