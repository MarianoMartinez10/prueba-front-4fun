/**
 * Capa de Dominio: Contratos de Datos (Types & Interfaces)
 * --------------------------------------------------------------------------
 * Define la estructura de los objetos del sistema. Garantiza el tipado 
 * estático y actúa como especificación técnica de las entidades de negocio.
 */

// ─── ENTIDADES DE REFERENCIA ───

/**
 * RN - Taxonomía: Interfaz base para entidades maestras (Plataformas, Géneros).
 */
export interface ReferenceEntity {
  id: string;
  name: string;
  imageId: string;
  active?: boolean;
}

export type Platform = ReferenceEntity;
export type Genre = ReferenceEntity;
export type Category = ReferenceEntity;

// ─── ENTIDAD PRODUCTO (GAMES) ───

import type { Product } from './schemas';
/**
 * RN - Unificación: Alias de compatibilidad para el dominio de Juegos.
 */
export type Game = Product;
export type { Product } from './schemas';

export interface ProductInput {
  name: string;
  description: string;
  price: number | string;
  platformId: string;
  genreId: string;
  type: string;
  developer: string;
  imageUrl?: string;
  trailerUrl?: string;
  stock: number | string;
  specPreset?: string;
  discountPercentage?: number | string;
  discountEndDate?: string | null;
}

// ─── ENTIDAD USUARIO & SESIÓN ───

/**
 * RN - Identidad: Perfil del usuario autenticado.
 */
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  isVerified?: boolean;
  createdAt?: string;
};

// ─── DOMINIO TRANSACCIONAL (CART & ORDERS) ───

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  platformName?: string;
  platform?: { name: string };
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * RN - Auditoría: Estructura del ticket de compra y trazabilidad.
 */
export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: CartItem[];
  orderItems?: CartItem[];
  total: number;
  totalPrice?: number;
  status: OrderStatus;
  orderStatus?: string;
  isPaid?: boolean;
  digitalKeys?: { productoId: string; clave: string }[];
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    zip: string;
    country: string;
  };
  paymentMethod: string;
  paymentLink?: string;
}

// ─── DOMINIO DE FEEDBACK (REVIEWS) ───

export type ReviewSentiment = 'positive' | 'neutral' | 'negative' | 'mixed';

/**
 * RN - Feedback: Contrato de reseñas con análisis de sentimiento IA.
 */
export interface Review {
  id: string;
  user: { id: string; name: string; avatar?: string | null };
  productId: string;
  rating: number;
  title: string;
  text: string;
  sentiment: ReviewSentiment | null;
  sentimentScore: number | null;
  sentimentKeywords: string[];
  verified: boolean;
  helpfulCount: number;
  createdAt: string;
}

/**
 * Métricas agregadas de feedback para análisis administrativo.
 */
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
  sentiment: Record<string, number>;
}

// ─── RESPUESTAS DE RED (INFRASTRUCTURE) ───

export type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  products: T[];
  meta: Meta;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: Meta;
};