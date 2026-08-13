// src/routes/libros.routes.js
const { Router } = require('express');
const controlador = require('../controllers/libros.controller');

const router = Router();

router.get('/', controlador.listar);
router.get('/:id', controlador.obtenerPorId);
router.post('/', controlador.crear);
router.put('/:id', controlador.actualizar);
router.delete('/:id', controlador.eliminar);

module.exports = router;
