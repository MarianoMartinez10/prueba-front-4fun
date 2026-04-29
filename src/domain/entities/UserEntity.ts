export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface SellerProfile {
  storeName: string;
  storeDescription?: string | null;
  isApproved: boolean;
}

/**
 * RN - Identidad: Perfil del usuario autenticado (DTO).
 */
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  isVerified?: boolean;
  createdAt?: string;
  sellerProfile?: SellerProfile | null;
  isApproved?: boolean;
};

/**
 * Clase de Entidad: Usuario
 * --------------------------------------------------------------------------
 * Meyer OOSC2 §22 — Clases de Entidad:
 *   "An entity class models a real-world object that has long-term persistence
 *    and well-defined identity. It encapsulates state AND behavior."
 *
 * Principio de Ocultamiento de Información (Meyer §7.8):
 *   Los campos internos son privados. La capa de UI nunca compara
 *   strings de roles directamente. Toda lógica RBAC vive aquí.
 *
 * Design by Contract (Meyer §11):
 *   @invariant this._role ∈ { 'ADMIN', 'SELLER', 'BUYER' } (Enum 3NF)
 *   @invariant this._id !== '' && this._email !== ''
 */
export class UserEntity {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _email: string;
  private readonly _role: UserRole;
  private readonly _avatar: string | null | undefined;
  private readonly _phone: string | null | undefined;
  private readonly _address: string | null | undefined;
  private readonly _isVerified: boolean;
  private readonly _createdAt: string | undefined;
  private readonly _sellerProfile: SellerProfile | null | undefined;

  private static readonly VALID_ROLES: UserRole[] = ['BUYER', 'SELLER', 'ADMIN'];

  constructor(data: User) {
    // ─── Design by Contract — Precondiciones ───
    if (!data.id) {
      throw new Error('[UserEntity] Contract violation: id is required');
    }
    if (!data.email) {
      throw new Error('[UserEntity] Contract violation: email is required');
    }
    if (!UserEntity.VALID_ROLES.includes(data.role)) {
      throw new Error(
        `[UserEntity] Contract violation: invalid role "${data.role}". Must be SCREAMING_CASE 3NF Enum.`
      );
    }

    this._id = data.id;
    this._name = data.name ?? '';
    this._email = data.email;
    this._role = data.role;
    this._avatar = data.avatar;
    this._phone = data.phone;
    this._address = data.address;
    this._isVerified = data.isVerified ?? false;
    this._createdAt = data.createdAt;
    this._sellerProfile = data.sellerProfile;
  }

  // ─── Accessors (Información Mínima Expuesta) ───

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get role(): UserRole { return this._role; }
  get avatar(): string | null | undefined { return this._avatar; }
  get phone(): string | null | undefined { return this._phone; }
  get address(): string | null | undefined { return this._address; }
  get isVerified(): boolean { return this._isVerified; }
  get createdAt(): string | undefined { return this._createdAt; }
  get sellerProfile(): SellerProfile | null | undefined { return this._sellerProfile; }

  // ─── RBAC — Comportamiento Encapsulado ───
  // La UI NUNCA debe comparar user.role === 'ADMIN'. Llama a estos métodos.

  /** @postcondition true solo si role === 'ADMIN' */
  isAdmin(): boolean { return this._role === 'ADMIN'; }

  /** @postcondition true si role === 'SELLER' */
  isSeller(): boolean { return this._role === 'SELLER'; }

  /** @postcondition true si role === 'BUYER' */
  isBuyer(): boolean { return this._role === 'BUYER'; }

  /**
   * Verifica si el usuario tiene acceso a un contexto de rol requerido.
   * ADMIN tiene acceso a todos los niveles (privilegio acumulativo).
   *
   * @param requiredRole - El rol mínimo requerido para el acceso.
   * @postcondition ADMIN siempre retorna true.
   */
  hasAccess(requiredRole: UserRole): boolean {
    if (requiredRole === 'BUYER') return true;
    if (requiredRole === 'SELLER') return this._role === 'SELLER' || this._role === 'ADMIN';
    if (requiredRole === 'ADMIN') return this._role === 'ADMIN';
    return false;
  }

  /** Puede publicar y gestionar productos. */
  canManageProducts(): boolean {
    return this.isSeller() || this.isAdmin();
  }

  /** Puede acceder al panel de administración. */
  canAccessAdminPanel(): boolean {
    return this.isAdmin();
  }

  // ─── Display Helpers ───

  /** Retorna el nombre del rol en español para la UI. */
  getDisplayRole(): string {
    const labels: Record<UserRole, string> = {
      ADMIN: 'Admin',
      SELLER: 'Vendedor',
      BUYER: 'Comprador',
    };
    return labels[this._role];
  }

  /** Primera letra del nombre o email, en mayúscula. */
  getInitials(): string {
    return (this._name || this._email || 'U')[0].toUpperCase();
  }

  /** Nombre preferido para display: name > email > "Usuario". */
  getDisplayName(): string {
    return this._name || this._email || 'Usuario';
  }

  // ─── Serialización — Compatibilidad con ApiClient legacy ───

  /** Acceso controlado al dato raw para compatibilidad con ViewModels legados. */
  getRawData(): User {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      role: this._role,
      avatar: this._avatar,
      phone: this._phone,
      address: this._address,
      isVerified: this._isVerified,
      createdAt: this._createdAt,
      sellerProfile: this._sellerProfile,
    };
  }
}
