const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Cargar variables de entorno y dependencias para email
require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const app = express();
const SECRET_KEY = 'mi_clave_secreta_acme_2024';
const GOOGLE_CLIENT_ID = '717011728262-9182srsqkvonhjsi5dtubslb7gjtl41a.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Cliente OAuth2 para Gmail
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});


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
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'acme'
};

let connection;

function conectarConReintento() {
  // Crear una conexión NUEVA en cada intento (el paquete mysql marca la conexión
  // como fatal tras el primer error y no permite reutilizarla)
  connection = mysql.createConnection(dbConfig);
  connection.connect((err) => {
    if (err) {
      console.error('Error conectando a la BD, reintentando en 3s...', err.message);
      connection.destroy(); // liberar el objeto fallido
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

// POST - Enviar correo de prueba (público para testeo)
app.post('/email-test', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El email es requerido en el body.' });
  }

  try {
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          return reject(err);
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Prueba de envío de email con OAuth2',
      text: 'Este es un correo de prueba enviado usando Nodemailer con OAuth2 de Gmail en Express.',
      html: '<h1>Correo de Prueba</h1><p>Este es un correo de prueba enviado usando Nodemailer con OAuth2 de Gmail en Express.</p>'
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ mensaje: 'Email enviado con éxito', info });
  } catch (error) {
    console.error('Error al enviar email:', error);
    res.status(500).json({ error: error.message || error });
  }
});

// POST - Solicitar recuperación de contraseña (público)
app.post('/solicitar-recuperacion', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El email es requerido.' });
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'No existe una cuenta registrada con ese correo electrónico.' });
    }

    const usuario = results[0];
    const token = jwt.sign(
      { id: usuario.id_usuario, email: usuario.email, type: 'reset' },
      SECRET_KEY,
      { expiresIn: '15m' }
    );

    const resetLink = `http://localhost:8080/restablecer-password?token=${token}`;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Restablecer contraseña - Empresa ACME',
      text: `Hola ${usuario.nombre},\n\nHaz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}\n\nEste enlace expirará en 15 minutos.\n\nSaludos,\nEquipo ACME`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a1a2e; text-align: center;">Recuperación de Contraseña</h2>
          <p>Hola <strong>${usuario.nombre}</strong>,</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Empresa ACME.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #0f3460; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
          </p>
          <p>Este enlace es de uso único y expirará en 15 minutos.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.85rem; color: #777; text-align: center;">Empresa ACME &copy; 2026</p>
        </div>
      `
    };

    oauth2Client.getAccessToken((errAccess, accessToken) => {
      if (errAccess) {
        console.error('Error al obtener token de acceso:', errAccess);
        return res.status(500).json({ error: 'Error al iniciar la autenticación del email.' });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken
        }
      });

      transporter.sendMail(mailOptions, (errMail, info) => {
        if (errMail) {
          console.error('Error enviando email:', errMail);
          return res.status(500).json({ error: 'No se pudo enviar el correo de recuperación.' });
        }
        res.json({ mensaje: 'Correo de recuperación enviado con éxito.' });
      });
    });
  });
});

// POST - Restablecer contraseña (público)
app.post('/restablecer-password', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'Token y contraseña son obligatorios.' });
  }

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err || decoded.type !== 'reset') {
      return res.status(400).json({ mensaje: 'El enlace de recuperación es inválido o ha expirado.' });
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const sql = 'UPDATE usuarios SET password = ? WHERE email = ?';
      connection.query(sql, [hash, decoded.email], (errQuery, result) => {
        if (errQuery) return res.status(500).json({ error: errQuery.message });
        if (result.affectedRows === 0) {
          return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }
        res.json({ mensaje: 'Contraseña restablecida con éxito.' });
      });
    } catch (errCrypt) {
      res.status(500).json({ error: errCrypt.message });
    }
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
