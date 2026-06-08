FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages ./packages
COPY services/production-service ./services/production-service

RUN npm install --omit=dev

WORKDIR /app/services/production-service

EXPOSE 3002

CMD ["npm", "start"]