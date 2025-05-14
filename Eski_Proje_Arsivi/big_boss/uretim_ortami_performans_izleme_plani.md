# ALT_LAS Üretim Ortamı Performans İzleme Planı

## Genel Bakış

Bu belge, ALT_LAS projesinin üretim ortamında performansının izlenmesi için bir plan sunmaktadır. Plan, izlenecek metrikleri, izleme araçlarını, uyarı eşiklerini ve performans optimizasyonu stratejilerini içermektedir.

## İzleme Metrikleri

### Sistem Metrikleri

#### CPU Kullanımı

| Metrik | Açıklama | Birim | İzleme Aracı | Uyarı Eşiği | Kritik Eşik |
|--------|----------|-------|--------------|-------------|-------------|
| container_cpu_usage_seconds_total | Konteyner CPU kullanımı | Saniye | Prometheus | %80 | %90 |
| node_cpu_seconds_total | Node CPU kullanımı | Saniye | Prometheus | %80 | %90 |
| cpu_throttling_seconds_total | CPU kısıtlama süresi | Saniye | Prometheus | 10 | 30 |

#### Bellek Kullanımı

| Metrik | Açıklama | Birim | İzleme Aracı | Uyarı Eşiği | Kritik Eşik |
|--------|----------|-------|--------------|-------------|-------------|
| container_memory_usage_bytes | Konteyner bellek kullanımı | Byte | Prometheus | %80 | %90 |
| container_memory_working_set_bytes | Konteyner çalışma seti bellek kullanımı | Byte | Prometheus | %80 | %90 |
| node_memory_MemAvailable_bytes | Node kullanılabilir bellek | Byte | Prometheus | %20 | %10 |
| memory_oom_kills | OOM (Out of Memory) sonlandırma sayısı | Sayı | Prometheus | 1 | 5 |

#### Disk Kullanımı

| Metrik | Açıklama | Birim | İzleme Aracı | Uyarı Eşiği | Kritik Eşik |
|--------|----------|-------|--------------|-------------|-------------|
| node_filesystem_avail_bytes | Node dosya sistemi kullanılabilir alan | Byte | Prometheus | %20 | %10 |
| node_disk_io_time_seconds_total | Disk I/O süresi | Saniye | Prometheus | 100 | 200 |
| node_disk_read_bytes_total | Disk okuma miktarı | Byte | Prometheus | - | - |
| node_disk_written_bytes_total | Disk yazma miktarı | Byte | Prometheus | - | - |

#### Ağ Kullanımı

| Metrik | Açıklama | Birim | İzleme Aracı | Uyarı Eşiği | Kritik Eşik |
|--------|----------|-------|--------------|-------------|-------------|
| container_network_receive_bytes_total | Konteyner ağ alım miktarı | Byte | Prometheus | - | - |
| container_network_transmit_bytes_total | Konteyner ağ gönderim miktarı | Byte | Prometheus | - | - |
| node_network_receive_bytes_total | Node ağ alım miktarı | Byte | Prometheus | - | - |
| node_network_transmit_bytes_total | Node ağ gönderim miktarı | Byte | Prometheus | - | - |
| node_network_receive_drop_total | Node ağ alım düşürme sayısı | Sayı | Prometheus | 10 | 100 |
| node_network_transmit_drop_total | Node ağ gönderim düşürme sayısı | Sayı | Prometheus | 10 | 100 |

### Uygulama Metrikleri

#### API Gateway

| Metrik | Açıklama | Birim | İzleme Aracı | Uyarı Eşiği | Kritik Eşik |
|--------|----------|-------|--------------|-------------|-------------|
| http_requests_total | Toplam HTTP istek sayısı | Sayı | Prometheus | - | - |
| http_request_duration_seconds | HTTP istek süresi | Saniye | Prometheus | 1 | 3 |
| http_requests_in_flight | İşlenmekte olan HTTP istek sayısı | Sayı | Prometheus | 100 | 200 |
| http_response_size_bytes | HTTP yanıt boyutu | Byte | Prometheus | - | - |
| http_errors_total | HTTP hata sayısı | Sayı | Prometheus | 10 | 50 |

#### Segmentation Service

| Metrik | Açıklama | Birim | İzleme Aracı | Uyarı Eşiği | Kritik Eşik |
|--------|----------|-------|--------------|-------------|-------------|
| segmentation_requests_total | Toplam segmentasyon istek sayısı | Sayı | Prometheus | - | - |
| segmentation_request_duration_seconds | Segmentasyon istek süresi | Saniye | Prometheus | 5 | 10 |
| segmentation_requests_in_flight | İşlenmekte olan segmentasyon istek sayısı | Sayı | Prometheus | 50 | 100 |
| segmentation_errors_total | Segmentasyon hata sayısı | Sayı | Prometheus | 5 | 20 |
| segmentation_memory_usage_bytes | Segmentasyon bellek kullanımı | Byte | Prometheus | %80 | %90 |

