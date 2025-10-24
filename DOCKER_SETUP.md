# Docker Setup for Development

## ⚠️ DEVELOPMENT ENVIRONMENT - ALL SECRETS INCLUDED
**This Docker configuration includes ALL API keys and credentials for rapid development and testing.**
**DO NOT deploy these containers to production or public registries.**

```
██████╗ ███████╗██╗   ██╗    ███████╗███╗   ██╗██╗   ██╗
██╔══██╗██╔════╝██║   ██║    ██╔════╝████╗  ██║██║   ██║
██║  ██║█████╗  ██║   ██║    █████╗  ██╔██╗ ██║██║   ██║
██║  ██║██╔══╝  ╚██╗ ██╔╝    ██╔══╝  ██║╚██╗██║╚██╗ ██╔╝
██████╔╝███████╗ ╚████╔╝     ███████╗██║ ╚████║ ╚████╔╝
╚═════╝ ╚══════╝  ╚═══╝      ╚══════╝╚═╝  ╚═══╝  ╚═══╝

⚠️  DEVELOPMENT MODE - SECRETS HARDCODED FOR CONVENIENCE
   DO NOT USE IN PRODUCTION OR COMMIT TO PUBLIC REPOS
```

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE STACK                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  restomod-app (Node.js)                              │ │
│  │  - Frontend: React + Vite                            │ │
│  │  - Backend: Express.js                               │ │
│  │  - Port: 5000                                        │ │
│  │  - Hot reload enabled                                │ │
│  │  - All dev secrets included                          │ │
│  └────────────────────┬─────────────────────────────────┘ │
│                       │                                    │
│  ┌────────────────────▼─────────────────────────────────┐ │
│  │  restomod-scraper (Node.js)                          │ │
│  │  - Multi-tool scraper service                        │ │
│  │  - Scheduled batch jobs                              │ │
│  │  - Data validation & processing                      │ │
│  │  - JSON file storage                                 │ │
│  └────────────────────┬─────────────────────────────────┘ │
│                       │                                    │
│  ┌────────────────────▼─────────────────────────────────┐ │
│  │  PostgreSQL (External)                               │ │
│  │  - Already provisioned                               │ │
│  │  - Connection via environment variables              │ │
│  │  - Persistent data storage                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Redis (Optional - for caching & rate limiting)      │ │
│  │  - Port: 6379                                        │ │
│  │  - Volatile storage                                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Volumes                                             │ │
│  │  - ./data:/app/data (persistent JSON storage)       │ │
│  │  - ./logs:/app/logs (log files)                     │ │
│  │  - node_modules (Docker volume)                      │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. One-Command Deploy

```bash
# Clone and start everything
git clone YOUR_REPO_URL
cd restomod_central
docker-compose up --build

# Application available at http://localhost:5000
```

### 2. Environment Setup (Already Configured)

All secrets are hardcoded in the Docker configuration for development convenience.

---

## Docker Compose Configuration

