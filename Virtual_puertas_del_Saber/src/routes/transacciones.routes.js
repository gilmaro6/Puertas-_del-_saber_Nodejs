// src/routes/transacciones.routes.js
const { Router } = require('express');
const controlador = require('../controllers/transacciones.controller');

const router = Router();

router.get('/', controlador.listar);
router.get('/:id', controlador.obtenerPorId);
router.post('/', controlador.crear);
router.patch('/:id/devolucion', controlador.devolucion);
router.delete('/:id', controlador.eliminar);

module.exports = router;
