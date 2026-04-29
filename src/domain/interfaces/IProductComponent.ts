/**
 * Patrón GoF: Composite — Contrato de Componente
 * --------------------------------------------------------------------------
 * Define la interfaz uniforme que comparten ProductEntity (Leaf) y
 * BundleEntity (Composite). La capa de UI trata ambos de forma idéntica.
 *
 * GoF §Composite — Participant: Component
 *   "Declares the interface for objects in the composition."
 *
 * Meyer OOSC2 §7.8 — Ocultamiento de Información:
 *   La UI solo conoce esta interfaz pública. Nunca accede a la
 *   representación interna (precio base, array de componentes, etc.).
 */
export interface IProductComponent {
  /** Identificador único del componente. */
  getId(): string;

  /** Nombre de display. */
  getDisplayName(): string;

  /**
   * Precio final con descuentos aplicados.
   * @postcondition El valor retornado es siempre >= 0.
   */
  getDiscountedPrice(): number;

  /** Precio formateado para la UI (ej: "$ 1.500,00"). */
  getDisplayPrice(): string;

  /** True si el componente tiene un descuento activo. */
  isOnDiscount(): boolean;

  /**
   * True si el componente puede ser comprado en este momento.
   * Para Leaf (ProductEntity): stock > 0. Para Composite (BundleEntity): todos disponibles.
   */
  isAvailable(): boolean;

  /** URL de la imagen principal, con fallback garantizado. */
  getImageUrl(): string;

  /** Tipo de display: 'Digital', 'Físico' o 'Bundle'. */
  getDisplayType(): string;

  /** Serializa el componente para reportes PDF/CSV. */
  toReportRow(): string[];
}
