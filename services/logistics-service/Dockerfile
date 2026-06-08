FROM node:20-alpine

WORKDIR /app

COPY services/logistics-service/package.json ./
RUN npm install --production

COPY services/logistics-service/src ./src

EXPOSE 3003

CMD ["npm", "start"]
