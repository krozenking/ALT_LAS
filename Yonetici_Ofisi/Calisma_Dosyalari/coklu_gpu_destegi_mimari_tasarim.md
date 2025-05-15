# Çoklu GPU Desteği Mimari Tasarım

**Doküman No:** ALT_LAS-ARCH-001  
**Versiyon:** 0.1 (Taslak)  
**Tarih:** 2025-08-02  
**Hazırlayan:** Kıdemli Backend Geliştirici (Mehmet Yılmaz)  
**İlgili Görev:** KM-2.1 - Çoklu GPU Desteği

## 1. Giriş

### 1.1 Amaç

Bu doküman, ALT_LAS projesinde CUDA entegrasyonu kapsamında çoklu GPU desteği için mimari tasarımı tanımlamaktadır. Bu tasarım, sistemin birden fazla GPU üzerinde çalışabilmesini sağlayarak, performansı ve ölçeklenebilirliği artırmayı hedeflemektedir.

### 1.2 Kapsam

Bu doküman, aşağıdaki bileşenleri kapsamaktadır:

- Çoklu GPU algılama ve yönetim mimarisi
- GPU seçim stratejileri
- İş yükü dağıtımı mekanizması
- GPU'lar arası veri senkronizasyonu
- API genişletmeleri
- İzleme ve raporlama mekanizmaları

### 1.3 Hedef Kitle

Bu doküman, ALT_LAS projesinde çalışan backend geliştiricileri, DevOps mühendisleri, QA mühendisleri ve performans optimizasyonu ile ilgilenen diğer ekip üyeleri için hazırlanmıştır.

### 1.4 Referanslar

- CUDA Entegrasyon Planı (`/Yonetici_Ofisi/Calisma_Dosyalari/cuda_entegrasyon_plani.md`)
- CUDA Bellek Optimizasyonu (`/Yonetici_Ofisi/Calisma_Dosyalari/cuda_bellek_optimizasyonu.md`)
- Nsight İzleme Altyapısı (`/Yonetici_Ofisi/Calisma_Dosyalari/nsight_izleme_altyapisi.md`)
- Faz 2 Öneriler ve Yol Haritası (`/Yonetici_Ofisi/Calisma_Dosyalari/faz2_oneriler_ve_yol_haritasi.md`)
- NVIDIA CUDA Programming Guide
- NVIDIA Multi-GPU Programming Guide

## 2. Mimari Genel Bakış

### 2.1 Mevcut Mimari

Mevcut ALT_LAS mimarisi, tek bir GPU üzerinde çalışacak şekilde tasarlanmıştır. Sistem, aşağıdaki ana bileşenlerden oluşmaktadır:

1. **API Katmanı:** Dış sistemlerden gelen istekleri karşılar ve yanıtları döndürür.
2. **Orkestrasyon Katmanı:** İş akışını yönetir ve ilgili servisleri koordine eder.
3. **Model Yönetim Katmanı:** Modellerin yüklenmesi, önbelleğe alınması ve yönetilmesinden sorumludur.
4. **Çıkarım Katmanı:** CUDA kullanarak GPU üzerinde model çıkarımı gerçekleştirir.
5. **Kaynak Yönetim Katmanı:** GPU belleği ve hesaplama kaynaklarını yönetir.
6. **İzleme ve Raporlama Katmanı:** Performans metriklerini toplar ve raporlar.

### 2.2 Çoklu GPU Mimarisi

Çoklu GPU desteği için mevcut mimariye aşağıdaki yeni bileşenler eklenecektir:

1. **GPU Havuzu Yöneticisi:** Sistemdeki tüm GPU'ları algılar, durumlarını izler ve yönetir.
2. **GPU Seçim Stratejisi:** İş yüklerini hangi GPU'ya yönlendirileceğini belirler.
3. **İş Yükü Dağıtıcı:** İş parçacıklarını GPU'lar arasında dağıtır.
4. **Veri Senkronizasyon Yöneticisi:** GPU'lar arasında veri transferini optimize eder.
5. **Çoklu GPU İzleme:** Her GPU'nun performans metriklerini ayrı ayrı izler ve raporlar.

