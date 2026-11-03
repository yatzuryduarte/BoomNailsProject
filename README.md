# 💅 Boom Nails – Sistema de Gestión y Tienda Virtual

## 1. Descripción del proyecto

**Boom Nails** es una aplicación web desarrollada para digitalizar y optimizar los procesos comerciales de una tienda de productos para uñas. El sistema permite a los clientes consultar el catálogo, seleccionar productos, gestionar su carrito y realizar pedidos mediante transferencia bancaria con comprobante de pago.

Además, cuenta con un módulo administrativo para gestionar productos, categorías, inventario, pedidos, pagos y proveedores.

## 2. Objetivo general

Desarrollar una plataforma web que facilite la gestión comercial y administrativa de Boom Nails, centralizando la información de productos, clientes, pedidos, pagos e inventario mediante una arquitectura organizada y escalable.

## 3. Tecnologías utilizadas

### Frontend
- React 19
- Vite
- JavaScript
- React Router
- Lucide React
- Recharts
- CSS

### Backend
- Java 21
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- Spring JDBC
- Spring Security
- Maven

### Base de datos
- MySQL
- MySQL Workbench

## 4. Arquitectura del sistema

El backend está organizado siguiendo los principios de **arquitectura hexagonal (Ports and Adapters)**.

La estructura separa las responsabilidades en:

- **Domain:** modelos y reglas del negocio.
- **Application:** servicios y casos de uso.
- **Ports:** contratos de entrada y salida.
- **Adapters:** implementaciones de persistencia, almacenamiento y comunicación.
- **Configuration:** configuración de infraestructura y seguridad.

Esta organización facilita el mantenimiento, las pruebas y la evolución del sistema.

## 5. Funcionalidades principales

### Tienda virtual
- Visualización del catálogo de productos.
- Consulta de categorías.
- Selección de presentaciones y cantidades.
- Carrito de compras.
- Formulario de datos de envío.
- Pago mediante transferencia bancaria.
- Carga de comprobante de pago.
- Confirmación administrativa del pago.

### Módulo administrativo
- Panel de indicadores.
- Gestión de productos.
- Gestión de categorías.
- Gestión de proveedores.
- Control de inventario.
- Registro de entradas y salidas.
- Gestión de pedidos.
- Revisión y aprobación de pagos.
- Consulta de movimientos de inventario.
- Información de ventas y productos más vendidos.

## 6. Estructura del proyecto

```text
BoomNailsProject/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       └── java/com/boomnails/
│   │           ├── adapter/
│   │           ├── application/
│   │           ├── domain/
│   │           └── config/
│   ├── pom.xml
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env.example
│
├── database/
│   └── BoomNailsDB_V2.sql
│
├── .gitignore
└── README.md
```

## 7. Requisitos previos

Para ejecutar el proyecto se necesita:

- Java 21.
- Maven.
- Node.js y npm.
- MySQL Server.
- MySQL Workbench.
- Git.

## 8. Configuración de la base de datos

1. Abrir MySQL Workbench.
2. Crear la base de datos `BoomNailsDB_V2`.
3. Importar el archivo `database/BoomNailsDB_V2.sql`.
4. Configurar las credenciales de conexión del backend.

El archivo SQL contiene la estructura de las tablas, sin registros de clientes, pedidos ni productos.

## 9. Configuración del backend

Crear la variable de entorno `DB_PASSWORD` con la contraseña local del usuario MySQL.

Desde la Terminal:

```bash
cd backend
export DB_PASSWORD="TU_CONTRASEÑA_LOCAL"
```

Ejecutar el backend:

```bash
./mvnw spring-boot:run
```

El servidor estará disponible en:

```text
http://localhost:8080
```

## 10. Configuración del frontend

Desde otra Terminal:

```bash
cd frontend
npm install
```

Crear el archivo `.env` a partir de `.env.example` y configurar:

```env
VITE_API_URL=http://localhost:8080/api
```

Iniciar el frontend:

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:5173
```

## 11. Endpoints principales de la API

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/productos` | Consultar productos |
| GET | `/api/productos/{id}` | Consultar producto por ID |
| GET | `/api/categories` | Consultar categorías |
| POST | `/api/checkout` | Procesar checkout con comprobante |
| GET | `/api/admin/orders` | Consultar pedidos |
| PATCH | `/api/admin/orders/{orderId}/status` | Actualizar estado del pedido |
| GET | `/api/admin/payments/pending` | Consultar pagos pendientes |
| POST | `/api/admin/payments/{paymentId}/approve` | Aprobar pago |
| POST | `/api/admin/payments/{paymentId}/reject` | Rechazar pago |
| GET | `/api/admin/inventory` | Consultar inventario |
| GET | `/api/admin/suppliers` | Consultar proveedores |

## 12. Seguridad y configuración

- Las contraseñas de configuración se manejan mediante variables de entorno.
- Los archivos `.env` no deben publicarse en GitHub.
- Los comprobantes de pago se almacenan localmente y no deben incluirse en el repositorio.
- Las rutas administrativas están protegidas mediante Spring Security.

## 13. Autoría

Proyecto académico y comercial desarrollado para **Boom Nails**.

**Tecnologías principales:** React, Spring Boot, Java y MySQL.