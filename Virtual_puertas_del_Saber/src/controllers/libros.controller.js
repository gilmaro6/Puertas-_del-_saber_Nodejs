// src/controllers/libros.controller.js
const librosService = require('../services/libros.service');

// GET /api/libros?q=&genero=&categoria=  (catálogo con búsqueda y filtrado)
async function listar(req, res) {
  try {
    const { q, genero, categoria } = req.query;
    const libros = await librosService.listarLibros({ q, genero, categoria });
    res.json(libros);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar libros', error: error.message });
  }
}

async function obtenerPorId(req, res) {
  try {
    const libro = await librosService.obtenerLibroPorId(req.params.id);
    if (!libro) return res.status(404).json({ mensaje: 'Libro no encontrado' });
    res.json(libro);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el libro', error: error.message });
  }
}

async function crear(req, res) {
  try {
    const { titulo, autor, genero, categoria } = req.body;
    if (!titulo || !autor || !genero || !categoria) {
      return res.status(400).json({ mensaje: 'titulo, autor, genero y categoria son obligatorios' });
    }
    const libro = await librosService.crearLibro(req.body);
    res.status(201).json(libro);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el libro', error: error.message });
  }
}

async function actualizar(req, res) {
  try {
    const libro = await librosService.actualizarLibro(req.params.id, req.body);
    if (!libro) return res.status(404).json({ mensaje: 'Libro no encontrado' });
    res.json(libro);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el libro', error: error.message });
  }
}

async function eliminar(req, res) {
  try {
    const eliminado = await librosService.eliminarLibro(req.params.id);
    if (!eliminado) return res.status(404).json({ mensaje: 'Libro no encontrado' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el libro', error: error.message });
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