### 2.3 Mimari Diyagram

```
+---------------------+
|     API Katmanı     |
+----------+----------+
           |
+----------v----------+
| Orkestrasyon Katmanı|
+----------+----------+
           |
+----------v----------+     +----------------------+
|  İş Yükü Dağıtıcı   |<--->| GPU Havuzu Yöneticisi|
+----------+----------+     +----------------------+
           |                           |
           |                +----------v----------+
           |                | GPU Seçim Stratejisi|
           |                +----------+----------+
           |                           |
+----------v----------+     +----------v----------+
| Model Yönetim Katmanı|<--->|Veri Senkronizasyon |
+----------+----------+     |     Yöneticisi     |
           |                +----------------------+
           |
+----------v----------+
|   Çıkarım Katmanı   |
+----------+----------+
      |         |
+-----v-----+  +v------+
|  GPU 0    |  | GPU 1 |  ...
+-----------+  +-------+
      |         |
+-----v---------v------+
| Kaynak Yönetim Katmanı|
+-----------------------+
           |
+----------v----------+
|  İzleme ve Raporlama |
|       Katmanı       |
+---------------------+
```

## 3. Bileşen Tasarımları

### 3.1 GPU Havuzu Yöneticisi

#### 3.1.1 Sorumluluklar

- Sistemdeki tüm uyumlu GPU'ları algılama
- GPU'ların özelliklerini ve durumlarını izleme
- GPU'ların kullanılabilirlik durumunu yönetme
- GPU'ların sağlık durumunu kontrol etme

#### 3.1.2 Arayüzler

```python
class GPUPoolManager:
    def __init__(self, config):
        """GPU Havuzu Yöneticisini başlatır."""
        pass
        
    def discover_gpus(self):
        """Sistemdeki tüm uyumlu GPU'ları algılar ve döndürür."""
        pass
        
    def get_gpu_info(self, gpu_id):
        """Belirli bir GPU'nun özelliklerini ve durumunu döndürür."""
        pass
        
    def get_all_gpu_info(self):
        """Tüm GPU'ların özelliklerini ve durumlarını döndürür."""
        pass
        
    def reserve_gpu(self, gpu_id, task_id):
        """Belirli bir GPU'yu belirli bir görev için rezerve eder."""
        pass
        
    def release_gpu(self, gpu_id, task_id):
        """Belirli bir GPU'yu serbest bırakır."""
        pass
        
    def get_available_gpus(self):
        """Kullanılabilir GPU'ları döndürür."""
        pass
        
    def check_gpu_health(self, gpu_id):
        """Belirli bir GPU'nun sağlık durumunu kontrol eder."""
        pass
```

#### 3.1.3 Uygulama Detayları

GPU Havuzu Yöneticisi, NVIDIA Management Library (NVML) kullanılarak uygulanacaktır. NVML, GPU'ların algılanması, özelliklerinin ve durumlarının izlenmesi için kapsamlı bir API sağlar.

```python
import pynvml

class NVMLGPUPoolManager(GPUPoolManager):
    def __init__(self, config):
        super().__init__(config)
        pynvml.nvmlInit()
        self.device_count = pynvml.nvmlDeviceGetCount()
        self.devices = {}
        self.discover_gpus()
        
    def discover_gpus(self):
        for i in range(self.device_count):
            handle = pynvml.nvmlDeviceGetHandleByIndex(i)
            self.devices[i] = {
                'handle': handle,
                'name': pynvml.nvmlDeviceGetName(handle),
                'compute_capability': self._get_compute_capability(handle),
                'memory_total': pynvml.nvmlDeviceGetMemoryInfo(handle).total,
                'reserved_by': None
            }
        return list(self.devices.keys())
```

