# DebuggersEats – Restaurant Management Platform

> **Nota**: Este proyecto fue desarrollado con fines académicos como parte del curso IN6AM. Forma parte de una arquitectura de microservicios diseñada para la gestión integral de restaurantes mediante tecnologías modernas como Node.js, MongoDB y PostgreSQL.

---

# Descripción

**DebuggersEats** es una plataforma web integral diseñada para la gestión completa de restaurantes. Permite a clientes, administradores de restaurantes y administradores del sistema interactuar en un entorno seguro, moderno y eficiente.

La plataforma facilita la búsqueda de restaurantes, visualización de menús, administración de restaurantes y gestión de usuarios mediante un sistema de autenticación centralizado.

El sistema está basado en una arquitectura de microservicios, donde cada servicio es responsable de una funcionalidad específica, permitiendo una mayor escalabilidad, mantenibilidad y seguridad.

Actualmente, el sistema cuenta con los siguientes servicios principales:

- Authentication Service
- Restaurant Service
- ReportService (.NET 8)

---

# Arquitectura General

El sistema implementa una arquitectura basada en microservicios utilizando Clean Architecture, donde cada servicio se organiza en las siguientes capas:

- **API**: Maneja las solicitudes HTTP, rutas y controladores
- **Application**: Contiene los casos de uso y lógica de negocio
- **Domain**: Define las entidades, reglas y contratos del sistema
- **Persistence / Infrastructure**: Gestiona el acceso a bases de datos

Esta arquitectura permite mantener una separación clara de responsabilidades, facilitando el mantenimiento y crecimiento del sistema.

---

# Authentication Service

## Descripción

El Authentication Service es el encargado de gestionar la autenticación, autorización y administración de usuarios dentro de la plataforma DebuggersEats.

Este servicio permite registrar usuarios, iniciar sesión de forma segura y gestionar los roles del sistema, asegurando que cada usuario tenga acceso únicamente a las funcionalidades que le corresponden.

También actúa como el núcleo de seguridad del sistema, ya que valida la identidad de los usuarios y protege los endpoints de los demás microservicios.

## Funcionalidades Principales

### Autenticación

- Registro de nuevos usuarios en la plataforma
- Inicio de sesión mediante correo y contraseña
- Generación de tokens JWT para autenticación segura
- Validación de credenciales del usuario
- Identificación del usuario autenticado

### Autorización

El sistema maneja los siguientes roles:

- **Administrador del sistema** (`ADMIN_ROLE`)
- **Administrador de restaurante** (`RES_ADMIN_ROLE`)
- **Cliente** (`USER_ROLE`)

Funcionalidades relacionadas:

- Asignación automática del rol Cliente al registrarse
- Creación de usuarios con roles específicos por el administrador del sistema
- Control de acceso basado en roles
- Protección de endpoints mediante JWT Bearer
- Restricción de acceso según permisos

### Seguridad

- Encriptación de contraseñas utilizando hash seguro (bcrypt)
- Generación de tokens JWT firmados
- Validación de tokens en cada solicitud protegida
- Protección contra accesos no autorizados
- Validación de datos de entrada
- Separación de responsabilidades mediante Clean Architecture

### Arquitectura del Servicio

El servicio está organizado en:

- **API**: Controladores, rutas y middlewares de autenticación
- **Application**: Casos de uso como RegisterUser y LoginUser
- **Domain**: Entidades como User y Role
- **Persistence**: Repositorios y conexión a base de datos MongoDB

---

# Restaurant Service

## Descripción

El Restaurant Service es responsable de gestionar toda la información relacionada con los restaurantes dentro de la plataforma DebuggersEats.

Este servicio permite a los administradores del sistema y administradores de restaurante crear, consultar, actualizar y eliminar restaurantes, así como gestionar la información relevante que los clientes pueden visualizar.

Este servicio funciona en conjunto con el Authentication Service para validar la identidad y permisos de los usuarios.

## Funcionalidades Principales

### Gestión de Restaurantes

- Registro de nuevos restaurantes
- Consulta de restaurantes disponibles
- Actualización de información del restaurante
- Eliminación de restaurantes
- Gestión de dirección e información general
- Control del estado del restaurante

### Gestión Interna

Permite la administración de información propia del restaurante, como:

- Gestión de mesas
- Administración de inventario de mesas
- Organización de información del restaurante

### Seguridad

- Protección de endpoints mediante JWT
- Validación de identidad del usuario autenticado
- Restricción de acceso según rol
- Integración con Authentication Service

### Arquitectura del Servicio

El servicio está organizado en:

- **API**: Controladores y rutas de restaurantes
- **Application**: Casos de uso como CreateRestaurant, UpdateRestaurant, DeleteRestaurant
- **Domain**: Entidad Restaurant
- **Persistence**: Repositorios y base de datos MongoDB

---

# Report Service

## Descripción
El Report Service es el encargado de generar estadísticas y reportes de rendimiento de la plataforma DebuggersEats.

Este servicio está construido en **.NET 8** y actúa como un servicio de solo lectura — no modifica datos, únicamente los consulta y procesa. Se conecta a **MongoDB** para leer los pedidos confirmados y calcula métricas como ingresos totales, platos más vendidos y horas pico de actividad.

Para optimizar el rendimiento, los resultados calculados se almacenan en caché en **PostgreSQL** con un TTL de 1 hora. Si el caché existe y no ha expirado, se devuelve directamente sin recalcular desde MongoDB.

## Funcionalidades Principales

### Reportes por Restaurante

- Ingresos totales del restaurante
- Número total de pedidos procesados
- Platos más vendidos con cantidad e ingresos generados
- Horas pico de mayor actividad

### Reportes Globales de Plataforma

- Estadísticas consolidadas de todos los restaurantes
- Resumen general de pedidos e ingresos de toda la plataforma

### Sistema de Caché

- Resultados almacenados en PostgreSQL con TTL de 1 hora
- La respuesta indica si los datos vienen de caché (`"fuente": "cache"`) o fueron calculados en tiempo real (`"fuente": "calculado"`)
- Endpoint para limpiar caché y forzar recálculo inmediato

### Arquitectura del Servicio

El servicio está organizado en:

- **API**: Controladores REST con Entity Framework Core
- **Application**: Lógica de cálculo de métricas y gestión de caché
- **Domain**: Entidades de reporte y caché
- **Persistence**: MongoDB (lectura de pedidos) + PostgreSQL (escritura de caché)

---

# Tecnologías Utilizadas

## Backend

- Node.js
- Express.js
- JavaScript
- C#
- Clean Architecture
- Arquitectura de Microservicios

## Base de Datos

### MongoDB

Utilizado en:

- Usuarios
- Restaurantes

Tecnología:

- Mongoose ODM

### PostgreSQL
Utilizado en: Caché de reportes con TTL
Tecnología: Entity Framework Core

## Almacenamiento de Imágenes
- Cloudinary — imágenes de restaurantes y platillos
- Multer — manejo de uploads temporales

## Seguridad
- JWT Authentication (jsonwebtoken)
- Hash de contraseñas con bcrypt
- Validación de datos con express-validator

---

# Seguridad

El sistema implementa:

- JWT Authentication con issuer y audience
- Hash de contraseñas con bcrypt
- Protección de rutas privadas por rol
- Validación de datos de entrada
- Manejo de errores centralizado
- Tokens de confirmación para reservaciones (JWT, 24h)

---

# Endpoints Principales

## Base URLs

| Servicio | URL Base |
|---|---|
| Authentication | `http://localhost:3013/debuggersEatsAdmin/v1` |
| Restaurant | `http://localhost:3014/add-restaurant/v1` |
| Reports | `http://localhost:5000/api/reports` |

---

## Auth Service

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/health` | Estado del servicio | No |
| POST | `/auth/login` | Login con username y password, devuelve JWT | No |
| POST | `/auth/` | Crear usuario | ADMIN_ROLE |
| GET | `/auth/` | Listar usuarios | ADMIN_ROLE |
| PUT | `/auth/:id` | Actualizar usuario | ADMIN_ROLE |
| DELETE | `/auth/:id` | Eliminar usuario | ADMIN_ROLE |

```json
// Login
{
  "username": "admin",
  "password": "Admin123!DebuggersEats"
}
```

---

## Restaurants Service

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/restaurants/` | Listar restaurantes | No |
| GET | `/restaurants/:id` | Ver restaurante por ID | No |
| POST | `/restaurants/` | Crear restaurante (foto opcional, form-data) | ADMIN_ROLE |
| PATCH | `/restaurants/:id` | Actualizar restaurante | ADMIN_ROLE |
| DELETE | `/restaurants/:id` | Eliminar restaurante | ADMIN_ROLE |
| POST | `/restaurants/:id/photo` | Subir o reemplazar foto banner | ADMIN_ROLE |
| DELETE | `/restaurants/:id/photo` | Eliminar foto del restaurante | ADMIN_ROLE |

```
// Crear restaurante usa form-data:
name, address, phone (8 dígitos), category, capacity (mín 20), photo (File, opcional)
```

---

