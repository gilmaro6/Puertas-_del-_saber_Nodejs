// src/controllers/transacciones.controller.js
const transaccionesService = require('../services/transacciones.service');

async function listar(req, res) {
  try {
    const { usuario_id, estado } = req.query;
    const transacciones = await transaccionesService.listarTransacciones({ usuario_id, estado });
    res.json(transacciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar transacciones', error: error.message });
  }
}

async function obtenerPorId(req, res) {
  try {
    const transaccion = await transaccionesService.obtenerTransaccionPorId(req.params.id);
    if (!transaccion) return res.status(404).json({ mensaje: 'Transacción no encontrada' });
    res.json(transaccion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la transacción', error: error.message });
  }
}

// POST /api/transacciones  { usuario_id, libro_id, tipo: 'compra' | 'alquiler' | 'prestamo' }
async function crear(req, res) {
  try {
    const { usuario_id, libro_id, tipo } = req.body;
    if (!usuario_id || !libro_id || !tipo) {
      return res.status(400).json({ mensaje: 'usuario_id, libro_id y tipo son obligatorios' });
    }
    const transaccion = await transaccionesService.crearTransaccion({ usuario_id, libro_id, tipo });
    res.status(201).json(transaccion);
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
}

// PATCH /api/transacciones/:id/devolucion (para alquileres y préstamos)
async function devolucion(req, res) {
  try {
    const transaccion = await transaccionesService.registrarDevolucion(req.params.id);
    if (!transaccion) return res.status(404).json({ mensaje: 'Transacción no encontrada' });
    res.json(transaccion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar la devolución', error: error.message });
  }
}

async function eliminar(req, res) {
  try {
    const eliminado = await transaccionesService.eliminarTransaccion(req.params.id);
    if (!eliminado) return res.status(404).json({ mensaje: 'Transacción no encontrada' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la transacción', error: error.message });
  }
}

module.exports = { listar, obtenerPorId, crear, devolucion, eliminar };
