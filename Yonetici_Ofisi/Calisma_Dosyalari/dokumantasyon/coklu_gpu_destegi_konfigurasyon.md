# Çoklu GPU Desteği Konfigürasyon Dokümantasyonu

**Doküman No:** ALT_LAS-CONF-001  
**Versiyon:** 0.1 (Taslak)  
**Tarih:** 2025-08-05  
**Hazırlayan:** Kıdemli Backend Geliştirici (Mehmet Yılmaz)  
**İlgili Görev:** KM-2.1 - Çoklu GPU Desteği

## 1. Giriş

Bu doküman, ALT_LAS sisteminde çoklu GPU desteği için konfigürasyon seçeneklerini tanımlamaktadır. Bu konfigürasyon seçenekleri, sistemin birden fazla GPU üzerinde çalışabilmesini sağlayarak, performansı ve ölçeklenebilirliği artırmayı hedeflemektedir.

### 1.1 Kapsam

Bu doküman, aşağıdaki konfigürasyon alanlarını kapsamaktadır:

- GPU etkinleştirme seçenekleri
- Çoklu GPU etkinleştirme seçenekleri
- GPU seçim stratejileri
- Batch işleme seçenekleri
- Bellek ve kullanım eşikleri
- Görev tipine özgü GPU eşleştirmeleri
- Kuyruk işleme seçenekleri
- İzleme ve raporlama seçenekleri

### 1.2 Hedef Kitle

Bu doküman, ALT_LAS sistemini yapılandıran sistem yöneticileri, DevOps mühendisleri ve diğer teknik personel için hazırlanmıştır.

### 1.3 Ön Koşullar

Bu dokümandaki konfigürasyon seçeneklerini kullanmak için aşağıdaki ön koşulların sağlanması gerekmektedir:

- ALT_LAS sisteminin kurulmuş olması
- Sistemde en az bir CUDA uyumlu GPU bulunması
- NVIDIA sürücülerinin ve CUDA kütüphanelerinin kurulmuş olması
- Sistem yönetici yetkilerine sahip olunması

## 2. Konfigürasyon Dosyası

ALT_LAS sistemi, konfigürasyon seçeneklerini YAML formatında bir dosyadan okur. Varsayılan olarak, bu dosya `config.yaml` olarak adlandırılır ve sistem kök dizininde bulunur.

### 2.1 Dosya Yapısı

Konfigürasyon dosyası, hiyerarşik bir yapıya sahiptir. Çoklu GPU desteği için konfigürasyon seçenekleri, `gpu` bölümü altında gruplandırılmıştır.

```yaml
# Genel sistem konfigürasyonu
system:
  # ...

# GPU konfigürasyonu
gpu:
  enabled: true
  multi_gpu:
    enabled: true
    # Çoklu GPU seçenekleri
    # ...

# Diğer konfigürasyon bölümleri
# ...
```

### 2.2 Konfigürasyon Yükleme

Sistem başlatılırken, konfigürasyon dosyası otomatik olarak yüklenir. Alternatif bir konfigürasyon dosyası kullanmak için, sistem başlatılırken `--config` parametresi kullanılabilir:

```bash
python alt_las.py --config /path/to/custom_config.yaml
```

### 2.3 Konfigürasyon Doğrulama

Sistem başlatılırken, konfigürasyon dosyası doğrulanır. Geçersiz bir konfigürasyon tespit edilirse, sistem bir hata mesajı gösterir ve çıkar. Konfigürasyon dosyasını doğrulamak için aşağıdaki komutu kullanabilirsiniz:

```bash
python alt_las.py --validate-config
```

## 3. GPU Konfigürasyon Seçenekleri

### 3.1 Temel GPU Seçenekleri

```yaml
gpu:
  # GPU desteğini etkinleştir/devre dışı bırak
  enabled: true
  
  # Minimum CUDA compute capability
  min_compute_capability: 7.0
  
  # GPU bellek eşiği (0.0-1.0 arası)
  # Bu değerin üzerindeki bellek kullanımına sahip GPU'lar kullanılmaz
  memory_threshold: 0.9
  
  # GPU kullanım eşiği (0.0-1.0 arası)
  # Bu değerin üzerindeki kullanım oranına sahip GPU'lar kullanılmaz
  utilization_threshold: 0.95
  
  # Maksimum GPU sıcaklığı (Celsius)
  # Bu değerin üzerindeki sıcaklığa sahip GPU'lar kullanılmaz
  max_temperature: 85
  
  # GPU sağlık kontrolü aralığı (saniye)
  health_check_interval: 60
```

### 3.2 Çoklu GPU Seçenekleri

