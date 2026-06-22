FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Carpeta de uploads persistente (se monta como volumen en docker-compose)
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "app.js"]
