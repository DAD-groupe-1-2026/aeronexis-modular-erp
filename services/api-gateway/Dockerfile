FROM node:20-alpine

WORKDIR /app

COPY services/api-gateway/package.json ./
RUN npm install --production

COPY services/api-gateway/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
