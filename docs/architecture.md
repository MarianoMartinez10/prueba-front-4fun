# Diagrama de Arquitectura de Sistemas 4Fun

El siguiente diagrama muestra el flujo de la aplicación "4Fun", desde la interacción humana en el cliente Next.js hasta el servicio persistente del backend Node.js, e interfaces con servicios externos.

```mermaid
graph TD
    %% Nodos principales
    User([Usuario / Cliente])
    Admin([Administrador])

    %% Frontend (Next.js)
    subgraph Frontend [Aplicación Next.js 15]
        direction TB
        UI[Interfaces Web / Components]
        Store[Zustand / Context - Estado Global]
        ApiClient[API Client / Fetch]
        Forms[Zod / React Hook Form]
    end

    %% Backend (Node.js/Express)
    subgraph Backend [API REST Node.js & Express]
        direction TB
        Router[Express Routes]
        AuthMW[Middleware Auth / Roles / Rate Limit / Helmet]
        Controllers[Controladores]
        Services[Lógica de Negocios / Services]
        Prisma[Prisma ORM]
        Logger[Winston Logger]
    end

    %% Base de datos & Servicios Externos
    subgraph Infraestructura y Servicios Externos
        PostgreSQL[(PostgreSQL / Supabase)]
        MercadoPago[Pasarela MercadoPago API]
        Nodemailer[SMTP Gmail / Nodemailer]
        Cloudinary[Cloudinary CDN / Images]
    end

    %% Relaciones
    User -->|Navegación / Interacción| UI
    Admin -->|Dashboard & CRUD| UI

    UI --> Store
    UI --> Forms
    Forms --> ApiClient
    Store --> ApiClient

    ApiClient -->|HTTP / JSON - JWT Bearer| Router
    
    Router --> AuthMW
    AuthMW --> Controllers
    Controllers --> Services
    Services --> Prisma
    Services -.-> Logger
    
    Prisma -->|Conexión Segura / TCP| PostgreSQL

    %% Integraciones
    Services -->|Emails Transaccionales| Nodemailer
    Services -->|Checkout Payments| MercadoPago
    UI -->|Subida de Archivos| Cloudinary

    classDef aws fill:#f90,stroke:#333,stroke-width:2px;
    classDef react fill:#61dafb,stroke:#333,stroke-width:2px,color:#000;
    classDef node fill:#339933,stroke:#333,stroke-width:2px,color:#fff;
    classDef pg fill:#336791,stroke:#333,stroke-width:2px,color:#fff;
    
    class Frontend react;
    class Backend node;
    class PostgreSQL pg;
```
