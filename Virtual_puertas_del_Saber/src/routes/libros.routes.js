// src/routes/libros.routes.js
const { Router } = require('express');
const controlador = require('../controllers/libros.controller');
const { requiereAutenticacion, requiereAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// Catálogo: lectura pública (landing/catálogo digital)
router.get('/', controlador.listar);
router.get('/:id', controlador.obtenerPorId);

// Gestión del catálogo: solo administradores
router.post('/', requiereAutenticacion, requiereAdmin, controlador.crear);
router.put('/:id', requiereAutenticacion, requiereAdmin, controlador.actualizar);
router.delete('/:id', requiereAutenticacion, requiereAdmin, controlador.eliminar);

module.exports = router;
