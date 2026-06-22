USE acme;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario  INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- la clave del admin es 123456 --
INSERT INTO usuarios (nombre, email, password) VALUES
('Admin', 'admin@acme.com', '$2b$10$wlpkeK8WQv9dcJ7gBSCVB.5Iqpk0WfJk0ff8AQ8G58YLFUOHPPtNS');
