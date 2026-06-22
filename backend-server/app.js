const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const SECRET_KEY = 'mi_clave_secreta_acme_2024';
const GOOGLE_CLIENT_ID = '717011728262-9182srsqkvonhjsi5dtubslb7gjtl41a.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

// CORS con headers de seguridad
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Carpeta uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ─── BASE DE DATOS ────────────────────────────────────────────────────────────
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'acme'
});

function conectarConReintento() {
  connection.connect((err) => {
    if (err) {
      console.error('Error conectando a la BD, reintentando en 3s...', err.message);
      setTimeout(conectarConReintento, 3000);
      return;
    }
    console.log('Conectado a MySQL correctamente.');
  });
}
conectarConReintento();

// ─── RUTAS PÚBLICAS ───────────────────────────────────────────────────────────

// POST - Registrar usuario
app.post('/usuario', async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';
    connection.query(sql, [nombre, email, hash], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Usuario registrado', id: result.insertId });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ mensaje: 'Email no encontrado' });

    const usuario = results[0];
    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: usuario.id_usuario, email: usuario.email },
      SECRET_KEY,
      { expiresIn: 60 * 60 * 4 }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: { id: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email }
    });
  });
});

// POST - Login con Google
app.post('/google-login', async (req, res) => {
  const { idToken } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const nombre = payload.name;

    connection.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      let usuario = results[0];

      if (!usuario) {
        // Crear usuario nuevo con password aleatorio
        const hash = await bcrypt.hash(Math.random().toString(36), 10);
        await new Promise((resolve, reject) => {
          connection.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, hash],
            (err, result) => {
              if (err) return reject(err);
              usuario = { id_usuario: result.insertId, nombre, email };
              resolve(result);
            }
          );
        });
      }

      const token = jwt.sign(
        { id: usuario.id_usuario, email: usuario.email },
        SECRET_KEY,
        { expiresIn: 60 * 60 * 4 }
      );

      res.json({ mensaje: 'Login con Google exitoso', token, usuario });
    });
  } catch (err) {
    res.status(401).json({ mensaje: 'Token de Google inválido', error: err.message });
  }
});

// GET - Verificar código existente (público)
app.get('/producto/codigo/:codigo', (req, res) => {
  const sql = 'SELECT * FROM productos WHERE codigo = ?';
  connection.query(sql, [req.params.codigo], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: results });
  });
});

// GET - Obtener todos los productos (público)
app.get('/productos', (req, res) => {
  const sql = 'SELECT * FROM productos';
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ─── MIDDLEWARE JWT (protege rutas de aquí en adelante) ───────────────────────
app.use(function(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ mensaje: 'No autorizado: falta token' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ mensaje: 'No autorizado: formato inválido' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ mensaje: 'No autorizado: token inválido' });
    req.usuario = decoded;
    next();
  });
});

// ─── RUTAS PRIVADAS ───────────────────────────────────────────────────────────

// GET - Obtener producto por ID
app.get('/productos/:id', (req, res) => {
  const sql = 'SELECT * FROM productos WHERE id_producto = ?';
  connection.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(results[0]);
  });
});

// POST - Crear producto
app.post('/producto', (req, res) => {
  const { nombre, codigo, fechaVenta, precio, puntuacion, imagen } = req.body;
  const sql = 'INSERT INTO productos (nombre, codigo, fechaVenta, precio, puntuacion, imagen) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(sql, [nombre, codigo, fechaVenta, precio, puntuacion, imagen], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Producto creado', id: result.insertId });
  });
});

// DELETE - Borrar producto
app.delete('/producto/:id', (req, res) => {
  const sql = 'DELETE FROM productos WHERE id_producto = ?';
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Producto eliminado', afectados: result.affectedRows });
  });
});

// PUT - Actualizar producto
app.put('/producto/:id', (req, res) => {
  const { nombre, codigo, fechaVenta, precio, puntuacion, imagen } = req.body;
  const sql = 'UPDATE productos SET nombre=?, codigo=?, fechaVenta=?, precio=?, puntuacion=?, imagen=? WHERE id_producto=?';
  connection.query(sql, [nombre, codigo, fechaVenta, precio, puntuacion, imagen, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Producto actualizado', afectados: result.affectedRows });
  });
});

// PUT - Subir imagen
app.put('/upload/producto/:id', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0)
    return res.status(400).json({ error: 'No se adjuntó archivo.' });

  const archivo = req.files.imagen;
  const ext = archivo.name.split('.').pop().toLowerCase();
  const validos = ['png', 'jpg', 'jpeg', 'gif'];
  if (!validos.includes(ext)) return res.status(400).json({ error: 'Extensión no válida.' });

  const nombreArchivo = `${req.params.id}-${Date.now()}.${ext}`;
  archivo.mv(path.join(uploadsDir, nombreArchivo), (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Imagen subida', nombreArchivo, url: `/uploads/${nombreArchivo}` });
  });
});

app.use('/uploads', express.static(uploadsDir));

// ─── SERVIDOR ─────────────────────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor en http://localhost:${PORT}`));