```yaml
gpu:
  # ...
  
  multi_gpu:
    # Çoklu GPU desteğini etkinleştir/devre dışı bırak
    enabled: true
    
    # Varsayılan GPU seçim stratejisi
    default_strategy: "least_loaded"
    
    # Kullanılabilir GPU seçim stratejileri
    strategies:
      - "round_robin"
      - "least_loaded"
      - "memory_optimized"
      - "task_specific"
      - "random"
    
    # Batch işlemleri bölme seçeneği
    batch_split: true
    
    # GPU başına minimum batch boyutu
    min_batch_size_per_gpu: 4
    
    # GPU başına maksimum eşzamanlı görev sayısı
    max_concurrent_tasks_per_gpu: 8
    
    # Görev tipine özgü GPU eşleştirmeleri
    task_specific_mappings:
      image_segmentation: "gpu_0"
      text_generation: "gpu_1"
      object_detection: "gpu_2"
      # Diğer görev tipleri...
```

### 3.3 Kuyruk İşleme Seçenekleri

```yaml
gpu:
  # ...
  
  multi_gpu:
    # ...
    
    # Kuyruk işleme aralığı (saniye)
    queue_processing_interval: 0.1
    
    # Kuyruk öncelik seviyeleri
    queue_priority_levels:
      high: 0
      normal: 1
      low: 2
    
    # Varsayılan kuyruk önceliği
    default_queue_priority: "normal"
    
    # Maksimum kuyruk boyutu
    max_queue_size: 1000
    
    # Kuyruk zaman aşımı (saniye)
    # Bu süre sonunda kuyruktaki görevler iptal edilir
    queue_timeout: 3600
```

### 3.4 İzleme ve Raporlama Seçenekleri

```yaml
gpu:
  # ...
  
  monitoring:
    # İzleme etkinleştir/devre dışı bırak
    enabled: true
    
    # İzleme aralığı (saniye)
    interval: 10
    
    # Prometheus metrikleri etkinleştir/devre dışı bırak
    prometheus_metrics: true
    
    # Prometheus endpoint'i
    prometheus_endpoint: "/metrics"
    
    # Log seviyesi
    log_level: "info"
    
    # Detaylı GPU metrikleri etkinleştir/devre dışı bırak
    detailed_gpu_metrics: true
    
    # Görev metrikleri etkinleştir/devre dışı bırak
    task_metrics: true
    
    # Kuyruk metrikleri etkinleştir/devre dışı bırak
    queue_metrics: true
```

## 4. GPU Seçim Stratejileri

### 4.1 Round Robin

Round Robin stratejisi, görevleri sırayla her GPU'ya dağıtır. Bu strateji, iş yükünün GPU'lar arasında eşit dağıtılmasını sağlar.

```yaml
gpu:
  multi_gpu:
    default_strategy: "round_robin"
```

### 4.2 En Az Yüklü

En Az Yüklü stratejisi, en düşük kullanım oranına sahip GPU'yu seçer. Bu strateji, iş yükünün GPU'lar arasında dengeli dağıtılmasını sağlar.

```yaml
gpu:
  multi_gpu:
    default_strategy: "least_loaded"
```

### 4.3 Bellek Optimizasyonlu

Bellek Optimizasyonlu strateji, görevin bellek gereksinimlerine göre en uygun GPU'yu seçer. Bu strateji, bellek yoğun görevler için uygundur.

```yaml
gpu:
  multi_gpu:
    default_strategy: "memory_optimized"
```

### 4.4 Görev Tipine Özgü

Görev Tipine Özgü strateji, görev tipine göre önceden tanımlanmış GPU'ları seçer. Bu strateji, belirli görev tipleri için optimize edilmiş GPU'ları kullanmak için uygundur.

```yaml
gpu:
  multi_gpu:
    default_strategy: "task_specific"
    task_specific_mappings:
      image_segmentation: "gpu_0"
      text_generation: "gpu_1"
      object_detection: "gpu_2"
```

### 4.5 Rastgele

Rastgele strateji, kullanılabilir GPU'lar arasından rastgele seçim yapar. Bu strateji, basit ve hızlı bir seçim algoritması sağlar.

```yaml
gpu:
  multi_gpu:
    default_strategy: "random"
```

## 5. Batch İşleme Seçenekleri

### 5.1 Batch Bölme

Batch bölme seçeneği, batch işlemleri farklı GPU'lara dağıtmayı sağlar. Bu seçenek etkinleştirildiğinde, batch içindeki görevler farklı GPU'lara dağıtılır.

```yaml
gpu:
  multi_gpu:
    batch_split: true
```

### 5.2 GPU Başına Minimum Batch Boyutu

GPU başına minimum batch boyutu, bir GPU'ya gönderilecek minimum görev sayısını belirler. Bu değer, batch bölme etkinleştirildiğinde kullanılır.

```yaml
gpu:
  multi_gpu:
    min_batch_size_per_gpu: 4
```

### 5.3 GPU Başına Maksimum Eşzamanlı Görev Sayısı

GPU başına maksimum eşzamanlı görev sayısı, bir GPU üzerinde aynı anda çalışabilecek maksimum görev sayısını belirler.

```yaml
gpu:
  multi_gpu:
    max_concurrent_tasks_per_gpu: 8
```

## 6. Örnek Konfigürasyon Dosyaları

### 6.1 Temel Çoklu GPU Konfigürasyonu

