// src/routes/transacciones.routes.js
const { Router } = require('express');
const controlador = require('../controllers/transacciones.controller');
const { requiereAutenticacion, requiereAdmin } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', requiereAutenticacion, controlador.listar);
router.get('/:id', requiereAutenticacion, controlador.obtenerPorId);
router.post('/', requiereAutenticacion, controlador.crear);
router.patch('/:id/devolucion', requiereAutenticacion, controlador.devolucion);
router.delete('/:id', requiereAutenticacion, requiereAdmin, controlador.eliminar);

module.exports = router;
