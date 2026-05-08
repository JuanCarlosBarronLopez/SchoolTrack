FROM node:18-alpine as build-stage

WORKDIR /app

# Copiar archivos de paquetes
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Establecer variables de entorno para build
ENV VUE_APP_ENVIRONMENT=production
ENV VUE_APP_API_URL=https://schooltrack-backend.onrender.com/api
ENV VUE_APP_SOCKET_URL=https://schooltrack-backend.onrender.com

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine as production-stage

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Crear usuario no root
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin nginx

# Copiar configuración de nginx mejorada
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar aplicación construida
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Crear directorio de logs
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log /var/log/nginx/error.log && \
    chown -R nginx:nginx /var/log/nginx /usr/share/nginx/html /etc/nginx

# Cambiar usuario a no root
USER nginx

# Exponer puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
