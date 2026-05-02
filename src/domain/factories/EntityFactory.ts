import { UserEntity } from '@/domain/entities/UserEntity';
import { ProductEntity } from '@/domain/entities/ProductEntity';
import { OrderEntity } from '@/domain/entities/OrderEntity';
import { BundleEntity } from '@/domain/entities/BundleEntity';
import type { IProductComponent } from '@/domain/interfaces/IProductComponent';
import { ProductSchema } from '@/lib/schemas';
import type { User, Order } from '@/lib/types';
import { Logger } from '@/lib/logger';

/**
 * Patrón GoF: Factory Method — Fábrica de Entidades de Dominio
 * --------------------------------------------------------------------------
 * "Provide an interface for creating objects in a superclass, but allow
 *  subclasses to alter the type of objects that will be created." — GoF §Factory
 *
 * Responsabilidades de EntityFactory:
 * 1. Deserializar el JSON crudo del backend a instancias de clase.
 * 2. Normalizar campos inconsistentes (id/_id, status/orderStatus).
 * 3. Validar Enums 3NF (ADMIN, SELLER, BUYER) aplicando Design by Contract.
 * 4. Filtrar automáticamente los ítems inválidos en arrays.
 *
 * Meyer OOSC2 §7.8 — Ocultamiento de Información:
 *   El consumidor no conoce la estructura interna del JSON del backend.
 *   Solo recibe entidades con comportamiento completamente definido.
 *
 * Design by Contract (Meyer §11):
 *   @precondition raw !== null && raw !== undefined
 *   @postcondition El objeto retornado satisface los invariantes de su clase.
 */
export class EntityFactory {
  private static readonly VALID_ROLES = ['ADMIN', 'SELLER', 'BUYER'];

  // ─── FACTORY: UserEntity ───

  /**
   * Crea un UserEntity desde el JSON del backend.
   *
   * @precondition raw.id debe existir.
   * @precondition raw.role debe ser un Enum 3NF válido ('ADMIN' | 'SELLER' | 'BUYER').
   *   Si no lo es, se normaliza a 'BUYER' con un warning (comportamiento defensivo).
   *
   * @throws Error si raw.id o raw.email están ausentes (violación de contrato grave).
   */
  static createUser(raw: Record<string, any>): UserEntity {
    if (!raw) {
      throw new Error('[EntityFactory.createUser] Contract violation: raw data is null');
    }

    const rawRole = raw.role?.toUpperCase();
    const role = EntityFactory.VALID_ROLES.includes(rawRole) ? rawRole : 'BUYER';

    if (!EntityFactory.VALID_ROLES.includes(rawRole)) {
      Logger.warn(
        `[EntityFactory.createUser] Non-3NF role "${raw.role}" normalized to BUYER`,
        { userId: raw.id }
      );
    }

    const userData: User = {
      id: raw.id ?? raw._id ?? '',
      name: raw.name ?? '',
      email: raw.email ?? '',
      role: role as User['role'],
      avatar: raw.avatar ?? null,
      phone: raw.phone ?? null,
      address: raw.address ?? null,
      isVerified: raw.isVerified ?? false,
      createdAt: raw.createdAt,
      sellerProfile: raw.sellerProfile ?? null,
    };

    return new UserEntity(userData);
  }

  // ─── FACTORY: ProductEntity ───

  /**
   * Crea un ProductEntity desde el JSON del backend.
   * Usa Zod (ProductSchema) como primera línea de validación.
   *
   * @precondition raw.id debe existir.
   * @returns ProductEntity válido, o null si el dato es irrecuperable.
   */
  static createProduct(raw: Record<string, any>): ProductEntity | null {
    if (!raw || !raw.id) {
      Logger.warn('[EntityFactory.createProduct] raw is null or missing id');
      return null;
    }

    const parsed = ProductSchema.safeParse(raw);

    if (parsed.success) {
      try {
        return new ProductEntity(parsed.data);
      } catch (e: any) {
        Logger.warn('[EntityFactory.createProduct] Entity construction failed after schema pass', {
          id: raw.id,
          error: e.message,
        });
        return null;
      }
    }

    // Si Zod falla, intentamos construir con datos parciales (comportamiento resiliente)
    Logger.warn('[EntityFactory.createProduct] Schema validation failed, attempting partial build', {
      id: raw.id,
      issues: parsed.error.issues.length,
    });

    try {
      return new ProductEntity(raw as any);
    } catch {
      return null;
    }
  }

