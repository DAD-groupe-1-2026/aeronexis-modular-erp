FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages ./packages
COPY services/traceability-service ./services/traceability-service

RUN npm install --omit=dev

WORKDIR /app/services/traceability-service

EXPOSE 3005

CMD ["npm", "start"]
