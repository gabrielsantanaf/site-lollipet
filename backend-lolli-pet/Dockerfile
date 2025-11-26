FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Torna o script de entrypoint executável
RUN chmod +x docker-entrypoint.sh

EXPOSE 3001

# Executa migrations e inicia o servidor
CMD ["sh", "docker-entrypoint.sh"]
