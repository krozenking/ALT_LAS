# API Meta Veri Tasarımı (GPU) - Mimari Tasarım Dokümanı

**Doküman No:** ALT_LAS-ARCH-001  
**Versiyon:** 0.1 (Taslak)  
**Tarih:** 2025-05-31  
**Hazırlayan:** Yazılım Mimarı (Elif Yılmaz)  
**İlgili Görev:** KM-1.3 - API Meta Veri Tasarımı (GPU)

## 1. Giriş

### 1.1 Amaç

Bu doküman, ALT_LAS projesinde CUDA entegrasyonu kapsamında API yanıtlarında işlem süresi ve GPU kaynağı kullanımı ile ilgili meta verilerin standart bir şekilde sunulması için mimari tasarımı tanımlamaktadır. Bu tasarım, sistemin performans karakteristiklerinin şeffaf bir şekilde izlenmesini, analiz edilmesini ve optimizasyonunu sağlayacaktır.

### 1.2 Kapsam

Bu mimari tasarım, ALT_LAS projesindeki tüm API'ler için geçerli olacak meta veri standardını, bu meta verilerin nasıl toplanacağını, işleneceğini ve sunulacağını kapsamaktadır. Tasarım, aşağıdaki bileşenleri içermektedir:

- API yanıtlarında standart meta veri formatı
- GPU kaynak kullanımı izleme mekanizması
- İşlem süresi ölçüm mekanizması
- Meta veri toplama ve işleme altyapısı
- Meta verilerin API yanıtlarına entegrasyonu

### 1.3 Hedef Kitle

Bu doküman, ALT_LAS projesinde çalışan yazılım geliştiricileri, sistem mimarları, DevOps mühendisleri ve QA ekibi için hazırlanmıştır.

### 1.4 Referanslar

- ALT_LAS Proje Planı
- CUDA Entegrasyon Planı
- GPU Ön Isıtma PoC Dokümantasyonu
- OpenTelemetry Dokümantasyonu
- NVIDIA Nsight Systems Dokümantasyonu

## 2. Mevcut Durum ve İhtiyaç Analizi

### 2.1 Mevcut API Yanıt Yapısı

ALT_LAS projesindeki mevcut API'ler, standart bir yanıt formatı kullanmaktadır:

```json
{
  "status": "success",
  "data": {
    // API'ye özgü yanıt verileri
  },
  "error": null
}
```

Ancak, bu format GPU kaynak kullanımı ve işlem süresi gibi performans metriklerini içermemektedir. Bu durum, özellikle CUDA entegrasyonu sonrasında, performans optimizasyonu ve sorun giderme çalışmalarını zorlaştırmaktadır.

### 2.2 İhtiyaçlar

1. **Performans Şeffaflığı:** Kullanıcılar ve geliştiriciler, API çağrılarının ne kadar sürdüğünü ve ne kadar GPU kaynağı kullandığını görebilmelidir.
2. **Performans Analizi:** Sistem yöneticileri, performans darboğazlarını tespit edebilmek için detaylı performans metriklerine erişebilmelidir.
3. **Kaynak Optimizasyonu:** GPU kaynak kullanımının izlenmesi, kaynakların daha verimli kullanılmasını sağlayacak optimizasyonları yönlendirebilmelidir.
4. **SLA İzleme:** Servis Seviyesi Anlaşmaları (SLA) için gerekli performans metriklerinin toplanması ve raporlanması gerekmektedir.
5. **Sorun Giderme:** Performans sorunlarının hızlı bir şekilde tespit edilmesi ve çözülmesi için detaylı meta verilere ihtiyaç vardır.

## 3. Mimari Tasarım

### 3.1 Genel Bakış

API Meta Veri Tasarımı, aşağıdaki ana bileşenlerden oluşmaktadır:

1. **Meta Veri Toplama Katmanı:** GPU kaynak kullanımı ve işlem süresi gibi performans metriklerini toplayan bileşen.
2. **Meta Veri İşleme Katmanı:** Toplanan ham verileri işleyerek anlamlı metriklere dönüştüren bileşen.
3. **Meta Veri Entegrasyon Katmanı:** İşlenmiş metrikleri API yanıtlarına entegre eden bileşen.
4. **Meta Veri Yapılandırma Katmanı:** Meta veri toplama ve sunma davranışını yapılandırmayı sağlayan bileşen.

![API Meta Veri Mimarisi](api_meta_veri_mimarisi.png)

### 3.2 Meta Veri Modeli

API yanıtlarına eklenecek meta veri modeli aşağıdaki gibi olacaktır:

```json
{
  "meta": {
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-05-31T14:30:15.123Z",
    "processing_time": {
      "total_ms": 120.45,
      "components": {
        "preprocessing_ms": 15.32,
        "inference_ms": 98.76,
        "postprocessing_ms": 6.37
      }
    },
    "gpu_resources": {
      "device_id": 0,
      "device_name": "NVIDIA A100",
      "memory_used_mb": 1024.5,
      "memory_total_mb": 40960,
      "utilization_percent": 35.8,
      "temperature_c": 65
    },
    "trace_id": "1-62be1272-1b71aa9db0b02a0b31fe29de",
    "version": "1.0"
  },
  "status": "success",
  "data": {
    // API'ye özgü yanıt verileri
  },
  "error": null
}
```

