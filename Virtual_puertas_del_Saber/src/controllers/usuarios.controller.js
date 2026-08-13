// src/controllers/usuarios.controller.js
const usuariosService = require('../services/usuarios.service');

async function listar(req, res) {
  try {
    const usuarios = await usuariosService.listarUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar usuarios', error: error.message });
  }
}

async function obtenerPorId(req, res) {
  try {
    const usuario = await usuariosService.obtenerUsuarioPorId(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el usuario', error: error.message });
  }
}

// Registro de usuario (usado por el formulario de la sección "Registrarme")
async function registrar(req, res) {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, email y password son obligatorios' });
    }
    const usuario = await usuariosService.registrarUsuario({ nombre, email, password });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
}

async function actualizar(req, res) {
  try {
    const usuario = await usuariosService.actualizarUsuario(req.params.id, req.body);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el usuario', error: error.message });
  }
}

async function eliminar(req, res) {
  try {
    const eliminado = await usuariosService.eliminarUsuario(req.params.id);
    if (!eliminado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el usuario', error: error.message });
  }
}

async function registrarVisita(req, res) {
  try {
    const usuario = await usuariosService.registrarVisita(req.params.id);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar la visita', error: error.message });
  }
}

module.exports = { listar, obtenerPorId, registrar, actualizar, eliminar, registrarVisita };