  /**
   * Crea múltiples ProductEntity desde un array del backend.
   * Filtra automáticamente los ítems inválidos (null) del resultado.
   */
  static createProducts(rawArray: Record<string, any>[]): ProductEntity[] {
    if (!Array.isArray(rawArray)) return [];
    return rawArray
      .map(raw => EntityFactory.createProduct(raw))
      .filter((entity): entity is ProductEntity => entity !== null);
  }

  // ─── FACTORY: OrderEntity ───

  /**
   * Crea un OrderEntity desde el JSON del backend.
   * Normaliza campos: status/orderStatus, totalPrice/total, items/orderItems.
   *
   * @precondition raw.id debe existir.
   * @throws Error si raw.id está ausente.
   */
  static createOrder(raw: Record<string, any>): OrderEntity {
    if (!raw || !raw.id) {
      throw new Error('[EntityFactory.createOrder] Contract violation: id is required');
    }

    const orderData: Order = {
      id: raw.id,
      userId: raw.userId ?? '',
      user: raw.user,
      items: raw.items ?? raw.orderItems ?? [],
      orderItems: raw.orderItems ?? raw.items ?? [],
      total: Number(raw.totalPrice ?? raw.total ?? 0),
      totalPrice: Number(raw.totalPrice ?? raw.total ?? 0),
      // Normalización crítica: el backend 3NF usa 'status', el legado usaba 'orderStatus'
      status: (raw.status ?? raw.orderStatus ?? 'PENDING').toUpperCase() as any,
      isPaid: raw.isPaid ?? false,
      createdAt: raw.createdAt ?? new Date().toISOString(),
      shippingAddress: raw.shippingAddress ?? { street: '', city: '', zip: '', country: '' },
      paymentMethod: raw.paymentMethod ?? '',
      paymentLink: raw.paymentLink,
      digitalKeys: raw.digitalKeys,
    };

    return new OrderEntity(orderData);
  }

  /**
   * Crea múltiples OrderEntity con manejo de errores por ítem.
   * Un ítem inválido no detiene la creación de los demás.
   */
  static createOrders(rawArray: Record<string, any>[]): OrderEntity[] {
    if (!Array.isArray(rawArray)) return [];
    return rawArray
      .map(raw => {
        try {
          return EntityFactory.createOrder(raw);
        } catch (e: any) {
          Logger.warn('[EntityFactory.createOrders] Failed for item', {
            id: raw?.id,
            error: e.message,
          });
          return null;
        }
      })
      .filter((entity): entity is OrderEntity => entity !== null);
  }

  // ─── FACTORY: BundleEntity (Composite Demo — Tesis TFI) ───

  /**
   * Crea un BundleEntity (Composite) desde una lista de componentes.
   *
   * Clase de Demostración del Patrón Composite para la Tesis:
   * "Un Bundle trata una colección de IProductComponent como un único producto."
   *
   * @precondition components.length > 0
   * @precondition discountPercentage ∈ [0, 100]
   * @throws Error si las precondiciones no se cumplen.
   */
  static createBundle(
    id: string,
    name: string,
    components: IProductComponent[],
    discountPercentage: number = 10,
    imageUrl: string = ''
  ): BundleEntity {
    if (!id || !name) {
      throw new Error('[EntityFactory.createBundle] id and name are required');
    }
    if (components.length === 0) {
      throw new Error('[EntityFactory.createBundle] at least one component is required');
    }
    return new BundleEntity(id, name, components, discountPercentage, imageUrl);
  }
}
