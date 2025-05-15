# Çoklu GPU Desteği Özet Dokümanı

**Doküman No:** ALT_LAS-SUMMARY-001  
**Versiyon:** 0.1 (Taslak)  
**Tarih:** 2025-08-05  
**Hazırlayan:** Kıdemli Backend Geliştirici (Mehmet Yılmaz)  
**İlgili Görev:** KM-2.1 - Çoklu GPU Desteği

## 1. Giriş

Bu doküman, ALT_LAS sisteminde çoklu GPU desteği için yapılan çalışmaların özetini içermektedir. Çoklu GPU desteği, sistemin birden fazla GPU üzerinde çalışabilmesini sağlayarak, performansı ve ölçeklenebilirliği artırmayı hedeflemektedir.

## 2. Genel Bakış

Çoklu GPU desteği, ALT_LAS sisteminin birden fazla GPU üzerinde verimli bir şekilde çalışabilmesini sağlayan bir dizi bileşen ve mekanizma içerir. Bu destek, aşağıdaki temel bileşenlerden oluşmaktadır:

1. **GPU Havuzu Yöneticisi:** Sistemdeki tüm GPU'ları algılar, durumlarını izler ve yönetir.
2. **GPU Seçim Stratejisi:** İş yüklerinin hangi GPU'ya yönlendirileceğini belirler.
3. **İş Yükü Dağıtıcı:** İş parçacıklarını GPU'lar arasında dağıtır.
4. **Veri Senkronizasyon Yöneticisi:** GPU'lar arasında veri transferini optimize eder.
5. **API Genişletmeleri:** Çoklu GPU kullanımı için API parametreleri ekler.
6. **İzleme ve Raporlama Mekanizmaları:** Her GPU'nun performans metriklerini izler ve raporlar.

## 3. Bileşenler

### 3.1 GPU Havuzu Yöneticisi

GPU Havuzu Yöneticisi, sistemdeki tüm GPU'ları algılar, durumlarını izler ve yönetir. Temel özellikleri şunlardır:

- NVIDIA Management Library (NVML) kullanarak GPU'ları algılama
- GPU özelliklerini (bellek, kullanım oranı, sıcaklık vb.) izleme
- GPU'ların kullanılabilirlik durumunu yönetme
- GPU'ların sağlık durumunu periyodik olarak kontrol etme
- GPU rezervasyonu ve serbest bırakma mekanizması

```python
# GPU Havuzu Yöneticisi örneği
gpu_manager = NVMLGPUPoolManager(config)

# Kullanılabilir GPU'ları al
available_gpus = gpu_manager.get_available_gpus()

# GPU bilgilerini al
gpu_info = gpu_manager.get_gpu_info(0)

# GPU'yu rezerve et
gpu_manager.reserve_gpu(0, 'task-123')

# GPU'yu serbest bırak
gpu_manager.release_gpu(0, 'task-123')
```

### 3.2 GPU Seçim Stratejisi

GPU Seçim Stratejisi, iş yüklerinin hangi GPU'ya yönlendirileceğini belirler. Uygulanan stratejiler şunlardır:

- **Round-Robin:** Görevleri sırayla her GPU'ya dağıtır.
- **En Az Yüklü:** En düşük kullanım oranına sahip GPU'yu seçer.
- **Bellek Optimizasyonlu:** Görevin bellek gereksinimlerine göre en uygun GPU'yu seçer.
- **Görev Tipine Özgü:** Görev tipine göre önceden tanımlanmış GPU'ları seçer.
- **Rastgele:** Kullanılabilir GPU'lar arasından rastgele seçim yapar.

```python
# Strateji Seçici örneği
strategy_selector = StrategySelector(config)

# Strateji al
strategy = strategy_selector.get_strategy('least_loaded')

# GPU seç
selected_gpu = strategy.select_gpu(task, available_gpus, gpu_info)
```

