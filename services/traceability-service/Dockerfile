FROM node:20-alpine

WORKDIR /app

COPY services/traceability-service/package*.json ./

RUN npm install --production

COPY services/traceability-service .

EXPOSE 3005

CMD ["node", "src/index.js"]