# Virtual Puertas del Saber — Backend

Backend Node.js + Express + MySQL para la landing page **Virtual Puertas del Saber**,
construido siguiendo la misma arquitectura por capas usada en el proyecto de notas
(`config` → `controllers` → `services` → `routes` → `app.js` → `server.js`).

## Estructura del proyecto

```
virtual-puertas-del-saber/
├── public/                  (vista — landing page estática, tal como estaba)
│   ├── index.html
│   ├── css/style.css
│   ├── js/main.js           (ahora conectado a /api/usuarios/registro)
│   └── assets/images/
├── src/
│   ├── config/
│   │   └── database.js      (conexión MySQL)
│   ├── controllers/
│   │   ├── usuarios.controller.js
│   │   ├── libros.controller.js
│   │   └── transacciones.controller.js
│   ├── routes/
│   │   ├── index.js         (router principal)
│   │   ├── usuarios.routes.js
│   │   ├── libros.routes.js
│   │   └── transacciones.routes.js
│   ├── services/
│   │   ├── usuarios.service.js
│   │   ├── libros.service.js
│   │   └── transacciones.service.js
│   └── app.js                (configuración global)
├── database/
│   └── schema.sql             (script de creación de la BD + datos de ejemplo)
├── package.json
├── .env.example
└── server.js                  (arranque)
```

## Puesta en marcha

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Crear la base de datos ejecutando `database/schema.sql` en MySQL:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. Copiar `.env.example` a `.env` y ajustar las credenciales de tu MySQL local:
   ```bash
   cp .env.example .env
   ```

4. Levantar el servidor:
   ```bash
   npm run dev   # con nodemon
   # o
   npm start
   ```

5. Abrir `http://localhost:3000` — verás la landing page servida desde `public/`,
   y el formulario "Registrarme" ya queda conectado a la API real.

## Endpoints principales

| Recurso        | Método | Ruta                              | Descripción                                   |
|----------------|--------|------------------------------------|------------------------------------------------|
| Usuarios       | POST   | `/api/usuarios/registro`           | Registro desde el formulario de la landing     |
| Usuarios       | GET    | `/api/usuarios`                    | Listado (panel administrativo)                 |
| Usuarios       | GET    | `/api/usuarios/:id`                | Detalle de usuario                             |
| Usuarios       | PATCH  | `/api/usuarios/:id/visita`         | Registra una visita (para el beneficio 3m/5v)  |
| Libros         | GET    | `/api/libros?q=&genero=&categoria=`| Catálogo con búsqueda y filtrado               |
| Libros         | POST   | `/api/libros`                      | Crear libro (panel administrativo)             |
| Libros         | PUT    | `/api/libros/:id`                  | Editar libro                                   |
| Libros         | DELETE | `/api/libros/:id`                  | Eliminar libro                                 |
| Transacciones  | POST   | `/api/transacciones`               | Compra, alquiler o préstamo de un libro        |
| Transacciones  | PATCH  | `/api/transacciones/:id/devolucion`| Registrar devolución de alquiler/préstamo      |
| Transacciones  | GET    | `/api/transacciones?usuario_id=`   | Historial de transacciones                     |

### Regla de negocio: préstamos gratuitos

Tal como se describe en el FAQ de la landing, un usuario solo puede pedir un libro en
modalidad **préstamo** si lleva al menos 3 meses registrado **y** tiene 5 o más visitas
registradas. Esta validación vive en `usuarios.service.js` (`calificaParaPrestamoGratuito`)
y se aplica automáticamente en `transacciones.service.js` al crear una transacción de tipo
`prestamo`.

## Próximos pasos sugeridos

- Panel administrativo (vista) para gestionar libros, usuarios y transacciones.
- Autenticación con JWT para proteger rutas de administrador.
- Notificaciones automáticas antes del vencimiento de alquileres/préstamos.
