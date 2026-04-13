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
  stock: z.number().int().min(0),
  type: z.enum(['Physical', 'Digital']),
  imageId: z.string().optional().nullable(),
  platform: z.object({ id: z.string(), name: z.string() }).optional(),
  genre: z.object({ id: z.string(), name: z.string() }).optional(),
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
export type LoginValues = z.infer<typeof LoginSchema>;
export type RegisterValues = z.infer<typeof RegisterSchema>;
export type RegisterPayload = Omit<RegisterValues, 'confirmPassword'>;
