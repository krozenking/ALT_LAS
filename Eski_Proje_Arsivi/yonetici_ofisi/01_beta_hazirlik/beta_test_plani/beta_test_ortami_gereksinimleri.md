# Beta Test Ortamı Gereksinimleri

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Ortamı Gereksinimleri

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için gerekli olan test ortamının gereksinimlerini tanımlamaktadır. Beta test ortamı, üretim ortamına benzer ancak ayrı bir ortam olarak tasarlanacak ve beta testleri için kullanılacaktır.

## 2. Donanım Gereksinimleri

### 2.1. Sunucu Gereksinimleri

| Rol | Sayı | CPU | RAM | Disk | Disk Tipi |
|-----|------|-----|-----|------|-----------|
| Kubernetes Master | 1 | 4 vCPU | 16 GB | 100 GB | SSD |
| Kubernetes Worker | 2 | 4 vCPU | 16 GB | 100 GB | SSD |

### 2.2. Ağ Donanımı Gereksinimleri

| Bileşen | Özellik |
|---------|---------|
| Ağ Bağlantısı | 1 Gbps |
| Yük Dengeleyici | 1 adet |
| Statik IP Adresleri | 3 adet (her sunucu için) |

## 3. Yazılım Gereksinimleri

### 3.1. İşletim Sistemi

| Bileşen | Versiyon |
|---------|----------|
| Ubuntu Server | 20.04 LTS |

### 3.2. Konteyner Teknolojileri

| Bileşen | Minimum Versiyon | Önerilen Versiyon |
|---------|------------------|-------------------|
| Docker | 20.10 | 20.10 veya üzeri |
| Kubernetes | 1.24 | 1.24 veya üzeri |
| Helm | 3.8 | 3.8 veya üzeri |

### 3.3. Veritabanları

| Bileşen | Versiyon | Kullanım Amacı |
|---------|----------|----------------|
| PostgreSQL | 13 | API Gateway, Runner Service |
| MongoDB | 5.0 | Segmentation Service, AI Orchestrator |
| Elasticsearch | 7.17 | Archive Service, Günlük Kaydı |
| Redis | 6.2 | Önbellek, Oturum Yönetimi |

### 3.4. Mesaj Kuyruğu

| Bileşen | Versiyon | Kullanım Amacı |
|---------|----------|----------------|
| RabbitMQ | 3.9 | Servisler Arası İletişim |

### 3.5. İzleme ve Günlük Kaydı

| Bileşen | Versiyon | Kullanım Amacı |
|---------|----------|----------------|
| Prometheus | 2.36 | Metrik Toplama |
| Grafana | 9.0 | Metrik Görselleştirme |
| Elasticsearch | 7.17 | Günlük Depolama |
| Fluentd | 1.14 | Günlük Toplama |
| Kibana | 7.17 | Günlük Görselleştirme |
| Jaeger | 1.35 | Dağıtık İzleme |
| Alertmanager | 0.24 | Uyarı Yönetimi |

## 4. Ağ Gereksinimleri

### 4.1. Ağ Topolojisi

| Ağ | CIDR | Kullanım Amacı |
|----|------|----------------|
| Node Ağı | 10.0.2.0/24 | Kubernetes Node'ları |
| Pod Ağı | 192.168.0.0/16 | Kubernetes Pod'ları |
| Servis Ağı | 10.96.0.0/12 | Kubernetes Servisleri |

### 4.2. Açık Portlar

| Port | Protokol | Kullanım Amacı |
|------|----------|----------------|
| 22 | TCP | SSH |
| 6443 | TCP | Kubernetes API |
| 2379-2380 | TCP | etcd |
| 10250 | TCP | Kubelet |
| 10251 | TCP | kube-scheduler |
| 10252 | TCP | kube-controller-manager |
| 30000-32767 | TCP | NodePort Servisleri |
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |
| 5432 | TCP | PostgreSQL |
| 27017 | TCP | MongoDB |
| 9200, 9300 | TCP | Elasticsearch |
| 6379 | TCP | Redis |
| 5672, 15672 | TCP | RabbitMQ |
| 9090, 9091 | TCP | Prometheus |
| 3000 | TCP | Grafana |
| 5601 | TCP | Kibana |
| 16686 | TCP | Jaeger UI |

### 4.3. Domain ve SSL

| Bileşen | Değer |
|---------|-------|
| Ana Domain | beta.alt-las.com |
| Alt Domainler | api.beta.alt-las.com, grafana.beta.alt-las.com, kibana.beta.alt-las.com |
| SSL Sertifikası | Let's Encrypt |

## 5. Güvenlik Gereksinimleri

### 5.1. Kimlik Doğrulama ve Yetkilendirme

| Bileşen | Gereksinim |
|---------|------------|
| Kubernetes | RBAC tabanlı yetkilendirme |
| API Gateway | JWT tabanlı kimlik doğrulama |
| Veritabanlar | Kullanıcı adı/parola kimlik doğrulama |
| Grafana, Kibana | LDAP entegrasyonu |

