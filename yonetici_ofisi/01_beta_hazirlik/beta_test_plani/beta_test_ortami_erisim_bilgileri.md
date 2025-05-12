# Beta Test Ortamı Erişim Bilgileri

**Tarih:** 18 Haziran 2025
**Hazırlayan:** Can Tekin (DevOps Mühendisi)
**Konu:** ALT_LAS Projesi Beta Test Ortamı Erişim Bilgileri

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test ortamına erişim için gerekli bilgileri içermektedir. Beta test kullanıcıları, bu belgedeki bilgileri kullanarak beta test ortamına erişebilir ve beta testlerini gerçekleştirebilirler.

## 2. Ağ Erişimi

Beta test ortamına aşağıdaki ağ bilgileri üzerinden erişilebilir:

### 2.1. DNS Kayıtları

| Servis | DNS Adı | IP Adresi |
|--------|---------|-----------|
| API Gateway | api.beta.alt-las.com | 10.0.2.10 |
| Grafana | grafana.beta.alt-las.com | 10.0.2.10 |
| Kibana | kibana.beta.alt-las.com | 10.0.2.10 |
| Jaeger | jaeger.beta.alt-las.com | 10.0.2.10 |

### 2.2. NodePort Servisleri

| Servis | URL | Açıklama |
|--------|-----|----------|
| Grafana | http://10.0.2.10:30080 | Grafana web arayüzü |
| Prometheus | http://10.0.2.10:30090 | Prometheus web arayüzü |
| Alertmanager | http://10.0.2.10:30093 | Alertmanager web arayüzü |
| Kibana | http://10.0.2.10:30601 | Kibana web arayüzü |
| Jaeger | http://10.0.2.10:30686 | Jaeger web arayüzü |
| PostgreSQL | 10.0.2.10:30432 | PostgreSQL veritabanı |
| MongoDB | 10.0.2.10:30017 | MongoDB veritabanı |
| Redis | 10.0.2.10:30379 | Redis veritabanı |
| RabbitMQ | 10.0.2.10:30672 | RabbitMQ AMQP |
| RabbitMQ Management | http://10.0.2.10:31672 | RabbitMQ yönetim arayüzü |

## 3. Kullanıcı Erişimi

Beta test ortamına erişim için aşağıdaki kullanıcı bilgileri kullanılabilir:

### 3.1. ALT_LAS Kullanıcıları

| Kullanıcı Tipi | Kullanıcı Adı | Parola | Açıklama |
|----------------|---------------|--------|----------|
| Admin | admin | beta2025 | Sistem yöneticisi |
| Manager | manager | beta2025 | Sistem yöneticisi yardımcısı |
| User | user | beta2025 | Normal kullanıcı |

### 3.2. İzleme ve Günlük Kaydı Kullanıcıları

| Servis | Kullanıcı Adı | Parola | Açıklama |
|--------|---------------|--------|----------|
| Grafana | admin | altlas | Grafana yöneticisi |
| Kibana | elastic | altlas | Kibana yöneticisi |
| Prometheus | - | - | Kimlik doğrulama yok |
| Alertmanager | - | - | Kimlik doğrulama yok |
| Jaeger | - | - | Kimlik doğrulama yok |

### 3.3. Veritabanı Kullanıcıları

| Veritabanı | Kullanıcı Adı | Parola | Açıklama |
|------------|---------------|--------|----------|
| PostgreSQL | altlas | altlas | PostgreSQL yöneticisi |
| MongoDB | altlas | altlas | MongoDB yöneticisi |
| Redis | - | altlas | Redis yöneticisi |

### 3.4. Mesaj Kuyruğu Kullanıcıları

| Servis | Kullanıcı Adı | Parola | Açıklama |
|--------|---------------|--------|----------|
| RabbitMQ | altlas | altlas | RabbitMQ yöneticisi |

## 4. API Erişimi

