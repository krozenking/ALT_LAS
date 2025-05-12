# Beta Test Ortamı Sorun Giderme Kılavuzu

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Ortamı Sorun Giderme Kılavuzu

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test ortamında karşılaşılabilecek yaygın sorunları ve çözümlerini içermektedir. Beta test kullanıcıları ve destek ekibi, bu belgedeki bilgileri kullanarak beta test ortamında karşılaşılan sorunları çözebilirler.

## 2. Genel Sorun Giderme Adımları

Beta test ortamında bir sorunla karşılaşıldığında, aşağıdaki genel sorun giderme adımları izlenebilir:

1. **Sorunun Tanımlanması**: Sorunun ne olduğunu, ne zaman ortaya çıktığını ve hangi koşullarda tekrarlandığını belirleyin.
2. **Günlüklerin İncelenmesi**: İlgili servisin günlüklerini inceleyin.
3. **Sistem Durumunun Kontrolü**: Kubernetes pod'larının, servislerinin ve node'larının durumunu kontrol edin.
4. **Bağlantıların Kontrolü**: Servisler arası bağlantıları ve veritabanı bağlantılarını kontrol edin.
5. **Çözüm Uygulaması**: Belirlenen soruna uygun çözümü uygulayın.
6. **Doğrulama**: Sorunun çözüldüğünü doğrulayın.

## 3. Kubernetes Sorunları

### 3.1. Pod'lar Başlatılamıyor

**Belirtiler**:
- Pod'lar `Pending` veya `CrashLoopBackOff` durumunda kalıyor.
- Pod'lar başlatılıyor ancak hemen sonra çöküyor.

**Çözümler**:

1. Pod durumunu kontrol edin:
```bash
kubectl get pods -n <namespace>
```

2. Pod detaylarını inceleyin:
```bash
kubectl describe pod <pod-name> -n <namespace>
```

3. Pod günlüklerini inceleyin:
```bash
kubectl logs <pod-name> -n <namespace>
```

4. Yaygın sorunlar ve çözümleri:
   - **Kaynak Yetersizliği**: Node'larda yeterli CPU veya bellek yok. Kaynak taleplerini azaltın veya node'ları ölçeklendirin.
   - **Image Pull Hatası**: Docker imajı çekilemiyor. Image adını ve tag'ini kontrol edin, registry erişimini doğrulayın.
   - **ConfigMap veya Secret Bulunamadı**: Pod'un bağımlı olduğu ConfigMap veya Secret eksik. Eksik kaynakları oluşturun.
   - **PersistentVolumeClaim Bağlanamadı**: PVC oluşturulamadı veya bağlanamadı. StorageClass'ı ve PVC'yi kontrol edin.
   - **Liveness/Readiness Probe Hatası**: Sağlık kontrolleri başarısız oluyor. Probe yapılandırmasını ve servis sağlığını kontrol edin.

### 3.2. Servisler Erişilebilir Değil

**Belirtiler**:
- Servislere erişilemiyor.
- Servisler arasında iletişim kurulamıyor.

**Çözümler**:

1. Servis durumunu kontrol edin:
```bash
kubectl get services -n <namespace>
```

2. Servis detaylarını inceleyin:
```bash
kubectl describe service <service-name> -n <namespace>
```

3. Endpoint'leri kontrol edin:
```bash
kubectl get endpoints <service-name> -n <namespace>
```

4. Yaygın sorunlar ve çözümleri:
   - **Selector Eşleşmiyor**: Servis selector'ı, pod etiketleriyle eşleşmiyor. Selector'ı ve pod etiketlerini kontrol edin.
   - **Pod'lar Hazır Değil**: Servisin hedeflediği pod'lar hazır değil. Pod durumunu kontrol edin.
   - **Port Yapılandırması Yanlış**: Servis ve pod port yapılandırması uyumsuz. Port yapılandırmasını kontrol edin.
   - **NetworkPolicy Engelleme**: NetworkPolicy, trafiği engelliyor. NetworkPolicy'leri kontrol edin.

