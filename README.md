# mi-app-mod

Aplicacion full-stack con Angular 21, Node.js/Express y MySQL, orquestada con Docker Compose.

## Requisitos

- Docker Desktop instalado y corriendo

## Levantar el proyecto

```bash
docker compose up --build
```

Eso es todo. Docker construye las imagenes, inicializa la base de datos y levanta los tres servicios.

| Servicio  | URL                   |
|-----------|-----------------------|
| Frontend  | http://localhost:8080 |
| Backend   | http://localhost:3000 |

## Detener el proyecto

```bash
docker compose down
```

Para detener y eliminar tambien los datos de la base de datos:

```bash
docker compose down -v
```
