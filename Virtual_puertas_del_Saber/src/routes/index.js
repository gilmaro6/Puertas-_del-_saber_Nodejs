// src/routes/index.js (router principal)
const { Router } = require('express');

const usuariosRoutes = require('./usuarios.routes');
const librosRoutes = require('./libros.routes');
const transaccionesRoutes = require('./transacciones.routes');

const router = Router();

router.use('/usuarios', usuariosRoutes);
router.use('/libros', librosRoutes);
router.use('/transacciones', transaccionesRoutes);

module.exports = router;
