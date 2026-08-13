-- database/schema.sql
-- Esquema de base de datos para Virtual Puertas del Saber

CREATE DATABASE IF NOT EXISTS puertas_del_saber
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE puertas_del_saber;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  num_visitas INT NOT NULL DEFAULT 0,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activo TINYINT(1) NOT NULL DEFAULT 1
);

-- Tabla de libros (catálogo)
CREATE TABLE IF NOT EXISTS libros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  autor VARCHAR(150) NOT NULL,
  genero VARCHAR(80) NOT NULL,
  categoria VARCHAR(80) NOT NULL,
  descripcion TEXT,
  portada_url VARCHAR(255),
  precio_compra DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_alquiler DECIMAL(10,2) NOT NULL DEFAULT 0,
  disponible_prestamo TINYINT(1) NOT NULL DEFAULT 1,
  stock INT NOT NULL DEFAULT 1,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de transacciones (compra, alquiler o préstamo)
CREATE TABLE IF NOT EXISTS transacciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  libro_id INT NOT NULL,
  tipo ENUM('compra', 'alquiler', 'prestamo') NOT NULL,
  monto DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_limite DATETIME NULL,
  fecha_devolucion DATETIME NULL,
  estado ENUM('activa', 'devuelta', 'vencida') NOT NULL DEFAULT 'activa',
  CONSTRAINT fk_trans_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_trans_libro FOREIGN KEY (libro_id) REFERENCES libros(id)
);

-- Datos de ejemplo
INSERT INTO libros (titulo, autor, genero, categoria, descripcion, precio_compra, precio_alquiler, stock)
VALUES
  ('Cien Años de Soledad', 'Gabriel García Márquez', 'Novela', 'Literatura Latinoamericana', 'Obra maestra del realismo mágico.', 25000, 5000, 10),
  ('El Principito', 'Antoine de Saint-Exupéry', 'Fábula', 'Literatura Infantil', 'Un clásico universal sobre la amistad y la vida.', 18000, 4000, 15),
  ('Clean Code', 'Robert C. Martin', 'Técnico', 'Programación', 'Guía de buenas prácticas de desarrollo de software.', 45000, 9000, 8);
