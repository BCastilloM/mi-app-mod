-- Crear base de datos
CREATE DATABASE IF NOT EXISTS acme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE acme;

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  codigo      VARCHAR(20)  NOT NULL,
  fechaVenta  DATE         NOT NULL,
  precio      DECIMAL(10, 2) NOT NULL,
  puntuacion  INT          NOT NULL DEFAULT 1,
  imagen      VARCHAR(255) DEFAULT ''
);

-- Datos de ejemplo
INSERT INTO productos (nombre, codigo, fechaVenta, precio, puntuacion, imagen) VALUES
('Laptop Dell XPS', 'PROD001', '2024-01-15', 850000, 5, 'computador.png'),
('Mouse Logitech MX', 'PROD002', '2024-02-10', 45000, 4, 'mouse.png'),
('Teclado Mecánico', 'PROD003', '2024-03-05', 78000, 3, 'teclado.png'),
('Monitor Samsung 27"', 'PROD004', '2024-04-20', 320000, 5, 'monitor.png'),
('Auriculares Sony', 'PROD005', '2024-05-12', 130000, 4, 'audifonos.png'),
('Webcam Logitech', 'PROD006', '2024-06-01', 55000, 2, 'camara.png');
