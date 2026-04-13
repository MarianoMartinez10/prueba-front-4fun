/**
 * Capa de Configuración: Semillas y Metadatos (Constants)
 * --------------------------------------------------------------------------
 * Almacena valores constantes inmutables que rigen el comportamiento global 
 * de la aplicación. Centraliza los diccionarios de datos no mutables. (Lib)
 */

/**
 * RN - Taxonomía Industrial: Listado predefinido de proveedores de desarrollo.
 * Garantiza la consistencia en la categorización de productos de terceros.
 */
export const DEVELOPERS = [
  'Nintendo',
  'Sony Interactive Entertainment',
  'Xbox Game Studios',
  'Tencent Games',
  'Ubisoft',
  'Electronic Arts (EA)',
  'Take-Two Interactive',
  'Activision Blizzard',
  'Capcom',
  'Bandai Namco Entertainment',
] as const;

/**
 * RN - Requerimientos Técnicos: Perfiles de hardware predefinidos.
 */
export const SPEC_PRESETS = ['Low', 'Mid', 'High'] as const;

/**
 * RN - Infraestructura de Fallback: URL de imagen por defecto.
 * Asegura que la UI no presente huecos visuales ante la ausencia de activos (Assets).
 */
export const FALLBACK_IMAGE = 'https://placehold.co/600x400/png?text=4Fun';
