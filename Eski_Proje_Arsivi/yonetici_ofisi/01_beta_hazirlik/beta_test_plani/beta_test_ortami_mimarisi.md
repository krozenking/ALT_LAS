# Beta Test Ortamı Mimarisi

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Ortamı Mimarisi

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için kurulan test ortamının mimarisini tanımlamaktadır. Beta test ortamı, üretim ortamına benzer ancak ayrı bir ortam olarak tasarlanmıştır ve beta testleri için kullanılacaktır.

## 2. Fiziksel Mimari

Beta test ortamı, aşağıdaki fiziksel bileşenlerden oluşmaktadır:

### 2.1. Sunucular

| Sunucu | Rol | CPU | RAM | Disk | IP Adresi |
|--------|-----|-----|-----|------|-----------|
| alt-las-master | Kubernetes Master | 4 vCPU | 16 GB | 100 GB SSD | 10.0.2.10 |
| alt-las-worker1 | Kubernetes Worker | 4 vCPU | 16 GB | 100 GB SSD | 10.0.2.11 |
| alt-las-worker2 | Kubernetes Worker | 4 vCPU | 16 GB | 100 GB SSD | 10.0.2.12 |

### 2.2. Ağ Topolojisi

Beta test ortamı, aşağıdaki ağ topolojisine sahiptir:

| Ağ | CIDR | Kullanım Amacı |
|----|------|----------------|
| Node Ağı | 10.0.2.0/24 | Kubernetes Node'ları |
| Pod Ağı | 192.168.0.0/16 | Kubernetes Pod'ları |
| Servis Ağı | 10.96.0.0/12 | Kubernetes Servisleri |

## 3. Kubernetes Mimarisi

Beta test ortamı, Kubernetes üzerinde çalışmaktadır. Kubernetes mimarisi aşağıdaki bileşenlerden oluşmaktadır:

### 3.1. Kubernetes Cluster

| Bileşen | Versiyon | Açıklama |
|---------|----------|----------|
| Kubernetes | 1.24.0 | Konteyner orkestrasyon platformu |
| Docker | 20.10 | Konteyner çalıştırma ortamı |
| Calico | 3.23 | Kubernetes ağ eklentisi |
| Local Path Provisioner | 0.0.21 | Yerel depolama sağlayıcısı |

### 3.2. Kubernetes Namespace'leri

| Namespace | Açıklama |
|-----------|----------|
| alt-las | ALT_LAS servisleri |
| database | Veritabanı servisleri |
| messaging | Mesaj kuyruğu servisleri |
| monitoring | İzleme servisleri |
| logging | Günlük kaydı servisleri |
| tracing | Dağıtık izleme servisleri |
| ingress-nginx | Ingress Controller |

## 4. Uygulama Mimarisi

Beta test ortamı, ALT_LAS uygulamasının aşağıdaki bileşenlerini içermektedir:

### 4.1. ALT_LAS Servisleri

| Servis | Replika Sayısı | Açıklama |
|--------|----------------|----------|
| API Gateway | 1 | API isteklerini yönlendiren ve kimlik doğrulama yapan servis |
| Segmentation Service | 1 | Görüntü segmentasyonu yapan servis |
| Runner Service | 1 | İş sırası yönetimini yapan servis |
| Archive Service | 1 | Veri arşivleme işlemlerini yapan servis |
| AI Orchestrator | 1 | Yapay zeka modellerini yöneten servis |

### 4.2. Veritabanları

| Veritabanı | Versiyon | Açıklama |
|------------|----------|----------|
| PostgreSQL | 13 | İlişkisel veritabanı (API Gateway, Runner Service) |
| MongoDB | 5.0 | Doküman veritabanı (Segmentation Service, AI Orchestrator) |
| Elasticsearch | 7.17 | Arama veritabanı (Archive Service, Günlük Kaydı) |
| Redis | 6.2 | Önbellek ve oturum yönetimi |

### 4.3. Mesaj Kuyruğu

| Mesaj Kuyruğu | Versiyon | Açıklama |
|---------------|----------|----------|
| RabbitMQ | 3.9 | Servisler arası asenkron iletişim |

## 5. İzleme ve Günlük Kaydı Mimarisi

Beta test ortamı, aşağıdaki izleme ve günlük kaydı bileşenlerini içermektedir:

