import { z } from 'zod';

/**
 * Capa de Dominio: Esquemas de Validación (Schemas)
 * --------------------------------------------------------------------------
 * Utiliza la librería Zod para garantizar la integridad de los datos 
 * (Type-Safety) tanto en la entrada (Formularios) como en la salida (Backend).
 * Vincula técnicamente las Reglas de Negocio (RN) de validación.
 */

// ─── DOMINIO: PRODUCTOS ───

/**
 * RN - Integridad de Catálogo: Define el contrato mínimo de un producto.
 * Valida tipos de datos forzando la consistencia entre Prisma y React.
 */
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción es muy corta'),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  finalPrice: z.number().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountEndDate: z.string().optional().nullable(),
  stock: z.number().int().min(0),
  active: z.boolean().optional(),
  type: z.enum(['Physical', 'Digital']),
  imageId: z.string().optional().nullable(),
  platform: z.object({ id: z.string(), name: z.string() }).optional(),
  genre: z.object({ id: z.string(), name: z.string() }).optional(),
  developer: z.string().optional().nullable(),
  trailerUrl: z.string().optional().nullable(),
  specPreset: z.string().optional().nullable(),
  releaseDate: z.string().optional().nullable(),
  requirements: z.object({
    os: z.string().optional(),
    processor: z.string().optional(),
    memory: z.string().optional(),
    graphics: z.string().optional(),
    storage: z.string().optional(),
  }).optional().nullable(),
  sellerId: z.string().optional().nullable(),
  seller: z.object({
    id: z.string(),
    name: z.string().nullable().optional(),
    storeName: z.string().nullable().optional(),
  }).optional().nullable(),
});

/**
 * RN - Gestión Administrativa: Esquema base para la creación/edición de registros.
 * Enfocado en la captura de IDs de relación y metadatos operativos.
 */
export const adminProductBaseSchema = z.object({
  name: z.string().min(2, 'Nombre obligatorio (mín 2 caracteres)'),
  description: z.string().min(10, 'Descripción obligatoria (mín 10 caracteres)'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  platformId: z.string().min(1, 'Seleccione una plataforma'),
  genreId: z.string().min(1, 'Seleccione un género'),
  type: z.enum(['Physical', 'Digital']),
  developer: z.string().optional(),
  specPreset: z.string().optional(),
  imageId: z.string().optional(),
  trailerUrl: z.string().optional(),
});

// ─── DOMINIO: SEGURIDAD Y AUTH ───

/**
 * RN - Políticas de Seguridad (Password): Fuerza un mínimo de robustez 
 * en las credenciales del usuario para prevenir vulnerabilidades de fuerza bruta.
 */
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

/**
 * RN - Registro de Identidad: Valida la captura de biometría básica.
 */
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Tipos inferidos para el motor de Tipado Progresivo de TypeScript.
export type Product = z.infer<typeof ProductSchema>;
export type AdminProductBaseValues = z.infer<typeof adminProductBaseSchema>;
export type LoginValues = z.infer<typeof LoginSchema>;
export type RegisterValues = z.infer<typeof RegisterSchema>;
export type RegisterPayload = Omit<RegisterValues, 'confirmPassword'>;
