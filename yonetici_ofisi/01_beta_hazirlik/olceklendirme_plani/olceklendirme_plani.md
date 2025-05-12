# Ölçeklendirme Planı

**Tarih:** 31 Mayıs 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Aşaması Ölçeklendirme Planı

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta aşaması için ölçeklendirme planını içermektedir. Bu plan, alpha aşamasında tespit edilen ölçeklenebilirlik sorunlarını gidermek ve beta aşamasında daha fazla kullanıcıyı desteklemek amacıyla hazırlanmıştır. Ölçeklendirme çalışmaları, DevOps mühendisi Can Tekin tarafından gerçekleştirilecektir.

## 2. Mevcut Ölçeklenebilirlik Durumu

Alpha aşamasında tespit edilen ölçeklenebilirlik sorunları aşağıdaki gibidir:

### 2.1. Servis Ölçeklenebilirlik Durumu

| Servis | Yatay Ölçeklenebilirlik | Dikey Ölçeklenebilirlik | Ölçeklendirme Sınırları |
|--------|--------------------------|--------------------------|-------------------------|
| API Gateway | Yüksek | Orta | 10 replika |
| Segmentation Service | Orta | Yüksek | 5 replika |
| Runner Service | Yüksek | Orta | 8 replika |
| Archive Service | Yüksek | Yüksek | 6 replika |
| AI Orchestrator | Orta | Yüksek | 4 replika |

### 2.2. Kubernetes Cluster Durumu

- **Node Sayısı**: 3 node
- **Node Tipi**: Genel amaçlı (4 vCPU, 16GB RAM)
- **Cluster Autoscaler**: Yapılandırılmamış
- **Node Affinity**: Yapılandırılmamış

### 2.3. Veritabanı Ölçeklenebilirlik Durumu

- **Veritabanı Tipi**: PostgreSQL
- **Sharding**: Uygulanmamış
- **Read Replica**: Uygulanmamış
- **Bağlantı Havuzu**: Optimum yapılandırılmamış

### 2.4. Yük Dengeleme Durumu

- **Ingress Controller**: NGINX Ingress Controller
- **Session Affinity**: Yapılandırılmamış
- **Rate Limiting**: Uygulanmamış
- **CDN**: Entegre edilmemiş

## 3. Ölçeklendirme Gereksinimleri

Beta aşaması için ölçeklendirme gereksinimleri aşağıdaki gibidir:

### 3.1. Kullanıcı ve Trafik Gereksinimleri

- **Eş Zamanlı Kullanıcı Sayısı**: 1000 kullanıcı
- **Günlük Aktif Kullanıcı Sayısı**: 5000 kullanıcı
- **Saniyedeki İstek Sayısı (RPS)**: 500 RPS
- **Veri Transferi**: 100GB/gün

### 3.2. Servis Ölçeklenebilirlik Gereksinimleri

| Servis | Minimum Replika | Maksimum Replika | CPU Hedef Kullanımı | Bellek Hedef Kullanımı |
|--------|-----------------|------------------|---------------------|------------------------|
| API Gateway | 3 | 20 | %70 | %70 |
| Segmentation Service | 3 | 15 | %70 | %70 |
| Runner Service | 3 | 16 | %70 | %70 |
| Archive Service | 2 | 12 | %70 | %70 |
| AI Orchestrator | 2 | 10 | %70 | %70 |

### 3.3. Kubernetes Cluster Gereksinimleri

- **Node Sayısı**: Minimum 5, maksimum 10 node
- **Node Tipleri**: Genel, CPU-optimized, memory-optimized
- **Cluster Autoscaler**: Yapılandırılmış
- **Node Affinity**: Yapılandırılmış

### 3.4. Veritabanı Ölçeklenebilirlik Gereksinimleri

- **Veritabanı Tipi**: PostgreSQL
- **Sharding**: Uygulanmış
- **Read Replica**: En az 2 replica
- **Bağlantı Havuzu**: Optimum yapılandırılmış

### 3.5. Yük Dengeleme Gereksinimleri

- **Ingress Controller**: NGINX Ingress Controller
- **Session Affinity**: Yapılandırılmış
- **Rate Limiting**: Uygulanmış
- **CDN**: Entegre edilmiş

