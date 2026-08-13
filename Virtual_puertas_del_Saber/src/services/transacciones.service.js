// src/services/transacciones.service.js
const { pool } = require('../config/database');
const librosService = require('./libros.service');
const usuariosService = require('./usuarios.service');

const DIAS_ALQUILER = 15;
const DIAS_PRESTAMO = 10;

async function listarTransacciones({ usuario_id, estado } = {}) {
  let sql = `
    SELECT t.*, u.nombre AS usuario_nombre, l.titulo AS libro_titulo
    FROM transacciones t
    JOIN usuarios u ON u.id = t.usuario_id
    JOIN libros l ON l.id = t.libro_id
    WHERE 1 = 1`;
  const params = [];

  if (usuario_id) {
    sql += ' AND t.usuario_id = ?';
    params.push(usuario_id);
  }
  if (estado) {
    sql += ' AND t.estado = ?';
    params.push(estado);
  }

  sql += ' ORDER BY t.fecha_inicio DESC';
  const [filas] = await pool.query(sql, params);
  return filas;
}

async function obtenerTransaccionPorId(id) {
  const [filas] = await pool.query('SELECT * FROM transacciones WHERE id = ?', [id]);
  return filas[0] || null;
}

// Crea una transacción de tipo compra, alquiler o préstamo.
// Valida stock, calcula el monto y, si aplica, la fecha límite de devolución.
async function crearTransaccion({ usuario_id, libro_id, tipo }) {
  const libro = await librosService.obtenerLibroPorId(libro_id);
  if (!libro) {
    const error = new Error('El libro solicitado no existe.');
    error.status = 404;
    throw error;
  }
  if (libro.stock <= 0) {
    const error = new Error('No hay stock disponible para este libro.');
    error.status = 409;
    throw error;
  }

  if (tipo === 'prestamo') {
    const califica = await usuariosService.calificaParaPrestamoGratuito(usuario_id);
    if (!califica) {
      const error = new Error(
        'El usuario aún no califica para préstamos gratuitos (requiere 3 meses registrado y 5 visitas).'
      );
      error.status = 403;
      throw error;
    }
  }

  let monto = 0;
  let fechaLimite = null;
  const ahora = new Date();

  if (tipo === 'compra') {
    monto = libro.precio_compra;
  } else if (tipo === 'alquiler') {
    monto = libro.precio_alquiler;
    fechaLimite = new Date(ahora);
    fechaLimite.setDate(fechaLimite.getDate() + DIAS_ALQUILER);
  } else if (tipo === 'prestamo') {
    monto = 0;
    fechaLimite = new Date(ahora);
    fechaLimite.setDate(fechaLimite.getDate() + DIAS_PRESTAMO);
  } else {
    const error = new Error('Tipo de transacción inválido. Use compra, alquiler o prestamo.');
    error.status = 400;
    throw error;
  }

  await librosService.descontarStock(libro_id);

  const [resultado] = await pool.query(
    `INSERT INTO transacciones (usuario_id, libro_id, tipo, monto, fecha_limite)
     VALUES (?, ?, ?, ?, ?)`,
    [usuario_id, libro_id, tipo, monto, fechaLimite]
  );

  return obtenerTransaccionPorId(resultado.insertId);
}

// Marca una transacción de alquiler/préstamo como devuelta y repone el stock
async function registrarDevolucion(id) {
  const transaccion = await obtenerTransaccionPorId(id);
  if (!transaccion) return null;

  await pool.query(
    'UPDATE transacciones SET estado = ?, fecha_devolucion = NOW() WHERE id = ?',
    ['devuelta', id]
  );
  await librosService.reponerStock(transaccion.libro_id);
  return obtenerTransaccionPorId(id);
}

// Elimina (anula) una transacción
async function eliminarTransaccion(id) {
  const [resultado] = await pool.query('DELETE FROM transacciones WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = {
  listarTransacciones,
  obtenerTransaccionPorId,
  crearTransaccion,
  registrarDevolucion,
  eliminarTransaccion,
};
