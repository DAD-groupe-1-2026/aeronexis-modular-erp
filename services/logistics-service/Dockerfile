FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages ./packages
COPY services/logistics-service ./services/logistics-service

RUN npm install --omit=dev

WORKDIR /app/services/logistics-service

EXPOSE 3003

CMD ["npm", "start"]
