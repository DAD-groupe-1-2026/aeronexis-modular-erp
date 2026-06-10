FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages ./packages
COPY services/sales-service ./services/sales-service

RUN npm install --omit=dev

WORKDIR /app/services/sales-service

EXPOSE 3004

CMD ["npm", "start"]
