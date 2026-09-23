// src/services/usuarios.service.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cambia_este_secreto_en_produccion';
const JWT_EXPIRA_EN = '8h';

// Listar todos los usuarios (uso administrativo)
async function listarUsuarios() {
  const [filas] = await pool.query(
    'SELECT id, nombre, email, rol, num_visitas, fecha_registro, activo FROM usuarios ORDER BY fecha_registro DESC'
  );
  return filas;
}

// Obtener un usuario por id
async function obtenerUsuarioPorId(id) {
  const [filas] = await pool.query(
    'SELECT id, nombre, email, rol, num_visitas, fecha_registro, activo FROM usuarios WHERE id = ?',
    [id]
  );
  return filas[0] || null;
}

// Obtener un usuario por email (incluye password, uso interno para login)
async function obtenerUsuarioPorEmail(email) {
  const [filas] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return filas[0] || null;
}

// Registrar un nuevo usuario (usado por el formulario "Registrarme" de la landing)
async function registrarUsuario({ nombre, email, password }) {
  const existente = await obtenerUsuarioPorEmail(email);
  if (existente) {
    const error = new Error('Ya existe un usuario registrado con ese correo.');
    error.status = 409;
    throw error;
  }

  const passwordHasheado = await bcrypt.hash(password, 10);
  const [resultado] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
    [nombre, email, passwordHasheado]
  );
  return obtenerUsuarioPorId(resultado.insertId);
}

// Iniciar sesión: valida credenciales y devuelve el usuario (sin password) + token JWT
async function iniciarSesion({ email, password }) {
  const usuario = await obtenerUsuarioPorEmail(email);
  if (!usuario) {
    const error = new Error('Credenciales inválidas.');
    error.status = 401;
    throw error;
  }
  if (!usuario.activo) {
    const error = new Error('La cuenta está desactivada.');
    error.status = 403;
    throw error;
  }

  const coincide = await bcrypt.compare(password, usuario.password);
  if (!coincide) {
    const error = new Error('Credenciales inválidas.');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRA_EN }
  );

  const { password: _sinUsar, ...usuarioSinPassword } = usuario;
  return { usuario: usuarioSinPassword, token };
}

// Actualizar datos de un usuario
async function actualizarUsuario(id, { nombre, email, activo }) {
  await pool.query(
    'UPDATE usuarios SET nombre = COALESCE(?, nombre), email = COALESCE(?, email), activo = COALESCE(?, activo) WHERE id = ?',
    [nombre, email, activo, id]
  );
  return obtenerUsuarioPorId(id);
}

// Eliminar (desactivar) un usuario
async function eliminarUsuario(id) {
  const [resultado] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

// Registrar una visita del usuario a la plataforma
async function registrarVisita(id) {
  await pool.query('UPDATE usuarios SET num_visitas = num_visitas + 1 WHERE id = ?', [id]);
  return obtenerUsuarioPorId(id);
}

// Verifica si el usuario califica para préstamos gratuitos:
// mínimo 3 meses registrado y al menos 5 visitas (regla indicada en el FAQ de la landing)
async function calificaParaPrestamoGratuito(id) {
  const usuario = await obtenerUsuarioPorId(id);
  if (!usuario) return false;

  const fechaRegistro = new Date(usuario.fecha_registro);
  const tresMesesDespues = new Date(fechaRegistro);
  tresMesesDespues.setMonth(tresMesesDespues.getMonth() + 3);

  const cumpleTiempo = new Date() >= tresMesesDespues;
  const cumpleVisitas = usuario.num_visitas >= 5;

  return cumpleTiempo && cumpleVisitas;
}

module.exports = {
  listarUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarioPorEmail,
  registrarUsuario,
  iniciarSesion,
  actualizarUsuario,
  eliminarUsuario,
  registrarVisita,
  calificaParaPrestamoGratuito,
  JWT_SECRET,
};
