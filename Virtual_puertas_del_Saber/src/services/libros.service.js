// src/services/libros.service.js
const { pool } = require('../config/database');

// Listar catálogo con filtros opcionales por nombre, género y categoría
// (funcionalidad "Catálogo digital de libros" descrita en la landing)
async function listarLibros({ q, genero, categoria } = {}) {
  let sql = 'SELECT * FROM libros WHERE 1 = 1';
  const params = [];

  if (q) {
    sql += ' AND (titulo LIKE ? OR autor LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  if (genero) {
    sql += ' AND genero = ?';
    params.push(genero);
  }
  if (categoria) {
    sql += ' AND categoria = ?';
    params.push(categoria);
  }

  sql += ' ORDER BY fecha_creacion DESC';
  const [filas] = await pool.query(sql, params);
  return filas;
}

async function obtenerLibroPorId(id) {
  const [filas] = await pool.query('SELECT * FROM libros WHERE id = ?', [id]);
  return filas[0] || null;
}

async function crearLibro(datos) {
  const {
    titulo, autor, genero, categoria, descripcion = '',
    portada_url = null, precio_compra = 0, precio_alquiler = 0,
    disponible_prestamo = true, stock = 1,
  } = datos;

  const [resultado] = await pool.query(
    `INSERT INTO libros
      (titulo, autor, genero, categoria, descripcion, portada_url, precio_compra, precio_alquiler, disponible_prestamo, stock)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [titulo, autor, genero, categoria, descripcion, portada_url, precio_compra, precio_alquiler, disponible_prestamo, stock]
  );
  return obtenerLibroPorId(resultado.insertId);
}

async function actualizarLibro(id, datos) {
  const libroActual = await obtenerLibroPorId(id);
  if (!libroActual) return null;

  const campos = { ...libroActual, ...datos };
  await pool.query(
    `UPDATE libros SET
      titulo = ?, autor = ?, genero = ?, categoria = ?, descripcion = ?,
      portada_url = ?, precio_compra = ?, precio_alquiler = ?,
      disponible_prestamo = ?, stock = ?
     WHERE id = ?`,
    [
      campos.titulo, campos.autor, campos.genero, campos.categoria, campos.descripcion,
      campos.portada_url, campos.precio_compra, campos.precio_alquiler,
      campos.disponible_prestamo, campos.stock, id,
    ]
  );
  return obtenerLibroPorId(id);
}

async function eliminarLibro(id) {
  const [resultado] = await pool.query('DELETE FROM libros WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

// Descuenta una unidad de stock al concretar una compra/alquiler/préstamo
async function descontarStock(id) {
  const [resultado] = await pool.query(
    'UPDATE libros SET stock = stock - 1 WHERE id = ? AND stock > 0',
    [id]
  );
  return resultado.affectedRows > 0;
}

// Repone una unidad de stock al devolver un alquiler/préstamo
async function reponerStock(id) {
  await pool.query('UPDATE libros SET stock = stock + 1 WHERE id = ?', [id]);
}

module.exports = {
  listarLibros,
  obtenerLibroPorId,
  crearLibro,
  actualizarLibro,
  eliminarLibro,
  descontarStock,
  reponerStock,
};