## Menú

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/menu/restaurant/:restaurantId` | Ver menú de un restaurante | No |
| GET | `/menu/:id` | Ver platillo por ID | No |
| GET | `/menu/` | Listar todos los platillos | ADMIN_ROLE |
| POST | `/menu/` | Crear platillo (foto opcional, form-data) | RES_ADMIN_ROLE |
| PUT | `/menu/:id` | Actualizar platillo | RES_ADMIN_ROLE |
| DELETE | `/menu/:id` | Eliminar platillo | RES_ADMIN_ROLE |
| POST | `/menu/:id/photo` | Subir o reemplazar foto | RES_ADMIN_ROLE |
| DELETE | `/menu/:id/photo` | Eliminar foto del platillo | RES_ADMIN_ROLE |

---

## Pedidos y Carrito

> El carrito vive en memoria — se pierde si el servidor reinicia.

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/orders/menu/:restaurantId` | Ver menú del restaurante | No |
| POST | `/orders/cart/:userId` | Agregar ítem al carrito | No |
| GET | `/orders/cart/:userId` | Ver carrito con subtotal, IVA 12% y total | No |
| PATCH | `/orders/cart/:userId/:menuItemId` | Cambiar cantidad (0 = eliminar) | No |
| DELETE | `/orders/cart/:userId/:menuItemId` | Quitar ítem del carrito | No |
| DELETE | `/orders/cart/:userId` | Vaciar carrito | No |
| POST | `/orders/` | Confirmar pedido | No |
| GET | `/orders/user/:userId` | Historial del cliente | No |
| GET | `/orders/restaurant/:restaurantId` | Cola de pedidos activos | RES_ADMIN_ROLE |
| GET | `/orders/status/:orderId` | Estado e historial del pedido | No |
| GET | `/orders/:orderId` | Detalle completo del pedido | No |
| PATCH | `/orders/:orderId/status` | Cambiar estado del pedido | RES_ADMIN_ROLE |
| DELETE | `/orders/:orderId` | Cancelar pedido | No |

```json
// Confirmar pedido
{
  "userId": "id_del_usuario",
  "direccion": {
    "tipo": "Casa",
    "descripcion": "Zona 1, Calle Falsa 123",
    "referencias": "Casa con portón azul"
  },
  "telefono": "12345678",
  "tipoPago": "Efectivo",
  "notas": "Sin cebolla"
}
```

Estados del pedido:
```
Pendiente → Aceptado → En_preparación → Listo → Entregado
                    ↓
                Cancelado
```

---

## Eventos Gastronómicos

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/events/restaurant/:restaurantId` | Ver eventos activos del restaurante | No |
| GET | `/events/:id` | Ver detalle de evento | No |
| GET | `/events/` | Ver todos los eventos | ADMIN_ROLE |
| POST | `/events/` | Crear evento / cupón / promoción | RES_ADMIN_ROLE |
| PATCH | `/events/:id` | Actualizar evento | RES_ADMIN_ROLE |
| DELETE | `/events/:id` | Eliminar evento | RES_ADMIN_ROLE |
| POST | `/events/:id/join` | Inscribirse a evento | Token |
| DELETE | `/events/:id/join` | Cancelar inscripción | Token |
| POST | `/events/:id/apply` | Aplicar cupón o promoción | Token |

```json
// Crear evento
{
  "restaurant_id": "id_del_restaurante",
  "name": "Descuento de verano",
  "description": "20% de descuento en toda la carta",
  "type": "coupon",
  "status": "active",
  "max_usos": 50,
  "schedule": {
    "start_date": "2026-03-01T00:00:00Z",
    "end_date": "2026-03-31T23:59:00Z",
    "recurrence": "none",
    "days_of_week": [],
    "time_slots": []
  },
  "visibility": "public",
  "tags": ["descuento", "verano"]
}
```

---

## Reservaciones

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/reservations/disponibilidad/:restaurantName?date=&hour=` | Ver disponibilidad | No |
| POST | `/reservations/` | Crear reservación | Token |
| POST | `/reservations/confirm` | Confirmar o cancelar con token | Token |
| GET | `/reservations/` | Ver mis reservaciones | Token |
| PUT | `/reservations/:id` | Actualizar reservación | Token |
| DELETE | `/reservations/:id` | Eliminar reservación | Token |
| GET | `/reservations/restaurant/:restaurantName` | Ver reservaciones del restaurante | RES_ADMIN_ROLE |

```json
// Crear reservación
{
  "restaurantName": "Los Debuggers",
  "reservationDate": "2026-03-15",
  "reservationHour": "19:00",
  "peopleName": "Juan García",
  "peopleNumber": 4,
  "observation": "Mesa cerca de la ventana"
}

// Confirmar o cancelar
{
  "token": "token_recibido_al_crear",
  "action": "CONFIRMAR"
}
```

