# ETAPA 1: Build de Angular
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration production

# ETAPA 2: Servir con Nginx
FROM nginx:alpine

COPY --from=build /app/dist/mi-app-mod/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80