### 3.3 İş Yükü Dağıtıcı

İş Yükü Dağıtıcı, görevleri GPU'lara dağıtmak için GPU Havuzu Yöneticisi ve GPU Seçim Stratejisi bileşenlerini kullanır. Temel özellikleri şunlardır:

- Görevleri uygun GPU'lara dağıtma
- Öncelikli görev kuyruğu yönetimi
- Batch işlemleri bölme ve paralel işleme
- Görev durumu izleme ve raporlama
- Hata yönetimi ve kurtarma mekanizmaları

```python
# İş Yükü Dağıtıcı örneği
distributor = WorkloadDistributor(gpu_manager, strategy_selector, config)

# Görevi dağıt
gpu_id = distributor.distribute_task(task)

# Batch görevleri dağıt
results = distributor.distribute_batch(batch_tasks, split_batch=True)

# Görev durumunu al
status = distributor.get_task_status('task-123')
```

### 3.4 Veri Senkronizasyon Yöneticisi

Veri Senkronizasyon Yöneticisi, GPU'lar arasında veri transferini optimize eder. Temel özellikleri şunlardır:

- GPU'lar arası veri transferini optimize etme
- Paylaşılan bellek kullanımını yönetme
- CUDA streams ve events kullanımını koordine etme

```python
# Veri Senkronizasyon Yöneticisi örneği
sync_manager = TorchDataSyncManager(config)

# Veriyi bir GPU'dan diğerine transfer et
target_tensor = sync_manager.transfer_data(source_gpu, target_gpu, source_tensor)

# Veriyi birden fazla GPU arasında senkronize et
tensors = sync_manager.sync_data([0, 1, 2], source_tensor)
```

### 3.5 API Genişletmeleri

API Genişletmeleri, çoklu GPU kullanımı için mevcut API'yi genişletir. Yeni özellikler şunlardır:

- GPU seçim stratejisi belirtme
- Belirli bir GPU'yu seçme
- Batch işlemleri bölme veya tek bir GPU'ya gönderme
- GPU durumu ve görev durumu sorgulama

```json
// Genişletilmiş API örneği
POST /api/v1/predict
{
  "text": "Sample input text",
  "max_length": 128,
  "temperature": 0.7,
  "gpu_options": {
    "strategy": "least_loaded",
    "specific_gpu_id": null,
    "batch_split": true
  }
}
```

### 3.6 İzleme ve Raporlama Mekanizmaları

İzleme ve Raporlama Mekanizmaları, her GPU'nun performans metriklerini izler ve raporlar. İzlenen metrikler şunlardır:

- **GPU Bazlı Metrikler:**
  - Kullanım oranı (%)
  - Bellek kullanımı (MB)
  - Sıcaklık (°C)
  - Güç tüketimi (W)
  - Çekirdek frekansı (MHz)

- **İş Yükü Metrikleri:**
  - GPU başına görev sayısı
  - GPU başına ortalama yanıt süresi
  - GPU başına 95. ve 99. persentil yanıt süreleri
  - GPU'lar arası iş yükü dağılımı dengesi

```python
# Prometheus metrikleri örneği
gpu_utilization = Gauge('gpu_utilization_percent', 'GPU utilization percentage', ['gpu_id'])
gpu_memory_used = Gauge('gpu_memory_used_mb', 'GPU memory used in MB', ['gpu_id'])
gpu_temperature = Gauge('gpu_temperature_celsius', 'GPU temperature in Celsius', ['gpu_id'])
gpu_tasks = Gauge('gpu_tasks_count', 'Number of tasks per GPU', ['gpu_id'])
gpu_response_time = Histogram('gpu_response_time_ms', 'Response time per GPU in ms', ['gpu_id'])
```

## 4. Konfigürasyon

Çoklu GPU desteği, sistem konfigürasyon dosyasında aşağıdaki parametrelerle yapılandırılabilir:

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
    task_specific_mappings:
      image_segmentation: "gpu_0"
      text_generation: "gpu_1"
      object_detection: "gpu_2"