### 3.3. Ingress Çalışmıyor

**Belirtiler**:
- Ingress üzerinden servislere erişilemiyor.
- Ingress controller pod'ları çalışmıyor.

**Çözümler**:

1. Ingress durumunu kontrol edin:
```bash
kubectl get ingress -n <namespace>
```

2. Ingress detaylarını inceleyin:
```bash
kubectl describe ingress <ingress-name> -n <namespace>
```

3. Ingress controller pod'larını kontrol edin:
```bash
kubectl get pods -n ingress-nginx
```

4. Ingress controller günlüklerini inceleyin:
```bash
kubectl logs <ingress-controller-pod> -n ingress-nginx
```

5. Yaygın sorunlar ve çözümleri:
   - **Ingress Controller Çalışmıyor**: Ingress controller pod'ları çalışmıyor. Pod durumunu kontrol edin.
   - **Servis Bulunamadı**: Ingress'in hedeflediği servis bulunamadı. Servis adını ve namespace'i kontrol edin.
   - **TLS Sertifikası Hatası**: TLS sertifikası geçersiz veya eksik. Sertifikayı kontrol edin.
   - **Host Adı Eşleşmiyor**: Host adı, istek başlığıyla eşleşmiyor. Host adını kontrol edin.

## 4. Veritabanı Sorunları

### 4.1. PostgreSQL Sorunları

**Belirtiler**:
- PostgreSQL pod'u çalışmıyor.
- PostgreSQL'e bağlanılamıyor.
- Veritabanı sorguları hata veriyor.

**Çözümler**:

1. PostgreSQL pod durumunu kontrol edin:
```bash
kubectl get pods -n database -l app=postgresql
```

2. PostgreSQL pod günlüklerini inceleyin:
```bash
kubectl logs <postgresql-pod> -n database
```

3. PostgreSQL servisini kontrol edin:
```bash
kubectl get services -n database -l app=postgresql
```

4. PostgreSQL bağlantısını test edin:
```bash
kubectl run postgresql-client --rm --tty -i --restart='Never' \
  --namespace database \
  --image docker.io/bitnami/postgresql:13.8.0-debian-11-r13 \
  --env="PGPASSWORD=altlas" \
  --command -- psql --host postgresql -U altlas -d altlas -p 5432 \
  -c "SELECT 1;"
```

5. Yaygın sorunlar ve çözümleri:
   - **Kimlik Doğrulama Hatası**: Kullanıcı adı veya parola yanlış. Kimlik bilgilerini kontrol edin.
   - **Veritabanı Bulunamadı**: Veritabanı mevcut değil. Veritabanını oluşturun.
   - **Disk Doldu**: Veritabanı diski doldu. Disk alanını temizleyin veya genişletin.
   - **Bağlantı Sayısı Aşıldı**: Maksimum bağlantı sayısı aşıldı. Bağlantı havuzunu yapılandırın.

### 4.2. MongoDB Sorunları

**Belirtiler**:
- MongoDB pod'u çalışmıyor.
- MongoDB'ye bağlanılamıyor.
- Veritabanı sorguları hata veriyor.

**Çözümler**:

1. MongoDB pod durumunu kontrol edin:
```bash
kubectl get pods -n database -l app=mongodb
```

2. MongoDB pod günlüklerini inceleyin:
```bash
kubectl logs <mongodb-pod> -n database
```

3. MongoDB servisini kontrol edin:
```bash
kubectl get services -n database -l app=mongodb
```

4. MongoDB bağlantısını test edin:
```bash
kubectl run mongodb-client --rm --tty -i --restart='Never' \
  --namespace database \
  --image docker.io/bitnami/mongodb:5.0.9-debian-11-r12 \
  --command -- mongo admin --host mongodb \
  --authenticationDatabase admin \
  -u root -p altlas \
  --eval "db.runCommand({ ping: 1 });"
```