### 3.2 GPU Seçim Stratejisi

#### 3.2.1 Sorumluluklar

- İş yüklerinin hangi GPU'ya yönlendirileceğini belirleme
- Farklı seçim stratejilerini uygulama (round-robin, en az yüklü, özel görev bazlı)
- Seçim stratejilerini yapılandırma ve değiştirme

#### 3.2.2 Arayüzler

```python
class GPUSelectionStrategy:
    def select_gpu(self, task, available_gpus, gpu_info):
        """Belirli bir görev için uygun GPU'yu seçer."""
        pass

class RoundRobinStrategy(GPUSelectionStrategy):
    def __init__(self):
        self.current_index = 0
        
    def select_gpu(self, task, available_gpus, gpu_info):
        """Round-robin stratejisi ile GPU seçer."""
        pass

class LeastLoadedStrategy(GPUSelectionStrategy):
    def select_gpu(self, task, available_gpus, gpu_info):
        """En az yüklü GPU'yu seçer."""
        pass

class TaskSpecificStrategy(GPUSelectionStrategy):
    def select_gpu(self, task, available_gpus, gpu_info):
        """Görev tipine göre uygun GPU'yu seçer."""
        pass

class StrategySelector:
    def __init__(self, config):
        """Strateji seçiciyi başlatır."""
        pass
        
    def get_strategy(self, strategy_name):
        """Belirli bir stratejiyi döndürür."""
        pass
        
    def set_default_strategy(self, strategy_name):
        """Varsayılan stratejiyi ayarlar."""
        pass
```

#### 3.2.3 Uygulama Detayları

GPU Seçim Stratejisi, Strateji tasarım deseni kullanılarak uygulanacaktır. Bu, farklı seçim stratejilerinin kolayca eklenebilmesini ve değiştirilebilmesini sağlar.

```python
class RoundRobinStrategy(GPUSelectionStrategy):
    def __init__(self):
        self.current_index = 0
        
    def select_gpu(self, task, available_gpus, gpu_info):
        if not available_gpus:
            return None
            
        selected_gpu = available_gpus[self.current_index % len(available_gpus)]
        self.current_index += 1
        return selected_gpu

class LeastLoadedStrategy(GPUSelectionStrategy):
    def select_gpu(self, task, available_gpus, gpu_info):
        if not available_gpus:
            return None
            
        # GPU kullanım oranlarını al
        utilization = {}
        for gpu_id in available_gpus:
            utilization[gpu_id] = gpu_info[gpu_id]['utilization']
            
        # En düşük kullanım oranına sahip GPU'yu seç
        return min(utilization, key=utilization.get)
```

### 3.3 İş Yükü Dağıtıcı

#### 3.3.1 Sorumluluklar

- İş parçacıklarını GPU'lar arasında dağıtma
- Batch işlemleri bölme ve paralel işleme
- İş kuyrukları ve önceliklendirme yönetimi

#### 3.3.2 Arayüzler

```python
class WorkloadDistributor:
    def __init__(self, gpu_pool_manager, strategy_selector, config):
        """İş Yükü Dağıtıcıyı başlatır."""
        pass
        
    def distribute_task(self, task):
        """Belirli bir görevi uygun GPU'ya dağıtır."""
        pass
        
    def distribute_batch(self, batch_tasks):
        """Batch görevleri GPU'lar arasında dağıtır."""
        pass
        
    def cancel_task(self, task_id):
        """Belirli bir görevi iptal eder."""
        pass
        
    def get_task_status(self, task_id):
        """Belirli bir görevin durumunu döndürür."""
        pass
```

#### 3.3.3 Uygulama Detayları

İş Yükü Dağıtıcı, görevleri GPU'lara dağıtmak için GPU Havuzu Yöneticisi ve GPU Seçim Stratejisi bileşenlerini kullanacaktır.