```yaml
# docker-compose.yml

version: '3.8'

services:
  # Main application (Frontend + Backend)
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    container_name: restomod-app
    ports:
      - "5000:5000"    # Application port
    volumes:
      # Source code (hot reload)
      - ./client:/app/client
      - ./server:/app/server
      - ./shared:/app/shared
      - ./db:/app/db

      # Data persistence
      - ./data:/app/data
      - ./logs:/app/logs

      # Node modules (performance)
      - node_modules:/app/node_modules

    environment:
      # ⚠️ DEVELOPMENT CREDENTIALS - HARDCODED
      NODE_ENV: development

      # Database (PostgreSQL - External)
      DATABASE_URL: postgresql://restomod_user:DEV_PASSWORD_123@YOUR_POSTGRES_HOST:5432/restomod_dev
      POSTGRES_HOST: YOUR_POSTGRES_HOST_HERE
      POSTGRES_PORT: 5432
      POSTGRES_DB: restomod_dev
      POSTGRES_USER: restomod_user
      POSTGRES_PASSWORD: DEV_PASSWORD_123
      POSTGRES_SSL: false

      # Authentication
      JWT_SECRET: dev_jwt_secret_key_DO_NOT_USE_IN_PROD

      # Scraping API Keys
      APIFY_API_KEY: apify_api_YOUR_DEV_KEY_HERE
      BRAVE_API_KEY: BSA_YOUR_DEV_KEY_HERE
      TAVILY_API_KEY: tvly-YOUR_DEV_KEY_HERE
      PERPLEXITY_API_KEY: pplx-YOUR_PERPLEXITY_API_KEY_HERE_DEV
      JINA_API_KEY: jina_YOUR_DEV_KEY_HERE
      FIRECRAWL_API_KEY: fc-YOUR_FIRECRAWL_API_KEY_HERE_DEV

      # AI Services
      OPENAI_API_KEY: sk-YOUR_OPENAI_DEV_KEY
      ANTHROPIC_API_KEY: sk-ant-YOUR_ANTHROPIC_DEV_KEY
      GOOGLE_GENERATIVE_AI_KEY: YOUR_GOOGLE_AI_DEV_KEY

      # Redis (optional, for caching)
      REDIS_URL: redis://redis:6379

      # Development flags
      ENABLE_HOT_RELOAD: true
      LOG_LEVEL: debug
      ENABLE_CORS: true

    depends_on:
      - redis
    networks:
      - restomod-network
    restart: unless-stopped
    command: npm run dev

  # Scraper service (background job runner)
  scraper:
    build:
      context: .
      dockerfile: Dockerfile.scraper
      target: development
    container_name: restomod-scraper
    volumes:
      - ./server:/app/server
      - ./shared:/app/shared
      - ./scripts:/app/scripts
      - ./data:/app/data
      - ./logs:/app/logs
      - scraper_node_modules:/app/node_modules

    environment:
      # Same credentials as main app
      NODE_ENV: development

      DATABASE_URL: postgresql://restomod_user:DEV_PASSWORD_123@YOUR_POSTGRES_HOST:5432/restomod_dev
      POSTGRES_HOST: YOUR_POSTGRES_HOST_HERE
      POSTGRES_PORT: 5432
      POSTGRES_DB: restomod_dev
      POSTGRES_USER: restomod_user
      POSTGRES_PASSWORD: DEV_PASSWORD_123

      # Scraping API Keys
      APIFY_API_KEY: apify_api_YOUR_DEV_KEY_HERE
      BRAVE_API_KEY: BSA_YOUR_DEV_KEY_HERE
      TAVILY_API_KEY: tvly-YOUR_DEV_KEY_HERE
      PERPLEXITY_API_KEY: pplx-YOUR_PERPLEXITY_API_KEY_HERE_DEV
      JINA_API_KEY: jina_YOUR_DEV_KEY_HERE
      FIRECRAWL_API_KEY: fc-YOUR_FIRECRAWL_API_KEY_HERE_DEV

      # Redis
      REDIS_URL: redis://redis:6379

      LOG_LEVEL: debug

    depends_on:
      - redis
    networks:
      - restomod-network
    restart: unless-stopped
    command: npm run scraper:watch

  # Redis (caching & rate limiting)
  redis:
    image: redis:7-alpine
    container_name: restomod-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - restomod-network
    restart: unless-stopped
    command: redis-server --appendonly yes

volumes:
  node_modules:
  scraper_node_modules:
  redis_data:

networks:
  restomod-network:
    driver: bridge
```

---

## Dockerfile (Main Application)

```dockerfile
# Dockerfile

# Development stage
FROM node:22-alpine AS development

# ⚠️ DEVELOPMENT BUILD - INCLUDES ALL SECRETS
LABEL env="development"
LABEL warning="Contains hardcoded API keys - DO NOT USE IN PRODUCTION"

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Development command (hot reload)
CMD ["npm", "run", "dev"]

# ============================================
# Production stage (DO NOT USE WITH DEV SECRETS)
FROM node:22-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets
COPY --from=development /app/dist ./dist
COPY --from=development /app/server ./server
COPY --from=development /app/shared ./shared
COPY --from=development /app/db ./db

EXPOSE 5000

CMD ["npm", "start"]
```

---

## Dockerfile (Scraper Service)