5. Yaygın sorunlar ve çözümleri:
   - **Kimlik Doğrulama Hatası**: Kullanıcı adı veya parola yanlış. Kimlik bilgilerini kontrol edin.
   - **Veritabanı Bulunamadı**: Veritabanı mevcut değil. Veritabanını oluşturun.
   - **Disk Doldu**: Veritabanı diski doldu. Disk alanını temizleyin veya genişletin.
   - **WiredTiger Cache Boyutu**: WiredTiger cache boyutu yetersiz. Cache boyutunu artırın.

### 4.3. Elasticsearch Sorunları

**Belirtiler**:
- Elasticsearch pod'u çalışmıyor.
- Elasticsearch'e bağlanılamıyor.
- Elasticsearch sorguları hata veriyor.

**Çözümler**:

1. Elasticsearch pod durumunu kontrol edin:
```bash
kubectl get pods -n logging -l app=elasticsearch
```

2. Elasticsearch pod günlüklerini inceleyin:
```bash
kubectl logs <elasticsearch-pod> -n logging
```

3. Elasticsearch servisini kontrol edin:
```bash
kubectl get services -n logging -l app=elasticsearch
```

4. Elasticsearch bağlantısını test edin:
```bash
kubectl run elasticsearch-client --rm --tty -i --restart='Never' \
  --namespace logging \
  --image docker.io/bitnami/elasticsearch:7.17.0-debian-11-r12 \
  --command -- curl -X GET "http://elasticsearch-master:9200/_cluster/health"
```

5. Yaygın sorunlar ve çözümleri:
   - **JVM Bellek Hatası**: JVM bellek ayarları yetersiz. JVM bellek ayarlarını artırın.
   - **Disk Doldu**: Veritabanı diski doldu. Disk alanını temizleyin veya genişletin.
   - **Shard Allocation**: Shard allocation sorunları. Shard allocation'ı yeniden yapılandırın.
   - **Cluster State**: Cluster state sorunları. Cluster state'i kontrol edin.

### 4.4. Redis Sorunları

**Belirtiler**:
- Redis pod'u çalışmıyor.
- Redis'e bağlanılamıyor.
- Redis komutları hata veriyor.

**Çözümler**:

1. Redis pod durumunu kontrol edin:
```bash
kubectl get pods -n database -l app=redis
```

2. Redis pod günlüklerini inceleyin:
```bash
kubectl logs <redis-pod> -n database
```

3. Redis servisini kontrol edin:
```bash
kubectl get services -n database -l app=redis
```

4. Redis bağlantısını test edin:
```bash
kubectl run redis-client --rm --tty -i --restart='Never' \
  --namespace database \
  --image docker.io/bitnami/redis:6.2.7-debian-11-r9 \
  --command -- redis-cli -h redis-master -a altlas \
  PING
```

5. Yaygın sorunlar ve çözümleri:
   - **Kimlik Doğrulama Hatası**: Parola yanlış. Parolayı kontrol edin.
   - **Bellek Doldu**: Redis belleği doldu. Bellek sınırını artırın veya veri temizleyin.
   - **Maxmemory Policy**: Maxmemory policy yapılandırması yanlış. Policy'yi kontrol edin.
   - **Persistence**: Persistence yapılandırması sorunlu. Persistence ayarlarını kontrol edin.

## 5. Mesaj Kuyruğu Sorunları

### 5.1. RabbitMQ Sorunları

**Belirtiler**:
- RabbitMQ pod'u çalışmıyor.
- RabbitMQ'ya bağlanılamıyor.
- Mesajlar iletilemyor veya alınamıyor.

**Çözümler**:

1. RabbitMQ pod durumunu kontrol edin:
```bash
kubectl get pods -n messaging -l app=rabbitmq
```

2. RabbitMQ pod günlüklerini inceleyin:
```bash
kubectl logs <rabbitmq-pod> -n messaging
```

3. RabbitMQ servisini kontrol edin:
```bash
kubectl get services -n messaging -l app=rabbitmq
```

4. RabbitMQ bağlantısını test edin:
```bash
kubectl run rabbitmq-client --rm --tty -i --restart='Never' \
  --namespace messaging \
  --image docker.io/bitnami/rabbitmq:3.9.13-debian-11-r12 \
  --command -- rabbitmqctl -n rabbit@rabbitmq status
```

