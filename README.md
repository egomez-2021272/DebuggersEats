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
- .NetReportService

---

## Report Service
Descripción: El Report Service es el encargado de generar estadísticas y reportes de rendimiento de la plataforma DebuggersEats.
Este servicio está construido en .NET 8 y actúa como un servicio de solo lectura — no modifica datos, únicamente los consulta y procesa. Se conecta a MongoDB para leer los pedidos confirmados y calcula métricas como ingresos totales, platos más vendidos y horas pico de actividad.

Para optimizar el rendimiento, los resultados calculados se almacenan en caché en PostgreSQL con un TTL de 1 hora. Si el caché existe y no ha expirado, se devuelve directamente sin recalcular desde MongoDB.

## Funcionalidades Principales
- Reportes por Restaurante
- Ingresos totales del restaurante
- Número total de pedidos procesados
- Platos más vendidos con cantidad e ingresos generados
- Horas pico de mayor actividad
- Reportes Globales de Plataforma
- Estadísticas consolidadas de todos los restaurantes
- Resumen general de pedidos e ingresos de toda la plataforma

## Sistema de Caché
Resultados almacenados en PostgreSQL con TTL de 1 hora
La respuesta indica si los datos vienen de caché ("fuente": "cache") o fueron calculados en tiempo real ("fuente": "calculado")
Endpoint para limpiar caché y forzar recálculo inmediato

## Arquitectura del Servicio
El servicio está organizado en:
- API: Controladores REST con Entity Framework Core
- Application: Lógica de cálculo de métricas y gestión de caché
- Domain: Entidades de reporte y caché
- Persistence: MongoDB (lectura de pedidos) + PostgreSQL (escritura de caché)

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

- **Administrador del sistema**
- **Administrador de restaurante**
- **Cliente**

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

# Tecnologías Utilizadas

## Backend

- Node.js
- Express.js
- JavaScript
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

Preparado para futuras integraciones relacionadas con operaciones transaccionales.

Tecnología:

- Sequelize ORM o Prisma ORM

---

# Seguridad

El sistema implementa:

- JWT Authentication
- Hash de contraseñas con bcrypt
- Protección de rutas privadas
- Validación de roles
- Validación de datos
- Manejo de errores centralizado

---

# Endpoints Principales

Base URL: http://localhost:3000/debuggersEatsAdmin/v1




## Auth Service

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /actívate/:token | Activa la cuenta del usuario mediante el token enviado por correo. |
| POST | /login | Permite al usuario iniciar sesión con email y contraseña |
| POST | /forgot-password | Envía un correo con toen para restablecer la contraseña. |
| POST | /reset-password/:token | Permite establecer una nueva contraseña usando el token recibido. |
| POST | / | Permite a un administrador crear nuevos usuarios. |
| PUT | /change-password | Permite cambiar la contraseña del usuario autenticado. |

## Restaurant Service

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /restaurants | Obtener restaurantes |
| POST | /restaurants | Crear restaurante |
| PUT | /restaurants/:id | Actualizar restaurante |
| DELETE | /restaurants/:id | Eliminar restaurante |

## Pedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /ListMenuByIdRes | Obtiene el menú de un restaurante. |
| GET | /ViewCart | Muestra el carrito del usuario. |
| POST | /AddSaurceCart/:id | Agrega un producto al carrito. |
| PATCH | /UpdateCart/:id |Actualiza un producto del carrito. |
| DELETE | /DeleteSourceCart/:id | Elimina un producto del carrito. |
| DELETE | /DeleteAllCart/:id | Vacía el carrito. |
| POST | /ConfirmOrder/:id | Confirma la orden. |
| GET | /OrderHistory/:id | Muestra el historial de pedidos. |

## AdminPedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /ColaPedidos | Obtiene la lista de pedidos pendientes. |
| GET | /DetailsOrder | Muestra los detalles de un pedido. |
| PATCH | /OrderStatus/:id | Actualiza el estado de un pedido. |
| DELETE | /CancelOrder/:id | Cancela un pedido específico. |

### Modelos de Request
### Estado del pedido: (/auth/OrderStatus)

```bash
{
    "status": "Aceptado"
}
```

## Reservation

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /ReservationAdd | Crea una nueva reserva. |
| POST | /ConfirmarRes | Confirma una reserva pendiente. |
| GET | /ListarReservas/:id | Lista las reservas de un usuario. |
| PUT | /UpdateRerservas/:id | Actualiza una reserva existente. |
| DELETE | /DeleteReservas/:id | Elimina una reserva. |
| GET | /CheckDisponibilidad/:id | Verifica disponibilidad para una reserva. |
| GET | /ViewReservAdmin/:id | Muestra todas las reservas para el administrador. |

### Authorization: Bearer <token>
### Añadir reservación: (/auth/ReservationAdd)

```bash
 {
    "reservationDate": "2026-02-28",
    "reservationHour": "19:30",
    "peopleName": "Juan Perez",
    "restaurantName": "Kinalitos",
    "peopleNumber": 1,
    "observation": "Mesa en el lado izquierdo para no llamar la atención"
}
```
---

### Authorization: Bearer <token>
### Confirmar reservación: (/auth/ConfirmarRes)