## 4. Ölçeklendirme Stratejisi

Beta aşaması için ölçeklendirme stratejisi aşağıdaki gibidir:

### 4.1. Kubernetes Cluster Ölçeklendirme Stratejisi

#### 4.1.1. Node Yapılandırması

- **Genel Node Havuzu**:
  - Node Sayısı: 3-5
  - Node Tipi: 4 vCPU, 16GB RAM
  - Kullanım: API Gateway, genel servisler

- **CPU-Optimized Node Havuzu**:
  - Node Sayısı: 1-3
  - Node Tipi: 8 vCPU, 16GB RAM
  - Kullanım: AI Orchestrator, Segmentation Service

- **Memory-Optimized Node Havuzu**:
  - Node Sayısı: 1-2
  - Node Tipi: 4 vCPU, 32GB RAM
  - Kullanım: Veritabanı, cache servisleri

#### 4.1.2. Cluster Autoscaler Yapılandırması

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: ClusterAutoscaler
metadata:
  name: alt-las-cluster-autoscaler
spec:
  scaleDown:
    enabled: true
    delayAfterAdd: 10m
    delayAfterDelete: 10m
    delayAfterFailure: 3m
    unneededTime: 10m
  scaleDownUtilizationThreshold: 0.5
  maxNodeProvisionTime: 15m
  maxGracefulTerminationSec: 600
  maxTotalUnreadyPercentage: 45
  maxNodesTotalCount: 10
  minNodesTotalCount: 5
  nodeGroups:
  - name: general-pool
    minSize: 3
    maxSize: 5
  - name: cpu-optimized-pool
    minSize: 1
    maxSize: 3
  - name: memory-optimized-pool
    minSize: 1
    maxSize: 2
```

#### 4.1.3. Node Affinity Yapılandırması

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-orchestrator
  namespace: alt-las
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ai-orchestrator
  template:
    metadata:
      labels:
        app: ai-orchestrator
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: node-pool
                operator: In
                values:
                - cpu-optimized-pool
      containers:
      - name: ai-orchestrator
        image: alt-las/ai-orchestrator:latest
        resources:
          requests:
            cpu: "1000m"
            memory: "1024Mi"
          limits:
            cpu: "2000m"
            memory: "2048Mi"
```

#### 4.1.4. Taint ve Toleration Yapılandırması

```yaml
# CPU-Optimized Node Havuzu için Taint
kubectl taint nodes <node-name> cpu=high:NoSchedule

# Memory-Optimized Node Havuzu için Taint
kubectl taint nodes <node-name> memory=high:NoSchedule

# AI Orchestrator için Toleration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-orchestrator
  namespace: alt-las
spec:
  template:
    spec:
      tolerations:
      - key: "cpu"
        operator: "Equal"
        value: "high"
        effect: "NoSchedule"
```

### 4.2. Servis Ölçeklendirme Stratejisi

#### 4.2.1. HPA Yapılandırması

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-orchestrator
  namespace: alt-las
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-orchestrator
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
      - type: Pods
        value: 4
        periodSeconds: 60
      selectPolicy: Max
```

#### 4.2.2. Servis Mesh (Istio) Yapılandırması

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ai-orchestrator
  namespace: alt-las
spec:
  hosts:
  - ai-orchestrator
  http:
  - route:
    - destination:
        host: ai-orchestrator
        subset: v1
      weight: 90
    - destination:
        host: ai-orchestrator
        subset: v2
      weight: 10
---
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: ai-orchestrator
  namespace: alt-las
spec:
  host: ai-orchestrator
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 1024
        maxRequestsPerConnection: 10
    outlierDetection:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 10
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
```

#### 4.2.3. Stateless Servis Dönüşümü

AI Orchestrator ve Segmentation Service'in stateless hale getirilmesi için aşağıdaki değişiklikler yapılacaktır:

- **Session Yönetimi**: Session bilgileri Redis'e taşınacak
- **Durum Bilgisi**: Durum bilgisi veritabanına taşınacak
- **Geçici Dosyalar**: Geçici dosyalar object storage'a taşınacak

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-orchestrator
  namespace: alt-las
