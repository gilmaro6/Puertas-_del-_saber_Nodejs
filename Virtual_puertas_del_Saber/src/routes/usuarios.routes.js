// src/routes/usuarios.routes.js
const { Router } = require('express');
const controlador = require('../controllers/usuarios.controller');

const router = Router();

router.get('/', controlador.listar);
router.get('/:id', controlador.obtenerPorId);
router.post('/registro', controlador.registrar);
router.put('/:id', controlador.actualizar);
router.delete('/:id', controlador.eliminar);
router.patch('/:id/visita', controlador.registrarVisita);

module.exports = router;
