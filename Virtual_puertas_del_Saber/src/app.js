// src/app.js (configuración global)
const express = require('express');
const cors = require('cors');
const path = require('path');
const rutasApi = require('./routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir el frontend estático (landing page) desde public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rutas de la API
app.use('/api', rutasApi);

// Ruta de salud del servidor
app.get('/api/salud', (req, res) => {
  res.json({ estado: 'ok', servicio: 'Virtual Puertas del Saber API' });
});

// Manejo de rutas no encontradas dentro de /api
app.use('/api', (req, res) => {
  res.status(404).json({ mensaje: 'Recurso no encontrado' });
});

// Manejador de errores global
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ mensaje: error.message || 'Error interno del servidor' });
});

module.exports = app;
