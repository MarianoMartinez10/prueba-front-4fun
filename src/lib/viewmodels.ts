// =============================================================================
// CAPA DE VIEWMODELS — Arquitectura POO para Frontend React/Next.js 15
// =============================================================================
// Estrategia: Las clases ViewModel encapsulan TODA la lógica de presentación.
// Los componentes funcionales de React solo instancian y consumen estas clases.
// Esto garantiza los 4 pilares POO sin violar las reglas de React 19 / Next.js 15.
// =============================================================================

import type { Product, Order, OrderStatus } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// PILAR 1 — ABSTRACCIÓN
// BaseViewModel es una clase abstracta: define el contrato que todos los
// ViewModels deben cumplir sin implementar la lógica concreta de cada uno.
// No puede instanciarse directamente (new BaseViewModel() → Error).
// ─────────────────────────────────────────────────────────────────────────────

export abstract class BaseViewModel<T> {
  // PILAR 4 — ENCAPSULAMIENTO: _data es accesible desde hijos y consumidores
  // para usos de mutación (ej: pasar el ID a un handler),
  // pero la LÓGICA de presentación siempre va encapsulada en los métodos del ViewModel.
  public readonly _data: T;

  constructor(data: T) {
    this._data = data;
  }

  // Método abstracto: cada subclase DEBE implementarlo con su propia lógica.
  // Esto es el contrato de la abstracción.
  abstract getDisplayId(): string;

  // PILAR 3 — POLIMORFISMO: cada subclase sobreescribe toDisplayPrice()
  // para calcular el precio de forma diferente según las reglas de su dominio.
  abstract toDisplayPrice(): string;

