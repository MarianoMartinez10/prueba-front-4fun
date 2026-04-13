# Diagrama de Entidad-Relación (ER)

El siguiente diagrama detalla la base de datos de 4Fun basada en PostgreSQL utilizando Prisma ORM. Muestra la arquitectura en 3ra Forma Normal (3NF).

```mermaid
erDiagram
  %% Core Entities
  User {
    String id PK
    String name
    String email UK
    Role role
    Boolean isVerified
    DateTime createdAt
  }
  
  Platform {
    String id PK
    String slug UK
    String nombre
    Boolean activo
  }

  Genre {
    String id PK
    String slug UK
    String nombre
    Boolean activo
  }

  Product {
    String id PK
    String nombre
    Decimal precio
    String platformId FK
    String genreId FK
    ProductType tipo
    Int stock
    Int cantidadVendida
    Boolean activo
    Int descuentoPorcentaje
  }
  
  ProductRequirement {
    String id PK
    String productId FK
    String tipo
    String key
    String value
  }

  Order {
    String id PK
    String userId FK
    String paymentMethod
    String externalId UK
    Decimal itemsPrice
    Decimal shippingPrice
    Decimal totalPrice
    OrderStatus orderStatus
    Boolean isPaid
    DateTime paidAt
  }

  ShippingAddress {
    String id PK
    String orderId FK UK
    String fullName
    String street
    String city
    String zip
    String country
  }

  OrderItem {
    String id PK
    String orderId FK
    String productId FK
    Int quantity
    Decimal price
  }

  Cart {
    String id PK
    String userId FK UK
  }

  CartItem {
    String id PK
    String cartId FK
    String productId FK
    Int quantity
  }

  Wishlist {
    String id PK
    String userId FK UK
  }

  WishlistItem {
    String id PK
    String wishlistId FK
    String productId FK
    DateTime fechaAgregado
  }

  Review {
    String id PK
    String userId FK
    String productId FK
    Int rating
    String text
  }

  ReviewHelpfulVote {
    String id PK
    String reviewId FK
    String userId FK
  }

  DigitalKey {
    String id PK
    String productId FK
    String clave UK
    KeyStatus estado
    String orderId FK
  }

  Coupon {
    String id PK
    String code UK
    DiscountType discountType
    Decimal value
    Decimal minPurchase
    Boolean isActive
  }

  %% Relationships
  Platform ||--o{ Product : "products"
  Genre ||--o{ Product : "products"
  
  Product ||--o{ ProductRequirement : "requirements"
  Product ||--o{ OrderItem : "orderItems"
  Product ||--o{ CartItem : "cartItems"
  Product ||--o{ WishlistItem : "wishlistItems"
  Product ||--o{ Review : "reviews"
  Product ||--o{ DigitalKey : "digitalKeys"

  User ||--o{ Order : "orders"
  User ||--|| Cart : "cart (1:1)"
  User ||--|| Wishlist : "wishlist (1:1)"
  User ||--o{ Review : "reviews"
  User ||--o{ ReviewHelpfulVote : "helpfulVotes"

  Order ||--|| ShippingAddress : "shippingAddress (1:1)"
  Order ||--o{ OrderItem : "orderItems"
  Order ||--o{ DigitalKey : "digitalKeys"

  Cart ||--o{ CartItem : "items"
  Wishlist ||--o{ WishlistItem : "items"
  
  Review ||--o{ ReviewHelpfulVote : "helpfulVotes"
```
