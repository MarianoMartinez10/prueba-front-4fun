import type { IProductComponent } from '@/domain/interfaces/IProductComponent';

/**
 * Clase de Entidad: Bundle (Composite — Nodo Compuesto)
 * --------------------------------------------------------------------------
 * Patrón GoF: Composite — Concrete Composite
 *   "Defines behavior for components having children. Stores child components."
 *   "Implements child-related operations in the Component interface."
 *   — GoF §Composite, p. 168
 *
 * Clase de Demostración para la Tesis TFI (UTN-FRT):
 *   Ilustra cómo una colección de IProductComponent puede tratarse
 *   uniformemente como si fuese un único producto. La UI renderiza un
 *   BundleEntity con el mismo <ProductCard /> que un ProductEntity.
 *
 * Design by Contract (Meyer OOSC2 §11):
 *   @invariant this._components.length > 0
 *   @invariant this._discountPercentage ∈ [0, 100]
 *   @invariant this.getDiscountedPrice() <= suma de precios individuales
 *
 * Nota de Implementación:
 *   BundleEntity es inmutable una vez construido. El método add() retorna
 *   un nuevo BundleEntity (patrón de valor inmutable), evitando mutaciones
 *   que violarían las invariantes de clase.
 */
export class BundleEntity implements IProductComponent {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _components: IProductComponent[];
  private readonly _discountPercentage: number;
  private readonly _imageUrl: string;

  constructor(
    id: string,
    name: string,
    components: IProductComponent[],
    discountPercentage: number = 10,
    imageUrl: string = ''
  ) {
    // ─── Design by Contract — Precondiciones ───
    if (!id) throw new Error('[BundleEntity] Contract violation: id is required');
    if (!name) throw new Error('[BundleEntity] Contract violation: name is required');
    if (components.length === 0) {
      throw new Error('[BundleEntity] Contract violation: a bundle must have at least one component');
    }
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new Error(
        `[BundleEntity] Contract violation: discountPercentage must be ∈ [0,100], got ${discountPercentage}`
      );
    }

    this._id = id;
    this._name = name;
    this._components = [...components]; // Copia defensiva
    this._discountPercentage = discountPercentage;
    this._imageUrl = imageUrl;
  }

  // ─── Gestión del Árbol Composite ───

  /**
   * Agrega un componente al bundle.
   * Retorna un NUEVO BundleEntity (inmutabilidad garantizada).
   * @postcondition result.getComponentCount() === this.getComponentCount() + 1
   */
  add(component: IProductComponent): BundleEntity {
    return new BundleEntity(
      this._id,
      this._name,
      [...this._components, component],
      this._discountPercentage,
      this._imageUrl
    );
  }

  /** Retorna copia del array de componentes (protección de encapsulamiento). */
  getChildren(): IProductComponent[] { return [...this._components]; }

  getComponentCount(): number { return this._components.length; }

  // ─── IProductComponent — Contrato Composite ───

  getId(): string { return this._id; }

  getDisplayName(): string { return this._name; }

  /**
   * Precio total del bundle con descuento de paquete aplicado.
   * Se calcula sumando el precio descontado de TODOS los componentes
   * y aplicando el descuento adicional del bundle.
   * @postcondition resultado >= 0
   */
  getDiscountedPrice(): number {
    const subtotal = this._components.reduce(
      (sum, component) => sum + component.getDiscountedPrice(),
      0
    );
    return subtotal * (1 - this._discountPercentage / 100);
  }

  getDisplayPrice(): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
      .format(this.getDiscountedPrice());
  }

  isOnDiscount(): boolean { return this._discountPercentage > 0; }

  /**
   * El bundle está disponible SOLO si TODOS sus componentes están disponibles.
   * Semántica de conjunción (AND lógico) sobre los hijos.
   * @postcondition true → todos los componentes isAvailable() === true
   */
  isAvailable(): boolean {
    return this._components.every(component => component.isAvailable());
  }

  /** Usa la imagen del primer componente como representación visual del bundle. */
  getImageUrl(): string {
    if (this._imageUrl) return this._imageUrl;
    return this._components[0]?.getImageUrl()
      ?? 'https://placehold.co/600x400/png?text=Bundle';
  }

  getDisplayType(): string { return 'Bundle'; }

  toReportRow(): string[] {
    return [
      this._id,
      this._name,
      'Bundle',
      this.getDisplayPrice(),
      `${this._components.length} productos`,
      'Bundle',
    ];
  }

  // ─── Display Helpers adicionales ───

  getDiscountBadge(): string { return `-${this._discountPercentage}%`; }

  /** Precio total sin el descuento del bundle (suma de precios individuales). */
  getOriginalPrice(): string {
    const subtotal = this._components.reduce(
      (sum, c) => sum + c.getDiscountedPrice(),
      0
    );
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
      .format(subtotal);
  }
}
