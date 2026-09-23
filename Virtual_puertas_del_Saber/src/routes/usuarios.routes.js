// src/routes/usuarios.routes.js
const { Router } = require('express');
const controlador = require('../controllers/usuarios.controller');
const { requiereAutenticacion, requiereAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// Rutas públicas
router.post('/registro', controlador.registrar);
router.post('/login', controlador.iniciarSesion);

// Rutas protegidas
router.get('/', requiereAutenticacion, requiereAdmin, controlador.listar);
router.get('/:id', requiereAutenticacion, controlador.obtenerPorId);
router.put('/:id', requiereAutenticacion, controlador.actualizar);
router.delete('/:id', requiereAutenticacion, requiereAdmin, controlador.eliminar);
router.patch('/:id/visita', requiereAutenticacion, controlador.registrarVisita);

module.exports = router;