```dockerfile
# Dockerfile.scraper

FROM node:22-alpine AS development

# ⚠️ DEVELOPMENT BUILD - INCLUDES ALL SECRETS
LABEL env="development"
LABEL service="scraper"
LABEL warning="Contains hardcoded API keys - DO NOT USE IN PRODUCTION"

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Install additional scraping tools
RUN npm install apify-client @mendable/firecrawl-js tavily jina-ai bottleneck p-retry

# Copy source code
COPY . .

# Scraper runs as background service
CMD ["npm", "run", "scraper:dev"]
```

---

## Docker Ignore Configuration

```
# .dockerignore

# ⚠️ MODIFIED FOR DEVELOPMENT - DO NOT IGNORE SECRETS
# In production, you MUST ignore .env and credentials

# Node modules (will be installed in container)
node_modules
npm-debug.log

# Build artifacts
dist
*.log

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Test files
**/*.test.ts
**/*.spec.ts
coverage

# Documentation
*.md
!README.md

# ⚠️ DEVELOPMENT MODE - KEEPING SECRETS
# .env           # Uncomment for production
# .env.*         # Uncomment for production
# config/*.key   # Uncomment for production
```

---

## Docker Utility Scripts

### docker-dev.sh (Development Helper)

```bash
#!/bin/bash
# docker-dev.sh

echo "🔧 Restomod Central - Docker Development Helper"
echo "================================================"
echo ""
echo "⚠️  DEVELOPMENT MODE - ALL SECRETS INCLUDED"
echo "   DO NOT USE IN PRODUCTION"
echo ""

case "$1" in
  start)
    echo "🚀 Starting development containers..."
    docker-compose up --build
    ;;

  stop)
    echo "🛑 Stopping containers..."
    docker-compose down
    ;;

  restart)
    echo "🔄 Restarting containers..."
    docker-compose restart
    ;;

  logs)
    echo "📋 Showing logs..."
    docker-compose logs -f
    ;;

  shell)
    echo "🐚 Opening shell in app container..."
    docker exec -it restomod-app /bin/sh
    ;;

  scraper-shell)
    echo "🐚 Opening shell in scraper container..."
    docker exec -it restomod-scraper /bin/sh
    ;;

  clean)
    echo "🧹 Cleaning up containers and volumes..."
    docker-compose down -v
    docker system prune -f
    ;;

  rebuild)
    echo "🏗️  Rebuilding containers..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up
    ;;

  db-migrate)
    echo "📊 Running database migrations..."
    docker exec restomod-app npm run db:migrate
    ;;

  db-seed)
    echo "🌱 Seeding database..."
    docker exec restomod-app npm run db:seed
    ;;

  scrape)
    echo "🕷️  Running scraper manually..."
    docker exec restomod-scraper npm run batch:scrape:vehicles
    ;;

  status)
    echo "📊 Container status..."
    docker-compose ps
    ;;

  *)
    echo "Usage: ./docker-dev.sh {start|stop|restart|logs|shell|scraper-shell|clean|rebuild|db-migrate|db-seed|scrape|status}"
    exit 1
    ;;
esac
```

Make executable:
```bash
chmod +x docker-dev.sh
```

---

## Package.json Scripts (Updated)

```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",

    "db:migrate": "drizzle-kit push --config=./drizzle.config.ts",
    "db:seed": "tsx db/seed.ts",

    "scraper:dev": "tsx server/services/scraper-daemon.ts",
    "scraper:watch": "nodemon --exec tsx server/services/scraper-daemon.ts",

    "batch:scrape:vehicles": "tsx scripts/batch-scrape-vehicles.ts",
    "batch:scrape:events": "tsx scripts/batch-scrape-events.ts",
    "batch:process": "tsx scripts/batch-process-data.ts",
    "batch:import": "tsx scripts/batch-import-postgres.ts",
    "batch:full": "tsx scripts/batch-full-pipeline.ts",

    "docker:dev": "./docker-dev.sh start",
    "docker:stop": "./docker-dev.sh stop",
    "docker:logs": "./docker-dev.sh logs",
    "docker:rebuild": "./docker-dev.sh rebuild"
  }
}
```

---

## Environment Variable Management

### Development (.env.development)

