FROM nginx:1.25-alpine

# Copier la configuration NGINX
COPY services/api-gateway/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