#### AI Orchestrator

| Metrik | Açıklama | Birim | İzleme Aracı | Uyarı Eşiği | Kritik Eşik |
|--------|----------|-------|--------------|-------------|-------------|
| ai_requests_total | Toplam AI istek sayısı | Sayı | Prometheus | - | - |
| ai_request_duration_seconds | AI istek süresi | Saniye | Prometheus | 10 | 20 |
| ai_requests_in_flight | İşlenmekte olan AI istek sayısı | Sayı | Prometheus | 20 | 50 |
| ai_errors_total | AI hata sayısı | Sayı | Prometheus | 5 | 20 |
| ai_memory_usage_bytes | AI bellek kullanımı | Byte | Prometheus | %80 | %90 |

#### Archive Service

| Metrik | Açıklama | Birim | İzleme Aracı | Uyarı Eşiği | Kritik Eşik |
|--------|----------|-------|--------------|-------------|-------------|
| archive_requests_total | Toplam arşiv istek sayısı | Sayı | Prometheus | - | - |
| archive_request_duration_seconds | Arşiv istek süresi | Saniye | Prometheus | 2 | 5 |
| archive_requests_in_flight | İşlenmekte olan arşiv istek sayısı | Sayı | Prometheus | 30 | 60 |
| archive_errors_total | Arşiv hata sayısı | Sayı | Prometheus | 5 | 20 |
| archive_storage_usage_bytes | Arşiv depolama kullanımı | Byte | Prometheus | %80 | %90 |

#### PostgreSQL

| Metrik | Açıklama | Birim | İzleme Aracı | Uyarı Eşiği | Kritik Eşik |
|--------|----------|-------|--------------|-------------|-------------|
| pg_stat_database_numbackends | Aktif veritabanı bağlantı sayısı | Sayı | Prometheus | 80 | 100 |
| pg_stat_database_xact_commit | İşlem onay sayısı | Sayı | Prometheus | - | - |
| pg_stat_database_xact_rollback | İşlem geri alma sayısı | Sayı | Prometheus | 10 | 50 |
| pg_stat_database_tup_fetched | Getirilen satır sayısı | Sayı | Prometheus | - | - |
| pg_stat_database_tup_inserted | Eklenen satır sayısı | Sayı | Prometheus | - | - |
| pg_stat_database_tup_updated | Güncellenen satır sayısı | Sayı | Prometheus | - | - |
| pg_stat_database_tup_deleted | Silinen satır sayısı | Sayı | Prometheus | - | - |
| pg_stat_database_conflicts | Çakışma sayısı | Sayı | Prometheus | 10 | 50 |
| pg_stat_database_temp_files | Geçici dosya sayısı | Sayı | Prometheus | 100 | 500 |
| pg_stat_database_temp_bytes | Geçici dosya boyutu | Byte | Prometheus | 1000000000 | 5000000000 |
| pg_stat_database_deadlocks | Kilitlenme sayısı | Sayı | Prometheus | 1 | 5 |
| pg_stat_database_blk_read_time | Blok okuma süresi | Milisaniye | Prometheus | 1000 | 5000 |
| pg_stat_database_blk_write_time | Blok yazma süresi | Milisaniye | Prometheus | 1000 | 5000 |

## İzleme Araçları

### Prometheus

Prometheus, tüm sistem ve uygulama metriklerini toplamak için kullanılacaktır. Prometheus, aşağıdaki özellikleri sağlar:

- Metrik toplama ve depolama
- Metrik sorgulama (PromQL)
- Uyarı kuralları tanımlama
- Hedef keşfi (service discovery)
- Veri görselleştirme (temel)

### Grafana

Grafana, Prometheus'tan toplanan metrikleri görselleştirmek için kullanılacaktır. Grafana, aşağıdaki özellikleri sağlar:

- Metrik görselleştirme
- Dashboard oluşturma
- Uyarı tanımlama
- Kullanıcı yönetimi
- Veri kaynağı entegrasyonu

### Loki

Loki, tüm servislerin günlük kayıtlarını toplamak ve analiz etmek için kullanılacaktır. Loki, aşağıdaki özellikleri sağlar:

- Günlük kaydı toplama ve depolama
- Günlük kaydı sorgulama (LogQL)
- Günlük kaydı görselleştirme (Grafana entegrasyonu)
- Etiketleme ve filtreleme

### Alertmanager

Alertmanager, Prometheus'tan gelen uyarıları yönetmek ve bildirmek için kullanılacaktır. Alertmanager, aşağıdaki özellikleri sağlar:

- Uyarı gruplandırma
- Uyarı susturma
- Uyarı yönlendirme
- Uyarı bildirimi (e-posta, Slack, vb.)

## Dashboard'lar

### Genel Bakış Dashboard'u