5. Yaygın sorunlar ve çözümleri:
   - **Kimlik Doğrulama Hatası**: Kullanıcı adı veya parola yanlış. Kimlik bilgilerini kontrol edin.
   - **Disk Alanı Uyarısı**: Disk alanı azaldı. Disk alanını temizleyin veya genişletin.
   - **Bellek Alarm**: Bellek kullanımı yüksek. Bellek sınırını artırın veya veri temizleyin.
   - **Kuyruk Doldu**: Kuyruk doldu ve yeni mesajlar kabul edilmiyor. Tüketicileri ölçeklendirin.

## 6. İzleme ve Günlük Kaydı Sorunları

### 6.1. Prometheus Sorunları

**Belirtiler**:
- Prometheus pod'u çalışmıyor.
- Prometheus'a bağlanılamıyor.
- Metrikler toplanamıyor.

**Çözümler**:

1. Prometheus pod durumunu kontrol edin:
```bash
kubectl get pods -n monitoring -l app=prometheus
```

2. Prometheus pod günlüklerini inceleyin:
```bash
kubectl logs <prometheus-pod> -n monitoring
```

3. Prometheus servisini kontrol edin:
```bash
kubectl get services -n monitoring -l app=prometheus
```

4. Prometheus hedeflerini kontrol edin:
```bash
kubectl port-forward <prometheus-pod> 9090:9090 -n monitoring
# Tarayıcıda http://localhost:9090/targets adresine gidin
```

5. Yaygın sorunlar ve çözümleri:
   - **Hedef Bulunamadı**: Hedef servisler bulunamıyor. ServiceMonitor'ları kontrol edin.
   - **Scrape Hatası**: Metrikler toplanamıyor. Hedef servislerin /metrics endpoint'lerini kontrol edin.
   - **Disk Doldu**: Prometheus diski doldu. Disk alanını temizleyin veya genişletin.
   - **Yüksek Bellek Kullanımı**: Bellek kullanımı yüksek. Retention period'u azaltın veya bellek sınırını artırın.

### 6.2. Grafana Sorunları

**Belirtiler**:
- Grafana pod'u çalışmıyor.
- Grafana'ya bağlanılamıyor.
- Dashboard'lar görüntülenemiyor.

**Çözümler**:

1. Grafana pod durumunu kontrol edin:
```bash
kubectl get pods -n monitoring -l app=grafana
```

2. Grafana pod günlüklerini inceleyin:
```bash
kubectl logs <grafana-pod> -n monitoring
```

3. Grafana servisini kontrol edin:
```bash
kubectl get services -n monitoring -l app=grafana
```

4. Yaygın sorunlar ve çözümleri:
   - **Kimlik Doğrulama Hatası**: Kullanıcı adı veya parola yanlış. Kimlik bilgilerini kontrol edin.
   - **Veri Kaynağı Bağlantı Hatası**: Veri kaynağına bağlanılamıyor. Veri kaynağı yapılandırmasını kontrol edin.
   - **Dashboard Bulunamadı**: Dashboard bulunamıyor. Dashboard'ı içe aktarın.
   - **Plugin Hatası**: Plugin yüklenemedi veya çalışmıyor. Plugin'i yeniden yükleyin.

### 6.3. EFK Stack Sorunları

**Belirtiler**:
- Elasticsearch, Fluentd veya Kibana pod'ları çalışmıyor.
- Günlükler toplanamıyor veya görüntülenemiyor.

**Çözümler**:

1. EFK Stack pod durumlarını kontrol edin:
```bash
kubectl get pods -n logging
```

2. Fluentd pod günlüklerini inceleyin:
```bash
kubectl logs <fluentd-pod> -n logging
```

3. Elasticsearch indekslerini kontrol edin:
```bash
kubectl run elasticsearch-client --rm --tty -i --restart='Never' \
  --namespace logging \
  --image docker.io/bitnami/elasticsearch:7.17.0-debian-11-r12 \
  --command -- curl -X GET "http://elasticsearch-master:9200/_cat/indices"
```

