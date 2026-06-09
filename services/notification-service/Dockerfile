FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY services/notification-service ./services/notification-service

RUN npm install --omit=dev

WORKDIR /app/services/notification-service

EXPOSE 3006

CMD ["npm", "start"]