spec:
  template:
    spec:
      containers:
      - name: ai-orchestrator
        env:
        - name: SESSION_STORE
          value: "redis"
        - name: REDIS_HOST
          value: "redis"
        - name: REDIS_PORT
          value: "6379"
        - name: STATE_STORE
          value: "database"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: url
        - name: TEMP_STORAGE
          value: "s3"
        - name: S3_BUCKET
          value: "alt-las-temp"
        - name: S3_REGION
          value: "us-west-2"
```

### 4.3. Veritabanı Ölçeklendirme Stratejisi

#### 4.3.1. Veritabanı Sharding

Veritabanı sharding için aşağıdaki strateji uygulanacaktır:

- **Sharding Anahtarı**: Kullanıcı ID'si
- **Shard Sayısı**: 4 shard
- **Shard Dağılımı**: Hash tabanlı dağılım

```sql
-- Shard 1: user_id % 4 = 0
CREATE TABLE users_shard_0 (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Shard 2: user_id % 4 = 1
CREATE TABLE users_shard_1 (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Shard 3: user_id % 4 = 2
CREATE TABLE users_shard_2 (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Shard 4: user_id % 4 = 3
CREATE TABLE users_shard_3 (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### 4.3.2. Read Replica Yapılandırması

PostgreSQL read replica yapılandırması için aşağıdaki strateji uygulanacaktır:

- **Master**: 1 master veritabanı
- **Read Replica**: 2 read replica
- **Replikasyon Tipi**: Asenkron replikasyon

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-master
  namespace: alt-las
spec:
  serviceName: postgres-master
  replicas: 1
  selector:
    matchLabels:
      app: postgres
      role: master
  template:
    metadata:
      labels:
        app: postgres
        role: master
    spec:
      containers:
      - name: postgres
        image: postgres:13
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-credentials
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-credentials
              key: password
        - name: POSTGRES_DB
          value: altlas
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-master-data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-master-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 100Gi
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-replica
  namespace: alt-las
spec:
  serviceName: postgres-replica
  replicas: 2
  selector:
    matchLabels:
      app: postgres
      role: replica
  template:
    metadata:
      labels:
        app: postgres
        role: replica
    spec:
      containers:
      - name: postgres
        image: postgres:13
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-credentials
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-credentials
              key: password
        - name: POSTGRES_DB
          value: altlas
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        - name: REPLICA_MODE
          value: "true"
        - name: MASTER_HOST
          value: postgres-master
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-replica-data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-replica-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 100Gi
```

#### 4.3.3. Bağlantı Havuzu Optimizasyonu

Veritabanı bağlantı havuzu optimizasyonu için aşağıdaki strateji uygulanacaktır:

- **Minimum Bağlantı**: 5 bağlantı
- **Maksimum Bağlantı**: 20 bağlantı
- **Bağlantı Zaman Aşımı**: 30 saniye
- **Bağlantı Yeniden Kullanımı**: Aktif

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-orchestrator
  namespace: alt-las
spec:
  template:
    spec:
      containers:
      - name: ai-orchestrator
        env:
        - name: DB_MIN_CONNECTIONS
          value: "5"
        - name: DB_MAX_CONNECTIONS
          value: "20"
        - name: DB_CONNECTION_TIMEOUT
          value: "30"
        - name: DB_CONNECTION_REUSE
          value: "true"
```

### 4.4. Yük Dengeleme Stratejisi

#### 4.4.1. Ingress Controller İyileştirmesi

NGINX Ingress Controller iyileştirmesi için aşağıdaki strateji uygulanacaktır:

- **Worker Process**: 4 worker
- **Worker Connections**: 4096 bağlantı
- **Keepalive Timeout**: 65 saniye
- **Client Body Buffer Size**: 128k

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-configuration
  namespace: ingress-nginx
data:
  worker-processes: "4"
  max-worker-connections: "4096"
  keep-alive: "65"
  keep-alive-requests: "100"
  client-body-buffer-size: "128k"
  proxy-body-size: "50m"
  proxy-read-timeout: "60s"
  proxy-send-timeout: "60s"
  server-tokens: "false"
  ssl-protocols: "TLSv1.2 TLSv1.3"
  ssl-ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384"
  ssl-prefer-server-ciphers: "true"
  use-http2: "true"
  use-gzip: "true"
  gzip-level: "6"
  gzip-types: "application/javascript application/x-javascript application/json application/xml application/xml+rss text/css text/javascript text/plain text/xml"
```

#### 4.4.2. Session Affinity Yapılandırması

Session affinity yapılandırması için aşağıdaki strateji uygulanacaktır:

- **Session Affinity**: Cookie tabanlı
- **Session Cookie Adı**: ALTSESSID
- **Session Cookie Süresi**: 1 saat

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: alt-las-ingress
  namespace: alt-las
  annotations:
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/session-cookie-name: "ALTSESSID"
    nginx.ingress.kubernetes.io/session-cookie-expires: "3600"
    nginx.ingress.kubernetes.io/session-cookie-max-age: "3600"
spec:
  rules:
  - host: api.alt-las.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 8080
```

#### 4.4.3. Rate Limiting Uygulanması

Rate limiting uygulanması için aşağıdaki strateji uygulanacaktır:

- **Rate Limit**: 100 istek/dakika
- **Rate Limit Aşım Davranışı**: 429 Too Many Requests
- **Rate Limit Anahtarı**: IP adresi

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: alt-las-ingress
  namespace: alt-las
  annotations:
    nginx.ingress.kubernetes.io/limit-rps: "100"
    nginx.ingress.kubernetes.io/limit-connections: "10"
    nginx.ingress.kubernetes.io/limit-rate: "1m"
    nginx.ingress.kubernetes.io/limit-rate-after: "10m"
    nginx.ingress.kubernetes.io/limit-whitelist: "127.0.0.1/32,10.0.0.0/8"
spec:
  rules:
  - host: api.alt-las.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 8080
```

#### 4.4.4. CDN Entegrasyonu

CDN entegrasyonu için aşağıdaki strateji uygulanacaktır:

- **CDN Sağlayıcı**: Cloudflare
- **CDN Cache Süresi**: 1 gün
- **CDN Cache Bypass**: Cache-Control header'ı ile

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: alt-las-static-ingress
  namespace: alt-las
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cache-Control "public, max-age=86400";
      add_header X-Cache-Status $upstream_cache_status;
spec:
  rules:
  - host: static.alt-las.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: static-content
            port:
              number: 8080
```

## 5. Ölçeklendirme Takvimi

| Görev | Başlangıç | Bitiş |
|-------|-----------|-------|
| Kubernetes Cluster Ölçeklendirme | 31 Mayıs 2025 | 1 Haziran 2025 |
| Veritabanı Ölçeklendirme | 1 Haziran 2025 | 2 Haziran 2025 |
| Servis Ölçeklendirme | 2 Haziran 2025 | 3 Haziran 2025 |
| Yük Dengeleme İyileştirmeleri | 3 Haziran 2025 | 4 Haziran 2025 |

## 6. Ölçeklendirme Test Planı

Ölçeklendirme iyileştirmelerinin etkinliğini doğrulamak için aşağıdaki testler yapılacaktır:

### 6.1. Yük Testi

- Sabit yük altında performans testi
- Artan yük altında performans testi
- Farklı yük profilleri ile performans testi

### 6.2. Ölçeklenebilirlik Testi

- Yatay ölçeklendirme testi
- Dikey ölçeklendirme testi
- Otomatik ölçeklendirme testi

### 6.3. Dayanıklılık Testi

- Uzun süreli performans testi
- Node çökmesi durumunda davranış testi
- Servis çökmesi durumunda davranış testi

### 6.4. Veritabanı Testi

- Veritabanı sharding testi
- Read replica testi
- Bağlantı havuzu testi

## 7. Sonuç

Bu ölçeklendirme planı, ALT_LAS projesinin beta aşamasında daha fazla kullanıcıyı desteklemek amacıyla hazırlanmıştır. Plan, Kubernetes cluster ölçeklendirme, servis ölçeklendirme, veritabanı ölçeklendirme ve yük dengeleme iyileştirmeleri gibi çeşitli alanlarda iyileştirmeler içermektedir. Bu iyileştirmeler, DevOps mühendisi Can Tekin tarafından gerçekleştirilecektir. Ölçeklendirme iyileştirmelerinin başarısı, çeşitli ölçeklenebilirlik testleri ile doğrulanacaktır.