### 3.3 Meta Veri Toplama Mekanizması

Meta verilerin toplanması için iki yaklaşım kullanılacaktır:

#### 3.3.1 Dekoratör/Middleware Yaklaşımı

API endpoint'lerini saran bir dekoratör veya middleware, işlem başlangıcında ve bitişinde zaman damgalarını kaydedecek ve GPU kaynak kullanımını ölçecektir.

Python örneği:
```python
@app.route('/api/v1/predict', methods=['POST'])
@gpu_metrics_collector
def predict():
    # API işlemleri
    result = model.predict(request.json['data'])
    return jsonify(result)
```

#### 3.3.2 Ayrıntılı İzleme Noktaları

Daha detaylı performans analizi için, API işlem akışının kritik noktalarında izleme noktaları (tracing points) eklenecektir.

Python örneği:
```python
def process_request(data):
    with MetricsTracer.span("preprocessing"):
        preprocessed_data = preprocess(data)
    
    with MetricsTracer.span("inference"):
        with torch.cuda.stream(torch.cuda.Stream()):
            result = model(preprocessed_data)
    
    with MetricsTracer.span("postprocessing"):
        final_result = postprocess(result)
    
    return final_result
```

### 3.4 GPU Kaynak İzleme

GPU kaynak kullanımının izlenmesi için NVIDIA Management Library (NVML) ve PyTorch'un CUDA API'leri kullanılacaktır.

```python
def collect_gpu_metrics(device_id=0):
    metrics = {}
    
    # NVML ile GPU bilgilerini al
    handle = pynvml.nvmlDeviceGetHandleByIndex(device_id)
    metrics["device_name"] = pynvml.nvmlDeviceGetName(handle)
    memory_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
    metrics["memory_used_mb"] = memory_info.used / (1024 * 1024)
    metrics["memory_total_mb"] = memory_info.total / (1024 * 1024)
    metrics["utilization_percent"] = pynvml.nvmlDeviceGetUtilizationRates(handle).gpu
    metrics["temperature_c"] = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
    
    # PyTorch CUDA bilgilerini ekle
    if torch.cuda.is_available():
        metrics["pytorch_allocated_mb"] = torch.cuda.memory_allocated(device_id) / (1024 * 1024)
        metrics["pytorch_cached_mb"] = torch.cuda.memory_reserved(device_id) / (1024 * 1024)
    
    return metrics
```

### 3.5 Meta Veri Yapılandırma

Meta veri toplama ve sunma davranışı, yapılandırma dosyaları aracılığıyla özelleştirilebilecektir:

```yaml
api_metadata:
  enabled: true
  include_in_response: true
  detail_level: "full"  # "minimal", "standard", "full"
  sampling_rate: 1.0    # 1.0 = tüm istekler, 0.1 = %10 örnekleme
  
  components:
    processing_time:
      enabled: true
      include_components: true
    
    gpu_resources:
      enabled: true
      include_temperature: true
      include_utilization: true
    
    tracing:
      enabled: true
      propagate_headers: true
```

### 3.6 Entegrasyon Stratejisi

Meta verilerin API yanıtlarına entegrasyonu için iki seçenek sunulacaktır:

#### 3.6.1 Otomatik Entegrasyon

API framework'ünün yanıt işleme mekanizmasına entegre edilerek, tüm API yanıtlarına otomatik olarak meta verilerin eklenmesi sağlanacaktır.

```python
class MetadataMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        # Orijinal yanıtı yakalamak için özel bir send fonksiyonu
        async def send_with_metadata(message):
            if message["type"] == "http.response.start":
                # Yanıt başlangıcı, meta verileri hazırla
                pass
            
            if message["type"] == "http.response.body":
                # Yanıt gövdesi, meta verileri ekle
                body = message.get("body", b"")
                if body:
                    response_data = json.loads(body.decode())
                    
                    # Meta verileri topla
                    end_time = time.time()
                    processing_time = (end_time - start_time) * 1000  # ms cinsinden
                    gpu_metrics = collect_gpu_metrics()
                    
                    # Meta verileri yanıta ekle
                    response_data["meta"] = {
                        "request_id": request_id,
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "processing_time": {
                            "total_ms": processing_time
                        },
                        "gpu_resources": gpu_metrics,
                        "version": "1.0"
                    }
                    
                    # Güncellenmiş yanıtı gönder
                    message["body"] = json.dumps(response_data).encode()
            
            await send(message)
        
        await self.app(scope, receive, send_with_metadata)
```

#### 3.6.2 Manuel Entegrasyon

Geliştiricilere, ihtiyaç duydukları API'lerde manuel olarak meta verileri ekleyebilmeleri için yardımcı fonksiyonlar sağlanacaktır.

