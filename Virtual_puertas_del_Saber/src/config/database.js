// src/config/database.js
// Conexión a MySQL usando un pool de conexiones reutilizable

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'puertas_del_saber',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// Verifica la conexión al iniciar el servidor
async function verificarConexion() {
  try {
    const conexion = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    conexion.release();
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
  }
}

module.exports = { pool, verificarConexion };
