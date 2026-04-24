const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

// Carpeta para imágenes subidas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',       // Cambiar según tu configuración
  database: 'acme'
});

connection.connect((err) => {
  if (err) {
    console.error('Error conectando a la BD:', err);
    return;
  }
  console.log('Conectado a MySQL correctamente.');
});

// ─── RUTAS ──────────────────────────────────────────────────────────────────

// GET - Obtener todos los productos
app.get('/productos', (req, res) => {
  const sql = 'SELECT * FROM productos';
  connection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// GET - Obtener un producto por ID
app.get('/productos/:id', (req, res) => {
  const sql = 'SELECT * FROM productos WHERE id_producto = ?';
  connection.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json(results[0]);
  });
});

// POST - Agregar un nuevo producto
app.post('/producto', (req, res) => {
  const { nombre, codigo, fechaVenta, precio, puntuacion, imagen } = req.body;
  const sql = 'INSERT INTO productos (nombre, codigo, fechaVenta, precio, puntuacion, imagen) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(sql, [nombre, codigo, fechaVenta, precio, puntuacion, imagen], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ mensaje: 'Producto creado', id: result.insertId });
  });
});

// DELETE - Borrar un producto
app.delete('/producto/:id', (req, res) => {
  const sql = 'DELETE FROM productos WHERE id_producto = ?';
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ mensaje: 'Producto eliminado', afectados: result.affectedRows });
  });
});

// PUT - Actualizar un producto
app.put('/producto/:id', (req, res) => {
  const { nombre, codigo, fechaVenta, precio, puntuacion, imagen } = req.body;
  const sql = 'UPDATE productos SET nombre=?, codigo=?, fechaVenta=?, precio=?, puntuacion=?, imagen=? WHERE id_producto=?';
  connection.query(sql, [nombre, codigo, fechaVenta, precio, puntuacion, imagen, req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ mensaje: 'Producto actualizado', afectados: result.affectedRows });
  });
});

// PUT - Subir imagen de producto
app.put('/upload/producto/:id', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'No se ha adjuntado ningún archivo.' });
  }

  const archivo = req.files.imagen;
  const nombreSplit = archivo.name.split('.');
  const extension = nombreSplit[nombreSplit.length - 1];

  // Tipos permitidos
  const extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
  if (!extensionesValidas.includes(extension.toLowerCase())) {
    return res.status(400).json({ error: `Extensión no válida. Permitidas: ${extensionesValidas.join(', ')}` });
  }

  // Nombre único: id + timestamp
  const nombreArchivo = `${req.params.id}-${Date.now()}.${extension}`;
  const rutaFinal = path.join(uploadsDir, nombreArchivo);

  archivo.mv(rutaFinal, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      mensaje: 'Imagen subida correctamente',
      nombreArchivo,
      url: `/uploads/${nombreArchivo}`
    });
  });
});

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(uploadsDir));

// ─── INICIAR SERVIDOR ────────────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