```bash
 {
    "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNlcnZhdGlvbklkIjoiNjlhMjA0YmUyZmVlNjQxNTBjZjdmYjk1IiwicHVycG9zZSI6IlJFU0VSVkFUSU9OX0NPTkZJUk0iLCJpYXQiOjE3NzIyMjU3MjYsImV4cCI6MTc3MjMxMjEyNiwiYXVkIjoiRGVidWdnZXJzRWF0cyIsImlzcyI6IkRlYnVnZ2Vyc0VhdHMifQ.sCEE_z_2xWSjJ1Yzn3Y-tDjGNhXTF5-8uG2VyifMc3s",
    "action" : "CONFIRMAR"
}
```
---

### Authorization: Bearer <token>
### Listar reservas: (/auth/ListarReservas)

```bash
{
    "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNlcnZhdGlvbklkIjoiNjk5ZmRmZmU2OWE1NzJhYmNlYWQ2NTBiIiwicHVycG9zZSI6IlJFU0VSVkFUSU9OX0NPTkZJUk0iLCJpYXQiOjE3NzIwODUyNDYsImV4cCI6MTc3MjE3MTY0NiwiYXVkIjoiRGVidWdnZXJzRWF0cyIsImlzcyI6IkRlYnVnZ2Vyc0VhdHMifQ.iudp3cuzNqsEoiVIOX8Nd1PZfzaeiFfaF7yXoNo3cu8",
    "action" : "CANCELAR"
}
```
---

### Authorization: Bearer <token>
### Actualizar reservas: (/auth/UpdateRerservas)

```bash
{

    "reservationDate": "2026-03-20",
    "reservationHour": "20:00",
    "peopleNumber": 6
}
```
---

### Authorization: Bearer <token>
### Eliminar reservas: (/auth/DeleteReservas)

---

### Authorization: Bearer <token>
### Verificar disponibilidad: (/auth/CheckDisponibilidad)

```bash
{
    "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNlcnZhdGlvbklkIjoiNjlhMTNmYTkyNGI2ZTM0MTcyZmY1M2NlIiwicHVycG9zZSI6IlJFU0VSVkFUSU9OX0NPTkZJUk0iLCJpYXQiOjE3NzIxNzUyNzMsImV4cCI6MTc3MjI2MTY3MywiYXVkIjoiRGVidWdnZXJzRWF0cyIsImlzcyI6IkRlYnVnZ2Vyc0VhdHMifQ.qwhYuHb4T_BWQf-uV6T_fwUQ6k7mq4bYzdluWJOlEWk",
    "action" : "CANCELAR"
}
```
---

### Authorization: Bearer <token>
### Ver reserva: (/auth/ViewReservAdmin)

```bash
{
    "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNlcnZhdGlvbklkIjoiNjk5ZmRmZmU2OWE1NzJhYmNlYWQ2NTBiIiwicHVycG9zZSI6IlJFU0VSVkFUSU9OX0NPTkZJUk0iLCJpYXQiOjE3NzIwODUyNDYsImV4cCI6MTc3MjE3MTY0NiwiYXVkIjoiRGVidWdnZXJzRWF0cyIsImlzcyI6IkRlYnVnZ2Vyc0VhdHMifQ.iudp3cuzNqsEoiVIOX8Nd1PZfzaeiFfaF7yXoNo3cu8",
    "action" : "CANCELAR"
}
```
---

## GastronomicEvents

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /NewEvent | Crea un nuevo evento. |
| GET | /ViewEventId | Muestra los detalles de un evento. |
| GET | /ViewAllEventRest/:id | Lista los eventos de un restaurante. |
| POST | /SuscribeEvent/:id | Suscribe un usuario a un evento. |
| GET | /ViewAllEventAdmin/:id | Lista todos los eventos (admin). |
| PATCH | /UpdateEvent/:id |  Actualiza un evento. |
| DELETE | /DeleteEvent/:id | Elimina un evento. |
| DELETE | /CancelSuscribe/:id | Cancela la suscripción a un evento. |
| POST | /ApplyCopounPromo/:id | Aplica un cupón promocional. |

### Authorization: Bearer <token>
### Nuevo Evento: (/auth/NewEvent)

```bash
{
    "restaurant_id": "699a134ed5ffb3a15a3baa99",
    "name": "Cupon ded prueba de % de descuento",
    "description": "20% de descuento en tu primera orden",
    "type": "coupon",
    "status": "active",
    "max_usos": 5,
    "schedule": {
        "start_date": "2026-02-01T00:00:00Z",
        "end_date": "2026-03-30T23:59:00Z",
        "recurrence": "none",
        "days_of_week": [0],
        "time_slots": []
    },
    "visibility": "public",
    "tags": ["descuento", "cupon"]
}
```
---

### Authorization: Bearer <token>
### Suscribirse a Evento: (/auth/SuscribeEvent)

---

### Authorization: Bearer <token>
### Actualizar Evento: (/auth/UpdateEvent)

```bash
{
    "max_usos": 5,
    "schedule": {
    "start_date": "2026-02-01T00:00:00Z",
    "end_date": "2026-06-30T23:59:00Z",
    "recurrence": "weekly",
    "days_of_week": [3],
    "time_slots": [{ "from": "12:00", "to": "22:00" }]
    }
}
```
---

### Authorization: Bearer <token>
### Eliminar Evento: (/auth/DeleteEvent)
### Cancelar Suscripción: (/auth/CancelSuscribe)

---

## .Net ReportService

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | /health | Estado del servicio. | No |

---

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /ReportRestGlobal | Genera reporte global de restaurantes. |
| GET | /ReporteUnRestaurant | Genera reporte de un restaurante específico. |

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
Crear el archivo .env en cada servicio Node.js con las variables indicadas arriba.

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