```python
class WorkloadDistributor:
    def __init__(self, gpu_pool_manager, strategy_selector, config):
        self.gpu_pool_manager = gpu_pool_manager
        self.strategy_selector = strategy_selector
        self.config = config
        self.task_queue = Queue()
        self.task_status = {}
        
    def distribute_task(self, task):
        # Kullanılabilir GPU'ları al
        available_gpus = self.gpu_pool_manager.get_available_gpus()
        
        if not available_gpus:
            # Tüm GPU'lar meşgulse, görevi kuyruğa ekle
            self.task_queue.put(task)
            self.task_status[task.id] = 'queued'
            return None
            
        # Strateji seç
        strategy = self.strategy_selector.get_strategy(task.strategy)
        
        # GPU seç
        gpu_info = self.gpu_pool_manager.get_all_gpu_info()
        selected_gpu = strategy.select_gpu(task, available_gpus, gpu_info)
        
        if selected_gpu is None:
            # Uygun GPU bulunamazsa, görevi kuyruğa ekle
            self.task_queue.put(task)
            self.task_status[task.id] = 'queued'
            return None
            
        # GPU'yu rezerve et
        self.gpu_pool_manager.reserve_gpu(selected_gpu, task.id)
        
        # Görevi GPU'ya gönder
        self._execute_task_on_gpu(task, selected_gpu)
        
        self.task_status[task.id] = 'running'
        return selected_gpu
```

### 3.4 Veri Senkronizasyon Yöneticisi

#### 3.4.1 Sorumluluklar

- GPU'lar arası veri transferini optimize etme
- Paylaşılan bellek kullanımını yönetme
- CUDA streams ve events kullanımını koordine etme

#### 3.4.2 Arayüzler

```python
class DataSyncManager:
    def __init__(self, config):
        """Veri Senkronizasyon Yöneticisini başlatır."""
        pass
        
    def transfer_data(self, source_gpu, target_gpu, data):
        """Veriyi bir GPU'dan diğerine transfer eder."""
        pass
        
    def sync_data(self, gpus, data):
        """Veriyi birden fazla GPU arasında senkronize eder."""
        pass
        
    def allocate_shared_memory(self, size):
        """Paylaşılan bellek alanı tahsis eder."""
        pass
        
    def free_shared_memory(self, handle):
        """Paylaşılan bellek alanını serbest bırakır."""
        pass
```

#### 3.4.3 Uygulama Detayları

Veri Senkronizasyon Yöneticisi, CUDA API'lerini kullanarak GPU'lar arası veri transferini optimize edecektir.

```python
import torch

class TorchDataSyncManager(DataSyncManager):
    def __init__(self, config):
        super().__init__(config)
        self.shared_memory = {}
        
    def transfer_data(self, source_gpu, target_gpu, data):
        # PyTorch tensörü oluştur
        if isinstance(data, torch.Tensor):
            tensor = data
        else:
            tensor = torch.tensor(data, device=f'cuda:{source_gpu}')
            
        # Hedef GPU'ya transfer et
        return tensor.to(f'cuda:{target_gpu}')
        
    def sync_data(self, gpus, data):
        result = {}
        
        # İlk GPU'da tensör oluştur
        if isinstance(data, torch.Tensor):
            source_tensor = data
        else:
            source_tensor = torch.tensor(data, device=f'cuda:{gpus[0]}')
            
        # Diğer GPU'lara transfer et
        for gpu in gpus:
            result[gpu] = source_tensor.to(f'cuda:{gpu}')
            
        return result
```

### 3.5 API Genişletmeleri

#### 3.5.1 Sorumluluklar

- Çoklu GPU kullanımı için API parametreleri ekleme
- Konfigürasyon seçenekleri sağlama
- Geriye dönük uyumluluk sağlama

#### 3.5.2 API Değişiklikleri

**Mevcut API:**

```json
POST /api/v1/predict
{
  "text": "Sample input text",
  "max_length": 128,
  "temperature": 0.7
}
```

