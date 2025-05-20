# ALT_LAS Chat Dağıtım Kılavuzu

Bu kılavuz, ALT_LAS Chat uygulamasının dağıtımı için gerekli adımları ve yapılandırmaları içermektedir.

## İçindekiler

1. [Gereksinimler](#gereksinimler)
2. [Derleme](#derleme)
3. [Dağıtım Ortamları](#dağıtım-ortamları)
4. [Dağıtım Adımları](#dağıtım-adımları)
5. [Yapılandırma](#yapılandırma)
6. [SSL Sertifikaları](#ssl-sertifikaları)
7. [Performans Optimizasyonu](#performans-optimizasyonu)
8. [İzleme ve Günlük Kaydı](#i̇zleme-ve-günlük-kaydı)
9. [Sorun Giderme](#sorun-giderme)

## Gereksinimler

### Derleme Gereksinimleri

- Node.js (v14 veya üzeri)
- npm (v6 veya üzeri) veya yarn (v1.22 veya üzeri)

### Sunucu Gereksinimleri

- Nginx veya Apache web sunucusu
- Node.js (v14 veya üzeri) (API sunucusu için)
- MongoDB (v4.4 veya üzeri)
- Redis (v6 veya üzeri)

## Derleme

### Geliştirme Ortamı

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start
```

### Üretim Derlemesi

```bash
# Üretim derlemesi oluştur
npm run build

# Derleme çıktısı ./build dizininde oluşturulacaktır
```

## Dağıtım Ortamları

ALT_LAS Chat, aşağıdaki ortamlarda dağıtılabilir:

### Geliştirme (Development)

- URL: `https://dev.altlas.com`
- API URL: `https://api-dev.altlas.com`
- WebSocket URL: `wss://api-dev.altlas.com/ws`

### Test (Staging)

- URL: `https://staging.altlas.com`
- API URL: `https://api-staging.altlas.com`
- WebSocket URL: `wss://api-staging.altlas.com/ws`

### Üretim (Production)

- URL: `https://altlas.com`
- API URL: `https://api.altlas.com`
- WebSocket URL: `wss://api.altlas.com/ws`

## Dağıtım Adımları

### 1. Derleme

```bash
# Üretim derlemesi oluştur
npm run build
```

### 2. Derleme Çıktısını Sunucuya Kopyala

```bash
# SCP ile kopyala
scp -r build/* user@server:/var/www/altlas.com/
```

veya

```bash
# rsync ile kopyala
rsync -avz --delete build/ user@server:/var/www/altlas.com/
```

### 3. Nginx Yapılandırması

```nginx
server {
    listen 80;
    server_name altlas.com www.altlas.com;
    
    # HTTP'den HTTPS'ye yönlendirme
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name altlas.com www.altlas.com;
    
    # SSL sertifikaları
    ssl_certificate /etc/letsencrypt/live/altlas.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/altlas.com/privkey.pem;
    
    # SSL yapılandırması
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Diğer güvenlik başlıkları
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.altlas.com wss://api.altlas.com;" always;
    
    # Kök dizin
    root /var/www/altlas.com;
    index index.html;
    
    # Gzip sıkıştırma
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
    
    # Statik dosyalar için önbellek
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # HTML dosyaları için önbellek yok
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    }
    
    # SPA yönlendirmesi
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4. API Sunucusu Yapılandırması

```nginx
server {
    listen 80;
    server_name api.altlas.com;
    
    # HTTP'den HTTPS'ye yönlendirme
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.altlas.com;
    
    # SSL sertifikaları
    ssl_certificate /etc/letsencrypt/live/api.altlas.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.altlas.com/privkey.pem;
    
    # SSL yapılandırması
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Diğer güvenlik başlıkları
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # CORS başlıkları
    add_header Access-Control-Allow-Origin "https://altlas.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept" always;
    add_header Access-Control-Allow-Credentials "true" always;
    
    # Proxy ayarları
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket proxy
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400; # 24 saat
    }
}
```

### 5. PM2 ile API Sunucusunu Başlatma

```bash
# PM2 yükle
npm install -g pm2

# API sunucusunu başlat
pm2 start server.js --name "altlas-api" --env production

# WebSocket sunucusunu başlat
pm2 start websocket.js --name "altlas-ws" --env production

# PM2'yi sistem başlangıcında otomatik başlatma
pm2 startup
pm2 save
```

## Yapılandırma

### Ortam Değişkenleri

API sunucusu için `.env` dosyası:

```
# Genel
NODE_ENV=production
PORT=3000
WS_PORT=3001

# MongoDB
MONGO_URI=mongodb://username:password@localhost:27017/altlas

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Dosya Yükleme
UPLOAD_DIR=/var/www/uploads
MAX_FILE_SIZE=50000000 # 50MB
MAX_FILES_PER_REQUEST=10

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@altlas.com
SMTP_PASS=your_smtp_password
SMTP_FROM=ALT_LAS <noreply@altlas.com>
```

Frontend için `.env` dosyası:

```
REACT_APP_API_URL=https://api.altlas.com
REACT_APP_WS_URL=wss://api.altlas.com/ws
REACT_APP_VERSION=$npm_package_version
REACT_APP_BUILD_TIME=$BUILD_TIME
```

## SSL Sertifikaları

Let's Encrypt ile SSL sertifikası oluşturma:

```bash
# Certbot yükle
apt-get update
apt-get install certbot python3-certbot-nginx

# Sertifika oluştur
certbot --nginx -d altlas.com -d www.altlas.com
certbot --nginx -d api.altlas.com

# Otomatik yenileme
certbot renew --dry-run
```

## Performans Optimizasyonu

### Frontend Optimizasyonu

- Kod bölme (Code splitting)
- Lazy loading
- Resim optimizasyonu
- Önbelleğe alma
- Gzip sıkıştırma
- HTTP/2 kullanımı
- CDN kullanımı

### Backend Optimizasyonu

- Veritabanı indeksleme
- Önbelleğe alma (Redis)
- Yük dengeleme
- Yatay ölçeklendirme
- Dikey ölçeklendirme

## İzleme ve Günlük Kaydı

### Frontend İzleme

- Google Analytics
- Sentry.io

### Backend İzleme

- PM2 Monitoring
- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)

## Sorun Giderme

### Yaygın Sorunlar

#### 502 Bad Gateway

- Nginx ve Node.js sunucusu arasındaki bağlantıyı kontrol edin
- Node.js sunucusunun çalıştığından emin olun
- Nginx yapılandırmasını kontrol edin

#### WebSocket Bağlantı Hatası

- WebSocket sunucusunun çalıştığından emin olun
- Nginx WebSocket proxy yapılandırmasını kontrol edin
- Güvenlik duvarı ayarlarını kontrol edin

#### Yüksek CPU/Bellek Kullanımı

- PM2 ile bellek sınırlaması ayarlayın
- Veritabanı sorgularını optimize edin
- Önbelleğe alma stratejilerini gözden geçirin
