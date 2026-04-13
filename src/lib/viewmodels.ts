/**
 * Capa de Presentación: ViewModels (MVVM Pattern)
 * --------------------------------------------------------------------------
 * Esta capa implementa los pilares de la Programación Orientada a Objetos (POO).
 */

import type { Product, Order } from './types';

export abstract class BaseViewModel<T> {
  public readonly _data: T;
  constructor(data: T) { this._data = data; }
  abstract getDisplayId(): string;
  abstract toDisplayPrice(): string;
  getSummaryLine(): string { return `[${this.getDisplayId()}] — ${this.toDisplayPrice()}`; }
  abstract toReportRow(): string[];
}

export class ProductViewModel extends BaseViewModel<Product> {
  constructor(product: Product) { super(product); }

  getDisplayId(): string { return this._data.id ?? 'sin-id'; }
  toDisplayPrice(): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this._data.finalPrice ?? this._data.price);
  }

  // Getters para UI
  isOnSale(): boolean { return (this._data.discountPercentage ?? 0) > 0; }
  getDiscountBadge(): string { return `-${this._data.discountPercentage}%`; }
  getOriginalPrice(): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(this._data.price);
  }
  hasStock(): boolean { return (this._data.stock ?? 0) > 0; }
  getStockBadge(): 'available' | 'low' | 'out' {
    const stock = this._data.stock ?? 0;
    if (stock === 0) return 'out';
    if (stock <= 5) return 'low';
    return 'available';
  }

  getPlatformName(): string { 
    return typeof this._data.platform === 'object' ? this._data.platform.name : (this._data.platform || 'General'); 
  }
  getGenreName(): string { 
    return typeof this._data.genre === 'object' ? this._data.genre.name : (this._data.genre || 'Varios'); 
  }

  getImageUrl(): string {
    const url = this._data.imageId;
    return (url && (url.startsWith('http') || url.startsWith('/'))) ? url : 'https://placehold.co/600x400?text=No+Image';
  }

  toReportRow(): string[] {
    return [
      this._data.id,
      this._data.name,
      this.getPlatformName(),
      this.toDisplayPrice(),
      String(this._data.stock ?? 0),
      this._data.type
    ];
  }
}

export class OrderViewModel extends BaseViewModel<Order> {
  constructor(order: Order) { super(order); }

  getDisplayId(): string { return (this._data.id ?? '').slice(-8).toUpperCase(); }
  toDisplayPrice(): string {
    const total = Number(this._data.totalPrice ?? this._data.total ?? 0);
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total);
  }

  // Getters para UI
  getCustomerName(): string { return this._data.user?.name || 'Invitado'; }
  getCustomerEmail(): string { return this._data.user?.email || 'N/A'; }
  isPaid(): boolean { return !!this._data.isPaid; }
  
  getStatusLabel(): string {
    const labels: Record<string, string> = { 
      pending: 'Pendiente', 
      processing: 'Procesando', 
      shipped: 'Enviado', 
      delivered: 'Entregado', 
      cancelled: 'Cancelado' 
    };
    return labels[this._data.orderStatus ?? 'pending'] || 'Pendiente';
  }

  getStatusBadgeVariant(): "default" | "secondary" | "destructive" | "outline" {
    const variants: Record<string, any> = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "outline",
      cancelled: "destructive"
    };
    return variants[this._data.orderStatus ?? 'pending'] || "default";
  }

  getStatusBadgeColor(): string {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      delivered: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20"
    };
    return colors[this._data.orderStatus ?? 'pending'] || "";
  }

  getPaymentStatus() {
    return this.isPaid() 
      ? { label: 'Pagado', color: 'text-green-500' } 
      : { label: 'Pendiente', color: 'text-yellow-500' };
  }

  getFormattedDate(): string {
    return new Date(this._data.createdAt).toLocaleDateString('es-AR');
  }

  toReportRow(): string[] {
    return [
      this.getDisplayId(),
      this.getCustomerName(),
      this.toDisplayPrice(),
      this.getStatusLabel(),
      this.isPaid() ? 'PAGADO' : 'PENDIENTE',
      this.getFormattedDate()
    ];
  }
}
