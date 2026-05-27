FROM node:20-alpine

WORKDIR /app

COPY services/auth-service/package.json ./
RUN npm install --production

COPY services/auth-service/src ./src

EXPOSE 3001

CMD ["node", "src/index.js"]
