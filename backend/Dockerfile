# Etapa 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev)
RUN npm ci

# Copiar código fuente
COPY . .

# Ejecutar linting
RUN npm run lint --if-present || true

# Etapa 2: Production
FROM node:20-alpine

WORKDIR /app

# Instalar herramientas útiles
RUN apk add --no-cache curl dumb-init

# Copiar package.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código y configuración de la etapa builder
COPY --from=builder /app/src ./src
COPY --from=builder /app/.env* ./
COPY --from=builder /app/README.md ./

# Crear usuario no root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 nodejs && \
    mkdir -p /app/uploads /app/logs && \
    chown -R nodejs:nodejs /app

# Cambiar usuario a no root
USER nodejs

# Exponer puerto
EXPOSE 10000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:10000/api/health || exit 1

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=10000 \
    NODE_OPTIONS="--max-old-space-size=512" \
    LOG_LEVEL=info

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Comando de inicio
CMD ["node", "src/server.js"]