Beta test ortamındaki API'lere erişim için aşağıdaki bilgiler kullanılabilir:

### 4.1. API Gateway

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| /api/v1/auth/login | POST | Kullanıcı girişi |
| /api/v1/auth/refresh | POST | Token yenileme |
| /api/v1/auth/logout | POST | Kullanıcı çıkışı |
| /api/v1/users | GET | Kullanıcıları listeleme |
| /api/v1/users/{id} | GET | Kullanıcı detaylarını getirme |
| /api/v1/segmentation/jobs | POST | Segmentasyon işi oluşturma |
| /api/v1/segmentation/jobs | GET | Segmentasyon işlerini listeleme |
| /api/v1/segmentation/jobs/{id} | GET | Segmentasyon işi detaylarını getirme |
| /api/v1/runner/jobs | GET | İşleri listeleme |
| /api/v1/runner/jobs/{id} | GET | İş detaylarını getirme |
| /api/v1/archive/files | GET | Arşiv dosyalarını listeleme |
| /api/v1/archive/files/{id} | GET | Arşiv dosyası detaylarını getirme |
| /api/v1/ai/models | GET | AI modellerini listeleme |
| /api/v1/ai/models/{id} | GET | AI model detaylarını getirme |

### 4.2. API Kimlik Doğrulama

API'lere erişim için JWT (JSON Web Token) tabanlı kimlik doğrulama kullanılmaktadır. Kimlik doğrulama adımları:

1. `/api/v1/auth/login` endpoint'ine kullanıcı adı ve parola ile POST isteği gönderin.
2. Yanıtta dönen `accessToken` ve `refreshToken` değerlerini saklayın.
3. Diğer API isteklerinde, `Authorization` başlığında `Bearer {accessToken}` formatında token gönderin.
4. `accessToken` süresi dolduğunda, `/api/v1/auth/refresh` endpoint'ine `refreshToken` ile POST isteği göndererek yeni bir `accessToken` alın.

Örnek istek:

```http
POST /api/v1/auth/login HTTP/1.1
Host: api.beta.alt-las.com
Content-Type: application/json

{
  "username": "admin",
  "password": "beta2025"
}
```

Örnek yanıt:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

## 5. SSH Erişimi

Beta test ortamındaki sunuculara SSH ile erişim için aşağıdaki bilgiler kullanılabilir:

### 5.1. SSH Kullanıcıları

| Sunucu | Kullanıcı Adı | Kimlik Doğrulama | Açıklama |
|--------|---------------|------------------|----------|
| alt-las-master | altlas | SSH Anahtar | Kubernetes master node |
| alt-las-worker1 | altlas | SSH Anahtar | Kubernetes worker node |
| alt-las-worker2 | altlas | SSH Anahtar | Kubernetes worker node |

### 5.2. SSH Erişim Örneği

```bash
ssh altlas@10.0.2.10 -i ~/.ssh/alt-las-beta.pem
```

## 6. Kubernetes Erişimi

Beta test ortamındaki Kubernetes cluster'a erişim için aşağıdaki bilgiler kullanılabilir:

### 6.1. kubectl Yapılandırması

```bash
# kubeconfig dosyasını indirme
scp altlas@10.0.2.10:~/.kube/config ~/.kube/alt-las-beta-config

# kubectl yapılandırması
export KUBECONFIG=~/.kube/alt-las-beta-config
kubectl config use-context kubernetes-admin@kubernetes

# cluster durumunu kontrol etme
kubectl get nodes
```

### 6.2. Kubernetes Dashboard

Kubernetes Dashboard'a aşağıdaki URL üzerinden erişilebilir:

```
http://10.0.2.10:30000
```

Kubernetes Dashboard'a erişim için token:

```
eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9...
```

## 7. İzleme ve Günlük Kaydı Erişimi

Beta test ortamındaki izleme ve günlük kaydı araçlarına erişim için aşağıdaki bilgiler kullanılabilir:

### 7.1. Grafana

Grafana'ya aşağıdaki URL üzerinden erişilebilir:

```
http://grafana.beta.alt-las.com
http://10.0.2.10:30080
```

Grafana'ya erişim için kullanıcı adı ve parola:

```
Kullanıcı Adı: admin
Parola: altlas
```

### 7.2. Prometheus

Prometheus'a aşağıdaki URL üzerinden erişilebilir:

```
http://10.0.2.10:30090
```

### 7.3. Alertmanager

Alertmanager'a aşağıdaki URL üzerinden erişilebilir:

```
http://10.0.2.10:30093
```

### 7.4. Kibana

Kibana'ya aşağıdaki URL üzerinden erişilebilir:

```
http://kibana.beta.alt-las.com
http://10.0.2.10:30601
```

Kibana'ya erişim için kullanıcı adı ve parola:

```
Kullanıcı Adı: elastic
Parola: altlas
```

### 7.5. Jaeger

Jaeger'a aşağıdaki URL üzerinden erişilebilir:

```
http://jaeger.beta.alt-las.com
http://10.0.2.10:30686
```

## 8. Veritabanı Erişimi

Beta test ortamındaki veritabanlarına erişim için aşağıdaki bilgiler kullanılabilir:

### 8.1. PostgreSQL

PostgreSQL'e aşağıdaki bilgilerle erişilebilir:

```
Host: 10.0.2.10
Port: 30432
Veritabanı: altlas
Kullanıcı Adı: altlas
Parola: altlas
```

Örnek bağlantı:

```bash
psql -h 10.0.2.10 -p 30432 -U altlas -d altlas
```

### 8.2. MongoDB

MongoDB'ye aşağıdaki bilgilerle erişilebilir:

```
Host: 10.0.2.10
Port: 30017
Veritabanı: altlas
Kullanıcı Adı: altlas
Parola: altlas
```

Örnek bağlantı:

```bash
mongo mongodb://altlas:altlas@10.0.2.10:30017/altlas
```

### 8.3. Redis

Redis'e aşağıdaki bilgilerle erişilebilir:

```
Host: 10.0.2.10
Port: 30379
Parola: altlas
```

Örnek bağlantı:

```bash
redis-cli -h 10.0.2.10 -p 30379 -a altlas
```

## 9. RabbitMQ Erişimi

RabbitMQ'ya aşağıdaki bilgilerle erişilebilir:

### 9.1. RabbitMQ AMQP

```
Host: 10.0.2.10
Port: 30672
Kullanıcı Adı: altlas
Parola: altlas
```

### 9.2. RabbitMQ Yönetim Arayüzü

RabbitMQ yönetim arayüzüne aşağıdaki URL üzerinden erişilebilir:

```
http://10.0.2.10:31672
```

RabbitMQ yönetim arayüzüne erişim için kullanıcı adı ve parola:

```
Kullanıcı Adı: altlas
Parola: altlas
```

## 10. Sorun Bildirme

Beta test sırasında karşılaşılan sorunlar, aşağıdaki yöntemlerle bildirilebilir:

### 10.1. Sorun Takip Sistemi

Sorunlar, aşağıdaki URL üzerinden erişilebilen sorun takip sistemine kaydedilebilir:

```
http://issues.beta.alt-las.com
```

Sorun takip sistemine erişim için kullanıcı adı ve parola:

```
Kullanıcı Adı: beta-tester
Parola: beta2025
```

### 10.2. E-posta

Sorunlar, aşağıdaki e-posta adresine bildirilebilir:

```
beta-support@alt-las.com
```

### 10.3. Slack

Sorunlar, aşağıdaki Slack kanalına bildirilebilir:

```
#alt-las-beta-test
```

Slack kanalına davet bağlantısı:

```
https://join.slack.com/t/alt-las-beta/shared_invite/...
```