**Genişletilmiş API:**

```json
POST /api/v1/predict
{
  "text": "Sample input text",
  "max_length": 128,
  "temperature": 0.7,
  "gpu_options": {
    "strategy": "round_robin",
    "specific_gpu_id": null,
    "batch_split": true
  }
}
```

#### 3.5.3 Konfigürasyon Seçenekleri

```yaml
gpu:
  enabled: true
  multi_gpu:
    enabled: true
    default_strategy: "least_loaded"
    strategies:
      - "round_robin"
      - "least_loaded"
      - "task_specific"
    batch_split: true
    min_batch_size_per_gpu: 4
    max_concurrent_tasks_per_gpu: 8
    memory_threshold: 0.9
    utilization_threshold: 0.95
```

### 3.6 İzleme ve Raporlama Mekanizmaları

#### 3.6.1 Sorumluluklar

- Her GPU'nun performans metriklerini izleme
- İş yükü dağılımı istatistiklerini toplama
- Darboğaz analizi yapma

#### 3.6.2 Metrikler

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

#### 3.6.3 Prometheus Metrikleri

```python
# GPU kullanım oranı
gpu_utilization = Gauge('gpu_utilization_percent', 'GPU utilization percentage', ['gpu_id'])

# GPU bellek kullanımı
gpu_memory_used = Gauge('gpu_memory_used_mb', 'GPU memory used in MB', ['gpu_id'])

# GPU sıcaklık
gpu_temperature = Gauge('gpu_temperature_celsius', 'GPU temperature in Celsius', ['gpu_id'])

# GPU başına görev sayısı
gpu_tasks = Gauge('gpu_tasks_count', 'Number of tasks per GPU', ['gpu_id'])

# GPU başına yanıt süresi
gpu_response_time = Histogram('gpu_response_time_ms', 'Response time per GPU in ms', ['gpu_id'])
```

## 4. Veri Akışı ve Etkileşimler

### 4.1 Temel İş Akışı

1. İstemci, API'ye bir istek gönderir.
2. API Katmanı, isteği alır ve Orkestrasyon Katmanı'na iletir.
3. Orkestrasyon Katmanı, İş Yükü Dağıtıcı'yı kullanarak görevi bir GPU'ya atar.
4. İş Yükü Dağıtıcı, GPU Havuzu Yöneticisi'nden kullanılabilir GPU'ları alır.
5. İş Yükü Dağıtıcı, GPU Seçim Stratejisi'ni kullanarak uygun GPU'yu seçer.
6. Model Yönetim Katmanı, seçilen GPU'da modeli yükler veya önbellekten alır.
7. Çıkarım Katmanı, seçilen GPU'da çıkarım işlemini gerçekleştirir.
8. Sonuçlar, API Katmanı aracılığıyla istemciye döndürülür.

### 4.2 Batch İşleme İş Akışı

1. İstemci, API'ye bir batch istek gönderir.
2. API Katmanı, isteği alır ve Orkestrasyon Katmanı'na iletir.
3. Orkestrasyon Katmanı, batch'i alt batch'lere böler.
4. İş Yükü Dağıtıcı, her alt batch'i uygun GPU'lara dağıtır.
5. Her GPU, kendi alt batch'i üzerinde paralel olarak çıkarım işlemi gerçekleştirir.
6. Veri Senkronizasyon Yöneticisi, gerekirse GPU'lar arasında veri transferi yapar.
7. Sonuçlar birleştirilir ve API Katmanı aracılığıyla istemciye döndürülür.

## 5. Performans Değerlendirmesi

### 5.1 Performans Hedefleri

