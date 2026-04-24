# Proyecto ACME - Fusión completa

## 📁 Estructura

```
mi-app-fusion-completo/
├── mi-app-mod/          ← Proyecto Angular (tu proyecto original + cambios PPTs)
└── backend-server/      ← Servidor Node.js nuevo
    ├── app.js
    ├── package.json
    └── acme.sql
```

## 🚀 Pasos para correr

### 1. Base de datos
- Iniciar XAMPP (Apache + MySQL)
- Abrir phpMyAdmin → importar `backend-server/acme.sql`

### 2. Backend
```bash
cd backend-server
npm install
npm start
```
→ Corre en http://localhost:3000

### 3. Frontend
```bash
cd mi-app-mod
npm install
npm install bootstrap-icons
ng serve -o
```
→ Corre en http://localhost:4200

## ✅ Qué se mantiene de tu proyecto original
- Estructura con AppModule (standalone: false)
- ngx-bootstrap-icons (íconos <i-bs>)
- index.html con CDN Bootstrap
- Colores y estilos del navbar
- angular.json, tsconfig, vscode config

## ✅ Qué se agregó (de los PPTs)
- Interface IProduct + ProductService con HTTP real
- Filtro reactivo con signal + computed
- Componente ProductListComponent con tabla completa
- Componente StarComponent (estrellas con computed)
- Pipe ImagePipe (imagen por defecto)
- Pipes: currency CLP, date dd/MM/yyyy, uppercase, lowercase
- Botón Crear Producto (POST)
- Botones Eliminar (DELETE) y Actualizar (PUT)
- LOCALE_ID es-CL (fechas en español)
- Backend Node.js completo con MySQL y CORS
