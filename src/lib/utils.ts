import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FALLBACK_IMAGE } from "@/domain/entities/ProductEntity"

/**
 * Capa de Lógica Transversal: Utilidades (Utils)
 * --------------------------------------------------------------------------
 * Provee herramientas auxiliares reutilizables por múltiples componentes.
 * Implementa la lógica de bajo nivel para normalización y formateo. (Lib)
 */

/**
 * RN - Interfaz Determinista: Orquesta la fusión inteligente de clases CSS.
 * Utiliza tailwind-merge para resolver conflictos de cascada en tiempo de ejecución.
 * 
 * @param {ClassValue[]} inputs - Clases o condicionales.
 * @returns {string} String final de clases optimizado.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * RN - Localización (L10n): Formatea importes numéricos a moneda local (ARS).
 * Mantenibilidad: Centraliza el motor de internacionalización regional.
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount)
}

/** 
 * RN - Resiliencia Visual: Resuelve la ruta final de un activo multimedia.
 * Si el activo es inválido o nulo, inyecta el marcador de posición (Fallback).
 * 
 * @param {string | null | undefined} imageUrl - Path del activo.
 * @param {string} fallback - Imagen de respaldo.
 */
export function getImageUrl(imageUrl: string | null | undefined, fallback = FALLBACK_IMAGE): string {
  if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
    return imageUrl;
  }
  return fallback;
}
