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

| Recurso        | Método | Ruta                              | Auth           | Descripción                                   |
|----------------|--------|------------------------------------|----------------|------------------------------------------------|
| Usuarios       | POST   | `/api/usuarios/registro`           | Pública        | Registro desde el formulario de la landing     |
| Usuarios       | POST   | `/api/usuarios/login`              | Pública        | Inicio de sesión, devuelve `{ usuario, token }`|
| Usuarios       | GET    | `/api/usuarios`                    | Admin          | Listado (panel administrativo)                 |
| Usuarios       | GET    | `/api/usuarios/:id`                | Token          | Detalle de usuario                             |
| Usuarios       | PATCH  | `/api/usuarios/:id/visita`         | Token          | Registra una visita (para el beneficio 3m/5v)  |
| Libros         | GET    | `/api/libros?q=&genero=&categoria=`| Pública        | Catálogo con búsqueda y filtrado               |
| Libros         | POST   | `/api/libros`                      | Admin          | Crear libro (panel administrativo)             |
| Libros         | PUT    | `/api/libros/:id`                  | Admin          | Editar libro                                   |
| Libros         | DELETE | `/api/libros/:id`                  | Admin          | Eliminar libro                                 |
| Transacciones  | POST   | `/api/transacciones`               | Token          | Compra, alquiler o préstamo de un libro        |
| Transacciones  | PATCH  | `/api/transacciones/:id/devolucion`| Token          | Registrar devolución de alquiler/préstamo      |
| Transacciones  | GET    | `/api/transacciones?usuario_id=`   | Token          | Historial de transacciones                     |
| Transacciones  | DELETE | `/api/transacciones/:id`           | Admin          | Anular una transacción                         |

Las rutas marcadas **Token** requieren el header `Authorization: Bearer <token>`
obtenido en `/api/usuarios/login`. Las marcadas **Admin** además exigen que el
usuario del token tenga `rol = 'admin'`.

### Usuario administrador por defecto

El `database/schema.sql` crea automáticamente un usuario admin para pruebas:

- **Correo:** `gillson@gmail.com`
- **Contraseña:** `123`

Inicia sesión con esas credenciales en `app.html` para ver el panel de
administración (gestión de libros y usuarios).

### Ver los usuarios que se registran

No se crea ningún archivo nuevo: cada registro se guarda como una fila en la
tabla `usuarios` de la base de datos MySQL `puertas_del_saber`. Para verla:

```bash
mysql -u root -p puertas_del_saber -e "SELECT id, nombre, email, rol, fecha_registro FROM usuarios;"
```

O con una herramienta gráfica como phpMyAdmin, MySQL Workbench o Laragon → Database, entrando a la base `puertas_del_saber` y abriendo la tabla `usuarios`.

### Regla de negocio: préstamos gratuitos

Tal como se describe en el FAQ de la landing, un usuario solo puede pedir un libro en
modalidad **préstamo** si lleva al menos 3 meses registrado **y** tiene 5 o más visitas
registradas. Esta validación vive en `usuarios.service.js` (`calificaParaPrestamoGratuito`)
y se aplica automáticamente en `transacciones.service.js` al crear una transacción de tipo
`prestamo`.

## Próximos pasos sugeridos

- Panel administrativo (vista) para gestionar libros, usuarios y transacciones.
- Notificaciones automáticas antes del vencimiento de alquileres/préstamos.
- Vista de catálogo, compra/alquiler/préstamo y "mis libros" en el frontend (hoy la
  landing solo cubre registro e inicio de sesión; el resto de la API ya está lista
  para consumirse con el token guardado en `localStorage`).
