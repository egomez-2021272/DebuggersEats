# DebuggersEats – Restaurant Management Platform

> **Nota**: Este proyecto fue desarrollado con fines académicos como parte del curso IN6AM.
Está basado en un trabajo con nombre "Kinal Sports" desarrollado por Braulio Echeverría para el curso IN6AM - Kinal Guatemala. Se realizaron modificaciones con fines educativos.

Este forma parte de una arquitectura de microservicios diseñada para la gestión integral de restaurantes mediante tecnologías modernas como Node.js, MongoDB y PostgreSQL.

---

# Descripción

**DebuggersEats** es una plataforma web integral diseñada para la gestión completa de restaurantes. Permite a clientes, administradores de restaurantes y administradores del sistema interactuar en un entorno seguro, moderno y eficiente.

La plataforma facilita la búsqueda de restaurantes, visualización de menús, administración de restaurantes y gestión de usuarios mediante un sistema de autenticación centralizado.

El sistema está basado en una arquitectura de microservicios, donde cada servicio es responsable de una funcionalidad específica, permitiendo una mayor escalabilidad, mantenibilidad y seguridad.

Actualmente, el sistema cuenta con los siguientes servicios principales:

- Authentication Service
- Restaurant Service

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

Base URL: http://localhost:3000/bank/v1




## Auth Service

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /auth/register | Registro de usuario |
| POST | /auth/login | Inicio de sesión |
| GET | /auth/profile | Obtener perfil |

## Restaurant Service

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /restaurants | Obtener restaurantes |
| POST | /restaurants | Crear restaurante |
| PUT | /restaurants/:id | Actualizar restaurante |
| DELETE | /restaurants/:id | Eliminar restaurante |

---

# Instalación

## Requisitos

- Node.js 18+
- MongoDB
- PostgreSQL
- npm o yarn
---

##
## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulte el archivo [LICENSE](LICENSE) para más detalles.

## Autor

**Los Debuggers**  
Curso IN6AM - Kinal Guatemala 2026

---

**Nota**: Este proyecto fue desarrollado con fines académicos como parte del proceso de aprendizaje sobre arquitectura de microservicios. No se recomienda su uso en entornos de producción sin realizar previamente las validaciones, pruebas y auditorías de seguridad correspondientes.