```bash
# .env.development
# ⚠️ DEVELOPMENT ENVIRONMENT - HARDCODED CREDENTIALS

# Application
NODE_ENV=development
PORT=5000

# Database (PostgreSQL)
DATABASE_URL=postgresql://restomod_user:DEV_PASSWORD_123@YOUR_POSTGRES_HOST:5432/restomod_dev
POSTGRES_HOST=YOUR_POSTGRES_HOST_HERE
POSTGRES_PORT=5432
POSTGRES_DB=restomod_dev
POSTGRES_USER=restomod_user
POSTGRES_PASSWORD=DEV_PASSWORD_123
POSTGRES_SSL=false

# Authentication
JWT_SECRET=dev_jwt_secret_key_DO_NOT_USE_IN_PROD
ADMIN_EMAIL=jims67mustang@gmail.com
ADMIN_PASSWORD=Jimmy123$

# Scraping APIs
APIFY_API_KEY=apify_api_YOUR_DEV_KEY_HERE
BRAVE_API_KEY=BSA_YOUR_DEV_KEY_HERE
TAVILY_API_KEY=tvly-YOUR_DEV_KEY_HERE
PERPLEXITY_API_KEY=pplx-YOUR_PERPLEXITY_API_KEY_HERE_DEV
JINA_API_KEY=jina_YOUR_DEV_KEY_HERE
FIRECRAWL_API_KEY=fc-YOUR_FIRECRAWL_API_KEY_HERE_DEV

# AI Services
OPENAI_API_KEY=sk-YOUR_OPENAI_DEV_KEY
ANTHROPIC_API_KEY=sk-ant-YOUR_ANTHROPIC_DEV_KEY
GOOGLE_GENERATIVE_AI_KEY=YOUR_GOOGLE_AI_DEV_KEY

# Redis
REDIS_URL=redis://redis:6379

# Development Flags
ENABLE_HOT_RELOAD=true
LOG_LEVEL=debug
ENABLE_CORS=true
DISABLE_RATE_LIMITING=true
```

### Config File (Development)

```typescript
// config/development.ts

export const developmentConfig = {
  environment: 'DEVELOPMENT',

  // ⚠️ WARNING: Hardcoded credentials below
  database: {
    host: 'YOUR_POSTGRES_HOST_HERE',
    port: 5432,
    database: 'restomod_dev',
    user: 'restomod_user',
    password: 'DEV_PASSWORD_123',
    ssl: false,
  },

  auth: {
    jwtSecret: 'dev_jwt_secret_key_DO_NOT_USE_IN_PROD',
    defaultAdminEmail: 'jims67mustang@gmail.com',
    defaultAdminPassword: 'Jimmy123$',
  },

  scraping: {
    apify: 'apify_api_YOUR_DEV_KEY_HERE',
    brave: 'BSA_YOUR_DEV_KEY_HERE',
    tavily: 'tvly-YOUR_DEV_KEY_HERE',
    perplexity: 'pplx-YOUR_PERPLEXITY_API_KEY_HERE_DEV',
    jina: 'jina_YOUR_DEV_KEY_HERE',
    firecrawl: 'fc-YOUR_FIRECRAWL_API_KEY_HERE_DEV',
  },

  ai: {
    openai: 'sk-YOUR_OPENAI_DEV_KEY',
    anthropic: 'sk-ant-YOUR_ANTHROPIC_DEV_KEY',
    google: 'YOUR_GOOGLE_AI_DEV_KEY',
  },

  redis: {
    url: 'redis://redis:6379',
  },

  features: {
    hotReload: true,
    cors: true,
    rateLimit: false,
    logging: 'debug',
  },
};

// Validation
if (process.env.NODE_ENV === 'production') {
  throw new Error(
    '⚠️  CRITICAL: Development config detected in production!\n' +
    '   DO NOT use hardcoded credentials in production.\n' +
    '   Set proper environment variables.'
  );
}

console.warn('⚠️  WARNING: Using hardcoded development credentials!');
console.warn('   This is ONLY for development. Never use in production.');
```

---

## Data Persistence Strategy

### Volume Mounts

