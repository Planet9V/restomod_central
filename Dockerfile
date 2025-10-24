# ⚠️ DEVELOPMENT ENVIRONMENT - Docker Image
# Multi-stage Dockerfile for Restomod Central

# ====================
# Base Stage
# ====================
FROM node:20-alpine AS base

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# ====================
# Dependencies Stage
# ====================
FROM base AS dependencies

# Install all dependencies (including devDependencies for building)
RUN npm ci

# ====================
# Build Stage
# ====================
FROM dependencies AS build

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ====================
# Production Stage
# ====================
FROM base AS production

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/db ./db
COPY --from=build /app/shared ./shared

# Create data directory
RUN mkdir -p /app/data/raw /app/data/validated /app/data/processed

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Start application
CMD ["npm", "start"]

# ====================
# Development Stage
# ====================
FROM dependencies AS development

# Set development environment
ENV NODE_ENV=development
ENV PORT=5000

# Copy source code
COPY . .

# Create data directory
RUN mkdir -p /app/data/raw /app/data/validated /app/data/processed

# Expose port
EXPOSE 5000

# Start development server with hot reload
CMD ["npm", "run", "dev"]
