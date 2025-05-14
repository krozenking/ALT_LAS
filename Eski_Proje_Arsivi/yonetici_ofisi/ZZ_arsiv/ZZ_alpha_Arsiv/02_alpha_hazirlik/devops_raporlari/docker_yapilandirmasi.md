# Docker Yapılandırması Raporu

**Tarih:** 10 Mayıs 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Alpha Aşaması - Docker Yapılandırması

## 1. Genel Bakış

Bu rapor, ALT_LAS projesinin alpha aşamasına geçiş için oluşturulan Docker yapılandırması hakkında bilgi vermektedir. Rapor, Docker Compose yapılandırması, servis Dockerfile'ları ve konteyner yapılandırmaları hakkında detayları içermektedir.

## 2. Docker Compose Yapılandırması

ALT_LAS projesi için oluşturulan Docker Compose yapılandırması (`docker-compose.yml`), aşağıdaki servisleri içermektedir:

```yaml
version: '3.8'

services:
  api-gateway:
    build:
      context: ./api-gateway
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    container_name: alt_las_api_gateway
    environment:
      - NODE_ENV=${NODE_ENV}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
      - SEGMENTATION_SERVICE_URL=${SEGMENTATION_SERVICE_URL}
      - RUNNER_SERVICE_URL=${RUNNER_SERVICE_URL}
      - ARCHIVE_SERVICE_URL=${ARCHIVE_SERVICE_URL}
      - AI_ORCHESTRATOR_URL=${AI_ORCHESTRATOR_URL}
    depends_on:
      - redis
      - segmentation-service
      - runner-service
      - archive-service
      - ai-orchestrator
    volumes:
      - ./api-gateway:/app
      - /app/node_modules
    restart: unless-stopped

  segmentation-service:
    build:
      context: ./segmentation-service
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    container_name: alt_las_segmentation_service
    environment:
      - PYTHONUNBUFFERED=${PYTHONUNBUFFERED}
      - PORT=${SEGMENTATION_PORT}
    volumes:
      - ./segmentation-service:/app
    restart: unless-stopped

  runner-service:
    build:
      context: ./runner-service
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    container_name: alt_las_runner_service
    environment:
      - RUST_LOG=${RUST_LOG}
      - RUNNER_AI_SERVICE_URL=${RUNNER_AI_SERVICE_URL}
    depends_on:
      - ai-orchestrator
    volumes:
      - ./runner-service:/usr/src/runner-service
    restart: unless-stopped

  archive-service:
    build:
      context: ./archive-service
      dockerfile: Dockerfile
    ports:
      - "9000:9000"
    container_name: alt_las_archive_service
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NATS_URL=${NATS_URL}
      - PORT=${ARCHIVE_PORT}
    depends_on:
      - postgres_db
      - nats
    volumes:
      - ./archive-service:/app
    restart: unless-stopped

  ai-orchestrator:
    build:
      context: ./ai-orchestrator
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    container_name: alt_las_ai_orchestrator
    environment:
      - PYTHONUNBUFFERED=${PYTHONUNBUFFERED}
      - PORT=${AI_PORT}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./ai-orchestrator:/app
    restart: unless-stopped

  redis:
    image: "redis:7-alpine"
    container_name: alt_las_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass "${REDIS_PASSWORD:-}"

  postgres_db:
    image: postgres:14-alpine
    container_name: alt_las_postgres_db
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nats:
    image: nats:2.9-alpine
    container_name: alt_las_nats
    ports:
      - "4222:4222" # Client port
      - "8222:8222" # Monitoring port
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## 3. Servis Dockerfile'ları

### 3.1. API Gateway Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 3.2. Segmentation Service Dockerfile

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 4. Ortam Değişkenleri

Proje için `.env.example` dosyası oluşturuldu. Bu dosya, projenin çalışması için gerekli ortam değişkenlerini içermektedir:

```
# ALT_LAS Environment Variables

# JWT Authentication
JWT_SECRET=your-jwt-secret-key-here

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=altlas
DATABASE_URL=postgresql://postgres:postgres@postgres-db:5432/altlas

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your-redis-password