```yaml
volumes:
  # Source code (hot reload)
  - ./client:/app/client
  - ./server:/app/server
  - ./shared:/app/shared

  # Data directories (persistent)
  - ./data:/app/data              # JSON files, exports
  - ./logs:/app/logs              # Application logs
  - ./db:/app/db                  # SQLite (if used for local dev)

  # Node modules (Docker volume for performance)
  - node_modules:/app/node_modules
```

### Directory Structure

```
/app/
├── data/
│   ├── raw/              # Raw scraped data (bind mount)
│   ├── processed/        # Processed data (bind mount)
│   └── failed/           # Failed records (bind mount)
│
├── logs/
│   ├── app.log           # Application logs (bind mount)
│   ├── scraper.log       # Scraper logs (bind mount)
│   └── error.log         # Error logs (bind mount)
│
└── node_modules/         # Docker volume (not bind mount)
```

---

## Health Checks

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  scraper:
    healthcheck:
      test: ["CMD", "node", "-e", "process.exit(0)"]
      interval: 60s
      timeout: 10s
      retries: 3

  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 3s
      retries: 3
```

---

## Network Configuration

```yaml
networks:
  restomod-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

---

## Docker Commands Cheat Sheet

```bash
# Start everything
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all containers
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f scraper

# Restart service
docker-compose restart app

# Execute command in container
docker exec -it restomod-app npm run db:migrate

# Open shell in container
docker exec -it restomod-app /bin/sh

# Check container status
docker-compose ps

# View resource usage
docker stats

# Clean up everything
docker-compose down -v
docker system prune -a -f

# Rebuild without cache
docker-compose build --no-cache
```

---

## Deployment Workflow

### 1. Initial Setup

```bash
# Clone repository
git clone YOUR_REPO_URL
cd restomod_central

# Make scripts executable
chmod +x docker-dev.sh

# Start containers
./docker-dev.sh start

# Wait for containers to be healthy
docker-compose ps

# Run migrations
./docker-dev.sh db-migrate

# Seed database
./docker-dev.sh db-seed
```

### 2. Development Workflow

```bash
# Start working
./docker-dev.sh start

# View logs
./docker-dev.sh logs

# Run scraper manually
./docker-dev.sh scrape

# Access container shell
./docker-dev.sh shell

# Stop when done
./docker-dev.sh stop
```

### 3. Debugging

```bash
# Check container status
./docker-dev.sh status

# View specific logs
docker-compose logs -f app
docker-compose logs -f scraper

# Check database connection
docker exec restomod-app npm run db:health

# Test API endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/cars
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Rebuild without cache
docker-compose build --no-cache app

# Check port conflicts
lsof -i :5000
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
docker exec restomod-app node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? 'ERROR: ' + err : 'SUCCESS: ' + res.rows[0].now);
  pool.end();
});
"
```

### Hot Reload Not Working

```bash
# Check volume mounts
docker inspect restomod-app | grep Mounts -A 20

# Restart with fresh volumes
docker-compose down -v
docker-compose up --build
```

---

## Security Warnings

```
╔══════════════════════════════════════════════════════════╗
║                    ⚠️  WARNING  ⚠️                        ║
║                                                           ║
║  This Docker configuration contains HARDCODED            ║
║  API keys and credentials for DEVELOPMENT ONLY.          ║
║                                                           ║
║  ❌ DO NOT:                                              ║
║     • Push images to public registries                   ║
║     • Deploy to production servers                       ║
║     • Share containers publicly                          ║
║     • Commit secrets to public repos                     ║
║                                                           ║
║  ✅ FOR PRODUCTION:                                      ║
║     • Use proper secret management (Vault, AWS Secrets)  ║
║     • Use environment variables                          ║
║     • Never hardcode credentials                         ║
║     • Use .dockerignore for .env files                   ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

---

## Next Steps

1. Update PostgreSQL connection details
2. Start Docker containers
3. Run database migrations
4. Test all endpoints
5. Begin development

---

## Related Documentation

- [SCRAPING_ARCHITECTURE.md](./SCRAPING_ARCHITECTURE.md) - Scraping setup
- [POSTGRES_MIGRATION.md](./POSTGRES_MIGRATION.md) - Database migration
- [BATCH_PROCESSING_PIPELINE.md](./BATCH_PROCESSING_PIPELINE.md) - Data pipeline
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Development roadmap