Genel Bakış Dashboard'u, tüm sistemin genel durumunu gösterecektir. Dashboard, aşağıdaki panelleri içerecektir:

- Sistem durumu (sağlıklı/sağlıksız)
- CPU kullanımı (tüm servisler)
- Bellek kullanımı (tüm servisler)
- Disk kullanımı
- Ağ trafiği
- HTTP istek sayısı
- HTTP hata sayısı
- Veritabanı bağlantı sayısı

### Servis Dashboard'ları

Her servis için ayrı bir dashboard oluşturulacaktır. Bu dashboard'lar, ilgili servisin detaylı metriklerini gösterecektir.

#### API Gateway Dashboard'u

- HTTP istek sayısı (endpoint bazında)
- HTTP istek süresi (endpoint bazında)
- HTTP hata sayısı (endpoint ve hata kodu bazında)
- İşlenmekte olan istek sayısı
- CPU ve bellek kullanımı

#### Segmentation Service Dashboard'u

- Segmentasyon istek sayısı
- Segmentasyon istek süresi
- Segmentasyon hata sayısı
- İşlenmekte olan segmentasyon istek sayısı
- CPU ve bellek kullanımı

#### AI Orchestrator Dashboard'u

- AI istek sayısı
- AI istek süresi
- AI hata sayısı
- İşlenmekte olan AI istek sayısı
- CPU ve bellek kullanımı

#### Archive Service Dashboard'u

- Arşiv istek sayısı
- Arşiv istek süresi
- Arşiv hata sayısı
- İşlenmekte olan arşiv istek sayısı
- Arşiv depolama kullanımı
- CPU ve bellek kullanımı

#### PostgreSQL Dashboard'u

- Aktif bağlantı sayısı
- İşlem sayısı (onay/geri alma)
- Satır işlem sayısı (getirme/ekleme/güncelleme/silme)
- Çakışma ve kilitlenme sayısı
- Geçici dosya kullanımı
- Blok okuma/yazma süresi
- CPU ve bellek kullanımı

## Uyarı Yapılandırması

### Uyarı Kuralları

Uyarı kuralları, Prometheus'ta tanımlanacak ve Alertmanager tarafından yönetilecektir. Uyarı kuralları, izleme metriklerinde belirtilen eşiklere göre oluşturulacaktır.

### Uyarı Bildirimleri

Uyarı bildirimleri, aşağıdaki kanallar üzerinden gönderilecektir:

- E-posta: Tüm uyarılar için
- Slack: Kritik uyarılar için
- SMS: Çok kritik uyarılar için (sistem çökmesi, veri kaybı, vb.)

### Uyarı Gruplandırma

Uyarılar, aşağıdaki kriterlere göre gruplandırılacaktır:

- Servis: API Gateway, Segmentation Service, AI Orchestrator, Archive Service, PostgreSQL
- Önem derecesi: Bilgi, Uyarı, Kritik
- Kaynak: CPU, bellek, disk, ağ, uygulama

## Performans Optimizasyonu

### Otomatik Ölçeklendirme

Kubernetes HorizontalPodAutoscaler (HPA) kullanılarak, servisler otomatik olarak ölçeklendirilecektir. HPA, aşağıdaki metriklere göre yapılandırılacaktır:

- CPU kullanımı: %70
- Bellek kullanımı: %70
- Özel metrikler: HTTP istek sayısı, işlenmekte olan istek sayısı

### Kaynak Limitleri

Tüm servisler için kaynak limitleri (CPU, bellek) tanımlanacaktır. Bu limitler, servislerin kaynak kullanımını kontrol etmek ve diğer servislerin performansını etkilememesini sağlamak için kullanılacaktır.

### Veritabanı Optimizasyonu

PostgreSQL veritabanı, aşağıdaki şekilde optimize edilecektir:

- İndeksleme: Sık kullanılan sorgular için uygun indeksler oluşturulacaktır
- Bağlantı havuzu: Bağlantı havuzu boyutu ve zaman aşımı süreleri optimize edilecektir
- Sorgu optimizasyonu: Yavaş sorgular tespit edilecek ve optimize edilecektir
- Yapılandırma ayarları: shared_buffers, work_mem, maintenance_work_mem gibi yapılandırma ayarları optimize edilecektir

### Önbellek Stratejisi

API Gateway ve diğer servisler için önbellek stratejisi uygulanacaktır. Bu strateji, sık kullanılan verilerin önbelleğe alınmasını ve tekrar hesaplanmasının önlenmesini sağlayacaktır.

## Sonuç

Bu performans izleme planı, ALT_LAS projesinin üretim ortamında performansının izlenmesi ve optimize edilmesi için bir çerçeve sunmaktadır. Plan, izlenecek metrikleri, izleme araçlarını, uyarı eşiklerini ve performans optimizasyonu stratejilerini içermektedir. Bu plan, sistemin performansının sürekli olarak izlenmesini ve iyileştirilmesini sağlayacaktır.