4. Yaygın sorunlar ve çözümleri:
   - **Fluentd Yapılandırma Hatası**: Fluentd yapılandırması hatalı. ConfigMap'i kontrol edin.
   - **Elasticsearch İndeks Hatası**: İndeks oluşturulamıyor. İndeks şablonlarını kontrol edin.
   - **Kibana Bağlantı Hatası**: Kibana, Elasticsearch'e bağlanamıyor. Bağlantı ayarlarını kontrol edin.
   - **Disk Doldu**: Elasticsearch diski doldu. Disk alanını temizleyin veya genişletin.

## 7. ALT_LAS Servis Sorunları

### 7.1. API Gateway Sorunları

**Belirtiler**:
- API Gateway pod'u çalışmıyor.
- API Gateway'e bağlanılamıyor.
- API istekleri hata veriyor.

**Çözümler**:

1. API Gateway pod durumunu kontrol edin:
```bash
kubectl get pods -n alt-las -l app=api-gateway
```

2. API Gateway pod günlüklerini inceleyin:
```bash
kubectl logs <api-gateway-pod> -n alt-las
```

3. API Gateway servisini kontrol edin:
```bash
kubectl get services -n alt-las -l app=api-gateway
```

4. API Gateway sağlık durumunu kontrol edin:
```bash
kubectl exec -it <api-gateway-pod> -n alt-las -- curl -i http://localhost:8080/actuator/health
```

5. Yaygın sorunlar ve çözümleri:
   - **Veritabanı Bağlantı Hatası**: PostgreSQL'e bağlanılamıyor. Veritabanı bağlantı ayarlarını kontrol edin.
   - **Redis Bağlantı Hatası**: Redis'e bağlanılamıyor. Redis bağlantı ayarlarını kontrol edin.
   - **RabbitMQ Bağlantı Hatası**: RabbitMQ'ya bağlanılamıyor. RabbitMQ bağlantı ayarlarını kontrol edin.
   - **Servis Bağlantı Hatası**: Diğer servislere bağlanılamıyor. Servis bağlantı ayarlarını kontrol edin.

### 7.2. Segmentation Service Sorunları

**Belirtiler**:
- Segmentation Service pod'u çalışmıyor.
- Segmentasyon işleri oluşturulamıyor veya işlenemiyor.

**Çözümler**:

1. Segmentation Service pod durumunu kontrol edin:
```bash
kubectl get pods -n alt-las -l app=segmentation-service
```

2. Segmentation Service pod günlüklerini inceleyin:
```bash
kubectl logs <segmentation-service-pod> -n alt-las
```

3. Segmentation Service servisini kontrol edin:
```bash
kubectl get services -n alt-las -l app=segmentation-service
```

4. Segmentation Service sağlık durumunu kontrol edin:
```bash
kubectl exec -it <segmentation-service-pod> -n alt-las -- curl -i http://localhost:8080/health
```

5. Yaygın sorunlar ve çözümleri:
   - **MongoDB Bağlantı Hatası**: MongoDB'ye bağlanılamıyor. Veritabanı bağlantı ayarlarını kontrol edin.
   - **RabbitMQ Bağlantı Hatası**: RabbitMQ'ya bağlanılamıyor. RabbitMQ bağlantı ayarlarını kontrol edin.
   - **GPU Hatası**: GPU kullanılamıyor. GPU sürücülerini ve yapılandırmasını kontrol edin.
   - **Model Yükleme Hatası**: Model yüklenemiyor. Model dosyalarını kontrol edin.

## 8. İletişim Bilgileri

Sorun giderme sırasında yardıma ihtiyaç duyarsanız, aşağıdaki iletişim bilgilerini kullanabilirsiniz:

- **DevOps Ekibi**: devops@alt-las.com
- **Yazılım Geliştirme Ekibi**: dev@alt-las.com
- **Destek Ekibi**: support@alt-las.com
- **Acil Durum**: +90 555 123 4567