- 2 GPU kullanımında, tek GPU'ya göre en az %80 ölçeklenebilirlik (1.8x performans)
- 4 GPU kullanımında, tek GPU'ya göre en az %70 ölçeklenebilirlik (2.8x performans)
- GPU'lar arası veri transferi overhead'i < %5
- Çoklu GPU kullanımı ile 95. persentil yanıt süresi < 100ms
- Çoklu GPU kullanımı ile 99. persentil yanıt süresi < 200ms

### 5.2 Performans Test Senaryoları

1. **Tek İstek Testi:** Tek bir isteğin farklı GPU'larda işlenmesi ve performans karşılaştırması
2. **Batch İşleme Testi:** Farklı batch boyutlarının çoklu GPU'larda işlenmesi ve ölçeklenebilirlik analizi
3. **Yüksek Eşzamanlılık Testi:** Çok sayıda eşzamanlı isteğin çoklu GPU'larda işlenmesi
4. **Uzun Süreli Yük Testi:** Uzun süreli (4+ saat) çoklu GPU kullanımı ve performans stabilitesi

## 6. Güvenlik ve Hata Yönetimi

### 6.1 Güvenlik Önlemleri

- GPU erişim kontrolü ve izolasyon
- Kaynak sınırlamaları ve kota yönetimi
- Güvenli veri transferi

### 6.2 Hata Senaryoları ve Çözümleri

| Hata Senaryosu | Çözüm |
|----------------|-------|
| GPU arızası | Arızalı GPU'yu havuzdan çıkar, görevleri diğer GPU'lara yönlendir |
| GPU bellek yetersizliği | Bellek kullanımını optimize et, gerekirse görevi daha küçük parçalara böl |
| GPU'lar arası veri transferi hatası | Yeniden deneme mekanizması, alternatif transfer yöntemleri |
| GPU seçim stratejisi hatası | Varsayılan stratejiye geri dön, hata durumunu raporla |
| Tüm GPU'ların meşgul olması | İş kuyruğuna ekle, önceliklendirme uygula |

## 7. Geriye Dönük Uyumluluk

Çoklu GPU desteği, mevcut tek GPU modunu bozmayacak şekilde tasarlanmıştır. Geriye dönük uyumluluk aşağıdaki şekilde sağlanacaktır:

- Çoklu GPU desteği, konfigürasyon ile etkinleştirilebilir/devre dışı bırakılabilir
- API değişiklikleri opsiyonel parametreler olarak eklenecek
- Mevcut API çağrıları, varsayılan olarak tek GPU modunda çalışmaya devam edecek
- Mevcut izleme ve raporlama mekanizmaları korunacak, yeni metrikler eklenecek

## 8. Sonuç ve Öneriler

Çoklu GPU desteği, ALT_LAS sisteminin performansını ve ölçeklenebilirliğini önemli ölçüde artıracaktır. Bu tasarım, sistemin birden fazla GPU üzerinde verimli bir şekilde çalışabilmesini sağlayacak temel bileşenleri tanımlamaktadır.

Tasarımın başarılı bir şekilde uygulanması için aşağıdaki öneriler dikkate alınmalıdır:

1. **Aşamalı Uygulama:** Bileşenler aşamalı olarak uygulanmalı ve her aşamada kapsamlı testler yapılmalıdır.
2. **Performans Optimizasyonu:** GPU'lar arası veri transferi ve senkronizasyon overhead'i minimize edilmelidir.
3. **Hata Toleransı:** Sistem, GPU arızaları ve diğer hata durumlarına karşı dayanıklı olmalıdır.
4. **İzleme ve Analiz:** Çoklu GPU kullanımı için kapsamlı izleme ve analiz mekanizmaları geliştirilmelidir.
5. **Dokümantasyon:** API değişiklikleri ve konfigürasyon seçenekleri detaylı bir şekilde dokümante edilmelidir.

---

**Ek Bilgi:** Bu doküman, KM-2.1 (Çoklu GPU Desteği) görevi kapsamında hazırlanmış olup, taslak niteliğindedir. Gözden geçirme ve onay sürecinden sonra nihai hale getirilecektir.