### 5.1. İzleme Bileşenleri

| Bileşen | Versiyon | Açıklama |
|---------|----------|----------|
| Prometheus | 2.36 | Metrik toplama |
| Grafana | 9.0 | Metrik görselleştirme |
| Alertmanager | 0.24 | Uyarı yönetimi |

### 5.2. Günlük Kaydı Bileşenleri

| Bileşen | Versiyon | Açıklama |
|---------|----------|----------|
| Elasticsearch | 7.17 | Günlük depolama |
| Fluentd | 1.14 | Günlük toplama |
| Kibana | 7.17 | Günlük görselleştirme |

### 5.3. Dağıtık İzleme Bileşenleri

| Bileşen | Versiyon | Açıklama |
|---------|----------|----------|
| Jaeger | 1.35 | Dağıtık izleme |

## 6. Ağ Mimarisi

Beta test ortamı, aşağıdaki ağ bileşenlerini içermektedir:

### 6.1. Ingress Controller

| Bileşen | Versiyon | Açıklama |
|---------|----------|----------|
| NGINX Ingress Controller | 1.2.0 | HTTP/HTTPS trafiğini yönlendirme |

### 6.2. Servis Erişim Noktaları

| Servis | URL | Port | Açıklama |
|--------|-----|------|----------|
| API Gateway | http://api.beta.alt-las.com | 80 | API Gateway |
| Grafana | http://grafana.beta.alt-las.com | 80 | Grafana |
| Kibana | http://kibana.beta.alt-las.com | 80 | Kibana |
| Jaeger | http://jaeger.beta.alt-las.com | 80 | Jaeger |

### 6.3. NodePort Servisleri

| Servis | NodePort | Açıklama |
|--------|----------|----------|
| Grafana | 30080 | Grafana web arayüzü |
| Prometheus | 30090 | Prometheus web arayüzü |
| Alertmanager | 30093 | Alertmanager web arayüzü |
| Kibana | 30601 | Kibana web arayüzü |
| Jaeger | 30686 | Jaeger web arayüzü |
| PostgreSQL | 30432 | PostgreSQL veritabanı |
| MongoDB | 30017 | MongoDB veritabanı |
| Redis | 30379 | Redis veritabanı |
| RabbitMQ | 30672 | RabbitMQ AMQP |
| RabbitMQ Management | 31672 | RabbitMQ yönetim arayüzü |

## 7. Güvenlik Mimarisi

Beta test ortamı, aşağıdaki güvenlik bileşenlerini içermektedir:

### 7.1. Kimlik Doğrulama ve Yetkilendirme

| Bileşen | Açıklama |
|---------|----------|
| Kubernetes RBAC | Kubernetes kaynaklarına erişim kontrolü |
| JWT | API Gateway kimlik doğrulama |
| Veritabanı Kimlik Doğrulama | Veritabanlarına erişim kontrolü |

### 7.2. Ağ Güvenliği

| Bileşen | Açıklama |
|---------|----------|
| Kubernetes NetworkPolicy | Pod'lar arası ağ trafiği kontrolü |
| Ingress TLS | HTTPS trafiği için SSL/TLS |

## 8. Depolama Mimarisi

Beta test ortamı, aşağıdaki depolama bileşenlerini içermektedir:

### 8.1. Kalıcı Depolama

| Bileşen | StorageClass | Boyut | Açıklama |
|---------|--------------|-------|----------|
| PostgreSQL | local-path | 10 GB | PostgreSQL veritabanı verileri |
| MongoDB | local-path | 10 GB | MongoDB veritabanı verileri |
| Elasticsearch | local-path | 30 GB | Elasticsearch verileri |
| Redis | local-path | 5 GB | Redis verileri |
| Archive Service | local-path | 10 GB | Arşiv dosyaları |

## 9. Test Veri Mimarisi

Beta test ortamı, aşağıdaki test verilerini içermektedir:

### 9.1. Kullanıcı Verileri

| Kullanıcı Tipi | Sayı | Açıklama |
|----------------|------|----------|
| Admin | 1 | Sistem yöneticisi |
| Manager | 1 | Sistem yöneticisi yardımcısı |
| User | 1 | Normal kullanıcı |

### 9.2. Uygulama Verileri