Estados:
```
PENDIENTE → CONFIRMADA → FINALIZADA (automático al pasar la fecha)
PENDIENTE/CONFIRMADA → CANCELADA
```

---

## Reports Service (.NET)

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/health` | Estado del servicio | No |
| GET | `/restaurant/:restaurantId` | Reporte del restaurante | No |
| GET | `/plataforma` | Estadísticas globales | No |
| DELETE | `/cache/:restaurantId` | Limpiar caché y recalcular | No |

---

## Estructura del Proyecto

```
DEBUGGERSEATS/
├── add-restaurant-service/        # Servicio principal de restaurantes  (Node.js)
│   ├── configs/                   # Configuración del servidor, DB, CORS, Helmet
│   ├── helpers/                   # Cloudinary y manejo de archivos (multer)
│   ├── middlewares/               # JWT, roles, validadores
│   ├── src/
│   │   ├── gastronomicEvents/     # Eventos, promociones y cupones
│   │   ├── menu/                  # Gestión de platillos con imágenes
│   │   ├── orders/                # Carrito en memoria y pedidos
│   │   ├── reservations/          # Reservaciones con token de confirmación
│   │   └── restaurants/           # CRUD de restaurantes con imágenes
│   ├── uploads/                   # Archivos temporales antes de subir a Cloudinary
│   ├── .env
│   ├── index.js
│   └── package.json
│
├── authenthication_server/        # Servicio de autenticación (Node.js)
│   ├── configs/                   # Configuración del servidor y DB
│   ├── helpers/                   # Utilidades
│   ├── middlewares/               # JWT y validadores
│   ├── src/                       # Usuarios, roles, login, registro
│   ├── .env
│   ├── index.js
│   └── package.json
│
└── reports-service/               # Servicio de reportes (.NET)
    ├── debuggers-eats-pg/         # Configuración PostgreSQL
    ├── src/                       # Controladores y servicios de reportes
    ├── global.json
    └── ReportService.sln
```

# Instalación

## Requisitos

- Node.js 18+
- pnpm
- MongoDB
- PostgreSQL
- .NET 8 SDK

---

# 1. Instalar dependencias
## Requisitos

```bash
1. Clonar el repositorio
bashgit clone https://github.com/egomez-2021272/DebuggersEats.git
cd DebuggersEats

2. Instalar dependencias de los servicios Node.js
bash# Authentication Service
cd authenthication_server
pnpm install

# Restaurant Service
cd ../add-restaurant-service
pnpm install

3. Configurar variables de entorno
Crear el archivo .env en cada servicio Node.js con las variables indicadas.
```
### authenthication_server/.env
```env
PORT=3013
URI_MONGODB=mongodb://localhost:27017/auth-de-debuggers
JWT_SECRET=tu_secreto
JWT_ISSUER=DebuggersEats
JWT_AUDIENCE=DebuggersEats
JWT_EXPIRES_IN=1h
```

### add-restaurant-service/.env
```env
PORT=3014
URI_MONGODB=mongodb://localhost:27017/auth-de-debuggers
JWT_SECRET=tu_secreto
JWT_ISSUER=DebuggersEats
JWT_AUDIENCE=DebuggersEats
JWT_EXPIRES_IN=1h
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_BASE_URL=https://res.cloudinary.com/tu_cloud_name/image/upload/
CLOUDINARY_RESTAURANTS_FOLDER=add-restaurant/restaurants
CLOUDINARY_MENU_FOLDER=add-restaurant/menu
RESERVATION_TOKEN_EXPIRES_HOURS=24
```
```bash
4. Iniciar los servicios
bash# Terminal 1 — Authentication Service
cd authenthication_server
pnpm run dev

# Terminal 2 — Restaurant Service
cd add-restaurant-service
pnpm run dev

# Terminal 3 — Reports Service (.NET)
cd reports-service
dotnet restore
dotnet run

```

---
# Créditos

Proyecto base desarrollado por: Debuggers - Kinal Guatemala 2026
Repositorio Original: https://github.com/egomez-2021272/DebuggersEats.git
Este proyecto fue utilizado como referencia académica y posteriormente adaptado y modificado.
También se tomó como referencia información que viene de las siguientes fuentes:

- Hashing de Contraseñas (@node-rs/bcrypt)
Documentación oficial: https://github.com/napi-rs/node-rs
Estándar OWASP: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
-Nodemailer
Documentación oficial: https://nodemailer.com/
Gmail SMTP: https://nodemailer.com/usage/using-gmail/
Guía de App Passwords: https://support.google.com/accounts/answer/185833
- Reset de Contraseña
OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
NIST Digital Identity Guidelines: https://pages.nist.gov/800-63-3/

---