# Beta Test Ortamı Kurulum Dokümanı

**Tarih:** 18 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Ortamı Kurulum Adımları

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test ortamının kurulum adımlarını içermektedir. Beta test ortamı, üretim ortamına benzer ancak ayrı bir ortam olarak tasarlanmıştır ve beta testleri için kullanılacaktır.

## 2. Ön Gereksinimler

Beta test ortamının kurulumu için aşağıdaki ön gereksinimler sağlanmalıdır:

### 2.1. Donanım Gereksinimleri

- 3 adet sunucu (1 master, 2 worker)
- Her sunucu için minimum 4 vCPU, 16 GB RAM, 100 GB SSD disk
- 1 Gbps ağ bağlantısı

### 2.2. Yazılım Gereksinimleri

- Ubuntu Server 20.04 LTS
- Docker 20.10 veya üzeri
- Kubernetes 1.24 veya üzeri
- Helm 3.8 veya üzeri

## 3. Kurulum Adımları

### 3.1. Sunucuların Hazırlanması

1. Ubuntu Server 20.04 LTS kurulumu yapılacak
2. Sistem güncellemeleri yapılacak
3. Gerekli paketler kurulacak
4. Swap devre dışı bırakılacak
5. Ağ ayarları yapılandırılacak

### 3.2. Docker Kurulumu

1. Docker repository'si eklenecek
2. Docker kurulumu yapılacak
3. Docker servis yapılandırması yapılacak
4. Docker kullanıcı izinleri ayarlanacak

### 3.3. Kubernetes Kurulumu

1. Kubernetes repository'si eklenecek
2. kubeadm, kubelet ve kubectl kurulumu yapılacak
3. Master node'da Kubernetes cluster'ı başlatılacak
4. Worker node'lar cluster'a eklenecek
5. Calico ağ eklentisi kurulumu yapılacak
6. Local Path Provisioner kurulumu yapılacak

### 3.4. Helm Kurulumu

1. Helm kurulumu yapılacak
2. Helm repository'leri eklenecek

## 4. Kubernetes Bileşenlerinin Kurulumu

### 4.1. Namespace'lerin Oluşturulması

1. alt-las, database, messaging, monitoring, logging, tracing namespace'leri oluşturulacak

### 4.2. NGINX Ingress Controller Kurulumu

1. NGINX Ingress Controller Helm chart'ı kullanılarak kurulacak
2. Ingress yapılandırması yapılacak

### 4.3. Veritabanı Servislerinin Kurulumu

1. PostgreSQL Helm chart'ı kullanılarak kurulacak
2. MongoDB Helm chart'ı kullanılarak kurulacak
3. Elasticsearch Helm chart'ı kullanılarak kurulacak
4. Redis Helm chart'ı kullanılarak kurulacak
5. Veritabanı kullanıcıları ve veritabanları oluşturulacak

### 4.4. Mesaj Kuyruğu Servisinin Kurulumu

1. RabbitMQ Helm chart'ı kullanılarak kurulacak
2. RabbitMQ kullanıcıları ve kuyrukları oluşturulacak

### 4.5. İzleme ve Günlük Kaydı Servislerinin Kurulumu

1. Prometheus Helm chart'ı kullanılarak kurulacak
2. Grafana Helm chart'ı kullanılarak kurulacak
3. Alertmanager Helm chart'ı kullanılarak kurulacak
4. Elasticsearch, Fluentd, Kibana Helm chart'ları kullanılarak kurulacak
5. Jaeger Helm chart'ı kullanılarak kurulacak
6. Metrik toplama ve günlük kaydı yapılandırmaları oluşturulacak

### 4.6. ALT_LAS Servislerinin Kurulumu

1. API Gateway deployment'ı oluşturulacak
2. Segmentation Service deployment'ı oluşturulacak
3. Runner Service deployment'ı oluşturulacak
4. Archive Service deployment'ı oluşturulacak
5. AI Orchestrator deployment'ı oluşturulacak
6. Servisler arası iletişim yapılandırmaları oluşturulacak
7. Servis sağlık kontrolleri yapılandırılacak

## 5. Ağ Yapılandırması

### 5.1. Ingress Kurallarının Oluşturulması

1. API Gateway için Ingress kuralı oluşturulacak
2. Grafana için Ingress kuralı oluşturulacak
3. Kibana için Ingress kuralı oluşturulacak
4. Jaeger için Ingress kuralı oluşturulacak

### 5.2. SSL/TLS Sertifikalarının Yapılandırılması

1. Let's Encrypt sertifikaları oluşturulacak
2. Sertifikalar Kubernetes Secret olarak kaydedilecek
3. Ingress kurallarında TLS yapılandırması yapılacak

### 5.3. NetworkPolicy'lerin Oluşturulması

1. Namespace'ler arası iletişim için NetworkPolicy'ler oluşturulacak
2. Servisler arası iletişim için NetworkPolicy'ler oluşturulacak

## 6. Güvenlik Yapılandırması

### 6.1. RBAC Kurallarının Oluşturulması

1. Servis hesapları oluşturulacak
2. Role ve RoleBinding'ler oluşturulacak
3. ClusterRole ve ClusterRoleBinding'ler oluşturulacak

### 6.2. Secret'ların Oluşturulması

1. Veritabanı kimlik bilgileri için Secret'lar oluşturulacak
2. API anahtarları için Secret'lar oluşturulacak
3. SSL/TLS sertifikaları için Secret'lar oluşturulacak

### 6.3. Güvenlik Politikalarının Yapılandırılması

1. PodSecurityPolicy'ler oluşturulacak
2. NetworkPolicy'ler oluşturulacak
3. SecurityContext'ler yapılandırılacak

## 7. Test Verilerinin Yüklenmesi

### 7.1. Test Kullanıcılarının Oluşturulması

1. Admin, Manager ve User rollerinde test kullanıcıları oluşturulacak

### 7.2. Test Verilerinin Yüklenmesi

1. AI modelleri yüklenecek
2. Test görüntüleri yüklenecek
3. Test arşiv dosyaları yüklenecek

## 8. Doğrulama ve Test

### 8.1. Servis Sağlık Kontrollerinin Doğrulanması

1. Tüm servislerin sağlık kontrolleri yapılacak
2. Kubernetes pod'larının durumu kontrol edilecek
3. Servis endpoint'leri kontrol edilecek

### 8.2. Fonksiyonel Testlerin Yapılması

1. API Gateway üzerinden temel API istekleri test edilecek
2. Segmentasyon işleri oluşturulacak ve test edilecek
3. Arşivleme işlemleri test edilecek
4. Kullanıcı kimlik doğrulama ve yetkilendirme test edilecek

### 8.3. Performans Testlerinin Yapılması

1. Yük testleri yapılacak
2. Stres testleri yapılacak
3. Dayanıklılık testleri yapılacak

## 9. Dokümantasyon

### 9.1. Erişim Bilgilerinin Güncellenmesi

1. Beta test ortamı erişim bilgileri dokümanı güncellenecek
2. Kullanıcı kimlik bilgileri dokümanı güncellenecek

### 9.2. Sorun Giderme Kılavuzunun Güncellenmesi

1. Beta test ortamı sorun giderme kılavuzu güncellenecek
2. Yaygın sorunlar ve çözümleri eklenecek

## 10. Sonuç

Bu belge, ALT_LAS projesinin beta test ortamının kurulum adımlarını içermektedir. Kurulum tamamlandıktan sonra, beta test ortamı beta testleri için hazır olacaktır.
