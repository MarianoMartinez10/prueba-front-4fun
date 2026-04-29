import type { User } from './UserEntity';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image?: string;
  platformName?: string;
  platform?: { name: string };
}

/**
 * RN - Transacción: Estructura de orden de compra (DTO).
 */
export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  isPaid?: boolean;
  digitalKeys?: { productoId: string; clave: string }[];
  paymentId?: string;
  paymentMethod: string;
  paymentLink?: string;
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    zip: string;
    country: string;
  };
  // RN - Normalización: Soporte para campos de esquemas legacy del backend.
  totalPrice?: number;
  orderItems?: CartItem[];
  orderStatus?: string;
}

/**
 * Clase de Entidad: Orden (Registro Transaccional)
 * --------------------------------------------------------------------------
 * Meyer OOSC2 §22 — Clases de Entidad:
 *   "An entity class models a real-world object with well-defined identity
 *    and lifecycle. State transitions are controlled by the class itself."
 *
 * Principio de Ocultamiento (Meyer §7.8):
 *   La UI nunca compara order.status === 'DELIVERED'. Llama a isDelivered().
 *   Los labels de estado, colores y lógica de mutabilidad viven aquí.
 *
 * Design by Contract (Meyer §11):
 *   @invariant this._data.id !== ''
 *   @invariant this._data.total >= 0
 */
export class OrderEntity {
  private readonly _data: Order;

  /**
   * Estados en los que la orden puede aún modificarse (ciclo de vida abierto).
   * Constantes de clase — conocimiento del dominio encapsulado.
   */
  private static readonly EDITABLE_STATUSES: string[] = ['PENDING', 'PROCESSING'];
  private static readonly CANCELLABLE_STATUSES: string[] = ['PENDING'];

  constructor(data: Order) {
    // ─── Design by Contract — Precondiciones ───
    if (!data.id) {
      throw new Error('[OrderEntity] Contract violation: id is required');
    }
    if ((data.totalPrice ?? data.total ?? 0) < 0) {
      throw new Error('[OrderEntity] Contract violation: total cannot be negative');
    }
    this._data = data;
  }

  // ─── Accessors ───

  get id(): string { return this._data.id; }
  get isPaid(): boolean { return this._data.isPaid ?? false; }
  get createdAt(): string { return this._data.createdAt; }
  get items(): any[] { return this._data.orderItems ?? this._data.items ?? []; }
  get user(): any { return this._data.user; }
  get shippingAddress(): any { return this._data.shippingAddress; }
  get paymentMethod(): string { return this._data.paymentMethod ?? ''; }

  /** Normaliza el status a UPPERCASE para compatibilidad con Enum 3NF. */
  get status(): string {
    return (this._data.status ?? this._data.orderStatus ?? 'PENDING').toUpperCase();
  }

  get total(): number {
    return Number(this._data.totalPrice ?? this._data.total ?? 0);
  }

  // ─── Ciclo de Vida Transaccional ───

  /**
   * La orden puede ser modificada (ej: actualizar dirección).
   * @postcondition Solo true en estados PENDING o PROCESSING.
   */
  isEditable(): boolean {
    return OrderEntity.EDITABLE_STATUSES.includes(this.status);
  }

  /**
   * La orden puede ser cancelada por el cliente.
   * @postcondition Solo true en estado PENDING.
   */
  isCancellable(): boolean {
    return OrderEntity.CANCELLABLE_STATUSES.includes(this.status);
  }

  isPending(): boolean { return this.status === 'PENDING'; }
  isProcessing(): boolean { return this.status === 'PROCESSING'; }
  isShipped(): boolean { return this.status === 'SHIPPED'; }
  isDelivered(): boolean { return this.status === 'DELIVERED'; }
  isCancelled(): boolean { return this.status === 'CANCELLED'; }

  // ─── Display Helpers ───

  /** Label en español del estado actual. Centraliza el diccionario de traducción. */
  getStatusLabel(): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      PROCESSING: 'Procesando',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
    };
    return labels[this.status] ?? this.status;
  }

  /** Clases CSS de color para el badge de estado. */
  getStatusColor(): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      SHIPPED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      DELIVERED: 'bg-green-500/10 text-green-400 border-green-500/20',
      CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[this.status] ?? '';
  }

  getPaymentStatus(): { label: string; color: string } {
    return this.isPaid
      ? { label: 'Liquidado', color: 'text-green-400' }
      : { label: 'Pendiente de Pago', color: 'text-yellow-500' };
  }

  /** ID truncado para display (últimos 8 caracteres en mayúscula). */
  getDisplayId(): string {
    return `#${this.id.slice(-8).toUpperCase()}`;
  }


  getDisplayTotal(): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
      .format(this.total);
  }

  getFormattedDate(): string {
    return new Date(this.createdAt).toLocaleDateString('es-AR');
  }

  getCustomerName(): string {
    return this._data.user?.name ?? 'Invitado';
  }

  /** Serializa para reportes PDF/CSV. */
  toReportRow(): string[] {
    return [
      this.getDisplayId(),
      this.getCustomerName(),
      this.getDisplayTotal(),
      this.getStatusLabel(),
      this.isPaid ? 'PAGADO' : 'PENDIENTE',
      this.getFormattedDate(),
    ];
  }

  // ─── Presentation Logic (Promoted from ViewModel) ───

  getStatusBadgeVariant(): "default" | "secondary" | "destructive" | "outline" {
    const map: Record<string, any> = {
      PENDING: 'secondary',
      PROCESSING: 'default',
      SHIPPED: 'default',
      DELIVERED: 'outline',
      CANCELLED: 'destructive',
    };
    return map[this.status] ?? 'default';
  }

  getCustomerEmail(): string {
    return this._data.user?.email || 'N/A';
  }

  getDisplayPrice(): string {
    return this.getDisplayTotal();
  }

  getOrderDate(): string {
    return this.getFormattedDate();
  }

  /** Acceso controlado al dato raw para compatibilidad con ViewModels legados. */
  getRawData(): Order { return this._data; }
}
