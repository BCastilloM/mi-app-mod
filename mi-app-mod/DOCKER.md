# ACME — Dockerización completa (frontend + backend + MySQL)

## Estructura
```
mi-app-mod/
├── docker-compose.yml      <- orquesta los 3 servicios
├── backend-server/         <- API Node/Express (Dockerfile incluido)
└── mi-app-mod/              <- Angular + Nginx (Dockerfile incluido)
```

## Cómo funciona la comunicación
- El **navegador** del usuario solo habla con **nginx** (puerto 8080).
- Nginx sirve el Angular compilado y hace **proxy_pass**:
  - `/api/...`     → `http://backend:3000/...`
  - `/uploads/...` → `http://backend:3000/uploads/...`
- El **backend** se conecta a MySQL usando el nombre de servicio `mysql` (no `localhost`,
  no `host.docker.internal`) gracias a la red interna `acme_net` que crea docker-compose.
- En **Angular**, `environment.prod.ts` define `apiUrl: '/api'` (ruta relativa al mismo
  origen), así que el código del frontend nunca necesita saber la IP del backend.

## Levantar todo
Desde la carpeta `mi-app-mod/` (la que contiene `docker-compose.yml`):

```bash
docker-compose up --build
```

- Frontend: http://localhost:8080
- Backend (acceso directo, opcional): http://localhost:3000
- MySQL (acceso directo, opcional): localhost:3306

La primera vez, MySQL ejecuta automáticamente `acme.sql` y `usuarios.sql` para crear
la base de datos y las tablas. Si necesitas reiniciar la base desde cero:

```bash
docker-compose down -v   # -v borra el volumen de datos de MySQL
docker-compose up --build
```

## Desarrollo local sin Docker (opcional)
`environment.ts` (no production) sigue apuntando a `http://localhost:3000`, así que
`ng serve` + `node app.js` corriendo directo en tu PC sigue funcionando igual que antes.

## Variables de entorno del backend
Configurables en `docker-compose.yml`, con defaults si corres `app.js` fuera de Docker:
- `DB_HOST` (default: `localhost`)
- `DB_USER` (default: `root`)
- `DB_PASSWORD` (default: ``)
- `DB_NAME` (default: `acme`)
