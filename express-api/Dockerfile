FROM node:20-alpine
WORKDIR /app

COPY package.json ./
RUN npm install

COPY prisma/ ./prisma/

# Fix: install openssl for Prisma engine compatibility
RUN apk add --no-cache openssl

RUN npx prisma generate

COPY src/ ./src/

EXPOSE 3001
CMD ["node", "src/server.js"]