```yaml
gpu:
  enabled: true
  min_compute_capability: 7.0
  memory_threshold: 0.9
  utilization_threshold: 0.95
  max_temperature: 85
  health_check_interval: 60
  
  multi_gpu:
    enabled: true
    default_strategy: "least_loaded"
    strategies:
      - "round_robin"
      - "least_loaded"
      - "memory_optimized"
      - "task_specific"
      - "random"
    batch_split: true
    min_batch_size_per_gpu: 4
    max_concurrent_tasks_per_gpu: 8
    queue_processing_interval: 0.1
```

### 6.2 Görev Tipine Özgü GPU Konfigürasyonu

```yaml
gpu:
  enabled: true
  min_compute_capability: 7.0
  
  multi_gpu:
    enabled: true
    default_strategy: "task_specific"
    task_specific_mappings:
      image_segmentation: "gpu_0"  # Görüntü segmentasyonu için GPU 0
      text_generation: "gpu_1"     # Metin üretimi için GPU 1
      object_detection: "gpu_2"    # Nesne tespiti için GPU 2
```

### 6.3 Yüksek Performans Konfigürasyonu

```yaml
gpu:
  enabled: true
  min_compute_capability: 7.0
  memory_threshold: 0.95
  utilization_threshold: 0.98
  
  multi_gpu:
    enabled: true
    default_strategy: "memory_optimized"
    batch_split: true
    min_batch_size_per_gpu: 8
    max_concurrent_tasks_per_gpu: 16
    queue_processing_interval: 0.05
```

### 6.4 Yüksek Güvenilirlik Konfigürasyonu

```yaml
gpu:
  enabled: true
  min_compute_capability: 7.0
  memory_threshold: 0.8
  utilization_threshold: 0.9
  max_temperature: 80
  health_check_interval: 30
  
  multi_gpu:
    enabled: true
    default_strategy: "least_loaded"
    batch_split: true
    min_batch_size_per_gpu: 2
    max_concurrent_tasks_per_gpu: 4
    queue_processing_interval: 0.2
    queue_timeout: 1800
```

## 7. Konfigürasyon Değişikliklerini Uygulama

Konfigürasyon değişiklikleri, sistem yeniden başlatıldığında uygulanır. Bazı konfigürasyon değişiklikleri, sistem çalışırken de uygulanabilir.

### 7.1 Sistem Yeniden Başlatma

Sistem yeniden başlatıldığında, tüm konfigürasyon değişiklikleri uygulanır.

```bash
# Sistemi durdur
sudo systemctl stop alt_las

# Sistemi başlat
sudo systemctl start alt_las
```

### 7.2 Çalışma Zamanı Konfigürasyon Değişiklikleri

Bazı konfigürasyon değişiklikleri, sistem çalışırken de uygulanabilir. Bu değişiklikler, API aracılığıyla yapılabilir.

```bash
# Varsayılan GPU seçim stratejisini değiştir
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <api_key>" \
  -d '{"strategy": "round_robin"}' \
  https://api.example.com/api/v1/config/gpu/strategy

# GPU başına maksimum eşzamanlı görev sayısını değiştir
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <api_key>" \
  -d '{"max_concurrent_tasks": 12}' \
  https://api.example.com/api/v1/config/gpu/max_concurrent_tasks
```

## 8. Sorun Giderme

### 8.1 GPU Algılanmıyor

GPU'lar algılanmıyorsa, aşağıdaki adımları kontrol edin:

1. NVIDIA sürücülerinin kurulu olduğunu doğrulayın:
   ```bash
   nvidia-smi
   ```

2. CUDA kütüphanelerinin kurulu olduğunu doğrulayın:
   ```bash
   nvcc --version
   ```

3. GPU'ların minimum compute capability gereksinimini karşıladığını doğrulayın:
   ```bash
   nvidia-smi --query-gpu=name,compute_capability --format=csv
   ```

4. Sistem loglarını kontrol edin:
   ```bash
   journalctl -u alt_las
   ```

### 8.2 GPU Seçim Stratejisi Çalışmıyor

GPU seçim stratejisi beklendiği gibi çalışmıyorsa, aşağıdaki adımları kontrol edin:

1. Konfigürasyon dosyasında doğru strateji adının belirtildiğini doğrulayın.
2. GPU durumunu kontrol edin:
   ```bash
   curl -H "Authorization: Bearer <api_key>" https://api.example.com/api/v1/gpus
   ```
3. Sistem loglarını kontrol edin:
   ```bash
   journalctl -u alt_las | grep "strategy"
   ```

### 8.3 Batch İşleme Performansı Düşük

Batch işleme performansı beklenenden düşükse, aşağıdaki adımları kontrol edin:

1. `batch_split` seçeneğinin etkinleştirildiğini doğrulayın.
2. `min_batch_size_per_gpu` değerini artırmayı deneyin.
3. `max_concurrent_tasks_per_gpu` değerini artırmayı deneyin.
4. GPU kullanım oranlarını kontrol edin:
   ```bash
   nvidia-smi dmon
   ```
5. Sistem loglarını kontrol edin:
   ```bash
   journalctl -u alt_las | grep "batch"
   ```
