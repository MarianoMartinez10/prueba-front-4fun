import type { IProductComponent } from '@/domain/interfaces/IProductComponent';
import type { Product } from '@/lib/schemas';

/** Fallback de imagen absorbido desde constants.ts. */
export const FALLBACK_IMAGE = 'https://placehold.co/600x400/png?text=4Fun';

/**
 * Clase de Entidad: Producto (Composite — Leaf)
 * --------------------------------------------------------------------------
 * Meyer OOSC2 §22 — Clases de Entidad:
 *   Modela un producto del catálogo con su comportamiento de negocio.
 *   La UI nunca debe calcular precios ni determinar disponibilidad por sí misma.
 *
 * Patrón GoF: Composite — Leaf
 *   "Represents leaf objects in the composition. A leaf has no children."
 *   Implementa IProductComponent para ser intercambiable con BundleEntity.
 *
 * Design by Contract (Meyer §11):
 *   @invariant this._data.price >= 0
 *   @invariant this._data.id !== ''
 */
export class ProductEntity implements IProductComponent {
  private readonly _data: Product;

  constructor(data: Product) {
    // ─── Design by Contract — Precondiciones ───
    if (!data.id) {
      throw new Error('[ProductEntity] Contract violation: id is required');
    }
    if (!data.name || data.name.length < 1) {
      throw new Error('[ProductEntity] Contract violation: name is required');
    }
    if (data.price < 0) {
      throw new Error('[ProductEntity] Contract violation: price cannot be negative');
    }
    this._data = data;
  }

  // ─── IProductComponent — Contrato Composite ───

  getId(): string { return this._data.id; }

  getDisplayName(): string { return this._data.name; }

  /**
   * Calcula el precio con descuento aplicado.
   * @postcondition resultado >= 0
   */
  getDiscountedPrice(): number {
    const discount = this._data.discountPercentage ?? 0;
    if (discount <= 0) return this._data.price;
    // Verifica vigencia del descuento si hay fecha de expiración
    if (this._data.discountEndDate && new Date(this._data.discountEndDate) < new Date()) {
      return this._data.price;
    }
    return this._data.price * (1 - discount / 100);
  }

  getDisplayPrice(): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
      .format(this.getDiscountedPrice());
  }

  isOnDiscount(): boolean {
    const discount = this._data.discountPercentage ?? 0;
    if (discount <= 0) return false;
    if (this._data.discountEndDate) {
      return new Date(this._data.discountEndDate) > new Date();
    }
    return true;
  }

  isAvailable(): boolean {
    return (this._data.stock ?? 0) > 0 && (this._data.active !== false);
  }

  /** Retorna URL de imagen con fallback garantizado. */
  getImageUrl(): string {
    const url = this._data.imageId;
    if (!url) return FALLBACK_IMAGE;
    return (url.startsWith('http') || url.startsWith('/')) ? url : FALLBACK_IMAGE;
  }

  getDisplayType(): string {
    return this._data.type === 'Digital' ? 'Digital' : 'Físico';
  }

  toReportRow(): string[] {
    return [
      this._data.id,
      this._data.name,
      this.getPlatformName(),
      this.getDisplayPrice(),
      String(this._data.stock ?? 0),
      this._data.type,
    ];
  }

  // ─── Comportamiento de Catálogo (específico de Leaf) ───

  getPlatformName(): string {
    return typeof this._data.platform === 'object'
      ? (this._data.platform?.name ?? 'General')
      : 'General';
  }

  getGenreName(): string {
    return typeof this._data.genre === 'object'
      ? (this._data.genre?.name ?? 'Varios')
      : 'Varios';
  }

  /** Precio original sin descuento, formateado. */
  getOriginalPrice(): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
      .format(this._data.price);
  }

  getDiscountBadge(): string {
    return `-${this._data.discountPercentage ?? 0}%`;
  }

  /** Estado de stock para badges visuales en la UI. */
  getStockStatus(): 'available' | 'low' | 'out' {
    const stock = this._data.stock ?? 0;
    if (stock === 0) return 'out';
    if (stock <= 5) return 'low';
    return 'available';
  }

  getDeveloper(): string {
    return this._data.developer ?? 'Desconocido';
  }

  get rawPrice(): number { return this._data.price; }
  get stock(): number { return this._data.stock ?? 0; }
  get type(): string { return this._data.type; }
  get discountPercentage(): number { return this._data.discountPercentage ?? 0; }
  get developer(): string | null | undefined { return this._data.developer; }
  get sellerId(): string | null | undefined { return this._data.sellerId; }

  /** Acceso controlado al dato raw para compatibilidad con ViewModels legados. */
  getRawData(): Product { return this._data; }

  // ─── ViewModel Aliases (Promoted for Redundancy Elimination) ───

  getDisplayId(): string { return this.getId(); }
  toDisplayPrice(): string { return this.getDisplayPrice(); }
  isOnSale(): boolean { return this.isOnDiscount(); }
  hasStock(): boolean { return this.isAvailable(); }
  getStockBadge(): 'available' | 'low' | 'out' { return this.getStockStatus(); }
}