  // Template Method — lógica compartida que usa los métodos abstractos.
  // Los hijos heredan este comportamiento sin reimplementarlo.
  getSummaryLine(): string {
    return `[${this.getDisplayId()}] — ${this.toDisplayPrice()}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PILAR 2 — HERENCIA + PILAR 3 — POLIMORFISMO
// ProductViewModel extiende BaseViewModel<Product>.
// Hereda getDisplayId() base pero sobreescribe toDisplayPrice() con lógica
// de descuentos específica del dominio Producto.
// ─────────────────────────────────────────────────────────────────────────────

export class ProductViewModel extends BaseViewModel<Product> {

  // ── PILAR 4: ENCAPSULAMIENTO ──────────────────────────────────────────────
  // El estado interno de descuento se calcula UNA VEZ en el constructor
  // y se protege como privado. Los componentes solo llaman a los getters.
  private readonly _isOnSale: boolean;
  private readonly _finalPrice: number;
  private readonly _discountLabel: string;

  constructor(product: Product) {
    super(product);  // Herencia: llama al constructor de BaseViewModel

    // Toda la lógica de presentación queda encapsulada aquí, fuera del componente
    this._isOnSale =
      (product.discountPercentage ?? 0) > 0 &&
      (product.finalPrice ?? product.price) < product.price;

    this._finalPrice = this._isOnSale
      ? product.finalPrice ?? product.price * (1 - (product.discountPercentage ?? 0) / 100)
      : product.price;

    this._discountLabel = this._isOnSale
      ? `-${product.discountPercentage}%`
      : '';
  }

  // ── PILAR 1: ABSTRACCIÓN — Implementación del contrato de BaseViewModel ───
  getDisplayId(): string {
    return this._data.id ?? 'sin-id';
  }

  // ── PILAR 3: POLIMORFISMO — Sobreescribe BaseViewModel.toDisplayPrice() ───
  // La lógica aquí es diferente a la de OrderViewModel: aplica descuentos.
  toDisplayPrice(): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(this._finalPrice);
  }

  // ── Getters públicos (API del ViewModel) ──────────────────────────────────

  /** Precio original sin descuento formateado */
  getOriginalPrice(): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(this._data.price);
  }

  /** Precio final calculado (número) */
  getFinalPrice(): number {
    return this._finalPrice;
  }

  /** ¿Está el producto en oferta? */
  isOnSale(): boolean {
    return this._isOnSale;
  }

  /** Badge de descuento para mostrar en tarjeta ("-20%") */
  getDiscountBadge(): string {
    return this._discountLabel;
  }

  /** ¿Hay stock disponible? */
  hasStock(): boolean {
    return (this._data.stock ?? 0) > 0;
  }

  /** Badge de disponibilidad de stock */
  getStockBadge(): 'available' | 'low' | 'out' {
    const stock = this._data.stock ?? 0;
    if (stock === 0) return 'out';
    if (stock <= 5) return 'low';
    return 'available';
  }

  /** Tipo de producto en español */
  getTypeLabel(): string {
    return this._data.type === 'Physical' ? 'Físico' : 'Key Digital';
  }

  /** Nombre de plataforma normalizado */
  getPlatformName(): string {
    return this._data.platform?.name ?? 'Plataforma';
  }

  /** Nombre de género normalizado */
  getGenreName(): string {
    return this._data.genre?.name ?? 'Género';
  }

  /** URL de imagen con fallback */
  getImageUrl(): string {
    const url = this._data.imageId;
    if (url && (url.startsWith('http') || url.startsWith('/'))) return url;
    return 'https://placehold.co/600x400?text=No+Image';
  }

  /** Datos para fila de reporte CSV/PDF — abstrae el formato */
  toReportRow(): string[] {
    return [
      this._data.id,
      this._data.name,
      this._data.platform?.name ?? '',
      this._data.genre?.name ?? '',
      this.getOriginalPrice(),
      this.toDisplayPrice(),
      this.getDiscountBadge() || 'Sin descuento',
      String(this._data.stock ?? 0),
      this._data.type,
    ];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PILAR 2 — HERENCIA: OrderViewModel extiende BaseViewModel<Order>
// PILAR 3 — POLIMORFISMO: reimplementa toDisplayPrice() con lógica de Orden
// (totalPrice en lugar de precio con descuento)
// ─────────────────────────────────────────────────────────────────────────────

// Mapa de estados → etiquetas en español (encapsulado en la clase, no global)
const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

// Mapa de variantes de Badge por estado (lógica de presentación, no del componente)
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
const ORDER_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  delivered: 'default',
  processing: 'default',
  pending: 'outline',
  shipped: 'default',
  cancelled: 'destructive',
};
const ORDER_STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-500 hover:bg-green-600',
  processing: 'bg-blue-500 hover:bg-blue-600',
  pending: 'text-yellow-600 border-yellow-600',
  shipped: 'bg-purple-500 hover:bg-purple-600',
  cancelled: '',
};

export class OrderViewModel extends BaseViewModel<Order> {

  // ── PILAR 4: ENCAPSULAMIENTO ──────────────────────────────────────────────
  private readonly _total: number;
  private readonly _status: string;
  private readonly _customerName: string;
  private readonly _customerEmail: string;

  constructor(order: Order) {
    super(order);

    // Normalización de campos (el backend puede devolver total o totalPrice)
    this._total = Number(order.totalPrice ?? order.total ?? 0);
    this._status = order.orderStatus ?? order.status ?? 'pending';

    // Lógica de resolución del cliente encapsulada en el ViewModel
    this._customerName =
      order.user?.name ??
      order.shippingAddress?.fullName ??
      'Cliente';

    this._customerEmail = order.user?.email ?? '';
  }

  // ── PILAR 1: ABSTRACCIÓN — Implementación del contrato de BaseViewModel ───
  getDisplayId(): string {
    // Muestra solo los últimos 8 caracteres del UUID (legible)
    return (this._data.id ?? '').slice(-8).toUpperCase();
  }

  // ── PILAR 3: POLIMORFISMO — Sobreescribe BaseViewModel.toDisplayPrice() ───
  // Diferente a ProductViewModel: no hay descuento, solo el total de la orden.
  toDisplayPrice(): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(this._total);
  }

  // ── Getters públicos ──────────────────────────────────────────────────────

  getCustomerName(): string { return this._customerName; }
  getCustomerEmail(): string { return this._customerEmail; }
  getTotal(): number { return this._total; }
  isPaid(): boolean { return this._data.isPaid ?? false; }

  /** Estado de la orden como etiqueta en español */
  getStatusLabel(): string {
    return ORDER_STATUS_LABELS[this._status] ?? this._status;
  }

  /** Variante del Badge de shadcn/ui para el estado */
  getStatusBadgeVariant(): BadgeVariant {
    return ORDER_STATUS_VARIANTS[this._status] ?? 'secondary';
  }

  /** Clase CSS de color para el Badge de estado */
  getStatusBadgeColor(): string {
    return ORDER_STATUS_COLORS[this._status] ?? '';
  }

  /** Fecha creación formateada en es-AR */
  getFormattedDate(): string {
    return new Date(this._data.createdAt).toLocaleDateString('es-AR');
  }

  /** Estado de pago como label y color */
  getPaymentStatus(): { label: string; color: string } {
    return this._data.isPaid
      ? { label: 'Pagado', color: 'text-green-600 border-green-600' }
      : { label: 'Sin pagar', color: 'text-red-500 border-red-500' };
  }

  /** Datos para reporte CSV/PDF */
  toReportRow(): string[] {
    return [
      this._data.id,
      this._customerName,
      this._customerEmail,
      this._data.paymentMethod ?? 'mercadopago',
      String(this._total),
      this.getStatusLabel(),
      this.isPaid() ? 'Pagado' : 'Pendiente',
      this.getFormattedDate(),
    ];
  }
}
