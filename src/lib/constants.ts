/**
 * Capa de Configuración: Constantes Globales (Constants)
 * --------------------------------------------------------------------------
 * ⚠️  REFACTORIZACIÓN POO (Purga de Obsolescencia):
 *
 *   - FALLBACK_IMAGE: ELIMINADO → Absorbido por ProductEntity.getImageUrl().
 *     La lógica de fallback ahora vive encapsulada en la clase de entidad.
 *
 *   - SPEC_PRESETS: Mantenido (configuración estática válida).
 *   - DEVELOPERS: Mantenido (catálogo de taxonomía estático).
 *
 * Para obtener la imagen de fallback, utiliza:
 *   import { ProductEntity } from '@/domain/entities/ProductEntity';
 *   const entity = new ProductEntity(data);
 *   entity.getImageUrl(); // ← Incluye fallback automático
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
