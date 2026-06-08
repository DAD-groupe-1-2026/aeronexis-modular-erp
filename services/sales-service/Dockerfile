FROM node:20-alpine

WORKDIR /app

COPY services/sales-service/package.json ./
RUN npm install --production

COPY services/sales-service/src ./src

EXPOSE 3004

CMD ["npm", "start"]
