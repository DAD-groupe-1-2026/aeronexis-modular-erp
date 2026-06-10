# ── Build stage : compile front-end apps ──────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/ apps/
COPY packages/ packages/
COPY src/ src/
COPY public/ public/
COPY vite.config.ts index.html tsconfig.json ./

RUN npm ci

RUN npm run build \
 && npm run build -w @aeronexis-dynamics/production-app \
 && npm run build -w @aeronexis-dynamics/logistics-app \
 && npm run build -w @aeronexis-dynamics/sales-app

# ── Runtime stage : NGINX avec assets statiques ───────────────────────────────
FROM nginx:1.25-alpine

COPY services/api-gateway/nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend-builder /app/dist /usr/share/nginx/portal
COPY --from=frontend-builder /app/apps/production-app/dist /usr/share/nginx/production
COPY --from=frontend-builder /app/apps/logistics-app/dist /usr/share/nginx/logistics
COPY --from=frontend-builder /app/apps/sales-app/dist /usr/share/nginx/sales

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