### 5.2. Ağ Güvenliği

| Bileşen | Gereksinim |
|---------|------------|
| Kubernetes | NetworkPolicy ile pod izolasyonu |
| Ingress | TLS terminasyonu |
| API Gateway | WAF (Web Application Firewall) |
| Veritabanlar | Sadece gerekli portların açılması |

### 5.3. Veri Güvenliği

| Bileşen | Gereksinim |
|---------|------------|
| Veritabanlar | Şifreleme (at-rest ve in-transit) |
| Hassas Veriler | Veri maskeleme |
| Yedekler | Şifrelenmiş yedekler |
| Günlükler | Hassas bilgilerin maskelenmesi |

## 6. İzleme ve Günlük Kaydı Gereksinimleri

### 6.1. Metrik İzleme

| Bileşen | Metrikler |
|---------|-----------|
| Node | CPU, bellek, disk, ağ kullanımı |
| Pod | CPU, bellek kullanımı, restart sayısı |
| Konteyner | CPU, bellek kullanımı |
| Servis | İstek sayısı, yanıt süresi, hata oranı |
| Veritabanlar | Bağlantı sayısı, sorgu performansı, disk kullanımı |

### 6.2. Günlük Kaydı

| Bileşen | Günlük Seviyesi |
|---------|-----------------|
| Kubernetes | INFO |
| Servisler | INFO (üretim), DEBUG (geliştirme) |
| Veritabanlar | WARNING |
| Ingress | INFO |

### 6.3. Dağıtık İzleme

| Bileşen | Gereksinim |
|---------|------------|
| Servisler | OpenTelemetry enstrümantasyonu |
| API Gateway | Trace ID propagasyonu |
| Veritabanlar | Sorgu izleme |

### 6.4. Uyarı Sistemi

| Uyarı | Eşik Değeri | Öncelik |
|-------|-------------|---------|
| Yüksek CPU Kullanımı | >80% (5 dakika) | Yüksek |
| Yüksek Bellek Kullanımı | >80% (5 dakika) | Yüksek |
| Disk Doluluk | >80% | Yüksek |
| Pod Crash | >3 (5 dakika) | Kritik |
| Servis Yanıt Süresi | >500ms (5 dakika) | Orta |
| Hata Oranı | >1% (5 dakika) | Yüksek |

## 7. Yedekleme ve Felaket Kurtarma Gereksinimleri

### 7.1. Yedekleme

| Bileşen | Yedekleme Sıklığı | Saklama Süresi |
|---------|-------------------|----------------|
| PostgreSQL | Günlük | 7 gün |
| MongoDB | Günlük | 7 gün |
| Elasticsearch | Günlük | 7 gün |
| Kubernetes Kaynakları | Günlük | 7 gün |

### 7.2. Felaket Kurtarma

| Bileşen | RPO (Recovery Point Objective) | RTO (Recovery Time Objective) |
|---------|--------------------------------|--------------------------------|
| Veritabanlar | 24 saat | 4 saat |
| Servisler | 24 saat | 2 saat |
| Kubernetes Cluster | 24 saat | 4 saat |

## 8. Kapasite Gereksinimleri

### 8.1. Depolama Kapasitesi

| Bileşen | Kapasite |
|---------|----------|
| PostgreSQL | 20 GB |
| MongoDB | 20 GB |
| Elasticsearch | 30 GB |
| Redis | 5 GB |
| Günlükler | 20 GB |
| Yedekler | 50 GB |

### 8.2. İşlem Kapasitesi

| Bileşen | Kapasite |
|---------|----------|
| API İstekleri | 50 RPS (ortalama), 100 RPS (tepe) |
| Eşzamanlı Kullanıcılar | 50 kullanıcı |
| Segmentasyon İşleri | 10 iş/dakika |
| Arşiv İşlemleri | 20 işlem/dakika |

## 9. Test Veri Gereksinimleri

### 9.1. Test Kullanıcıları

| Kullanıcı Tipi | Sayı |
|----------------|------|
| Admin | 2 |
| Manager | 5 |
| User | 20 |

### 9.2. Test Verileri

| Veri Tipi | Sayı |
|-----------|------|
| Görüntüler | 100 |
| Segmentasyon Sonuçları | 50 |
| Arşiv Dosyaları | 200 |
| AI Modelleri | 5 |

## 10. Dokümantasyon Gereksinimleri

| Doküman | İçerik |
|---------|--------|
| Kurulum Kılavuzu | Ortam kurulum adımları |
| Yapılandırma Kılavuzu | Servis yapılandırma detayları |
| Test Veri Kılavuzu | Test verilerinin yapısı ve kullanımı |
| Sorun Giderme Kılavuzu | Yaygın sorunlar ve çözümleri |