```python
def add_metadata_to_response(response_data):
    metadata = MetadataCollector.get_current_metadata()
    response_data["meta"] = metadata
    return response_data

@app.route('/api/v1/custom-endpoint', methods=['POST'])
def custom_endpoint():
    # API işlemleri
    result = process_request(request.json)
    
    # Meta verileri ekle
    result = add_metadata_to_response(result)
    
    return jsonify(result)
```

## 4. Uygulama Planı

### 4.1 Geliştirme Aşamaları

1. **Faz 1: Temel Altyapı (1-2 hafta)**
   - Meta veri modeli ve toplama mekanizmasının geliştirilmesi
   - GPU kaynak izleme modülünün geliştirilmesi
   - Yapılandırma altyapısının oluşturulması

2. **Faz 2: Entegrasyon (1-2 hafta)**
   - Middleware/dekoratör entegrasyonunun geliştirilmesi
   - Ayrıntılı izleme noktalarının eklenmesi
   - API yanıtlarına meta veri entegrasyonunun sağlanması

3. **Faz 3: Test ve Optimizasyon (1 hafta)**
   - Performans testlerinin yapılması
   - Meta veri toplama mekanizmasının optimizasyonu
   - Dokümantasyon ve örneklerin hazırlanması

### 4.2 Örnek Uygulama

API Meta Veri Tasarımı'nın nasıl uygulanacağını gösteren bir örnek uygulama geliştirilecektir. Bu uygulama, `ai-orchestrator` servisinin bir alt bileşeni olarak tasarlanacak ve diğer servislere entegrasyon için referans olarak kullanılacaktır.

### 4.3 Dokümantasyon

Geliştiriciler için aşağıdaki dokümanlar hazırlanacaktır:

- API Meta Veri Entegrasyon Kılavuzu
- GPU Kaynak İzleme Referansı
- Yapılandırma Seçenekleri Referansı
- Örnek Uygulama Dokümantasyonu

## 5. Test Stratejisi

### 5.1 Birim Testleri

Meta veri toplama ve işleme bileşenlerinin doğru çalıştığını doğrulamak için kapsamlı birim testleri yazılacaktır.

### 5.2 Entegrasyon Testleri

Meta veri sisteminin API framework'ü ile doğru entegre olduğunu doğrulamak için entegrasyon testleri yapılacaktır.

### 5.3 Performans Testleri

Meta veri toplama mekanizmasının kendisinin performans üzerindeki etkisini ölçmek için performans testleri yapılacaktır. Bu testler, meta veri toplama etkinken ve etkin değilken API yanıt sürelerini karşılaştıracaktır.

### 5.4 Doğruluk Testleri

Toplanan GPU kaynak kullanımı ve işlem süresi metriklerinin doğruluğunu doğrulamak için, bilinen iş yükleri ile karşılaştırmalı testler yapılacaktır.

## 6. Riskler ve Azaltma Stratejileri

| Risk | Etki | Olasılık | Azaltma Stratejisi |
|------|------|----------|---------------------|
| Meta veri toplama mekanizmasının performans üzerinde olumsuz etkisi | Yüksek | Orta | Örnekleme stratejisi, asenkron toplama, optimizasyon |
| GPU kaynak ölçümlerinin doğruluğu | Orta | Düşük | Çoklu kaynaklardan doğrulama, kalibrasyon testleri |
| Farklı GPU modelleri arasında uyumluluk sorunları | Orta | Orta | Geniş test matrisi, soyutlama katmanı |
| Meta veri boyutunun API yanıtlarını şişirmesi | Düşük | Yüksek | Yapılandırılabilir detay seviyesi, sıkıştırma |
| Güvenlik endişeleri (hassas sistem bilgilerinin ifşası) | Yüksek | Düşük | Yapılandırılabilir gizlilik filtreleri, rol tabanlı erişim |

## 7. Sonuç ve Öneriler

API Meta Veri Tasarımı, ALT_LAS projesinde CUDA entegrasyonu sonrasında performans izleme ve optimizasyon çalışmalarını destekleyecek kritik bir bileşendir. Bu tasarım, API yanıtlarında standart bir meta veri formatı sunarak, performans şeffaflığını artıracak ve kaynak optimizasyonunu kolaylaştıracaktır.

Önerilen yaklaşım, minimal performans etkisi ile maksimum bilgi sağlamayı hedeflemektedir. Yapılandırılabilir yapısı sayesinde, farklı ortamlarda ve kullanım senaryolarında esneklik sağlayacaktır.

Bu tasarımın başarılı bir şekilde uygulanması, ALT_LAS projesinin performans hedeflerine ulaşmasında önemli bir adım olacaktır.

---

**Ek Bilgi:** Bu doküman, KM-1.3 (API Meta Veri Tasarımı - GPU) görevi kapsamında hazırlanmış olup, taslak niteliğindedir. Kıdemli Backend Geliştirici (Ahmet Çelik) ile birlikte gözden geçirilecek ve nihai hale getirilecektir.