| Veri Tipi | Sayı | Açıklama |
|-----------|------|----------|
| AI Modelleri | 2 | Segmentasyon modelleri |
| Arşiv Dosyaları | 1 | Test arşiv dosyası |

## 10. Mimari Diyagramlar

### 10.1. Fiziksel Mimari Diyagramı

```
+----------------+    +----------------+    +----------------+
| alt-las-master |    | alt-las-worker1|    | alt-las-worker2|
| 10.0.2.10      |    | 10.0.2.11      |    | 10.0.2.12      |
| K8s Master     |    | K8s Worker     |    | K8s Worker     |
+----------------+    +----------------+    +----------------+
        |                     |                     |
        +---------------------+---------------------+
                             |
                      +-------------+
                      | Node Ağı    |
                      | 10.0.2.0/24 |
                      +-------------+
```

### 10.2. Kubernetes Mimari Diyagramı

```
+-----------------------------------------------------------------------------------+
| Kubernetes Cluster                                                                |
|                                                                                   |
| +-------------------+  +-------------------+  +-------------------+               |
| | alt-las Namespace |  | database Namespace|  | messaging Namespace|              |
| |                   |  |                   |  |                    |              |
| | +---------------+ |  | +---------------+ |  | +---------------+  |              |
| | | API Gateway   | |  | | PostgreSQL    | |  | | RabbitMQ      |  |              |
| | +---------------+ |  | +---------------+ |  | +---------------+  |              |
| |                   |  |                   |  |                    |              |
| | +---------------+ |  | +---------------+ |  +-------------------+               |
| | | Segmentation  | |  | | MongoDB       | |                                      |
| | | Service       | |  | +---------------+ |  +-------------------+               |
| | +---------------+ |  |                   |  | monitoring Namespace|             |
| |                   |  | +---------------+ |  |                    |              |
| | +---------------+ |  | | Redis         | |  | +---------------+  |              |
| | | Runner Service| |  | +---------------+ |  | | Prometheus    |  |              |
| | +---------------+ |  |                   |  | +---------------+  |              |
| |                   |  +-------------------+  |                    |              |
| | +---------------+ |                         | +---------------+  |              |
| | | Archive       | |  +-------------------+  | | Grafana       |  |              |
| | | Service       | |  | logging Namespace |  | +---------------+  |              |
| | +---------------+ |  |                   |  |                    |              |
| |                   |  | +---------------+ |  | +---------------+  |              |
| | +---------------+ |  | | Elasticsearch | |  | | Alertmanager  |  |              |
| | | AI Orchestrator| |  | +---------------+ |  | +---------------+  |              |
| | +---------------+ |  |                   |  |                    |              |
| |                   |  | +---------------+ |  +-------------------+               |
| +-------------------+  | | Fluentd       | |                                      |
|                        | +---------------+ |  +-------------------+               |
|                        |                   |  | tracing Namespace |               |
|                        | +---------------+ |  |                    |              |
|                        | | Kibana        | |  | +---------------+  |              |
|                        | +---------------+ |  | | Jaeger        |  |              |
|                        |                   |  | +---------------+  |              |
|                        +-------------------+  |                    |              |
|                                               +-------------------+               |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### 10.3. Uygulama Mimari Diyagramı

```
                            +---------------+
                            | API Gateway   |
                            +---------------+
                                   |
                 +------------------+------------------+
                 |                  |                  |
        +---------------+  +---------------+  +---------------+
        | Segmentation  |  | Runner Service|  | Archive       |
        | Service       |  |               |  | Service       |
        +---------------+  +---------------+  +---------------+
                 |                  |                  |
                 |                  |                  |
        +---------------+  +---------------+  +---------------+
        | MongoDB       |  | PostgreSQL    |  | Elasticsearch |
        +---------------+  +---------------+  +---------------+
                                   |
                            +---------------+
                            | AI Orchestrator|
                            +---------------+
                                   |
                            +---------------+
                            | RabbitMQ      |
                            +---------------+
```

## 11. Sonuç

Bu belge, ALT_LAS projesinin beta test ortamının mimarisini tanımlamaktadır. Beta test ortamı, üretim ortamına benzer bir şekilde tasarlanmış ve beta testleri için gerekli tüm bileşenleri içermektedir. Bu ortam, beta test senaryolarının çalıştırılması ve beta test kullanıcılarının ALT_LAS sistemini test etmeleri için kullanılacaktır.