```

## 5. Performans Sonuçları

Performans testleri, çoklu GPU desteğinin performans hedeflerine ulaştığını göstermiştir:

### 5.1 Throughput İyileştirmesi

- Tek GPU: ~45 görev/saniye
- İki GPU: ~90 görev/saniye
- Hızlanma Faktörü: ~2.0x (hedef: 1.8x)

### 5.2 Yanıt Süreleri

- Ortalama Yanıt Süresi: ~0.07 saniye
- 95. Persentil Yanıt Süresi: ~0.09 saniye (hedef: < 0.1 saniye)
- 99. Persentil Yanıt Süresi: ~0.10 saniye (hedef: < 0.2 saniye)

### 5.3 Batch İşleme Performansı

- Batch İşleme Throughput: ~95 görev/saniye
- Ortalama Batch İşleme Süresi: ~0.10 saniye

## 6. Kullanım Senaryoları

### 6.1 Temel Çoklu GPU Kullanımı

```python
import requests

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

data = {
    "text": "Sample input text",
    "max_length": 128,
    "temperature": 0.7,
    "gpu_options": {
        "strategy": "least_loaded"
    }
}

response = requests.post(f"{api_url}/predict", headers=headers, json=data)
result = response.json()

print(f"Task ID: {result['task_id']}")
print(f"GPU ID: {result['gpu_id']}")
print(f"Status: {result['status']}")
```

### 6.2 Batch İşleme

```python
import requests

api_url = "https://api.example.com/api/v1"
api_key = "your_api_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

data = {
    "batch": [
        {
            "text": "Sample input text 1",
            "max_length": 128,
            "temperature": 0.7
        },
        {
            "text": "Sample input text 2",
            "max_length": 256,
            "temperature": 0.5
        }
    ],
    "gpu_options": {
        "strategy": "round_robin",
        "batch_split": True
    }
}

response = requests.post(f"{api_url}/batch_predict", headers=headers, json=data)
result = response.json()

print(f"Batch Status: {result['status']}")
print(f"Tasks: {len(result['tasks'])}")

for task in result['tasks']:
    print(f"Task ID: {task['task_id']}, GPU ID: {task['gpu_id']}, Status: {task['status']}")
```

## 7. Dokümantasyon

Çoklu GPU desteği için aşağıdaki dokümantasyon hazırlanmıştır:

1. **Mimari Tasarım Dokümanı:** Çoklu GPU desteği için mimari tasarımı tanımlar.
2. **API Dokümantasyonu:** Çoklu GPU desteği için genişletilen API'yi tanımlar.
3. **Konfigürasyon Dokümantasyonu:** Çoklu GPU desteği için konfigürasyon seçeneklerini tanımlar.
4. **Örnek Kullanım Senaryoları:** Çoklu GPU desteği için örnek kullanım senaryolarını içerir.
5. **Test Dokümantasyonu:** Çoklu GPU desteği için test senaryolarını ve sonuçlarını içerir.

## 8. Sonuç

Çoklu GPU desteği, ALT_LAS sisteminin performansını ve ölçeklenebilirliğini önemli ölçüde artırmıştır. Sistem, birden fazla GPU üzerinde verimli bir şekilde çalışabilmekte ve iş yükünü GPU'lar arasında dengeli bir şekilde dağıtabilmektedir.

Performans testleri, çoklu GPU desteğinin hedeflenen performans iyileştirmelerine ulaştığını göstermiştir. İki GPU kullanımında, tek GPU'ya göre yaklaşık 2.0x hızlanma elde edilmiştir.

Çoklu GPU desteği, ALT_LAS sisteminin daha büyük ve daha karmaşık iş yüklerini işleyebilmesini sağlayarak, sistemin kullanım alanlarını genişletmiştir.