# Service URLs
SEGMENTATION_SERVICE_URL=http://segmentation-service:8000
RUNNER_SERVICE_URL=http://runner-service:8080
ARCHIVE_SERVICE_URL=http://archive-service:9000
AI_ORCHESTRATOR_URL=http://ai-orchestrator:8001

# Service Ports
API_GATEWAY_PORT=3000
SEGMENTATION_PORT=8000
RUNNER_PORT=8080
ARCHIVE_PORT=9000
AI_PORT=8001

# AI Configuration
OPENAI_API_KEY=your-openai-api-key

# Logging
LOG_LEVEL=info
RUST_LOG=info
PYTHONUNBUFFERED=1

# NATS Messaging
NATS_URL=nats://nats:4222

# Runner Service Configuration
RUNNER_AI_SERVICE_URL=http://ai-orchestrator:8001

# Node Environment
NODE_ENV=development
```

## 5. Konteyner Yapılandırmaları

### 5.1. API Gateway

- **Base Image:** node:18-alpine
- **Port:** 3000
- **Volume Mounts:**
  - `./api-gateway:/app` (Kod değişikliklerinin anında yansıması için)
  - `/app/node_modules` (node_modules'ın üzerine yazılmasını engellemek için)
- **Restart Policy:** unless-stopped

### 5.2. Segmentation Service

- **Base Image:** python:3.10-slim
- **Port:** 8000
- **Volume Mounts:**
  - `./segmentation-service:/app` (Kod değişikliklerinin anında yansıması için)
- **Restart Policy:** unless-stopped

### 5.3. Veritabanı ve Mesajlaşma Servisleri

- **PostgreSQL:**
  - **Image:** postgres:14-alpine
  - **Port:** 5432
  - **Volume:** postgres_data
  - **Restart Policy:** unless-stopped

- **Redis:**
  - **Image:** redis:7-alpine
  - **Port:** 6379
  - **Volume:** redis_data
  - **Command:** redis-server --appendonly yes --requirepass "${REDIS_PASSWORD:-}"
  - **Restart Policy:** unless-stopped

- **NATS:**
  - **Image:** nats:2.9-alpine
  - **Ports:** 4222 (Client), 8222 (Monitoring)
  - **Restart Policy:** unless-stopped

## 6. Eksiklikler ve Sonraki Adımlar

### 6.1. Eksiklikler

1. **Runner Service ve Archive Service için Dockerfile'lar**: Bu servisler için Dockerfile'lar henüz oluşturulmadı.

2. **AI Orchestrator için Dockerfile**: AI Orchestrator servisi için Dockerfile henüz oluşturulmadı.

3. **Sağlık Kontrolleri**: Servislerin sağlık durumunu kontrol etmek için healthcheck yapılandırmaları eklenmedi.

4. **Ağ Yapılandırması**: Docker Compose ağ yapılandırması eksik.

### 6.2. Sonraki Adımlar

1. **Eksik Dockerfile'ların Oluşturulması**: Runner Service, Archive Service ve AI Orchestrator için Dockerfile'ların oluşturulması.

2. **Sağlık Kontrollerinin Eklenmesi**: Tüm servisler için healthcheck yapılandırmalarının eklenmesi.

3. **Ağ Yapılandırmasının İyileştirilmesi**: Docker Compose ağ yapılandırmasının iyileştirilmesi.

4. **Docker Compose Profilleri**: Farklı geliştirme senaryoları için Docker Compose profillerinin oluşturulması.

5. **Docker Image Optimizasyonu**: Docker image boyutlarının ve katmanlarının optimizasyonu.

## 7. Sonuç

ALT_LAS projesinin alpha aşamasına geçiş için gerekli Docker yapılandırması temel seviyede tamamlandı. Eksiklikler ve sonraki adımlar belirlendi. Backend Geliştirici (Ahmet Çelik) ve diğer ekip üyeleri ile koordineli çalışarak, eksik Dockerfile'ların oluşturulması ve diğer eksikliklerin giderilmesi planlanmaktadır.
